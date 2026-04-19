-- Migration: update_existing_know_articles_with_api_costs
-- Aktualisiere bestehende Artikel mit Verweisen auf die neuen Artikel

-- 1. Zentrales Aktivitäts-Tracking in Portal-Apps (features)
UPDATE fw_knowledge_articles
SET content = content || '

## Verwandte Themen
- [API-Kosten verstehen und optimieren](/know/features/api-kosten-verstehen-und-optimieren)
'
WHERE slug = 'zentrales-aktivitaets-tracking-portal-apps'
  AND content NOT LIKE '%api-kosten-verstehen-und-optimieren%';

-- 2. Preismodell: Alle Pläne im Überblick (pricing)
UPDATE fw_knowledge_articles
SET content = content || '

## Verwandte Themen
- [Kostenübersicht und Preismodell](/know/pricing/kostenuebersicht-und-preismodell)
- [API-Kosten verstehen und optimieren](/know/features/api-kosten-verstehen-und-optimieren)
'
WHERE slug = 'preismodell-alle-plaene'
  AND content NOT LIKE '%kostenuebersicht-und-preismodell%';

-- 3. Preismodell: Übersicht aller Pläne (pricing)
UPDATE fw_knowledge_articles
SET content = content || '

## Verwandte Themen
- [Kostenübersicht und Preismodell](/know/pricing/kostenuebersicht-und-preismodell)
- [API-Kosten verstehen und optimieren](/know/features/api-kosten-verstehen-und-optimieren)
'
WHERE slug = 'preismodell-uebersicht'
  AND content NOT LIKE '%kostenuebersicht-und-preismodell%';
