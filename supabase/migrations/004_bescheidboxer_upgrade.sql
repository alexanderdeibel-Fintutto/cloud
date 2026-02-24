-- =============================================
-- BescheidBoxer Upgrade - Database Schema
-- Migration 004: Extended profiles, BescheidScan,
-- KdU data, Credits system, Gamification
-- =============================================

-- =============================================
-- 1. New ENUM types
-- =============================================

-- Boxer level for gamification (anfaenger -> legende)
CREATE TYPE boxer_level AS ENUM (
  'anfaenger',
  'kaempfer',
  'profi',
  'experte',
  'legende'
);

-- Credit transaction types
CREATE TYPE credit_tx_type AS ENUM (
  'plan_monthly',
  'purchase',
  'usage_scan',
  'usage_analyse',
  'usage_chat',
  'usage_letter',
  'usage_postversand',
  'usage_privatchat',
  'bonus_referral',
  'bonus_achievement',
  'admin_adjustment',
  'refund'
);

-- BescheidScan urgency level
CREATE TYPE scan_urgency AS ENUM ('hoch', 'mittel', 'niedrig');

-- Update the existing amt_plan_type to include new BescheidBoxer tiers.
-- PostgreSQL does not support ALTER TYPE ... ADD VALUE inside a transaction
-- when wrapped in BEGIN/COMMIT, so we add each value individually.
-- These are idempotent: if the value already exists, the IF NOT EXISTS
-- clause prevents an error.
ALTER TYPE amt_plan_type ADD VALUE IF NOT EXISTS 'schnupperer';
ALTER TYPE amt_plan_type ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE amt_plan_type ADD VALUE IF NOT EXISTS 'kaempfer';
ALTER TYPE amt_plan_type ADD VALUE IF NOT EXISTS 'vollschutz';


-- =============================================
-- 2. ALTER amt_users - add BescheidBoxer columns
-- =============================================

ALTER TABLE amt_users
  ADD COLUMN IF NOT EXISTS credits_aktuell INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scans_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scans_last_reset DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS boxer_level boxer_level DEFAULT 'anfaenger',
  ADD COLUMN IF NOT EXISTS boxer_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;


-- =============================================
-- 3. ft_bguser_profiles - Extended user profiles
--    BG = Bedarfsgemeinschaft (household unit)
-- =============================================

CREATE TABLE IF NOT EXISTS ft_bguser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal
  vorname TEXT,
  nachname TEXT,
  geburtsdatum DATE,

  -- Address / Location
  plz TEXT,
  ort TEXT,
  bundesland TEXT,
  strasse TEXT,

  -- Jobcenter info
  jobcenter_name TEXT,
  bg_nummer TEXT,              -- Bedarfsgemeinschafts-Nummer
  kundennummer TEXT,           -- Kundennummer beim Jobcenter

  -- Bedarfsgemeinschaft (BG) composition
  bg_groesse INTEGER DEFAULT 1,
  ist_alleinerziehend BOOLEAN DEFAULT false,
  partner_in_bg BOOLEAN DEFAULT false,

  -- Children in BG: JSONB array of { alter: number, in_bg: boolean }
  kinder JSONB DEFAULT '[]'::JSONB,
  anzahl_kinder INTEGER DEFAULT 0,

  -- Housing
  wohnungsgroesse_qm NUMERIC(6,2),
  kaltmiete NUMERIC(8,2),
  nebenkosten NUMERIC(8,2),
  heizkosten NUMERIC(8,2),
  warmmiete_gesamt NUMERIC(8,2),

  -- Income
  einkommen_brutto NUMERIC(10,2) DEFAULT 0,
  einkommen_netto NUMERIC(10,2) DEFAULT 0,
  einkommen_typ TEXT,          -- 'keine', 'minijob', 'teilzeit', 'vollzeit', 'selbststaendig'
  kindergeld NUMERIC(8,2) DEFAULT 0,
  unterhalt NUMERIC(8,2) DEFAULT 0,
  sonstige_einnahmen NUMERIC(8,2) DEFAULT 0,

  -- Health / special needs
  schwerbehindert BOOLEAN DEFAULT false,
  gdb INTEGER,                 -- Grad der Behinderung (0-100)
  merkzeichen TEXT[],          -- e.g. {'G', 'aG', 'H', 'Bl'}
  schwanger BOOLEAN DEFAULT false,
  chronisch_krank BOOLEAN DEFAULT false,
  kostenaufwaendige_ernaehrung BOOLEAN DEFAULT false,

  -- Status flags
  profil_vollstaendig BOOLEAN DEFAULT false,
  onboarding_abgeschlossen BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ft_bguser_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"
  ON ft_bguser_profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON ft_bguser_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON ft_bguser_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ft_bguser_profiles_user ON ft_bguser_profiles(user_id);
CREATE INDEX idx_ft_bguser_profiles_plz ON ft_bguser_profiles(plz);
CREATE INDEX idx_ft_bguser_profiles_jobcenter ON ft_bguser_profiles(jobcenter_name);


-- =============================================
-- 4. ft_bescheid_scans - BescheidScan results
-- =============================================

CREATE TABLE IF NOT EXISTS ft_bescheid_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File info
  dateiname TEXT NOT NULL,
  dateityp TEXT,               -- 'pdf', 'jpg', 'png'
  dateigroesse INTEGER,        -- bytes
  storage_path TEXT,           -- Supabase Storage path (if stored)

  -- Bescheid metadata
  bescheid_typ TEXT,           -- 'bewilligungsbescheid', 'aenderungsbescheid',
                               -- 'aufhebungsbescheid', 'sanktionsbescheid', 'sonstig'
  bescheid_datum DATE,
  bewilligungszeitraum_von DATE,
  bewilligungszeitraum_bis DATE,
  jobcenter_name TEXT,
  aktenzeichen TEXT,

  -- Scan results
  scan_status TEXT DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  urgency scan_urgency,

  -- Errors/findings as JSONB array:
  -- [{ type: 'fehler'|'warnung'|'ok', title, description, betrag?, paragraph?, templateId? }]
  fehler JSONB DEFAULT '[]'::JSONB,
  anzahl_fehler INTEGER DEFAULT 0,
  anzahl_warnungen INTEGER DEFAULT 0,
  anzahl_ok INTEGER DEFAULT 0,

  -- Financial summary
  fehlbetrag_monatlich NUMERIC(10,2) DEFAULT 0,
  fehlbetrag_6_monate NUMERIC(10,2) DEFAULT 0,
  fehlbetrag_12_monate NUMERIC(10,2) DEFAULT 0,

  -- Deadline tracking
  widerspruchsfrist DATE,
  frist_abgelaufen BOOLEAN DEFAULT false,

  -- OCR / AI metadata
  ocr_text TEXT,               -- extracted text from document
  ai_model TEXT,               -- which AI model was used
  ai_confidence NUMERIC(5,4), -- 0.0000 to 1.0000
  processing_time_ms INTEGER,

  -- Credits used for this scan
  credits_verwendet INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ft_bescheid_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own scans"
  ON ft_bescheid_scans FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans"
  ON ft_bescheid_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans"
  ON ft_bescheid_scans FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ft_bescheid_scans_user ON ft_bescheid_scans(user_id);
CREATE INDEX idx_ft_bescheid_scans_status ON ft_bescheid_scans(scan_status);
CREATE INDEX idx_ft_bescheid_scans_created ON ft_bescheid_scans(created_at DESC);
CREATE INDEX idx_ft_bescheid_scans_frist ON ft_bescheid_scans(widerspruchsfrist)
  WHERE widerspruchsfrist IS NOT NULL AND frist_abgelaufen = false;


-- =============================================
-- 5. ft_kdu_tabellen - Regional KdU data
--    (Kosten der Unterkunft limits by region)
-- =============================================

CREATE TABLE IF NOT EXISTS ft_kdu_tabellen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Region identification
  plz_ranges TEXT[] NOT NULL,  -- array of PLZ strings covered
  stadt TEXT NOT NULL,
  landkreis TEXT,
  bundesland TEXT,
  jobcenter TEXT NOT NULL,

  -- Kaltmiete limits by BG size (EUR)
  kaltmiete_1p NUMERIC(8,2) NOT NULL,
  kaltmiete_2p NUMERIC(8,2) NOT NULL,
  kaltmiete_3p NUMERIC(8,2) NOT NULL,
  kaltmiete_4p NUMERIC(8,2) NOT NULL,
  kaltmiete_5p NUMERIC(8,2) NOT NULL,

  -- Heating cost guideline per sqm (EUR)
  heizkosten_pro_qm NUMERIC(6,2),

  -- Max sqm by BG size
  qm_grenze_1p NUMERIC(6,1),
  qm_grenze_2p NUMERIC(6,1),
  qm_grenze_3p NUMERIC(6,1),
  qm_grenze_4p NUMERIC(6,1),
  qm_grenze_5p NUMERIC(6,1),

  -- Validity
  gueltig_ab DATE NOT NULL,
  gueltig_bis DATE,            -- NULL = currently valid

  -- Quality markers
  schluessiges_konzept BOOLEAN DEFAULT true,
  anmerkung TEXT,
  quelle TEXT,                 -- source document / URL

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed: KdU data is public reference data
-- (read by all, written only by admins via service role)

-- Indexes
CREATE INDEX idx_ft_kdu_tabellen_stadt ON ft_kdu_tabellen(stadt);
CREATE INDEX idx_ft_kdu_tabellen_plz ON ft_kdu_tabellen USING GIN (plz_ranges);
CREATE INDEX idx_ft_kdu_tabellen_gueltig ON ft_kdu_tabellen(gueltig_ab DESC);


-- =============================================
-- 6. ft_credits - Credit balance tracking
-- =============================================

CREATE TABLE IF NOT EXISTS ft_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Balance
  credits_aktuell INTEGER NOT NULL DEFAULT 0,
  credits_gesamt_erhalten INTEGER NOT NULL DEFAULT 0,  -- lifetime received
  credits_gesamt_verbraucht INTEGER NOT NULL DEFAULT 0, -- lifetime spent

  -- Period tracking
  period_start DATE DEFAULT CURRENT_DATE,
  period_end DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')::DATE,
  credits_diesen_monat_erhalten INTEGER DEFAULT 0,

  -- Usage counters (current period)
  scans_dieser_monat INTEGER DEFAULT 0,
  briefe_dieser_monat INTEGER DEFAULT 0,
  chat_nachrichten_heute INTEGER DEFAULT 0,
  chat_nachrichten_last_reset DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ft_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own credits"
  ON ft_credits FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits"
  ON ft_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_ft_credits_user ON ft_credits(user_id);


-- =============================================
-- 7. ft_credit_transactions - Transaction log
-- =============================================

CREATE TABLE IF NOT EXISTS ft_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  tx_type credit_tx_type NOT NULL,
  credits_amount INTEGER NOT NULL,   -- positive = added, negative = spent
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,

  -- Context
  beschreibung TEXT NOT NULL,        -- human-readable description
  referenz_typ TEXT,                 -- 'scan', 'letter', 'chat', 'package', 'plan', 'badge'
  referenz_id UUID,                  -- FK to related entity

  -- Payment (for purchases)
  betrag_eur NUMERIC(10,2),
  stripe_payment_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ft_credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions"
  ON ft_credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ft_credit_tx_user ON ft_credit_transactions(user_id);
CREATE INDEX idx_ft_credit_tx_created ON ft_credit_transactions(created_at DESC);
CREATE INDEX idx_ft_credit_tx_type ON ft_credit_transactions(tx_type);
CREATE INDEX idx_ft_credit_tx_referenz ON ft_credit_transactions(referenz_typ, referenz_id)
  WHERE referenz_id IS NOT NULL;


-- =============================================
-- 8. ft_gamification - Points, badges, levels
-- =============================================

CREATE TABLE IF NOT EXISTS ft_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Points & Level
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level boxer_level NOT NULL DEFAULT 'anfaenger',

  -- Earned badges as JSONB array:
  -- [{ id: string, earned_at: ISO timestamp }]
  badges JSONB DEFAULT '[]'::JSONB,

  -- Lifetime stats
  total_scans INTEGER DEFAULT 0,
  total_letters INTEGER DEFAULT 0,
  total_forum_posts INTEGER DEFAULT 0,
  total_forum_replies INTEGER DEFAULT 0,
  total_chat_questions INTEGER DEFAULT 0,
  total_upvotes_received INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  geld_zurueckgeholt NUMERIC(10,2) DEFAULT 0,  -- estimated money recovered

  -- Streaks
  login_streak_current INTEGER DEFAULT 0,
  login_streak_best INTEGER DEFAULT 0,
  last_login_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ft_gamification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own gamification"
  ON ft_gamification FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own gamification"
  ON ft_gamification FOR UPDATE
  USING (auth.uid() = user_id);
-- Public leaderboard: allow reading points and level of all users
CREATE POLICY "Anyone can read leaderboard data"
  ON ft_gamification FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_ft_gamification_user ON ft_gamification(user_id);
CREATE INDEX idx_ft_gamification_points ON ft_gamification(total_points DESC);
CREATE INDEX idx_ft_gamification_level ON ft_gamification(current_level);


-- =============================================
-- 9. Functions: Credit operations
-- =============================================

-- Spend credits atomically (returns true if sufficient balance)
CREATE OR REPLACE FUNCTION ft_spend_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tx_type credit_tx_type,
  p_beschreibung TEXT,
  p_referenz_typ TEXT DEFAULT NULL,
  p_referenz_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT credits_aktuell INTO v_current
  FROM ft_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current IS NULL OR v_current < p_amount THEN
    RETURN false;
  END IF;

  -- Deduct credits
  UPDATE ft_credits
  SET credits_aktuell = credits_aktuell - p_amount,
      credits_gesamt_verbraucht = credits_gesamt_verbraucht + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update the denormalized column on amt_users
  UPDATE amt_users
  SET credits_aktuell = credits_aktuell - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO ft_credit_transactions (
    user_id, tx_type, credits_amount, credits_before, credits_after,
    beschreibung, referenz_typ, referenz_id
  ) VALUES (
    p_user_id, p_tx_type, -p_amount, v_current, v_current - p_amount,
    p_beschreibung, p_referenz_typ, p_referenz_id
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Add credits atomically
CREATE OR REPLACE FUNCTION ft_add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tx_type credit_tx_type,
  p_beschreibung TEXT,
  p_betrag_eur NUMERIC DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current INTEGER;
  v_new INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT credits_aktuell INTO v_current
  FROM ft_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If no credits row exists, create one
  IF v_current IS NULL THEN
    INSERT INTO ft_credits (user_id, credits_aktuell, credits_gesamt_erhalten)
    VALUES (p_user_id, 0, 0);
    v_current := 0;
  END IF;

  v_new := v_current + p_amount;

  -- Add credits
  UPDATE ft_credits
  SET credits_aktuell = v_new,
      credits_gesamt_erhalten = credits_gesamt_erhalten + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update the denormalized column on amt_users
  UPDATE amt_users
  SET credits_aktuell = v_new,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO ft_credit_transactions (
    user_id, tx_type, credits_amount, credits_before, credits_after,
    beschreibung, betrag_eur, stripe_payment_id
  ) VALUES (
    p_user_id, p_tx_type, p_amount, v_current, v_new,
    p_beschreibung, p_betrag_eur, p_stripe_payment_id
  );

  RETURN v_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 10. Functions: Gamification operations
-- =============================================

-- Award points and recalculate level
CREATE OR REPLACE FUNCTION ft_award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(new_total INTEGER, new_level boxer_level, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_total INTEGER;
  v_new_total INTEGER;
  v_old_level boxer_level;
  v_new_level boxer_level;
BEGIN
  -- Get current state (or create row)
  SELECT g.total_points, g.current_level
  INTO v_old_total, v_old_level
  FROM ft_gamification g
  WHERE g.user_id = p_user_id
  FOR UPDATE;

  IF v_old_total IS NULL THEN
    INSERT INTO ft_gamification (user_id, total_points, current_level)
    VALUES (p_user_id, 0, 'anfaenger');
    v_old_total := 0;
    v_old_level := 'anfaenger';
  END IF;

  v_new_total := v_old_total + p_points;

  -- Determine new level based on point thresholds
  v_new_level := CASE
    WHEN v_new_total >= 5000 THEN 'legende'::boxer_level
    WHEN v_new_total >= 1500 THEN 'experte'::boxer_level
    WHEN v_new_total >= 500  THEN 'profi'::boxer_level
    WHEN v_new_total >= 100  THEN 'kaempfer'::boxer_level
    ELSE 'anfaenger'::boxer_level
  END;

  -- Update gamification
  UPDATE ft_gamification
  SET total_points = v_new_total,
      current_level = v_new_level,
      updated_at = NOW()
  WHERE ft_gamification.user_id = p_user_id;

  -- Sync to amt_users
  UPDATE amt_users
  SET boxer_points = v_new_total,
      boxer_level = v_new_level,
      updated_at = NOW()
  WHERE id = p_user_id;

  new_total := v_new_total;
  new_level := v_new_level;
  leveled_up := (v_new_level != v_old_level);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Award a badge (idempotent - won't duplicate)
CREATE OR REPLACE FUNCTION ft_award_badge(
  p_user_id UUID,
  p_badge_id TEXT,
  p_bonus_points INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  v_badges JSONB;
  v_already_has BOOLEAN;
BEGIN
  SELECT badges INTO v_badges
  FROM ft_gamification
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_badges IS NULL THEN
    INSERT INTO ft_gamification (user_id, total_points, current_level, badges)
    VALUES (p_user_id, 0, 'anfaenger', '[]'::JSONB);
    v_badges := '[]'::JSONB;
  END IF;

  -- Check if badge already earned
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_badges) elem
    WHERE elem->>'id' = p_badge_id
  ) INTO v_already_has;

  IF v_already_has THEN
    RETURN false;
  END IF;

  -- Add badge
  UPDATE ft_gamification
  SET badges = badges || jsonb_build_object(
    'id', p_badge_id,
    'earned_at', NOW()::TEXT
  )::JSONB,
  updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Award bonus points if any
  IF p_bonus_points > 0 THEN
    PERFORM ft_award_points(p_user_id, p_bonus_points, 'Badge: ' || p_badge_id);
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 11. Functions: Monthly/daily resets
-- =============================================

-- Reset daily chat counters
CREATE OR REPLACE FUNCTION ft_reset_daily_counters()
RETURNS void AS $$
BEGIN
  UPDATE ft_credits
  SET chat_nachrichten_heute = 0,
      chat_nachrichten_last_reset = CURRENT_DATE,
      updated_at = NOW()
  WHERE chat_nachrichten_last_reset < CURRENT_DATE;

  -- Also reset the legacy column
  UPDATE amt_users
  SET chat_questions_used_today = 0,
      chat_questions_last_reset = CURRENT_DATE,
      updated_at = NOW()
  WHERE chat_questions_last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Reset monthly counters and distribute plan credits
CREATE OR REPLACE FUNCTION ft_reset_monthly_counters()
RETURNS void AS $$
BEGIN
  -- Reset scan and letter counters
  UPDATE ft_credits
  SET scans_dieser_monat = 0,
      briefe_dieser_monat = 0,
      credits_diesen_monat_erhalten = 0,
      period_start = CURRENT_DATE,
      period_end = (CURRENT_DATE + INTERVAL '30 days')::DATE,
      updated_at = NOW()
  WHERE period_end < CURRENT_DATE;

  UPDATE amt_users
  SET scans_this_month = 0,
      letters_generated_this_month = 0,
      letters_last_reset = CURRENT_DATE,
      updated_at = NOW()
  WHERE letters_last_reset < (CURRENT_DATE - INTERVAL '30 days')::DATE;

  -- Distribute monthly plan credits
  -- Starter: 10, Kaempfer: 25, Vollschutz: 50
  UPDATE ft_credits fc
  SET credits_aktuell = fc.credits_aktuell + CASE au.plan
      WHEN 'starter'    THEN 10
      WHEN 'kaempfer'   THEN 25
      WHEN 'vollschutz' THEN 50
      ELSE 0
    END,
    credits_gesamt_erhalten = fc.credits_gesamt_erhalten + CASE au.plan
      WHEN 'starter'    THEN 10
      WHEN 'kaempfer'   THEN 25
      WHEN 'vollschutz' THEN 50
      ELSE 0
    END,
    credits_diesen_monat_erhalten = CASE au.plan
      WHEN 'starter'    THEN 10
      WHEN 'kaempfer'   THEN 25
      WHEN 'vollschutz' THEN 50
      ELSE 0
    END,
    updated_at = NOW()
  FROM amt_users au
  WHERE fc.user_id = au.id
    AND fc.period_end < CURRENT_DATE
    AND au.plan IN ('starter', 'kaempfer', 'vollschutz');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 12. Function: Record a BescheidScan
-- =============================================

CREATE OR REPLACE FUNCTION ft_record_bescheid_scan(
  p_user_id UUID,
  p_dateiname TEXT,
  p_bescheid_typ TEXT DEFAULT NULL,
  p_credits_kosten INTEGER DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_scan_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Spend credits
  v_success := ft_spend_credits(
    p_user_id, p_credits_kosten, 'usage_scan',
    'BescheidScan: ' || p_dateiname
  );

  IF NOT v_success THEN
    RAISE EXCEPTION 'Nicht genuegend Credits fuer BescheidScan';
  END IF;

  -- Create scan record
  INSERT INTO ft_bescheid_scans (user_id, dateiname, bescheid_typ, credits_verwendet)
  VALUES (p_user_id, p_dateiname, p_bescheid_typ, p_credits_kosten)
  RETURNING id INTO v_scan_id;

  -- Increment counters
  UPDATE ft_credits
  SET scans_dieser_monat = scans_dieser_monat + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  UPDATE amt_users
  SET scans_this_month = scans_this_month + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Award gamification points (15 per scan)
  PERFORM ft_award_points(p_user_id, 15, 'BescheidScan');

  -- Check for scanner badges
  PERFORM ft_check_scan_badges(p_user_id);

  RETURN v_scan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 13. Function: Check & award scan-related badges
-- =============================================

CREATE OR REPLACE FUNCTION ft_check_scan_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_scans INTEGER;
BEGIN
  SELECT total_scans INTO v_total_scans
  FROM ft_gamification
  WHERE user_id = p_user_id;

  IF v_total_scans IS NULL THEN
    v_total_scans := 0;
  END IF;

  -- Update total scans counter
  UPDATE ft_gamification
  SET total_scans = v_total_scans + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  v_total_scans := v_total_scans + 1;

  -- First scan badge (10 points)
  IF v_total_scans = 1 THEN
    PERFORM ft_award_badge(p_user_id, 'erster_scan', 10);
  END IF;

  -- Scanner pro badge (50 points)
  IF v_total_scans = 5 THEN
    PERFORM ft_award_badge(p_user_id, 'scanner_pro', 50);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 14. Function: Check KdU angemessenheit
-- =============================================

CREATE OR REPLACE FUNCTION ft_check_kdu(
  p_plz TEXT,
  p_bg_groesse INTEGER,
  p_kaltmiete NUMERIC
)
RETURNS TABLE(
  angemessen BOOLEAN,
  grenze NUMERIC,
  differenz NUMERIC,
  stadt TEXT,
  schluessiges_konzept BOOLEAN,
  anmerkung TEXT
) AS $$
DECLARE
  v_kdu ft_kdu_tabellen%ROWTYPE;
  v_grenze NUMERIC;
  v_bg INTEGER;
BEGIN
  v_bg := LEAST(p_bg_groesse, 5);

  SELECT * INTO v_kdu
  FROM ft_kdu_tabellen k
  WHERE p_plz = ANY(k.plz_ranges)
    AND (k.gueltig_bis IS NULL OR k.gueltig_bis >= CURRENT_DATE)
  ORDER BY k.gueltig_ab DESC
  LIMIT 1;

  IF v_kdu IS NULL THEN
    RETURN;
  END IF;

  v_grenze := CASE v_bg
    WHEN 1 THEN v_kdu.kaltmiete_1p
    WHEN 2 THEN v_kdu.kaltmiete_2p
    WHEN 3 THEN v_kdu.kaltmiete_3p
    WHEN 4 THEN v_kdu.kaltmiete_4p
    WHEN 5 THEN v_kdu.kaltmiete_5p
  END;

  angemessen := (p_kaltmiete <= v_grenze);
  grenze := v_grenze;
  differenz := GREATEST(0, p_kaltmiete - v_grenze);
  stadt := v_kdu.stadt;
  schluessiges_konzept := v_kdu.schluessiges_konzept;
  anmerkung := v_kdu.anmerkung;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;


-- =============================================
-- 15. Trigger: auto-update updated_at
-- =============================================

CREATE OR REPLACE FUNCTION ft_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ft_bguser_profiles_updated
  BEFORE UPDATE ON ft_bguser_profiles
  FOR EACH ROW EXECUTE FUNCTION ft_set_updated_at();

CREATE TRIGGER trg_ft_bescheid_scans_updated
  BEFORE UPDATE ON ft_bescheid_scans
  FOR EACH ROW EXECUTE FUNCTION ft_set_updated_at();

CREATE TRIGGER trg_ft_credits_updated
  BEFORE UPDATE ON ft_credits
  FOR EACH ROW EXECUTE FUNCTION ft_set_updated_at();

CREATE TRIGGER trg_ft_gamification_updated
  BEFORE UPDATE ON ft_gamification
  FOR EACH ROW EXECUTE FUNCTION ft_set_updated_at();

CREATE TRIGGER trg_ft_kdu_tabellen_updated
  BEFORE UPDATE ON ft_kdu_tabellen
  FOR EACH ROW EXECUTE FUNCTION ft_set_updated_at();


-- =============================================
-- 16. Trigger: auto-create credits & gamification
--     rows when a new amt_user is inserted
-- =============================================

CREATE OR REPLACE FUNCTION ft_on_amt_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Create credits row
  INSERT INTO ft_credits (user_id, credits_aktuell)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create gamification row
  INSERT INTO ft_gamification (user_id, total_points, current_level)
  VALUES (NEW.id, 0, 'anfaenger')
  ON CONFLICT (user_id) DO NOTHING;

  -- Award first-login points
  PERFORM ft_award_points(NEW.id, 10, 'Willkommen bei BescheidBoxer!');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_amt_user_after_insert
  AFTER INSERT ON amt_users
  FOR EACH ROW EXECUTE FUNCTION ft_on_amt_user_created();


-- =============================================
-- Done. Summary of objects created:
--
-- Types:  boxer_level, credit_tx_type, scan_urgency
-- Enums:  amt_plan_type extended with schnupperer/starter/kaempfer/vollschutz
--
-- Tables: ft_bguser_profiles     (extended user profiles)
--         ft_bescheid_scans      (scan results storage)
--         ft_kdu_tabellen        (regional KdU reference data)
--         ft_credits             (credit balances)
--         ft_credit_transactions (credit transaction log)
--         ft_gamification        (points, badges, levels)
--
-- Altered: amt_users + credits_aktuell, scans_this_month,
--          scans_last_reset, boxer_level, boxer_points,
--          referral_code, referred_by
--
-- Functions: ft_spend_credits, ft_add_credits,
--            ft_award_points, ft_award_badge,
--            ft_reset_daily_counters, ft_reset_monthly_counters,
--            ft_record_bescheid_scan, ft_check_scan_badges,
--            ft_check_kdu, ft_set_updated_at,
--            ft_on_amt_user_created
-- =============================================
