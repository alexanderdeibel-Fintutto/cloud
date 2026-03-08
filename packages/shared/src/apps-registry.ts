// Fintutto Ecosystem App Registry
// Extracted to its own file to avoid circular dependencies

export const FINTUTTO_APPS = {
  vermietify: {
    name: 'Vermietify',
    slug: 'vermietify',
    url: 'https://vermietify.fintutto.com',
    description: 'Immobilienverwaltung für Vermieter',
    icon: '🏠',
    category: 'rechner' as const,
  },
  ablesung: {
    name: 'Ablesung',
    slug: 'ablesung',
    url: 'https://ablesung.fintutto.com',
    description: 'Zählerablesung & Verbrauchserfassung',
    icon: '📊',
    category: 'tools' as const,
  },
  hausmeisterPro: {
    name: 'HausmeisterPro',
    slug: 'hausmeister-pro',
    url: 'https://hausmeister-pro.fintutto.com',
    description: 'Hausmeister- & Gebäudeverwaltung',
    icon: '🔧',
    category: 'tools' as const,
  },
  mieter: {
    name: 'Mieter',
    slug: 'mieter',
    url: 'https://mieter.fintutto.com',
    description: 'Mieter-Portal & Tools',
    icon: '🏡',
    category: 'tools' as const,
  },
  bescheidboxer: {
    name: 'BescheidBoxer',
    slug: 'bescheidboxer',
    url: 'https://bescheidboxer.fintutto.com',
    description: 'Steuerbescheid-Prüfer',
    icon: '📋',
    category: 'checker' as const,
  },
  portal: {
    name: 'Fintutto Portal',
    slug: 'portal',
    url: 'https://portal.fintutto.com',
    description: 'Rechner, Checker & Formulare',
    icon: '🧮',
    category: 'rechner' as const,
  },
  vermieterPortal: {
    name: 'Vermieter Portal',
    slug: 'vermieter-portal',
    url: 'https://vermieter-portal.fintutto.com',
    description: 'Portal für Vermieter',
    icon: '🏢',
    category: 'rechner' as const,
  },
  adminHub: {
    name: 'Admin-Hub',
    slug: 'admin-hub',
    url: 'https://admin-hub.fintutto.com',
    description: 'Zentrale Verwaltung',
    icon: '⚙️',
    category: 'tools' as const,
  },
  financialCompass: {
    name: 'Financial Compass',
    slug: 'financial-compass',
    url: 'https://financial-compass.fintutto.com',
    description: 'Finanzübersicht & Buchhaltung',
    icon: '🧭',
    category: 'fintech' as const,
  },
  financeCoach: {
    name: 'Finance Coach',
    slug: 'finance-coach',
    url: 'https://finance-coach.fintutto.com',
    description: 'KI-Finanzberatung & Budgetierung',
    icon: '💰',
    category: 'fintech' as const,
  },
  fintuttoBiz: {
    name: 'Fintutto Biz',
    slug: 'fintutto-biz',
    url: 'https://fintutto-biz.fintutto.com',
    description: 'Freelancer Finance OS',
    icon: '💼',
    category: 'fintech' as const,
  },
  financeMentor: {
    name: 'Finance Mentor',
    slug: 'finance-mentor',
    url: 'https://finance-mentor.fintutto.com',
    description: 'Finanz-Education & Zertifikate',
    icon: '📚',
    category: 'fintech' as const,
  },
  fintuttoApi: {
    name: 'Fintutto API',
    slug: 'fintutto-api',
    url: 'https://fintutto-api.fintutto.com',
    description: 'B2B Finance Intelligence API',
    icon: '🔌',
    category: 'fintech' as const,
  },
} as const

export type FintuttoAppKey = keyof typeof FINTUTTO_APPS

export type AppCategory = 'rechner' | 'checker' | 'formulare' | 'fintech' | 'tools'

export const APP_CATEGORIES: Record<AppCategory, { label: string; icon: string }> = {
  rechner: { label: 'Rechner', icon: '🧮' },
  checker: { label: 'Checker', icon: '✅' },
  formulare: { label: 'Formulare', icon: '📄' },
  fintech: { label: 'FinTech', icon: '💰' },
  tools: { label: 'Tools', icon: '🔧' },
}
