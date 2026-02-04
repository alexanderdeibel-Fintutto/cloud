# Fintutto Mieter-Checker

Eine vollstaendige React-Anwendung fuer Mieter, die ihre Mietrechte pruefen moechten.

## Features

- **10 spezialisierte Checker** fuer verschiedene Mietrechts-Themen
- **KI-gestuetzte Beratung** bei jedem Eingabefeld
- **Sofortige Ergebnisse** mit Handlungsempfehlungen
- **Direkte Integration** mit der Formulare-App
- **Tier-basiertes System** (Free: 3 Checks, Basic: 20, Premium: 100, Professional: unbegrenzt)

## Verfuegbare Checker

| Checker | Domain | Beschreibung |
|---------|--------|--------------|
| Mietpreisbremse | checker-mietpreisbremse.fintutto.de | Pruefen, ob die Miete zu hoch ist |
| Mieterhoehung | checker-mieterhoehung.fintutto.de | Mieterhoehungen auf Wirksamkeit pruefen |
| Nebenkosten | checker-nebenkosten.fintutto.de | Nebenkostenabrechnungen pruefen |
| Betriebskosten | checker-betriebskosten.fintutto.de | Detaillierte Betriebskostenpruefung |
| Kuendigung | checker-kuendigung.fintutto.de | Kuendigungen auf Wirksamkeit pruefen |
| Kaution | checker-kaution.fintutto.de | Kautionsrueckforderung pruefen |
| Mietminderung | checker-mietminderung.fintutto.de | Minderungsquote berechnen |
| Eigenbedarf | checker-eigenbedarf.fintutto.de | Eigenbedarfskuendigungen pruefen |
| Modernisierung | checker-modernisierung.fintutto.de | Modernisierungsumlagen pruefen |
| Schoenheitsreparaturen | checker-schoenheitsreparaturen.fintutto.de | Renovierungspflicht pruefen |

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Backend**: Supabase (Auth, Database, Storage)
- **Animation**: Framer Motion

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build
```

## Umgebungsvariablen

Erstelle eine `.env` Datei:

```env
VITE_SUPABASE_URL=https://aaefocdqgdgexkcrjhks.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FORMULARE_APP_URL=https://formulare.fintutto.cloud
VITE_CLAUDE_API_ENDPOINT=https://api.fintutto.cloud/ai
```

## Supabase Setup

Fuehre das Schema-Script aus:

```bash
# In Supabase SQL Editor
supabase/schema.sql
```

## Projektstruktur

```
src/
├── components/
│   ├── checker/          # Checker-spezifische Komponenten
│   ├── layout/           # Layout-Komponenten (Header, Footer)
│   └── ui/               # Wiederverwendbare UI-Komponenten
├── contexts/
│   ├── AuthContext.tsx   # Authentifizierung
│   └── CheckerContext.tsx # Checker-Logik
├── integrations/
│   └── supabase/         # Supabase Client & Types
├── lib/
│   └── utils.ts          # Hilfsfunktionen
├── pages/
│   ├── checkers/         # Alle Checker-Seiten
│   ├── HomePage.tsx      # Startseite
│   ├── DashboardPage.tsx # Nutzer-Dashboard
│   └── ResultPage.tsx    # Ergebnis-Anzeige
└── App.tsx               # Haupt-App mit Routing
```

## Integration mit Formulare-App

Nach Abschluss eines Checks wird der Nutzer automatisch zum passenden Formular in der Formulare-App weitergeleitet. Die Daten werden per URL-Parameter uebergeben:

```
https://formulare.fintutto.cloud/formulare/mietpreisbremse-ruege?plz=10115&kaltmiete=850&...
```

## Lizenz

Proprietaer - Fintutto GmbH
