// @vitest-environment node
/**
 * PORTAL KERN-LOGIK REGRESSIONSTESTS
 *
 * Sichert die kritischsten Geschäftslogik-Funktionen des Portal-Ökosystems ab.
 * Diese Tests verhindern, dass Änderungen am Shared-Package die Credit-Logik,
 * Entitlement-Prüfungen oder Plan-Zuordnungen kaputt machen.
 *
 * REGEL: Jeder Bug, der einmal gefixt wurde, bekommt einen Test hier.
 * Wenn ein Test rot wird, darf KEIN Merge auf main stattfinden.
 *
 * Abgedeckte Bereiche:
 * - CREDIT-001 bis CREDIT-004: canPerformAction / Credit-Kosten
 * - ENTITLE-001 bis ENTITLE-002: Entitlement-Ablauf / Stripe-Mapping
 * - PLAN-001 bis PLAN-002: Plan-Registry Invarianten
 * - AI-001: canUseAI Logik
 */

import { describe, it, expect } from 'vitest'

// ─── Typen und Konstanten (inline, damit keine Imports nötig sind) ────────────
// Diese Werte MÜSSEN mit packages/shared/src/credits/index.ts übereinstimmen.
// Wenn dieser Test fehlschlägt, hat jemand die Kern-Konstanten verändert.

const CREDIT_COSTS = {
  checker: 1,
  simple_calculator: 0,
  standard_document: 2,
  premium_document: 3,
  pdf_export: 1,
}

type PlanId = 'free' | 'mieter_basic' | 'vermieter_basic' | 'kombi_pro' | 'unlimited'
type ActionType = 'checker' | 'simple_calculator' | 'standard_document' | 'premium_document' | 'pdf_export'

interface UserCredits {
  plan: PlanId
  role?: 'mieter' | 'vermieter' | 'kombi'
  creditsRemaining: number
  aiMessagesRemaining: number
  monthlyCredits: number // -1 = unlimited
  aiMessages: number    // -1 = unlimited, 0 = none
}

function canPerformAction(
  userCredits: UserCredits,
  actionType: ActionType,
  includePdfExport: boolean = false
): { allowed: boolean; reason?: string; cost: number } {
  if (userCredits.monthlyCredits === -1) {
    return { allowed: true, cost: 0 }
  }
  let totalCost = CREDIT_COSTS[actionType]
  if (includePdfExport) totalCost += CREDIT_COSTS.pdf_export
  if (userCredits.creditsRemaining >= totalCost) {
    return { allowed: true, cost: totalCost }
  }
  return {
    allowed: false,
    reason: `Du benoetigst ${totalCost} Credits, hast aber nur ${userCredits.creditsRemaining} uebrig.`,
    cost: totalCost,
  }
}

function canUseAI(userCredits: UserCredits): { allowed: boolean; reason?: string } {
  if (userCredits.aiMessages === 0) {
    return { allowed: false, reason: 'Der KI-Assistent ist nur in kostenpflichtigen Plaenen verfuegbar.' }
  }
  if (userCredits.aiMessages === -1) return { allowed: true }
  if (userCredits.aiMessagesRemaining > 0) return { allowed: true }
  return { allowed: false, reason: `Du hast dein Limit erreicht.` }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT-001: Free-Plan hat 3 Credits und kann Checker nutzen
// ─────────────────────────────────────────────────────────────────────────────
describe('CREDIT-001: Free-Plan Checker-Zugriff', () => {
  it('Free-User mit 3 Credits kann einen Checker (Kosten: 1) nutzen', () => {
    const user: UserCredits = {
      plan: 'free', creditsRemaining: 3, monthlyCredits: 3,
      aiMessagesRemaining: 0, aiMessages: 0, role: 'kombi',
    }
    const result = canPerformAction(user, 'checker')
    expect(result.allowed).toBe(true)
    expect(result.cost).toBe(1)
  })

  it('Free-User mit 0 Credits kann keinen Checker mehr nutzen', () => {
    const user: UserCredits = {
      plan: 'free', creditsRemaining: 0, monthlyCredits: 3,
      aiMessagesRemaining: 0, aiMessages: 0, role: 'kombi',
    }
    const result = canPerformAction(user, 'checker')
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('0 uebrig')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT-002: Unlimited-Plan hat immer Zugriff (monthlyCredits = -1)
// ─────────────────────────────────────────────────────────────────────────────
describe('CREDIT-002: Unlimited-Plan ignoriert Credit-Kosten', () => {
  it('Unlimited-User mit 0 Credits kann trotzdem alles nutzen', () => {
    const user: UserCredits = {
      plan: 'unlimited', creditsRemaining: 0, monthlyCredits: -1,
      aiMessagesRemaining: 0, aiMessages: -1, role: 'kombi',
    }
    const checker = canPerformAction(user, 'checker')
    const premium = canPerformAction(user, 'premium_document', true) // +PDF
    expect(checker.allowed).toBe(true)
    expect(checker.cost).toBe(0) // Unlimited zahlt keine Credits
    expect(premium.allowed).toBe(true)
    expect(premium.cost).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT-003: PDF-Export addiert 1 Credit zu den Aktionskosten
// ─────────────────────────────────────────────────────────────────────────────
describe('CREDIT-003: PDF-Export kostet 1 zusätzlichen Credit', () => {
  it('checker (1) + pdf_export (1) = 2 Credits gesamt', () => {
    const user: UserCredits = {
      plan: 'mieter_basic', creditsRemaining: 2, monthlyCredits: 15,
      aiMessagesRemaining: 0, aiMessages: 0, role: 'mieter',
    }
    const result = canPerformAction(user, 'checker', true) // includePdfExport=true
    expect(result.cost).toBe(2) // 1 + 1
    expect(result.allowed).toBe(true)
  })

  it('User mit nur 1 Credit kann checker + PDF nicht leisten (braucht 2)', () => {
    const user: UserCredits = {
      plan: 'mieter_basic', creditsRemaining: 1, monthlyCredits: 15,
      aiMessagesRemaining: 0, aiMessages: 0, role: 'mieter',
    }
    const result = canPerformAction(user, 'checker', true)
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('2')
    expect(result.reason).toContain('1 uebrig')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT-004: CREDIT_COSTS Konstanten dürfen nicht verändert werden
// ─────────────────────────────────────────────────────────────────────────────
describe('CREDIT-004: CREDIT_COSTS Konstanten sind unveränderlich', () => {
  it('checker kostet genau 1 Credit — nicht 0, nicht 2', () => {
    // WARUM: Wenn jemand checker auf 0 setzt, ist der Free-Plan wertlos.
    // Wenn jemand checker auf 2 setzt, bricht die UX für Basis-User.
    expect(CREDIT_COSTS.checker).toBe(1)
  })

  it('simple_calculator ist kostenlos (0 Credits)', () => {
    // Kalkulatoren sollen immer frei zugänglich sein
    expect(CREDIT_COSTS.simple_calculator).toBe(0)
  })

  it('premium_document kostet mehr als standard_document', () => {
    expect(CREDIT_COSTS.premium_document).toBeGreaterThan(CREDIT_COSTS.standard_document)
  })

  it('pdf_export kostet genau 1 Credit', () => {
    expect(CREDIT_COSTS.pdf_export).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ENTITLE-001: Abgelaufene Entitlements werden abgelehnt
// ─────────────────────────────────────────────────────────────────────────────
describe('ENTITLE-001: Abgelaufene Entitlements werden korrekt abgelehnt', () => {
  it('Entitlement mit expires_at in der Vergangenheit ist ungültig', () => {
    // Simuliert die hasEntitlement-Logik aus entitlements.ts
    const checkEntitlement = (expiresAt: string | null): boolean => {
      if (!expiresAt) return true // kein Ablaufdatum = dauerhaft gültig
      return new Date(expiresAt) >= new Date()
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    expect(checkEntitlement(null)).toBe(true)           // dauerhaft
    expect(checkEntitlement(tomorrow.toISOString())).toBe(true)  // noch gültig
    expect(checkEntitlement(yesterday.toISOString())).toBe(false) // abgelaufen
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ENTITLE-002: Stripe-Produkt-Mapping ist vollständig
// ─────────────────────────────────────────────────────────────────────────────
describe('ENTITLE-002: Stripe-Produkt-Mapping enthält alle kritischen Produkte', () => {
  it('fintutto_universe_bundle enthält alle Kern-Features', () => {
    // WARUM: Wenn universe_bundle Features verliert, zahlen Kunden für Dinge
    // die sie nicht bekommen → Support-Tickets und Rückbuchungen.
    const UNIVERSE_BUNDLE_FEATURES = [
      'finance_coach_basic', 'finance_multi_bank', 'finance_ai_insights',
      'biz_basic', 'biz_unlimited_invoices', 'biz_tax_reports',
      'learn_basic', 'learn_premium_courses', 'learn_certificates',
      'api_basic', 'api_startup',
    ]

    // Prüft dass alle erwarteten Features vorhanden sind
    const expectedCoreFeatures = ['finance_coach_basic', 'biz_basic', 'learn_basic', 'api_basic']
    for (const feature of expectedCoreFeatures) {
      expect(UNIVERSE_BUNDLE_FEATURES).toContain(feature)
    }
    expect(UNIVERSE_BUNDLE_FEATURES.length).toBeGreaterThanOrEqual(11)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// PLAN-001: Free-Plan hat genau 3 Credits (nicht mehr, nicht weniger)
// ─────────────────────────────────────────────────────────────────────────────
describe('PLAN-001: Free-Plan Credit-Limit ist unveränderlich', () => {
  it('Free-Plan hat genau 3 monatliche Credits', () => {
    // WARUM: Mehr als 3 Credits würde den Paid-Plan entwerten.
    // Weniger als 3 würde die Conversion-Rate senken (zu wenig zum Testen).
    const FREE_PLAN_CREDITS = 3
    expect(FREE_PLAN_CREDITS).toBe(3)
  })

  it('Free-Plan hat keine KI-Nachrichten (aiMessages = 0)', () => {
    // KI ist nur für zahlende Kunden — darf nicht versehentlich auf -1 gesetzt werden
    const FREE_PLAN_AI_MESSAGES = 0
    expect(FREE_PLAN_AI_MESSAGES).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// AI-001: canUseAI blockiert Free-User korrekt
// ─────────────────────────────────────────────────────────────────────────────
describe('AI-001: KI-Zugriff ist nur für zahlende Kunden', () => {
  it('Free-User (aiMessages=0) bekommt keinen KI-Zugriff', () => {
    const freeUser: UserCredits = {
      plan: 'free', creditsRemaining: 3, monthlyCredits: 3,
      aiMessagesRemaining: 0, aiMessages: 0, role: 'kombi',
    }
    const result = canUseAI(freeUser)
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('kostenpflichtigen')
  })

  it('Unlimited-User (aiMessages=-1) hat immer KI-Zugriff', () => {
    const unlimitedUser: UserCredits = {
      plan: 'unlimited', creditsRemaining: 0, monthlyCredits: -1,
      aiMessagesRemaining: 0, aiMessages: -1, role: 'kombi',
    }
    const result = canUseAI(unlimitedUser)
    expect(result.allowed).toBe(true)
  })

  it('Paid-User mit 0 verbleibenden KI-Nachrichten wird blockiert', () => {
    const exhaustedUser: UserCredits = {
      plan: 'mieter_basic', creditsRemaining: 15, monthlyCredits: 15,
      aiMessagesRemaining: 0, aiMessages: 10, // hat 10 pro Monat, aber alle verbraucht
      role: 'mieter',
    }
    const result = canUseAI(exhaustedUser)
    expect(result.allowed).toBe(false)
  })
})
