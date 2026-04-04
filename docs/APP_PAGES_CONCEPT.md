# Konzept: App-Unterseiten für fintutto.cloud

Dieses Dokument definiert die Struktur, das Routing und die inhaltliche Ausrichtung für alle 26 App-Unterseiten auf `fintutto.cloud`.

## 1. Architektur & Routing

Jede App erhält eine eigene Landing Page unter der Route `/apps/[slug]`.
Die Homepage (`/`) bleibt die zentrale Übersicht, verlinkt aber **nicht** direkt auf die Unterseiten (gemäß Anforderung). Die Unterseiten sind eigenständige Landing Pages für spezifische Marketing-Kampagnen.

**Technischer Stack:**
- React Router v6 (`BrowserRouter`)
- Dynamische Route: `<Route path="/apps/:slug" element={<AppLandingPage />} />`
- Datenquelle: `src/data/apps.js` (wird um detaillierte Inhalte erweitert)

## 2. Seitenstruktur (Das Template)

Jede App-Unterseite folgt einem strikten, auf Conversion optimierten Aufbau im Fintutto-Goldstandard:

1. **Hero Section**
   - Großes App-Icon (Glow-Effekt)
   - Zielgruppenspezifische Headline (Gradient)
   - Klare Subline (Das Wertversprechen)
   - Primary CTA ("Jetzt starten" / "Demo buchen")
   - Secondary CTA ("Zur App")

2. **Pain Points ("Das kennst du")**
   - 3 emotionale Schmerzpunkte der Zielgruppe
   - Rote/Orange Akzente für das Problem

3. **Solution / Features**
   - 3-6 Kernfunktionen als Glass-Cards
   - Fokus auf den Nutzen, nicht nur auf die Technik

4. **Social Proof / Trust**
   - Platzhalter für Testimonials oder Statistiken
   - "100% Cloud-native", "DSGVO-konform"

5. **Final CTA**
   - Abschluss-Aufruf mit Gradient-Button

## 3. Tonalität & Inhalte pro Kategorie

### 3.1 Immobilien (z.B. Vermietify, HausmeisterPro)
- **Zielgruppe:** Vermieter, Hausverwaltungen, Immobilien-Investoren
- **Tonalität:** Professionell, ROI-fokussiert, effizient
- **Pain Points:** Papierkram, unbezahlte Mieten, unübersichtliche Nebenkostenabrechnungen
- **Keywords:** Automatisierung, Rendite, Zeitersparnis, Rechtssicherheit

### 3.2 Übersetzung (z.B. AmtTranslator, MedTranslator)
- **Zielgruppe:** Behörden, Kliniken, Event-Veranstalter
- **Tonalität:** Vertrauensvoll, technisch kompetent, sicher
- **Pain Points:** Sprachbarrieren, teure Dolmetscher, Datenschutz-Bedenken
- **Keywords:** Echtzeit, DSGVO-konform, Offline-fähig, Fachvokabular

### 3.3 Guide (z.B. ArtGuide, CityGuide)
- **Zielgruppe:** Museumsdirektoren, Tourismus-Manager
- **Tonalität:** Inspirierend, kulturell, erlebnisorientiert
- **Pain Points:** Keine App-Downloads durch Besucher, teure Audio-Produktionen
- **Keywords:** KI-Bilderkennung, 20 Sprachen, Magic Button, ohne Installation

### 3.4 Lifestyle (z.B. Fitness, Zimmerpflanze)
- **Zielgruppe:** Privatpersonen, Alltag
- **Tonalität:** Freundlich, motivierend, alltagsnah
- **Pain Points:** Vergesslichkeit, fehlende Motivation, Chaos
- **Keywords:** Dein Begleiter, smart, einfach, Tracker

### 3.5 Admin & Tools (z.B. Commander, BescheidBoxer)
- **Zielgruppe:** IT-Admins, Verwaltung, Entwickler
- **Tonalität:** Technisch präzise, effizient, kontrolliert
- **Pain Points:** System-Chaos, manuelle Prozesse, fehlende Übersicht
- **Keywords:** Zentrale Steuerung, Automatisierung, Dashboard, API

## 4. Umsetzungsschritte

1. **React Router Setup:** `main.jsx` und `App.jsx` für Routing umbauen.
2. **Datenstruktur erweitern:** `apps.js` um detaillierte Inhalte (Pain Points, Features) für jede App ergänzen.
3. **Template-Komponente bauen:** `AppLandingPage.jsx` erstellen, die das Design-System nutzt.
4. **Inhalte generieren:** Für alle 26 Apps die spezifischen Texte gemäß der Tonalität einfügen.
