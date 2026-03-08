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
  bildung: 'Bildung & Lernen',
  karriere: 'Karriere & Soziales',
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
    url: 'https://vermietify.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  ablesung: {
    name: 'Ablesung',
    slug: 'ablesung',
    description: 'Zählerablesung & Verbrauchserfassung',
    icon: '📊',
    url: 'https://zaehler.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  hausmeisterPro: {
    name: 'HausmeisterPro',
    slug: 'hausmeister-pro',
    description: 'Hausmeister- & Gebäudeverwaltung',
    icon: '🔧',
    url: 'https://hausmeisterpro.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  mieter: {
    name: 'Mieter',
    slug: 'mieter',
    description: 'Mieter-Portal & Tools',
    icon: '🏡',
    url: 'https://mieter.fintutto.de',
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
    slug: 'mieter-checker',
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
    url: 'https://fintutto.cloud',
    category: 'finanzen' as AppCategory,
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    description: 'Steuerbescheid-Prüfer',
    icon: '📋',
    url: 'https://app.bescheidboxer.de',
    category: 'finanzen' as AppCategory,
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
    url: 'https://admin.fintutto.cloud',
    category: 'finanzen' as AppCategory,
  },
  // --- Lifestyle (Translator = Flagship App) ---
  translator: {
    name: 'Uebersetzer',
    slug: 'translator',
    description: 'Kostenloser Uebersetzer mit 22 Sprachen, Cloud TTS & Spracheingabe',
    icon: '🌐',
    url: 'https://translator.fintutto.cloud',
    category: 'lifestyle' as AppCategory,
  },
  pflanzenManager: {
    name: 'Pflanzen-Manager',
    slug: 'pflanzen-manager',
    description: 'Zimmerpflanzen-Pflege & Tracking',
    icon: '🌱',
    url: 'https://zimmerpflanze.fintutto.cloud',
    category: 'lifestyle' as AppCategory,
  },
  personaltrainer: {
    name: 'Personaltrainer',
    slug: 'personaltrainer',
    description: 'Fitness-Coaching & Trainingspläne',
    icon: '💪',
    url: 'https://fitness.fintutto.cloud',
    category: 'lifestyle' as AppCategory,
  },
  luggageX: {
    name: 'LuggageX',
    slug: 'luggagex',
    description: 'Gepäck-Tracking & Reise-Checklisten',
    icon: '🧳',
    url: 'https://luggagex.fintutto.cloud',
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
    url: 'https://commander.fintutto.cloud',
    category: 'sales' as AppCategory,
  },
  // --- Neue Apps ---
  financeCoach: {
    name: 'Finance Coach',
    slug: 'finance-coach',
    description: 'KI-gestütztes Finanz-Coaching',
    icon: '💰',
    url: 'https://finance-coach.fintutto.cloud',
    category: 'finanzen' as AppCategory,
  },
  financeMentor: {
    name: 'Finance Mentor',
    slug: 'finance-mentor',
    description: 'Investment-Strategien & Vermögensaufbau',
    icon: '📈',
    url: 'https://finance-mentor.fintutto.cloud',
    category: 'finanzen' as AppCategory,
  },
  arbeitslosPortal: {
    name: 'Arbeitslos-Portal',
    slug: 'arbeitslos-portal',
    description: 'Unterstützung bei Arbeitslosigkeit',
    icon: '🤝',
    url: 'https://arbeitslos-portal.fintutto.cloud',
    category: 'karriere' as AppCategory,
  },
  aiGuide: {
    name: 'AI Guide',
    slug: 'ai-guide',
    description: 'Universeller KI-Assistent',
    icon: '🤖',
    url: 'https://ai-guide.fintutto.cloud',
    category: 'bildung' as AppCategory,
  },
  lernApp: {
    name: 'LernApp',
    slug: 'lern-app',
    description: 'Lernen mit KI-Unterstützung',
    icon: '📚',
    url: 'https://lernen.fintutto.cloud',
    category: 'bildung' as AppCategory,
  },
  guideTranslatorSales: {
    name: 'GuideTranslator Sales',
    slug: 'guidetranslator-sales',
    description: 'B2B-Vertrieb für GuideTranslator',
    icon: '💼',
    url: 'https://sales.translator.fintutto.cloud',
    category: 'sales' as AppCategory,
  },
  consumerGuideTranslator: {
    name: 'GuideTranslator Consumer',
    slug: 'consumer-guidetranslator',
    description: 'Übersetzer für Kreuzfahrt-Gäste',
    icon: '🛳️',
    url: 'https://consumer.guidetranslator.com',
    category: 'sales' as AppCategory,
  },
  bizPortal: {
    name: 'Biz Portal',
    slug: 'biz-portal',
    description: 'Business-Tools für Selbstständige',
    icon: '🏢',
    url: 'https://biz.fintutto.cloud',
    category: 'sales' as AppCategory,
  },
  fintuttoCloud: {
    name: 'Fintutto Cloud',
    slug: 'fintutto-cloud',
    description: 'Die Startseite des Ökosystems',
    icon: '☁️',
    url: 'https://www.fintutto.cloud',
    category: 'finanzen' as AppCategory,
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

// Re-export AppsDirectory
export { AppsDirectory } from './components/AppsDirectory'

// Re-export EcosystemNotFound
export { EcosystemNotFound } from './components/EcosystemNotFound'

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
