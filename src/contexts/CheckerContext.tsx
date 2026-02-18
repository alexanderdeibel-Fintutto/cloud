import { createContext, useContext, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase'

export type CheckerType =
  | 'mietpreisbremse'
  | 'mieterhoehung'
  | 'nebenkosten'
  | 'betriebskosten'
  | 'kuendigung'
  | 'kaution'
  | 'mietminderung'
  | 'eigenbedarf'
  | 'modernisierung'
  | 'schoenheitsreparaturen'

export interface CheckerResult {
  status: 'positive' | 'negative' | 'neutral'
  title: string
  summary: string
  details: string[]
  potentialSavings?: number
  recommendation: string
  formRedirectUrl?: string
  formType?: string
}

interface CheckerSession {
  id: string
  checkerType: CheckerType
  data: Record<string, unknown>
  currentStep: number
  totalSteps: number
}

interface CheckerContextType {
  currentSession: CheckerSession | null
  aiAdvice: Record<string, string>
  isLoadingAdvice: boolean
  startSession: (checkerType: CheckerType, totalSteps: number) => Promise<string>
  updateSessionData: (data: Record<string, unknown>) => void
  setCurrentStep: (step: number) => void
  completeSession: (result: CheckerResult) => Promise<string>
  getAIAdvice: (fieldKey: string, context: Record<string, unknown>) => Promise<string>
  clearSession: () => void
}

const CheckerContext = createContext<CheckerContextType | undefined>(undefined)

const CHECKER_FORM_MAPPINGS: Record<CheckerType, { formType: string; formUrl: string }> = {
  mietpreisbremse: {
    formType: 'mietpreisbremse-ruege',
    formUrl: '/formulare/mietpreisbremse-ruege',
  },
  mieterhoehung: {
    formType: 'mieterhoehung-widerspruch',
    formUrl: '/formulare/mieterhoehung-widerspruch',
  },
  nebenkosten: {
    formType: 'nebenkostenabrechnung-widerspruch',
    formUrl: '/formulare/nebenkostenabrechnung-widerspruch',
  },
  betriebskosten: {
    formType: 'betriebskosten-pruefung',
    formUrl: '/formulare/betriebskosten-pruefung',
  },
  kuendigung: {
    formType: 'kuendigung-widerspruch',
    formUrl: '/formulare/kuendigung-widerspruch',
  },
  kaution: {
    formType: 'kaution-rueckforderung',
    formUrl: '/formulare/kaution-rueckforderung',
  },
  mietminderung: {
    formType: 'mietminderung-anzeige',
    formUrl: '/formulare/mietminderung-anzeige',
  },
  eigenbedarf: {
    formType: 'eigenbedarf-widerspruch',
    formUrl: '/formulare/eigenbedarf-widerspruch',
  },
  modernisierung: {
    formType: 'modernisierung-widerspruch',
    formUrl: '/formulare/modernisierung-widerspruch',
  },
  schoenheitsreparaturen: {
    formType: 'schoenheitsreparaturen-widerspruch',
    formUrl: '/formulare/schoenheitsreparaturen-widerspruch',
  },
}

export function CheckerProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<CheckerSession | null>(null)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false)

  const startSession = async (checkerType: CheckerType, totalSteps: number): Promise<string> => {
    const { data, error } = await supabase
      .from('checker_sessions')
      .insert({
        checker_type: checkerType,
        session_data: {} as object,
        status: 'in_progress',
      })
      .select()
      .single()

    if (error) throw error

    const session: CheckerSession = {
      id: data.id,
      checkerType,
      data: {},
      currentStep: 1,
      totalSteps,
    }

    setCurrentSession(session)
    setAiAdvice({})
    return data.id
  }

  const updateSessionData = (data: Record<string, unknown>) => {
    if (!currentSession) return

    const updatedSession = {
      ...currentSession,
      data: { ...currentSession.data, ...data },
    }
    setCurrentSession(updatedSession)

    // Persist to Supabase
    supabase
      .from('checker_sessions')
      .update({ session_data: updatedSession.data as object })
      .eq('id', currentSession.id)
  }

  const setCurrentStep = (step: number) => {
    if (!currentSession) return
    setCurrentSession({ ...currentSession, currentStep: step })
  }

  const completeSession = async (result: CheckerResult): Promise<string> => {
    if (!currentSession) throw new Error('No active session')

    const formMapping = CHECKER_FORM_MAPPINGS[currentSession.checkerType]

    const { data, error } = await supabase
      .from('checker_results')
      .insert({
        session_id: currentSession.id,
        checker_type: currentSession.checkerType,
        input_data: currentSession.data as object,
        result_data: result as unknown as object,
        recommendation: result.recommendation,
        form_redirect_url: formMapping.formUrl,
      })
      .select()
      .single()

    if (error) throw error

    // Mark session as completed
    await supabase
      .from('checker_sessions')
      .update({
        status: 'completed',
        result: result as unknown as object,
        completed_at: new Date().toISOString(),
      })
      .eq('id', currentSession.id)

    return data.id
  }

  const getAIAdvice = async (
    fieldKey: string,
    context: Record<string, unknown>
  ): Promise<string> => {
    const cacheKey = `${currentSession?.checkerType}-${fieldKey}`

    if (aiAdvice[cacheKey]) {
      return aiAdvice[cacheKey]
    }

    setIsLoadingAdvice(true)

    try {
      // Check cache in Supabase first
      const contextHash = btoa(JSON.stringify(context)).slice(0, 32)
      const { data: cached } = await supabase
        .from('ai_advice_cache')
        .select('advice')
        .eq('field_key', fieldKey)
        .eq('checker_type', currentSession?.checkerType || '')
        .eq('context_hash', contextHash)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (cached) {
        setAiAdvice((prev) => ({ ...prev, [cacheKey]: cached.advice }))
        return cached.advice
      }

      // Call AI endpoint
      const response = await fetch(
        import.meta.env.VITE_CLAUDE_API_ENDPOINT || '/api/ai/advice',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkerType: currentSession?.checkerType,
            fieldKey,
            context,
            sessionData: currentSession?.data,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get AI advice')
      }

      const { advice } = await response.json()

      // Cache the advice
      await supabase.from('ai_advice_cache').insert({
        field_key: fieldKey,
        checker_type: currentSession?.checkerType || '',
        context_hash: contextHash,
        advice,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      setAiAdvice((prev) => ({ ...prev, [cacheKey]: advice }))
      return advice
    } catch (error) {
      console.error('Error getting AI advice:', error)
      return getDefaultAdvice(fieldKey)
    } finally {
      setIsLoadingAdvice(false)
    }
  }

  const getDefaultAdvice = (fieldKey: string): string => {
    const defaultAdvices: Record<string, string> = {
      mietbeginn:
        'Geben Sie das Datum ein, an dem Ihr Mietvertrag begonnen hat. Dies finden Sie auf der ersten Seite Ihres Mietvertrags.',
      kaltmiete:
        'Die Kaltmiete ist die reine Miete ohne Nebenkosten. Sie finden diesen Betrag in Ihrem Mietvertrag oder auf Ihrer letzten Mietabrechnung.',
      wohnflaeche:
        'Die Wohnfläche finden Sie in Ihrem Mietvertrag. Achten Sie darauf, dass die tatsächliche Fläche mit der im Vertrag angegebenen übereinstimmt.',
      plz: 'Die Postleitzahl Ihrer Wohnung ist wichtig, um den lokalen Mietspiegel zu ermitteln.',
      default:
        'Bitte füllen Sie dieses Feld sorgfältig aus. Bei Unsicherheiten können Sie in Ihrem Mietvertrag nachschauen.',
    }
    return defaultAdvices[fieldKey] || defaultAdvices.default
  }

  const clearSession = () => {
    setCurrentSession(null)
    setAiAdvice({})
  }

  return (
    <CheckerContext.Provider
      value={{
        currentSession,
        aiAdvice,
        isLoadingAdvice,
        startSession,
        updateSessionData,
        setCurrentStep,
        completeSession,
        getAIAdvice,
        clearSession,
      }}
    >
      {children}
    </CheckerContext.Provider>
  )
}

export function useChecker() {
  const context = useContext(CheckerContext)
  if (context === undefined) {
    throw new Error('useChecker must be used within a CheckerProvider')
  }
  return context
}
