-- ============================================
-- TRUU Ambient Miner — Public Profile RLS
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Allow anyone (including unauthenticated users) to read users
DROP POLICY IF EXISTS "Anyone can view users." ON users;
CREATE POLICY "Anyone can view users."
ON users FOR SELECT USING (true);

-- 2. Allow anyone (including unauthenticated users) to read skills
DROP POLICY IF EXISTS "Anyone can view skills." ON skills;
CREATE POLICY "Anyone can view skills."
ON skills FOR SELECT USING (true);

-- 3. Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
