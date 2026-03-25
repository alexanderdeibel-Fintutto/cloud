# Fintutto Monorepo Architektur

## Zielsetzung
Das Ziel ist es, die bewährte Architektur aus dem `translator`-Repository auf das `portal`-Repository (Financial Compass + Vermietify) zu übertragen. Dies ermöglicht maximale Code-Wiederverwendung, konsistentes Design und zentrale Wartung von Kernfunktionen wie Banking, Dokumenten-Upload und Authentifizierung.

## Struktur-Übersicht

```text
portal/
├── apps/
│   ├── financial-compass/     # Buchhaltung, Rechnungen, Steuern
│   ├── vermietify/            # Immobilienverwaltung, Mieter
│   └── fintutto-portal/       # Landing Page, Lead-Gen, Rechner
├── packages/
│   ├── ui/                    # Gemeinsame shadcn/ui Komponenten
│   ├── banking/               # FinAPI Hooks, Transaktions-Matching
│   ├── documents/             # KI-OCR, Drag&Drop Upload, Supabase Storage
│   ├── auth/                  # Supabase Auth, Multi-Tenancy (Company/Org)
│   └── config/                # Geteilte tsconfig, eslint, vite configs
├── pnpm-workspace.yaml        # Workspace Definition
└── package.json               # Root Scripts (dev:all, build:all)
```

## Die 4 Kern-Packages

### 1. `@fintutto/ui`
- Enthält alle `shadcn/ui` Komponenten (Buttons, Dialogs, Inputs).
- Stellt sicher, dass Financial Compass und Vermietify exakt gleich aussehen.
- Beinhaltet das globale Theme und die Tailwind-Konfiguration.

### 2. `@fintutto/banking`
- **Hooks:** `useBanking.ts`, `useTransactions.ts`
- **Komponenten:** `BankConnectDialog`, `TransactionMatchingDialog`
- **Logik:** FinAPI-Integration, Auto-Matching-Algorithmus.
- *Warum?* Beide Apps brauchen exakt die gleiche Bankanbindung, nur der Kontext (Rechnung vs. Miete) ändert sich.

### 3. `@fintutto/documents`
- **Hooks:** `useDocuments.ts`, `useOCR.ts`
- **Komponenten:** `DocumentUploadDialog`, `DocumentList`
- **Logik:** OpenAI Vision Integration für Belege/Mietverträge, Supabase Storage Upload.
- *Warum?* Der Upload-Flow (Drag & Drop -> KI liest Daten aus -> Speichern) ist in beiden Apps identisch.

### 4. `@fintutto/auth`
- **Hooks:** `useAuth.ts`, `useWorkspace.ts`
- **Logik:** Behandelt den Unterschied zwischen `company` (Financial Compass) und `organization` (Vermietify) transparent.

## Vite & TypeScript Setup (analog zu Translator)

Statt in jeder App eine eigene `vite.config.ts` zu pflegen, nutzen wir eine `vite.shared.ts` im Root-Verzeichnis.

```typescript
// vite.shared.ts
export function createAppViteConfig(appName: string, appDir: string) {
  return defineConfig({
    // ... shared plugins, build options, manualChunks
    resolve: {
      alias: {
        '@fintutto/ui': path.resolve(__dirname, 'packages/ui/src'),
        '@fintutto/banking': path.resolve(__dirname, 'packages/banking/src'),
      }
    }
  })
}
```

## Migrations-Strategie

1. **Root Setup:** `pnpm-workspace.yaml` und `packages/` Ordner anlegen.
2. **UI Extrahieren:** `components/ui` aus Financial Compass nach `packages/ui` verschieben.
3. **Banking Extrahieren:** `BankConnect.tsx` und `TransactionMatchingDialog.tsx` nach `packages/banking` verschieben.
4. **Apps anpassen:** Import-Pfade in `apps/financial-compass` und `apps/vermietify` von `@/components/...` auf `@fintutto/ui/...` ändern.
