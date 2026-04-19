-- Apps Registry
CREATE TABLE public.apps_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT REFERENCES public.apps_registry(app_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Cross-Sell Triggers
CREATE TABLE public.ai_cross_sell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_app_id TEXT REFERENCES public.apps_registry(app_id) ON DELETE CASCADE,
  target_app_id TEXT REFERENCES public.apps_registry(app_id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  trigger_condition JSONB DEFAULT '{}',
  message_template TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.apps_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps are publicly readable" ON public.apps_registry
  FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

ALTER TABLE public.ai_cross_sell_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Triggers readable by authenticated users" ON public.ai_cross_sell_triggers
  FOR SELECT TO authenticated USING (true);

-- Seed Data: Fintutto Apps
INSERT INTO public.apps_registry (app_id, name, description, color, url, category, sort_order) VALUES
  ('hausmeisterpro', 'HausmeisterPro', 'Professionelle Hausverwaltung für Hausmeister', '#10B981', 'https://hausmeisterpro.fintutto.de', 'immobilien', 1),
  ('vermietify', 'Vermietify', 'Intelligente Mietverwaltung und Buchhaltung', '#6366F1', 'https://vermietify.fintutto.de', 'immobilien', 2),
  ('mieterapp', 'MieterApp', 'Kommunikation und Services für Mieter', '#F59E0B', 'https://mieterapp.fintutto.de', 'immobilien', 3),
  ('zaehler', 'Zähler', 'Automatische Zählerstand-Erfassung', '#8B5CF6', 'https://zaehler.fintutto.de', 'immobilien', 4),
  ('nebenkosten', 'Nebenkosten', 'Nebenkostenabrechnung leicht gemacht', '#EC4899', 'https://nebenkosten.fintutto.de', 'finanzen', 5),
  ('formulare', 'Formulare', 'Digitale Formulare und Vorlagen', '#14B8A6', 'https://formulare.fintutto.de', 'dokumente', 6);

-- Seed Data: Products
INSERT INTO public.products (app_id, name, description, price_monthly, features, stripe_price_id) VALUES
  ('vermietify', 'Vermietify Starter', 'Für kleine Vermieter', 9.99, '["Bis 5 Einheiten", "Grundfunktionen", "E-Mail Support"]', 'price_1Sr55p52lqSgjCzeX6tlI5tv'),
  ('vermietify', 'Vermietify Basic', 'Für wachsende Portfolios', 19.99, '["Bis 20 Einheiten", "Alle Features", "Priority Support"]', 'price_1Sr56K52lqSgjCzeqfCfOudX'),
  ('vermietify', 'Vermietify Pro', 'Für Profis', 49.99, '["Unbegrenzte Einheiten", "API Zugang", "Dedizierter Support"]', 'price_1Sr56o52lqSgjCzeRuGrant2'),
  ('mieterapp', 'MieterApp Basic', 'Kommunikation für Mieter', 4.99, '["Nachrichten", "Dokumente", "Schadensmeldung"]', 'price_1SsEqV52lqSgjCzeKuUQGBOE'),
  ('mieterapp', 'MieterApp Pro', 'Premium Mieter-Services', 9.99, '["Alle Basic Features", "Online-Zahlung", "Terminbuchung"]', 'price_1SsEr552lqSgjCzeBvWBTzKS'),
  ('zaehler', 'Zähler Basic', 'Einfache Erfassung', 2.99, '["Manuelle Eingabe", "Verlauf", "Export"]', 'price_1Stgdi52lqSgjCzewNmCKWqy'),
  ('zaehler', 'Zähler Pro', 'Automatische Erfassung', 7.99, '["OCR Erkennung", "Automatische Erinnerung", "Analytics"]', 'price_1StgdM52lqSgjCzelgTZIRGu'),
  ('nebenkosten', 'Nebenkosten Basic', 'Standard Abrechnung', 14.99, '["Jahresabrechnung", "Standardvorlagen", "PDF Export"]', 'price_1StYO152lqSgjCze6P1GfT2G'),
  ('nebenkosten', 'Nebenkosten Pro', 'Professionelle Abrechnung', 29.99, '["Alle Features", "Eigene Vorlagen", "Automatisierung"]', 'price_1StYOT52lqSgjCzeN0V0dLpA'),
  ('formulare', 'Formulare Basic', 'Digitale Formulare', 4.99, '["20 Formulare/Monat", "Standardvorlagen", "PDF Export"]', 'price_1St4fk52lqSgjCzeAqp6QBYD'),
  ('formulare', 'Formulare Pro', 'Unbegrenzte Formulare', 12.99, '["Unbegrenzt", "Eigene Vorlagen", "Workflow Automatisierung"]', 'price_1St4gG52lqSgjCzeOiHLvvXl');

-- Seed Data: Cross-Sell Triggers
INSERT INTO public.ai_cross_sell_triggers (source_app_id, target_app_id, trigger_type, trigger_condition, message_template, priority) VALUES
  ('hausmeisterpro', 'vermietify', 'task_count', '{"min_tasks": 50}', 'Mit Vermietify verwalten Sie Ihre Objekte noch effizienter!', 10),
  ('hausmeisterpro', 'zaehler', 'building_count', '{"min_buildings": 3}', 'Sparen Sie Zeit: Zählerstände automatisch erfassen mit Zähler', 8),
  ('hausmeisterpro', 'mieterapp', 'message_count', '{"min_messages": 20}', 'Verbessern Sie die Kommunikation mit der MieterApp', 7),
  ('vermietify', 'nebenkosten', 'unit_count', '{"min_units": 5}', 'Nebenkostenabrechnung automatisieren? Nebenkosten macht es einfach!', 9),
  ('vermietify', 'formulare', 'document_count', '{"min_documents": 10}', 'Digitalisieren Sie Ihre Formulare mit Formulare', 6);