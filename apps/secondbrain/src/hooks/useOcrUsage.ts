/**
 * useOcrUsage — Tier-Prüfung und monatliches OCR-Kontingent
 *
 * Gibt zurück:
 *   - tierSupportsOcr: boolean — ob der aktuelle Tier OCR unterstützt
 *   - ocrLimit: number — Seiten/Monat (0 = gesperrt, -1 = unbegrenzt)
 *   - ocrUsed: number — bereits verbrauchte Seiten diesen Monat
 *   - ocrRemaining: number — verbleibende Seiten
 *   - isLoading: boolean
 */
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Tier-Limits (muss mit Edge Function TIER_OCR_LIMITS übereinstimmen)
const TIER_OCR_LIMITS: Record<string, number> = {
  free: 0,
  personal_pro: 0,
  secondbrain_pro: 100,
  internal_admin: -1,
  internal_tester: -1,
}

interface OcrUsageState {
  tierSupportsOcr: boolean
  ocrLimit: number
  ocrUsed: number
  ocrRemaining: number
  tierName: string
  isLoading: boolean
}

export function useOcrUsage(): OcrUsageState {
  const { user } = useAuth()
  const [state, setState] = useState<OcrUsageState>({
    tierSupportsOcr: false,
    ocrLimit: 0,
    ocrUsed: 0,
    ocrRemaining: 0,
    tierName: 'free',
    isLoading: true,
  })

  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    async function load() {
      try {
        // Tier des Nutzers laden
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier_id')
          .eq('id', user!.id)
          .single()

        const tierId = profile?.tier_id || 'free'
        const limit = TIER_OCR_LIMITS[tierId] ?? 0

        // Aktuellen Monatsverbrauch laden
        const currentMonth = new Date().toISOString().slice(0, 7)
        const { data: usage } = await supabase
          .from('sb_ocr_usage_summary')
          .select('total_pages_used')
          .eq('user_id', user!.id)
          .eq('month', currentMonth)
          .single()

        const used = usage?.total_pages_used ?? 0
        const remaining = limit === -1 ? 9999 : Math.max(0, limit - used)

        setState({
          tierSupportsOcr: limit !== 0,
          ocrLimit: limit,
          ocrUsed: used,
          ocrRemaining: remaining,
          tierName: tierId,
          isLoading: false,
        })
      } catch {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    load()
  }, [user])

  return state
}
