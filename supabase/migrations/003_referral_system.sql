-- ============================================================================
-- #10-#15: Einheitliches Referral-System fuer Fintutto Ecosystem
-- Template basierend auf Financial Compass Implementierung
-- Belohnung: 1 Monat gratis fuer BEIDE Seiten (Werber + Geworbener)
-- ============================================================================

-- Referral tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  app_id TEXT NOT NULL DEFAULT 'ecosystem', -- welche App hat den Referral initiiert
  status TEXT NOT NULL DEFAULT 'pending', -- pending, clicked, registered, converted
  reward_type TEXT DEFAULT 'free_month', -- free_month, credits, discount
  reward_amount NUMERIC DEFAULT 0, -- Wert der Belohnung (z.B. 9.99 fuer 1 Monat)
  reward_applied_referrer BOOLEAN DEFAULT false,
  reward_applied_referred BOOLEAN DEFAULT false,
  stripe_coupon_id_referrer TEXT,
  stripe_coupon_id_referred TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  reward_applied_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_user_id);

-- Users can create referrals
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_user_id);

-- Users can update own referrals
CREATE POLICY "Users can update own referrals"
ON public.referrals
FOR UPDATE
USING (auth.uid() = referrer_user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_app_id ON public.referrals(app_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Add referral columns to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
    ALTER TABLE public.users ADD COLUMN referral_code TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
    ALTER TABLE public.users ADD COLUMN referred_by UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- Referral leaderboard function (top referrers by conversions)
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(
  limit_count INTEGER DEFAULT 10,
  filter_app_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  display_name TEXT,
  converted_count BIGINT,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(u.name, split_part(u.email, '@', 1)) AS display_name,
    COUNT(*) AS converted_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rank
  FROM public.referrals r
  JOIN public.users u ON u.id = r.referrer_user_id
  WHERE r.status = 'converted'
    AND (filter_app_id IS NULL OR r.app_id = filter_app_id)
  GROUP BY u.id, u.name, u.email
  HAVING COUNT(*) > 0
  ORDER BY converted_count DESC
  LIMIT limit_count;
$$;

-- Referral stats function for a specific user
CREATE OR REPLACE FUNCTION public.get_referral_stats(user_id UUID)
RETURNS TABLE (
  total_sent BIGINT,
  total_converted BIGINT,
  total_rewards BIGINT,
  savings_eur NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE status = 'converted') AS total_converted,
    COUNT(*) FILTER (WHERE reward_applied_referrer = true) AS total_rewards,
    COALESCE(SUM(reward_amount) FILTER (WHERE reward_applied_referrer = true), 0) AS savings_eur
  FROM public.referrals
  WHERE referrer_user_id = user_id;
$$;

-- Reward configuration table (per-app reward rules)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL UNIQUE,
  reward_type TEXT NOT NULL DEFAULT 'free_month', -- free_month, credits, discount_percent
  reward_value NUMERIC NOT NULL DEFAULT 0, -- Monatspreis fuer free_month, Anzahl fuer credits, % fuer discount
  reward_description TEXT NOT NULL DEFAULT '1 Monat gratis',
  referrer_gets TEXT NOT NULL DEFAULT '1 Monat gratis',
  referred_gets TEXT NOT NULL DEFAULT '1 Monat gratis',
  max_referrals_per_user INTEGER DEFAULT -1, -- -1 = unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral rewards are viewable by everyone"
ON public.referral_rewards FOR SELECT
USING (is_active = true);

-- Seed reward configurations for all apps
-- #15: 1 Monat gratis fuer BEIDE Seiten
INSERT INTO public.referral_rewards (app_id, reward_type, reward_value, reward_description, referrer_gets, referred_gets) VALUES
  ('mieter-checker', 'free_month', 3.99, 'Premium 1 Monat gratis', '1 Monat Premium gratis', '1 Monat Premium gratis'),
  ('fintutto-portal', 'credits', 30, '30 Bonus-Credits', '30 Bonus-Credits', '30 Bonus-Credits + 7 Tage Pro'),
  ('vermieter-portal', 'credits', 30, '30 Bonus-Credits', '30 Bonus-Credits', '30 Bonus-Credits + 7 Tage Pro'),
  ('bescheidboxer', 'credits', 30, '30 Bonus-Credits', '30 Bonus-Credits', '30 Bonus-Credits + 7 Tage Kaempfer'),
  ('vermietify', 'free_month', 9.99, 'Basic 1 Monat gratis', '1 Monat gratis', '1 Monat gratis'),
  ('hausmeisterpro', 'free_month', 9.99, 'Starter 1 Monat gratis', '1 Monat gratis', '1 Monat gratis'),
  ('ablesung', 'free_month', 9.99, 'Basic 1 Monat gratis', '1 Monat gratis', '1 Monat gratis'),
  ('mieter-app', 'free_month', 4.99, 'Basic 1 Monat gratis', '1 Monat gratis', '1 Monat gratis'),
  ('financial-compass', 'free_month', 9.99, 'Basic 1 Monat gratis', '1 Monat gratis', '1 Monat gratis')
ON CONFLICT (app_id) DO NOTHING;
