// Shared utilities and components for Fintutto apps
export const FINTUTTO_VERSION = '1.0.0'

export const SUPABASE_CONFIG = {
  url: 'https://aaefocdqgdgexkcrjhks.supabase.co',
}

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

// App categories for ecosystem navigation
export const APP_CATEGORIES = {
  immobilien: 'Immobilien',
  finanzen: 'Finanzen & Tools',
  lifestyle: 'Lifestyle',
  sales: 'Sales & B2B',
} as const

export type AppCategory = keyof typeof APP_CATEGORIES

// Fintutto Ecosystem App Registry (with URLs for cross-app navigation)
export const FINTUTTO_APPS = {
  // --- Immobilien ---
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
    description: 'Rechner & Formulare für Vermieter',
    icon: '🏢',
    url: 'https://vermieter.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  // --- Finanzen & Tools ---
  portal: {
    name: 'Fintutto Portal',
    slug: 'portal',
    description: 'Rechner, Checker & Formulare',
    icon: '🧮',
    url: 'https://portal.fintutto.cloud',
    category: 'finanzen' as AppCategory,
  },
  financialCompass: {
    name: 'Financial Compass',
    slug: 'financial-compass',
    description: 'Finanzübersicht & Buchhaltung',
    icon: '🧭',
    url: 'https://fintutto-your-financial-compass.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    description: 'Steuerbescheid-Prüfer',
    icon: '📋',
    url: 'https://bescheidboxer.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
    url: 'https://fintutto-admin-hub.vercel.app',
    category: 'finanzen' as AppCategory,
  },
  // --- Lifestyle ---
  translator: {
    name: 'Übersetzer',
    slug: 'translator',
    description: 'Online-Übersetzer mit 22 Sprachen & TTS',
    icon: '🌐',
    url: 'https://translator-fintutto.vercel.app',
    category: 'lifestyle' as AppCategory,
  },
  pflanzenManager: {
    name: 'Pflanzen-Manager',
    slug: 'pflanzen-manager',
    description: 'Zimmerpflanzen-Pflege & Tracking',
    icon: '🌱',
    url: 'https://zimmerpflanze.vercel.app',
    category: 'lifestyle' as AppCategory,
  },
  personaltrainer: {
    name: 'Personaltrainer',
    slug: 'personaltrainer',
    description: 'Fitness-Coaching & Trainingspläne',
    icon: '💪',
    url: 'https://personaltrainer-murex.vercel.app',
    category: 'lifestyle' as AppCategory,
  },
  luggageX: {
    name: 'LuggageX',
    slug: 'luggagex',
    description: 'Gepäck-Tracking & Reise-Checklisten',
    icon: '🧳',
    url: 'https://luggagex-fintutto.vercel.app',
    category: 'lifestyle' as AppCategory,
  },
  // --- Sales & B2B ---
  guideTranslator: {
    name: 'GuideTranslator',
    slug: 'guidetranslator',
    description: 'Übersetzer-Tool für Kreuzfahrtschiffe',
    icon: '🚢',
    url: 'https://app.guidetranslator.com',
    category: 'sales' as AppCategory,
  },
  commandCenter: {
    name: 'Command Center',
    slug: 'command-center',
    description: 'Fintutto Steuerungszentrale',
    icon: '🎛️',
    url: 'https://fintutto-command-center.vercel.app',
    category: 'sales' as AppCategory,
  },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

// Get all apps except the current one (for cross-app navigation)
export function getOtherApps(currentAppSlug: string) {
  return Object.values(FINTUTTO_APPS).filter((app) => app.slug !== currentAppSlug)
}

// Get apps by category
export function getAppsByCategory(category: AppCategory, excludeSlug?: string) {
  return Object.values(FINTUTTO_APPS)
    .filter((app) => app.category === category && app.slug !== excludeSlug)
}

// Get app URL by key
export function getAppUrl(appKey: FintuttoAppKey): string {
  return FINTUTTO_APPS[appKey].url
}

// Re-export all database types
export * from './types/database'

// Re-export shared hooks
export * from './hooks'

// Re-export ecosystem bar helpers
export { getEcosystemBarItems, getEcosystemBarGrouped, ECOSYSTEM_BAR_STYLE } from './components/EcosystemBar'

// Re-export ErrorBoundary
export { ErrorBoundary } from './components/ErrorBoundary'

// Re-export AnnouncementBanner
export { AnnouncementBanner } from './components/AnnouncementBanner'

// Re-export CommandPalette
export { CommandPalette, PORTAL_TOOLS, CHECKER_TOOLS, ECOSYSTEM_TOOLS, modKey } from './components/CommandPalette'
export type { CommandItem } from './components/CommandPalette'

// Re-export Breadcrumbs
export { Breadcrumbs } from './components/Breadcrumbs'

// Re-export PageSkeleton
export { PageSkeleton } from './components/PageSkeleton'

// Re-export PrintStyles
export { PrintStyles } from './components/PrintStyles'

// Re-export ShareResultButton
export { ShareResultButton } from './components/ShareResultButton'

// Re-export RecentToolsWidget
export { RecentToolsWidget } from './components/RecentToolsWidget'

// Re-export KeyboardShortcutsHelp
export { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp'

// Re-export CrossAppRecommendations
export { CrossAppRecommendations } from './components/CrossAppRecommendations'

// Re-export EcosystemStatsBar
export { EcosystemStatsBar } from './components/EcosystemStatsBar'

// Re-export AppSwitcher
export { AppSwitcher } from './components/AppSwitcher'

// Re-export EcosystemFooter
export { EcosystemFooter } from './components/EcosystemFooter'

// Re-export shared Supabase client factory
export { createFintuttoClient } from './supabase'

// Re-export deep link builders
export {
  kautionsRechnerLink,
  mieterhoehungRechnerLink,
  renditeRechnerLink,
  mietvertragLink,
  parseDeepLinkParams,
  getPortalLinks,
  ablesungLink,
  vermietifyBuildingLink,
  vermietifyUnitLink,
  nebenkostenCheckerLink,
  mietpreisbremseCheckerLink,
  vermieterRechnerLink,
  getCrossAppLinks,
} from './deeplinks'
