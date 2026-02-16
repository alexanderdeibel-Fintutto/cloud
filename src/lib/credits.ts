// Unified Credits System for Fintutto Portal
// Single source of truth for all Portal pricing (Mieter + Vermieter)
// Stripe Price IDs are configured via environment variables (VITE_STRIPE_PRICE_*)
// Run scripts/create-stripe-products.sh to create products in Stripe and get the IDs

export type PlanType = 'free' | 'mieter_basic' | 'vermieter_basic' | 'kombi_pro' | 'unlimited'
export type UserRole = 'mieter' | 'vermieter' | 'kombi'

export interface Plan {
  id: PlanType
  name: string
  description: string
  role: UserRole
  price: number // monthly in cents
  yearlyPrice: number // yearly in cents
  monthlyCredits: number // -1 for unlimited
  canSave: boolean
  canExportPdf: boolean
  aiMessages: number // -1 for unlimited, 0 for none
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: string[]
}

// Read Stripe Price IDs from environment variables
// Set these in Vercel/production via VITE_STRIPE_PRICE_* env vars
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
    role: 'kombi',
    price: 0,
    yearlyPrice: 0,
    monthlyCredits: 3,
    canSave: false,
    canExportPdf: false,
    aiMessages: 0,
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    features: [
      '3 Credits pro Monat',
      'Alle Checker & Rechner verfuegbar',
      'Sofortige Ergebnisse',
      'Kein Speichern moeglich',
    ],
  },
  mieter_basic: {
    id: 'mieter_basic',
    name: 'Mieter',
    description: 'Alle Checker & Mieter-Formulare',
    role: 'mieter',
    price: 499, // 4.99 EUR
    yearlyPrice: 4790, // 47.90 EUR
    monthlyCredits: 15,
    canSave: true,
    canExportPdf: true,
    aiMessages: 10,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_MIETER_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_MIETER_YEARLY'),
    features: [
      '15 Credits pro Monat',
      'Alle Mieter-Checker',
      'Mieter-Formulare',
      'Ergebnisse speichern',
      'PDF-Export',
      '10 KI-Nachrichten/Monat',
    ],
  },
  vermieter_basic: {
    id: 'vermieter_basic',
    name: 'Vermieter',
    description: 'Alle Rechner & Vermieter-Formulare',
    role: 'vermieter',
    price: 799, // 7.99 EUR
    yearlyPrice: 7670, // 76.70 EUR
    monthlyCredits: 20,
    canSave: true,
    canExportPdf: true,
    aiMessages: 20,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_VERMIETER_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_VERMIETER_YEARLY'),
    features: [
      '20 Credits pro Monat',
      'Alle Vermieter-Rechner',
      'Vermieter-Formulare',
      'Ergebnisse speichern',
      'PDF-Export',
      '20 KI-Nachrichten/Monat',
    ],
  },
  kombi_pro: {
    id: 'kombi_pro',
    name: 'Kombi Pro',
    description: 'Alles: Rechner + Checker + Formulare',
    role: 'kombi',
    price: 1199, // 11.99 EUR
    yearlyPrice: 11510, // 115.10 EUR
    monthlyCredits: 50,
    canSave: true,
    canExportPdf: true,
    aiMessages: 50,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_KOMBI_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_KOMBI_YEARLY'),
    features: [
      '50 Credits pro Monat',
      'Alle Checker + Rechner',
      'Alle Formulare',
      'Ergebnisse speichern',
      'PDF-Export',
      '50 KI-Nachrichten/Monat',
    ],
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'Unbegrenzt alles nutzen',
    role: 'kombi',
    price: 1999, // 19.99 EUR
    yearlyPrice: 19190, // 191.90 EUR
    monthlyCredits: -1,
    canSave: true,
    canExportPdf: true,
    aiMessages: -1,
    stripePriceIdMonthly: getEnv('VITE_STRIPE_PRICE_UNLIMITED_MONTHLY'),
    stripePriceIdYearly: getEnv('VITE_STRIPE_PRICE_UNLIMITED_YEARLY'),
    features: [
      'Unbegrenzte Credits',
      'Alle Checker + Rechner',
      'Alle Formulare',
      'Unbegrenzt speichern',
      'PDF-Export',
      'Unbegrenzt KI-Nachrichten',
    ],
  },
}

// Helper: Get plan as array (for rendering pricing pages)
export const PLANS_LIST: Plan[] = Object.values(PLANS)

// Credit limits per plan (for webhook/API use)
export const PLAN_CREDIT_LIMITS: Record<PlanType, number> = {
  free: 3,
  mieter_basic: 15,
  vermieter_basic: 20,
  kombi_pro: 50,
  unlimited: -1,
}

// Resolve a Stripe Price ID to a PlanType (for webhook processing)
export function getPlanByPriceId(priceId: string): PlanType | undefined {
  for (const plan of PLANS_LIST) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return plan.id
    }
  }
  return undefined
}

export type ActionType =
  | 'checker'           // Mieter-Checker (1 Credit)
  | 'simple_calculator' // Vermieter-Rechner (1 Credit)
  | 'standard_document' // Standard-Formular (2 Credits)
  | 'premium_document'  // Premium-Formular (3 Credits)
  | 'pdf_export'        // PDF-Export (1 Credit extra)

export const CREDIT_COSTS: Record<ActionType, number> = {
  checker: 1,
  simple_calculator: 1,
  standard_document: 2,
  premium_document: 3,
  pdf_export: 1,
}

// Which tools require which role
export const TOOL_ROLE_MAP: Record<string, UserRole> = {
  // Checker = Mieter-Tools
  'mietpreisbremse': 'mieter',
  'mieterhoehung-checker': 'mieter',
  'nebenkosten-checker': 'mieter',
  'betriebskosten-checker': 'mieter',
  'kuendigung-checker': 'mieter',
  'kaution-checker': 'mieter',
  'mietminderung': 'mieter',
  'eigenbedarf': 'mieter',
  'modernisierung': 'mieter',
  'schoenheitsreparaturen': 'mieter',
  'mietrecht': 'mieter',

  // Rechner = Vermieter-Tools
  'kautions-rechner': 'vermieter',
  'mieterhoehungs-rechner': 'vermieter',
  'kaufnebenkosten-rechner': 'vermieter',
  'eigenkapital-rechner': 'vermieter',
  'grundsteuer-rechner': 'vermieter',
  'rendite-rechner': 'vermieter',
  'nebenkosten-rechner': 'vermieter',

  // Formulare = mixed
  'mietvertrag': 'vermieter',
  'uebergabeprotokoll': 'vermieter',
  'betriebskostenabrechnung': 'vermieter',
  'mieterhoehung-schreiben': 'vermieter',
  'selbstauskunft': 'vermieter',
  'kuendigung-widerspruch': 'mieter',
  'mietpreisbremse-ruege': 'mieter',
  'nebenkostenabrechnung-widerspruch': 'mieter',
  'kaution-rueckforderung': 'mieter',
  'mietminderung-anzeige': 'mieter',
}

export const TOOL_ACTION_MAP: Record<string, ActionType> = {
  // Checker
  'mietpreisbremse': 'checker',
  'mieterhoehung-checker': 'checker',
  'nebenkosten-checker': 'checker',
  'betriebskosten-checker': 'checker',
  'kuendigung-checker': 'checker',
  'kaution-checker': 'checker',
  'mietminderung': 'checker',
  'eigenbedarf': 'checker',
  'modernisierung': 'checker',
  'schoenheitsreparaturen': 'checker',
  'mietrecht': 'checker',

  // Rechner
  'kautions-rechner': 'simple_calculator',
  'mieterhoehungs-rechner': 'simple_calculator',
  'kaufnebenkosten-rechner': 'simple_calculator',
  'eigenkapital-rechner': 'simple_calculator',
  'grundsteuer-rechner': 'simple_calculator',
  'rendite-rechner': 'simple_calculator',
  'nebenkosten-rechner': 'simple_calculator',

  // Formulare
  'mietvertrag': 'premium_document',
  'uebergabeprotokoll': 'standard_document',
  'betriebskostenabrechnung': 'standard_document',
  'mieterhoehung-schreiben': 'premium_document',
  'selbstauskunft': 'standard_document',
  'kuendigung-widerspruch': 'standard_document',
  'mietpreisbremse-ruege': 'standard_document',
  'nebenkostenabrechnung-widerspruch': 'standard_document',
  'kaution-rueckforderung': 'standard_document',
  'mietminderung-anzeige': 'standard_document',
}

export interface UserCredits {
  userId: string
  plan: PlanType
  role: UserRole
  creditsRemaining: number
  aiMessagesRemaining: number
  periodStart: Date
  periodEnd: Date
}

export function canAccessTool(userCredits: UserCredits, toolId: string): boolean {
  const requiredRole = TOOL_ROLE_MAP[toolId]
  if (!requiredRole) return true

  if (userCredits.role === 'kombi') return true
  return userCredits.role === requiredRole
}

export function canPerformAction(
  userCredits: UserCredits,
  actionType: ActionType,
  includePdfExport: boolean = false
): { allowed: boolean; reason?: string; cost: number } {
  const plan = PLANS[userCredits.plan]

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
    reason: `Du benötigst ${totalCost} Credits, hast aber nur ${userCredits.creditsRemaining} übrig.`,
    cost: totalCost,
  }
}

export function canUseAI(userCredits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[userCredits.plan]

  if (plan.aiMessages === 0) {
    return { allowed: false, reason: 'Der KI-Assistent ist nur in kostenpflichtigen Plänen verfügbar.' }
  }

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
  if (credits === -1) return '∞'
  return credits.toString()
}
