// Unified Credits System for Fintutto Portal
// Supports both Mieter (Checker) and Vermieter (Rechner/Formulare) tools

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
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
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
    stripePriceIdMonthly: 'price_portal_mieter_monthly',
    stripePriceIdYearly: 'price_portal_mieter_yearly',
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
    stripePriceIdMonthly: 'price_portal_vermieter_monthly',
    stripePriceIdYearly: 'price_portal_vermieter_yearly',
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
    stripePriceIdMonthly: 'price_portal_kombi_monthly',
    stripePriceIdYearly: 'price_portal_kombi_yearly',
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
    stripePriceIdMonthly: 'price_portal_unlimited_monthly',
    stripePriceIdYearly: 'price_portal_unlimited_yearly',
  },
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
    reason: `Du ben\u00f6tigst ${totalCost} Credits, hast aber nur ${userCredits.creditsRemaining} \u00fcbrig.`,
    cost: totalCost,
  }
}

export function canUseAI(userCredits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[userCredits.plan]

  if (plan.aiMessages === 0) {
    return { allowed: false, reason: 'Der KI-Assistent ist nur in kostenpflichtigen Pl\u00e4nen verf\u00fcgbar.' }
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
  if (credits === -1) return '\u221e'
  return credits.toString()
}
