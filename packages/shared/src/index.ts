// @fintutto/shared — Shared utilities, constants, and re-exports
// Version 1.1: UI components moved to @fintutto/ui, Supabase to @fintutto/supabase
// This file re-exports from new packages for backward compatibility.

export const FINTUTTO_VERSION = '1.1.0'

// ─── Constants ───────────────────────────────────────────────────────────────

export const COUNTRIES = ['Deutschland', 'Österreich', 'Schweiz'] as const
export type Country = (typeof COUNTRIES)[number]

// ─── Formatting Utilities ────────────────────────────────────────────────────

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function centToEuro(cents: number): number {
  return cents / 100
}

export function euroToCent(euros: number): number {
  return Math.round(euros * 100)
}

export function formatCent(cents: number): string {
  return formatEuro(centToEuro(cents))
}

export function formatDateDE(date: Date | string): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date))
}

// ─── Label Maps ──────────────────────────────────────────────────────────────

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

// ─── Platform Detection ──────────────────────────────────────────────────────

export function isMac() {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export function modKey() {
  return isMac() ? '\u2318' : 'Ctrl'
}

// ─── App Registry ────────────────────────────────────────────────────────────

export const APP_CATEGORIES = {
  immobilien: 'Immobilien',
  fintech: 'FinTech',
  tools: 'Tools & Verwaltung',
} as const

export type AppCategory = keyof typeof APP_CATEGORIES
export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

export const FINTUTTO_APPS = {
  vermietify: {
    name: 'Vermietify',
    slug: 'vermietify',
    description: 'Immobilienverwaltung fuer Vermieter',
    icon: '🏠',
    url: 'https://vermietify.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  ablesung: {
    name: 'Ablesung',
    slug: 'ablesung',
    description: 'Zaehlerablesung & Verbrauchserfassung',
    icon: '📊',
    url: 'https://ablesung.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  hausmeisterPro: {
    name: 'HausmeisterPro',
    slug: 'hausmeister-pro',
    description: 'Hausmeister- & Gebaeudeverwaltung',
    icon: '🔧',
    url: 'https://hausmeister.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  mieter: {
    name: 'Mieter',
    slug: 'mieter',
    description: 'Mieter-Portal & Tools',
    icon: '🏡',
    url: 'https://mieter.fintutto.cloud',
    category: 'immobilien' as AppCategory,
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    description: 'Steuerbescheid-Pruefer',
    icon: '📋',
    url: 'https://bescheidboxer.fintutto.cloud',
    category: 'tools' as AppCategory,
  },
  portal: {
    name: 'Fintutto Portal',
    slug: 'portal',
    description: 'Rechner, Checker & Formulare',
    icon: '🧮',
    url: 'https://fintutto.cloud',
    category: 'tools' as AppCategory,
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
    url: 'https://admin.fintutto.cloud',
    category: 'tools' as AppCategory,
  },
  financialCompass: {
    name: 'Financial Compass',
    slug: 'financial-compass',
    description: 'Finanzuebersicht & Buchhaltung',
    icon: '🧭',
    url: 'https://compass.fintutto.cloud',
    category: 'tools' as AppCategory,
  },
  financeCoach: {
    name: 'Finance Coach',
    slug: 'finance-coach',
    description: 'KI-Finanzberatung & Budgetierung',
    icon: '💰',
    url: 'https://finance-coach.fintutto.cloud',
    category: 'fintech' as AppCategory,
  },
  fintuttoBiz: {
    name: 'Fintutto Biz',
    slug: 'fintutto-biz',
    description: 'Freelancer Finance OS',
    icon: '💼',
    url: 'https://fintutto-biz.vercel.app',
    category: 'fintech' as AppCategory,
  },
  financeMentor: {
    name: 'Finance Mentor',
    slug: 'finance-mentor',
    description: 'Finanz-Education & Zertifikate',
    icon: '📚',
    url: 'https://finance-mentor.fintutto.cloud',
    category: 'fintech' as AppCategory,
  },
  fintuttoApi: {
    name: 'Fintutto API',
    slug: 'fintutto-api',
    description: 'B2B Finance Intelligence API',
    icon: '🔌',
    url: 'https://api.fintutto.cloud',
    category: 'fintech' as AppCategory,
  },
  secondBrain: {
    name: 'SecondBrain',
    slug: 'secondbrain',
    description: 'Intelligentes Wissensmanagement mit KI',
    icon: '🧠',
  },
} as const

// ─── Own modules ─────────────────────────────────────────────────────────────

// Credits system (canonical plan registry)
export * from './credits'

// Stripe utilities
export * from './stripe'

// Deep-links (cross-app URL builders)
export * from './deeplinks'

// ─── Re-exports from @fintutto/supabase (backward compatibility) ─────────────

export { createSupabaseClient, type CreateSupabaseClientOptions } from '@fintutto/supabase'
export * from '@fintutto/supabase/types'
export * from '@fintutto/supabase/entitlements'

// ─── Re-exports from @fintutto/ui (backward compatibility) ───────────────────

export { AppSwitcher } from '@fintutto/ui'
export { getEcosystemBarItems, getEcosystemBarGrouped, ECOSYSTEM_BAR_STYLE } from '@fintutto/ui'
export { getPremiumTeaserConfig, getUpgradeSuggestions, CROSS_APP_UPGRADES } from '@fintutto/ui'
export type { PremiumTeaserProps, UpgradePromptConfig } from '@fintutto/ui'
