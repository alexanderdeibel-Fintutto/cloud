/**
 * Fintutto App Registry
 *
 * WICHTIG: Diese Datei darf KEINE Imports aus './index' haben,
 * da index.ts diese Datei re-exportiert und deeplinks.ts diese Datei importiert.
 * Zirkel: index → deeplinks → index wird so vermieden.
 */

export const APP_CATEGORIES = {
  immobilien: { label: 'Immobilien', icon: '🏠' },
  fintech: { label: 'FinTech', icon: '💰' },
  tools: { label: 'Tools', icon: '🔧' },
} as const

export type AppCategory = keyof typeof APP_CATEGORIES

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
    url: 'https://secondbrain.fintutto.cloud',
    category: 'tools' as AppCategory,
  },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

export function getOtherApps(currentSlug: string) {
  return Object.entries(FINTUTTO_APPS).filter(([, app]) => app.slug !== currentSlug).map(([key, app]) => ({ ...app, key }))
}
