'use client';

import Link from 'next/link';

export default function Wiki() {
  return (
    <div className="flex-1 flex flex-col bg-[#090a0f] text-slate-100 min-h-screen font-sans">
      {/* Header */}
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
            <Link href="/wiki" className="text-white transition-colors">
              Wiki
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
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

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Table of Contents (3 cols) */}
        <aside className="md:col-span-3 h-fit md:sticky md:top-24 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3">
            Wiki Contents
          </h3>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <a href="#about" className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-all">
              1. Project Overview
            </a>
            <a href="#yomitan" className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-all">
              2. Setting Up Yomitan
            </a>
            <a href="#anki" className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-all">
              3. Anki Integration
            </a>
            <a href="#asbplayer" className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-all">
              4. Mining with asbplayer
            </a>
            <a href="#tips" className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-all">
              5. SRE & Local DevOps
            </a>
          </nav>
        </aside>

        {/* Content Area (9 cols) */}
        <article className="md:col-span-9 space-y-12 leading-relaxed text-slate-300">
          
          {/* Section 1 */}
          <section id="about" className="space-y-4 scroll-mt-24">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Immersion German Aggregator
            </h1>
            <p className="text-base text-slate-400">
              Welcome to the ImmersionTube Wiki. This platform operates as an SRE-managed language aggregator, helping intermediate German learners find suitable listening material and mine vocabulary with zero friction.
            </p>
            <div className="glass-panel p-5 rounded-2xl border border-card-border bg-slate-900/10">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">Our Philosophy</span>
              <p className="text-sm">
                We believe language learning is about massive comprehensible input. Instead of studying grammar charts, you should read and watch videos matching your current level. This guide details how to setup tools to save words instantly as you watch.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="yomitan" className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white border-b border-slate-900 pb-2">
              2. Setting Up Yomitan (Popup Dictionary)
            </h2>
            <p>
              Yomitan (the modern successor to Yomichan) is a browser extension that allows you to hover over foreign words while holding a hotkey (usually <strong>Shift</strong>) to see instant pop-up definitions, pitch accents, and grammatical forms.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Install the extension</h4>
                  <p className="text-sm text-slate-400">Download the Yomitan extension for Chrome, Firefox, or Edge from their official web stores.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Import German Dictionaries</h4>
                  <p className="text-sm text-slate-400">Yomitan starts completely blank. You must import German dictionaries (zipped format) in the Yomitan settings under <i>Dictionaries ➔ Import</i>.</p>
                  <p className="text-xs text-slate-500 mt-1">Recommended source: Search for &quot;Yomichan German dictionaries&quot; on Github to download Dict.cc or Wiktionary compilations.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="anki" className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white border-b border-slate-900 pb-2">
              3. Connecting Yomitan to Anki
            </h2>
            <p>
              By connecting Yomitan to Anki, you can create flashcards containing the word, definition, and the exact sentence context with a single mouse click.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Enable AnkiConnect</h4>
                  <p className="text-sm text-slate-400">Install the <strong>AnkiConnect</strong> plugin in your desktop Anki app (Tools ➔ Add-ons ➔ Get Add-ons ➔ enter code <code>2055492159</code>).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Configure Yomitan integration</h4>
                  <p className="text-sm text-slate-400">In Yomitan Settings, toggle <i>Anki integration ➔ Enable Anki integration</i>. It should detect your running Anki deck configurations automatically.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Set Up Card Templates</h4>
                  <p className="text-sm text-slate-400">Configure which fields Yomitan should populate. Common fields include:</p>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left mt-2 font-mono text-slate-300">
Word: {`{expression}`}
Reading: {`{reading}`}
Definition: {`{glossary}`}
Sentence: {`{sentence}`} (Captures the current subtitle phrase!)
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="asbplayer" className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white border-b border-slate-900 pb-2">
              4. Advanced Sentence Mining with asbplayer
            </h2>
            <p>
              <strong>asbplayer</strong> is a browser extension that hooks into video elements to record audio snippets and capture screenshots of the video, packing them directly into your Yomitan-created Anki cards.
            </p>
            <div className="space-y-3.5">
              <p className="text-sm text-slate-400">
                On our watch pages, we provide a <strong>Get Subtitles (VTT)</strong> download button.
              </p>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Download the .vtt subtitles</h4>
                  <p className="text-sm text-slate-400">When viewing a video on ImmersionTube, click the VTT button to fetch the subtitle file.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Load subtitles into asbplayer</h4>
                  <p className="text-sm text-slate-400">Open the video, click the asbplayer extension icon, and drag the downloaded VTT file onto the player to overlay synced captions.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Mine Cards with Hotkeys</h4>
                  <p className="text-sm text-slate-400">Use standard keyboard shortcuts during playback to capture the current sentence along with audio and screenshots:
                  <br />• <code>Ctrl + Windows + E</code> (or customizable shortcut) mines a card immediately.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="tips" className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white border-b border-slate-900 pb-2">
              5. SRE & Local DevOps Operations
            </h2>
            <p>
              For SREs hosting this stack locally, we provide a complete Docker Compose environment with monitoring:
            </p>
            <div className="glass-panel p-5 rounded-2xl border border-card-border bg-slate-900/10 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Local Health Observability</span>
              <p className="text-sm">
                The Python daemon running in docker compose exposes Prometheus metrics on port <code>8000/metrics</code>.
                You can inspect:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5 text-slate-400">
                <li><code>etl_queue_depth</code>: Size of parsed queue.</li>
                <li><code>ollama_request_duration_seconds</code>: LLM latency.</li>
                <li><code>etl_processed_videos_total</code>: Processing errors counter.</li>
              </ul>
              <p className="text-xs text-slate-500 pt-1.5">
                Grafana dashboard is ready at <code>https://localhost/grafana</code> routed via Traefik gateway.
              </p>
            </div>
          </section>

        </article>
      </main>
    </div>
  );
}
