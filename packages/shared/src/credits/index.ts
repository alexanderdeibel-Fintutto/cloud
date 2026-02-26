// Canonical Credits & Plan Registry for all Fintutto apps
// Single source of truth for plans, credit limits, tool mappings, and helper functions

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'mieter' | 'vermieter' | 'kombi'

// Union of ALL plan IDs across the entire ecosystem
export type PlanId =
  // Portal / Fintutto-Portal plans
  | 'free'
  | 'mieter_basic'
  | 'vermieter_basic'
  | 'kombi_pro'
  | 'unlimited'
  // Mieter-Checker plans (mieterportal)
  | 'mieter_checker_basis'
  | 'mieter_checker_premium'
  // FinTech Universe plans
  | 'finance_coach_premium'
  | 'biz_pro'
  | 'biz_ai_cfo'
  | 'learn_premium'
  | 'api_startup'
  | 'api_pro'
  | 'universe_bundle'

export interface Plan {
  id: PlanId
  name: string
  description: string
  role?: UserRole
  price: number // monthly in cents
  yearlyPrice: number // yearly in cents
  monthlyCredits: number // -1 for unlimited
  canSave: boolean
  canExportPdf?: boolean
  aiMessages: number // -1 for unlimited, 0 for none
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  features: string[]
  highlight?: boolean
}

export type ActionType =
  | 'checker'
  | 'simple_calculator'
  | 'standard_document'
  | 'premium_document'
  | 'pdf_export'

export interface UserCredits {
  userId: string
  plan: PlanId
  role?: UserRole
  creditsRemaining: number
  aiMessagesRemaining: number
  periodStart: Date
  periodEnd: Date
}

// ─── Environment Helper ──────────────────────────────────────────────────────

function getEnv(key: string, fallback: string = ''): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as Record<string, string>)[key] || fallback
  }
  if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
    return ((globalThis as any).process.env as Record<string, string>)[key] || fallback
  }
  return fallback
}

// ─── Canonical Plan Registry ─────────────────────────────────────────────────

export const ALL_PLANS: Record<PlanId, Plan> = {
  // Portal plans (shared by root portal + fintutto-portal + vermieter-portal)
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
    price: 499,
    yearlyPrice: 4790,
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
    price: 799,
    yearlyPrice: 7670,
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
    price: 1199,
    yearlyPrice: 11510,
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
    price: 1999,
    yearlyPrice: 19190,
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

  // Mieter-Checker plans (mieterportal)
  mieter_checker_basis: {
    id: 'mieter_checker_basis',
    name: 'Basis',
    description: 'Fuer regelmaessige Checks',
    price: 99,
    yearlyPrice: 999,
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
  mieter_checker_premium: {
    id: 'mieter_checker_premium',
    name: 'Premium',
    description: 'Voller Schutz fuer Mieter',
    price: 399,
    yearlyPrice: 3999,
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

// ─── Credit Limits (single source of truth for API routes) ───────────────────

export const PLAN_CREDIT_LIMITS: Record<string, number> = {
  // Portal plans
  free: 3,
  mieter_basic: 15,
  vermieter_basic: 20,
  kombi_pro: 50,
  unlimited: -1,
  // Mieter-Checker plans
  mieter_checker_basis: 5,
  mieter_checker_premium: 15,
  // Legacy plan names (backwards compatibility for existing subscriptions)
  basic: 3,
  premium: -1,
  // Vermietify plans (defined in vermietify's own config, mirrored here for webhooks)
  starter: 3,
  pro: 30,
  enterprise: -1,
  // FinTech Universe plans (credits = AI messages per month)
  finance_coach_premium: 30,
  biz_pro: 20,
  biz_ai_cfo: -1,
  learn_premium: 20,
  api_startup: 0,
  api_pro: 0,
  universe_bundle: -1,
}

// ─── App-Scoped Plan Subsets ─────────────────────────────────────────────────

export const PORTAL_PLAN_IDS = ['free', 'mieter_basic', 'vermieter_basic', 'kombi_pro', 'unlimited'] as const
export const VERMIETER_PLAN_IDS = ['free', 'vermieter_basic', 'kombi_pro', 'unlimited'] as const
export const MIETER_CHECKER_PLAN_IDS = ['free', 'mieter_checker_basis', 'mieter_checker_premium'] as const

export type PortalPlanId = (typeof PORTAL_PLAN_IDS)[number]
export type VermieterPlanId = (typeof VERMIETER_PLAN_IDS)[number]
export type MieterCheckerPlanId = (typeof MIETER_CHECKER_PLAN_IDS)[number]

export function getPlansSubset<T extends PlanId>(ids: readonly T[]): Record<T, Plan> {
  return Object.fromEntries(ids.map(id => [id, ALL_PLANS[id]])) as Record<T, Plan>
}

export function getPlansList<T extends PlanId>(ids: readonly T[]): Plan[] {
  return ids.map(id => ALL_PLANS[id])
}

// ─── Credit Costs & Tool Mappings ────────────────────────────────────────────

export const CREDIT_COSTS: Record<ActionType, number> = {
  checker: 1,
  simple_calculator: 1,
  standard_document: 2,
  premium_document: 3,
  pdf_export: 1,
}

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

  // Standard documents
  'uebergabeprotokoll': 'standard_document',
  'betriebskostenabrechnung': 'standard_document',
  'selbstauskunft': 'standard_document',
  'kuendigung-widerspruch': 'standard_document',
  'mietpreisbremse-ruege': 'standard_document',
  'nebenkostenabrechnung-widerspruch': 'standard_document',
  'kaution-rueckforderung': 'standard_document',
  'mietminderung-anzeige': 'standard_document',
  'nebenkostenabrechnung': 'standard_document',
  'zahlungserinnerung': 'standard_document',

  // Premium documents
  'mietvertrag': 'premium_document',
  'mieterhoehung-schreiben': 'premium_document',
  'kuendigungsschreiben': 'premium_document',
}

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getPlanByPriceId(priceId: string, scopeIds?: readonly PlanId[]): PlanId | undefined {
  const plans = scopeIds
    ? scopeIds.map(id => ALL_PLANS[id])
    : Object.values(ALL_PLANS)
  for (const plan of plans) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return plan.id
    }
  }
  return undefined
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
  const plan = ALL_PLANS[userCredits.plan]
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
  const plan = ALL_PLANS[userCredits.plan]

  if (plan.aiMessages === 0) {
    return { allowed: false, reason: 'Der KI-Assistent ist nur in kostenpflichtigen Plaenen verfuegbar.' }
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
  if (credits === -1) return '\u221E'
  return credits.toString()
}
