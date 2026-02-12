# Exakte Lösch- & Archivierungsliste

*Stand: 11.02.2026*

---

## 1. GitHub Repos: ARCHIVIEREN (Duplikate) - 10 Repos

Diese Repos sind Duplikate und können auf GitHub archiviert werden.
(Settings → Danger Zone → Archive this repository)

| # | Repo-Name (exakt) | GitHub URL | Duplikat von | Aktion |
|---|-------------------|-----------|-------------|--------|
| 1 | `miet-check-pro` | github.com/alexanderdeibel-Fintutto/miet-check-pro | `miet-check-pro-458b8dcf` | Archivieren |
| 2 | `miet-check-pro-87` | github.com/alexanderdeibel-Fintutto/miet-check-pro-87 | `miet-check-pro-458b8dcf` | Archivieren |
| 3 | `rent-check-buddy` | github.com/alexanderdeibel-Fintutto/rent-check-buddy | `miet-check-pro-458b8dcf` | Archivieren |
| 4 | `mietkaution-klar` | github.com/alexanderdeibel-Fintutto/mietkaution-klar | `kaution-klar` | Archivieren |
| 5 | `my-deposit-calculator` | github.com/alexanderdeibel-Fintutto/my-deposit-calculator | `kaution-klar` | Archivieren |
| 6 | `deposit-check-pro` | github.com/alexanderdeibel-Fintutto/deposit-check-pro | `kaution-klar` (Checker) | Archivieren |
| 7 | `FT_CALC_RENDITE` | github.com/alexanderdeibel-Fintutto/FT_CALC_RENDITE | `ft_calc_rendite-9bb37c94` | Archivieren |
| 8 | `vermietify` | github.com/alexanderdeibel-Fintutto/vermietify | `vermieter-freude` (alt) | Archivieren |
| 9 | `property-calc-hub` | github.com/alexanderdeibel-Fintutto/property-calc-hub | Portal ersetzt dies | Archivieren |
| 10 | `a-docs` | github.com/alexanderdeibel-Fintutto/a-docs | Veraltet | Prüfen/Archivieren |

---

## 2. GitHub Repos: ARCHIVIEREN (Legacy ft_*) - 9 Repos

Diese JavaScript-Repos dienen nur noch als Referenz. Archivieren, NICHT löschen!

| # | Repo-Name (exakt) | Referenz-Wert | Aktion |
|---|-------------------|---------------|--------|
| 1 | `ft_vermietify` | Hoch (631 Seiten Feature-Referenz) | Archivieren |
| 2 | `ft_fromulare_alle` | **SEHR HOCH** (Formular-Referenz!) | Archivieren |
| 3 | `ft_mieter` | Mittel | Archivieren |
| 4 | `ft_hausmeisterPro` | Mittel | Archivieren |
| 5 | `ft_hausmeister` | Niedrig | Archivieren |
| 6 | `ft_admin-hub` | Mittel | Archivieren |
| 7 | `ft_nebenkostenabrechnung` | Niedrig | Archivieren |
| 8 | `ft_ocr_zaehler` | Mittel (OCR-Logik) | Archivieren |
| 9 | `ft_calc_rendite-9bb37c94` | Niedrig | Archivieren |

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

| Aktion | Anzahl |
|--------|--------|
| **Behalten** | 21 Repos |
| **GitHub archivieren (Duplikate)** | 10 Repos |
| **GitHub archivieren (Legacy)** | 9 Repos |
| **Vercel löschen** | 7 Projekte |
| **Gesamt** | 40 Repos |
