# Fintutto Ecosystem - Vollstaendiger Stripe Pricing Review

Stand: 2026-02-14 | Alle 9 Repos analysiert

---

## TEIL 1: BESTANDSAUFNAHME - Ist-Zustand je App

### 1. Fintutto Checker (Root App)
**Repo:** `fintutto-ecosystem` | **Config:** `src/lib/stripe.ts`
**Status:** LIVE - Alle IDs vorhanden

| Tier | Monat | Jahr | Stripe Monthly | Stripe Yearly |
|------|-------|------|---------------|---------------|
| Kostenlos | 0 | 0 | - | - |
| Basis | 0.99 | 9.99 | `price_1Sxc46...EKVlLxwP` | `price_1Sxc46...oHFU2Ykn` |
| Premium | 3.99 | 39.99 | `price_1Sxc47...RlMLZeP5` | `price_1Sxc47...C971KXL0` |

Referral: 1 Monat Premium gratis (beide Seiten) | Jahresrabatt: ~17%

---

### 2. Fintutto Portal
**Repo:** `fintutto-ecosystem` | **Config:** `apps/fintutto-portal/src/lib/credits.ts`
**Status:** LIVE - Alle IDs vorhanden

| Tier | Monat | Jahr | Credits/Mo | AI Msgs | Stripe IDs |
|------|-------|------|-----------|---------|------------|
| Kostenlos | 0 | 0 | 3 | 0 | - |
| Mieter | 4.99 | 47.90 | 15 | 10 | vorhanden |
| Vermieter | 9.99 | 95.90 | 20 | 20 | vorhanden |
| Kombi Pro | 14.99 | 143.90 | 50 | 50 | vorhanden |
| Unlimited | 24.99 | 239.90 | unlim. | unlim. | vorhanden |

Referral: 30 Bonus-Credits (beide) + 7 Tage Pro fuer Geworbenen | Jahresrabatt: 20%

---

### 3. Vermieter-Portal
**Repo:** `fintutto-ecosystem` | **Config:** `apps/vermieter-portal/src/lib/credits.ts`
**Status:** LIVE - Alle IDs vorhanden

| Tier | Monat | Jahr | Credits/Mo | AI Msgs |
|------|-------|------|-----------|---------|
| Kostenlos | 0 | 0 | 3 | 0 |
| Starter | 2.99 | 28.70 | 10 | 0 |
| Pro | 7.99 | 76.70 | 30 | 50 |
| Unlimited | 14.99 | 143.90 | unlim. | unlim. |

Referral: 30 Bonus-Credits (beide) + 7 Tage Pro fuer Geworbenen | Jahresrabatt: 20%

---

### 4. BescheidBoxer
**Repo:** `bescheidboxer` | **Config:** `src/lib/credits.ts`
**Status:** TEILWEISE - IDs NICHT im Code (dynamisch), aber in Stripe erstellt

| Tier | Monat (Code) | Jahr (Code) | Jahr (Stripe) | Credits/Mo |
|------|-------------|-------------|---------------|-----------|
| Schnupperer | 0 | 0 | 0 | 0 |
| Starter | 2.99 | **29.99** | **28.70** | 10 |
| Kaempfer | 4.99 | **49.99** | **47.90** | 25 |
| Vollschutz | 7.99 | **79.99** | **76.70** | 50 |

Credit Packages: 10/4.99, 25/9.99, 50/17.99
Referral: NUR Gamification-Punkte (50 Punkte) - **KEIN monetaerer Reward!**

---

### 5. Financial Compass
**Repo:** `fintutto-your-financial-compass` | **Config:** `src/hooks/useSubscription.ts`
**Status:** TEILWEISE - Monatlich live, Jaehrlich NICHT im Code

| Tier | Monat | Jahr (Stripe erstellt) | Monats-ID im Code | Jahres-ID im Code |
|------|-------|----------------------|-------------------|-------------------|
| Free | 0 | 0 | - | - |
| Basic | 9.99 | 95.90 | `price_1Szr9X...FZ88yFlw` | **FEHLT** |
| Pro | 19.99 | 191.90 | `price_1Szr9Z...Y83WUERb` | **FEHLT** |

Referral: 1 Monat gratis via Stripe Coupon `evjRLCRd` (Referrer bekommt 100% Off)

---

### 6. Mieter App
**Repo:** `mieter` | **Config:** `src/hooks/useSubscription.ts`
**Status:** PROBLEMATISCH - USD statt EUR, eigene IDs, Jahrespreise fehlen

| Tier | Monat (Code) | Waehrung | Monats-ID | Jahres-ID |
|------|-------------|----------|-----------|-----------|
| Free | 0 | $ | - | - |
| Basic | **9.99** | **USD** | `price_1SsEqV...KuUQGBOE` | **null** |
| Pro | **19.99** | **USD** | `price_1SsEr5...BvWBTzKS` | **null** |

Plus: Checker-Abo (0.99/3.99), 10 Checker-Tools, 6 Formulare, 3 Buendel
Referral: **Nur 2 Credits** fuer Referrer + 7 Tage Pro-Trial fuer Geworbenen

---

### 7. HausmeisterPro
**Repo:** `hausmeisterPro` | **Config:** `src/config/pricing.ts`
**Status:** TEILWEISE - Nur Monthly-IDs, kein Yearly in Stripe

| Tier | Monat | Jahr (UI) | Monats-ID | Jahres-ID |
|------|-------|----------|-----------|-----------|
| Free | 0 | 0 | - | - |
| Starter | **9.99** | 95.90 | `price_1St3Eg...5l6pqANG` | **FEHLT** |
| Pro | **24.99** | 239.90 | `price_1St3FA...E8lXHzKH` | **FEHLT** |

Referral: Stripe Coupon `evjRLCRd` - 100% off 1 Monat (gleicher Coupon wie Financial Compass!)

---

### 8. Vermieter-Freude (Vermietify)
**Repo:** `vermieter-freude` | **Config:** `src/config/plans.ts`
**Status:** PROBLEMATISCH - Nur Monthly-IDs, Placeholder-Produkt-IDs, kein Referral-Reward

| Tier | Monat | Jahr (UI) | Monats-ID | Jahres-ID | Produkt-ID |
|------|-------|----------|-----------|-----------|------------|
| Starter | 0 | 0 | `price_1Sr55p...X6tlI5tv` | **FEHLT** | **prod_starter** |
| Basic | 9.99 | 95.90 | `price_1Sr56K...qfCfOudX` | **FEHLT** | **prod_basic** |
| Pro | 24.99 | 239.90 | `price_1Sr56o...RuGrant2` | **FEHLT** | **prod_pro** |
| Enterprise | 49.99 | 479.90 | `price_1Sr57E...3iHixnBn` | **FEHLT** | **prod_enterprise** |

Referral: NUR Tracking, **KEIN Reward konfiguriert!**

---

### 9. Ablesung
**Repo:** `ablesung` | **Config:** Supabase DB (dynamisch via sync-stripe-products)
**Status:** EIGENES SYSTEM - Komplett DB-gesteuert, eigene Prod-IDs

| Tier | Monat | Jahr | Prod-ID |
|------|-------|------|---------|
| Zaehlerstand Basic | 9.99 | 99.90 | `prod_SMLxFhN1UXXcpu` |
| Zaehlerstand Pro | 24.99 | 249.90 | `prod_SMLyGowV6FLmFZ` |
| Business | - | - | `prod_SMLzRsOQJ8SHFw` |

Plus: Enthalt Preise fuer Vermietify (14.99/39.99), Nebenkosten (19.99), HausmeisterPro (29.99)
Referral: FT-XXXXXX Codes, **nur 5.00 EUR pro Conversion**

---

## TEIL 2: KRITISCHE PROBLEME

### PROBLEM 1: WAEHRUNGSMIX - USD vs EUR
| App | Waehrung |
|-----|----------|
| Alle anderen | **EUR** |
| Mieter App | **USD** |

**Auswirkung:** Deutsche Kunden werden in Dollar belastet. Inkonsistent, rechtlich problematisch (Preisangabenverordnung).

### PROBLEM 2: FEHLENDE JAHRESPREISE IN STRIPE
| App | Monatlich in Stripe | Jaehrlich in Stripe |
|-----|---------------------|---------------------|
| Fintutto Checker | vorhanden | vorhanden |
| Fintutto Portal | vorhanden | vorhanden |
| Vermieter-Portal | vorhanden | vorhanden |
| BescheidBoxer | **nicht im Code** | **nicht im Code** |
| Financial Compass | vorhanden | **FEHLT im Code** |
| Mieter App | vorhanden | **FEHLT komplett** |
| HausmeisterPro | vorhanden | **FEHLT komplett** |
| Vermieter-Freude | vorhanden | **FEHLT komplett** |
| Ablesung | dynamisch | dynamisch |

**5 von 9 Apps** koennen kein Jahresabo abschliessen!

### PROBLEM 3: PREISKONFLIKTE FUER GLEICHE PERSONAS

**Mieter-Persona:**
| App | Was er zahlt | Fuer was |
|-----|-------------|----------|
| Checker | 0.99-3.99/mo | 10 Mieter-Checker |
| Portal (Mieter-Tier) | **4.99/mo** | Checker + Formulare + 15 Credits |
| Mieter App | **$9.99/mo** | Dashboard + Docs + Support |
| BescheidBoxer | **2.99-7.99/mo** | Bescheid-Analyse + Briefe |

Ein Mieter der alles will zahlt: 4.99 + 9.99 + 2.99 = **~18 EUR/mo minimum** fuer das Oekosystem.

**Vermieter-Persona:**
| App | Was er zahlt | Fuer was |
|-----|-------------|----------|
| Portal (Vermieter-Tier) | **9.99/mo** | Rechner + Formulare + 20 Credits |
| Vermieter-Portal | **2.99-14.99/mo** | Vermieter-spez. Rechner |
| Vermietify | **9.99-49.99/mo** | Immo-Verwaltung |
| HausmeisterPro | **9.99-24.99/mo** | Hausmeister-Koordination |
| Ablesung | **9.99-24.99/mo** | Zaehlerstaende |

Ein Vermieter der alles will zahlt: 9.99 + 7.99 + 24.99 + 24.99 + 24.99 = **~93 EUR/mo** - das ist VIEL.

### PROBLEM 4: PREISLICHE UEBERLAPPUNG & KANNIBALISIERUNG

| Preispunkt 9.99/mo | Apps |
|---------------------|------|
| Fintutto Portal Vermieter | 9.99 |
| Mieter App Basic | 9.99 ($) |
| Vermietify Basic | 9.99 |
| HausmeisterPro Starter | 9.99 |
| Ablesung Basic | 9.99 |

**5 verschiedene Apps zum gleichen Preis** - der Kunde weiss nicht welche er braucht.

### PROBLEM 5: JAHRESRABATT INKONSISTENT

| App | Rabatt-Formel | Effektiver Rabatt |
|-----|--------------|-------------------|
| Checker | ~17% | 0.99*12=11.88 vs 9.99 = **16%** |
| Portal | Preis*0.8*12/12 | exakt **20%** |
| Vermieter-Portal | Preis*0.8*12/12 | exakt **20%** |
| BescheidBoxer (Code) | eigene Preise | Starter: **16%**, Kaempfer: **17%**, Vollschutz: **17%** |
| BescheidBoxer (Stripe) | 20% Formel | exakt **20%** |
| Financial Compass | 9.99*12*0.8=95.90 | exakt **20%** |
| Mieter App | Null | **kein Jahresabo** |
| HausmeisterPro | UI: 95.90 fuer 9.99 | exakt **20%** |
| Vermietify | UI: 95.90 fuer 9.99 | exakt **20%** |
| Ablesung | 99.90 fuer 9.99 | **17%** |

Mischung aus 16%, 17% und 20% - sollte einheitlich 20% sein.

### PROBLEM 6: REFERRAL-PROGRAMM KOMPLETT INKONSISTENT

| App | Referrer bekommt | Geworbener bekommt |
|-----|-----------------|-------------------|
| Checker | 1 Mo Premium gratis | 1 Mo Premium gratis |
| Portal | 30 Credits | 30 Credits + 7d Pro |
| Vermieter-Portal | 30 Credits | 30 Credits + 7d Pro |
| BescheidBoxer | **50 Gamification-Punkte** | **Nichts** |
| Financial Compass | 1 Mo gratis | **Nichts explizit** |
| Mieter App | **2 Credits** | 7d Pro Trial |
| HausmeisterPro | 1 Mo gratis | 1 Mo gratis (Coupon) |
| Vermietify | **NICHTS** | **NICHTS** |
| Ablesung | **5 EUR Gutschrift** | **Nichts** |

---

## TEIL 3: PERSONA-BASIERTE PREISANALYSE

### Persona 1: Mieter Max (Student, 24, wenig Geld)
**Schmerzgrenze:** ~10 EUR/mo
**Braucht:** Mietpreischeck, NK-Pruefung, Maengelanzeige, evtl. Bescheidboxer

| Empfehlung | Produkt | Preis |
|------------|---------|-------|
| Einstieg | Checker Basis | 0.99/mo |
| Upgrade | Portal Mieter | 4.99/mo |
| Vollschutz | Portal Kombi Pro | 14.99/mo |

**Bewertung:** 4.99/mo fuer den Mieter-Tier im Portal ist FAIR und gut positioniert. Reicht fuer die meisten Mieter.
**Problem:** Die separate Mieter App mit $9.99/mo ist DOPPELT so teuer fuer aehnliche Features.

### Persona 2: Vermieter Vera (3 Wohnungen, Nebenjob)
**Schmerzgrenze:** ~30 EUR/mo
**Braucht:** NK-Abrechnung, Zaehler, Mietvertraege, Formulare

| Empfehlung | Produkt | Preis |
|------------|---------|-------|
| Einstieg | Vermieter-Portal Starter | 2.99/mo |
| Upgrade | Portal Vermieter + Vermietify Basic | 9.99 + 9.99 = 19.98/mo |
| Alles | Portal Kombi + Vermietify Pro | 14.99 + 24.99 = 39.98/mo |

**Bewertung:** Bis 20 EUR/mo akzeptabel. Aber Vermietify Pro + Ablesung + HausmeisterPro = 75 EUR - zu viel.
**Empfehlung:** Bundle-Rabatt fuer mehrere Apps zwingend noetig.

### Persona 3: Hausverwaltung Hans (50+ Einheiten, Profi)
**Schmerzgrenze:** ~100-200 EUR/mo
**Braucht:** ALLES - Vermietify Enterprise, Ablesung Pro, HausmeisterPro

| Produkt | Preis |
|---------|-------|
| Vermietify Enterprise | 49.99/mo |
| Ablesung Pro | 24.99/mo |
| HausmeisterPro Pro | 24.99/mo |
| Portal Unlimited | 24.99/mo |
| **Gesamt** | **124.96/mo** |

**Bewertung:** Fuer eine Hausverwaltung OK, aber es fehlt ein "Ecosystem Unlimited" Bundle.

---

## TEIL 4: EMPFEHLUNGEN

### A) SOFORT-FIXES (Kritisch)

1. **Mieter App: USD -> EUR aendern** - Rechtlich notwendig fuer DE-Markt
2. **Jahrespreise in Stripe erstellen** fuer: Financial Compass, Mieter App, HausmeisterPro, Vermietify
3. **BescheidBoxer Jahrespreise angleichen** - Code sagt 29.99/49.99/79.99, Stripe hat 28.70/47.90/76.70 -> einheitlich auf 20% Rabatt
4. **Vermietify: Echte Produkt-IDs** statt prod_starter/prod_basic Platzhalter
5. **Stripe Price IDs in alle Repos eintragen** - BescheidBoxer, Financial Compass (yearly), Mieter App (yearly)

### B) PREISANPASSUNGEN (Wichtig)

6. **Mieter App Preise senken:** $9.99 -> 4.99 EUR (Basic), $19.99 -> 9.99 EUR (Pro)
   - Grund: Mieter-Persona hat wenig Budget, Portal bietet aehnliches fuer 4.99
   - Alternativ: Mieter App als Teil des Portal-Mieter-Tiers anbieten

7. **Einheitlicher Jahresrabatt: 20%** ueberall
   - Checker: 0.99*12*0.8 = 9.50/yr (statt 9.99) oder 9.99 beibehalten (runder)
   - Ablesung: 9.99*12*0.8 = 95.90/yr (statt 99.90)

8. **HausmeisterPro Enterprise hinzufuegen:** 49.99/mo (wie Vermietify)
   - Fuer Hausverwaltungen mit 50+ Einheiten

### C) REFERRAL-PROGRAMM VEREINHEITLICHEN (Dringend)

9. **Mindest-Reward: 1 Monat Pro-Tier gratis** (beide Seiten)

   | App | Referrer | Geworbener |
   |-----|---------|------------|
   | Checker | 1 Mo Premium | 1 Mo Premium |
   | Portal | 1 Mo naechsthoehere Stufe | 1 Mo Mieter gratis |
   | Vermieter-Portal | 1 Mo Pro | 1 Mo Pro |
   | BescheidBoxer | **1 Mo Kaempfer** (statt 50 Punkte) | **1 Mo Kaempfer** |
   | Financial Compass | 1 Mo gratis | **1 Mo Basic gratis** |
   | Mieter App | **1 Mo Pro** (statt 2 Credits) | 1 Mo Pro |
   | HausmeisterPro | 1 Mo gratis | 1 Mo gratis |
   | Vermietify | **1 Mo gratis** (statt nichts) | **1 Mo gratis** |
   | Ablesung | **1 Mo gratis** (statt 5 EUR) | **1 Mo gratis** |

10. **Cross-App Referral:** Wer einen Freund fuer eine ANDERE App wirbt, bekommt 1 Monat in SEINER App gratis
    - Maximiert Oekosystem-Wachstum
    - Bereits in Ablesung angelegt (Cross-Sell Triggers)

### D) BUNDLE-STRATEGIE (Mittelfristig)

11. **Ecosystem-Bundles einfuehren:**

   | Bundle | Enthalten | Einzeln | Bundle-Preis | Rabatt |
   |--------|----------|---------|-------------|--------|
   | **Mieter Komplett** | Portal Mieter + BescheidBoxer Kaempfer | 9.98 | **7.99/mo** | 20% |
   | **Vermieter Starter** | Portal Vermieter + Vermietify Basic | 19.98 | **14.99/mo** | 25% |
   | **Vermieter Pro** | Portal Kombi + Vermietify Pro + Ablesung Basic | 49.97 | **34.99/mo** | 30% |
   | **Hausverwaltung** | Portal Unlim + Vermietify Ent + Ablesung Pro + HausmeisterPro Pro | 124.96 | **79.99/mo** | 36% |

   Bereits in der DB angelegt: Duo (15%), Trio (20%), Ecosystem (25%) - aber Preise muessen attraktiver.

### E) WAS IST WIRKLICH LIVE?

| App | Monatlich abschliessbar | Jaehrlich abschliessbar | Referral funktioniert |
|-----|------------------------|------------------------|----------------------|
| Checker | JA | JA | JA |
| Portal | JA | JA | JA (Credits) |
| Vermieter-Portal | JA | JA | JA (Credits) |
| BescheidBoxer | UNKLAR (IDs nicht im Code) | NEIN | NEIN (nur Punkte) |
| Financial Compass | JA | NEIN (ID fehlt im Code) | JA (Coupon) |
| Mieter App | JA (aber USD!) | NEIN | MINIMAL (2 Credits) |
| HausmeisterPro | JA | NEIN | JA (Coupon) |
| Vermietify | JA | NEIN | NEIN |
| Ablesung | JA (dynamisch) | JA (dynamisch) | JA (5 EUR) |

**Fazit: Nur 3 von 9 Apps sind vollstaendig live** (Checker, Portal, Vermieter-Portal).

---

## TEIL 5: PRIORISIERTE AKTIONSLISTE

### Prioritaet 1 - Diese Woche
- [ ] Mieter App: USD -> EUR umstellen
- [ ] Jahres-Price-IDs erstellen & eintragen: Financial Compass, Mieter App, HausmeisterPro, Vermietify
- [ ] BescheidBoxer: Stripe Price IDs in den Code eintragen
- [ ] Vermietify: Echte Stripe Product IDs anlegen
- [ ] Jahresrabatt einheitlich auf 20% setzen

### Prioritaet 2 - Naechste Woche
- [ ] Referral-Reward in ALLEN Apps auf "1 Monat gratis (beide)" standardisieren
- [ ] Mieter App Preise: $9.99/$19.99 -> 4.99/9.99 EUR
- [ ] Cross-App Referral in allen Apps aktivieren
- [ ] Ablesung: Eigene Preise harmonisieren mit Ecosystem

### Prioritaet 3 - Diesen Monat
- [ ] Bundle-Preise definieren und in Stripe anlegen
- [ ] Ecosystem-Unlimited Tier einfuehren (79.99/mo)
- [ ] HausmeisterPro Enterprise Tier (49.99/mo) hinzufuegen
- [ ] Admin-Hub: Live-Preise aus Stripe anzeigen statt Platzhalter
