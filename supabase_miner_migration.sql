-- ============================================
-- TRUU Ambient Miner — Database Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Add new columns to the skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS confidence REAL DEFAULT 0;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- 2. Add INSERT + DELETE policies for skills table
CREATE POLICY "Users can insert own skills."
ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills."
ON skills FOR DELETE USING (auth.uid() = user_id);

-- 3. Create the activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mining', 'credential', 'sync', 'upgrade')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activities."
ON activities FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities."
ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Add INSERT policy for users table (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile.'
  ) THEN
    CREATE POLICY "Users can insert own profile."
    ON users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Done! The Ambient Miner is now ready to use.
