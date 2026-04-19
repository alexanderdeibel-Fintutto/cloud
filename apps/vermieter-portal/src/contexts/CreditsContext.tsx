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
import { supabase } from '../integrations/supabase'

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

// Fallback-Credits wenn Supabase nicht verfügbar oder Nutzer nicht eingeloggt
function getFallbackCredits(userId: string): UserCredits {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    userId,
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
    loadCredits()
    // Credits neu laden wenn Auth-Status sich ändert
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCredits()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadCredits() {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCredits(null)
        return
      }

      // Aus Supabase laden
      const { data, error } = await supabase
        .from('vermieter_user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        // Noch kein Eintrag: automatisch initialisieren
        await supabase.rpc('init_vermieter_credits', {
          p_user_id: user.id,
          p_plan: 'free',
        })
        setCredits(getFallbackCredits(user.id))
        return
      }

      setCredits({
        userId: data.user_id,
        plan: data.plan as PlanType,
        creditsRemaining: data.credits_remaining,
        aiMessagesRemaining: data.ai_messages_remaining,
        periodStart: new Date(data.period_start),
        periodEnd: new Date(data.period_end),
      })
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

    const plan = PLANS[credits.plan]
    if (plan.monthlyCredits === -1) return true // Unlimited — kein Abzug

    const newRemaining = credits.creditsRemaining - check.cost

    // Lokalen State sofort aktualisieren (optimistic update)
    setCredits((prev) => {
      if (!prev) return prev
      return { ...prev, creditsRemaining: newRemaining }
    })

    // In Supabase persistieren
    try {
      await supabase
        .from('vermieter_user_credits')
        .update({ credits_remaining: newRemaining })
        .eq('user_id', credits.userId)
    } catch (e) {
      console.error('Failed to update credits in Supabase:', e)
      // Rollback bei Fehler
      setCredits((prev) => {
        if (!prev) return prev
        return { ...prev, creditsRemaining: credits.creditsRemaining }
      })
      return false
    }

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

    const newRemaining = credits.aiMessagesRemaining - 1

    // Lokalen State sofort aktualisieren (optimistic update)
    setCredits((prev) => {
      if (!prev) return prev
      return { ...prev, aiMessagesRemaining: newRemaining }
    })

    // In Supabase persistieren
    try {
      await supabase
        .from('vermieter_user_credits')
        .update({ ai_messages_remaining: newRemaining })
        .eq('user_id', credits.userId)
    } catch (e) {
      console.error('Failed to update AI messages in Supabase:', e)
      // Rollback bei Fehler
      setCredits((prev) => {
        if (!prev) return prev
        return { ...prev, aiMessagesRemaining: credits.aiMessagesRemaining }
      })
      return false
    }

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
