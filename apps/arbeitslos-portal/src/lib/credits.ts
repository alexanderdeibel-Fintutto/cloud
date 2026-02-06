export type PlanType = 'free' | 'plus' | 'premium'

export interface PlanConfig {
  name: string
  price: number
  priceYearly: number
  chatQuestionsPerDay: number
  lettersPerMonth: number
  forumAccess: 'read' | 'read_write' | 'full'
  includedLetters: number
  letterPrice: number
  prioritySupport: boolean
  aiPowered: boolean
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Kostenlos',
    price: 0,
    priceYearly: 0,
    chatQuestionsPerDay: 1,
    lettersPerMonth: 0,
    forumAccess: 'read',
    includedLetters: 0,
    letterPrice: 2.99,
    prioritySupport: false,
    aiPowered: false,
  },
  plus: {
    name: 'Plus',
    price: 3.99,
    priceYearly: 39.99,
    chatQuestionsPerDay: 20,
    lettersPerMonth: 3,
    forumAccess: 'read_write',
    includedLetters: 0,
    letterPrice: 1.99,
    prioritySupport: false,
    aiPowered: true,
  },
  premium: {
    name: 'Premium',
    price: 7.99,
    priceYearly: 79.99,
    chatQuestionsPerDay: -1, // unlimited
    lettersPerMonth: -1, // unlimited
    forumAccess: 'full',
    includedLetters: 3,
    letterPrice: 0.99,
    prioritySupport: true,
    aiPowered: true,
  },
}

export interface UserCredits {
  userId: string
  plan: PlanType
  chatQuestionsUsedToday: number
  lettersGeneratedThisMonth: number
  freeLettersRemaining: number
  periodStart: Date
  periodEnd: Date
}

export function canAskQuestion(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.chatQuestionsPerDay === -1) {
    return { allowed: true }
  }
  if (credits.chatQuestionsUsedToday >= plan.chatQuestionsPerDay) {
    if (credits.plan === 'free') {
      return {
        allowed: false,
        reason: 'Du hast deine kostenlose Frage fuer heute aufgebraucht. Upgrade auf Plus fuer 20 Fragen/Tag.',
      }
    }
    return {
      allowed: false,
      reason: `Du hast dein Tageslimit von ${plan.chatQuestionsPerDay} Fragen erreicht. Upgrade auf Premium fuer unbegrenzte Fragen.`,
    }
  }
  return { allowed: true }
}

export function canGenerateLetter(credits: UserCredits): { allowed: boolean; reason?: string; cost: number } {
  const plan = PLANS[credits.plan]

  if (plan.lettersPerMonth === -1) {
    if (credits.freeLettersRemaining > 0) {
      return { allowed: true, cost: 0 }
    }
    return { allowed: true, cost: plan.letterPrice }
  }

  if (credits.plan === 'free') {
    return {
      allowed: true,
      cost: plan.letterPrice,
      reason: 'Einzelkauf: Schreiben wird fuer dich generiert und ist sofort einsatzbereit.',
    }
  }

  if (credits.lettersGeneratedThisMonth < plan.lettersPerMonth) {
    return { allowed: true, cost: 0 }
  }

  return {
    allowed: true,
    cost: plan.letterPrice,
    reason: `Monatliches Kontingent (${plan.lettersPerMonth}) aufgebraucht. Weitere Schreiben kosten ${plan.letterPrice} EUR.`,
  }
}

export function canPostInForum(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.forumAccess === 'read') {
    return {
      allowed: false,
      reason: 'Forum-Beitraege sind ab dem Plus-Tarif verfuegbar. Upgrade jetzt!',
    }
  }
  return { allowed: true }
}
