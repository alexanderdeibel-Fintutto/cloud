-- Migration: add_know_articles_api_costs_and_pricing
-- Fügt zwei neue Artikel in die fw_knowledge_articles Tabelle ein.

-- 1. Artikel: API-Kosten verstehen und optimieren (features)
INSERT INTO fw_knowledge_articles (
    id, title, slug, content, summary, category, tags, language, 
    is_public, is_platform, provider_type, status, created_at, updated_at, show_in_blog, is_internal
) VALUES (
    gen_random_uuid(),
    'API-Kosten verstehen und optimieren',
    'api-kosten-verstehen-und-optimieren',
    '# API-Kosten verstehen und optimieren

Fintutto nutzt im Hintergrund leistungsstarke KI-Modelle und APIs, um dir Funktionen wie automatische Belegerkennung (OCR), Text-to-Speech und Adress-Vervollständigung zu bieten. Damit wir diese Funktionen dauerhaft in hoher Qualität und zu fairen Preisen anbieten können, haben wir ein intelligentes System zur Kostenoptimierung und Limitierung eingeführt.

## Was du brauchst
- Einen aktiven Fintutto-Account
- Für unbegrenzte Nutzung: Einen **Pro-Plan** oder höher

## So funktioniert es

Unser System nutzt verschiedene Strategien, um API-Aufrufe effizient zu gestalten und Kosten zu sparen, ohne dass du Leistungseinbußen bemerkst.

1. **Intelligentes Caching**: Wenn du ein Dokument scannst (OCR) oder einen Text vorlesen lässt (TTS), speichert unser System das Ergebnis sicher ab. Wenn dasselbe Dokument oder derselbe Text erneut angefragt wird, laden wir das Ergebnis direkt aus unserem schnellen Cache, anstatt die teure KI-API erneut aufzurufen.
2. **Modell-Optimierung**: Für einfache Aufgaben wie das Auslesen eines Zählerstands nutzen wir blitzschnelle und kostengünstige Modelle (wie Claude Haiku). Für komplexe Aufgaben wie die Analyse von Verträgen kommen leistungsstärkere Modelle (wie Claude Sonnet) zum Einsatz.
3. **Debouncing**: Bei der Eingabe von Adressen (Google Maps Autocomplete) wartet das System einen kurzen Moment (350 Millisekunden), bis du mit dem Tippen fertig bist, bevor eine Anfrage an Google gesendet wird. Das reduziert unnötige API-Aufrufe während des Tippens drastisch.
4. **Tier-basierte Limits**: Um Missbrauch zu verhindern und die Plattform stabil zu halten, gelten je nach gebuchtem Plan unterschiedliche Limits für API-Aufrufe.

## Häufige Fragen

**Was passiert, wenn ich mein Limit erreiche?**
Wenn du das monatliche Limit deines aktuellen Plans erreichst, erhältst du eine Benachrichtigung. Die entsprechenden KI-Funktionen (wie OCR oder TTS) werden dann bis zum nächsten Abrechnungsmonat pausiert. Du kannst jederzeit auf einen höheren Plan upgraden, um die Funktionen sofort wieder freizuschalten.

**Zählen gecachte Aufrufe zu meinem Limit?**
Nein. Wenn ein Ergebnis aus unserem Cache geladen wird (z.B. weil du dasselbe Dokument zweimal hochlädst), zählt dies nicht als API-Aufruf und belastet dein monatliches Limit nicht.

**Welche Limits gelten für meinen Plan?**
- **Free**: 0 API-Aufrufe/Monat (KI-Funktionen sind deaktiviert)
- **Starter**: 20 API-Aufrufe/Monat
- **Pro**: Unbegrenzte API-Aufrufe (Fair Use)

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Fehlermeldung "Rate limit exceeded" | Du hast dein monatliches Limit erreicht. Warte bis zum nächsten Monat oder upgrade auf den Pro-Plan. |
| Adresse wird beim Tippen nicht sofort vorgeschlagen | Das ist gewollt (Debouncing). Tippe deine Adresse fertig und warte einen kurzen Moment (ca. 0,3 Sekunden). |
| KI-Funktionen sind im Free-Plan nicht verfügbar | KI-Funktionen verursachen direkte Kosten und sind daher erst ab dem Starter-Plan verfügbar. |

## Verwandte Themen
- [Preismodell: Alle Pläne im Überblick](/know/pricing/preismodell-alle-plaene)
- [Zentrales Aktivitäts-Tracking in Portal-Apps](/know/features/zentrales-aktivitaets-tracking-portal-apps)
',
    'Erfahre, wie Fintutto API-Kosten durch Caching, Modell-Optimierung und Debouncing minimiert und welche Limits für deinen Plan gelten.',
    'features',
    ARRAY['api', 'kosten', 'limits', 'caching', 'ocr', 'tts', 'rate-limiting'],
    'de',
    true,
    true,
    'platform',
    'published',
    now(),
    now(),
    false,
    false
);

-- 2. Artikel: Kostenübersicht und Preismodell (pricing)
INSERT INTO fw_knowledge_articles (
    id, title, slug, content, summary, category, tags, language, 
    is_public, is_platform, provider_type, status, created_at, updated_at, show_in_blog, is_internal
) VALUES (
    gen_random_uuid(),
    'Kostenübersicht und Preismodell',
    'kostenuebersicht-und-preismodell',
    '# Kostenübersicht und Preismodell

Fintutto bietet ein transparentes und faires Preismodell, das sich an deine Bedürfnisse anpasst. Egal ob du Einzelnutzer bist oder ein großes Unternehmen vertrittst, wir haben den passenden Plan für dich.

## Was du brauchst
- Einen aktiven Fintutto-Account
- Eine gültige Zahlungsmethode (für kostenpflichtige Pläne)

## So funktioniert es

Unser Preismodell ist in verschiedene Tiers (Stufen) unterteilt. Jedes Tier bietet einen bestimmten Funktionsumfang und Limits für API-Aufrufe.

### Tier 1 — Free (Kostenlos)
- **Zielgruppe**: Einzelpersonen, Einsteiger, Tester
- **Preis**: €0/Monat
- **Limits**: 0 API-Aufrufe/Monat (KI-Funktionen sind deaktiviert)
- **Funktionen**: Basis-Funktionen der Portal-Apps, manuelles Eintragen von Daten

### Tier 2 — Starter
- **Zielgruppe**: Kleine Unternehmen, Freelancer, Vermieter mit wenigen Objekten
- **Preis**: €29/Monat
- **Limits**: 20 API-Aufrufe/Monat (für OCR, TTS, etc.)
- **Funktionen**: Alle Basis-Funktionen + KI-Unterstützung (bis zum Limit)

### Tier 3 — Pro
- **Zielgruppe**: Mittelständische Unternehmen, professionelle Vermieter, Agenturen
- **Preis**: €79/Monat
- **Limits**: Unbegrenzte API-Aufrufe (Fair Use)
- **Funktionen**: Alle Starter-Funktionen + erweiterte Analytics, Prioritäts-Support

### Tier 4 — Enterprise
- **Zielgruppe**: Großunternehmen, Behörden, Kliniken
- **Preis**: Auf Anfrage
- **Limits**: Individuell vereinbart
- **Funktionen**: Alle Pro-Funktionen + dedizierter Account Manager, SLA, Custom-Branding

## Häufige Fragen

**Wie kann ich meinen Plan ändern?**
Du kannst deinen Plan jederzeit in den Einstellungen deines Accounts unter "Abonnement" ändern. Upgrades werden sofort wirksam, Downgrades zum Ende des aktuellen Abrechnungszeitraums.

**Was passiert, wenn ich mein API-Limit im Starter-Plan erreiche?**
Wenn du das Limit von 20 API-Aufrufen pro Monat erreichst, werden die KI-Funktionen pausiert. Du kannst entweder bis zum nächsten Monat warten oder auf den Pro-Plan upgraden, um unbegrenzte Aufrufe zu erhalten.

**Gibt es versteckte Kosten?**
Nein. Alle Kosten sind transparent in unserem Preismodell aufgeführt. Es gibt keine versteckten Gebühren für Einrichtung oder Support.

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| Zahlung fehlgeschlagen | Überprüfe deine Zahlungsmethode in den Einstellungen und aktualisiere sie gegebenenfalls. |
| Funktionen nach Upgrade nicht verfügbar | Logge dich aus und wieder ein, um deine Berechtigungen zu aktualisieren. |

## Verwandte Themen
- [API-Kosten verstehen und optimieren](/know/features/api-kosten-verstehen-und-optimieren)
- [Preismodell: Alle Pläne im Überblick](/know/pricing/preismodell-alle-plaene)
',
    'Eine detaillierte Übersicht über das Fintutto-Preismodell, die verschiedenen Tiers und die enthaltenen Funktionen und Limits.',
    'pricing',
    ARRAY['preise', 'kosten', 'tier', 'plan', 'upgrade', 'limits'],
    'de',
    true,
    true,
    'platform',
    'published',
    now(),
    now(),
    false,
    false
);
