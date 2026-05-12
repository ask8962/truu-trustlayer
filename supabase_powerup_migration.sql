-- ============================================
-- TRUU Supabase Power-Up Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================
-- This migration adds:
--   1. Trust Score RPC function (calculate_trust_score)
--   2. Auto-mine trigger on new user signup (via pg_net)
--   3. pg_cron job to flag expired mined profiles daily
-- ============================================


-- ─── PRIORITY 3: Trust Score as a Database Function ──────────────────
-- This moves the scoring formula from JS into PostgreSQL so you can
-- recalculate any or all users with a single SQL call.

CREATE OR REPLACE FUNCTION calculate_trust_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  score REAL := 0;
  rec RECORD;
BEGIN
  FOR rec IN SELECT confidence, proficiency_level FROM skills WHERE user_id = p_user_id
  LOOP
    score := score + rec.confidence * (
      CASE rec.proficiency_level
        WHEN 'Master' THEN 4
        WHEN 'Expert' THEN 3
        WHEN 'Practitioner' THEN 2
        ELSE 1
      END
    ) * 0.3;
  END LOOP;

  RETURN LEAST(1000, ROUND(score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── PRIORITY 1: Auto-Mine Trigger on New User Signup ────────────────
-- Uses pg_net (Supabase's built-in HTTP extension) to call your
-- mining webhook when a new user row is created.
-- 
-- IMPORTANT: Replace 'YOUR_SITE_URL' with your actual deployed URL
-- and 'YOUR_WEBHOOK_SECRET' with a strong random secret you also
-- set in your .env as MINE_WEBHOOK_SECRET.

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION trigger_auto_mine()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://truu-trustlayer.vercel.app/api/mine/webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'user_id', NEW.id,
      'github_username', NEW.github_username,
      'secret', '2cfc5afd2718fe15899f8d4cd6b32d6da33fc4ccd38a6589c5e97063b8d47549'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only trigger on INSERT, not on UPDATE
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION trigger_auto_mine();


-- ─── PRIORITY 2: pg_cron → Flag Expired Profiles Daily ──────────────
-- Runs every day at 3:00 AM UTC. Sets trust_score to -1 on
-- mined_profiles that have expired, signaling they need a refresh.
-- Your API can check for trust_score = -1 to lazily re-mine.

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'flag-expired-profiles',
  '0 3 * * *',
  $$
    UPDATE mined_profiles
    SET trust_score = -1
    WHERE expires_at < now()
    AND trust_score != -1;
  $$
);


-- ─── BONUS: Bulk recalculate all existing Trust Scores ───────────────
-- Run this once after creating the function above to ensure all
-- existing users have scores calculated by the new DB function.
-- Uncomment the line below to run it:

-- UPDATE users SET trust_score = calculate_trust_score(id);
