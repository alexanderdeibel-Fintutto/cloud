// Saved Calculations System with Subscription Tier Limits
import { PLANS, type PlanType } from './credits'

export interface SavedCalculation {
  id: string
  userId: string
  toolId: string
  toolType: 'rechner' | 'checker' | 'formular'
  toolName: string
  inputData: Record<string, unknown>
  resultData: Record<string, unknown>
  savedAt: string
  updatedAt: string
  notes?: string
}

export const SAVE_LIMITS: Record<PlanType, number> = {
  free: 0,       // Free users can't save
  mieter_basic: 10,
  vermieter_basic: 15,
  kombi_pro: 50,
  unlimited: -1,  // -1 = unlimited
}

export function canSaveCalculation(plan: PlanType, currentSavedCount: number): {
  allowed: boolean
  reason?: string
  limit: number
  remaining: number
} {
  const planDetails = PLANS[plan]

  if (!planDetails.canSave) {
    return {
      allowed: false,
      reason: 'Berechnungen speichern ist nur in kostenpflichtigen Plänen verfügbar.',
      limit: 0,
      remaining: 0,
    }
  }

  const limit = SAVE_LIMITS[plan]

  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 }
  }

  if (currentSavedCount >= limit) {
    return {
      allowed: false,
      reason: `Du hast das Limit von ${limit} gespeicherten Berechnungen erreicht. Upgrade deinen Plan für mehr.`,
      limit,
      remaining: 0,
    }
  }

  return {
    allowed: true,
    limit,
    remaining: limit - currentSavedCount,
  }
}

// Local storage fallback for demo (Supabase in production)
const STORAGE_KEY = 'fintutto_saved_calculations'

export function getSavedCalculations(): SavedCalculation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCalculation(calc: Omit<SavedCalculation, 'id' | 'savedAt' | 'updatedAt'>): SavedCalculation {
  const saved = getSavedCalculations()
  const newCalc: SavedCalculation = {
    ...calc,
    id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saved.unshift(newCalc)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  return newCalc
}

export function updateCalculation(id: string, updates: Partial<SavedCalculation>): SavedCalculation | null {
  const saved = getSavedCalculations()
  const index = saved.findIndex((c) => c.id === id)
  if (index === -1) return null

  saved[index] = { ...saved[index], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  return saved[index]
}

export function deleteCalculation(id: string): boolean {
  const saved = getSavedCalculations()
  const filtered = saved.filter((c) => c.id !== id)
  if (filtered.length === saved.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function getToolDisplayName(toolId: string): string {
  const names: Record<string, string> = {
    kaution: 'Kautions-Rechner',
    mieterhoehung: 'Mieterhöhungs-Rechner',
    kaufnebenkosten: 'Kaufnebenkosten-Rechner',
    eigenkapital: 'Eigenkapital-Rechner',
    grundsteuer: 'Grundsteuer-Rechner',
    rendite: 'Rendite-Rechner',
    nebenkosten: 'Nebenkosten-Rechner',
    mietpreisbremse: 'Mietpreisbremse-Checker',
    'mieterhoehung-checker': 'Mieterhöhungs-Checker',
    'nebenkosten-checker': 'Nebenkosten-Checker',
    'betriebskosten-checker': 'Betriebskosten-Checker',
    'kuendigung-checker': 'Kündigungs-Checker',
    'kaution-checker': 'Kautions-Checker',
    mietminderung: 'Mietminderungs-Checker',
    eigenbedarf: 'Eigenbedarf-Checker',
    modernisierung: 'Modernisierungs-Checker',
    schoenheitsreparaturen: 'Schönheitsreparaturen-Checker',
  }
  return names[toolId] || toolId
}
