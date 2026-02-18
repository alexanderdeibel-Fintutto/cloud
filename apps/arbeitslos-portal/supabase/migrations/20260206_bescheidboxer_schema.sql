-- BescheidBoxer Database Schema
-- Fintutto UG (haftungsbeschraenkt) i.G.

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'schnupperer' CHECK (plan IN ('schnupperer', 'starter', 'kaempfer', 'vollschutz')),

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Credits & Limits
  credits_current INTEGER NOT NULL DEFAULT 0,
  chat_messages_used_today INTEGER NOT NULL DEFAULT 0,
  chat_messages_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  letters_generated_this_month INTEGER NOT NULL DEFAULT 0,
  scans_this_month INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

  -- Gamification
  points INTEGER NOT NULL DEFAULT 0,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Onboarding
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_data JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_users_auth_id ON amt_users(auth_id);
CREATE INDEX idx_amt_users_email ON amt_users(email);
CREATE INDEX idx_amt_users_stripe_customer ON amt_users(stripe_customer_id);

-- ============================================================
-- 2. CHAT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_chat_logs_user ON amt_chat_logs(user_id);
CREATE INDEX idx_amt_chat_logs_created ON amt_chat_logs(created_at DESC);

-- ============================================================
-- 3. BESCHEID SCANS
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Unbenannter Scan',
  bescheid_text TEXT,
  analysis JSONB,
  errors_found INTEGER NOT NULL DEFAULT 0,
  potential_recovery DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_scans_user ON amt_scans(user_id);

-- ============================================================
-- 4. GENERATED LETTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  form_data JSONB,
  status TEXT NOT NULL DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'fertig', 'versendet', 'per_post')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_letters_user ON amt_letters(user_id);

-- ============================================================
-- 5. WIDERSPRUCH TRACKER (server-side backup)
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_widersprueche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE CASCADE,
  typ TEXT NOT NULL CHECK (typ IN ('widerspruch', 'klage', 'ueberpruefung', 'eilantrag', 'beschwerde')),
  betreff TEXT NOT NULL,
  bescheid_datum DATE,
  eingereicht_am DATE NOT NULL,
  fristende DATE NOT NULL,
  aktenzeichen TEXT,
  status TEXT NOT NULL DEFAULT 'eingereicht' CHECK (status IN ('eingereicht', 'in_bearbeitung', 'beschieden', 'erledigt', 'abgelehnt')),
  notizen TEXT,
  ergebnis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_widersprueche_user ON amt_widersprueche(user_id);
CREATE INDEX idx_amt_widersprueche_fristende ON amt_widersprueche(fristende);

-- ============================================================
-- 6. FORUM POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'allgemein' CHECK (category IN ('allgemein', 'widerspruch', 'kdu', 'sanktion', 'klage', 'tipps', 'erfolge')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_forum_posts_category ON amt_forum_posts(category);
CREATE INDEX idx_amt_forum_posts_created ON amt_forum_posts(created_at DESC);

-- ============================================================
-- 7. FORUM REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES amt_forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES amt_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_helpful BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_forum_replies_post ON amt_forum_replies(post_id);

-- ============================================================
-- 8. CREDIT TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS amt_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES amt_users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription_credit', 'purchase', 'usage', 'refund', 'bonus')),
  description TEXT NOT NULL,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amt_credit_tx_user ON amt_credit_transactions(user_id);

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================
ALTER TABLE amt_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_widersprueche ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE amt_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users see own profile" ON amt_users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users update own profile" ON amt_users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users see own chats" ON amt_chat_logs
  FOR SELECT USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

CREATE POLICY "Users see own scans" ON amt_scans
  FOR ALL USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

CREATE POLICY "Users see own letters" ON amt_letters
  FOR ALL USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

CREATE POLICY "Users manage own widersprueche" ON amt_widersprueche
  FOR ALL USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

-- Forum: everyone can read, only authenticated users can post
CREATE POLICY "Anyone can read forum posts" ON amt_forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON amt_forum_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update own posts" ON amt_forum_posts
  FOR UPDATE USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

CREATE POLICY "Anyone can read forum replies" ON amt_forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can reply" ON amt_forum_replies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users see own credit transactions" ON amt_credit_transactions
  FOR SELECT USING (user_id IN (SELECT id FROM amt_users WHERE auth_id = auth.uid()));

-- ============================================================
-- 10. FUNCTIONS
-- ============================================================

-- Auto-reset daily chat counter
CREATE OR REPLACE FUNCTION reset_daily_chat_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.chat_messages_reset_at < NOW() - INTERVAL '1 day' THEN
    NEW.chat_messages_used_today := 0;
    NEW.chat_messages_reset_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_chat_count
  BEFORE UPDATE ON amt_users
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_chat_count();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at_users BEFORE UPDATE ON amt_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_updated_at_letters BEFORE UPDATE ON amt_letters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_updated_at_widersprueche BEFORE UPDATE ON amt_widersprueche FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_updated_at_forum_posts BEFORE UPDATE ON amt_forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment reply count on new reply
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE amt_forum_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_reply_count
  AFTER INSERT ON amt_forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION increment_reply_count();
