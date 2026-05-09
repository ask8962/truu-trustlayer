-- Run this in your Supabase SQL Editor to fix the missing SELECT policies

-- Ensure the skills table has a SELECT policy so you can see your mined skills
CREATE POLICY "Users can view own skills."
ON skills FOR SELECT USING (auth.uid() = user_id);

-- Ensure the activities table has a SELECT policy so you can see your mining runs
CREATE POLICY "Users can view own activities."
ON activities FOR SELECT USING (auth.uid() = user_id);

-- Also, just in case RLS was never enabled on skills:
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
