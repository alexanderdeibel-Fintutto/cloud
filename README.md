# Fintutto Ecosystem

Monorepo für alle selbst-gehosteten Fintutto Apps.

## Apps

| App | Beschreibung | Domain |
|-----|--------------|--------|
| `vermietify` | Immobilienverwaltung für Vermieter | vermietify.fintutto.cloud |
| `vermieter-portal` | Rechner & Formulare für Vermieter (legacy, wird ersetzt) | - |
| `fintutto-portal` | **NEU** Unified Portal: Rechner + Checker + Formulare | portal.fintutto.cloud |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Vercel

## Setup

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Create .env file
cp apps/vermietify/.env.example apps/vermietify/.env

# Start development server
pnpm dev:vermietify
```

## Environment Variables

Erstelle `apps/vermietify/.env`:

```env
VITE_SUPABASE_URL=https://aaefocqdgdgexkcrjhks.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

Jede App wird separat auf Vercel deployed:

1. Vercel Projekt erstellen
2. Root Directory: `apps/vermietify`
3. Environment Variables hinzufügen
4. Deploy

## Struktur

```
fintutto-ecosystem/
├── apps/
│   ├── vermietify/          # Vermieter-Dashboard (Referenz)
│   ├── vermieter-portal/    # Rechner + Formulare (legacy → fintutto-portal)
│   └── fintutto-portal/     # NEU: Unified Portal (Rechner + Checker + Formulare)
├── packages/
│   └── shared/              # Geteilte Komponenten
├── src/                     # Mieter-Checker (Root-App, wird in Portal integriert)
├── supabase/                # Datenbank-Schema
└── pnpm-workspace.yaml
```

## Dokumentation

- [Inventar Komplett](./INVENTAR_KOMPLETT.md) - Vollständige Bestandsaufnahme aller 39 Repos
- [6-App-Architektur](./ARCHITEKTUR_6_APPS.md) - Konsolidierungsplan auf 6 Apps
- [Vercel Env Guide](./VERCEL_ENV_GUIDE.md) - Environment Variables Konfiguration
- [Konsolidierungsplan](./KONSOLIDIERUNGSPLAN_VERMIETIFY.md)
- [Gap Analyse](./GAP_ANALYSE_VERMIETIFY.md)
- [Lovable Prompts](./LOVABLE_PROMPTS_KOMPLETT.md)
