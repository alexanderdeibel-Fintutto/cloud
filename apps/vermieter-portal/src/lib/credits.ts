// Credits System for Fintutto Vermieter-Portal
// Uses the same plan structure as the main portal credits system
// Stripe Price IDs are configured via environment variables

export type PlanType = 'free' | 'vermieter_basic' | 'kombi_pro' | 'unlimited'

export interface Plan {
  id: PlanType
  name: string
  description: string
  price: number // in cents
  yearlyPrice: number // in cents
  monthlyCredits: number // -1 for unlimited
  canSave: boolean
  aiMessages: number // -1 for unlimited, 0 for none
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: string[]
}

function getEnv(key: string, fallback: string = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback
  }
  return fallback
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Kostenlos',
    description: 'Zum Ausprobieren',
    price: 0,
    yearlyPrice: 0,
    monthlyCredits: 3,
    canSave: false,
    aiMessages: 0,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: [
      '3 Credits pro Monat',
      'Alle Rechner verfuegbar',
      'Alle Formulare verfuegbar',
      'PDF-Export (mit Wasserzeichen)',
    ],
  },
  vermieter_basic: {
    id: 'vermieter_basic',
    name: 'Vermieter',
    description: 'Alle Rechner & Formulare',
    price: 799, // 7.99 EUR
    yearlyPrice: 7670, // 76.70 EUR
    monthlyCredits: 20,
    canSave: true,
    aiMessages: 20,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_VERMIETER_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_VERMIETER_YEARLY'),
    features: [
      '20 Credits pro Monat',
      'Alle Rechner verfuegbar',
      'Alle Formulare verfuegbar',
      'PDF-Export ohne Wasserzeichen',
      'Berechnungen speichern',
      '20 KI-Nachrichten/Monat',
    ],
  },
  kombi_pro: {
    id: 'kombi_pro',
    name: 'Kombi Pro',
    description: 'Rechner + Checker + Formulare',
    price: 1199, // 11.99 EUR
    yearlyPrice: 11510, // 115.10 EUR
    monthlyCredits: 50,
    canSave: true,
    aiMessages: 50,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_KOMBI_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_KOMBI_YEARLY'),
    features: [
      '50 Credits pro Monat',
      'Alle Rechner + Checker',
      'Alle Formulare',
      'PDF-Export ohne Wasserzeichen',
      'Berechnungen speichern',
      '50 KI-Nachrichten/Monat',
    ],
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'Unbegrenzt alles nutzen',
    price: 1999, // 19.99 EUR
    yearlyPrice: 19190, // 191.90 EUR
    monthlyCredits: -1,
    canSave: true,
    aiMessages: -1,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_UNLIMITED_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_UNLIMITED_YEARLY'),
    features: [
      'Unbegrenzte Credits',
      'Alle Rechner + Checker',
      'Alle Formulare',
      'PDF-Export ohne Wasserzeichen',
      'Unbegrenzt speichern',
      'KI-Assistent (unbegrenzt)',
    ],
  },
}

export const PLANS_LIST: Plan[] = Object.values(PLANS)

// Credit costs for different actions
export type ActionType =
  | 'simple_calculator'
  | 'standard_document'
  | 'premium_document'
  | 'pdf_export'

export const CREDIT_COSTS: Record<ActionType, number> = {
  simple_calculator: 1,
  standard_document: 2,
  premium_document: 3,
  pdf_export: 1,
}

// Mapping of tools to their action types
export const TOOL_ACTION_MAP: Record<string, ActionType> = {
  // Calculators (all simple)
  'kautions-rechner': 'simple_calculator',
  'mieterhoehungs-rechner': 'simple_calculator',
  'kaufnebenkosten-rechner': 'simple_calculator',
  'eigenkapital-rechner': 'simple_calculator',
  'grundsteuer-rechner': 'simple_calculator',
  'rendite-rechner': 'simple_calculator',
  'nebenkosten-rechner': 'simple_calculator',

  // Standard documents
  'nebenkostenabrechnung': 'standard_document',
  'uebergabeprotokoll': 'standard_document',
  'zahlungserinnerung': 'standard_document',

  // Premium documents
  'mietvertrag': 'premium_document',
  'kuendigungsschreiben': 'premium_document',
  'mieterhoehung-schreiben': 'premium_document',
}

export interface UserCredits {
  userId: string
  plan: PlanType
  creditsRemaining: number
  aiMessagesRemaining: number
  periodStart: Date
  periodEnd: Date
}

export function canPerformAction(
  userCredits: UserCredits,
  actionType: ActionType,
  includePdfExport: boolean = false
): { allowed: boolean; reason?: string; cost: number } {
  const plan = PLANS[userCredits.plan]

  // Unlimited plan always allowed
  if (plan.monthlyCredits === -1) {
    return { allowed: true, cost: 0 }
  }

  let totalCost = CREDIT_COSTS[actionType]
  if (includePdfExport) {
    totalCost += CREDIT_COSTS.pdf_export
  }

  if (userCredits.creditsRemaining >= totalCost) {
    return { allowed: true, cost: totalCost }
  }

  return {
    allowed: false,
    reason: `Du benoetigst ${totalCost} Credits, hast aber nur ${userCredits.creditsRemaining} uebrig.`,
    cost: totalCost,
  }
}

export function canUseAI(userCredits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[userCredits.plan]

  if (plan.aiMessages === 0) {
    return {
      allowed: false,
      reason: 'Der KI-Assistent ist nur in kostenpflichtigen Plaenen verfuegbar.',
    }
  }

  // Unlimited AI
  if (plan.aiMessages === -1) {
    return { allowed: true }
  }

  if (userCredits.aiMessagesRemaining > 0) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `Du hast dein Limit von ${plan.aiMessages} KI-Nachrichten diesen Monat erreicht.`,
  }
}

export function formatCreditsDisplay(credits: number): string {
  if (credits === -1) return '\u221E'
  return credits.toString()
}
