import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface ActivityEntry {
  id: string
  user_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export function useActivityLog(limitOrEntityId?: number | string) {
  const { user } = useAuth()
  const isEntityId = typeof limitOrEntityId === 'string'
  const limit = typeof limitOrEntityId === 'number' ? limitOrEntityId : 50

  return useQuery({
    queryKey: ['activity-log', user?.id, limitOrEntityId],
    queryFn: async (): Promise<ActivityEntry[]> => {
      if (!user) return []

      let query = supabase
        .from('sb_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (isEntityId) {
        query = query.eq('entity_id', limitOrEntityId)
      }

      query = query.limit(limit)

      const { data, error } = await query
      if (error) throw error
      return (data || []) as ActivityEntry[]
    },
    enabled: !!user,
  })
}

export function useLogActivity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: {
      action: string
      entity_type?: string
      entity_id?: string
      metadata?: Record<string, unknown>
    }) => {
      if (!user) return

      const { error } = await supabase.from('sb_activity_log').insert({
        user_id: user.id,
        action: entry.action,
        entity_type: entry.entity_type || null,
        entity_id: entry.entity_id || null,
        metadata: entry.metadata || {},
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] })
    },
  })
}

export function useClearActivityLog() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('sb_activity_log')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] })
    },
  })
}
