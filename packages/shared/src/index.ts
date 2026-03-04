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

// App categories for the Fintutto ecosystem
export const APP_CATEGORIES = {
  immobilien: 'Immobilien',
  finanzen: 'Finanzen',
  tools: 'Tools',
  lifestyle: 'Lifestyle',
} as const

export type AppCategory = keyof typeof APP_CATEGORIES

// Fintutto Ecosystem App Registry
export const FINTUTTO_APPS = {
  vermietify: {
    name: 'Vermietify',
    slug: 'vermietify',
    description: 'Immobilienverwaltung für Vermieter',
    icon: '🏠',
    url: 'https://vermietify.vercel.app',
    category: 'immobilien' as AppCategory,
  },
  ablesung: {
    name: 'Ablesung',
    slug: 'ablesung',
    description: 'Zählerablesung & Verbrauchserfassung',
    icon: '📊',
    url: 'https://ablesung.vercel.app',
    category: 'immobilien' as AppCategory,
  },
  hausmeisterPro: {
    name: 'HausmeisterPro',
    slug: 'hausmeister-pro',
    description: 'Hausmeister- & Gebäudeverwaltung',
    icon: '🔧',
    url: 'https://hausmeister-pro.vercel.app',
    category: 'immobilien' as AppCategory,
  },
  mieter: {
    name: 'Mieter',
    slug: 'mieter',
    description: 'Mieter-Portal & Tools',
    icon: '🏡',
    url: 'https://mieter-kw8d.vercel.app',
    category: 'immobilien' as AppCategory,
  },
  vermieterPortal: {
    name: 'Vermieter-Portal',
    slug: 'vermieter-portal',
    description: 'Vermieter-Rechner & Verwaltung',
    icon: '🏘️',
    url: 'https://vermieter-portal.vercel.app',
    category: 'immobilien' as AppCategory,
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    description: 'Steuerbescheid-Prüfer',
    icon: '📋',
    url: 'https://bescheidboxer.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  portal: {
    name: 'Fintutto Portal',
    slug: 'portal',
    description: 'Rechner, Checker & Formulare',
    icon: '🧮',
    url: 'https://portal.fintutto.cloud',
    category: 'tools' as AppCategory,
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
    url: 'https://fintutto-admin-hub.vercel.app',
    category: 'tools' as AppCategory,
  },
  financialCompass: {
    name: 'Financial Compass',
    slug: 'financial-compass',
    description: 'Finanzübersicht & Buchhaltung',
    icon: '🧭',
    url: 'https://fintutto-your-financial-compass.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  financeCoach: {
    name: 'Finance Coach',
    slug: 'finance-coach',
    description: 'KI-Finanzberatung & Budgetierung',
    icon: '💰',
    url: 'https://finance-coach.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  fintuttoBiz: {
    name: 'Fintutto Biz',
    slug: 'fintutto-biz',
    description: 'Freelancer Finance OS',
    icon: '💼',
    url: 'https://fintutto-biz.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  financeMentor: {
    name: 'Finance Mentor',
    slug: 'finance-mentor',
    description: 'Finanz-Education & Zertifikate',
    icon: '📚',
    url: 'https://finance-mentor.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  fintuttoApi: {
    name: 'Fintutto API',
    slug: 'fintutto-api',
    description: 'B2B Finance Intelligence API',
    icon: '🔌',
    url: 'https://fintutto-api.vercel.app',
    category: 'tools' as AppCategory,
  },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

/**
 * Returns ecosystem apps excluding the current app (by slug).
 */
export function getOtherApps(currentAppSlug: string) {
  return Object.entries(FINTUTTO_APPS)
    .filter(([_, app]) => app.slug !== currentAppSlug)
    .map(([key, app]) => ({
      key: key as FintuttoAppKey,
      name: app.name,
      icon: app.icon,
      url: app.url,
      slug: app.slug,
      description: app.description,
      category: app.category,
    }))
}

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

// Deep links
export * from './deeplinks'

// ─── Shared Hooks ──────────────────────────────────────────────
export * from './hooks'

// ─── Shared Components ─────────────────────────────────────────
export { ErrorBoundary } from './components/ErrorBoundary'
export { PageSkeleton } from './components/PageSkeleton'
export { CommandPalette, PORTAL_TOOLS, CHECKER_TOOLS, ECOSYSTEM_TOOLS } from './components/CommandPalette'
export type { CommandItem } from './components/CommandPalette'
export { PrintStyles } from './components/PrintStyles'
export { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp'
export { Breadcrumbs } from './components/Breadcrumbs'
export { RecentToolsWidget } from './components/RecentToolsWidget'
export { AnnouncementBanner } from './components/AnnouncementBanner'
export { EcosystemStatsBar } from './components/EcosystemStatsBar'
export { CrossAppRecommendations } from './components/CrossAppRecommendations'
export { ShareResultButton } from './components/ShareResultButton'
export { AppSwitcher } from './components/AppSwitcher'
export { getEcosystemBarItems, getEcosystemBarGrouped, ECOSYSTEM_BAR_STYLE } from './components/EcosystemBar'
