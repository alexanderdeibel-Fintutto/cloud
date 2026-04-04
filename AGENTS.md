# AGENTS.md — fintutto.cloud Workspace

> **Für jeden Agenten, der an diesem Repository arbeitet: Diese Datei zuerst lesen.**
> Sie enthält kritische Regeln, Design-Vorgaben, Architektur-Entscheidungen und Inhalts-Richtlinien
> für die fintutto.cloud Landing Page und alle App-Unterseiten.

---

## 0. VERCEL-SCHUTZ & REGRESSIONSTESTS — PFLICHT

> Diese Regeln haben Priorität über alle anderen Abschnitte.

### Vercel Kostenoptimierung
Die `vercel.json` enthält einen `ignoreCommand` — dieser darf **niemals** entfernt werden. Er verhindert, dass Vercel bei jedem Push baut, auch wenn sich nichts geändert hat.

### Regressionstests vor jeder Änderung an `src/data/apps.js`

```bash
npm test
# oder: ./node_modules/.bin/vitest run src/test/regression/
```

**Wenn ein Test rot wird: KEIN Commit, KEIN Push.**

### Kritische Invarianten in `src/data/apps.js`
- Alle 8 Kategorien-IDs müssen vorhanden sein: `all, finance, property, translation, lifestyle, sales, admin, ai`
- Alle App-URLs müssen mit `https://` beginnen
- Kern-Apps `fintutto-app`, `translator`, `vermietify` dürfen niemals entfernt werden

### Neuen Bug dokumentieren
1. Test in `src/test/regression/core-logic.test.ts` schreiben
2. Commit-Message mit `[REG-XXX]` kennzeichnen

---

## 1. Plattform-Übersicht

**fintutto.cloud** ist der zentrale Hub für alle fintutto-Apps und -Produkte. Die Seite dient als:
- **Übersichts-Portal** für alle 26+ fintutto-Apps in 7 Kategorien
- **Einstiegspunkt** für Nutzer, die die richtige App für ihren Use-Case suchen
- **Verlinkung** zu den Flagship-Produkten fintutto.world (Translator & Guide)

| Bereich | URL | Beschreibung |
|---|---|---|
| **Cloud Hub** | `fintutto.cloud` | Diese Seite – zentraler App-Überblick |
| **Translator** | `fintutto.world` | KI-Übersetzungsplattform (Flagship) |
| **Guide** | `guide.fintutto.world` | Digitale Guide-Plattform (Flagship) |
| **App-Unterseiten** | `fintutto.cloud/apps/[slug]` | Individuelle Landing Pages pro App |

**Wichtig:** Der Markenname ist **fintutto** — mit **N** (nicht "FitTutto" oder "FitTuto").

---

## 2. Design System — PFLICHTLEKTÜRE für alle Frontend-Arbeiten

Bevor du eine neue Seite, Komponente oder ein Redesign erstellst, MUSST du folgende Dateien lesen:

| Datei | Zweck |
|---|---|
| `docs/DESIGN_SYSTEM.md` | Kurz-Referenz: Farben, Glassmorphism, Typografie, Spacing |
| `docs/DESIGN_SYSTEM_CATALOG.md` | Vollständiger Katalog mit Code-Beispielen für alle Komponenten |
| `src/index.css` | Globale CSS-Klassen (`.glass-card`, Gradient-Klassen) |

**Goldstandard-Regeln:**
- Niemals `bg-white` oder helle Hintergründe auf Haupt-Containern
- Immer `.glass-card` für Karten und Container
- Hintergrund: `#2d1b4e` + `fintutto-logo.svg` als `fixed inset-0 w-full h-full object-cover opacity-70`
- Gradients für Headlines: `from-purple-400 to-pink-400` (Premium) oder `from-cyan-400 to-blue-500` (Tech)
- Font: Inter, Base-Size 18px
- Mobile First: Grids brechen auf `grid-cols-1` um

---

## 3. App-Unterseiten — Architektur

Jede App hat eine eigene Landing Page unter `/apps/[slug]`. Diese Seiten sind:
- **Nicht direkt von der Homepage verlinkt** (kein direkter Link in der App-Karte)
- **Über die URL erreichbar**: `fintutto.cloud/apps/vermietify`, `fintutto.cloud/apps/guide-translator` etc.
- **Zielgruppenspezifisch**: Jede Seite spricht die Persona der jeweiligen App direkt an

### 3.1 Struktur jeder App-Unterseite

```
1. Hero Section      — Headline, Subline, CTA (Zielgruppe ansprechen)
2. Pain Points       — "Das kennst du" — Probleme der Zielgruppe
3. Features          — 3-6 Kernfunktionen mit Icons und Beschreibungen
4. Social Proof      — Testimonial/Zitat (Platzhalter)
5. CTA Section       — Abschluss mit klarem Call-to-Action
```

### 3.2 Routing

```
/                    → Homepage (App-Übersicht)
/apps/[slug]         → App-Unterseite
```

React Router v6 wird verwendet. Kein Server-Side-Rendering.

---

## 4. Tonalität & Ansprache pro Kategorie

| Kategorie | Zielgruppe | Tonalität |
|---|---|---|
| **Immobilien** | Vermieter, Hausverwaltungen | Professionell, sachlich, ROI-fokussiert |
| **Übersetzung** | Stadtführer, Behörden, Kliniken, Events | Vertrauensvoll, technisch kompetent |
| **Lifestyle** | Privatpersonen, Alltag | Freundlich, locker, alltagsnah |
| **Sales** | Vertriebsteams, B2B | Ergebnisorientiert, direkt, zahlenbasiert |
| **Admin** | IT, Verwaltung, Entwickler | Technisch präzise, effizient |
| **KI & Lernen** | Wissbegierige, Jobsuchende | Motivierend, zugänglich, zukunftsorientiert |
| **Guide** | Tourismus, Museen, Städte | Inspirierend, kulturell, erlebnisorientiert |

---

## 5. Kritische Regeln — NIEMALS verletzen

### 5.1 Design
- **Kein weißer Hintergrund** auf irgendeiner Seite
- **Immer `.glass-card`** für Karten — nie eigene `background`-Styles erfinden
- **Immer `fintutto-logo.svg`** als Hintergrundbild (liegt in `/public/`)
- **Niemals Emojis** in Überschriften oder Fließtext (nur in Icon-Containern als Fallback)

### 5.2 Inhalt
- **Niemals "FitTutto"** schreiben — immer **fintutto** (klein, mit N)
- **Immer deutsche Umlaute** verwenden (ä, ö, ü, ß) — keine Ersatzschreibweise
- **Zielgruppe direkt ansprechen** — keine generischen Texte
- **Pain Points vor Features** — erst das Problem, dann die Lösung

### 5.3 Technisch
- **React Router v6** für alle Routen
- **Kein direkter Link** von App-Karten zur Unterseite auf der Homepage (separate Navigation)
- **Build muss fehlerfrei** sein vor jedem Commit

---

## 6. Deployment

| Umgebung | URL | Trigger |
|---|---|---|
| **Production** | `fintutto.cloud` | Push auf `main` |
| **Preview** | Vercel Preview URL | Push auf Feature-Branch |

**Framework:** Vite + React (kein Next.js!)
**Vercel-Konfiguration:** `vercel.json` mit `framework: "vite"` und SPA-Rewrites

---

## 7. Checkliste vor jedem Commit

- [ ] `npm run build` läuft fehlerfrei durch
- [ ] Kein `bg-white` oder heller Hintergrund auf Haupt-Containern
- [ ] Alle neuen Seiten verwenden `.glass-card`
- [ ] Alle Texte in korrektem Deutsch mit Umlauten
- [ ] Keine `console.error` in den geänderten Dateien
- [ ] `vercel.json` enthält SPA-Rewrite-Regel für alle `/apps/` Routen

---

## 8. App-Verzeichnis (alle 26 Apps)

### Immobilien
- `vermietify` — Vermietify (Mietverwaltung)
- `hausmeister-pro` — HausmeisterPro (Objektbetreuung)
- `vermieter-portal` — Vermieter-Portal (Mieter-Kommunikation)
- `immobilien-check` — ImmobilienCheck (Bewertung & Analyse)

### Übersetzung (fintutto.world)
- `guide-translator` — GuideTranslator (Stadtführer, Kreuzfahrt)
- `amt-translator` — AmtTranslator (Behörden)
- `med-translator` — MedTranslator (Klinik/Arztpraxis)
- `event-translator` — EventTranslator (Konferenzen, Messen)
- `translator-listener` — Translator Listener (Zuhörer-App)
- `translator-landing` — Translator Landing (Übersicht)
- `sales-translator` — Sales Translator (Vertrieb)

### Guide (fintutto.world)
- `art-guide` — ArtGuide (Museen & Galerien)
- `city-guide` — CityGuide (Stadtführungen)
- `region-guide` — RegionGuide (Tourismusregionen)

### Lifestyle
- `fitness` — Fitness (Workout-Tracker)
- `zimmerpflanze` — Zimmerpflanze (Pflanzenpflege)
- `luggagex` — LuggageX (Gepäckverwaltung)

### Sales & Marketing
- `sales-guiding-group` — Sales Guiding Group (Vertrieb)

### Admin & Tools
- `commander` — Commander (Service-Steuerung)
- `admin-panel` — Admin Panel (Benutzerverwaltung)
- `portal` — Portal (Zugangsportal)
- `bescheid-boxer` — BescheidBoxer (Bescheid-Verarbeitung)

### KI & Lernen
- `ai-guide` — AI Guide (KI-Assistent)
- `lernen` — Lernen (E-Learning)
- `arbeitslos-portal` — Arbeitslos Portal (Jobsuche-Hilfe)

---

*Zuletzt aktualisiert: 2026-04-04 — Initial Cloud Hub Setup*
*Verantwortlich: Alexander Deibel / fintutto.cloud*
