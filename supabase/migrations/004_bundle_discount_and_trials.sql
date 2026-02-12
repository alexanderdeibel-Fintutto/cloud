-- ============================================================================
-- #17: Ecosystem-Bundle-Rabatt (2+ Apps = 15% Rabatt)
-- #18: Trial-Perioden (7 Tage fuer alle Apps)
-- ============================================================================

-- Bundle discount configuration
CREATE TABLE IF NOT EXISTS public.bundle_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_apps INTEGER NOT NULL DEFAULT 2, -- Mindestanzahl Apps fuer Rabatt
  discount_percent NUMERIC NOT NULL DEFAULT 15, -- Rabattprozent
  stripe_coupon_id TEXT, -- Stripe Coupon fuer automatische Anwendung
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bundle_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundle discounts are viewable by everyone"
ON public.bundle_discounts FOR SELECT
USING (is_active = true);

-- Seed bundle discount tiers
INSERT INTO public.bundle_discounts (name, description, min_apps, discount_percent) VALUES
  ('Duo-Rabatt', '15% Rabatt bei 2 Fintutto-Apps', 2, 15),
  ('Trio-Rabatt', '20% Rabatt bei 3+ Fintutto-Apps', 3, 20),
  ('Ecosystem-Rabatt', '25% Rabatt bei 4+ Fintutto-Apps', 4, 25)
ON CONFLICT DO NOTHING;

-- User app subscriptions tracking (which apps does each user subscribe to)
CREATE TABLE IF NOT EXISTS public.user_app_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.user_app_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app subscriptions"
ON public.user_app_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_app_subs_user ON public.user_app_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_subs_active ON public.user_app_subscriptions(user_id, is_active) WHERE is_active = true;

-- Function to check bundle discount eligibility
CREATE OR REPLACE FUNCTION public.get_bundle_discount(p_user_id UUID)
RETURNS TABLE (
  active_apps INTEGER,
  discount_percent NUMERIC,
  discount_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_count AS (
    SELECT COUNT(DISTINCT app_id)::INTEGER AS cnt
    FROM public.user_app_subscriptions
    WHERE user_id = p_user_id
      AND is_active = true
      AND plan_id != 'free'
  )
  SELECT
    ac.cnt AS active_apps,
    COALESCE(bd.discount_percent, 0) AS discount_percent,
    COALESCE(bd.name, 'Kein Rabatt') AS discount_name
  FROM active_count ac
  LEFT JOIN public.bundle_discounts bd
    ON bd.min_apps <= ac.cnt
    AND bd.is_active = true
  ORDER BY bd.min_apps DESC
  LIMIT 1;
$$;

-- Trial configuration table
CREATE TABLE IF NOT EXISTS public.trial_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL UNIQUE,
  trial_days INTEGER NOT NULL DEFAULT 7,
  trial_plan_id TEXT NOT NULL DEFAULT 'basic', -- Welcher Plan waehrend Trial
  trial_features TEXT, -- Beschreibung der Trial-Features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trial_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trial config is viewable by everyone"
ON public.trial_config FOR SELECT
USING (is_active = true);

-- Seed trial configurations for all apps (7 Tage ueberall)
INSERT INTO public.trial_config (app_id, trial_days, trial_plan_id, trial_features) VALUES
  ('mieter-checker', 7, 'premium', 'Unbegrenzte Berechnungen, Speichern, PDF-Export'),
  ('fintutto-portal', 7, 'kombi_pro', '50 Credits, alle Tools, KI-Assistent'),
  ('vermieter-portal', 7, 'pro', '30 Credits, KI-Assistent, alle Rechner'),
  ('bescheidboxer', 7, 'kaempfer', 'Unbegrenzt Chat & Scans, 3 Schreiben, Forum-Vollzugang'),
  ('vermietify', 7, 'basic', '3 Immobilien, alle Dashboards, Dokumentenverwaltung'),
  ('hausmeisterpro', 7, 'starter', '10 Gebaeude, Kalender, Nachrichten'),
  ('ablesung', 7, 'basic', '10 Einheiten, OCR-Zaehlererfassung'),
  ('mieter-app', 7, 'basic', 'Mangelmeldungen, Dokumente, Zaehlerstaende'),
  ('financial-compass', 7, 'basic', 'Unbegrenzte Firmen & Buchungen, DATEV-Export')
ON CONFLICT (app_id) DO NOTHING;

-- User trials tracking
CREATE TABLE IF NOT EXISTS public.user_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  trial_plan_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  converted BOOLEAN DEFAULT false, -- Hat der User nach Trial ein Abo abgeschlossen?
  UNIQUE(user_id, app_id) -- Jeder User nur 1 Trial pro App
);

ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trials"
ON public.user_trials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can start trials"
ON public.user_trials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_trials_user ON public.user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_active ON public.user_trials(user_id, app_id, expires_at);

-- Function to start a trial for a user
CREATE OR REPLACE FUNCTION public.start_trial(p_user_id UUID, p_app_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  trial_plan TEXT,
  expires_at TIMESTAMPTZ,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_existing RECORD;
  v_expires TIMESTAMPTZ;
BEGIN
  -- Check if trial config exists for this app
  SELECT * INTO v_config FROM public.trial_config WHERE app_id = p_app_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, NOW(), 'Kein Trial fuer diese App verfuegbar'::TEXT;
    RETURN;
  END IF;

  -- Check if user already had a trial for this app
  SELECT * INTO v_existing FROM public.user_trials WHERE user_id = p_user_id AND app_id = p_app_id;
  IF FOUND THEN
    RETURN QUERY SELECT false, ''::TEXT, NOW(), 'Trial bereits genutzt'::TEXT;
    RETURN;
  END IF;

  -- Create trial
  v_expires := NOW() + (v_config.trial_days || ' days')::INTERVAL;
  INSERT INTO public.user_trials (user_id, app_id, trial_plan_id, expires_at)
  VALUES (p_user_id, p_app_id, v_config.trial_plan_id, v_expires);

  RETURN QUERY SELECT true, v_config.trial_plan_id, v_expires, ('Trial gestartet: ' || v_config.trial_days || ' Tage ' || v_config.trial_plan_id)::TEXT;
END;
$$;

-- Function to check if user has active trial
CREATE OR REPLACE FUNCTION public.check_trial(p_user_id UUID, p_app_id TEXT)
RETURNS TABLE (
  has_trial BOOLEAN,
  trial_plan TEXT,
  expires_at TIMESTAMPTZ,
  days_remaining INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (ut.expires_at > NOW()) AS has_trial,
    ut.trial_plan_id AS trial_plan,
    ut.expires_at,
    GREATEST(0, EXTRACT(DAY FROM ut.expires_at - NOW())::INTEGER) AS days_remaining
  FROM public.user_trials ut
  WHERE ut.user_id = p_user_id
    AND ut.app_id = p_app_id
  LIMIT 1;
$$;
