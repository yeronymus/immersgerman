import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Regex to extract YouTube Video ID
function extractVideoId(urlOrId) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  
  // If it's already an 11-char ID
  if (urlOrId.length === 11) {
    return urlOrId;
  }
  
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL or Video ID is required' }, { status: 400 });
    }

    const videoId = extractVideoId(url.strip ? url.strip() : url.trim());
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL or Video ID format' }, { status: 400 });
    }

    // Check if video already exists in database
    const { data: existingVideo, error: checkError } = await supabaseAdmin
      .table('videos')
      .select('id, status')
      .eq('id', videoId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingVideo) {
      return NextResponse.json({ 
        error: `Video already exists with status: ${existingVideo.status}` 
      }, { status: 409 });
    }

    // Insert the new video with status 'parsed'
    // The local python daemon will pick this up to parse metadata, subtitles, and run Ollama
    const { error: insertError } = await supabaseAdmin
      .table('videos')
      .insert({
        id: videoId,
        title: 'Pending Ingestion...',
        duration: 0,
        wpm: 0,
        cefr_level: 'B1', // Temporary placeholder
        subtitles: [],
        status: 'parsed'
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, videoId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
