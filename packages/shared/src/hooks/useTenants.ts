import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tenant, TenantWithLeases } from '../types/database'

/**
 * Shared hook: Fetch all tenants for the current organization.
 */
export function useTenants(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('last_name')
      if (error) throw error
      return data as Tenant[]
    },
  })
}

/**
 * Shared hook: Fetch tenants with their active leases.
 */
export function useTenantsWithLeases(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['tenants', 'with-leases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          leases (
            *,
            units (
              id, unit_number, area,
              buildings ( id, name, address )
            )
          )
        `)
        .order('last_name')
      if (error) throw error
      return data as TenantWithLeases[]
    },
  })
}

/**
 * Shared hook: Fetch a single tenant by ID.
 */
export function useTenant(supabase: SupabaseClient, id: string | undefined) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          leases (
            *,
            units (
              id, unit_number, area,
              buildings ( id, name, address )
            )
          )
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as TenantWithLeases
    },
    enabled: !!id,
  })
}
