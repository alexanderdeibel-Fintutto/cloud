# Fintutto Ecosystem

Monorepo für alle selbst-gehosteten Fintutto Apps.

## Apps

| App | Beschreibung | Domain |
|-----|--------------|--------|
| `vermietify` | Immobilienverwaltung für Vermieter | vermietify.fintutto.cloud |

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
VITE_SUPABASE_URL=https://aaefocdqgdgexkcrjhks.supabase.co
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
│   ├── vermietify/          # Vermieter-App
│   └── (weitere apps)
├── packages/
│   └── shared/              # Geteilte Komponenten
├── docs/                    # Dokumentation
└── pnpm-workspace.yaml
```

## Dokumentation

- [Konsolidierungsplan](./KONSOLIDIERUNGSPLAN_VERMIETIFY.md)
- [Gap Analyse](./GAP_ANALYSE_VERMIETIFY.md)
- [Lovable Prompts](./LOVABLE_PROMPTS_KOMPLETT.md)
