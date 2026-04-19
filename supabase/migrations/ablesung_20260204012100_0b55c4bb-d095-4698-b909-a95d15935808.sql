-- Products table für alle Fintutto-Apps
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-Sell Triggers für Banner
CREATE TABLE public.ai_cross_sell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_app_id TEXT NOT NULL,
  target_app_id TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Jetzt entdecken',
  cta_url TEXT,
  image_url TEXT,
  icon_name TEXT,
  background_gradient TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_app_id ON public.products(app_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX idx_cross_sell_source ON public.ai_cross_sell_triggers(source_app_id);
CREATE INDEX idx_cross_sell_active ON public.ai_cross_sell_triggers(is_active) WHERE is_active = true;

-- RLS aktivieren
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cross_sell_triggers ENABLE ROW LEVEL SECURITY;

-- Öffentliche Lesezugriff-Policies (Preise und Banner sollen für alle sichtbar sein)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Cross-sell triggers are viewable by authenticated users"
ON public.ai_cross_sell_triggers FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Nur Admins können Produkte/Trigger verwalten (für zukünftige Admin-UI)
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage cross-sell triggers"
ON public.ai_cross_sell_triggers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Beispieldaten für Fintutto-Apps
INSERT INTO public.products (app_id, name, description, price_monthly, price_yearly, features, sort_order) VALUES
('zaehler', 'Zählerstand Basic', 'Für kleine Vermieter', 9.99, 99.90, '["Bis zu 10 Einheiten", "OCR-Zählererfassung", "E-Mail Support"]', 1),
('zaehler', 'Zählerstand Pro', 'Für professionelle Vermieter', 24.99, 249.90, '["Bis zu 50 Einheiten", "OCR-Zählererfassung", "Prioritäts-Support", "Automatische Berichte"]', 2),
('vermietify', 'Vermietify Basic', 'Immobilienverwaltung', 14.99, 149.90, '["Unbegrenzte Einheiten", "Mietverträge", "Dokumentenverwaltung"]', 1),
('vermietify', 'Vermietify Pro', 'Professionelle Verwaltung', 39.99, 399.90, '["Alles in Basic", "Nebenkostenabrechnung", "Mieterportal", "API-Zugang"]', 2),
('nebenkosten', 'Nebenkosten Starter', 'Einfache Abrechnung', 19.99, 199.90, '["Bis zu 20 Einheiten", "Automatische Berechnung", "PDF-Export"]', 1),
('hausmeister', 'HausmeisterPro', 'Für Hausmeister-Services', 29.99, 299.90, '["Aufgabenverwaltung", "Zeiterfassung", "Objektübersicht"]', 1);

-- Beispiel Cross-Sell Trigger
INSERT INTO public.ai_cross_sell_triggers (source_app_id, target_app_id, headline, description, cta_text, icon_name, background_gradient, priority) VALUES
('zaehler', 'vermietify', 'Verwalten Sie Ihre Immobilien professionell', 'Mit Vermietify haben Sie alle Mietverträge, Dokumente und Mieter im Blick.', 'Vermietify entdecken', 'Building2', 'from-blue-500 to-indigo-600', 10),
('zaehler', 'nebenkosten', 'Nebenkostenabrechnung automatisieren', 'Erstellen Sie rechtssichere Nebenkostenabrechnungen mit wenigen Klicks.', 'Nebenkosten-App testen', 'Calculator', 'from-emerald-500 to-teal-600', 8),
('zaehler', 'hausmeister', 'Hausmeister-Aufgaben koordinieren', 'Weisen Sie Aufgaben zu und behalten Sie den Überblick über alle Wartungen.', 'HausmeisterPro ansehen', 'Wrench', 'from-orange-500 to-amber-600', 5);

-- Trigger für updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cross_sell_updated_at
BEFORE UPDATE ON public.ai_cross_sell_triggers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();