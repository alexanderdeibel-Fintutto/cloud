-- 020_entitlements.sql
-- Feature-basiertes Berechtigungssystem fuer das gesamte Fintutto-Oekosystem
-- Ermoeglicht modulare Monetarisierung: App-spezifische Upgrades, Addons, Usage-Features

CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'stripe', -- stripe, referral, admin, trial
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

CREATE INDEX idx_entitlements_user ON public.entitlements(user_id);
CREATE INDEX idx_entitlements_feature ON public.entitlements(feature_key);
CREATE INDEX idx_entitlements_expires ON public.entitlements(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements" ON public.entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- Feature Registry: Definiert alle verfuegbaren Features im Oekosystem
CREATE TABLE IF NOT EXISTS public.feature_registry (
  key TEXT PRIMARY KEY,
  app TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Feature Registry
INSERT INTO public.feature_registry (key, app, name, description, is_premium) VALUES
  -- Finance Coach Features
  ('finance_coach_basic', 'finance_coach', 'Finance Coach Basic', 'Grundlegende Budgetierung und Ausgabenverfolgung', false),
  ('finance_multi_bank', 'finance_coach', 'Multi-Bank-Sync', 'Mehrere Bankkonten verbinden', true),
  ('finance_ai_insights', 'finance_coach', 'KI-Insights', 'KI-gestuetzte Ausgabenanalyse', true),
  ('finance_forecast', 'finance_coach', 'Cashflow-Forecast', '90-Tage Liquiditaetsprognose', true),
  ('finance_ai_coach', 'finance_coach', 'KI-Finance-Coach', 'Persoenliche Finanzberatung per KI', true),
  -- Biz Features
  ('biz_basic', 'biz', 'Biz Basic', 'Grundlegende Geschaeftsfunktionen', false),
  ('biz_unlimited_invoices', 'biz', 'Unbegrenzte Rechnungen', 'Keine Limitierung bei Rechnungserstellung', true),
  ('biz_tax_reports', 'biz', 'Steuer-Reports', 'Automatische Steueruebersichten', true),
  ('biz_ai_cfo', 'biz', 'KI-CFO', 'KI-gestuetzte Cashflow-Prognose und Optimierung', true),
  ('biz_cashflow_forecast', 'biz', 'Cashflow-Forecast', 'Geschaeftliche Liquiditaetsplanung', true),
  -- Learn Features
  ('learn_basic', 'learn', 'Basis-Kurse', 'Zugang zu Intro-Modulen', false),
  ('learn_premium_courses', 'learn', 'Premium-Kurse', 'Alle Kurse und Lernpfade', true),
  ('learn_certificates', 'learn', 'Zertifikate', 'Abschluss-Zertifikate', true),
  ('learn_ai_tutor', 'learn', 'KI-Tutor', 'Persoenlicher KI-Lernassistent', true),
  -- API Features
  ('api_basic', 'api', 'API Basic', '1.000 Calls/Monat', false),
  ('api_startup', 'api', 'API Startup', '50.000 Calls/Monat', true),
  ('api_pro', 'api', 'API Pro', '500.000 Calls/Monat', true),
  ('api_enterprise', 'api', 'API Enterprise', 'Unbegrenzte Calls', true)
ON CONFLICT (key) DO NOTHING;
