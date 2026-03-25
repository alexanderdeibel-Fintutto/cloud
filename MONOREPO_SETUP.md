# Fintutto Monorepo — Setup & Entwickler-Guide

## Übersicht

Das Fintutto-Portal ist ein **pnpm-Monorepo** mit zwei Kern-Apps und einem gemeinsamen Package.
Die Architektur ist direkt vom `translator`-Repository inspiriert.

```
portal/
├── apps/
│   ├── financial-compass/   @fintutto/app-financial-compass  (Port 5173)
│   ├── vermietify/          @fintutto/app-vermietify          (Port 5174)
│   └── fintutto-portal/     @fintutto/app-fintutto-portal     (Port 5175)
├── packages/
│   └── shared/              @fintutto/shared
│       ├── src/hooks/
│       │   ├── useBanking.ts        ← Für BEIDE Apps (FinAPI, Matching)
│       │   ├── useDocuments.ts      ← Für BEIDE Apps (OCR, Upload)
│       │   └── useWorkspace.ts      ← Multi-Tenancy (company/organization)
│       └── src/components/
│           ├── WorkspaceSwitcher.tsx ← Firma/Org-Switcher in der Sidebar
│           └── documents/
│               ├── DocumentUploadDialog.tsx
│               ├── DocumentList.tsx
│               └── BulkDocumentUpload.tsx  ← Drag&Drop, Multi-File, KI-OCR
├── vite.shared.ts           ← Gemeinsame Vite-Konfiguration (analog Translator)
├── tsconfig.base.json       ← Basis-TypeScript-Konfiguration
└── pnpm-workspace.yaml
```

## Schnellstart

```bash
# Alle Dependencies installieren
pnpm install

# Financial Compass starten (Port 5173)
pnpm dev:compass

# Vermietify starten (Port 5174)
pnpm dev:vermietify

# Beide gleichzeitig starten
pnpm dev:all

# Bauen
pnpm build:compass
pnpm build:vermietify
pnpm build:all
```

## Shared Packages nutzen

### In Financial Compass

```typescript
// Banking-Hook (FinAPI, Transaktionen, Matching)
import { useBanking } from '@fintutto/banking'

// Dokument-Upload mit KI-OCR
import { BulkDocumentUpload } from '@fintutto/documents'

// Workspace-Switcher (Firmen-Dropdown in der Sidebar)
import { WorkspaceSwitcher, useWorkspace } from '@fintutto/shared'

// Für Financial Compass: contextType = 'company'
const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace({
  supabase,
  contextType: 'company',
})
```

### In Vermietify

```typescript
// Gleiche Imports, anderer contextType
import { WorkspaceSwitcher, useWorkspace } from '@fintutto/shared'

// Für Vermietify: contextType = 'organization'
const { workspaces, activeWorkspace } = useWorkspace({
  supabase,
  contextType: 'organization',
})
```

## Neue Shared-Komponente hinzufügen

1. Datei in `packages/shared/src/components/` oder `packages/shared/src/hooks/` erstellen
2. In `packages/shared/src/index.ts` exportieren
3. In beiden Apps sofort via `@fintutto/shared` nutzbar — kein Build-Schritt nötig

## Unterschied zu Translator-Architektur

| Translator | Fintutto Portal |
|-----------|----------------|
| `src/` = gemeinsamer Code | `packages/shared/src/` = gemeinsamer Code |
| Apps importieren via `@/` | Apps importieren via `@fintutto/shared` |
| Alle Apps im gleichen Repo | Financial Compass war separates Repo → jetzt in `apps/` |
| `vite.shared.ts` im Root | `vite.shared.ts` im Root (identisches Konzept) |

## Supabase-Migrationen

Alle Migrationen liegen in `apps/financial-compass/supabase/migrations/`.
Für Vermietify-spezifische Migrationen: `apps/vermietify/supabase/migrations/`.

Gemeinsame Tabellen (Banking, Dokumente) sollten in einer zentralen Migration liegen.
