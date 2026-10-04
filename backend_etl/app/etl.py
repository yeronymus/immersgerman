import logging
import re
import time
import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import yt_dlp
from prometheus_client import Counter, Histogram, Gauge

# Prometheus Metrics definition
OLLAMA_LATENCY = Histogram(
    "ollama_request_duration_seconds",
    "Time spent invoking Ollama LLM API"
)
PROCESSED_VIDEOS = Counter(
    "etl_processed_videos_total",
    "Total number of videos processed by ETL",
    ["status", "error_type"]
)
QUEUE_DEPTH = Gauge(
    "etl_queue_depth",
    "Current queue depth of videos by status",
    ["status"]
)

logger = logging.getLogger("etl_daemon")

def fetch_metadata(video_id: str) -> dict:
    """
    Fetches video metadata (title, description, duration, uploader) using yt-dlp.
    Does not require a YouTube API key.
    """
    url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True
    }
    logger.info(f"Extracting metadata for video {video_id} using yt-dlp")
    start_time = time.time()
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            metadata = {
                "title": info.get("title", ""),
                "description": info.get("description", ""),
                "duration": int(info.get("duration", 0)),
                "channel_id": info.get("channel_id", ""),
                "channel_title": info.get("uploader", ""),
                "thumbnail_url": info.get("thumbnail", "")
            }
            logger.info(f"Metadata fetched in {time.time() - start_time:.2f}s")
            return metadata
    except Exception as e:
        logger.error(f"Error fetching metadata for {video_id}: {str(e)}")
        raise e

def fetch_transcript(video_id: str) -> list:
    """
    Fetches the German transcript (manual or auto-generated) for a YouTube video.
    Returns a list of dicts: [{"text": "...", "start": 0.0, "duration": 1.0}]
    """
    logger.info(f"Fetching transcript for video {video_id}")
    try:
        # First, try to fetch manual German transcript, fallback to auto-generated German
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        try:
            transcript = transcript_list.find_transcript(['de'])
        except NoTranscriptFound:
            # Fallback to auto-generated German if manual not found
            logger.info(f"Manual German transcript not found for {video_id}, seeking generated transcript")
            transcript = transcript_list.find_generated_transcript(['de'])
            
        return transcript.fetch()
    except (NoTranscriptFound, TranscriptsDisabled) as e:
        logger.warning(f"No German transcript available for {video_id}")
        raise e
    except Exception as e:
        logger.error(f"Error downloading transcript for {video_id}: {str(e)}")
        raise e

def calculate_wpm(transcript: list, duration_sec: int) -> int:
    """
    Calculates Words Per Minute (WPM) speed of a video.
    WPM = (Total Word Count) / (Duration in Minutes)
    """
    if not transcript or duration_sec <= 0:
        return 0
    
    total_words = 0
    for chunk in transcript:
        text = chunk.get("text", "")
        # Remove bracketed descriptions (e.g. "[Laughter]", "[Musik]")
        clean_text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
        words = clean_text.strip().split()
        total_words += len(words)
        
    duration_min = duration_sec / 60.0
    wpm = int(total_words / duration_min)
    logger.info(f"WPM calculated: {wpm} (Word count: {total_words}, Duration: {duration_min:.2f} mins)")
    return wpm

@OLLAMA_LATENCY.time()
def analyze_video_with_ai(title: str, description: str, transcript: list, ollama_url: str, model: str) -> dict:
    """
    Sends the title, description, and first 1500 words of transcript to local Ollama (Llama 3)
    to classify the CEFR level and capture grammar tags.
    """
    # Compile first 1500 words of transcript
    words_list = []
    for chunk in transcript:
        words_list.extend(chunk.get("text", "").split())
        if len(words_list) >= 1500:
            break
    transcript_snippet = " ".join(words_list[:1500])
    
    system_prompt = (
        "You are an expert German language tutor. Your task is to analyze the provided YouTube video metadata and German subtitles to determine its difficulty level, speech speed suitability, and grammar topics.\n"
        "You must return your output strictly in JSON format. Do not write any conversational text before or after the JSON block.\n\n"
        "Provide the response in this exact JSON structure:\n"
        "{\n"
        '  "cefr_level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",\n'
        '  "ai_explanation": "A detailed explanation in English of why this level was selected, referencing grammar structures and vocabulary complexity.",\n'
        '  "grammar_tags": ["list", "of", "detected", "grammar", "topics"]\n'
        "}\n\n"
        "Analyze the following metadata:\n"
        f"Title: {title}\n"
        f"Description: {description}\n\n"
        "Subtitles Transcript:\n"
        f"{transcript_snippet}"
    )

    logger.info(f"Invoking Ollama API at {ollama_url} with model {model}")
    try:
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={
                "model": model,
                "prompt": system_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1 # Low temperature for consistent JSON structure
                }
            },
            timeout=90
        )
        response.raise_for_status()
        raw_text = response.json().get("response", "").strip()
        
        # Extract JSON block using regex if model output includes extra explanation
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if not json_match:
            raise ValueError(f"No valid JSON block found in Ollama response: {raw_text}")
            
        import json
        result = json.loads(json_match.group(0))
        logger.info(f"Ollama classification successful: {result.get('cefr_level')}")
        return result
    except Exception as e:
        logger.error(f"Error during Ollama analysis: {str(e)}")
        raise e

def process_video(video_id: str, supabase_client, ollama_url: str, model: str) -> bool:
    """
    Orchestrates the metadata retrieval, transcript downloading, WPM calculation,
    Ollama AI review, level speed correction, and DB storage.
    """
    try:
        # 1. Fetch metadata via yt-dlp
        metadata = fetch_metadata(video_id)
        
        # Pre-Filter: Check duration (3 to 30 mins, i.e., 180s to 1800s)
        duration = metadata["duration"]
        if duration < 180 or duration > 1800:
            logger.warning(f"Video {video_id} skipped due to duration limit ({duration}s)")
            supabase_client.table("videos").delete().eq("id", video_id).execute()
            PROCESSED_VIDEOS.labels(status="skipped", error_type="duration_limit").inc()
            return False
            
        # 2. Download German Subtitles
        try:
            transcript = fetch_transcript(video_id)
        except Exception as e:
            logger.warning(f"Skipping video {video_id} due to missing German subtitles")
            supabase_client.table("videos").delete().eq("id", video_id).execute()
            PROCESSED_VIDEOS.labels(status="error", error_type="no_subtitles").inc()
            return False

        # 3. Calculate WPM
        wpm = calculate_wpm(transcript, duration)
        
        # 4. Ollama AI review
        ai_verdict = analyze_video_with_ai(
            title=metadata["title"],
            description=metadata["description"],
            transcript=transcript,
            ollama_url=ollama_url,
            model=model
        )
        
        cefr_level = ai_verdict.get("cefr_level", "B1")
        ai_explanation = ai_verdict.get("ai_explanation", "")
        grammar_tags = ai_verdict.get("grammar_tags", [])
        
        # 5. Speed level correction: A1/A2 with WPM > 140 -> raise to B1
        if cefr_level in ["A1", "A2"] and wpm > 140:
            logger.info(f"Elevating video {video_id} level from {cefr_level} to B1 due to high speed WPM ({wpm})")
            cefr_level = "B1"
            ai_explanation += f" (Note: Level forced to B1 due to speaking rate of {wpm} WPM)."

        # Check if the channel is trusted in DB
        channel_id = metadata["channel_id"]
        channel_check = supabase_client.table("channels").select("is_trusted, title").eq("id", channel_id).execute()
        
        is_trusted = False
        if channel_check.data:
            is_trusted = channel_check.data[0].get("is_trusted", False)
        else:
            # Insert the new channel automatically to track it
            supabase_client.table("channels").insert({
                "id": channel_id,
                "title": metadata["channel_title"],
                "thumbnail_url": metadata["thumbnail_url"],
                "is_trusted": False
            }).execute()
            
        status = "published" if is_trusted else "ai_reviewed"
        
        # 6. Save back to Supabase
        supabase_client.table("videos").update({
            "title": metadata["title"],
            "duration": duration,
            "wpm": wpm,
            "cefr_level": cefr_level,
            "ai_explanation": ai_explanation,
            "grammar_tags": grammar_tags,
            "subtitles": transcript,
            "status": status
        }).eq("id", video_id).execute()
        
        logger.info(f"Video {video_id} successfully saved as {status} (Level: {cefr_level}, WPM: {wpm})")
        PROCESSED_VIDEOS.labels(status="success", error_type="none").inc()
        return True
        
    except Exception as e:
        logger.error(f"Failed to process video {video_id}: {str(e)}")
        # Keep status as parsed, let the daemon try again or track failure
        PROCESSED_VIDEOS.labels(status="error", error_type="pipeline_failure").inc()
        return False
