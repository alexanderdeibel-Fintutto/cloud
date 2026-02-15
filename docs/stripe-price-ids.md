# Stripe Price IDs - Fintutto Ecosystem

Erstellt: 2026-02-14 | Aktualisiert: 2026-02-15
Stripe Account: alexanderdeibel (Live Mode)
Waehrung: EUR (ueberall!)
Jahresrabatt: einheitlich 20%
Referral: 1 Monat gratis fuer BEIDE Seiten (alle Apps)

---

## Status-Legende

- LIVE = IDs in Stripe UND im Code eingetragen
- STRIPE = IDs in Stripe erstellt, aber NICHT im Code
- FEHLT = Noch nicht in Stripe angelegt
- AKTION = Manuelle Aktion noetig

---

## 1. Fintutto Checker (Root App)

> Datei: `src/lib/stripe.ts` | Status: **LIVE**

| Plan | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-------|------|-----------------|-----------------|--------|
| Kostenlos | 0 | 0 | - | - | LIVE |
| Basis | 0.99 | 9.99* | `price_1Sxc4652lqSgjCzeEKVlLxwP` | `price_1Sxc4652lqSgjCzeoHFU2Ykn` | LIVE |
| Premium | 3.99 | 39.99* | `price_1Sxc4752lqSgjCzeRlMLZeP5` | `price_1Sxc4752lqSgjCzeC971KXL0` | LIVE |

*Hinweis: Jahresrabatt ist ~16% statt 20%. Korrekt waere 9.50/38.30. Bestehende Stripe-Preise belassen.

---

## 2. Fintutto Portal

> Datei: `apps/fintutto-portal/src/lib/credits.ts` | Status: **LIVE**

| Plan | Product ID | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | - | LIVE |
| Mieter | `prod_Tyl740qtOKFOS1` | 4.99 | 47.90 | `price_1T0nam52lqSgjCzeLc4nwtU9` | `price_1T0nan52lqSgjCzeKAqlJZPj` | LIVE |
| Vermieter | `prod_Tyl7EGSeoyiJEa` | 9.99 | 95.90 | `price_1T0nao52lqSgjCzetPewfsjU` | `price_1T0nao52lqSgjCzeoV4eJgnf` | LIVE |
| Kombi Pro | `prod_Tyl7mCJsrNhSmu` | 14.99 | 143.90 | `price_1T0nap52lqSgjCzeCHEbHAQY` | `price_1T0nap52lqSgjCzeWpSag5oS` | LIVE |
| Unlimited | `prod_Tyl7CBK9vGm7VX` | 24.99 | 239.90 | `price_1T0naq52lqSgjCzeQssqWiUG` | `price_1T0nar52lqSgjCzeby3QG2EB` | LIVE |

---

## 3. Vermieter-Portal

> Datei: `apps/vermieter-portal/src/lib/credits.ts` | Status: **LIVE**

| Plan | Product ID | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | - | LIVE |
| Starter | `prod_Tyl7cbifQLDROW` | 2.99 | 28.70 | `price_1T0nas52lqSgjCzexI8LixAK` | `price_1T0nas52lqSgjCzeHgR61lIm` | LIVE |
| Pro | `prod_Tyl7jm5nUl3jAM` | 7.99 | 76.70 | `price_1T0nat52lqSgjCzeAgmYPn2r` | `price_1T0nat52lqSgjCzeb2W8OvFu` | LIVE |
| Unlimited | `prod_Tyl7Sn9YTCILXf` | 14.99 | 143.90 | `price_1T0nau52lqSgjCzeX6l8caP5` | `price_1T0nau52lqSgjCzeGwN7tWuo` | LIVE |

---

## 4. BescheidBoxer

> Datei: `src/lib/credits.ts` | Status: **AKTION NOETIG**

| Plan | Product ID | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|-----------------|--------|
| Schnupperer | - | 0 | 0 | - | - | LIVE |
| Starter | `prod_Tyl7aOOdqasfx2` | 2.99 | 28.70 | `price_1T0nav52lqSgjCzezfeyYiwy` | `price_1T0naw52lqSgjCzeZU9otXyg` | STRIPE |
| Kaempfer | `prod_Tyl7oK51M83p1a` | 4.99 | 47.90 | `price_1T0nax52lqSgjCzeELDbmrUQ` | `price_1T0nax52lqSgjCzecXnrSRr0` | STRIPE |
| Vollschutz | `prod_Tyl7tKhfT3tb3T` | 7.99 | 76.70 | `price_1T0nay52lqSgjCzexKgGvJkS` | `price_1T0nay52lqSgjCzeHLGLpsuu` | STRIPE |

**Credit Packages (Einmalkauf):**

| Package | Product ID | Price ID | Status |
|---------|-----------|----------|--------|
| 10 Credits (4.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0naz52lqSgjCzeYuBqo0na` | STRIPE |
| 25 Credits (9.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0naz52lqSgjCzeJUXiFb19` | STRIPE |
| 50 Credits (17.99) | `prod_Tyl7qhZ5yRGRyX` | `price_1T0nb052lqSgjCzeyUSt1hL6` | STRIPE |

**TODO:**
- [ ] Price IDs in `src/lib/credits.ts` eintragen
- [ ] Jahrespreise im Code von 29.99/49.99/79.99 auf 28.70/47.90/76.70 korrigieren (20% Rabatt)
- [ ] Referral: Gamification-Punkte durch 1 Monat Kaempfer gratis ersetzen

---

## 5. Financial Compass

> Datei: `src/hooks/useSubscription.ts` | Status: **AKTION NOETIG**
> Bestehende Monthly IDs im Code: Basic `price_1Szr9X52lqSgjCzeFZ88yFlw`, Pro `price_1Szr9Z52lqSgjCzeY83WUERb`

| Plan | Product ID | Monat | Jahr | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | LIVE |
| Basic | `prod_TxmipPdak8JwmT` | 9.99 | 95.90 | `price_1T0nb052lqSgjCzeR8a7rmP1` | STRIPE (yearly nicht im Code) |
| Pro | `prod_Txmjs0RZOVqFzS` | 19.99 | 191.90 | `price_1T0nb152lqSgjCze1ae7RGdJ` | STRIPE (yearly nicht im Code) |

**TODO:**
- [ ] Yearly Price IDs in `src/hooks/useSubscription.ts` eintragen
- [ ] Jahresbilling-Toggle in UI einbauen

---

## 6. Mieter App

> Datei: `src/hooks/useSubscription.ts` | Status: **KRITISCH**

| Plan | Product ID | SOLL Monat | SOLL Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-----------|----------|-----------------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | - | LIVE |
| Basic | `prod_Tyl7nP8RIZYiKg` | **4.99 EUR** | 47.90 | `price_1T0nb152lqSgjCzePj9k35h4` | `price_1T0nb252lqSgjCzeKthcl46U` | STRIPE |
| Pro | `prod_Tyl7B6nLP9waBf` | **9.99 EUR** | 95.90 | `price_1T0nb352lqSgjCzennX9j9dE` | `price_1T0nb352lqSgjCzejpncsetw` | STRIPE |

**KRITISCH:**
- [ ] USD ($9.99/$19.99) -> EUR (4.99/9.99) umstellen
- [ ] Alte USD Price IDs (`price_1SsEqV...`, `price_1SsEr5...`) durch neue EUR IDs ersetzen
- [ ] Yearly Price IDs eintragen
- [ ] Referral: 2 Credits -> 1 Monat Basic gratis

---

## 7. HausmeisterPro

> Datei: `src/config/pricing.ts` | Status: **AKTION NOETIG**

| Plan | Product ID | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | - | LIVE |
| Starter | - | 9.99 | 95.90 | `price_1St3Eg52lqSgjCze5l6pqANG` | - | FEHLT (yearly) |
| Pro | - | 24.99 | 239.90 | `price_1St3FA52lqSgjCzeE8lXHzKH` | - | FEHLT (yearly) |
| Enterprise | `prod_Tyl7SUTeiUkUYa` | 49.99 | 479.90 | `price_1T0nb452lqSgjCzeKfvkna7n` | `price_1T0nb552lqSgjCzelBBrkq6c` | STRIPE |

**TODO:**
- [ ] Yearly Prices in Stripe fuer Starter und Pro anlegen
- [ ] Enterprise-Tier im Code hinzufuegen
- [ ] Alle IDs in `src/config/pricing.ts` eintragen

---

## 8. Vermieter-Freude (Vermietify)

> Datei: `src/config/plans.ts` | Status: **KRITISCH**

| Plan | SOLL Monat | SOLL Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|----------|-----------------|-----------------|--------|
| Starter (Free) | 0 | 0 | `price_1Sr55p...` | - | LIVE (monthly) |
| Basic | 9.99 | 95.90 | `price_1Sr56K...` | - | FEHLT (yearly) |
| Pro | 24.99 | 239.90 | `price_1Sr56o...` | - | FEHLT (yearly) |
| Enterprise | 49.99 | 479.90 | `price_1Sr57E...` | - | FEHLT (yearly) |

**KRITISCH:**
- [ ] Echte Product IDs anlegen (statt prod_starter, prod_basic Platzhalter)
- [ ] Yearly Prices in Stripe anlegen
- [ ] Referral-Reward implementieren (aktuell: NICHTS)

---

## 9. Ablesung

> Datei: DB-gesteuert via sync-stripe-products | Status: **AKTION NOETIG**

| Plan | Product ID | Monat | Jahr | Monthly Price ID | Yearly Price ID | Status |
|------|-----------|-------|------|-----------------|-----------------|--------|
| Kostenlos | - | 0 | 0 | - | - | LIVE |
| Basic | `prod_SMLxFhN1UXXcpu` | 9.99 | 95.90* | - | - | AKTION |
| Pro | `prod_SMLyGowV6FLmFZ` | 24.99 | 239.90* | - | - | AKTION |
| Enterprise | `prod_Tyl7LKcRIDZWMt` | 49.99 | 479.90 | `price_1T0nb552lqSgjCzeDefCBml1` | `price_1T0nb652lqSgjCze8tE5VNcd` | STRIPE |

*Jahrespreise im Repo weichen ab (99.90/249.90 statt 95.90/239.90) - auf 20% Rabatt korrigieren

**TODO:**
- [ ] Jahrespreise auf 20% Rabatt standardisieren
- [ ] Referral: 5 EUR -> 1 Monat Basic gratis
- [ ] Cross-App Preise (Vermietify etc.) aus eigener Pricing-Tabelle entfernen

---

## Referral-Belohnung (ALLE Apps einheitlich)

| App | Referrer bekommt | Geworbener bekommt |
|-----|-----------------|-------------------|
| Checker | 1 Mo Premium gratis | 1 Mo Premium gratis |
| Portal | 1 Mo Kombi Pro gratis | 1 Mo Mieter gratis |
| Vermieter-Portal | 1 Mo Pro gratis | 1 Mo Pro gratis |
| BescheidBoxer | 1 Mo Kaempfer gratis | 1 Mo Kaempfer gratis |
| Financial Compass | 1 Mo Basic gratis | 1 Mo Basic gratis |
| Mieter App | 1 Mo Basic gratis | 1 Mo Basic gratis |
| HausmeisterPro | 1 Mo Starter gratis | 1 Mo Starter gratis |
| Vermietify | 1 Mo Basic gratis | 1 Mo Basic gratis |
| Ablesung | 1 Mo Basic gratis | 1 Mo Basic gratis |

Cross-App: Wer fuer eine andere App wirbt, bekommt den Monat in seiner eigenen App.

---

## Ecosystem-Bundles

| Bundle | Enthalten | Einzeln/mo | Bundle/mo | Bundle/yr | Rabatt |
|--------|----------|-----------|----------|----------|--------|
| Mieter Komplett | Portal Mieter + BescheidBoxer Kaempfer | 9.98 | 7.99 | 76.70 | 20% |
| Vermieter Starter | Portal Vermieter + Vermietify Basic | 19.98 | 14.99 | 143.90 | 25% |
| Vermieter Pro | Portal Kombi + Vermietify Pro + Ablesung Basic | 49.97 | 34.99 | 335.90 | 30% |
| Hausverwaltung | Portal Unlim + Vermietify Ent + Ablesung Pro + HausmeisterPro Pro | 124.96 | 79.99 | 767.90 | 36% |

Multi-App Rabatte (automatisch): 2 Apps = 20%, 3 Apps = 25%, 4 Apps = 30%, 5+ Apps = 35%

---

## Priorisierte Aktionen

### P1 - Sofort (diese Woche)
1. Mieter App: USD -> EUR, Preise auf 4.99/9.99 EUR aendern
2. BescheidBoxer: Stripe IDs in Code eintragen
3. Financial Compass: Yearly IDs in Code eintragen
4. Vermietify: Echte Stripe Product IDs + Yearly Prices anlegen

### P2 - Bald (naechste Woche)
5. HausmeisterPro: Yearly Prices fuer Starter/Pro in Stripe anlegen
6. Ablesung: Jahrespreise auf 20% Rabatt vereinheitlichen
7. Alle Apps: Referral auf "1 Monat gratis" standardisieren

### P3 - Mittelfristig
8. Bundle Stripe Products anlegen
9. Admin-Hub: Live-Preise aus DB statt Platzhalter
