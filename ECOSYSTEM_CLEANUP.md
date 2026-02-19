# Fintutto Ecosystem Cleanup & Konsolidierung

> Erstellt: 2026-02-19
> Status: In Bearbeitung
> Ziel: 43 Repos → 11 aktive Kern-Repos + archivierte Backups

---

## 1. Übersicht: 11 Aktive Kern-Repos

| # | Repo | Zweck | Status |
|---|------|-------|--------|
| 1 | **portal** | Zentrales Hub: 10 Checker, 7 Rechner, 10 Formulare, Auth, Stripe, Credits | Aktiv |
| 2 | **ablesung** | Zählerablesung mit OCR, Solar/PV, Wärmepumpe, Energieanalyse | Aktiv |
| 3 | **vermietify_final** | Vermietungs-Management: Gebäude, Mieter, Verträge, Steuern | Aktiv |
| 4 | **bescheidboxer** | Steuer-/Bescheid-Dokumenten-Tool (47 Seiten) | Aktiv |
| 5 | **hausmeisterPro** | Hausmeister-/Facility-Management | Aktiv |
| 6 | **mieter** | Mieter-Portal und -Verwaltung | Aktiv |
| 7 | **fintutto-command-center** | Zentrales Command Center | Aktiv |
| 8 | **fintutto-your-financial-compass** | Finanz-Kompass / Übersicht | Aktiv |
| 9 | **ft_admin-hub** | Admin-Hub → **Umbenennen zu `fintutto-admin-hub`** | Umbenennen |
| 10 | **a-docs** | Dokumentations-Hub (180+ Dokumente, Schemas, Prompts) | Aktiv |
| 11 | **fintutto-command-center** | Command Center Dashboard | Aktiv |

---

## 2. Feature-Audit Ergebnisse

### 2A: vermietify-altausbase (2.525 Commits) → vermietify_final

**Ergebnis: 82% Feature-Overlap. vermietify_final ist moderner (TypeScript/Supabase), aber es fehlen:**

| Fehlend in vermietify_final | Priorität | Aufwand |
|------------------------------|-----------|---------|
| Komplettes Steuersystem DE/AT/CH (Anlage V/KAP/SO) | HOCH | 2-3 Wochen |
| Steuer-Optimierungs-Tools (Abschreibungs-Maximierung) | HOCH | 1-2 Wochen |
| AfA-Rechner (Abschreibung für Abnutzung) | HOCH | 3-5 Tage |
| Multi-Country Tax Support (DE/AT/CH) | HOCH | 1-2 Wochen |
| Capital Gains Management | MITTEL | 1 Woche |
| Multi-Tenancy (Reseller/Partner-Modell) | MITTEL | 2-3 Wochen |
| Immobilien-Bewertungs-Tools | MITTEL | 3-5 Tage |
| API Key Management | MITTEL | 2-3 Tage |
| SMS Integration | NIEDRIG | 1-2 Tage |
| Crypto Tax Reporting | NIEDRIG | 3-5 Tage |

**Architektur-Migration:** Base44 Entity-Aufrufe → Supabase useQuery + DB-Queries; Base44 Deno Functions → Supabase Edge Functions.

### 2B: ft_ocr_zaehler-base44 (754 Commits) → ablesung

**Ergebnis: ablesung ist bereits 85% komplett und ÜBERTRIFFT das Original in vielen Bereichen!**

**ablesung hat MEHR als ft_ocr_zaehler-base44:**
- SolarDashboard mit Wetter-Forecast (Open-Meteo API)
- Wärmepumpen-COP-Tracking mit Effizienz-Ratings
- Energiefluss-Visualisierung (animiert)
- Spar-Simulator mit 5 vordefinierten Szenarien
- QR-Code Zähler-Label-Generator
- Zählerablese-Terminplaner
- AI Energie-Chat-Berater
- Verbrauchsheatmap
- MieterStrom-Dashboard

**Fehlend in ablesung:**

| Fehlend | Priorität | Aufwand |
|---------|-----------|---------|
| Rechnungs-/Beleg-OCR (Versorger-Rechnungen scannen) | HOCH | 3-5 Tage |
| Admin-Dashboard (System-Monitoring) | MITTEL | 2-3 Tage |
| Dark Mode Toggle | NIEDRIG | 1 Tag |
| Detaillierte Compliance-Seiten (AGB, Datenschutz) | NIEDRIG | 1 Tag |
| Feature-Flag-Management | NIEDRIG | 2 Tage |

### 2C: fintutto-rent-wizard (79 Commits) + fintutto-miet-recht (67 Commits) → portal

**Ergebnis: Portal hat bereits MEHR Features als beide Quell-Repos zusammen!**

Portal hat: 10 Checker, 7 Rechner, 10 Formulare, Auth, Stripe, Credits, Referral.

**Sinnvoll zu integrieren:**

| Feature | Quelle | Priorität | Aufwand |
|---------|--------|-----------|---------|
| Gespeicherte Berechnungen (mit Abo-Limits) | rent-wizard | MITTEL | 3-5 Tage |
| Immobilien-Verwaltungs-UI (Objekte) | miet-recht | MITTEL | 3-5 Tage |
| PDF-Generierung für Rechtsdokumente | miet-recht | MITTEL | 2-3 Tage |
| Validierungs-Schemas (Mietrecht-Regeln) | miet-recht | NIEDRIG | 2-3 Tage |
| Karten-/Geolocation-Features | miet-recht | NIEDRIG | 1 Woche |
| AI-Assistent | miet-recht | NIEDRIG | 1 Woche |

### 2D: betriebskosten (71 Commits) → portal (als Modul)

**Ergebnis: Eigenständige, produktionsreife App. KEIN Overlap mit Bescheidboxer.**

Betriebskosten ist ein vollständiges Nebenkostenabrechnungs-System:
- 8-Schritte-Abrechnungs-Wizard
- 5 Umlageschlüssel (Fläche, Personen, Einheiten, Verbrauch, Direkt)
- Gebäude/Einheiten/Mieter-Verwaltung
- Heizkosten-Verteilung
- Beleg-Verwaltung mit Audit-Trail
- 9 Supabase-Migrationen

**Empfehlung:** Als eigenständiges Modul ins Portal-Monorepo integrieren (`/apps/betriebskosten-helfer`).

---

## 3. Archivierungs-Plan: 32 Repos

### Sofort archivierbar (Leer/Skelett - 12 Repos)

| Repo | Commits | Grund |
|------|---------|-------|
| `ft_hausmeister` | 1 | Nur .gitattributes |
| `ft_ocr_zaehler` | 1 | Nur .gitattributes |
| `vermietify` | 0 | Komplett leer |
| `FT_CALC_RENDITE` | 0 | Komplett leer |
| `ft_hausmeisterPro` | 1 | Skelett |
| `ft_mieter` | 2 | Skelett |
| `ft_vermietify` | 2 | Skelett |
| `ft_fromulare_alle` | 2 | Skelett |
| `ft_nebenkostenabrechnung` | 1 | Skelett |
| `ft_calc_rendite-9bb37c94` | 1 | Skelett |
| `Google-API-f-r-Fintutto` | 1 | Skelett |
| `ft_admin-hub` | 1 | Leer (nach Umbenennung) |

### Prototypen archivierbar (17 Repos)

| Repo | Commits | Grund |
|------|---------|-------|
| `miet-check-pro-87` | 3 | Duplikat |
| `my-deposit-calculator` | 4 | Prototyp |
| `mietkaution-klar` | 5 | Prototyp |
| `property-calc-hub` | 5 | Prototyp |
| `schoenheit-fintutto` | 6 | Prototyp |
| `k-ndigungs-check-pro` | 6 | Prototyp |
| `check-mieterhoehung2-fintutto` | 7 | Prototyp |
| `grundsteuer-easy` | 12 | Prototyp |
| `apps-fintutto-portal` | 12 | Alte Portal-Version |
| `miet-check-pro` | 13 | Prototyp |
| `deposit-check-pro` | 13 | Prototyp |
| `property-equity-partner` | 13 | Prototyp |
| `rent-check-buddy` | 14 | Prototyp |
| `admin` | 17 | Alte Admin-Version |
| `your-property-costs` | 17 | Prototyp |
| `miet-check-pro-458b8dcf` | 19 | Duplikat |
| `kaution-klar` | 21 | Prototyp |

### Nach Feature-Audit archivierbar (6 Repos)

| Repo | Commits | Grund |
|------|---------|-------|
| `mietenplus-rechner` | 37 | Features im Portal abgedeckt |
| `fintutto-miet-recht` | 67 | Features im Portal abgedeckt |
| `betriebskosten` | 71 | Nach Integration ins Portal archivieren |
| `fintutto-rent-wizard` | 79 | Features im Portal abgedeckt |
| `ft_ocr_zaehler-base44` | 754 | ablesung ist 85%+ komplett |
| `vermietify-altausbase` | 2.525 | vermietify_final ist der Nachfolger |

**Hinweis:** Archivierung macht Repos read-only auf GitHub. Der Code bleibt dort jederzeit lesbar und klonbar!

---

## 4. Lokale Datei-Organisation

### Empfohlene Ordnerstruktur

```
~/fintutto-ecosystem/
├── portal/                          # Zentrales Hub
├── ablesung/                        # Zählerablesung + OCR
├── vermietify_final/                # Vermietungs-Management
├── bescheidboxer/                   # Steuer-/Bescheid-Tool
├── hausmeisterPro/                  # Facility Management
├── mieter/                          # Mieter-Portal
├── fintutto-command-center/         # Command Center
├── fintutto-your-financial-compass/ # Finanz-Kompass
├── fintutto-admin-hub/              # Admin Hub
├── a-docs/                          # Dokumentation
└── _archiv/                         # Optional: Lokale Kopien alter Repos
```

### Lokales Verschieben - Was geht, was nicht

**Sicher:**
- Ganze Repo-Ordner verschieben → Git-History bleibt intakt
- `git log`, `git status`, `git push` funktionieren weiterhin
- Der `.git`-Ordner enthält alles Nötige

**Anpassen nach Verschieben:**
- IDE-Projekte (VS Code) neu öffnen
- `.env`-Dateien mit absoluten Pfaden prüfen
- Symlinks müssen neu erstellt werden
- `node_modules/` kann gelöscht und neu installiert werden (`npm install`)

### Verschiebe-Befehle (auf deinem Mac)

```bash
# 1. Ziel-Ordner erstellen
mkdir -p ~/fintutto-ecosystem

# 2. Kern-Repos verschieben (Pfade anpassen!)
mv ~/pfad/zu/portal ~/fintutto-ecosystem/
mv ~/pfad/zu/ablesung ~/fintutto-ecosystem/
mv ~/pfad/zu/vermietify_final ~/fintutto-ecosystem/
mv ~/pfad/zu/bescheidboxer ~/fintutto-ecosystem/
mv ~/pfad/zu/hausmeisterPro ~/fintutto-ecosystem/
mv ~/pfad/zu/mieter ~/fintutto-ecosystem/
mv ~/pfad/zu/fintutto-command-center ~/fintutto-ecosystem/
mv ~/pfad/zu/fintutto-your-financial-compass ~/fintutto-ecosystem/
mv ~/pfad/zu/fintutto-admin-hub ~/fintutto-ecosystem/
mv ~/pfad/zu/a-docs ~/fintutto-ecosystem/

# 3. Optional: Alte Repos ins Archiv
mkdir -p ~/fintutto-ecosystem/_archiv
mv ~/pfad/zu/alte-repos/* ~/fintutto-ecosystem/_archiv/

# 4. Prüfen ob Git noch funktioniert
cd ~/fintutto-ecosystem/portal && git status
cd ~/fintutto-ecosystem/ablesung && git remote -v
```

---

## 5. Feature-Integration Roadmap

### Phase 1: Quick Wins (1-2 Wochen)
- [ ] Rechnungs-OCR in `ablesung` implementieren (aus ft_ocr_zaehler-base44)
- [ ] Gespeicherte Berechnungen im `portal` (aus rent-wizard)
- [ ] Legal Pages im Portal ergänzen (AGB, Datenschutz, Impressum)

### Phase 2: Kern-Features (3-6 Wochen)
- [ ] Steuersystem DE/AT/CH in `vermietify_final` (aus vermietify-altausbase)
- [ ] AfA-Rechner in `vermietify_final`
- [ ] Betriebskosten-Modul ins Portal integrieren
- [ ] Immobilien-Verwaltungs-UI ins Portal (aus miet-recht)

### Phase 3: Erweiterte Features (6-12 Wochen)
- [ ] Multi-Tenancy in `vermietify_final`
- [ ] PDF-Generierung im Portal
- [ ] Admin-Dashboard in `ablesung`
- [ ] Capital Gains Management in `vermietify_final`

### Phase 4: Polish (fortlaufend)
- [ ] Dark Mode überall
- [ ] AI-Assistent-Integration
- [ ] Karten-/Geolocation-Features
- [ ] Cross-Sell zwischen allen Apps
