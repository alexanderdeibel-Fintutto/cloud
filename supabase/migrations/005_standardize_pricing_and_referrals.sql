-- ============================================================================
-- #19: Standardisierung Pricing & Referral-System ueber alle 9 Apps
--
-- Fixes:
--   1. Referral-Rewards: 1 Monat gratis fuer BEIDE Seiten (ueberall)
--   2. Bundle-Rabatte auf 20/25/30/35% angehoben
--   3. App-Registry mit kanonischen Preisen (Single Source of Truth)
--   4. Cross-App Referral Support
-- ============================================================================

-- ============================================================================
-- TEIL 1: App-Registry (kanonische Preise aller Apps)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL UNIQUE,
  app_name TEXT NOT NULL,
  app_url TEXT,
  currency TEXT NOT NULL DEFAULT 'eur',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App registry viewable by everyone"
ON public.app_registry FOR SELECT
USING (is_active = true);

-- Alle 9 Apps mit kanonischen Daten
INSERT INTO public.app_registry (app_id, app_name, app_url) VALUES
  ('mieter-checker', 'Fintutto Checker', 'https://fintutto.com'),
  ('fintutto-portal', 'Fintutto Portal', 'https://fintutto-portal.vercel.app'),
  ('vermieter-portal', 'Vermieter-Portal', 'https://vermieter-portal.vercel.app'),
  ('bescheidboxer', 'BescheidBoxer', 'https://bescheidboxer.vercel.app'),
  ('financial-compass', 'Financial Compass', 'https://fintutto-your-financial-compass.vercel.app'),
  ('mieter-app', 'Mieter App', 'https://mieter-app.vercel.app'),
  ('hausmeisterpro', 'HausmeisterPro', 'https://hausmeisterpro.vercel.app'),
  ('vermietify', 'Vermieter-Freude', 'https://vermieter-freude.vercel.app'),
  ('ablesung', 'Ablesung', 'https://ablesung.vercel.app')
ON CONFLICT (app_id) DO NOTHING;

-- ============================================================================
-- TEIL 2: Kanonische Preistabelle (alle Tiers aller Apps)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL REFERENCES public.app_registry(app_id),
  tier_id TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  monthly_price_eur NUMERIC NOT NULL DEFAULT 0,
  yearly_price_eur NUMERIC NOT NULL DEFAULT 0,
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, tier_id)
);

ALTER TABLE public.app_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App pricing viewable by everyone"
ON public.app_pricing FOR SELECT
USING (is_active = true);

-- Alle Preise - Single Source of Truth
-- Jahresrabatt: einheitlich 20% (monatlich * 12 * 0.8)
INSERT INTO public.app_pricing (app_id, tier_id, tier_name, monthly_price_eur, yearly_price_eur, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly) VALUES

  -- Fintutto Checker
  ('mieter-checker', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('mieter-checker', 'basic', 'Basis', 0.99, 9.50, NULL, 'price_1Sxc4652lqSgjCzeEKVlLxwP', 'price_1Sxc4652lqSgjCzeoHFU2Ykn'),
  ('mieter-checker', 'premium', 'Premium', 3.99, 38.30, NULL, 'price_1Sxc4752lqSgjCzeRlMLZeP5', 'price_1Sxc4752lqSgjCzeC971KXL0'),

  -- Fintutto Portal
  ('fintutto-portal', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('fintutto-portal', 'mieter_basic', 'Mieter', 4.99, 47.90, 'prod_Tyl740qtOKFOS1', 'price_1T0nam52lqSgjCzeLc4nwtU9', 'price_1T0nan52lqSgjCzeKAqlJZPj'),
  ('fintutto-portal', 'vermieter_basic', 'Vermieter', 9.99, 95.90, 'prod_Tyl7EGSeoyiJEa', 'price_1T0nao52lqSgjCzetPewfsjU', 'price_1T0nao52lqSgjCzeoV4eJgnf'),
  ('fintutto-portal', 'kombi_pro', 'Kombi Pro', 14.99, 143.90, 'prod_Tyl7mCJsrNhSmu', 'price_1T0nap52lqSgjCzeCHEbHAQY', 'price_1T0nap52lqSgjCzeWpSag5oS'),
  ('fintutto-portal', 'unlimited', 'Unlimited', 24.99, 239.90, 'prod_Tyl7CBK9vGm7VX', 'price_1T0naq52lqSgjCzeQssqWiUG', 'price_1T0nar52lqSgjCzeby3QG2EB'),

  -- Vermieter-Portal
  ('vermieter-portal', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('vermieter-portal', 'starter', 'Starter', 2.99, 28.70, 'prod_Tyl7cbifQLDROW', 'price_1T0nas52lqSgjCzexI8LixAK', 'price_1T0nas52lqSgjCzeHgR61lIm'),
  ('vermieter-portal', 'pro', 'Pro', 7.99, 76.70, 'prod_Tyl7jm5nUl3jAM', 'price_1T0nat52lqSgjCzeAgmYPn2r', 'price_1T0nat52lqSgjCzeb2W8OvFu'),
  ('vermieter-portal', 'unlimited', 'Unlimited', 14.99, 143.90, 'prod_Tyl7Sn9YTCILXf', 'price_1T0nau52lqSgjCzeX6l8caP5', 'price_1T0nau52lqSgjCzeGwN7tWuo'),

  -- BescheidBoxer
  ('bescheidboxer', 'free', 'Schnupperer', 0, 0, NULL, NULL, NULL),
  ('bescheidboxer', 'starter', 'Starter', 2.99, 28.70, 'prod_Tyl7aOOdqasfx2', 'price_1T0nav52lqSgjCzezfeyYiwy', 'price_1T0naw52lqSgjCzeZU9otXyg'),
  ('bescheidboxer', 'kaempfer', 'Kaempfer', 4.99, 47.90, 'prod_Tyl7oK51M83p1a', 'price_1T0nax52lqSgjCzeELDbmrUQ', 'price_1T0nax52lqSgjCzecXnrSRr0'),
  ('bescheidboxer', 'vollschutz', 'Vollschutz', 7.99, 76.70, 'prod_Tyl7tKhfT3tb3T', 'price_1T0nay52lqSgjCzexKgGvJkS', 'price_1T0nay52lqSgjCzeHLGLpsuu'),

  -- Financial Compass (Monthly-Preise bereits vorhanden im Repo)
  ('financial-compass', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('financial-compass', 'basic', 'Basic', 9.99, 95.90, 'prod_TxmipPdak8JwmT', NULL, 'price_1T0nb052lqSgjCzeR8a7rmP1'),
  ('financial-compass', 'pro', 'Pro', 19.99, 191.90, 'prod_Txmjs0RZOVqFzS', NULL, 'price_1T0nb152lqSgjCze1ae7RGdJ'),

  -- Mieter App (SOLL-Preise in EUR, nicht USD!)
  ('mieter-app', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('mieter-app', 'basic', 'Basic', 4.99, 47.90, 'prod_Tyl7nP8RIZYiKg', 'price_1T0nb152lqSgjCzePj9k35h4', 'price_1T0nb252lqSgjCzeKthcl46U'),
  ('mieter-app', 'pro', 'Pro', 9.99, 95.90, 'prod_Tyl7B6nLP9waBf', 'price_1T0nb352lqSgjCzennX9j9dE', 'price_1T0nb352lqSgjCzejpncsetw'),

  -- HausmeisterPro (Starter + Pro existieren im Repo, Enterprise neu)
  ('hausmeisterpro', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('hausmeisterpro', 'starter', 'Starter', 9.99, 95.90, NULL, NULL, NULL),
  ('hausmeisterpro', 'pro', 'Pro', 24.99, 239.90, NULL, NULL, NULL),
  ('hausmeisterpro', 'enterprise', 'Enterprise', 49.99, 479.90, 'prod_Tyl7SUTeiUkUYa', 'price_1T0nb452lqSgjCzeKfvkna7n', 'price_1T0nb552lqSgjCzelBBrkq6c'),

  -- Vermietify (Vermieter-Freude)
  ('vermietify', 'free', 'Starter', 0, 0, NULL, NULL, NULL),
  ('vermietify', 'basic', 'Basic', 9.99, 95.90, NULL, NULL, NULL),
  ('vermietify', 'pro', 'Pro', 24.99, 239.90, NULL, NULL, NULL),
  ('vermietify', 'enterprise', 'Enterprise', 49.99, 479.90, NULL, NULL, NULL),

  -- Ablesung
  ('ablesung', 'free', 'Kostenlos', 0, 0, NULL, NULL, NULL),
  ('ablesung', 'basic', 'Basic', 9.99, 95.90, NULL, NULL, NULL),
  ('ablesung', 'pro', 'Pro', 24.99, 239.90, NULL, NULL, NULL),
  ('ablesung', 'enterprise', 'Enterprise', 49.99, 479.90, 'prod_Tyl7LKcRIDZWMt', 'price_1T0nb552lqSgjCzeDefCBml1', 'price_1T0nb652lqSgjCze8tE5VNcd')

ON CONFLICT (app_id, tier_id) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  monthly_price_eur = EXCLUDED.monthly_price_eur,
  yearly_price_eur = EXCLUDED.yearly_price_eur,
  stripe_product_id = COALESCE(EXCLUDED.stripe_product_id, public.app_pricing.stripe_product_id),
  stripe_price_id_monthly = COALESCE(EXCLUDED.stripe_price_id_monthly, public.app_pricing.stripe_price_id_monthly),
  stripe_price_id_yearly = COALESCE(EXCLUDED.stripe_price_id_yearly, public.app_pricing.stripe_price_id_yearly);

-- ============================================================================
-- TEIL 3: Referral-Rewards standardisieren - 1 Monat gratis (BEIDE Seiten)
-- ============================================================================

-- Alle bestehenden Rewards ueberschreiben: einheitlich 1 Monat Pro/naechsthoehere Stufe
UPDATE public.referral_rewards SET
  reward_type = 'free_month',
  reward_description = '1 Monat gratis fuer beide',
  referrer_gets = '1 Monat naechsthoehere Stufe gratis',
  referred_gets = '1 Monat naechsthoehere Stufe gratis',
  max_referrals_per_user = -1, -- unlimited
  is_active = true
WHERE app_id IN ('mieter-checker', 'fintutto-portal', 'vermieter-portal', 'bescheidboxer', 'vermietify', 'hausmeisterpro', 'ablesung', 'mieter-app', 'financial-compass');

-- Spezifische reward_values (= Monatspreis der "mittleren" Stufe pro App)
UPDATE public.referral_rewards SET reward_value = 3.99 WHERE app_id = 'mieter-checker';       -- Premium
UPDATE public.referral_rewards SET reward_value = 14.99 WHERE app_id = 'fintutto-portal';     -- Kombi Pro
UPDATE public.referral_rewards SET reward_value = 7.99 WHERE app_id = 'vermieter-portal';     -- Pro
UPDATE public.referral_rewards SET reward_value = 4.99 WHERE app_id = 'bescheidboxer';        -- Kaempfer
UPDATE public.referral_rewards SET reward_value = 9.99 WHERE app_id = 'vermietify';           -- Basic
UPDATE public.referral_rewards SET reward_value = 9.99 WHERE app_id = 'hausmeisterpro';       -- Starter
UPDATE public.referral_rewards SET reward_value = 9.99 WHERE app_id = 'ablesung';             -- Basic
UPDATE public.referral_rewards SET reward_value = 4.99 WHERE app_id = 'mieter-app';           -- Basic
UPDATE public.referral_rewards SET reward_value = 9.99 WHERE app_id = 'financial-compass';    -- Basic

-- Referrer/Referred Beschreibungen pro App (spezifisch welcher Tier)
UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Premium gratis',
  referred_gets = '1 Monat Premium gratis'
WHERE app_id = 'mieter-checker';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Kombi Pro gratis',
  referred_gets = '1 Monat Mieter gratis'
WHERE app_id = 'fintutto-portal';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Pro gratis',
  referred_gets = '1 Monat Pro gratis'
WHERE app_id = 'vermieter-portal';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Kaempfer gratis',
  referred_gets = '1 Monat Kaempfer gratis'
WHERE app_id = 'bescheidboxer';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Basic gratis',
  referred_gets = '1 Monat Basic gratis'
WHERE app_id = 'vermietify';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Starter gratis',
  referred_gets = '1 Monat Starter gratis'
WHERE app_id = 'hausmeisterpro';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Basic gratis',
  referred_gets = '1 Monat Basic gratis'
WHERE app_id = 'ablesung';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Basic gratis',
  referred_gets = '1 Monat Basic gratis'
WHERE app_id = 'mieter-app';

UPDATE public.referral_rewards SET
  referrer_gets = '1 Monat Basic gratis',
  referred_gets = '1 Monat Basic gratis'
WHERE app_id = 'financial-compass';

-- ============================================================================
-- TEIL 4: Bundle-Rabatte erhoehen (attraktiver fuer Multi-App-Nutzer)
-- ============================================================================

UPDATE public.bundle_discounts SET
  discount_percent = 20,
  description = '20% Rabatt bei 2 Fintutto-Apps'
WHERE name = 'Duo-Rabatt';

UPDATE public.bundle_discounts SET
  discount_percent = 25,
  description = '25% Rabatt bei 3 Fintutto-Apps'
WHERE name = 'Trio-Rabatt';

UPDATE public.bundle_discounts SET
  discount_percent = 30,
  description = '30% Rabatt bei 4+ Fintutto-Apps'
WHERE name = 'Ecosystem-Rabatt';

-- Neuer Top-Tier: 5+ Apps
INSERT INTO public.bundle_discounts (name, description, min_apps, discount_percent) VALUES
  ('All-In Rabatt', '35% Rabatt bei 5+ Fintutto-Apps', 5, 35)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEIL 5: Ecosystem-Bundles (vordefinierte Pakete fuer Personas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ecosystem_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  target_persona TEXT NOT NULL, -- 'mieter', 'vermieter', 'hausverwaltung'
  included_apps JSONB NOT NULL, -- [{app_id, tier_id}]
  individual_monthly_total NUMERIC NOT NULL,
  bundle_monthly_price NUMERIC NOT NULL,
  bundle_yearly_price NUMERIC NOT NULL,
  discount_percent INTEGER NOT NULL,
  stripe_product_id TEXT, -- TODO: In Stripe anlegen
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ecosystem_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ecosystem bundles viewable by everyone"
ON public.ecosystem_bundles FOR SELECT
USING (is_active = true);

INSERT INTO public.ecosystem_bundles (bundle_id, name, description, target_persona, included_apps, individual_monthly_total, bundle_monthly_price, bundle_yearly_price, discount_percent) VALUES
  (
    'mieter-komplett',
    'Mieter Komplett',
    'Portal Mieter + BescheidBoxer Kaempfer: Alle Rechte als Mieter kennen und durchsetzen',
    'mieter',
    '[{"app_id": "fintutto-portal", "tier_id": "mieter_basic"}, {"app_id": "bescheidboxer", "tier_id": "kaempfer"}]'::jsonb,
    9.98, 7.99, 76.70, 20
  ),
  (
    'vermieter-starter',
    'Vermieter Starter',
    'Portal Vermieter + Vermietify Basic: Vermieten leicht gemacht',
    'vermieter',
    '[{"app_id": "fintutto-portal", "tier_id": "vermieter_basic"}, {"app_id": "vermietify", "tier_id": "basic"}]'::jsonb,
    19.98, 14.99, 143.90, 25
  ),
  (
    'vermieter-pro',
    'Vermieter Pro',
    'Portal Kombi + Vermietify Pro + Ablesung Basic: Komplette Immobilienverwaltung',
    'vermieter',
    '[{"app_id": "fintutto-portal", "tier_id": "kombi_pro"}, {"app_id": "vermietify", "tier_id": "pro"}, {"app_id": "ablesung", "tier_id": "basic"}]'::jsonb,
    49.97, 34.99, 335.90, 30
  ),
  (
    'hausverwaltung',
    'Hausverwaltung',
    'Portal Unlimited + Vermietify Enterprise + Ablesung Pro + HausmeisterPro Pro: Alles fuer Profis',
    'hausverwaltung',
    '[{"app_id": "fintutto-portal", "tier_id": "unlimited"}, {"app_id": "vermietify", "tier_id": "enterprise"}, {"app_id": "ablesung", "tier_id": "pro"}, {"app_id": "hausmeisterpro", "tier_id": "pro"}]'::jsonb,
    124.96, 79.99, 767.90, 36
  )
ON CONFLICT (bundle_id) DO NOTHING;

-- ============================================================================
-- TEIL 6: Cross-App Referral Support
-- Wer einen Freund fuer eine ANDERE App wirbt, bekommt 1 Monat in SEINER App
-- ============================================================================

-- Spalte fuer die App des Referrers hinzufuegen (falls nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'referrer_app_id') THEN
    ALTER TABLE public.referrals ADD COLUMN referrer_app_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'referred_app_id') THEN
    ALTER TABLE public.referrals ADD COLUMN referred_app_id TEXT;
  END IF;
END $$;

COMMENT ON COLUMN public.referrals.referrer_app_id IS 'Die App in der der Werber seinen Gratis-Monat bekommt';
COMMENT ON COLUMN public.referrals.referred_app_id IS 'Die App fuer die der Geworbene sich anmeldet';

-- ============================================================================
-- TEIL 7: Pricing Issues Tracker (was noch in Stripe/den Repos zu tun ist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pricing_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL,
  issue_type TEXT NOT NULL, -- 'missing_yearly', 'wrong_currency', 'missing_stripe_id', 'price_mismatch'
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'high', -- 'critical', 'high', 'medium', 'low'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.pricing_issues ENABLE ROW LEVEL SECURITY;

INSERT INTO public.pricing_issues (app_id, issue_type, description, severity) VALUES
  ('mieter-app', 'wrong_currency', 'Mieter App nutzt USD ($9.99/$19.99) statt EUR. Preise auf 4.99/9.99 EUR aendern', 'critical'),
  ('mieter-app', 'missing_yearly', 'Jahres-Price-IDs fehlen im Code (useSubscription.ts)', 'high'),
  ('financial-compass', 'missing_stripe_id', 'Jahres-Price-IDs erstellt aber nicht im Code eingetragen (useSubscription.ts)', 'high'),
  ('hausmeisterpro', 'missing_yearly', 'Jahres-Price-IDs fuer Starter und Pro fehlen komplett (nicht in Stripe)', 'high'),
  ('vermietify', 'missing_yearly', 'Jahres-Price-IDs fehlen komplett (nicht in Stripe)', 'high'),
  ('vermietify', 'missing_stripe_id', 'Placeholder Product-IDs (prod_starter etc.) statt echte Stripe-IDs', 'high'),
  ('bescheidboxer', 'missing_stripe_id', 'Stripe Price IDs nicht im Code eingetragen (credits.ts)', 'high'),
  ('bescheidboxer', 'price_mismatch', 'Jahrespreise im Code (29.99/49.99/79.99) weichen von Stripe (28.70/47.90/76.70) ab', 'medium'),
  ('ablesung', 'price_mismatch', 'Eigene Preisstruktur weicht von Ecosystem-Standard ab (99.90 statt 95.90 jaehrlich)', 'medium'),
  ('mieter-checker', 'price_mismatch', 'Jahresrabatt nur 16% statt 20% (9.99 statt 9.50). In Stripe bereits so, Stripe-Preis muesste geaendert werden', 'low')
ON CONFLICT DO NOTHING;
