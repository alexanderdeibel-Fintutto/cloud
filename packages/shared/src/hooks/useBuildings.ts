import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Building, BuildingWithUnits, BuildingFormData } from '../types/database'

/**
 * Shared hook: Fetch all buildings for the current organization.
 * Pass your app's Supabase client instance.
 */
export function useBuildings(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Building[]
    },
  })
}

/**
 * Shared hook: Fetch buildings with their units.
 */
export function useBuildingsWithUnits(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['buildings', 'with-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          units (*)
        `)
        .order('name')
      if (error) throw error
      return data as BuildingWithUnits[]
    },
  })
}

/**
 * Shared hook: Fetch a single building by ID.
 */
export function useBuilding(supabase: SupabaseClient, id: string | undefined) {
  return useQuery({
    queryKey: ['buildings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          units (*)
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as BuildingWithUnits
    },
    enabled: !!id,
  })
}
