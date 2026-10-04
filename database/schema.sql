-- schema.sql for Immersion German Aggregator (English version)

-- Table for YouTube channels tracking
CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,                       -- YouTube Channel ID (e.g. UC...)
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    is_trusted BOOLEAN DEFAULT FALSE,          -- If true, videos bypass moderation queue and go directly to published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for parsed/analyzed videos catalog
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,                       -- YouTube Video ID (11 chars)
    channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,                 -- Duration in seconds
    wpm INTEGER NOT NULL,                      -- Calculated Words Per Minute
    cefr_level TEXT NOT NULL,                  -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    ai_explanation TEXT,                       -- AI justification in English
    grammar_tags TEXT[] DEFAULT '{}',          -- List of grammar points, e.g. ['Passiv', 'Relative Clauses']
    subtitles JSONB NOT NULL,                  -- Array of chunks: [{ "text": "...", "start": 1.2, "duration": 2.3 }]
    status TEXT NOT NULL DEFAULT 'parsed',     -- 'parsed' (new), 'ai_reviewed' (analyzed, pending approval), 'published' (visible to users)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast search and filter queries
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_cefr ON videos(cefr_level);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING gin(grammar_tags);
