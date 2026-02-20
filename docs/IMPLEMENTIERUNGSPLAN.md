# Implementierungsplan: Portal-Monetarisierung

> Technischer Umsetzungsplan mit konkreten Aufgaben und Abhängigkeiten

---

## Phase 1: Quick Wins — Detailplan

### 1.1 Affiliate-Karten auf Ergebnisseiten

**Dateien zu erstellen/ändern:**
- `src/components/monetization/AffiliateCard.tsx` — Neue Komponente
- `src/lib/affiliate-config.ts` — Partner-Konfiguration
- `src/hooks/useAffiliate.ts` — Tracking-Hook
- Alle Checker-Ergebnis-Seiten — AffiliateCard einbinden
- Alle Rechner-Ergebnis-Seiten — AffiliateCard einbinden

**Partner-Mapping (Erstausstattung):**

```typescript
const affiliatePartners = {
  // Checker → Partner
  mietpreisbremse: [
    { name: 'ARAG Rechtsschutz', type: 'insurance', url: '...', commission: '€50-80' },
    { name: 'Advocard', type: 'insurance', url: '...', commission: '€30-60' },
  ],
  kuendigung: [
    { name: 'Umzugsauktion', type: 'service', url: '...', commission: '€15-40' },
    { name: 'ARAG Rechtsschutz', type: 'insurance', url: '...', commission: '€50-80' },
  ],
  kaution: [
    { name: 'Kautionsfrei.de', type: 'finance', url: '...', commission: '€20-35' },
    { name: 'Deutsche Kautionskasse', type: 'finance', url: '...', commission: '€15-30' },
  ],
  nebenkosten: [
    { name: 'Mineko (NK-Prüfung)', type: 'service', url: '...', commission: '€25-50' },
  ],
  mietminderung: [
    { name: 'MyHammer (Handwerker)', type: 'service', url: '...', commission: '€10-25' },
  ],
  // Rechner → Partner
  kaufnebenkosten: [
    { name: 'Interhyp Baufinanzierung', type: 'finance', url: '...', commission: '€100-300' },
    { name: 'Dr. Klein', type: 'finance', url: '...', commission: '€80-250' },
  ],
  rendite: [
    { name: 'ImmoScout24 Plus', type: 'service', url: '...', commission: '€5-15' },
  ],
  eigenkapital: [
    { name: 'Check24 Festgeld', type: 'finance', url: '...', commission: '€20-50' },
  ],
};
```

**Aufgaben:**
1. [ ] Affiliate-Partner recherchieren und Programme beantragen
2. [ ] `AffiliateCard.tsx` Komponente erstellen (responsive, mit Tracking)
3. [ ] `affiliate-config.ts` mit Partner-URLs befüllen
4. [ ] Supabase-Tabelle `affiliate_clicks` anlegen
5. [ ] AffiliateCard in alle Checker-Ergebnis-Seiten einbauen
6. [ ] AffiliateCard in alle Rechner-Ergebnis-Seiten einbauen
7. [ ] A/B-Test-Infrastruktur für Platzierungen

---

### 1.2 SEO-Grundlagen

**Dateien zu erstellen/ändern:**
- `public/sitemap.xml` — Statische Sitemap
- `public/robots.txt` — Crawler-Anweisungen
- `index.html` — Basis-Meta-Tags
- Alle Seiten-Komponenten — Page-spezifische Meta-Tags via react-helmet

**Sitemap-Inhalt (28+ URLs):**
```xml
<!-- Hauptseiten -->
<url><loc>https://portal.fintutto.cloud/</loc><priority>1.0</priority></url>
<url><loc>https://portal.fintutto.cloud/rechner</loc><priority>0.9</priority></url>
<url><loc>https://portal.fintutto.cloud/checker</loc><priority>0.9</priority></url>
<url><loc>https://portal.fintutto.cloud/formulare</loc><priority>0.9</priority></url>
<url><loc>https://portal.fintutto.cloud/preise</loc><priority>0.8</priority></url>

<!-- 7 Rechner -->
<url><loc>https://portal.fintutto.cloud/rechner/kaution</loc></url>
<url><loc>https://portal.fintutto.cloud/rechner/mieterhoehung</loc></url>
<!-- ... alle 7 -->

<!-- 10 Checker -->
<url><loc>https://portal.fintutto.cloud/checker/mietpreisbremse</loc></url>
<!-- ... alle 10 -->

<!-- 10 Formulare -->
<url><loc>https://portal.fintutto.cloud/formulare/mietvertrag</loc></url>
<!-- ... alle 10 -->
```

**Aufgaben:**
1. [ ] `sitemap.xml` erstellen mit allen 28+ Tool-URLs
2. [ ] `robots.txt` erstellen
3. [ ] `react-helmet-async` installieren
4. [ ] Basis-Meta-Tags in `index.html` ergänzen
5. [ ] Jeder Seite individuelle Title/Description/OG-Tags geben
6. [ ] JSON-LD Structured Data für Rechner (SoftwareApplication)
7. [ ] Canonical URLs setzen

---

### 1.3 Newsletter-Signup

**Dateien zu erstellen/ändern:**
- `src/components/monetization/NewsletterSignup.tsx` — Formular-Komponente
- `src/components/layout/Footer.tsx` — Newsletter einbinden
- `api/newsletter-subscribe.ts` — Vercel-Funktion
- Supabase: `newsletter_subscribers` Tabelle

**Aufgaben:**
1. [ ] `newsletter_subscribers` Tabelle in Supabase erstellen
2. [ ] `NewsletterSignup.tsx` Komponente (E-Mail + Segment-Auswahl)
3. [ ] `/api/newsletter-subscribe.ts` API-Endpoint
4. [ ] Double-Opt-In E-Mail via Resend
5. [ ] Im Footer einbauen
6. [ ] Auf Ergebnisseiten als CTA einbauen

---

### 1.4 AdSense-Integration

**Dateien zu erstellen/ändern:**
- `src/components/monetization/AdSlot.tsx` — Werbeplatz-Komponente
- `src/hooks/useAdVisibility.ts` — Zeigt Ads nur für Free-User
- Hub-Seiten — AdSlots einbinden

**Aufgaben:**
1. [ ] Google AdSense Account beantragen
2. [ ] `AdSlot.tsx` Komponente (responsive, mit Tier-Prüfung)
3. [ ] `useAdVisibility.ts` Hook (prüft User-Tier)
4. [ ] AdSlots auf Hub-Seiten einbauen
5. [ ] "Werbefrei mit Premium" als Upgrade-Argument auf Pricing-Seite

---

### 1.5 Einmalkauf-Optionen

**Dateien zu erstellen/ändern:**
- `src/components/monetization/OneTimePurchase.tsx` — Kauf-Button
- `api/create-checkout-session.ts` — Erweitern um Einmalkauf-Modus
- Supabase: `one_time_purchases` Tabelle

**Produkte:**
- PDF-Export (einzeln): €1.99
- Komplett-Checker-Analyse: €9.99
- AI-Rechtsgutachten: €4.99

**Aufgaben:**
1. [ ] Stripe Products/Prices für Einmalkäufe anlegen
2. [ ] `create-checkout-session.ts` um `mode: 'payment'` erweitern
3. [ ] `OneTimePurchase.tsx` Komponente
4. [ ] Supabase-Tabelle für Einmalkäufe
5. [ ] Auf Ergebnisseiten einbauen (Alternative zum Abo)

---

## Phase 2: Wachstumshebel — Übersicht

### 2.1 Lead-Vermittlung
- Anwalts-Netzwerk aufbauen (PLZ-basiert)
- Lead-Formular nach Checker-Ergebnissen
- Automatische E-Mail an Partneranwalt
- Revenue-Dashboard für Lead-Tracking

### 2.2 Blog/Ratgeber
- 10 Kern-Artikel zu häufigsten Mietrecht-Themen
- Jeder Artikel verlinkt auf passenden Checker/Rechner
- AI-gestützte Erstellung (Claude API bereits vorhanden)
- SSR/Prerendering für SEO-Indexierung

### 2.3 Domain-Landing-Pages
- Separate Landing Pages pro Domain
- Personalisierte Inhalte basierend auf Domain
- UTM-Tracking für Traffic-Quellen

---

## Abhängigkeiten und Reihenfolge

```
[1.2 SEO] ─────────────┐
                        ├──→ [2.2 Blog] ──→ [2.3 Domains]
[1.3 Newsletter] ──────┘

[1.1 Affiliate] ──────────→ [2.1 Lead-Vermittlung]

[1.4 AdSense] ─────────── (unabhängig)

[1.5 Einmalkauf] ─────── (unabhängig)
```

---

## Revenue-Tracking Dashboard

Für die Überwachung aller Monetarisierungskanäle wird ein Admin-Dashboard benötigt:

```
Dashboard: /admin/revenue
├── Abo-Einnahmen (Stripe)
├── Einmalkäufe (Stripe)
├── Affiliate-Clicks & Conversions
├── Lead-Vermittlungen & Revenue
├── AdSense-Einnahmen
├── Newsletter-Subscriber
└── Traffic-Quellen (Domains)
```

Dieses Dashboard kann auf dem bestehenden `admin-hub` App aufbauen.
