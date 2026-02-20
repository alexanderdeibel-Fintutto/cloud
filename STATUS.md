# Fintutto Ecosystem - Status & Ausfuehrungsplan

Stand: 2026-02-20

---

## P1: Stripe Pricing Gaps fixen - ERLEDIGT (Code), OFFEN (Stripe API)

### Was bereits gepusht wurde (Patches applied):
| App | Patch | Status |
|-----|-------|--------|
| BescheidBoxer | Stripe Price IDs fuer alle Plans + Credit Packages | PUSHED to main |
| Financial Compass | Yearly Stripe Price IDs fuer Basic + Pro | PUSHED to main |
| Mieter | USD->EUR + neue Stripe IDs + Yearly | PUSHED to main |
| HausmeisterPro | Enterprise Tier + Yearly Pricing | PUSHED to main |
| Vermieter-Freude | Yearly Felder + Placeholder Product IDs | PUSHED to main |

### Was noch fehlt (User-Aktion):
- [ ] **Vermietify Stripe Products erstellen**: `STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p1-vermietify-stripe-setup.sh`
  - Erstellt 4 Products (Starter, Basic, Pro, Enterprise) mit Monthly + Yearly Prices
  - Danach: IDs in `vermieter-freude/src/config/plans.ts` eintragen + pushen

---

## P2: Yearly Prices + Referral Standardisierung - TEILWEISE ERLEDIGT

### Referral: ERLEDIGT
- `api/stripe-webhook.ts` hat bereits einheitliches Referral-System:
  - 1 Monat gratis fuer BEIDE Seiten (Werber + Geworbener)
  - Cross-App Support (Referrer bekommt Reward in seiner eigenen App)
  - Automatische Stripe Coupon-Erstellung (100% off, 1x einloesbar)
  - Alle 9 Apps konfiguriert mit Tier-Mapping

### Was noch fehlt (User-Aktion):
- [ ] **HausmeisterPro Yearly Prices**: `STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p2-remaining-stripe-prices.sh`
  - Erstellt Yearly Prices fuer Starter (95.90/yr) und Pro (239.90/yr)
  - Danach: IDs in `hausmeisterPro/src/config/pricing.ts` eintragen + pushen
- [ ] **Ablesung DB Migration**: `./scripts/apply-ablesung-patch.sh`
  - Korrigiert Yearly-Preise auf 20% Rabatt (99.90->95.90, 249.90->239.90)
  - Fuegt Enterprise-Tiers hinzu fuer Ablesung + HausmeisterPro
  - Danach: `cd ~/ablesung && supabase db push`

---

## P3: Fintutto-Portal deployen - BEREIT

### Vorbereitet:
- `apps/fintutto-portal/vercel.json` konfiguriert (Build, Output, Framework)
- `.env.example` vorhanden
- Supabase-Client nutzt env vars (mit Fallback)
- 4 Environment Variables:
  - `VITE_SUPABASE_URL` (hat Fallback)
  - `VITE_SUPABASE_ANON_KEY` (MUSS gesetzt werden)
  - `VITE_FORMULARE_APP_URL` (optional, Default: formulare.fintutto.cloud)
  - `VITE_CLAUDE_API_ENDPOINT` (optional, Default: /api/ai/advice)

### Was noch fehlt (User-Aktion):
- [ ] **Vercel Env Vars setzen**: `VITE_SUPABASE_ANON_KEY` im Team-Level
- [ ] **Deploy ausfuehren**: `./scripts/p3-deploy-portal.sh`
- [ ] **Custom Domain**: `portal.fintutto.cloud` in Vercel + DNS CNAME

---

## P4: Repos archivieren + Vercel aufraumen - BEREIT

### Script erstellt:
- `./scripts/p4-archive-repos.sh` archiviert 19 Repos (reversibel!)

### Was noch fehlt (User-Aktion):
- [ ] **GitHub Repos archivieren**: `./scripts/p4-archive-repos.sh`
  - 10 Duplikate (miet-check-pro, vermietify alt, etc.)
  - 9 Legacy ft_* Repos (ft_vermietify, ft_mieter, etc.)
- [ ] **Vercel Projekte loeschen** (manuell im Dashboard):
  - ft-nebenkostenabrechnung, ft-nebenkostenabrechnung-vrju
  - ft-formulare-alle, x_mieter, command-center
  - SPAETER: portal-vermieter, portal-mieter (erst nach Portal-Deploy)

---

## P5: Langfristig - Bundles + Integration

### Bundle-Script erstellt:
- `./scripts/p5-create-bundles.sh` erstellt 4 Bundle-Produkte in Stripe

### Bundles:
| Bundle | Enthalten | Preis/mo | Preis/yr | Rabatt |
|--------|----------|----------|----------|--------|
| Mieter Komplett | Portal Mieter + BescheidBoxer | 7.99 | 76.70 | 20% |
| Vermieter Starter | Portal Vermieter + Vermietify Basic | 14.99 | 143.90 | 25% |
| Vermieter Pro | Portal Kombi + Vermietify Pro + Ablesung | 34.99 | 335.90 | 30% |
| Hausverwaltung | Portal Unlim + Vermietify Ent + Ablesung + HMP | 79.99 | 767.90 | 36% |

### Vermietify Integration (groesstes offenes Thema):
- Aktuell: 16 von 631 Seiten fertig (~2.5%)
- Design-Lead: `vermieter-freude` (Lovable) - optisch gut
- Feature-Referenz: `ft_vermietify` (Legacy) - 631 Seiten Logik
- Backend-Logik: `apps/vermietify` (Lokal) - React Query + Supabase

**Strategie**: Lovable-Design beibehalten, Backend-Logik schrittweise integrieren:
1. Dashboard + Properties (Kern-CRUD)
2. Mietermanagement + Dokumente
3. Finanzen + NK-Abrechnung
4. Formulare (aus ft_fromulare_alle)
5. KI-Assistent + Automatisierungen

### Admin-Hub Live-Preise:
- Aktuell: Hardcoded Platzhalter-Preise
- Ziel: Live aus Supabase products-Tabelle oder Stripe API lesen
- Abhaengig von: Ablesung DB Migration (P2)

---

## Quick-Start: Alle Scripts ausfuehren

```bash
# P1: Vermietify Stripe Products erstellen
STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p1-vermietify-stripe-setup.sh

# P2: HausmeisterPro Yearly + Ablesung Migration
STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p2-remaining-stripe-prices.sh
./scripts/apply-ablesung-patch.sh
cd ~/ablesung && supabase db push

# P3: Portal deployen
./scripts/p3-deploy-portal.sh

# P4: Repos archivieren
./scripts/p4-archive-repos.sh

# P5: Bundles erstellen
STRIPE_SECRET_KEY=sk_live_xxx ./scripts/p5-create-bundles.sh
```

---

## Zusammenfassung: Was ist LIVE vs was fehlt

| App | Monthly | Yearly | Referral | IDs im Code |
|-----|---------|--------|----------|-------------|
| Fintutto Checker | LIVE | LIVE | LIVE | LIVE |
| Fintutto Portal | LIVE | LIVE | LIVE | LIVE |
| Vermieter-Portal | LIVE | LIVE | LIVE | LIVE |
| BescheidBoxer | LIVE | LIVE | LIVE (Webhook) | LIVE (Patch) |
| Financial Compass | LIVE | LIVE (Patch) | LIVE (Webhook) | LIVE (Patch) |
| Mieter App | LIVE (EUR, Patch) | LIVE (Patch) | LIVE (Webhook) | LIVE (Patch) |
| HausmeisterPro | LIVE | OFFEN (Script) | LIVE (Webhook) | LIVE (Patch) |
| Vermietify | LIVE | OFFEN (Script) | LIVE (Webhook) | Placeholder |
| Ablesung | LIVE (DB) | OFFEN (Migration) | LIVE (Webhook) | DB-gesteuert |

**Fazit: 6/9 Apps voll live, 3 brauchen noch Stripe-Aktionen (User muss Scripts ausfuehren)**
