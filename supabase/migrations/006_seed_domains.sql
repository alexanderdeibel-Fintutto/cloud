-- ============================================================
-- FINTUTTO DOMAIN SEED DATA
-- Alle bekannten Fintutto-Domains für die Domain-Verwaltung
-- ============================================================

-- ============================
-- 1. PRODUKTIONS-APPS (Vercel)
-- ============================

INSERT INTO public.domains (url, label, category, repo_name, deploy_url, priority, health) VALUES
  ('https://fintutto.vercel.app', 'Fintutto Website', 'app', 'fintutto-your-financial-compass', 'https://fintutto.vercel.app', 100, 'unknown'),
  ('https://vermietify.vercel.app', 'Vermietify', 'app', 'vermieter-freude', 'https://vermietify.vercel.app', 95, 'unknown'),
  ('https://mieter-kw8d.vercel.app', 'Mieter-Portal', 'app', 'wohn-held', 'https://mieter-kw8d.vercel.app', 90, 'unknown'),
  ('https://hausmeister-pro.vercel.app', 'Hausmeister Pro', 'app', 'fintu-hausmeister-app', 'https://hausmeister-pro.vercel.app', 80, 'unknown'),
  ('https://ablesung.vercel.app', 'Zähler-App', 'app', 'leserally-all', 'https://ablesung.vercel.app', 80, 'unknown'),
  ('https://betriebskosten-helfer.vercel.app', 'Betriebskosten-Rechner', 'calculator', 'betriebskosten-helfer', 'https://betriebskosten-helfer.vercel.app', 70, 'unknown'),
  ('https://fintutto-admin-hub.vercel.app', 'Admin Dashboard', 'app', 'fintutto-admin-hub', 'https://fintutto-admin-hub.vercel.app', 85, 'unknown')
ON CONFLICT (url) DO NOTHING;

-- ============================
-- 2. GEPLANTE CUSTOM DOMAINS (fintutto.cloud)
-- ============================

INSERT INTO public.domains (url, label, category, priority, health) VALUES
  ('https://fintutto.cloud', 'Fintutto Hauptseite', 'landing', 100, 'unknown'),
  ('https://admin.fintutto.cloud', 'Admin Dashboard', 'app', 85, 'unknown'),
  ('https://vermietify.fintutto.cloud', 'Vermietify App', 'app', 95, 'unknown'),
  ('https://mieterportal.fintutto.cloud', 'Mieter-Portal', 'app', 90, 'unknown'),
  ('https://zaehler.fintutto.cloud', 'Zähler-App', 'app', 80, 'unknown'),
  ('https://hausmeisterpro.fintutto.cloud', 'Hausmeister Pro', 'app', 80, 'unknown'),
  ('https://betriebskosten.fintutto.cloud', 'Betriebskosten', 'calculator', 70, 'unknown'),
  ('https://portal.fintutto.cloud', 'Fintutto-Portal (Rechner+Checker+Formulare)', 'portal', 90, 'unknown'),
  ('https://formulare.fintutto.cloud', 'Formulare Hub', 'tool', 75, 'unknown'),
  ('https://rendite.fintutto.cloud', 'Rendite-Rechner', 'calculator', 70, 'unknown'),
  ('https://api.fintutto.cloud', 'API Endpoint', 'tool', 60, 'unknown')
ON CONFLICT (url) DO NOTHING;

-- ============================
-- 3. EINZELNE RECHNER (Lovable-Apps)
-- ============================

INSERT INTO public.domains (url, label, category, repo_name, priority, health) VALUES
  ('https://your-property-costs.lovable.app', 'Kaufnebenkostenrechner', 'calculator', 'your-property-costs', 50, 'unknown'),
  ('https://fintutto-rent-wizard.lovable.app', 'Renditerechner', 'calculator', 'fintutto-rent-wizard', 50, 'unknown'),
  ('https://miet-check-pro-458b8dcf.lovable.app', 'Miet-Check Pro', 'calculator', 'miet-check-pro-458b8dcf', 50, 'unknown'),
  ('https://property-equity-partner.lovable.app', 'Eigenkapitalrechner', 'calculator', 'property-equity-partner', 50, 'unknown'),
  ('https://kaution-klar.lovable.app', 'Kautionsrechner', 'calculator', 'kaution-klar', 50, 'unknown'),
  ('https://mietenplus-rechner.lovable.app', 'Mieterhöhungsrechner', 'calculator', 'mietenplus-rechner', 50, 'unknown'),
  ('https://grundsteuer-easy.lovable.app', 'Grundsteuerrechner', 'calculator', 'grundsteuer-easy', 50, 'unknown')
ON CONFLICT (url) DO NOTHING;

-- ============================
-- 4. EINZELNE CHECKER (Lovable-Apps)
-- ============================

INSERT INTO public.domains (url, label, category, repo_name, priority, health) VALUES
  ('https://check-mieterhoehung2-fintutto.lovable.app', 'Mieterhöhung-Checker', 'tool', 'check-mieterhoehung2-fintutto', 45, 'unknown'),
  ('https://k-ndigungs-check-pro.lovable.app', 'Kündigungs-Checker', 'tool', 'k-ndigungs-check-pro', 45, 'unknown'),
  ('https://deposit-check-pro.lovable.app', 'Kautions-Checker', 'tool', 'deposit-check-pro', 45, 'unknown'),
  ('https://schoenheit-fintutto.lovable.app', 'Schönheitsreparaturen-Checker', 'tool', 'schoenheit-fintutto', 45, 'unknown'),
  ('https://fintutto-miet-recht.lovable.app', 'Mietrecht-Checker', 'tool', 'fintutto-miet-recht', 45, 'unknown')
ON CONFLICT (url) DO NOTHING;

-- ============================
-- 5. NISCHEN-DOMAINS (Externe SEO-Domains)
-- ============================

INSERT INTO public.domains (url, label, category, priority, health) VALUES
  ('https://kaufnebenkosten-rechner.de', 'Kaufnebenkosten-Rechner.de', 'landing', 40, 'unknown'),
  ('https://nebenkostenrechner.eu', 'Nebenkostenrechner.eu', 'landing', 40, 'unknown'),
  ('https://mietenplus-rechner.de', 'Mietenplus-Rechner.de', 'landing', 40, 'unknown'),
  ('https://meinrenditerechner.de', 'MeinRenditerechner.de', 'landing', 40, 'unknown'),
  ('https://mietspiegel-finder.de', 'Mietspiegel-Finder.de', 'landing', 40, 'unknown'),
  ('https://zaehlerapp.de', 'ZählerApp.de', 'landing', 40, 'unknown'),
  ('https://meinezaehlerapp.de', 'MeineZählerApp.de', 'landing', 40, 'unknown'),
  ('https://meinuebergabeprotokoll.de', 'MeinÜbergabeprotokoll.de', 'landing', 40, 'unknown'),
  ('https://mietvertrag-kuendigung.de', 'Mietvertrag-Kündigung.de', 'landing', 40, 'unknown'),
  ('https://anlage-v-ausfuellen.de', 'Anlage-V-Ausfüllen.de', 'landing', 40, 'unknown'),
  ('https://mieterhohung-rechner.de', 'Mieterhöhung-Rechner.de', 'landing', 40, 'unknown'),
  ('https://vermietify.de', 'Vermietify.de', 'landing', 60, 'unknown'),
  ('https://fintutto.de', 'Fintutto.de', 'landing', 70, 'unknown')
ON CONFLICT (url) DO NOTHING;

-- ============================
-- 6. BESCHEIDBOXER
-- ============================

INSERT INTO public.domains (url, label, category, priority, health) VALUES
  ('https://app.bescheidboxer.de', 'BescheidBoxer App', 'app', 55, 'unknown'),
  ('https://widerspruchjobcenter.de', 'Widerspruch Jobcenter', 'landing', 35, 'unknown'),
  ('https://buergergeld-rechner.net', 'Bürgergeld-Rechner', 'calculator', 35, 'unknown'),
  ('https://kdu-checker.de', 'KdU-Checker', 'tool', 35, 'unknown'),
  ('https://kdu-rechner.de', 'KdU-Rechner', 'calculator', 35, 'unknown'),
  ('https://kosten-der-unterkunft-rechner.de', 'Kosten der Unterkunft Rechner', 'calculator', 35, 'unknown'),
  ('https://mehrbedarf-rechner.de', 'Mehrbedarf-Rechner', 'calculator', 35, 'unknown')
ON CONFLICT (url) DO NOTHING;
