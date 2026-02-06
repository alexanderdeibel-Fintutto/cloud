import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  UserCredits,
  PLANS,
  canAskQuestion,
  canGenerateLetter,
  canPostInForum,
} from '@/lib/credits'

interface CreditsContextType {
  credits: UserCredits | null
  isLoading: boolean
  checkQuestion: () => { allowed: boolean; reason?: string }
  checkLetter: () => { allowed: boolean; reason?: string; cost: number }
  checkForum: () => { allowed: boolean; reason?: string }
  useQuestion: () => Promise<boolean>
  useLetter: () => Promise<boolean>
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

function getMockUserCredits(): UserCredits {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    userId: 'demo-user',
    plan: 'free',
    chatQuestionsUsedToday: 0,
    lettersGeneratedThisMonth: 0,
    freeLettersRemaining: 0,
    periodStart,
    periodEnd,
  }
}

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCredits()
  }, [])

  async function loadCredits() {
    setIsLoading(true)
    try {
      // TODO: Replace with Supabase query for amt_users
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

  function checkQuestion() {
    if (!credits) {
      return { allowed: true } // Allow first question for anonymous
    }
    return canAskQuestion(credits)
  }

  function checkLetter() {
    if (!credits) {
      return { allowed: true, cost: 2.99 }
    }
    return canGenerateLetter(credits)
  }

  function checkForum() {
    if (!credits) {
      return { allowed: false, reason: 'Bitte melde dich an, um im Forum zu schreiben.' }
    }
    return canPostInForum(credits)
  }

  async function useQuestion(): Promise<boolean> {
    if (!credits) return true

    const check = canAskQuestion(credits)
    if (!check.allowed) return false

    setCredits(prev => {
      if (!prev) return prev
      return {
        ...prev,
        chatQuestionsUsedToday: prev.chatQuestionsUsedToday + 1,
      }
    })

    // TODO: Update in Supabase

    return true
  }

  async function useLetter(): Promise<boolean> {
    if (!credits) return false

    const check = canGenerateLetter(credits)
    if (!check.allowed) return false

    setCredits(prev => {
      if (!prev) return prev
      const plan = PLANS[prev.plan]
      const update: Partial<UserCredits> = {
        lettersGeneratedThisMonth: prev.lettersGeneratedThisMonth + 1,
      }
      if (plan.lettersPerMonth === -1 && prev.freeLettersRemaining > 0) {
        update.freeLettersRemaining = prev.freeLettersRemaining - 1
      }
      return { ...prev, ...update }
    })

    // TODO: Update in Supabase

    return true
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        isLoading,
        checkQuestion,
        checkLetter,
        checkForum,
        useQuestion,
        useLetter,
        refreshCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export function useCreditsContext() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useCreditsContext must be used within a CreditsProvider')
  }
  return context
}
