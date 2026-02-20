// Credits System for Mieterportal (Mieter-Checker)
// Stripe Price IDs are configured via environment variables (VITE_STRIPE_PRICE_MIETERCHECKER_*)

export type MieterCheckerPlan = 'free' | 'basis' | 'premium'

export interface Plan {
  id: MieterCheckerPlan
  name: string
  description: string
  price: number // monthly in cents
  yearlyPrice: number // yearly in cents
  monthlyCredits: number // -1 for unlimited
  canSave: boolean
  canExportPdf: boolean
  aiMessages: number // -1 for unlimited, 0 for none
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: string[]
  highlight?: boolean
}

function getEnv(key: string, fallback: string = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback
  }
  return fallback
}

export const PLANS: Record<MieterCheckerPlan, Plan> = {
  free: {
    id: 'free',
    name: 'Kostenlos',
    description: 'Zum Ausprobieren',
    price: 0,
    yearlyPrice: 0,
    monthlyCredits: 1,
    canSave: false,
    canExportPdf: false,
    aiMessages: 0,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: [
      '1 Check pro Monat',
      'Alle 10 Mietrecht-Checker',
      'Sofortige Ergebnisse',
    ],
  },
  basis: {
    id: 'basis',
    name: 'Basis',
    description: 'Fuer regelmaessige Checks',
    price: 99, // 0.99 EUR
    yearlyPrice: 999, // 9.99 EUR
    monthlyCredits: 5,
    canSave: true,
    canExportPdf: false,
    aiMessages: 3,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_MIETERCHECKER_BASIS_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_MIETERCHECKER_BASIS_YEARLY'),
    features: [
      '5 Credits pro Monat',
      'Alle 10 Mietrecht-Checker',
      'Ergebnisse speichern',
      '3 KI-Nachrichten/Monat',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Voller Schutz fuer Mieter',
    price: 399, // 3.99 EUR
    yearlyPrice: 3999, // 39.99 EUR
    monthlyCredits: 15,
    canSave: true,
    canExportPdf: true,
    aiMessages: 10,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_MIETERCHECKER_PREMIUM_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_MIETERCHECKER_PREMIUM_YEARLY'),
    features: [
      '15 Credits pro Monat',
      'Alle 10 Mietrecht-Checker',
      'Ergebnisse speichern',
      'PDF-Export',
      '10 KI-Nachrichten/Monat',
    ],
    highlight: true,
  },
}

export const PLANS_LIST: Plan[] = Object.values(PLANS)

export const PLAN_CREDIT_LIMITS: Record<MieterCheckerPlan, number> = {
  free: 1,
  basis: 5,
  premium: 15,
}

export function getPlanByPriceId(priceId: string): MieterCheckerPlan | undefined {
  for (const plan of PLANS_LIST) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return plan.id
    }
  }
  return undefined
}

export function formatCreditsDisplay(credits: number): string {
  if (credits === -1) return '∞'
  return credits.toString()
}
