'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState({ success: null, message: '' });

  // Custom states to override the AI verdict
  const [overrideLevel, setOverrideLevel] = useState('');
  const [overrideTags, setOverrideTags] = useState('');

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const fetchPendingVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
        if (data.videos && data.videos.length > 0) {
          selectVideo(data.videos[0]);
        } else {
          setSelectedVideo(null);
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectVideo = (video) => {
    setSelectedVideo(video);
    setOverrideLevel(video.cefr_level);
    setOverrideTags(video.grammar_tags ? video.grammar_tags.join(', ') : '');
  };

  const handleApprove = async () => {
    if (!selectedVideo) return;
    setActionLoading(true);
    try {
      const tagsArray = overrideTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVideo.id,
          cefr_level: overrideLevel,
          grammar_tags: tagsArray
        })
      });

      if (res.ok) {
        // Remove from list
        setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
        // Reset selection to first item
        const remaining = videos.filter(v => v.id !== selectedVideo.id);
        if (remaining.length > 0) {
          selectVideo(remaining[0]);
        } else {
          setSelectedVideo(null);
        }
      }
    } catch (err) {
      console.error('Error approving video:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;
    if (!confirm('Are you sure you want to delete/reject this video?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/videos?id=${selectedVideo.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
        const remaining = videos.filter(v => v.id !== selectedVideo.id);
        if (remaining.length > 0) {
          selectVideo(remaining[0]);
        } else {
          setSelectedVideo(null);
        }
      }
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setImportStatus({ success: null, message: 'Queueing...' });

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl })
      });

      const data = await res.json();

      if (!res.ok) {
        setImportStatus({ success: false, message: data.error || 'Failed to import' });
      } else {
        setImportStatus({ 
          success: true, 
          message: `Video ${data.videoId} queued successfully. Local daemon will analyze it shortly.` 
        });
        setImportUrl('');
      }
    } catch (err) {
      setImportStatus({ success: false, message: 'Connection error' });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-obsidian text-foreground min-h-screen">
      {/* Admin Navbar */}
      <header className="glass-panel sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-card-border">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Immersion German Admin
          </span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
            SRE Control Panel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            View Aggregator
          </a>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden max-w-8xl w-full mx-auto p-6 gap-6">
        
        {/* Left Side: Import form & Queue list (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
          {/* Import Form */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border relative overflow-hidden">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Ingest YouTube Video
            </h3>
            <form onSubmit={handleImport} className="flex gap-2">
              <input
                type="text"
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Paste URL or Video ID..."
                className="flex-1 min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-950/40 text-cyan-200 border border-cyan-500/20 rounded-xl text-sm font-medium hover:bg-cyan-950/60 shadow-lg cursor-pointer hover:shadow-cyan-500/5 transition-all"
              >
                Queue
              </button>
            </form>
            {importStatus.message && (
              <p className={`mt-2.5 text-xs ${importStatus.success === true ? 'text-emerald-400' : importStatus.success === false ? 'text-red-400' : 'text-slate-400'}`}>
                {importStatus.message}
              </p>
            )}
          </div>

          {/* Video Queue List */}
          <div className="glass-panel flex-1 rounded-2xl border border-card-border p-5 flex flex-col overflow-hidden min-h-[400px]">
            <div className="flex items-center justify-between mb-4 border-b border-card-border pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Pending Moderation Queue ({videos.length})
              </h3>
              <button 
                onClick={fetchPendingVideos}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <svg className="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-slate-400">Moderation Queue Empty</span>
                <span className="text-xs text-slate-600 mt-1">Automatic crawler runs every 12 hours. Paste a URL above to queue manually.</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => selectVideo(video)}
                    className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all cursor-pointer ${
                      selectedVideo?.id === video.id
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {video.channels?.title || 'Unknown Channel'}
                    </span>
                    <span className="text-sm font-medium text-white line-clamp-1">
                      {video.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        video.cefr_level.startsWith('A') ? 'bg-emerald-500/10 text-emerald-300' :
                        video.cefr_level.startsWith('B') ? 'bg-indigo-500/10 text-indigo-300' :
                        'bg-fuchsia-500/10 text-fuchsia-300'
                      }`}>
                        {video.cefr_level}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {video.wpm} WPM
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active workspace (8 cols) */}
        <div className="lg:col-span-8 h-full flex flex-col">
          {selectedVideo ? (
            <div className="glass-panel flex-1 rounded-2xl border border-card-border overflow-hidden flex flex-col h-full">
              
              {/* Responsive Video Frame */}
              <div className="aspect-video w-full bg-black border-b border-card-border relative">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                  title={selectedVideo.title}
                  allowFullScreen
                />
              </div>

              {/* Moderation Controls Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1.5">{selectedVideo.title}</h2>
                  <p className="text-sm text-slate-400">ID: <span className="font-mono text-xs">{selectedVideo.id}</span> | Duration: {Math.floor(selectedVideo.duration / 60)}m {selectedVideo.duration % 60}s | Speech Speed: <span className="font-mono font-semibold">{selectedVideo.wpm} WPM</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Diagnosis Details */}
                  <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                      Ollama AI Analysis Verdict
                    </h4>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Recommended Level:</span>
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                        selectedVideo.cefr_level.startsWith('A') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                        selectedVideo.cefr_level.startsWith('B') ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                        'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20'
                      }`}>
                        {selectedVideo.cefr_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">AI Logic / Justification:</span>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {selectedVideo.ai_explanation || 'No explanation provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Override Form */}
                  <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                      Override & Adjust
                    </h4>
                    
                    <div>
                      <label className="text-xs text-slate-500 block mb-1.5">CEFR Level:</label>
                      <select
                        value={overrideLevel}
                        onChange={(e) => setOverrideLevel(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      >
                        <option value="A1">A1 (Beginner)</option>
                        <option value="A2">A2 (Advanced Beginner)</option>
                        <option value="B1">B1 (Lower Intermediate)</option>
                        <option value="B2">B2 (Upper Intermediate)</option>
                        <option value="C1">C1 (Advanced)</option>
                        <option value="C2">C2 (Mastery)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1.5">Grammar Tags (comma separated):</label>
                      <textarea
                        rows={2}
                        value={overrideTags}
                        onChange={(e) => setOverrideTags(e.target.value)}
                        placeholder="e.g. Passiv, Konjunktiv II, Weil-Sätze"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Approve / Delete Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-card-border">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-cyan-950/30 text-cyan-300 border border-cyan-500/30 rounded-xl font-medium shadow-lg hover:shadow-cyan-500/5 hover:bg-cyan-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Publish Video
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="py-3 px-6 bg-red-950/20 text-red-200 border border-red-500/20 rounded-xl font-medium hover:bg-red-950/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Delete / Reject
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel flex-1 rounded-2xl border border-card-border flex flex-col items-center justify-center text-center p-12 text-slate-500 h-full">
              <svg className="w-16 h-16 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-400">No Video Selected</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-sm">Select a video from the pending list on the left to start inspecting, overriding, and publishing.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
