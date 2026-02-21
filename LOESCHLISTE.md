# Exakte Lösch- & Archivierungsliste

*Stand: 11.02.2026*
*Aktualisiert: 20.02.2026 — Archivierung abgeschlossen*

---

## 1. GitHub Repos: ARCHIVIEREN (Duplikate) - 10 Repos — ✅ ERLEDIGT (20.02.2026)

| # | Repo-Name (exakt) | Duplikat von | Status |
|---|-------------------|-------------|--------|
| 1 | `miet-check-pro` | `miet-check-pro-458b8dcf` | ✅ Archiviert |
| 2 | `miet-check-pro-87` | `miet-check-pro-458b8dcf` | ✅ Archiviert |
| 3 | `rent-check-buddy` | `miet-check-pro-458b8dcf` | ✅ Archiviert |
| 4 | `mietkaution-klar` | `kaution-klar` | ✅ Archiviert |
| 5 | `my-deposit-calculator` | `kaution-klar` | ✅ Archiviert |
| 6 | `deposit-check-pro` | `kaution-klar` (Checker) | ✅ Archiviert |
| 7 | `FT_CALC_RENDITE` | `ft_calc_rendite-9bb37c94` | ✅ Archiviert |
| 8 | `vermietify` | `vermieter-freude` (alt) | ✅ Archiviert |
| 9 | `property-calc-hub` | Portal ersetzt dies | ✅ Archiviert |
| 10 | `a-docs` | Dokumentation | Aktiv (behalten) |

---

## 2. GitHub Repos: ARCHIVIEREN (Legacy ft_*) - 9 Repos — ✅ ERLEDIGT (20.02.2026)

| # | Repo-Name (exakt) | Referenz-Wert | Status |
|---|-------------------|---------------|--------|
| 1 | `ft_vermietify` | Hoch (631 Seiten Feature-Referenz) | ✅ Archiviert |
| 2 | `ft_fromulare_alle` | **SEHR HOCH** (Formular-Referenz!) | ✅ Archiviert |
| 3 | `ft_mieter` | Mittel | ✅ Archiviert |
| 4 | `ft_hausmeisterPro` | Mittel | ✅ Archiviert |
| 5 | `ft_hausmeister` | Niedrig | ✅ Archiviert |
| 6 | `fintutto-admin-hub` | Mittel (umbenannt von ft_admin-hub) | ✅ Umbenannt + Aktiv |
| 7 | `ft_nebenkostenabrechnung` | Niedrig | ✅ Archiviert |
| 8 | `ft_ocr_zaehler` | Mittel (OCR-Logik) | ✅ Archiviert |
| 9 | `ft_calc_rendite-9bb37c94` | Niedrig | ✅ Archiviert |

---

## 3. Vercel-Projekte: LÖSCHEN - 7 Projekte

In Vercel unter Settings → Advanced → Delete Project

| # | Vercel-Projekt | Domain | Grund |
|---|---------------|--------|-------|
| 1 | `ft-nebenkostenabrechnung` | - | Legacy JavaScript |
| 2 | `ft-nebenkostenabrechnung-vrju` | - | Duplikat |
| 3 | `ft-formulare-alle` | - | Legacy JavaScript |
| 4 | `x_mieter` | - | Duplikat von "mieter" |
| 5 | `command-center` | - | In admin-hub konsolidiert |
| 6 | `portal-vermieter` | vermieterportal.fintutto.cloud | → Ersetzt durch fintutto-portal |
| 7 | `portal-mieter` | mieterportal.fintutto.cloud | → Ersetzt durch fintutto-portal |

> **Wichtig:** portal-vermieter + portal-mieter erst löschen NACHDEM fintutto-portal auf portal.fintutto.cloud deployed ist!

---

## 4. Was BEHALTEN wird (21 Repos)

### Kern-Apps (7):
| # | Repo | Zweck |
|---|------|-------|
| 1 | `fintutto-ecosystem` | Monorepo + fintutto-portal |
| 2 | `fintutto-your-financial-compass` | Fintutto Website |
| 3 | `vermieter-freude` | Vermietify (69 Formulare!) |
| 4 | `mieter` | Mieter-App |
| 5 | `hausmeisterPro` | Hausmeister-App |
| 6 | `ablesung` | Zähler-App |
| 7 | `fintutto-admin-hub` | Admin Dashboard |

### Einzel-Rechner (8):
| # | Repo | Rechner |
|---|------|---------|
| 8 | `your-property-costs` | Kaufnebenkosten |
| 9 | `fintutto-rent-wizard` | Mietrendite |
| 10 | `betriebskosten` | Betriebskosten |
| 11 | `miet-check-pro-458b8dcf` | Miet-Check |
| 12 | `property-equity-partner` | Eigenkapital |
| 13 | `kaution-klar` | Kaution |
| 14 | `mietenplus-rechner` | Mieterhöhung |
| 15 | `grundsteuer-easy` | Grundsteuer |

### Einzel-Checker (4):
| # | Repo | Checker |
|---|------|---------|
| 16 | `fintutto-miet-recht` | Mietrecht |
| 17 | `schoenheit-fintutto` | Schönheitsreparaturen |
| 18 | `k-ndigungs-check-pro` | Kündigung |
| 19 | `check-mieterhoehung2-fintutto` | Mieterhöhung |

### Sonstige (2):
| # | Repo | Zweck |
|---|------|-------|
| 20 | `Google-API-f-r-Fintutto` | Google API |
| 21 | `bescheidboxer` | NEU - prüfen |

---

## Zusammenfassung

| Aktion | Anzahl | Status |
|--------|--------|--------|
| **Behalten** | 10 Repos | ✅ Aktiv |
| **GitHub archiviert (Duplikate)** | 9 Repos | ✅ Erledigt (20.02.2026) |
| **GitHub archiviert (Legacy)** | 8 Repos | ✅ Erledigt (20.02.2026) |
| **GitHub archiviert (Prototypen)** | 17 Repos | ✅ Erledigt (20.02.2026) |
| **Vercel löschen** | 7 Projekte | ⏳ Ausstehend |
| **Gesamt archiviert** | 34 Repos | ✅ |
