-- ============================================
-- TRUU Supabase Phase 1: Evidence Layer Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================
-- This migration updates the skills schema and scoring
-- to rely on explicitly cited evidence and categorical
-- strength tiers instead of fake AI confidence percentages.
-- ============================================

-- 1. Add new Evidence columns to skills table
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS verification_tier TEXT DEFAULT 'Moderate',
ADD COLUMN IF NOT EXISTS evidence_log JSONB DEFAULT '{}'::jsonb;

-- 2. Update the Trust Score formula to use verification_tier instead of confidence
CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  score REAL := 0;
  v_commits INT := 0;
  v_repos INT := 0;
  rec RECORD;
  tier_multiplier REAL;
BEGIN
  -- Fetch activity data from mined_profiles cache
  SELECT COALESCE(commits_analyzed, 0), COALESCE(repos_analyzed, 0)
  INTO v_commits, v_repos
  FROM mined_profiles 
  WHERE user_id = p_user_id;

  -- 1. Activity Base Score: Up to 150 points for commits, up to 100 points for repos
  score := LEAST(150, v_commits * 0.1) + LEAST(100, v_repos * 5);

  -- 2. Skills Score (Using Tier Multipliers)
  FOR rec IN SELECT proficiency_level, verification_tier FROM skills WHERE user_id = p_user_id
  LOOP
    -- Map verification_tier to a multiplier (replacing the old confidence %)
    IF rec.verification_tier = 'Strong' THEN 
      tier_multiplier := 1.0;
    ELSIF rec.verification_tier = 'Moderate' THEN 
      tier_multiplier := 0.7;
    ELSIF rec.verification_tier = 'Weak' THEN 
      tier_multiplier := 0.3;
    ELSE 
      tier_multiplier := 0.5; -- Default fallback
    END IF;

    -- Base points per proficiency: Master=40, Expert=30, Practitioner=20, Novice=10
    -- Multiplied by Tier: e.g. Strong Master = 40 * 1.0 * 2.0 = 80 points
    score := score + tier_multiplier * (
      CASE rec.proficiency_level
        WHEN 'Master' THEN 40
        WHEN 'Expert' THEN 30
        WHEN 'Practitioner' THEN 20
        ELSE 10
      END
    ) * 1.5; -- Global scale factor to ensure scores can reach 1000 for top users
  END LOOP;

  RETURN LEAST(1000, ROUND(score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop the hallucinated confidence column to enforce the new data model
ALTER TABLE skills DROP COLUMN IF EXISTS confidence;
