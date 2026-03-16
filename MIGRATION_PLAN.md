# Fintutto Portal — Migrationsplan

*Stand: 2026-03-16*

---

## Übersicht

Konsolidierung aller Fintutto-Repos in das Portal-Monorepo mit klarer Package-Trennung.

## 1. Package-Aufspaltung

### packages/shared (bleibt — reine Utilities & Konstanten)
- Konstanten: `FINTUTTO_VERSION`, `COUNTRIES`, `FINTUTTO_APPS`
- Formatter: `formatEuro()`, `centToEuro()`, `formatDateDE()`
- Label-Maps: `BUILDING_TYPE_LABELS`, `PAYMENT_STATUS_LABELS`, etc.
- Platform-Detection: `isMac()`, `modKey()`
- Credits/Plans: Vollständiges Plan-System
- Stripe: Client-side Checkout
- Deep-Links: Cross-App URL-Builder
- Utility-Hooks: `useLocalStorage`, `useDebounce`, `useRecentTools`

### packages/ui (NEU — React UI-Komponenten)
- `AppSwitcher` — Cross-App Navigation
- `CommandPalette` — Ctrl+K Quick-Navigation
- `ErrorBoundary` — React Error Boundary
- `Breadcrumbs` — Breadcrumb-Navigation
- `AnnouncementBanner` — Dismissible Banner
- `KeyboardShortcutsHelp` — Shortcuts Modal
- `PageSkeleton` — Loading Skeleton
- `EcosystemStatsBar` — Stats-Anzeige
- `PrintStyles` — Druck-CSS
- `RecentToolsWidget` — Letzte Tools
- `ShareResultButton` — Share/Social
- `CrossAppRecommendations` — App-Empfehlungen
- `PremiumTeaser` — Upgrade-Teaser
- `EcosystemBar` — Navigation Bar Config
- UI-Hooks: `useDocumentTitle`, `useScrollToTop`, `useMetaTags`, `useJsonLd`, `useUnsavedChanges`, `useKeyboardNav`, `useShareResult`

### packages/supabase (NEU — Datenbank-Layer)
- Supabase Client Factory: `createSupabaseClient()`
- Database Types: Alle Tabellen-Typen
- Entitlements Engine: Feature-Zugriffskontrolle
- Daten-Hooks: `useBuildings`, `useTenants`, `useMeters`, `useDashboardStats`, `useOccupancyStats`, `useEntitlements`

## 2. App-Migration

### Bereits im Monorepo (vollständig):
- ✅ `apps/vermietify` — 336 TS-Dateien, Production
- ✅ `apps/bescheidboxer` — 222 TS-Dateien, Production
- ✅ `apps/mieterportal` — Mieter-Portal
- ✅ `apps/ablesung` — Zählerablesung
- ✅ `apps/translator` — Übersetzer
- ✅ `apps/pflanzen-manager` — Zimmerpflanzen

### Neu aufsetzen (Stub → vollständige App):
- 🔧 `apps/financial-compass` — package.json + Vite-Setup
- 🔧 `apps/hausmeister` — package.json + Vite-Setup

### Placeholder-Apps entfernen (kein package.json, kein echter Code):
- ❌ `apps/admin-hub`
- ❌ `apps/ai-guide`
- ❌ `apps/betriebskosten-helfer`
- ❌ `apps/formulare`
- ❌ `apps/leserally`
- ❌ `apps/miet-check-pro`
- ❌ `apps/miet-recht`
- ❌ `apps/mietenplus-rechner`
- ❌ `apps/mieterhoehungs-checker`
- ❌ `apps/rent-wizard`
- ❌ `apps/vermieter-freude`
- ❌ `apps/wohn-held`

### Duplikate konsolidieren:
- `apps/vermieterportal` + `apps/vermieter-portal` → eine App

## 3. Supabase Konsolidierung

- 20 Migrations unter `supabase/migrations/`
- Schema in `supabase/schema.sql`
- Edge Functions:
  - `ablesung/supabase/functions/` (12 Functions)
  - `arbeitslos-portal/supabase/functions/` (2 Functions)
- → Alle Functions zentral unter `supabase/functions/` zusammenführen

## 4. Sofort löschbare externe Repos

| Repo | Grund |
|------|-------|
| vermietify | Leer/archiviert, Source-of-Truth ist `apps/vermietify` |
| FT_CALC_RENDITE | Leer/archiviert |
| ft_ocr_zaehler | Leer/archiviert |
| ft_hausmeister | Leer/archiviert |
| fintutto-admin-hub | Leer/archiviert |

## 5. Nach der Migration

- 8 Dependabot-Warnungen aus `vermietify_final` → im Portal fixen
- Dependency-Versionen angleichen (Supabase, React Router, TanStack Query)
- `@fintutto/shared` Imports in bescheidboxer + mieterportal einbauen
