# Kostenübersicht: Fintutto Portal — Alle APIs & Services

> Stand: April 2026 | Projekt: `aaefocdqgdgexkcrjhks` (Supabase Fintutto)  
> Diese Übersicht zeigt alle laufenden und potenziellen Kosten, die durch den Betrieb des Fintutto Portals entstehen.

---

## 1. Supabase

**Plan:** Pro ($25/Monat) — basierend auf der Projektkonfiguration.

| Ressource | Inklusivleistung (Pro) | Überschreitungskosten | Fintutto-Schätzung |
|---|---|---|---|
| Datenbank-Speicher | 8 GB | $0,125/GB | ~2–4 GB → **$0** |
| Datenbank-Egress | 250 GB/Monat | $0,09/GB | ~10–50 GB → **$0** |
| Auth-Nutzer | Unbegrenzt | — | — |
| Edge Function Aufrufe | 2 Mio./Monat | $2/Mio. | Siehe Abschnitt 3 |
| Edge Function CPU-Zeit | 500.000 ms/Monat | $2/100k ms | Abhängig von GPT-Calls |
| Storage | 100 GB | $0,021/GB | ~5–20 GB → **$0** |
| Realtime | 500 gleichzeitige Verbindungen | $10/Mio. Messages | Gering |

**Monatliche Supabase-Basiskosten: $25/Monat**

---

## 2. Vercel

**Plan:** Pro ($20/Monat) — für Monorepo mit 20 Apps.

| Ressource | Inklusivleistung (Pro) | Überschreitungskosten | Fintutto-Schätzung |
|---|---|---|---|
| Bandwidth | 1 TB/Monat | $0,15/GB | ~50–200 GB → **$0** |
| Build-Minuten | 6.000 Min./Monat | $0,01/Min. | ~500–1.500 Min. → **$0** |
| Serverless Functions | 1 Mio. Aufrufe/Monat | $0,60/Mio. | Gering → **$0** |
| Deployments | Unbegrenzt | — | — |

> **Hinweis:** Durch die `ignoreCommand`-Konfiguration für 8 Apps werden Build-Minuten massiv reduziert (geschätzte Einsparung: 40–60% der Build-Zeit).

**Monatliche Vercel-Basiskosten: $20/Monat**

---

## 3. OpenAI API

Die teuerste variable Kostenquelle. Alle Kosten entstehen nur bei tatsächlicher Nutzung.

### Modell-Preise (Stand April 2026)

| Modell | Input | Output | Verwendung in Fintutto |
|---|---|---|---|
| `gpt-4o` | $2,50/1M Tokens | $10,00/1M Tokens | OCR-Funktionen, amt-scan |
| `gpt-4o-mini` | $0,15/1M Tokens | $0,60/1M Tokens | secondbrain-chat, amt-scan (Analyse) |
| `gpt-4.1-mini` | $0,40/1M Tokens | $1,60/1M Tokens | ai-chat, analyze-document |

### Kosten pro Edge Function Aufruf (Schätzung)

| Edge Function | Modell | Tokens/Aufruf (Schätzung) | Kosten/Aufruf |
|---|---|---|---|
| `ocr-meter` | gpt-4o | ~2.000 Input (Bild) + 256 Output | ~$0,007 |
| `ocr-meter-number` | gpt-4o | ~2.000 Input + 128 Output | ~$0,006 |
| `ocr-invoice` | gpt-4o | ~3.000 Input + 1.024 Output | ~$0,018 |
| `amt-scan` | gpt-4o + gpt-4o-mini | ~4.000 + 2.048 + 1.024 Output | ~$0,025 |
| `analyze-receipt` | gpt-4o | ~2.000 Input + 512 Output | ~$0,010 |
| `secondbrain-chat` | gpt-4o-mini | ~2.000 Input + 1.024 Output | ~$0,001 |
| `analyze-document` | gpt-4.1-mini | ~5.000 Input + 4.000 Output | ~$0,009 |
| `secondbrain-ocr` | gpt-4o (Vision) | ~3.000 Input + 4.000 Output | ~$0,048 |

### Monatliche OpenAI-Kostenszenarien

| Szenario | Nutzer | Aufrufe/Nutzer/Monat | Gesamt-Aufrufe | Geschätzte Kosten |
|---|---|---|---|---|
| **Klein** (Beta) | 50 | 5 | 250 | ~$2–5/Monat |
| **Mittel** (Wachstum) | 500 | 10 | 5.000 | ~$50–100/Monat |
| **Groß** (Skalierung) | 5.000 | 15 | 75.000 | ~$750–1.500/Monat |

> **Empfehlung:** OpenAI-Kosten über Nutzungs-Limits pro Tier steuern (Free: 0 GPT-Calls, Starter: 20/Monat, Pro: unbegrenzt).

---

## 4. Stripe (Zahlungsabwicklung)

**Kosten:** 1,4% + €0,25 pro Transaktion (EU-Karten) / 2,9% + €0,25 (Non-EU).

### Fintutto Preismodell (aus Secrets)

| Produkt | Monatlich | Jährlich |
|---|---|---|
| Mieter Plus | Aus `STRIPE_PRICE_MIETER_PLUS_MONTHLY` | Aus `STRIPE_PRICE_MIETER_PLUS_YEARLY` |
| Vermieter Komplett | Aus `STRIPE_PRICE_VERMIETER_KOMPLETT_MONTHLY` | Aus `STRIPE_PRICE_VERMIETER_KOMPLETT_YEARLY` |
| Fintutto Komplett | Aus `STRIPE_PRICE_FINTUTTO_KOMPLETT_MONTHLY` | Aus `STRIPE_PRICE_FINTUTTO_KOMPLETT_YEARLY` |

### Stripe-Kostenszenarien

| Szenario | Abos/Monat | Ø Abo-Wert | Stripe-Gebühr (1,4%+€0,25) | Netto-Einnahmen |
|---|---|---|---|---|
| **Klein** | 20 | €15 | ~€0,46/Abo = €9,20 | €290,80 |
| **Mittel** | 200 | €20 | ~€0,53/Abo = €106 | €3.894 |
| **Groß** | 2.000 | €25 | ~€0,60/Abo = €1.200 | €48.800 |

---

## 5. Resend (E-Mail)

**Plan:** Free bis 3.000 E-Mails/Monat, dann $20/Monat für 50.000 E-Mails.

| Szenario | E-Mails/Monat | Kosten |
|---|---|---|
| Klein (<3.000) | Transaktionale E-Mails | **$0** (Free Plan) |
| Mittel (3.000–50.000) | Betriebskosten-Abrechnungen, Benachrichtigungen | **$20/Monat** |
| Groß (>50.000) | Massenbenachrichtigungen | $0,001/E-Mail |

**Aktuelle Nutzung:** Betriebskosten-Abrechnungen (`send-email` Edge Function), Mietvertrags-Benachrichtigungen.

---

## 6. Google Maps / Places API

**Kosten:** $17/1.000 Anfragen (Places Autocomplete), $5/1.000 (Geocoding).

| Funktion | Aufrufe/Monat (Schätzung) | Kosten |
|---|---|---|
| Adress-Autocomplete (Mieter App) | ~500–2.000 | $8,50–$34 |
| Place Details | ~200–500 | $1–$2,50 |

> **Hinweis:** Google Maps bietet $200/Monat kostenloses Guthaben. Bei normaler Nutzung entstehen **keine Kosten**.

**Monatliche Google Maps-Kosten: $0 (innerhalb Free Tier)**

---

## 7. ElevenLabs (Text-to-Speech)

**Plan:** Starter ($5/Monat für 30.000 Zeichen) oder Creator ($22/Monat für 100.000 Zeichen).

| App | Nutzung | Schätzung |
|---|---|---|
| Arbeitslos-Portal (Fortschritt-Vorlesen) | ~500 Zeichen/Nutzer | Gering |
| BescheidBoxer (Bescheid vorlesen) | ~2.000 Zeichen/Bescheid | Mittel |
| AMS Onboarding | ~1.000 Zeichen/Session | Gering |

**Monatliche ElevenLabs-Kosten: $5–$22/Monat**

---

## 8. Anthropic (Claude API)

**Kosten:** Claude 3.5 Sonnet: $3/1M Input, $15/1M Output.

| Verwendung | Aufrufe/Monat | Kosten |
|---|---|---|
| `ANTHROPIC_API_KEY` ist gesetzt | Unbekannt | Abhängig von Nutzung |

> **Hinweis:** Der Anthropic-Key ist in Supabase Secrets gesetzt. Prüfe welche Functions ihn nutzen.

---

## 9. Gesamtkostenübersicht

### Fixkosten (monatlich, unabhängig von Nutzerzahl)

| Service | Kosten/Monat |
|---|---|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| ElevenLabs Starter | $5 |
| **Gesamt Fixkosten** | **$50/Monat (~€46)** |

### Variable Kosten (abhängig von Nutzerzahl)

| Szenario | Nutzer | OpenAI | Stripe-Gebühren | Resend | **Gesamt variabel** |
|---|---|---|---|---|---|
| **Klein** (50 Nutzer) | 50 | ~$5 | ~$9 | $0 | **~$14/Monat** |
| **Mittel** (500 Nutzer) | 500 | ~$75 | ~$106 | $20 | **~$201/Monat** |
| **Groß** (5.000 Nutzer) | 5.000 | ~$1.000 | ~$1.200 | $20 | **~$2.220/Monat** |

### Gesamtkosten pro Szenario

| Szenario | Fixkosten | Variable Kosten | **Gesamt** | Einnahmen (Schätzung) | **Marge** |
|---|---|---|---|---|---|
| Klein | $50 | $14 | **$64** | ~$300 | **+$236 (78%)** |
| Mittel | $50 | $201 | **$251** | ~$4.000 | **+$3.749 (94%)** |
| Groß | $50 | $2.220 | **$2.270** | ~$50.000 | **+$47.730 (95%)** |

---

## 10. Kostenoptimierungs-Empfehlungen

### Sofort umsetzbar

1. **OpenAI-Kosten begrenzen:** Rate-Limiting pro Nutzer und Tier in den Edge Functions implementieren. Free-Nutzer: 0 GPT-Calls, Starter: 20/Monat, Pro: unbegrenzt.
2. **Caching für OCR-Ergebnisse:** Zählerstand-OCR-Ergebnisse in Supabase cachen (gleiche Bilder nicht zweimal analysieren). Potenzielle Einsparung: 30–50%.
3. **Modell-Downgrade prüfen:** `ocr-meter` und `ocr-meter-number` könnten mit `gpt-4o-mini` arbeiten (Einsparung: 94% der Kosten pro Aufruf).

### Mittelfristig

4. **Supabase Edge Function Batching:** Mehrere kleine Anfragen bündeln statt einzeln senden.
5. **Google Maps Autocomplete-Debouncing:** Sicherstellen, dass nicht bei jedem Tastendruck eine API-Anfrage gesendet wird (min. 300ms Debounce).
6. **ElevenLabs-Caching:** Häufig vorgelesene Texte (Onboarding, Standard-Erklärungen) als Audio-Dateien in Supabase Storage cachen.

### Langfristig

7. **OpenAI → eigenes Fine-tuned Modell:** Bei >5.000 Nutzern lohnt sich ein Fine-tuned Modell für Bescheid-Analyse und OCR (Einsparung: 60–80% der OpenAI-Kosten).
8. **Supabase Enterprise:** Ab ~10.000 Nutzern günstiger als Pro-Plan mit Überschreitungsgebühren.

---

*Alle Preise sind Schätzungen basierend auf öffentlichen Preislisten (Stand April 2026). Tatsächliche Kosten können abweichen.*
