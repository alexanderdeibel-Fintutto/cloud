-- ============================================================
-- Migration: app_contexts für fw_knowledge_articles
-- Zweck: Dreistufige Kontextstruktur für know.fintutto.world
--        Universell → Hauptbereich (world/cloud) → App
-- ============================================================

-- 1. Spalte hinzufügen (falls noch nicht vorhanden)
ALTER TABLE public.fw_knowledge_articles
  ADD COLUMN IF NOT EXISTS app_contexts TEXT[] DEFAULT '{"global"}';

-- 2. Index für schnelle Array-Suche
CREATE INDEX IF NOT EXISTS idx_fw_knowledge_app_contexts
  ON public.fw_knowledge_articles USING GIN (app_contexts);

-- 3. Alle bestehenden Artikel initial mit ["global"] taggen
--    (nur wenn app_contexts noch NULL oder leer ist)
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global"}'
WHERE app_contexts IS NULL OR app_contexts = '{}';

-- 4. Bekannte Translator/World-Artikel korrekt taggen
--    Kategorien: translator, FAQ, howto, features, branch → world + translator
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"world", "translator"}'
WHERE category IN ('translator', 'FAQ', 'faq', 'howto', 'features', 'branch', 'guide', 'industries')
  AND (app_contexts = '{"global"}' OR app_contexts IS NULL);

-- 5. Blog-Artikel über fintutto allgemein → global
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global"}'
WHERE category = 'blog'
  AND show_in_blog = true;

-- 6. Technologie/Architektur-Artikel → world (alle Translator-Apps)
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"world"}'
WHERE category IN ('architecture', 'tech', 'pricing', 'onboarding', 'account', 'internal')
  AND (app_contexts = '{"global"}' OR app_contexts IS NULL);

-- 7. Spezifische Blog-Artikel für Translator-Nutzer taggen
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator"}'
WHERE slug IN (
  'blog-physik-hinter-0-5-sekunden-echtzeit-uebersetzung',
  'blog-warum-kein-fluesterkoffer-mehr-das-ende-einer-aera',
  'blog-ki-uebersetzung-vs-menschlicher-dolmetscher',
  'blog-offline-first-wie-fintutto-auch-ohne-netz-funktioniert',
  'blog-von-der-sprache-zum-klang-wie-text-to-speech-45-sprachen-lernt',
  'blog-was-fintutto-nicht-kann-ehrliche-grenzen',
  'blog-was-passiert-wenn-das-internet-ausfaellt-ausfallsicherheit',
  'blog-fintutto-vs-google-translate-deepl-der-ehrliche-vergleich',
  'blog-fintutto-roadmap-q2-q3-2026',
  'blog-multimedia-broadcasting-die-naechste-stufe-der-tour',
  'blog-api-first-wie-partner-fintutto-einbauen'
);

-- 8. Branchen-spezifische Blog-Artikel taggen
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator", "medical"}'
WHERE slug = 'blog-sprachbarriere-im-sprechzimmer-warum-kliniken-jetzt-handeln-muessen';

UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator", "authority"}'
WHERE slug = 'blog-die-stille-revolution-im-behoerdengang';

UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator", "conference"}'
WHERE slug = 'blog-1000-zuhoerer-50-sprachen-ein-mikrofon-fintutto-auf-konferenzen';

UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator", "school"}'
WHERE slug = 'blog-schule-ohne-sprachbarriere-wie-bildungseinrichtungen-inklusion-leben';

UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global", "world", "translator", "guide"}'
WHERE slug IN (
  'blog-der-freiberufliche-guide-2026-zwischen-tradition-und-technologie',
  'blog-ein-vormittag-im-museum-der-zukunft'
);

-- 9. Gründer/Unternehmens-Artikel → global (für alle Bereiche)
UPDATE public.fw_knowledge_articles
SET app_contexts = '{"global"}'
WHERE slug IN (
  'blog-mit-50-jahren-gruenden-alexander-deibel-und-fintutto',
  'blog-kein-investor-deck-warum-wir-anders-finanzieren',
  'blog-der-weg-zur-ug-bewusst-klein-starten',
  'blog-das-oekosystem-prinzip-warum-27-apps-besser-sind-als-eine',
  'blog-keine-referenzkunden-warum-das-kein-problem-ist',
  'alexander-deibel-gruender',
  'fintutto-oekosystem-uebersicht',
  'fintutto-architektur-kennzahlen-zeitverlauf',
  'fintutto-architektur-praesentation-april-2026'
);

-- 10. Kommentar zur Taxonomie
COMMENT ON COLUMN public.fw_knowledge_articles.app_contexts IS
'Kontexte für die dreistufige Know-Navigation:
  global     = gilt für das gesamte fintutto-Universum (Startseite /)
  world      = gilt für alle World-Apps (know.fintutto.world/world)
  cloud      = gilt für alle Cloud-Apps (know.fintutto.world/cloud)
  translator = Übersetzungs-Apps (/world/translator)
  guide      = Guide-Apps (/world/guide)
  medical    = Medical-App (/world/medical)
  authority  = Behörden-App (/world/authority)
  conference = Konferenz-App (/world/conference)
  school     = Schul-App (/world/school)
  vermietify = Immobilien-App (/cloud/vermietify)
  financial  = Finanz-App (/cloud/financial)
  secondbrain= SecondBrain-App (/cloud/secondbrain)
  lifestyle  = Lifestyle-Apps (/cloud/lifestyle)';
