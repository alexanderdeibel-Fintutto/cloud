// Shared utilities and components for Fintutto apps
export const FINTUTTO_VERSION = '1.0.0'

// Shared constants
export const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz'] as const
export type Country = (typeof COUNTRIES)[number]

// Currency formatting
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Cent to Euro conversion
export function centToEuro(cents: number): number {
  return cents / 100
}

export function euroToCent(euros: number): number {
  return Math.round(euros * 100)
}

export function formatCent(cents: number): string {
  return formatEuro(centToEuro(cents))
}

// Date formatting
export function formatDateDE(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}

// Building type labels (German) - matches real vermietify schema
export const BUILDING_TYPE_LABELS: Record<string, string> = {
  apartment: 'Mehrfamilienhaus',
  house: 'Einfamilienhaus',
  commercial: 'Gewerbeimmobilie',
  mixed: 'Gemischt',
}

export const UNIT_STATUS_LABELS: Record<string, string> = {
  vacant: 'Leer',
  rented: 'Vermietet',
  renovating: 'Renovierung',
}

export const METER_TYPE_LABELS: Record<string, string> = {
  electricity: 'Strom',
  gas: 'Gas',
  water: 'Wasser',
  heating: 'Heizung',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  overdue: 'Überfällig',
  partial: 'Teilweise',
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: 'Niedrig',
  normal: 'Normal',
  high: 'Hoch',
  urgent: 'Dringend',
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Erledigt',
  cancelled: 'Abgebrochen',
}

// Platform detection helpers
export function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export function modKey() {
  return isMac() ? '\u2318' : 'Ctrl'
}

// App Registry (ausgelagert in apps.ts um zirkuläre Abhängigkeiten zu vermeiden)
// deeplinks.ts importiert FINTUTTO_APPS aus apps.ts (nicht aus index.ts)
// Dadurch wird der Zirkel: index → deeplinks → index gebrochen.
export { FINTUTTO_APPS, APP_CATEGORIES, getOtherApps } from './apps'
export type { AppCategory, FintuttoAppKey } from './apps'

// Re-export all database types
export * from './types/database'

// Credits system (canonical plan registry)
export * from './credits'

// Stripe utilities
export * from './stripe'

// Supabase factory
export { createSupabaseClient, type CreateSupabaseClientOptions } from './supabase'

// Entitlements engine (FinTech Universe)
export * from './entitlements'

// Cross-app monetization (PremiumTeaser, upgrade suggestions)
export { getPremiumTeaserConfig, getUpgradeSuggestions, CROSS_APP_UPGRADES } from './components/PremiumTeaser'
export type { PremiumTeaserProps, UpgradePromptConfig } from './components/PremiumTeaser'

// Cross-app navigation
export { AppSwitcher } from './components/AppSwitcher'
export { getEcosystemBarItems, getEcosystemBarGrouped, ECOSYSTEM_BAR_STYLE } from './components/EcosystemBar'

// Deep links
export * from './deeplinks'

// Components
export { ErrorBoundary } from './components/ErrorBoundary'
export { PageSkeleton } from './components/PageSkeleton'
export { CommandPalette, CHECKER_TOOLS, ECOSYSTEM_TOOLS } from './components/CommandPalette'
export { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp'
export { EcosystemStatsBar } from './components/EcosystemStatsBar'

// Hooks
export { useDocumentTitle } from './hooks/useDocumentTitle'
export { useMetaTags } from './hooks/useMetaTags'
export { useScrollToTop } from './hooks/useScrollToTop'

// ─── Workspace / Multi-Tenancy ────────────────────────────────────────────────
// Universeller Workspace-Hook (Financial Compass = company, Vermietify = organization)
export { useWorkspace } from './hooks/useWorkspace'
export type { Workspace, WorkspaceContextType, UseWorkspaceOptions } from './hooks/useWorkspace'
// Workspace-Switcher UI (Sidebar-Dropdown für Firmen- und Organisations-Wechsel)
export { WorkspaceSwitcher } from './components/WorkspaceSwitcher'

// ─── Banking ─────────────────────────────────────────────────────────────────
// Universeller Banking-Hook (FinAPI, Transaktions-Matching, Regeln)
export { useBanking } from './hooks/useBanking'

// ─── Dokumente ────────────────────────────────────────────────────────────────
// Dokument-Upload, KI-OCR, Bulk-Upload
export { DocumentUploadDialog, DocumentList, BulkDocumentUpload } from './components/documents'
export type { UploadFile } from './components/documents'

// ─── SecondBrain Cross-App Integration ───────────────────────────────────────
// Panel-Komponente (einbettbar in Vermietify, Financial Compass, Ablesung)
export { SecondBrainDocumentsPanel } from './components/documents/SecondBrainDocumentsPanel'
export type { SecondBrainDocumentsPanelProps, SbDocumentPreview } from './components/documents/SecondBrainDocumentsPanel'
// Hooks für Cross-App Dokumenten-Zugriff
export {
  useSecondBrainDocuments,
  useDocumentEntityLinks,
  useLinkDocumentToEntity,
  useUnlinkDocumentFromEntity,
  useDocumentSuggestions,
  useResolveSuggestion,
} from './hooks/useSecondBrainDocuments'
export type {
  SbEntityType,
  SbDocument,
  SbDocumentEntityLink,
  SbDocumentSuggestion,
} from './hooks/useSecondBrainDocuments'
