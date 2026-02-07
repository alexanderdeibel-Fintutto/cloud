import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  UserCredits,
  PlanType,
  PLANS,
  ActionType,
  canPerformAction,
  canUseAI,
  CREDIT_COSTS,
} from '../lib/credits'

interface CreditsContextType {
  credits: UserCredits | null
  isLoading: boolean
  checkAction: (actionType: ActionType, includePdf?: boolean) => { allowed: boolean; reason?: string; cost: number }
  useCredits: (actionType: ActionType, includePdf?: boolean) => Promise<boolean>
  checkAI: () => { allowed: boolean; reason?: string }
  useAIMessage: () => Promise<boolean>
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

// Mock user credits for development - will be replaced with Supabase
function getMockUserCredits(): UserCredits {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    userId: 'mock-user-id',
    plan: 'free',
    creditsRemaining: 3,
    aiMessagesRemaining: 0,
    periodStart,
    periodEnd,
  }
}

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load credits on mount
    loadCredits()
  }, [])

  async function loadCredits() {
    setIsLoading(true)
    try {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('user_credits')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .single()

      // For now, use mock data
      const mockCredits = getMockUserCredits()
      setCredits(mockCredits)
    } catch (error) {
      console.error('Failed to load credits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshCredits() {
    await loadCredits()
  }

  function checkAction(actionType: ActionType, includePdf: boolean = false) {
    if (!credits) {
      return { allowed: false, reason: 'Bitte melde dich an.', cost: CREDIT_COSTS[actionType] }
    }
    return canPerformAction(credits, actionType, includePdf)
  }

  async function useCredits(actionType: ActionType, includePdf: boolean = false): Promise<boolean> {
    if (!credits) return false

    const check = canPerformAction(credits, actionType, includePdf)
    if (!check.allowed) return false

    // Update local state
    setCredits((prev) => {
      if (!prev) return prev
      const plan = PLANS[prev.plan]
      if (plan.monthlyCredits === -1) return prev // Unlimited

      return {
        ...prev,
        creditsRemaining: prev.creditsRemaining - check.cost,
      }
    })

    // TODO: Update in Supabase
    // await supabase
    //   .from('user_credits')
    //   .update({ credits_remaining: credits.creditsRemaining - check.cost })
    //   .eq('user_id', credits.userId)

    return true
  }

  function checkAI() {
    if (!credits) {
      return { allowed: false, reason: 'Bitte melde dich an.' }
    }
    return canUseAI(credits)
  }

  async function useAIMessage(): Promise<boolean> {
    if (!credits) return false

    const check = canUseAI(credits)
    if (!check.allowed) return false

    const plan = PLANS[credits.plan]
    if (plan.aiMessages === -1) return true // Unlimited

    // Update local state
    setCredits((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        aiMessagesRemaining: prev.aiMessagesRemaining - 1,
      }
    })

    // TODO: Update in Supabase
    // await supabase
    //   .from('user_credits')
    //   .update({ ai_messages_remaining: credits.aiMessagesRemaining - 1 })
    //   .eq('user_id', credits.userId)

    return true
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        checkAction,
        useCredits,
        checkAI,
        useAIMessage,
        refreshCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider')
  }
  return context
}
