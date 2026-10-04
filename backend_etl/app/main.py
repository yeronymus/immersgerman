import asyncio
import logging
import os
import sys
import hvac
import feedparser
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI
import uvicorn
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Import ETL core functions and gauges
from etl import process_video, QUEUE_DEPTH

# Setup Structured JSON Logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler(sys.stdout)
formatter = jsonlogger.JsonFormatter('%(timestamp)s %(level)s %(logger)s %(message)s', json_class_helper=lambda: {"timestamp": ""})
logHandler.setFormatter(formatter)

logger = logging.getLogger("etl_daemon")
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Suppress verbose dependency logging
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)

load_dotenv()

# Initialize API Engine
app = FastAPI(title="Immersion German SRE API")

# Global clients/config to be populated from Vault
supabase_client: Client = None
ollama_url = ""
ollama_model = ""

def fetch_secrets_from_vault():
    """
    Connects to HashiCorp Vault to retrieve configuration values.
    """
    vault_addr = os.getenv("VAULT_ADDR", "http://vault:8200")
    vault_token = os.getenv("VAULT_TOKEN", "root")
    
    logger.info(f"Authenticating to HashiCorp Vault at {vault_addr}")
    try:
        client = hvac.Client(url=vault_addr, token=vault_token)
        if not client.is_authenticated():
            raise ConnectionError("Vault authentication failed")
            
        read_response = client.secrets.kv.v2.read_secret_version(
            path="immersion-german",
            mount_point="secret"
        )
        secrets = read_response["data"]["data"]
        
        logger.info("Configuration successfully fetched from Vault")
        return secrets
    except Exception as e:
        logger.critical(f"Failed to fetch secrets from Vault: {str(e)}")
        sys.exit(1)

@app.get("/metrics")
def metrics():
    """
    Endpoint for Prometheus scraping.
    """
    # Dynamically update queue depth metrics
    try:
        if supabase_client:
            parsed_res = supabase_client.table("videos").select("id", count="exact").eq("status", "parsed").execute()
            reviewed_res = supabase_client.table("videos").select("id", count="exact").eq("status", "ai_reviewed").execute()
            published_res = supabase_client.table("videos").select("id", count="exact").eq("status", "published").execute()
            
            QUEUE_DEPTH.labels(status="parsed").set(parsed_res.count if parsed_res.count is not None else 0)
            QUEUE_DEPTH.labels(status="ai_reviewed").set(reviewed_res.count if reviewed_res.count is not None else 0)
            QUEUE_DEPTH.labels(status="published").set(published_res.count if published_res.count is not None else 0)
    except Exception as e:
        logger.error(f"Error updating Prometheus queue metrics: {str(e)}")

    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/health")
def health():
    """
    SRE Health check endpoint.
    """
    # Check if Ollama is accessible
    ollama_up = 0
    try:
        res = requests.get(f"{ollama_url}/api/tags", timeout=5)
        if res.status_code == 200:
            ollama_up = 1
    except Exception:
        pass
        
    return {
        "status": "healthy",
        "supabase_connected": supabase_client is not None,
        "ollama_accessible": bool(ollama_up)
    }

async def scan_channel_rss_feeds():
    """
    Background job that loops through registered YouTube channels
    and indexes new videos to Supabase as 'parsed'.
    """
    while True:
        logger.info("Starting YouTube RSS feeds ingestion cycle")
        try:
            # Get all channels
            channels_res = supabase_client.table("channels").select("id, title").execute()
            channels = channels_res.data or []
            
            for channel in channels:
                channel_id = channel["id"]
                logger.info(f"Scanning RSS feed for channel: {channel['title']} ({channel_id})")
                feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries:
                    video_id = getattr(entry, "yt_videoid", None)
                    if not video_id:
                        continue
                        
                    # Check if video already exists in database
                    exists_res = supabase_client.table("videos").select("id").eq("id", video_id).execute()
                    if not exists_res.data:
                        logger.info(f"Discovered new video via RSS: {entry.title} ({video_id})")
                        # Insert as parsed (pending AI review)
                        supabase_client.table("videos").insert({
                            "id": video_id,
                            "channel_id": channel_id,
                            "title": entry.title,
                            "duration": 0, # To be updated by yt-dlp
                            "wpm": 0,
                            "cefr_level": "B1", # Placeholder
                            "subtitles": [], # Placeholder
                            "status": "parsed"
                        }).execute()
        except Exception as e:
            logger.error(f"Error in RSS ingestion cycle: {str(e)}")
            
        # Ingest RSS feeds every 12 hours
        await asyncio.sleep(12 * 60 * 60)

async def process_parsed_queue():
    """
    Background worker that continuously pulls 'parsed' videos,
    runs the Ollama classification pipeline, and saves them.
    """
    while True:
        try:
            # Query for the oldest parsed video in queue
            res = supabase_client.table("videos").select("id").eq("status", "parsed").order("created_at").limit(1).execute()
            queue = res.data or []
            
            if queue:
                video_id = queue[0]["id"]
                logger.info(f"ETL Queue worker picked up video: {video_id}")
                
                # Process the video synchronously in the executor loop
                loop = asyncio.get_running_loop()
                success = await loop.run_in_executor(
                    None, 
                    process_video, 
                    video_id, 
                    supabase_client, 
                    ollama_url, 
                    ollama_model
                )
                if success:
                    logger.info(f"Finished processing video {video_id}")
                else:
                    logger.warning(f"Skipped or failed processing video {video_id}")
            else:
                # Sleep briefly if queue is empty
                await asyncio.sleep(10)
        except Exception as e:
            logger.error(f"Error in queue processing worker: {str(e)}")
            await asyncio.sleep(10)

def start_background_tasks():
    """
    Spawns async background loop workers.
    """
    loop = asyncio.get_event_loop()
    loop.create_task(scan_channel_rss_feeds())
    loop.create_task(process_parsed_queue())

if __name__ == "__main__":
    # Ingest secrets from Vault
    secrets = fetch_secrets_from_vault()
    
    supabase_url = secrets["SUPABASE_URL"]
    supabase_key = secrets["SUPABASE_KEY"]
    ollama_model = secrets.get("OLLAMA_MODEL", "llama3")
    
    ollama_url = os.getenv("OLLAMA_HOST", "http://ollama:11434")
    
    # Establish DB client connection
    supabase_client = create_client(supabase_url, supabase_key)
    logger.info("Supabase client connection established")
    
    # Start tasks
    start_background_tasks()
    
    # Start Prometheus server & API endpoint
    logger.info("Starting FastAPI daemon web server on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_config=None)
