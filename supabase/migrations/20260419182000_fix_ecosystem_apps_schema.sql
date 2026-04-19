-- Fix ecosystem_apps table: add missing columns that the frontend expects
-- The table was created with a minimal schema, but the EcosystemPromoCards component
-- expects a richer schema with slug, tagline, features, colors, pricing, etc.

ALTER TABLE ecosystem_apps
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS color_from TEXT DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS color_to TEXT DEFAULT '#8b5cf6',
  ADD COLUMN IF NOT EXISTS app_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS register_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'vermieter',
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_monthly_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_yearly_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_for_target TEXT DEFAULT NULL;

-- Rename existing columns to match expected names
-- 'url' -> keep as is, but also populate app_url
UPDATE ecosystem_apps SET app_url = url WHERE app_url = '' OR app_url IS NULL;
UPDATE ecosystem_apps SET register_url = url WHERE register_url = '' OR register_url IS NULL;

-- Generate slugs from names
UPDATE ecosystem_apps SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
  WHERE slug IS NULL OR slug = '';

-- Update Vermietify entry with full data
UPDATE ecosystem_apps SET
  slug = 'vermieter-freude',
  tagline = 'Professionelle Immobilienverwaltung',
  color_from = '#6366f1',
  color_to = '#8b5cf6',
  app_url = 'https://vermietify.fintutto.cloud',
  register_url = 'https://vermietify.fintutto.cloud/register',
  target_audience = 'vermieter',
  features = ARRAY['Mietverwaltung', 'Nebenkostenabrechnung', 'Dokumentenverwaltung', 'Mieterportal', 'Finanzübersicht'],
  price_monthly_cents = 0,
  price_yearly_cents = 0,
  free_for_target = 'Kostenlos für Vermieter'
WHERE name = 'Vermietify';

-- Insert other Fintutto ecosystem apps if they don't exist yet
INSERT INTO ecosystem_apps (name, slug, tagline, description, icon, url, app_url, register_url, category, target_audience, color_from, color_to, features, price_monthly_cents, price_yearly_cents, sort_order, is_active)
VALUES
  ('Ablesung', 'ablesung', 'Digitale Zählerverwaltung', 'Zählerstände digital erfassen und verwalten', 'gauge', 'https://ablesung.fintutto.cloud', 'https://ablesung.fintutto.cloud', 'https://ablesung.fintutto.cloud/register', 'energie', 'verwalter', '#10b981', '#059669', ARRAY['Zählererfassung', 'OCR-Erkennung', 'Verbrauchsanalyse', 'Abrechnungsexport'], 0, 0, 2, true),
  ('Financial Compass', 'financial-compass', 'Persönliche Finanzplanung', 'Haushaltsbuch und Finanzplanung für Privatpersonen', 'compass', 'https://financial-compass.fintutto.cloud', 'https://financial-compass.fintutto.cloud', 'https://financial-compass.fintutto.cloud/register', 'finanzen', 'privat', '#f59e0b', '#d97706', ARRAY['Haushaltsbuch', 'Budgetplanung', 'Ausgabenanalyse', 'Sparziele'], 0, 0, 3, true),
  ('SecondBrain', 'secondbrain', 'KI-gestütztes Wissensmanagement', 'Notizen, Aufgaben und Wissen mit KI organisieren', 'brain', 'https://secondbrain.fintutto.cloud', 'https://secondbrain.fintutto.cloud', 'https://secondbrain.fintutto.cloud/register', 'produktivitaet', 'alle', '#8b5cf6', '#7c3aed', ARRAY['KI-Notizen', 'Aufgabenverwaltung', 'Wissensbase', 'Smart Search'], 0, 0, 4, true)
ON CONFLICT (slug) DO NOTHING;
