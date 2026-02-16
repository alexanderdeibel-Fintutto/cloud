import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from './client'

/**
 * Generischer Hook für Supabase-Tabellen-Abfragen.
 * Nutzt TanStack Query für Caching und Revalidierung.
 */
export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, unknown>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    enabled?: boolean
  }
) {
  const { select = '*', filter, orderBy, limit, enabled = true } = options ?? {}

  return useQuery<T[]>({
    queryKey: [table, { select, filter, orderBy, limit }],
    queryFn: async () => {
      let query = getSupabase().from(table).select(select)

      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          query = query.eq(key, value)
        }
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as T[]
    },
    enabled,
  })
}

/**
 * Hook für eine einzelne Zeile per ID.
 */
export function useSupabaseRow<T>(
  table: string,
  id: string | undefined,
  options?: { select?: string }
) {
  const { select = '*' } = options ?? {}

  return useQuery<T | null>({
    queryKey: [table, id, { select }],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from(table)
        .select(select)
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as T
    },
    enabled: !!id,
  })
}

/**
 * Generischer Insert-Mutation-Hook.
 */
export function useSupabaseInsert<T>(table: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (row: Partial<T>) => {
      const { data, error } = await getSupabase()
        .from(table)
        .insert(row as Record<string, unknown>)
        .select()
        .single()

      if (error) throw error
      return data as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] })
    },
  })
}

/**
 * Generischer Update-Mutation-Hook.
 */
export function useSupabaseUpdate<T>(table: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<T> & { id: string }) => {
      const { data, error } = await getSupabase()
        .from(table)
        .update(updates as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as T
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] })
    },
  })
}

/**
 * Generischer Delete-Mutation-Hook.
 */
export function useSupabaseDelete(table: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] })
    },
  })
}
