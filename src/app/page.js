'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MOCK_VIDEOS } from '@/lib/mockData';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST'); // NEWEST, WPM_ASC, WPM_DESC
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const isDemoMode = !supabase;

  const fetchPublishedVideos = async () => {
    if (isDemoMode) {
      setVideos(MOCK_VIDEOS);
      // Extract unique grammar tags for filters
      const allTags = new Set();
      MOCK_VIDEOS.forEach(video => {
        if (video.grammar_tags) {
          video.grammar_tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .table('videos')
        .select('*, channels(title, thumbnail_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);

      // Extract unique grammar tags for filters
      const allTags = new Set();
      data.forEach(video => {
        if (video.grammar_tags) {
          video.grammar_tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedVideos();
  }, []);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Processing Filter & Sort logic client-side for fluid interactive states
  const filteredVideos = videos
    .filter(video => {
      // 1. Live Search Filter
      const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase()) || 
                            (video.channels?.title || '').toLowerCase().includes(search.toLowerCase());
      
      // 2. CEFR Level Filter
      const matchesLevel = selectedLevel === 'ALL' || video.cefr_level === selectedLevel;

      // 3. Grammar Tags Multi-select
      const matchesTags = selectedTags.length === 0 || 
                          selectedTags.every(tag => video.grammar_tags && video.grammar_tags.includes(tag));

      return matchesSearch && matchesLevel && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'WPM_ASC') {
        return a.wpm - b.wpm;
      }
      if (sortBy === 'WPM_DESC') {
        return b.wpm - a.wpm;
      }
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] text-slate-100 min-h-screen font-sans">
      {/* Premium Header matching mockup */}
      <header className="border-b border-slate-900 bg-[#090a0f] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-indigo-500 tracking-wide hover:opacity-90 transition-opacity">
            ImmersionTube
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-white hover:text-white transition-colors">
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

      {isDemoMode && (
        <div className="bg-indigo-950/20 border-b border-indigo-950/30 px-6 py-2 text-center text-[11px] font-medium text-indigo-400 flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span><strong>Demo Mode:</strong> Supabase connection not set. Showing local mockup content. Configure <code className="bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-white text-[10px]">.env.local</code> for database sync.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Sticky filters (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-20 h-fit space-y-6">
          
          {/* Search Card */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Search
            </h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search video or channel..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-600"
            />
          </div>

          {/* Sorting Card */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sort Order
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="NEWEST">Newest Videos</option>
              <option value="WPM_ASC">Speed: Slow to Fast</option>
              <option value="WPM_DESC">Speed: Fast to Slow</option>
            </select>
          </div>

          {/* Grammar Tags Card */}
          {availableTags.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Grammar Topics
              </h3>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Video Catalog Grid (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Videos</h2>
            
            {/* Level selection pills matching mockup */}
            <div className="flex flex-wrap gap-2 pb-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'A1', label: 'Very Easy' },
                { id: 'A2', label: 'Easy' },
                { id: 'B1', label: 'Medium' },
                { id: 'B2', label: 'Above Medium - Native' }
              ].map((lvl) => {
                const isActive = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 border-slate-700 text-white shadow-md'
                        : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-card-border p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <svg className="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-400">No Videos Found</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">Try adjustment of search filters or tags.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const lvl = video.cefr_level;
                
                // Map CEFR levels to readable difficulty strings matching mockup
                let readableLevel = 'Medium';
                let levelGlowClass = 'glow-indigo';
                let badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';

                if (lvl === 'A1') {
                  readableLevel = 'Very Easy';
                  levelGlowClass = 'glow-emerald';
                  badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                } else if (lvl === 'A2') {
                  readableLevel = 'Easy';
                  levelGlowClass = 'glow-emerald';
                  badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                } else if (lvl === 'B1') {
                  readableLevel = 'Medium';
                  levelGlowClass = 'glow-indigo';
                  badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
                } else {
                  readableLevel = 'Above Medium';
                  levelGlowClass = 'glow-fuchsia';
                  badgeColor = 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
                }
                
                return (
                  <Link 
                    href={`/videos/${video.id}`}
                    key={video.id}
                    className={`glass-panel rounded-2xl overflow-hidden border border-card-border flex flex-col group transition-all hover:-translate-y-1 duration-300 ${levelGlowClass}`}
                  >
                    <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded text-white font-mono">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          {video.channels?.title || 'YouTube Channel'}
                        </span>
                        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                          {video.title}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {readableLevel}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {video.wpm} WPM
                          </span>
                        </div>

                        {video.grammar_tags && video.grammar_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 border-t border-slate-900/60 pt-2.5">
                            {video.grammar_tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
