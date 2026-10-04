'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MOCK_VIDEOS } from '@/lib/mockData';

export default function WatchVideo() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activePhraseIndex, setActivePhraseIndex] = useState(-1);

  const playerRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchVideoData = async () => {
    if (!supabase) {
      const found = MOCK_VIDEOS.find(v => v.id === id);
      setVideo(found || null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .table('videos')
        .select('*, channels(title, thumbnail_url)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setVideo(data);
    } catch (err) {
      console.error('Error fetching video details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoData();
    // Load YouTube Iframe API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  // Initialize YT Player when iframe is ready and API loaded
  useEffect(() => {
    if (!video || !window.YT) return;

    let player;
    const initPlayer = () => {
      player = new window.YT.Player('yt-player-iframe', {
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            startTrackingTime();
          },
          onStateChange: (event) => {
            // If playing
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTrackingTime();
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }
        }
      });
    };

    if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [video]);

  const startTrackingTime = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        // Find matching subtitle index
        if (video && video.subtitles) {
          const index = video.subtitles.findIndex(
            chunk => time >= chunk.start && time <= (chunk.start + chunk.duration)
          );
          if (index !== -1) {
            setActivePhraseIndex(index);
            // Auto scroll active subtitle into view
            const activeElement = document.getElementById(`sub-${index}`);
            if (activeElement && transcriptContainerRef.current) {
              const container = transcriptContainerRef.current;
              const elemTop = activeElement.offsetTop;
              const elemHeight = activeElement.offsetHeight;
              const containerHeight = container.offsetHeight;
              const containerScrollTop = container.scrollTop;

              // If subtitle is out of scroll bounds, center it in the container
              if (elemTop < containerScrollTop || elemTop + elemHeight > containerScrollTop + containerHeight) {
                container.scrollTo({
                  top: elemTop - containerHeight / 2 + elemHeight / 2,
                  behavior: 'smooth'
                });
              }
            }
          }
        }
      }
    }, 250);
  };

  const handleSeek = (start) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(start, true);
      setCurrentTime(start);
      // Fallback start play if paused
      if (playerRef.current.playVideo) playerRef.current.playVideo();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-obsidian text-foreground min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-obsidian text-slate-500 min-h-screen">
        <svg className="w-16 h-16 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-400">Video Not Found</h3>
        <p className="text-sm text-slate-600 mt-1">This video ID does not exist in our aggregate index.</p>
        <Link href="/" className="mt-6 px-4 py-2 border border-slate-800 text-sm text-white rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-all">
          Back to Aggregator
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] text-slate-100 min-h-screen font-sans">
      {/* Premium Header matching Home */}
      <header className="border-b border-slate-900 bg-[#090a0f] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-indigo-500 tracking-wide hover:opacity-90 transition-opacity">
            ImmersionTube
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-600 cursor-not-allowed">
              Channels
            </span>
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Videos
            </Link>
            <Link href="/wiki" className="text-slate-400 hover:text-white transition-colors">
              Wiki
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          {/* EN/RU switcher placeholder */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-white cursor-pointer">EN</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">RU</span>
          </div>

          <Link 
            href={process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'} 
            className="text-xs text-slate-500 hover:text-indigo-400 font-semibold uppercase tracking-wider transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column: Player & Meta (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Video Frame */}
          <div className="aspect-video w-full bg-black rounded-2xl border border-card-border overflow-hidden relative shadow-2xl">
            <iframe
              id="yt-player-iframe"
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&rel=0`}
              title={video.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          {/* Metadata Card */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-card-border">
              <div>
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                  {video.channels?.title || 'YouTube Channel'}
                </span>
                <h1 className="text-xl font-bold text-white mt-1">{video.title}</h1>
              </div>
              
              {/* Level & Speed badging */}
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  video.cefr_level.startsWith('A') ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                  video.cefr_level.startsWith('B') ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' :
                  'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20'
                }`}>
                  {video.cefr_level}
                </span>
                <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {video.wpm} WPM
                </span>
              </div>
            </div>

            {/* Grammar Tags */}
            {video.grammar_tags && video.grammar_tags.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-2 font-medium">Grammar Highlights:</span>
                <div className="flex flex-wrap gap-1.5">
                  {video.grammar_tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {video.ai_explanation && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 mt-2">
                <span className="text-xs text-slate-500 block mb-1 font-semibold">Ollama Difficulty Profile:</span>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{video.ai_explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Subtitles & Yomitan/Anki Guide (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full max-h-[90vh]">
          
          {/* Subtitles Panel */}
          <div className="glass-panel flex-1 rounded-2xl border border-card-border p-5 flex flex-col overflow-hidden min-h-[300px]">
            <div className="flex items-center justify-between border-b border-card-border pb-3.5 mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Interactive Transcript
              </h3>
              
              {/* VTT Subtitle Download button for asbplayer */}
              <a
                href={`/api/videos/${video.id}/subtitles`}
                className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 rounded-lg hover:bg-cyan-950/40 transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-cyan-500/5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Get Subtitles (VTT)
              </a>
            </div>

            {/* Scrollable phrase area */}
            <div 
              ref={transcriptContainerRef}
              className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth"
            >
              {video.subtitles && video.subtitles.length > 0 ? (
                video.subtitles.map((chunk, index) => {
                  const isActive = index === activePhraseIndex;
                  return (
                    <div
                      key={index}
                      id={`sub-${index}`}
                      onClick={() => handleSeek(chunk.start)}
                      className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/25 border-cyan-500/40 shadow-md shadow-cyan-500/5 scale-[1.01]'
                          : 'bg-slate-900/20 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      {/* Timestamp trigger */}
                      <span className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors block mb-1">
                        {Math.floor(chunk.start / 60)}:{(Math.floor(chunk.start % 60)).toString().padStart(2, '0')}
                      </span>
                      
                      {/* Subtitle text container, fully compatible with Yomitan hover parsing */}
                      <p className={`text-base font-medium leading-relaxed font-sans select-text ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {chunk.text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-600 text-center p-6 italic">No transcript segments available.</p>
              )}
            </div>
          </div>

          {/* Yomitan + Anki Mining Setup Guide */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-card-border pb-2">
              🚀 Anki Card Mining Guide
            </h3>
            <ul className="text-xs text-slate-400 space-y-2.5 list-none pr-1">
              <li className="flex gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Install <strong>Yomitan</strong> and load a German-English or German-Russian dictionary (.zip).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Enable AnkiConnect in your desktop <strong>Anki</strong> app to allow extension synchronization.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Hover over transcript words in the panel above while holding <strong>Shift</strong> to pop up translation definitions. Click <strong>+</strong> to add directly to Anki.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>Install the <strong>asbplayer</strong> browser extension, download the VTT file above, drag it into the video, and press hotkeys to mine synchronized audio, timestamps, and screenshots into Anki instantly!</span>
              </li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
}
