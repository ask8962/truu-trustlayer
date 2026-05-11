-- ============================================
-- TRUU Ambient Miner Cache Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS mined_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trust_score INT NOT NULL,
  avg_confidence REAL NOT NULL,
  repos_analyzed INT NOT NULL,
  commits_analyzed INT NOT NULL,
  ai_summary TEXT,
  raw_evidence JSONB,
  mined_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (mined_at + INTERVAL '30 days') STORED
);

-- Enable RLS
ALTER TABLE mined_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all cached profiles
CREATE POLICY "Anyone can read cached profiles."
ON mined_profiles FOR SELECT USING (true);

-- Only owners can insert/update their own cache
CREATE POLICY "Users can insert own cached profile."
ON mined_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cached profile."
ON mined_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cached profile."
ON mined_profiles FOR DELETE USING (auth.uid() = user_id);
