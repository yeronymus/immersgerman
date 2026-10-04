import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to format seconds to WebVTT timecode HH:MM:SS.mmm
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (num, size) => ('000' + num).slice(-size);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const { data: video, error } = await supabase
      .table('videos')
      .select('title, subtitles')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    const subtitles = video.subtitles || [];
    
    // Generate WebVTT content
    let vttContent = 'WEBVTT\n\n';
    
    subtitles.forEach((chunk, index) => {
      const startSec = chunk.start || 0;
      const durationSec = chunk.duration || 0;
      const endSec = startSec + durationSec;

      const startTimeStr = formatTime(startSec);
      const endTimeStr = formatTime(endSec);

      vttContent += `${index + 1}\n`;
      vttContent += `${startTimeStr} --> ${endTimeStr}\n`;
      vttContent += `${chunk.text || ''}\n\n`;
    });

    const headers = new Headers();
    // Force browser to download file as .vtt
    const cleanTitle = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    headers.set('Content-Type', 'text/vtt; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="${cleanTitle}_subtitles.vtt"`);

    return new NextResponse(vttContent, {
      status: 200,
      headers
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}
