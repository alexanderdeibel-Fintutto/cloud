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

// Fintutto Ecosystem App Registry
export const FINTUTTO_APPS = {
  vermietify: {
    name: 'Vermietify',
    slug: 'vermietify',
    description: 'Immobilienverwaltung für Vermieter',
    icon: '🏠',
  },
  ablesung: {
    name: 'Ablesung',
    slug: 'ablesung',
    description: 'Zählerablesung & Verbrauchserfassung',
    icon: '📊',
  },
  hausmeisterPro: {
    name: 'HausmeisterPro',
    slug: 'hausmeister-pro',
    description: 'Hausmeister- & Gebäudeverwaltung',
    icon: '🔧',
  },
  mieter: {
    name: 'Mieter',
    slug: 'mieter',
    description: 'Mieter-Portal & Tools',
    icon: '🏡',
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    description: 'Steuerbescheid-Prüfer',
    icon: '📋',
  },
  portal: {
    name: 'Fintutto Portal',
    slug: 'portal',
    description: 'Rechner, Checker & Formulare',
    icon: '🧮',
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
  },
  financialCompass: {
    name: 'Financial Compass',
    slug: 'financial-compass',
    description: 'Finanzübersicht & Buchhaltung',
    icon: '🧭',
  },
  // ─── NEW: FinTech Universe Apps ──────────────────────────────
  financeCoach: {
    name: 'Finance Coach',
    slug: 'finance-coach',
    description: 'KI-Finanzberatung & Budgetierung',
    icon: '💰',
  },
  fintuttoBiz: {
    name: 'Fintutto Biz',
    slug: 'fintutto-biz',
    description: 'Freelancer Finance OS',
    icon: '💼',
  },
  financeMentor: {
    name: 'Finance Mentor',
    slug: 'finance-mentor',
    description: 'Finanz-Education & Zertifikate',
    icon: '📚',
  },
  fintuttoApi: {
    name: 'Fintutto API',
    slug: 'fintutto-api',
    description: 'B2B Finance Intelligence API',
    icon: '🔌',
  },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

/**
 * Returns all Fintutto ecosystem apps except the given one,
 * with URLs pointing to their Vercel deployments.
 */
export function getOtherApps(excludeSlug: string) {
  return Object.entries(FINTUTTO_APPS)
    .filter(([, app]) => app.slug !== excludeSlug)
    .map(([key, app]) => ({
      key,
      name: app.name,
      icon: app.icon,
      description: app.description,
      url: `https://${app.slug}.fintutto.com`,
    }))
}

/**
 * Returns ecosystem apps grouped by category for the ecosystem bar.
 */
export function getEcosystemBarGrouped(excludeSlug: string) {
  const apps = getOtherApps(excludeSlug)
  const groups: Record<string, typeof apps> = {}
  for (const app of apps) {
    const cat = app.key in { vermietify: 1, ablesung: 1, hausmeisterPro: 1, mieter: 1 }
      ? 'Immobilien'
      : app.key in { financeCoach: 1, fintuttoBiz: 1, financeMentor: 1, fintuttoApi: 1 }
        ? 'FinTech'
        : 'Tools'
    ;(groups[cat] ??= []).push(app)
  }
  return groups
}

/**
 * Creates a Fintutto API client stub.
 */
export function createFintuttoClient(_options?: { baseUrl?: string; apiKey?: string }) {
  return {
    get: async (path: string) => fetch(path).then(r => r.json()),
    post: async (path: string, body: unknown) =>
      fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  }
}

// ─── Tool & Category Constants ───────────────────────────────────────────────

export type AppCategory = 'rechner' | 'checker' | 'formulare' | 'fintech' | 'tools'

export const APP_CATEGORIES: Record<AppCategory, { label: string; icon: string }> = {
  rechner: { label: 'Rechner', icon: '🧮' },
  checker: { label: 'Checker', icon: '✅' },
  formulare: { label: 'Formulare', icon: '📄' },
  fintech: { label: 'FinTech', icon: '💰' },
  tools: { label: 'Tools', icon: '🔧' },
}

export const PORTAL_TOOLS = [
  { id: 'kaution', label: 'Kautions-Rechner', href: '/rechner/kaution', category: 'rechner' },
  { id: 'mieterhoehung', label: 'Mieterhöhungs-Rechner', href: '/rechner/mieterhoehung', category: 'rechner' },
  { id: 'kaufnebenkosten', label: 'Kaufnebenkosten-Rechner', href: '/rechner/kaufnebenkosten', category: 'rechner' },
  { id: 'rendite', label: 'Rendite-Rechner', href: '/rechner/rendite', category: 'rechner' },
  { id: 'grundsteuer', label: 'Grundsteuer-Rechner', href: '/rechner/grundsteuer', category: 'rechner' },
  { id: 'nebenkosten', label: 'Nebenkosten-Rechner', href: '/rechner/nebenkosten', category: 'rechner' },
  { id: 'eigenkapital', label: 'Eigenkapital-Rechner', href: '/rechner/eigenkapital', category: 'rechner' },
]

export const CHECKER_TOOLS = [
  { id: 'mietpreisbremse', label: 'Mietpreisbremse-Checker', href: '/checker/mietpreisbremse', category: 'checker' },
  { id: 'mieterhoehung-check', label: 'Mieterhöhung-Checker', href: '/checker/mieterhoehung', category: 'checker' },
  { id: 'nebenkosten-check', label: 'Nebenkosten-Checker', href: '/checker/nebenkosten', category: 'checker' },
  { id: 'kuendigung', label: 'Kündigungs-Checker', href: '/checker/kuendigung', category: 'checker' },
  { id: 'kaution-check', label: 'Kaution-Checker', href: '/checker/kaution', category: 'checker' },
  { id: 'mietminderung', label: 'Mietminderungs-Checker', href: '/checker/mietminderung', category: 'checker' },
]

export const ECOSYSTEM_TOOLS = [
  ...PORTAL_TOOLS,
  ...CHECKER_TOOLS,
]

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

// React hooks
export {
  useDocumentTitle,
  useMetaTags,
  useJsonLd,
  useLocalStorage,
  useUnsavedChanges,
  useKeyboardNav,
  useScrollToTop,
  useRecentTools,
} from './hooks'

// React components
export {
  ErrorBoundary,
  PageSkeleton,
  Breadcrumbs,
  RecentToolsWidget,
  ShareResultButton,
  CrossAppRecommendations,
  AnnouncementBanner,
  EcosystemStatsBar,
  CommandPalette,
  PrintStyles,
  KeyboardShortcutsHelp,
  AppSwitcher,
} from './components'
