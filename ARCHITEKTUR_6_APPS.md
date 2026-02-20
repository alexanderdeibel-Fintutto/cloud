# Fintutto Ökosystem: 6-App-Architektur

*Finale Konsolidierungsstrategie - Stand: 09.02.2026*

---

## Die 6 Apps

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINTUTTO ÖKOSYSTEM                                  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  1. FINTUTTO  │  │ 2. VERMIETIFY│  │  3. ZÄHLER   │  │  4. MIETER   │   │
│  │   (Firma)    │  │  (Vermieter) │  │  (Ablesung)  │  │  (Mieter)    │   │
│  │              │  │              │  │              │  │              │   │
│  │ Website +    │  │ Komplett-App │  │ Zähler-      │  │ Portal für   │   │
│  │ Buchhaltung  │  │ Immobilien-  │  │ erfassung &  │  │ Mieter:      │   │
│  │ + Banking    │  │ verwaltung   │  │ Auswertung   │  │ Mängel, Dok, │   │
│  │ + Steuern    │  │              │  │              │  │ Chat, Zähler │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────┐     │
│  │     5. FINTUTTO-PORTAL              │  │  6. ADMIN-DASHBOARD      │     │
│  │                                      │  │                          │     │
│  │  ALLE Rechner + Formulare + Checker  │  │  User-Management,        │     │
│  │  Tier: Mieter | Vermieter | Beides   │  │  Analytics, Billing,     │     │
│  │  ← voll integriert mit Vermietify →  │  │  System-Konfiguration    │     │
│  └─────────────────────────────────────┘  └──────────────────────────┘     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         SUPABASE (Shared)                            │  │
│  │  Auth │ Database │ Storage │ Edge Functions │ Realtime               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

HINWEIS: Hausmeister-App (fintu-hausmeister-app) bleibt als
eigenständige App bestehen, wird aber als Modul/View in
Vermietify integriert (Aufgaben/Task-System).
```

---

## Bestandsaufnahme: Was existiert wo?

### RECHNER - Vollständiger Bestand

| # | Rechner | Lovable (Standalone) | Lokal (vermieter-portal) | Bester Stand |
|---|---------|---------------------|-------------------------|--------------|
| 1 | **Kaufnebenkostenrechner** | `your-property-costs` | `KaufnebenkostenRechner.tsx` ✅ | **Beide komplett** - Lovable optisch, Lokal logisch |
| 2 | **Renditerechner** | `fintutto-rent-wizard` | `RenditeRechner.tsx` ✅ | **Beide komplett** |
| 3 | **BK-Rechner** | `betriebskosten-helfer` | `NebenkostenRechner.tsx` ✅ | **Beide komplett** |
| 4 | **Miet-Check** | `miet-check-pro-458b8dcf` | ❌ | **Nur Lovable** |
| 5 | **Eigenkapitalrechner** | `property-equity-partner` | `EigenkapitalRechner.tsx` ✅ | **Beide komplett** |
| 6 | **Kautionsrechner** | `kaution-klar` | `KautionsRechner.tsx` ✅ | **Beide komplett** (lokal mit §551 BGB) |
| 7 | **Mieterhöhungsrechner** | `mietenplus-rechner` | `MieterhoehungsRechner.tsx` ✅ | **Beide komplett** (lokal mit §558 BGB, Kappungsgrenze) |
| 8 | **Grundsteuerrechner** | `grundsteuer-easy` | `GrundsteuerRechner.tsx` ✅ | **Beide komplett** |
| 9 | **AfA-Rechner** | ❌ | ❌ (nur erwähnt in Vermietify) | **Noch nicht gebaut** |

**Fazit Rechner:** 8 von 9 sind fertig. Der lokale Stand hat **echte Berechnungslogik mit Gesetzesreferenzen** (§551, §558 BGB, alle 16 Bundesländer). Das Lovable-Design ist **optisch besser**. → Beides zusammenführen im Portal.

---

### FORMULARE - Vollständiger Bestand

| # | Formular | Lokal (vermieter-portal) | Lovable | ft_fromulare_alle | Status |
|---|----------|-------------------------|---------|-------------------|--------|
| 1 | **Mietvertrag** | `MietvertragFormular.tsx` | ❌ | ✅ (Referenz) | **STUB** (nur UI-Placeholder) |
| 2 | **Übergabeprotokoll** | `UebergabeprotokollFormular.tsx` | ❌ | ✅ (Referenz) | **STUB** |
| 3 | **Selbstauskunft** | `SelbstauskunftFormular.tsx` | ❌ | ✅ (Referenz) | **STUB** (DSGVO-konform geplant) |
| 4 | **BK-Abrechnung** | `BetriebskostenFormular.tsx` | ❌ | ✅ (Referenz) | **STUB** (17 Kostenarten geplant) |
| 5 | **Mieterhöhungsschreiben** | `MieterhoehungFormular.tsx` | ❌ | ✅ (Referenz) | **STUB** (§558 BGB geplant) |
| 6 | Kündigung | ❌ | ❌ | ✅ (Referenz) | **Noch nicht gebaut** |
| 7 | Mahnung | ❌ | ❌ | ✅ (Referenz) | **Noch nicht gebaut** |
| 8 | Nebenkostenvorauszahlung | ❌ | ❌ | ✅ (Referenz) | **Noch nicht gebaut** |
| 9 | Mietbescheinigung | ❌ | ❌ | ✅ (Referenz) | **Noch nicht gebaut** |
| 10 | Wohnungsgeberbestätigung | ❌ | ❌ | ✅ (Referenz) | **Noch nicht gebaut** |

**Fazit Formulare:** Alle 5 vorhandenen sind nur Stubs. Die echte Logik (Validierung, PDF-Generierung, Versand) fehlt noch komplett. `ft_fromulare_alle` ist die wichtigste Referenz für weitere Formulare.

---

### CHECKER (Mieter-Tools) - Vollständiger Bestand

| # | Checker | Lokal (Root src/) | Lovable (Standalone) | Status |
|---|---------|-------------------|---------------------|--------|
| 1 | **Mietpreisbremse** | `MietpreisbremseChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 2 | **Mieterhöhung** | `MieterhoehungChecker.tsx` ✅ | `check-mieterhoehung2-fintutto` | **Beide vorhanden** |
| 3 | **Nebenkosten** | `NebenkostenChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 4 | **Betriebskosten** | `BetriebskostenChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 5 | **Kündigung** | `KuendigungChecker.tsx` ✅ | `k-ndigungs-check-pro` | **Beide vorhanden** |
| 6 | **Kaution** | `KautionChecker.tsx` ✅ | `deposit-check-pro` | **Beide vorhanden** |
| 7 | **Mietminderung** | `MietminderungChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 8 | **Eigenbedarf** | `EigenbedarfChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 9 | **Modernisierung** | `ModernisierungChecker.tsx` ✅ | ❌ | **Lokal komplett** |
| 10 | **Schönheitsreparaturen** | `SchoenheitsreparaturenChecker.tsx` ✅ | `schoenheit-fintutto` | **Beide vorhanden** |
| 11 | **Mietrecht** | ❌ | `fintutto-miet-recht` | **Nur Lovable** |

**Fazit Checker:** 10 von 11 sind lokal komplett mit Fragebogen-Logik + Ergebnis-Berechnung + Stripe Credits. Der lokale Stand ist funktional der beste. Das Lovable-Design fehlt noch.

---

### ADMIN-DASHBOARD - Vergleich

| Feature | Lokal (apps/vermietify) | fintutto-admin-hub | ~~ft_admin-hub~~ (umbenannt) |
|---------|------------------------|-------------------|-------------|
| **Seiten** | 11 Seiten | ~17 Commits, unklar | 1 Commit, LEER |
| **Dashboard** | ✅ KPI-Cards, Stats | ? | ❌ |
| **Property Management** | ✅ mit Formular | ? | ❌ |
| **Tenant Management** | ✅ | ? | ❌ |
| **Payment Tracking** | ✅ | ? | ❌ |
| **Contract Management** | ✅ | ? | ❌ |
| **Document Management** | ✅ | ? | ❌ |
| **Communication** | ✅ | ? | ❌ |
| **Calculators** | ✅ Hub-Page | ? | ❌ |
| **Settings** | ✅ umfangreich | ? | ❌ |
| **Tech Stack** | React Query, Recharts, TanStack Table | shadcn | - |

**Gewinner: Lokal (apps/vermietify)** ist klar der am weitesten entwickelte. `fintutto-admin-hub` hat Lovable-Design. → Funktionalität aus Lokal + Design aus Lovable zusammenführen.

---

## Die 6-App-Architektur im Detail

### APP 1: Fintutto (Firma/Website)
**Quelle:** `fintutto-your-financial-compass` (Lovable, 30+ Seiten)

**Bereits vorhanden:**
- ✅ Dashboard, Buchungen, Rechnungen, Belege
- ✅ Bankkonten + Banking-Integration
- ✅ ELSTER-Steueranbindung
- ✅ Kontakte, Firmen, Multi-Company
- ✅ Kalender, Email-Templates
- ✅ SEPA-Zahlungen, E-Commerce-Integration

**Noch zu tun:**
- [ ] Daten mit Supabase verbinden (Mock → Real)
- [ ] Stripe-Billing für Fintutto-Abos
- [ ] Landing-Page finalisieren

**Aktion:** Lovable-App weiter ausbauen, ist schon weit.

---

### APP 2: Vermietify (Vermieter-Komplett-App)
**Quelle:** `vermieter-freude` (Lovable, 40+ Seiten!)

**Bereits vorhanden (Lovable):**
- ✅ Dashboard, Properties, Buildings, Units
- ✅ Tenants, Contracts, Payments
- ✅ Documents, Letters, Signatures
- ✅ Zähler/Meters, CO2-Dashboard
- ✅ Tasks, Calendar, Chat
- ✅ Banking-Integration (Dashboard, Connect, Transactions)
- ✅ ELSTER-Integration
- ✅ Email-Management (Templates, Compose, History)
- ✅ WhatsApp-Integration
- ✅ Automation & Workflows
- ✅ Listings, Offers
- ✅ BK-Abrechnung (Betriebskosten, Cost Types)
- ✅ Mietanpassung (Rent Adjustments)
- ✅ KdU-Verwaltung (per-building)

**Überraschung:** `vermieter-freude` hat bereits **40+ Routes** - viel mehr als die ursprüngliche Analyse (16 Seiten) vermuten ließ! Die App ist deutlich weiter als gedacht.

**Was aus lokalen Quellen noch integriert werden muss:**
- [ ] Echte Rechner-Logik (§§ BGB, Bundesländer-Daten) aus `apps/vermieter-portal`
- [ ] React Query Patterns aus `apps/vermietify`
- [ ] Supabase-Schema aus `supabase/schema.sql`

**Aktion:** Lovable-App ist Lead. Lokal gebaute Backend-Logik dort einbauen.

---

### APP 3: Zähler (Zähler-App)
**Quelle:** `leserally-all` (Lovable, 15 Seiten)

**Bereits vorhanden:**
- ✅ Landing Page (öffentlich)
- ✅ Dashboard
- ✅ Building & Unit Management
- ✅ Meter Detail + Reading
- ✅ Auth (Login, Register, Forgot Password)
- ✅ Pricing

**Noch zu tun:**
- [ ] OCR/Kamera-Ablesung (Referenz: `ft_ocr_zaehler`)
- [ ] CSV-Import für historische Daten
- [ ] Verbrauchsauswertung über Zeiträume
- [ ] Integration mit Vermietify (shared Supabase tables: meters, meter_readings)

**Aktion:** Lovable-App weiter ausbauen, OCR nachrüsten.

---

### APP 4: Mieter (Mieter-Portal)
**Quelle:** `wohn-held` (Lovable, 18 Seiten)

**Bereits vorhanden:**
- ✅ Dashboard, Chat
- ✅ Mangel melden, Meine Meldungen
- ✅ Zähler ablesen
- ✅ Dokument anfragen, Dokumente
- ✅ Finanzen
- ✅ Hausordnung, Wohnung, Notfallkontakte
- ✅ AI Assistant

**Noch zu tun:**
- [ ] Checker-Integration (10 Checker aus Root src/)
- [ ] Mehr Formulare für Mieter
- [ ] Realtime-Chat mit Vermieter (Supabase Realtime)
- [ ] Push-Notifications

**Aktion:** Checker-Logik aus Root src/ integrieren. Lovable-Design behalten.

---

### APP 5: Fintutto-Portal (NEU - Alle Rechner + Formulare + Checker)

**Konzept:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    FINTUTTO-PORTAL                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  TIER-AUSWAHL (bei Registrierung)                          │ │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐  │ │
│  │  │ MIETER      │ │ VERMIETER    │ │ BEIDES (Kombi)     │  │ │
│  │  │ Checker +   │ │ Rechner +    │ │ Alles              │  │ │
│  │  │ Formulare   │ │ Formulare    │ │                    │  │ │
│  │  │             │ │              │ │                    │  │ │
│  │  │ ab 0€/Monat │ │ ab 9€/Monat  │ │ ab 14€/Monat       │  │ │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  RECHNER (9)          │  │  FORMULARE (10+)      │            │
│  │                       │  │                       │            │
│  │  Kaufnebenkosten     │  │  Mietvertrag          │            │
│  │  Rendite             │  │  Übergabeprotokoll    │            │
│  │  Betriebskosten      │  │  Selbstauskunft       │            │
│  │  Miet-Check          │  │  BK-Abrechnung        │            │
│  │  Eigenkapital        │  │  Mieterhöhung         │            │
│  │  Kaution             │  │  Kündigung            │            │
│  │  Mieterhöhung        │  │  Mahnung              │            │
│  │  Grundsteuer         │  │  Nebenkostenvorauszahl.│            │
│  │  AfA (NEU)           │  │  Mietbescheinigung    │            │
│  │                       │  │  Wohnungsgeberbest.   │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  CHECKER (11)         │  │  SHARED INFRA         │            │
│  │                       │  │                       │            │
│  │  Mietpreisbremse     │  │  PDF-Export           │            │
│  │  Mieterhöhung        │  │  Druck               │            │
│  │  Nebenkosten         │  │  Email-Versand        │            │
│  │  Betriebskosten      │  │  Digitale Signatur    │            │
│  │  Kündigung           │  │  Cloud-Speicher       │            │
│  │  Kaution             │  │  Credit-System        │            │
│  │  Mietminderung       │  │  AI-Beratung          │            │
│  │  Eigenbedarf         │  │                       │            │
│  │  Modernisierung      │  │                       │            │
│  │  Schönheitsrep.      │  │                       │            │
│  │  Mietrecht           │  │                       │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  VERMIETIFY-INTEGRATION (bidirektional)                   │  │
│  │                                                            │  │
│  │  Portal → Vermietify:                                      │  │
│  │  Nutzer steigt auf Vermietify um → findet alle seine       │  │
│  │  Berechnungen, Formulare, Gebäude, Mieter sofort vor       │  │
│  │                                                            │  │
│  │  Vermietify → Portal:                                      │  │
│  │  Vermietify-Nutzer kann Portal-Tools nutzen mit seinen     │  │
│  │  Objektdaten (Gebäude, Einheiten, Mieter, Verträge)        │  │
│  │  für NK-Abrechnung, Mieterhöhung, Formulare etc.           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Zusammenführung der Quellen:**

| Tool-Typ | Anzahl | Design-Quelle | Logik-Quelle |
|----------|--------|---------------|-------------|
| Rechner | 9 | Lovable Einzelrechner-Apps | `apps/vermieter-portal` (7 komplett) |
| Formulare | 10+ | Neu zu gestalten | `apps/vermieter-portal` (5 Stubs) + `ft_fromulare_alle` |
| Checker | 11 | Lovable Einzelchecker-Apps | Root `src/` (10 komplett mit Stripe) |
| Shared Infra | - | Neu | Root `src/` (Stripe Credits) + Neu (PDF, Email) |

**Vorteile eines Portals statt zwei:**
1. PDF-Export, Druck, Email-Versand nur **einmal** bauen
2. Credit-System nur **einmal** implementieren
3. AI-Beratung nur **einmal** integrieren
4. Ein Vermieter kann auch Mieter-Checker nutzen (und umgekehrt)
5. Einfacheres Onboarding: Ein Login, alles drin

---

### APP 6: Admin-Dashboard (konsolidiert)

**Basis:** `fintutto-admin-hub` (Lovable, Design) + `apps/vermietify` (Lokal, Funktionalität)

**Zusammenführung:**

| Feature | Quelle | Status |
|---------|--------|--------|
| Dashboard mit KPIs | `apps/vermietify` ✅ | Logik übernehmen |
| User-Management | `apps/vermietify` ✅ | Logik übernehmen |
| Property Management | `apps/vermietify` ✅ | Logik übernehmen |
| Payment Tracking | `apps/vermietify` ✅ | Logik übernehmen |
| Analytics & Charts | `apps/vermietify` ✅ (Recharts) | Logik übernehmen |
| Lovable UI/Design | `fintutto-admin-hub` | Design übernehmen |
| System-Einstellungen | `apps/vermietify` ✅ | Logik übernehmen |

**Zu archivieren nach Konsolidierung:**
- ~~`ft_admin-hub`~~ (umbenannt zu `fintutto-admin-hub`, jetzt aktiv)
- `fintutto-command-center` (nicht auffindbar)

---

## Hausmeister-App: Status Quo

`fintu-hausmeister-app` (Lovable, 20 Seiten) bleibt **eigenständig**, wird aber über das **Shared Task System** (Supabase) mit Vermietify und dem Mieter-Portal verbunden:

```
Mieter meldet Mangel (wohn-held)
  → Task in Supabase
  → Vermieter sieht es (Vermietify)
  → Weist Hausmeister zu
  → Hausmeister bearbeitet (fintu-hausmeister-app)
  → Status-Updates für alle in Echtzeit
```

---

## Konsolidierungs-Schritte

### Schritt 1: Duplikate archivieren (sofort)

**8 Repos archivieren:**
```
miet-check-pro          → Duplikat von miet-check-pro-458b8dcf
miet-check-pro-87       → Duplikat
rent-check-buddy        → Duplikat
mietkaution-klar        → Duplikat von kaution-klar
my-deposit-calculator   → Duplikat
FT_CALC_RENDITE         → Duplikat von ft_calc_rendite
deposit-check-pro       → Prüfen, dann archivieren
vermietify              → Alte Version, ersetzen durch vermieter-freude
```

### Schritt 2: Legacy als archived markieren

**9 ft_* Repos als archived kennzeichnen:**
```
ft_vermietify, ft_hausmeisterPro, ft_hausmeister, ft_mieter,
fintutto-admin-hub (ehem. ft_admin-hub), ft_nebenkostenabrechnung, ft_fromulare_alle,
ft_ocr_zaehler, ft_calc_rendite-9bb37c94
```

### Schritt 3: Vermieter-Portal auf Vercel entfernen
- `vermieter-portal-masz5xod2-alexander-deibels-projects.vercel.app` löschen
- Falsches Design, dupliziert Lovable-Rechner

### Schritt 4: Fintutto-Portal als NEUE Lovable-App erstellen
- Alle 9 Rechner (Design von Lovable-Einzelapps, Logik von lokal)
- Alle 11 Checker (Logik von Root src/)
- Alle 10+ Formulare (Stubs ausbauen, Referenz ft_fromulare_alle)
- Tier-System: Mieter / Vermieter / Beides
- Shared Infra: PDF, Druck, Email, Credits, AI
- Supabase-Integration: Bidirektional mit Vermietify

---

## Nach Konsolidierung: Repo-Landschaft

### Aktive Entwicklung (6 + 1 Repos)
| # | App | Repo | Plattform |
|---|-----|------|-----------|
| 1 | Fintutto (Firma) | `fintutto-your-financial-compass` | Lovable |
| 2 | Vermietify | `vermieter-freude` | Lovable |
| 3 | Zähler | `leserally-all` | Lovable |
| 4 | Mieter | `wohn-held` | Lovable |
| 5 | Fintutto-Portal | **NEU ERSTELLEN** | Lovable |
| 6 | Admin-Dashboard | `fintutto-admin-hub` | Lovable |
| +1 | Hausmeister | `fintu-hausmeister-app` | Lovable |

### Koordination & Shared Code
| Repo | Zweck |
|------|-------|
| `fintutto-ecosystem` | Monorepo: Supabase-Schema, Shared Code, Dokumentation |

### Einzel-Rechner (behalten als Standalone + ins Portal einbetten)
8 Repos bleiben, werden aber auch ins Portal integriert.

### Einzel-Checker (optional behalten oder archivieren nach Portal-Integration)
5 Repos, Logik kommt ins Portal.

### Archiviert (17 Repos)
8 Duplikate + 9 Legacy = nicht mehr aktiv.

---

## Prioritäten-Reihenfolge

| # | Was | Aufwand | Warum zuerst |
|---|-----|---------|-------------|
| 1 | Duplikate archivieren | 30 min | Sofort Ordnung schaffen |
| 2 | Legacy archivieren | 30 min | Verwirrung vermeiden |
| 3 | Vercel Deployment löschen | 10 min | Falsches Design entfernen |
| 4 | Fintutto-Portal erstellen (Lovable) | 2-3 Wochen | Zentrales Tool-Portal |
| 5 | Vermietify vervollständigen | laufend | Haupt-Produkt |
| 6 | Admin konsolidieren | 1 Woche | Funktionalität zusammenführen |
| 7 | Mieter-App + Checker verbinden | 1-2 Wochen | Checker-Integration |

---

*Erstellt: 09.02.2026*
*Version: 1.0*
