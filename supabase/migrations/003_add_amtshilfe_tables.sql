-- =============================================
-- Amtshilfe24 - Database Schema
-- Arbeitslosenhilfe Portal
-- =============================================

-- Plan type for Amtshilfe users
CREATE TYPE amt_plan_type AS ENUM ('free', 'plus', 'premium');

-- =============================================
-- Users table for Amtshilfe
-- =============================================
CREATE TABLE IF NOT EXISTS amt_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  plan amt_plan_type DEFAULT 'free',
  chat_questions_used_today INTEGER DEFAULT 0,
  chat_questions_last_reset DATE DEFAULT CURRENT_DATE,
  letters_generated_this_month INTEGER DEFAULT 0,
  letters_last_reset DATE DEFAULT CURRENT_DATE,
  free_letters_remaining INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON amt_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON amt_users FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- Chat sessions - KI-Rechtsberater
-- =============================================
CREATE TABLE IF NOT EXISTS amt_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  category TEXT, -- sgb2, sgb3, sgb12, kdu, sgb10
  messages JSONB DEFAULT '[]'::JSONB,
  suggested_templates TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own chats" ON amt_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON amt_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON amt_chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_amt_chat_sessions_user ON amt_chat_sessions(user_id);
CREATE INDEX idx_amt_chat_sessions_created ON amt_chat_sessions(created_at DESC);

-- =============================================
-- Generated letters
-- =============================================
CREATE TABLE IF NOT EXISTS amt_generated_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  category TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  generated_content TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, finalized, sent
  payment_status TEXT DEFAULT 'none', -- none, paid, free
  payment_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_generated_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own letters" ON amt_generated_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own letters" ON amt_generated_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON amt_generated_letters FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_amt_letters_user ON amt_generated_letters(user_id);
CREATE INDEX idx_amt_letters_template ON amt_generated_letters(template_id);

-- =============================================
-- Forum posts
-- =============================================
CREATE TABLE IF NOT EXISTS amt_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- sgb2, sgb3, sgb12, kdu, sgb10
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON amt_forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON amt_forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON amt_forum_posts FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_amt_forum_posts_category ON amt_forum_posts(category);
CREATE INDEX idx_amt_forum_posts_created ON amt_forum_posts(created_at DESC);
CREATE INDEX idx_amt_forum_posts_pinned ON amt_forum_posts(is_pinned DESC, created_at DESC);

-- =============================================
-- Forum replies
-- =============================================
CREATE TABLE IF NOT EXISTS amt_forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES amt_forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read replies" ON amt_forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can insert own replies" ON amt_forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON amt_forum_replies FOR UPDATE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_amt_forum_replies_post ON amt_forum_replies(post_id);
CREATE INDEX idx_amt_forum_replies_created ON amt_forum_replies(created_at);

-- =============================================
-- Forum likes (prevent double-liking)
-- =============================================
CREATE TABLE IF NOT EXISTS amt_forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES amt_forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES amt_forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_reply_like UNIQUE (user_id, reply_id)
);

-- RLS
ALTER TABLE amt_forum_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON amt_forum_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON amt_forum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON amt_forum_likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- User deadlines / reminders
-- =============================================
CREATE TABLE IF NOT EXISTS amt_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  related_letter_id UUID REFERENCES amt_generated_letters(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE amt_deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own deadlines" ON amt_deadlines FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_amt_deadlines_user ON amt_deadlines(user_id);
CREATE INDEX idx_amt_deadlines_date ON amt_deadlines(deadline_date);

-- =============================================
-- AI advice cache (same pattern as mieter-checker)
-- =============================================
CREATE TABLE IF NOT EXISTS amt_ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL,
  category TEXT,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index
CREATE INDEX idx_amt_ai_cache_hash ON amt_ai_cache(query_hash);
CREATE INDEX idx_amt_ai_cache_expires ON amt_ai_cache(expires_at);

-- =============================================
-- Function: Reset daily question counter
-- =============================================
CREATE OR REPLACE FUNCTION amt_reset_daily_questions()
RETURNS void AS $$
BEGIN
  UPDATE amt_users
  SET chat_questions_used_today = 0,
      chat_questions_last_reset = CURRENT_DATE
  WHERE chat_questions_last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Reset monthly letter counter
-- =============================================
CREATE OR REPLACE FUNCTION amt_reset_monthly_letters()
RETURNS void AS $$
BEGIN
  UPDATE amt_users
  SET letters_generated_this_month = 0,
      letters_last_reset = CURRENT_DATE,
      free_letters_remaining = CASE
        WHEN plan = 'premium' THEN 3
        ELSE 0
      END
  WHERE EXTRACT(MONTH FROM letters_last_reset) < EXTRACT(MONTH FROM CURRENT_DATE)
     OR EXTRACT(YEAR FROM letters_last_reset) < EXTRACT(YEAR FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
