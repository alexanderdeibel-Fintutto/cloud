# Fintutto Ecosystem - Vollständiges Inventar & Konsolidierungsplan

*Stand: 09.02.2026*

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

### 1.1 Firma/Website: `fintutto-your-financial-compass`
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Fintutto Firmen-Website / Landing Page |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/fintutto-your-financial-compass |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert |
| **Letztes Update** | 08.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.2 Vermietify (Vermieter-Plattform): `vermieter-freude`
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Haupt-Plattform für Vermieter (Immobilienverwaltung) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/vermieter-freude |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert, funktional ~3% (16 Seiten von 631 geplant) |
| **Letztes Update** | 09.02.2026 |
| **Lokale Kopie?** | JA - aber veraltet → `apps/vermietify` (andere Version!) |

> **PROBLEM:** Vermietify existiert in 3 verschiedenen Versionen (siehe Abschnitt 4)

### 1.3 Mieter-App: `wohn-held`
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Portal für Mieter (Mangel melden, Zähler ablesen, Dokumente, Chat) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/wohn-held |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert |
| **Letztes Update** | 08.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.4 Hausmeister-App: `fintu-hausmeister-app`
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | App für Hausmeister (Aufgaben, Belege, Chat mit Vermieter) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/fintu-hausmeister-app |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert |
| **Letztes Update** | 08.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

### 1.5 Zähler-App: `leserally-all`
| Eigenschaft | Wert |
|-------------|------|
| **Zweck** | Zählerstand-Erfassung (Strom, Gas, Wasser, Heizung) |
| **GitHub** | https://github.com/alexanderdeibel-Fintutto/leserally-all |
| **Plattform** | Lovable |
| **Status** | Optisch finalisiert |
| **Letztes Update** | 08.02.2026 |
| **Lokale Kopie?** | NEIN - nur in Lovable/GitHub |

---

## 2. EINZEL-RECHNER (8 Stück, alle in Lovable fertig)

Alle Rechner sind eigenständige Lovable-Apps mit eigenem GitHub-Repo.

| # | Name | GitHub Repo | Funktion | Status |
|---|------|-------------|----------|--------|
| 1 | Kaufnebenkostenrechner | `your-property-costs` | Kaufnebenkosten berechnen | Fertig |
| 2 | Mietrenditerechner | `fintutto-rent-wizard` | Rendite einer Immobilie | Fertig |
| 3 | BK-Rechner | `betriebskosten-helfer` | Betriebskostenabrechnung | Fertig |
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
| 5 | `ft_admin-hub` | JavaScript | Admin Dashboard | Referenz |
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

## 10. VERCEL DEPLOYMENTS

| Deployment | Quelle | Status |
|-----------|--------|--------|
| `vermieter-portal-masz5xod2-alexander-deibels-projects.vercel.app` | apps/vermieter-portal | Deployed, falsches Design |
| Vermietify (lokal) | apps/vermietify | vercel.json vorhanden, Status unklar |
| Root Mieter-Checker | Root src/ | vercel.json vorhanden, Status unklar |

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

### Aktiv & Behalten (20 Repos)
| # | Repo | Typ | Plattform |
|---|------|-----|-----------|
| 1 | `fintutto-ecosystem` | Monorepo | Lokal/GitHub |
| 2 | `fintutto-your-financial-compass` | Firma/Website | Lovable |
| 3 | `vermieter-freude` | Vermietify (Haupt) | Lovable |
| 4 | `wohn-held` | Mieter-Portal | Lovable |
| 5 | `fintu-hausmeister-app` | Hausmeister | Lovable |
| 6 | `leserally-all` | Zähler | Lovable |
| 7 | `your-property-costs` | Kaufnebenkosten-Rechner | Lovable |
| 8 | `fintutto-rent-wizard` | Mietrendite-Rechner | Lovable |
| 9 | `betriebskosten-helfer` | BK-Rechner | Lovable |
| 10 | `miet-check-pro-458b8dcf` | Miet-Check-Rechner | Lovable |
| 11 | `property-equity-partner` | Eigenkapital-Rechner | Lovable |
| 12 | `kaution-klar` | Kautions-Rechner | Lovable |
| 13 | `mietenplus-rechner` | Mieterhöhungs-Rechner | Lovable |
| 14 | `grundsteuer-easy` | Grundsteuer-Rechner | Lovable |
| 15 | `fintutto-miet-recht` | Mietrecht-Checker | Lovable |
| 16 | `schoenheit-fintutto` | Schönheitsreparatur-Checker | Lovable |
| 17 | `k-ndigungs-check-pro` | Kündigungs-Checker | Lovable |
| 18 | `check-mieterhoehung2-fintutto` | Mieterhöhungs-Checker | Lovable |
| 19 | `fintutto-admin-hub` | Admin-Dashboard | Lovable |
| 20 | `Google-API-f-r-Fintutto` | Google API | Sonstig |

### Referenz behalten, als archived markieren (9 Legacy)
| # | Repo | Zweck |
|---|------|-------|
| 21 | `ft_vermietify` | Feature-Referenz (631 Seiten!) |
| 22 | `ft_fromulare_alle` | Formular-Referenz |
| 23 | `ft_hausmeisterPro` | Hausmeister-Referenz |
| 24 | `ft_hausmeister` | Hausmeister-Referenz |
| 25 | `ft_mieter` | Mieter-Referenz |
| 26 | `ft_admin-hub` | Admin-Referenz |
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

1. **Sofort:** Dieses Inventar reviewen und Entscheidungen zu Abschnitt 13 treffen
2. **Diese Woche:** Duplikate archivieren, Legacy-Repos als archived markieren
3. **Dann:** Vermieter-Portal-Design fixen (sieht wie Mieterportal aus)
4. **Dann:** Rechner & Formulare aus apps/vermieter-portal in vermieter-freude (Lovable) übertragen
5. **Dann:** Checker-Logik aus Root src/ in wohn-held (Lovable) übertragen
6. **Dann:** Phase-weise Konsolidierung gemäß dem existierenden KONSOLIDIERUNGSPLAN_VERMIETIFY.md

---

*Dieses Dokument ersetzt keine der bestehenden Planungsdokumente, sondern dient als Übersicht über den IST-Zustand.*
