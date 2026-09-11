-- ==============================================================================
-- Daily Games: Leaderboard Database Schema for Supabase
-- Part of the NDL Network (https://ndlong.site)
-- ==============================================================================

-- 1. Create Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    game_type TEXT NOT NULL DEFAULT 'emoji', -- 'emoji' | 'sudoku' | 'tetris'
    date_seed TEXT NOT NULL,                -- e.g. '2026-09-11'
    nickname TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    moves_count INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes for Speed Rankings
-- Speed leaderboard index (Emoji Match & Sudoku: lowest duration_ms first)
CREATE INDEX IF NOT EXISTS idx_leaderboard_speed 
ON public.leaderboard (game_type, date_seed, duration_ms ASC, created_at ASC);

-- Score leaderboard index (Tetris Sprint: highest score first, then duration_ms)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
ON public.leaderboard (game_type, date_seed, score DESC, duration_ms ASC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to read daily rankings
CREATE POLICY "Allow public read access for leaderboard"
ON public.leaderboard FOR SELECT
TO anon, authenticated
USING (true);

-- Allow serverless function / anonymous client to insert verified scores
CREATE POLICY "Allow public insert access for leaderboard"
ON public.leaderboard FOR INSERT
TO anon, authenticated
WITH CHECK (true);
