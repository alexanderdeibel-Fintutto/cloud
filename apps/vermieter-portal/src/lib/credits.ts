// Credits System Types and Constants for Fintutto Vermieter-Portal

export type PlanType = 'free' | 'starter' | 'pro' | 'unlimited'

export interface Plan {
  id: PlanType
  name: string
  price: number // in cents
  yearlyPrice: number // in cents
  monthlyCredits: number // -1 for unlimited
  canSave: boolean
  aiMessages: number // -1 for unlimited, 0 for none
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    monthlyCredits: 3,
    canSave: false,
    aiMessages: 0,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 299, // 2.99€
    yearlyPrice: 2870, // 28.70€
    monthlyCredits: 10,
    canSave: true,
    aiMessages: 0,
    stripePriceIdMonthly: 'price_1T0nas52lqSgjCzexI8LixAK',
    stripePriceIdYearly: 'price_1T0nas52lqSgjCzeHgR61lIm',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 799, // 7.99€
    yearlyPrice: 7670, // 76.70€
    monthlyCredits: 30,
    canSave: true,
    aiMessages: 50,
    stripePriceIdMonthly: 'price_1T0nat52lqSgjCzeAgmYPn2r',
    stripePriceIdYearly: 'price_1T0nat52lqSgjCzeb2W8OvFu',
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    price: 1499, // 14.99€
    yearlyPrice: 14390, // 143.90€
    monthlyCredits: -1, // unlimited
    canSave: true,
    aiMessages: -1, // unlimited
    stripePriceIdMonthly: 'price_1T0nau52lqSgjCzeX6l8caP5',
    stripePriceIdYearly: 'price_1T0nau52lqSgjCzeGwN7tWuo',
  },
}

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
    reason: `Du benötigst ${totalCost} Credits, hast aber nur ${userCredits.creditsRemaining} übrig.`,
    cost: totalCost,
  }
}

export function canUseAI(userCredits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[userCredits.plan]

  if (plan.aiMessages === 0) {
    return {
      allowed: false,
      reason: 'Der KI-Assistent ist nur in Pro und Unlimited verfügbar.',
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
  if (credits === -1) return '∞'
  return credits.toString()
}
