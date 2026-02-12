# URL Audit Report - Fintutto & BescheidBoxer Ecosystem

**Datum:** 2026-02-12
**Geprüfte URLs:** 218 (mit Duplikaten), ~210 unique
**Methode:** Google-Indexierung-Check via WebSearch + Statische URL-Analyse

---

## KRITISCHE BEFUNDE

### 1. KEINE einzige Domain ist bei Google indexiert

Folgende `site:`-Suchen haben **NULL Ergebnisse** geliefert:

| Domain / Bereich | Google-Indexierung |
|---|---|
| `site:bescheidboxer.de` | **NICHT INDEXIERT** |
| `site:fintutto.de` | **NICHT INDEXIERT** |
| `site:fintutto.cloud` | **NICHT INDEXIERT** |
| `site:deibel.info` | **NICHT INDEXIERT** |
| `site:anlage-v-ausfuellen.de` | **NICHT INDEXIERT** |
| `site:nebenkostenrechner.eu` | **NICHT INDEXIERT** |
| `site:mieterhoehung.eu` | **NICHT INDEXIERT** |
| `site:mieterhohung-rechner.de` | **NICHT INDEXIERT** |
| `site:kaufnebenkosten-rechner.de` | **NICHT INDEXIERT** |
| `site:meinrenditerechner.de` | **NICHT INDEXIERT** |
| `site:mietspiegel-finder.de` | **NICHT INDEXIERT** |
| `site:buergergeld-rechner.net` | **NICHT INDEXIERT** |
| `site:buergergeld-sanktion.de` | **NICHT INDEXIERT** |
| `site:buergergeld-blog.de` | **NICHT INDEXIERT** |
| `site:widerspruchjobcenter.de` | **NICHT INDEXIERT** |
| `site:diehausverwaltersoftware.de` | **NICHT INDEXIERT** |
| `site:vacationmanager.de` | **NICHT INDEXIERT** |
| `site:ftmieter.de` | **NICHT INDEXIERT** |
| `site:meinuebergabeprotokoll.de` | **NICHT INDEXIERT** |
| `site:mietvertrag-kuendigung.de` | **NICHT INDEXIERT** |
| `site:vermitify.com/.de` | **NICHT INDEXIERT** |
| `site:zaehlerapp.de` | **NICHT INDEXIERT** |
| `site:meinezaehlerapp.de` | **NICHT INDEXIERT** |
| Alle fintutto.* TLD-Varianten | **NICHT INDEXIERT** |
| Alle externen Nischen-Domains | **NICHT INDEXIERT** |

**Das bedeutet:** Keine eurer Webseiten erscheint in Google-Suchergebnissen. Das ist ein massives SEO-Problem.

### 2. Mögliche Ursachen

- **Domains nicht registriert / DNS nicht konfiguriert**
- **Webserver nicht gestartet / nicht öffentlich erreichbar**
- **robots.txt blockiert Crawler** (`Disallow: /`)
- **`noindex` Meta-Tags** auf allen Seiten
- **Keine Sitemap eingereicht** bei Google Search Console
- **Seiten sind SPAs** ohne Server-Side Rendering (Google kann JS-Inhalte schlecht indexieren)
- **Domains sind zu neu** und wurden noch nie gecrawlt

---

## URL-QUALITÄTSPROBLEME

### 3. Doppelte URLs in der Liste

| URL | Vorkommen |
|-----|-----------|
| `https://app.bescheidboxer.de/generator/widerspruch_kdu` | 2x |
| `https://fintutto.fintutto.de` | 3x |
| `https://app.fintutto.de` | 2x |
| `https://portal.fintutto.de` | 2x (+ 1x portal.fintutto.cloud) |
| `https://zaehler.fintutto.de` | 2x |

### 4. Fehlerhafte / Problematische URLs

| URL | Problem |
|-----|---------|
| `https://BB_agb.bescheidboxer.de` | Unterstrich in Subdomain ist ungültig (DNS erlaubt keine `_` in Hostnamen) |
| `https://BB_rechner-kdu.bescheidboxer.de` | Unterstrich in Subdomain ungültig |
| `https://BB_rechner.bescheidboxer.de` | Unterstrich in Subdomain ungültig |
| `https://BB_ueber-uns.bescheidboxer.de` | Unterstrich in Subdomain ungültig |
| `https://formular-sepa.fintutto.fintutto.de` | Doppeltes `fintutto.fintutto.de` - wahrscheinlich Tippfehler |
| `https://fintutto.fintutto.de` | Subdomain `fintutto` unter `fintutto.de` - redundant? |
| `"https://mieterportal.fintutto.cloud"` | Hatte Anführungszeichen in der Original-Liste |
| `https://app-hausmeister-enterprice.fintutto.de` | Tippfehler: "enterprice" statt "enterprise" |
| `https://vermietiefy.fintutto.de` | Tippfehler? "vermietiefy" vs "vermietify" |

### 5. BB_ Subdomain-Namenskonvention

Die URLs mit `BB_` Prefix verwenden Unterstriche, die in DNS-Hostnamen **nicht erlaubt** sind:
- `BB_agb.bescheidboxer.de` → sollte `agb.bescheidboxer.de` oder `app.bescheidboxer.de/agb` sein
- `BB_rechner-kdu.bescheidboxer.de` → sollte `rechner-kdu.bescheidboxer.de` sein
- `BB_rechner.bescheidboxer.de` → sollte `rechner.bescheidboxer.de` sein
- `BB_ueber-uns.bescheidboxer.de` → sollte `ueber-uns.bescheidboxer.de` sein

---

## URL-INVENTAR NACH KATEGORIE

### BescheidBoxer App (47 URLs)

| # | URL | Typ |
|---|-----|-----|
| 1 | `https://app.bescheidboxer.de/` | Startseite |
| 2 | `https://app.bescheidboxer.de/chat` | Chat |
| 3 | `https://app.bescheidboxer.de/forum` | Forum |
| 4-17 | `https://app.bescheidboxer.de/generator/*` | 14 Generatoren |
| 18 | `https://app.bescheidboxer.de/impressum` | Impressum |
| 19 | `https://app.bescheidboxer.de/musterschreiben` | Musterschreiben |
| 20-34 | `https://app.bescheidboxer.de/rechner/*` | 15 Rechner |
| 35 | `https://app.bescheidboxer.de/preise` | Preise |
| 36 | `https://app.bescheidboxer.de/checklisten` | Checklisten |
| 37 | `https://app.bescheidboxer.de/faq` | FAQ |
| 38 | `https://app.bescheidboxer.de/notfall` | Notfall |
| 39 | `https://app.bescheidboxer.de/anbieter-vergleich` | Anbieter-Vergleich |
| 40 | `https://app.bescheidboxer.de/probleme` | Probleme |
| 41 | `https://app.bescheidboxer.de/anwaltssuche` | Anwaltssuche |
| 42 | `https://app.bescheidboxer.de/lernen` | Lernen |
| 43 | `https://app.bescheidboxer.de/suche` | Suche |
| 44 | `https://app.bescheidboxer.de/erfolgsgeschichten` | Erfolgsgeschichten |
| 45 | `https://app.bescheidboxer.de/sanktions-tracker` | Sanktions-Tracker |
| 46 | `https://app.bescheidboxer.de/kontakt` | Kontakt |
| 47 | `https://app.bescheidboxer.de/tracker` | Tracker |

### BescheidBoxer Subdomains (7 URLs)

| URL | Status |
|-----|--------|
| `https://BB_agb.bescheidboxer.de` | UNGÜLTIGER HOSTNAME |
| `https://BB_rechner-kdu.bescheidboxer.de` | UNGÜLTIGER HOSTNAME |
| `https://BB_rechner.bescheidboxer.de` | UNGÜLTIGER HOSTNAME |
| `https://BB_ueber-uns.bescheidboxer.de` | UNGÜLTIGER HOSTNAME |
| `https://datenschutz.bescheidboxer.de` | Prüfen |
| `https://generator-widerspruch-kdu.bescheidboxer.de` | Prüfen |
| `https://rechner-kdu.bescheidboxer.de/` | Prüfen |

### BescheidBoxer Externe Domains (8 URLs)

| URL | Domain |
|-----|--------|
| `https://widerspruchjobcenter.de` | Nicht bei Google gefunden |
| `https://buergergeld-rechner.net` | Nicht bei Google gefunden |
| `https://buergergeld-sanktion.de` | Nicht bei Google gefunden |
| `https://buergergeldbescheid-check.de` | Nicht bei Google gefunden |
| `https://kdu-checker.de` | Nicht bei Google gefunden |
| `https://kdu-rechner.de` | Nicht bei Google gefunden |
| `https://kosten-der-unterkunft-rechner.de` | Nicht bei Google gefunden |
| `https://mehrbedarf-rechner.de` | Nicht bei Google gefunden |

### Fintutto Cloud (10 URLs)

| URL | Zweck |
|-----|-------|
| `https://fintutto.cloud` | Hauptdomain |
| `https://app.fintutto.cloud` | App |
| `https://portal.fintutto.cloud` | Portal |
| `https://betriebskosten.fintutto.cloud` | Betriebskosten |
| `https://vermietify.fintutto.cloud` | Vermietify |
| `https://zaehler.fintutto.cloud` | Zähler |
| `https://hausmeisterpro.fintutto.cloud` | Hausmeister Pro |
| `https://mieterportal.fintutto.cloud` | Mieterportal |
| `https://admin.fintutto.cloud` | Admin |
| `https://commander.fintutto.cloud` | Commander |

### Fintutto.de Apps (8 URLs)

| URL |
|-----|
| `https://app.fintutto.de` |
| `https://app-hausmeister-enterprice.fintutto.de` (**Tippfehler!**) |
| `https://app-hausmeistergo.fintutto.de` |
| `https://app-hausmeisterpro.fintutto.de` |
| `https://app-mieter.fintutto.de` |
| `https://app-vermietify.fintutto.de` |
| `https://app-zaehler.fintutto.de` |
| `https://app-firma.fintutto.de` |

### Fintutto.de Bundles (17 URLs)

17 Bundle-URLs (`bundle-*.fintutto.de`)

### Fintutto.de Checker (11 URLs)

11 Checker-URLs (`checker-*.fintutto.de` + `checker.fintutto.de`)

### Fintutto.de Formulare (28 URLs)

28 Formular-URLs (`formular-*.fintutto.de` + `formulare.fintutto.de`)
- **Achtung:** `formular-sepa.fintutto.fintutto.de` hat doppelte Domain!

### Fintutto.de Rechner (12 URLs)

12 Rechner-URLs (`rechner-*.fintutto.de` + `rechner.fintutto.de`)

### Fintutto.de Tools/Sonstige (19 URLs)

Diverse Tool-Subdomains auf `fintutto.de`

### Externe Fintutto-Domains (35 URLs)

35 separate Domains wie `anlage-v-ausfuellen.de`, `kaufnebenkosten-rechner.de`, etc.

### Fintutto TLD-Varianten (7 URLs)

| Domain | TLD |
|--------|-----|
| `https://fintutto.info` | .info |
| `https://fintutto.online` | .online |
| `https://fintutto.org` | .org |
| `https://fintutto.shop` | .shop |
| `https://fintutto.site` | .site |
| `https://fintutto.space` | .space |
| `https://fintutto.store` | .store |

### Sonstige (4 URLs)

| URL |
|-----|
| `https://deibel.info` |
| `https://vermitify.com` |
| `https://vermitify.de` |
| `https://zaehlerapp.de` |

---

## EMPFEHLUNGEN

### Sofort-Maßnahmen (Kritisch)

1. **DNS/Hosting prüfen:** Sind alle Domains registriert und zeigen auf einen Webserver?
2. **SSL-Zertifikate:** Für alle Domains SSL-Zertifikate einrichten (Let's Encrypt)
3. **BB_ URLs korrigieren:** Unterstriche in Subdomains sind ungültig - umbenennen zu Bindestrichen
4. **Tippfehler korrigieren:**
   - `enterprice` → `enterprise`
   - `vermietiefy` → `vermietify`
   - `formular-sepa.fintutto.fintutto.de` → `formular-sepa.fintutto.de`
5. **Duplikate bereinigen** in der URL-Liste

### SEO-Maßnahmen (Hoch)

6. **Google Search Console** für alle Domains einrichten
7. **Sitemap.xml** für jede Domain/Subdomain erstellen und einreichen
8. **robots.txt** prüfen - kein `Disallow: /` für öffentliche Seiten
9. **Meta Tags** auf jeder Seite:
   - `<title>` - einzigartiger, beschreibender Titel
   - `<meta name="description">` - 150-160 Zeichen Beschreibung
   - `<link rel="canonical">` - kanonische URL
   - Open Graph Tags (`og:title`, `og:description`, `og:image`)
10. **Google Analytics / GTM** auf allen öffentlichen Seiten einbinden
11. **Server-Side Rendering (SSR)** implementieren falls SPAs verwendet werden

### Strukturelle Empfehlungen

12. **Domain-Konsolidierung erwägen:** 200+ Domains/Subdomains sind schwer zu verwalten
    - Statt `rechner-darlehen.fintutto.de` → `fintutto.de/rechner/darlehen`
    - Statt `formular-kaution.fintutto.de` → `fintutto.de/formulare/kaution`
    - Das verbessert SEO (Domain Authority konzentrieren)
13. **Redirect-Strategie:** Alle Varianten-Domains auf Haupt-Domain weiterleiten
14. **Monitoring einrichten:** Uptime-Monitoring für kritische URLs

---

## FEHLENDE SEITEN / GAPS

Basierend auf dem Produktangebot fehlen möglicherweise:

### BescheidBoxer
- `/datenschutz` (nur als Subdomain, nicht als App-Pfad)
- `/agb` (nur als ungültige BB_agb Subdomain)
- `/ueber-uns` (nur als ungültige BB_ueber-uns Subdomain)

### Fintutto
- Keine zentrale Sitemap/Übersichtsseite die alle Tools verlinkt
- Kein Blog/Content für SEO-Zwecke (außer buergergeld-blog.de)

---

## SCRIPT ZUR LIVE-PRÜFUNG

Ein vollständiges Python-Script zur Live-Prüfung aller URLs liegt bereit unter:
```
url-audit/check_all_urls.py
```

Ausführung:
```bash
pip install requests beautifulsoup4
python3 url-audit/check_all_urls.py
```

Das Script generiert:
- `url_audit_results.csv` - Importierbar in Google Sheets
- `url_audit_report.md` - Lesbarer Bericht
- `url_audit_results.json` - Maschinenlesbar

---

*Dieser Bericht wurde am 2026-02-12 erstellt. Für aktuelle Ergebnisse bitte das Python-Script lokal ausführen.*
