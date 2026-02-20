# Fintutto Ecosystem - Vollständiges Inventar & Konsolidierungsplan

*Stand: 10.02.2026 (aktualisiert mit neuen Repo-Namen)*

---

## Übersicht: Was haben wir, wo ist es?

| Plattform | Anzahl | Status |
|-----------|--------|--------|
| **GitHub Repos (gesamt)** | 39 | Aktiv + Legacy + Duplikate |
| **Lovable Apps (aktiv)** | ~15 | Optisch teilweise finalisiert |
| **Lokales Monorepo** | 3 Apps | In fintutto-ecosystem |
| **Vercel Deployments** | ~3-4 | Teilweise deployed |
| **Legacy (ft_*) Repos** | 9 | Nur als Referenz nutzbar |
| **Duplikate identifiziert** | ~8 | Können archiviert werden |

---

## 1. DIE 5 HAUPT-APPS (Kern des Ökosystems)

### 1.1 Firma/Website: `fintutto` *(ehem. fintutto-your-financial-compass)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Fintutto Firmen-Website / Landing Page |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/fintutto-your-financial-compass |
| **Vercel** | fintutto.vercel.app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, auf Vercel deployed |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.2 Vermietify (Vermieter-Plattform): `vermietify` *(ehem. vermieter-freude)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Haupt-Plattform für Vermieter (Immobilienverwaltung) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/vermieter-freude |
| **Vercel** | vermietify.vercel.app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, funktional ~3% (16 Seiten von 631 geplant) |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | JA - aber veraltet → `apps/vermietify` (andere Version!) |

> **PROBLEM:** Vermietify existiert in 3 verschiedenen Versionen (siehe Abschnitt 4)

### 1.3 Mieter-App: `mieter` *(ehem. wohn-held)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Portal für Mieter (Mangel melden, Zähler ablesen, Dokumente, Chat) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/mieter |
| **Vercel** | mieter-kw8d.vercel.app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, auf Vercel deployed |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.4 Hausmeister-App: `hausmeisterPro` *(ehem. fintu-hausmeister-app)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | App für Hausmeister (Aufgaben, Belege, Chat mit Vermieter) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/hausmeisterPro |
| **Vercel** | hausmeister-pro.vercel.app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, auf Vercel deployed |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.5 Zähler-App: `ablesung` *(ehem. leserally-all)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Zählerstand-Erfassung (Strom, Gas, Wasser, Heizung) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/ablesung |
| **Vercel** | ablesung.vercel.app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, auf Vercel deployed |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.6 Unified Portal: `fintutto-portal` *(NEU - im Monorepo)*
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Alle Rechner (7) + Checker (10) + Formulare (5) in EINER App |
| **GitHub** | fintutto-ecosystem/apps/fintutto-portal |
| **Vercel** | portal.fintutto.cloud (geplant) |
| **Plattform** | Lokal/Claude |
| **Status** | Gebaut, 22+ Tools, noch nicht deployed |
| **Letztes Update** | 10.02.2026 |
| **Lokale Kopie?** | JA - apps/fintutto-portal |

> **Ersetzt:** apps/vermieter-portal + Root src/ Checker + Einzelrechner-Lovable-Apps

---

## 2. EINZEL-RECHNER (8 Stück, alle in Lovable fertig)

Alle Rechner sind eigenständige Lovable-Apps mit eigenem GitHub-Repo.

| # | Name | GitHub Repo | Funktion | Status |
|---|------|-------------|----------|--------|
| 1 | Kaufnebenkostenrechner | `your-property-costs` | Kaufnebenkosten berechnen | Fertig |
| 2 | Mietrenditerechner | `fintutto-rent-wizard` | Rendite einer Immobilie | Fertig |
| 3 | BK-Rechner | `betriebskosten` *(ehem. betriebskosten-helfer)* | Betriebskostenabrechnung | Fertig |
| 4 | Miet-Check | `miet-check-pro-458b8dcf` | Mietpreisbremse prüfen | Fertig |
| 5 | Eigenkapitalrechner | `property-equity-partner` | Eigenkapital berechnen | Fertig |
| 6 | Kautionsrechner | `kaution-klar` | Kaution berechnen | Fertig |
| 7 | Mieterhöhungsrechner | `mietenplus-rechner` | Mieterhöhung berechnen | Fertig |
| 8 | Grundsteuerrechner | `grundsteuer-easy` | Grundsteuer berechnen | Fertig |

> **Geplant laut Konsolidierungsplan:** Diese Rechner sollen ins Vermieter-Portal eingebettet werden.

---

## 3. EINZEL-CHECKER (Mieter-Tools, in Lovable/GitHub)

| # | Name | GitHub Repo | Funktion | Status |
|---|------|-------------|----------|--------|
| 1 | Mietrecht-Check | `fintutto-miet-recht` | Mietrecht prüfen | In Arbeit |
| 2 | Schönheitsreparaturen | `schoenheit-fintutto` | Schönheitsreparaturen-Check | In Arbeit |
| 3 | Kündigung-Check | `k-ndigungs-check-pro` | Kündigung prüfen | In Arbeit |
| 4 | Kautions-Check | `deposit-check-pro` | Kaution prüfen | In Arbeit |
| 5 | Mieterhöhungs-Check | `check-mieterhoehung2-fintutto` | Mieterhöhung prüfen | In Arbeit |

> **Geplant:** Diese Checker sollen ins Mieter-Portal (wohn-held) eingebettet werden.

---

## 4. LOKALES MONOREPO (`fintutto-ecosystem`)

### Struktur:
```
fintutto-ecosystem/
├── apps/
│   ├── vermietify/          ← Vermieter-Dashboard (Claude-gebaut)
│   └── vermieter-portal/    ← Vermieter-Portal mit Rechnern & Formularen (Claude-gebaut)
├── packages/
│   └── shared/              ← @fintutto/shared (Utilities)
├── src/                     ← Mieter-Checker (10 Checker) (Claude-gebaut, Root-App)
├── api/                     ← Stripe Webhooks
├── supabase/                ← DB-Schema & Migrationen
└── [Planungsdokumente]
```

### 4.1 `apps/vermietify` (lokal, Claude-gebaut)
| Eigenschaft | Wert |
|-------------|------|
| **Seiten** | Dashboard, Tenants, Properties, Documents, Communication, Contracts, Meters, Payments, Settings, Auth |
| **Features** | Supabase-Integration, React Query, Dark Mode |
| **Vercel** | vercel.json vorhanden |
| **Problem** | Ist NICHT identisch mit Lovable-Version `vermieter-freude`! |

### 4.2 `apps/vermieter-portal` (lokal, Claude-gebaut)
| Eigenschaft | Wert |
|-------------|------|
| **Seiten** | 7 Rechner + 5 Formulare + Home + Pricing |
| **Rechner** | Kaufnebenkosten, Eigenkapital, Grundsteuer, Kaution, Mieterhöhung, Rendite, Nebenkosten |
| **Formulare** | Mietvertrag, Betriebskosten, Übergabeprotokoll, Mieterhöhung, Selbstauskunft |
| **Vercel** | Deployed als `vermieter-portal-masz5xod2-alexander-deibels-projects.vercel.app` |
| **Problem** | Sieht optisch aus wie das Mieterportal! Eigene Rechner duplicieren die Lovable-Einzelrechner! |

### 4.3 Root `src/` = Mieter-Checker (lokal, Claude-gebaut)
| Eigenschaft | Wert |
|-------------|------|
| **Seiten** | 10 Checker + Home + Result + Pricing + Dashboard |
| **Checker** | Betriebskosten, Eigenbedarf, Kaution, Kündigung, Mieterhöhung, Mietminderung, Mietpreisbremse, Modernisierung, Nebenkosten, Schönheitsreparaturen |
| **Monetarisierung** | Stripe-Integration mit Credits-System |
| **Problem** | Dupliziert teilweise die Einzel-Checker aus Lovable! |

---

## 5. ADMIN-DASHBOARDS (3 Versionen!)

| # | Name | Plattform | Status |
|---|------|-----------|--------|
| 1 | `fintutto-admin-hub` | Lovable/GitHub | Existiert, Theme "mieter" applied |
| 2 | `fintutto-command-center` | Lovable? | **NICHT GEFUNDEN** (404 auf GitHub, evtl. privat/gelöscht) |
| 3 | Vermietify Dashboard | Lokal (apps/vermietify) | Hat Admin-ähnliche Features |

> **Empfehlung:** Auf EIN Admin-Dashboard konsolidieren.

---

## 6. LEGACY REPOS (ft_* Prefix, 9 Stück)

Diese Repos stammen aus der Base44/GPT-Engineer-Ära (JavaScript). Sie dienen als **Feature-Referenz**, nicht zum aktiven Einsatz.

| # | Repo | Sprache | Zweck | Nutzbar als |
|---|------|---------|-------|-------------|
| 1 | `ft_vermietify` | JavaScript | 631-Seiten Vollversion | Feature-Referenz |
| 2 | `ft_hausmeisterPro` | JavaScript | Hausmeister Pro | Referenz |
| 3 | `ft_hausmeister` | JavaScript | Hausmeister (einfacher) | Referenz |
| 4 | `ft_mieter` | JavaScript | Mieter-App | Referenz |
| 5 | ~~`ft_admin-hub`~~ → `fintutto-admin-hub` | JavaScript | Admin Dashboard | Umbenannt + Aktiv |
| 6 | `ft_nebenkostenabrechnung` | JavaScript | BK-Abrechnung | Referenz |
| 7 | `ft_fromulare_alle` | JavaScript | Alle Formulare | **Wichtig: Formular-Referenz** |
| 8 | `ft_ocr_zaehler` | JavaScript | OCR Zählerablesung | Referenz |
| 9 | `ft_calc_rendite` / `FT_CALC_RENDITE` | JavaScript | Renditerechner (2x!) | Referenz |

---

## 7. SONSTIGE REPOS

| # | Repo | Zweck | Status |
|---|------|-------|--------|
| 1 | `Google-API-f-r-Fintutto` | Google API Integration | Unklar |
| 2 | `property-calc-hub` | Sammelrechner (mehrere in einem?) | Zu prüfen |
| 3 | `a-docs` | Dokumentation | Zu prüfen |
| 4 | `vermietify` | Evtl. alte Version von Vermietify? | Zu prüfen |

---

## 8. DUPLIKATE & ÜBERFLÜSSIGE REPOS

### Identifizierte Duplikate:

| Funktion | Aktuelle Version (behalten) | Duplikate (archivieren) |
|----------|------|------------|
| **Miet-Check** | `miet-check-pro-458b8dcf` | `miet-check-pro`, `miet-check-pro-87`, `rent-check-buddy` |
| **Kaution** | `kaution-klar` | `mietkaution-klar`, `my-deposit-calculator`, `deposit-check-pro` (Checker, anders!) |
| **Renditerechner** | `fintutto-rent-wizard` | `ft_calc_rendite-9bb37c94`, `FT_CALC_RENDITE` |
| **Hausmeister** | `fintu-hausmeister-app` | `ft_hausmeisterPro`, `ft_hausmeister` |
| **Mieterhöhung** | `mietenplus-rechner` (Rechner) + `check-mieterhoehung2-fintutto` (Checker) | - |

**Fazit: ~8 Repos können archiviert werden.**

---

## 9. DAS KERNPROBLEM: DREIFACH-ENTWICKLUNG

### Problem 1: Vermietify existiert in 3 Versionen

```
Version 1: vermieter-freude (Lovable)
├── 16 Seiten, optisch finalisiert
├── Supabase Auth + Stripe
└── IST DIE OPTISCH RICHTIGE

Version 2: apps/vermietify (lokal/Claude)
├── Dashboard, Tenants, Properties, etc.
├── Supabase + React Query
└── HAT MEHR FUNKTIONALITÄT

Version 3: apps/vermieter-portal (lokal/Claude)
├── 7 Rechner + 5 Formulare
├── Credits-System
└── SIEHT AUS WIE MIETERPORTAL (falsches Design!)
```

**Was zu tun ist:**
- `vermieter-freude` (Lovable) = Lead für Design/UI
- Funktionalität aus `apps/vermietify` und `apps/vermieter-portal` dort einbauen
- Rechner und Formulare aus `vermieter-portal` nach `vermieter-freude` migrieren

### Problem 2: Mieter-Tools existiert in 3 Versionen

```
Version 1: wohn-held (Lovable)
├── Mieterportal, optisch finalisiert
└── IST DIE OPTISCH RICHTIGE

Version 2: Root src/ im Monorepo (Claude)
├── 10 Mieter-Checker
├── Stripe Credits
└── HAT DIE CHECKER-LOGIK

Version 3: 5 Einzel-Checker-Repos (Lovable)
├── k-ndigungs-check-pro, deposit-check-pro, etc.
└── EIGENSTÄNDIGE APPS
```

**Was zu tun ist:**
- `wohn-held` (Lovable) = Lead für Design/UI
- Checker-Logik aus Root src/ dort integrieren
- Einzel-Checker-Repos als eigenständige Tools behalten ODER in wohn-held einbetten

### Problem 3: Admin-Dashboard existiert dreifach
- Konsolidieren auf `fintutto-admin-hub` (Lovable)

---

## 10. VERCEL DEPLOYMENTS (Stand 10.02.2026)

### Aktive Vercel-Projekte:
| Vercel-Projekt | Domain | GitHub Repo | Status |
|----------------|--------|-------------|--------|
| **vermietify** | vermietify.vercel.app | `vermieter-freude` | Deployed |
| **hausmeister-pro** | hausmeister-pro.vercel.app | `hausmeisterPro` | Deployed |
| **ablesung** | ablesung.vercel.app | `ablesung` | Deployed |
| **mieter** | mieter-kw8d.vercel.app | `mieter` | Deployed |
| **fintutto** | fintutto.vercel.app | `fintutto-your-financial-compass` | Deployed |
| **betriebskosten** | betriebskosten-helfer.vercel.app | `betriebskosten` | Deployed |
| **fintutto-admin-hub** | fintutto-admin-hub.vercel.app | `fintutto-admin-hub` | Deployed |
| **portal-vermieter** | vermieterportal.fintutto.cloud | Portal-V Repo | Deployed |
| **portal-mieter** | mieterportal.fintutto.cloud | Portal-M Repo | Deployed |
| **fintutto-portal** (NEU) | portal.fintutto.cloud (geplant) | `fintutto-ecosystem` | Noch nicht deployed |

### Zu löschende Vercel-Projekte:
| Vercel-Projekt | Grund |
|----------------|-------|
| `ft-nebenkostenabrechnung` | Legacy JavaScript |
| `ft-nebenkostenabrechnung-vrju` | Duplikat |
| `ft-formulare-alle` | Legacy JavaScript |
| `x_mieter` | Duplikat von "mieter" |
| `command-center` | In admin-hub konsolidieren |

### Team-Level Environment Variables:
Alle Apps erben automatisch von `vercel.com/fintutto/~/settings/environment-variables`.
Siehe [VERCEL_ENV_GUIDE.md](./VERCEL_ENV_GUIDE.md) für Details.

---

## 11. WAS WO GEBAUT WIRD (Zuordnung)

### Lovable = Design-Lead (optisch finalisiert)
- `vermieter-freude` → Vermietify (Vermieter-Plattform)
- `wohn-held` → Mieter-Portal
- `fintu-hausmeister-app` → Hausmeister-App
- `leserally-all` → Zähler-App
- `fintutto-your-financial-compass` → Firmen-Website
- 8 Einzel-Rechner → Standalone oder einbetten
- 5 Einzel-Checker → Standalone oder einbetten
- `fintutto-admin-hub` → Admin-Dashboard

### Lokal/Claude = Funktionalitäts-Lead
- `apps/vermietify` → Supabase-Integration, React Query, echte CRUD
- `apps/vermieter-portal` → 7 Rechner + 5 Formulare (Logik)
- Root `src/` → 10 Mieter-Checker (Logik + Stripe)
- `packages/shared` → Shared Utilities
- `api/` → Stripe Webhooks
- `supabase/` → Datenbank-Schema

---

## 12. EMPFOHLENE KONSOLIDIERUNGSSTRATEGIE

### Phase 0: Aufräumen (sofort)
1. **8 Duplikat-Repos archivieren** (miet-check-pro, miet-check-pro-87, rent-check-buddy, mietkaution-klar, my-deposit-calculator, ft_calc_rendite-9bb37c94, FT_CALC_RENDITE, vermietify)
2. **9 Legacy ft_* Repos als "archived" markieren** (nur Referenz)
3. **fintutto-command-center** klären (existiert es? löschen?)

### Phase 1: Design & Funktionalität zusammenführen
| Ziel-App | Design von (Lovable) | Funktionalität von (Lokal) |
|----------|---------------------|---------------------------|
| **Vermietify** | vermieter-freude | apps/vermietify + apps/vermieter-portal |
| **Mieter-Portal** | wohn-held | Root src/ (10 Checker) |
| **Hausmeister** | fintu-hausmeister-app | (noch keine lokale Version) |
| **Zähler** | leserally-all | (noch keine lokale Version) |

### Phase 2: Einzel-Apps einbetten oder verbinden
- 8 Rechner → als Module in Vermietify ODER als verlinkte Standalone-Apps
- 5 Checker → als Module in wohn-held ODER als verlinkte Standalone-Apps
- Formulare (ft_fromulare_alle + vermieter-portal) → in Vermietify einbetten

### Phase 3: Portal-Zusammenführung (wie im Konsolidierungsplan)
- BK-Modul (betriebskosten-helfer) → in Vermietify
- Zähler-Modul (leserally-all) → in Vermietify
- Task-System (Hausmeister + Mieter) → Shared zwischen allen Apps
- Supabase als Single Source of Truth

---

## 13. ENTSCHEIDUNGEN DIE GETROFFEN WERDEN MÜSSEN

| # | Frage | Optionen | Empfehlung |
|---|-------|----------|------------|
| 1 | Wo wird Vermietify weiterentwickelt? | A) Lovable, B) Lokal, C) Hybrid | **C) Hybrid: Lovable für UI, Lokal für Backend** |
| 2 | Einzel-Rechner einbetten oder standalone? | A) Einbetten, B) Standalone mit Link | **B) Standalone mit einheitlichem Design + Links** |
| 3 | Einzel-Checker einbetten oder standalone? | A) Einbetten, B) Standalone mit Link | **A) In wohn-held einbetten** |
| 4 | Was passiert mit apps/vermieter-portal? | A) Behalten, B) In vermieter-freude mergen | **B) Mergen: Formulare + Rechner-Logik übernehmen** |
| 5 | Was passiert mit Root Mieter-Checker? | A) Behalten, B) In wohn-held mergen | **B) Checker-Logik in wohn-held integrieren** |
| 6 | Ein Admin oder mehrere? | A) fintutto-admin-hub, B) Eigenes lokales | **A) fintutto-admin-hub konsolidieren** |
| 7 | Formulare: Woher? | A) ft_fromulare_alle, B) vermieter-portal, C) Neu | **B) vermieter-portal hat 5 fertige** |

---

## 14. REPO-ÜBERSICHT KOMPLETT (alle 39)

### Aktiv & Behalten (20 Repos) - *Aktualisiert mit neuen Namen*
| # | Repo (aktuell) | Ehem. Name | Typ | Plattform |
|---|------|------------|-----|-----------|
| 1 | `fintutto-ecosystem` | - | Monorepo (inkl. fintutto-portal) | Lokal/GitHub |
| 2 | `fintutto-your-financial-compass` | - | Firma/Website | Lovable |
| 3 | `vermieter-freude` → **vermietify** | vermieter-freude | Vermietify (Haupt) | Lovable |
| 4 | `mieter` | wohn-held | Mieter-Portal | Lovable |
| 5 | `hausmeisterPro` | fintu-hausmeister-app | Hausmeister | Lovable |
| 6 | `ablesung` | leserally-all | Zähler | Lovable |
| 7 | `your-property-costs` | - | Kaufnebenkosten-Rechner | Lovable |
| 8 | `fintutto-rent-wizard` | - | Mietrendite-Rechner | Lovable |
| 9 | `betriebskosten` | betriebskosten-helfer | BK-Rechner | Lovable |
| 10 | `miet-check-pro-458b8dcf` | - | Miet-Check-Rechner | Lovable |
| 11 | `property-equity-partner` | - | Eigenkapital-Rechner | Lovable |
| 12 | `kaution-klar` | - | Kautions-Rechner | Lovable |
| 13 | `mietenplus-rechner` | - | Mieterhöhungs-Rechner | Lovable |
| 14 | `grundsteuer-easy` | - | Grundsteuer-Rechner | Lovable |
| 15 | `fintutto-miet-recht` | - | Mietrecht-Checker | Lovable |
| 16 | `schoenheit-fintutto` | - | Schönheitsreparatur-Checker | Lovable |
| 17 | `k-ndigungs-check-pro` | - | Kündigungs-Checker | Lovable |
| 18 | `check-mieterhoehung2-fintutto` | - | Mieterhöhungs-Checker | Lovable |
| 19 | `fintutto-admin-hub` | - | Admin-Dashboard | Lovable |
| 20 | `Google-API-f-r-Fintutto` | - | Google API | Sonstig |

### Referenz behalten, als archived markieren (9 Legacy)
| # | Repo | Zweck |
|---|------|-------|
| 21 | `ft_vermietify` | Feature-Referenz (631 Seiten!) |
| 22 | `ft_fromulare_alle` | Formular-Referenz |
| 23 | `ft_hausmeisterPro` | Hausmeister-Referenz |
| 24 | `ft_hausmeister` | Hausmeister-Referenz |
| 25 | `ft_mieter` | Mieter-Referenz |
| 26 | ~~`ft_admin-hub`~~ → `fintutto-admin-hub` | Admin (umbenannt, aktiv) |
| 27 | `ft_nebenkostenabrechnung` | BK-Referenz |
| 28 | `ft_ocr_zaehler` | OCR-Referenz |
| 29 | `ft_calc_rendite-9bb37c94` | Rendite-Referenz |

### Duplikate - Archivieren/Löschen (8 Repos)
| # | Repo | Duplikat von |
|---|------|-------------|
| 30 | `miet-check-pro` | → miet-check-pro-458b8dcf |
| 31 | `miet-check-pro-87` | → miet-check-pro-458b8dcf |
| 32 | `rent-check-buddy` | → miet-check-pro-458b8dcf |
| 33 | `mietkaution-klar` | → kaution-klar |
| 34 | `my-deposit-calculator` | → kaution-klar |
| 35 | `FT_CALC_RENDITE` | → ft_calc_rendite (Duplikat) |
| 36 | `deposit-check-pro` | → Prüfen ob != kaution-klar |
| 37 | `vermietify` | → vermieter-freude |

### Zu prüfen (2 Repos)
| # | Repo | Frage |
|---|------|-------|
| 38 | `property-calc-hub` | Sammelrechner? Überflüssig? |
| 39 | `a-docs` | Dokumentation - relevant? |

---

## 15. NÄCHSTE KONKRETE SCHRITTE

### Erledigt (10.02.2026):
- [x] Vollständiges Inventar erstellt
- [x] 6-App-Architektur definiert (siehe ARCHITEKTUR_6_APPS.md)
- [x] Unified fintutto-portal gebaut (7 Rechner + 10 Checker + 5 Formulare)
- [x] Vercel Environment Guide erstellt (siehe VERCEL_ENV_GUIDE.md)
- [x] GitHub Repos umbenannt (vermietify, mieter, hausmeisterPro, ablesung, betriebskosten)
- [x] Alle Lovable-Apps auf Vercel deployed

### Nächste Schritte:
1. **Sofort:** `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` als Vercel Team-Variablen setzen
2. **Sofort:** 5 Legacy-Vercel-Projekte löschen (siehe Abschnitt 10)
3. **Diese Woche:** fintutto-portal auf Vercel deployen (portal.fintutto.cloud)
4. **Diese Woche:** 8 Duplikat-Repos auf GitHub archivieren
5. **Dann:** Formulare im Portal ausbauen (aktuell Stubs)
6. **Dann:** portal-vermieter + portal-mieter in fintutto-portal konsolidieren
7. **Dann:** Phase-weise Konsolidierung gemäß KONSOLIDIERUNGSPLAN_VERMIETIFY.md

---

*Dieses Dokument ersetzt keine der bestehenden Planungsdokumente, sondern dient als Übersicht über den IST-Zustand.*
