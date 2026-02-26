// React hook for checking feature entitlements across all Fintutto apps
// Usage: const { hasFeature, features, loading } = useEntitlements()

import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Entitlement, FintuttoApp } from '../entitlements'

interface UseEntitlementsOptions {
  supabase: SupabaseClient
  userId: string | undefined
  app?: FintuttoApp
}

interface UseEntitlementsResult {
  entitlements: Entitlement[]
  loading: boolean
  hasFeature: (featureKey: string) => boolean
  refetch: () => Promise<void>
}

export function useEntitlements({
  supabase,
  userId,
  app,
}: UseEntitlementsOptions): UseEntitlementsResult {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntitlements = useCallback(async () => {
    if (!userId) {
      setEntitlements([])
      setLoading(false)
      return
    }

    setLoading(true)

    let query = supabase
      .from('entitlements')
      .select('feature_key, expires_at, source')
      .eq('user_id', userId)

    if (app) {
      const prefix = app === 'finance_coach' ? 'finance_' : `${app}_`
      query = query.like('feature_key', `${prefix}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch entitlements:', error)
      setEntitlements([])
    } else {
      const now = new Date()
      const valid = (data || []).filter(
        (e) => !e.expires_at || new Date(e.expires_at) > now
      )
      setEntitlements(valid)
    }

    setLoading(false)
  }, [supabase, userId, app])

  useEffect(() => {
    fetchEntitlements()
  }, [fetchEntitlements])

  const hasFeature = useCallback(
    (featureKey: string): boolean => {
      return entitlements.some((e) => e.feature_key === featureKey)
    },
    [entitlements]
  )

  return {
    entitlements,
    loading,
    hasFeature,
    refetch: fetchEntitlements,
  }
}
