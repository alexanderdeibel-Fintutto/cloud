export type PlanType = 'schnupperer' | 'starter' | 'kaempfer' | 'vollschutz'

export interface PlanConfig {
  name: string
  price: number
  priceYearly: number
  creditsPerMonth: number
  chatMessagesPerDay: number
  lettersPerMonth: number
  bescheidScansPerMonth: number
  forumAccess: 'read_post' | 'read_post_chat_limited' | 'full' | 'vip'
  postversandInklusive: number
  prioritySupport: boolean
  mieterAppInklusive: boolean | 'basic' | 'premium'
  letterPrice: number
  tier: number
  badge?: string
}

export const PLANS: Record<PlanType, PlanConfig> = {
  schnupperer: {
    name: 'Schnupperer',
    price: 0,
    priceYearly: 0,
    creditsPerMonth: 0,
    chatMessagesPerDay: 3,
    lettersPerMonth: 0,
    bescheidScansPerMonth: 1,
    forumAccess: 'read_post',
    postversandInklusive: 0,
    prioritySupport: false,
    mieterAppInklusive: false,
    letterPrice: 2.99,
    tier: 0,
  },
  starter: {
    name: 'Starter',
    price: 2.99,
    priceYearly: 29.99,
    creditsPerMonth: 10,
    chatMessagesPerDay: 10,
    lettersPerMonth: 1,
    bescheidScansPerMonth: 3,
    forumAccess: 'read_post_chat_limited',
    postversandInklusive: 0,
    prioritySupport: false,
    mieterAppInklusive: false,
    letterPrice: 1.99,
    tier: 1,
  },
  kaempfer: {
    name: 'Kaempfer',
    price: 4.99,
    priceYearly: 49.99,
    creditsPerMonth: 25,
    chatMessagesPerDay: -1,
    lettersPerMonth: 3,
    bescheidScansPerMonth: -1,
    forumAccess: 'full',
    postversandInklusive: 1,
    prioritySupport: true,
    mieterAppInklusive: 'basic',
    letterPrice: 0.99,
    tier: 2,
    badge: 'Beliebt',
  },
  vollschutz: {
    name: 'Vollschutz',
    price: 7.99,
    priceYearly: 79.99,
    creditsPerMonth: 50,
    chatMessagesPerDay: -1,
    lettersPerMonth: -1,
    bescheidScansPerMonth: -1,
    forumAccess: 'vip',
    postversandInklusive: 3,
    prioritySupport: true,
    mieterAppInklusive: 'premium',
    letterPrice: 0,
    tier: 3,
    badge: 'VIP',
  },
}

export const CREDIT_COSTS = {
  bescheidScan: 1,
  bescheidAnalyseDetail: 3,
  chatNachrichten5: 1,
  musterVorschau: 0,
  personalisierterBrief: 3,
  postversandStandard: 6,
  postversandEinschreiben: 10,
  privatchatProTag: 1,
}

export const CREDIT_PACKAGES = [
  { credits: 10, price: 4.99, label: '10 Credits' },
  { credits: 25, price: 9.99, label: '25 Credits', discount: '10%' },
  { credits: 50, price: 17.99, label: '50 Credits', discount: '20%' },
]

export interface UserCredits {
  userId: string
  plan: PlanType
  creditsAktuell: number
  chatMessagesUsedToday: number
  lettersGeneratedThisMonth: number
  scansThisMonth: number
  periodStart: Date
  periodEnd: Date
}

export function canAskQuestion(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.chatMessagesPerDay === -1) {
    return { allowed: true }
  }
  if (credits.chatMessagesUsedToday >= plan.chatMessagesPerDay) {
    if (credits.plan === 'schnupperer') {
      return {
        allowed: false,
        reason: 'Du hast deine 3 kostenlosen Nachrichten fuer heute aufgebraucht. Upgrade auf Starter fuer 10/Tag oder Kaempfer fuer unbegrenzt.',
      }
    }
    return {
      allowed: false,
      reason: `Tageslimit von ${plan.chatMessagesPerDay} Nachrichten erreicht. Upgrade auf Kaempfer fuer unbegrenzten Chat.`,
    }
  }
  return { allowed: true }
}

export function canGenerateLetter(credits: UserCredits): { allowed: boolean; reason?: string; cost: number } {
  const plan = PLANS[credits.plan]

  if (plan.lettersPerMonth === -1) {
    return { allowed: true, cost: 0 }
  }

  if (credits.plan === 'schnupperer') {
    return {
      allowed: true,
      cost: plan.letterPrice,
      reason: 'Einzelkauf: Personalisiertes Schreiben fuer dich erstellt.',
    }
  }

  if (credits.lettersGeneratedThisMonth < plan.lettersPerMonth) {
    return { allowed: true, cost: 0 }
  }

  return {
    allowed: true,
    cost: plan.letterPrice,
    reason: `Monatskontingent (${plan.lettersPerMonth}) aufgebraucht. Weitere: ${plan.letterPrice} EUR.`,
  }
}

export function canScanBescheid(credits: UserCredits): { allowed: boolean; reason?: string } {
  const plan = PLANS[credits.plan]
  if (plan.bescheidScansPerMonth === -1) {
    return { allowed: true }
  }
  if (credits.scansThisMonth >= plan.bescheidScansPerMonth) {
    return {
      allowed: false,
      reason: `Scan-Limit (${plan.bescheidScansPerMonth}/Monat) erreicht. Upgrade fuer mehr Scans.`,
    }
  }
  return { allowed: true }
}

export function canPostInForum(): { allowed: boolean; reason?: string } {
  return { allowed: true }
}
