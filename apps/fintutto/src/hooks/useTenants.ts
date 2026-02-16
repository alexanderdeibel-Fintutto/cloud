import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, useAuth } from '@fintutto/core'
import type { Tenant, TenantFormData, TenantInsert } from '@fintutto/shared'

const TENANTS_KEY = 'tenants'

export interface TenantWithLease extends Tenant {
  leases?: Array<{
    id: string
    is_active: boolean
    start_date: string
    rent_amount: number
    units?: {
      id: string
      unit_number: string
      buildings?: { id: string; name: string; address: string; city: string }
    }
  }>
  status?: 'active' | 'terminated' | 'former'
}

export function useTenantsList() {
  return useQuery({
    queryKey: [TENANTS_KEY, 'list'],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from('tenants')
        .select(`
          *,
          leases(
            id,
            is_active,
            start_date,
            rent_amount,
            units(
              id,
              unit_number,
              buildings(id, name, address, city)
            )
          )
        `)
        .order('last_name', { ascending: true })

      if (error) throw error

      return (data ?? []).map((tenant: Record<string, unknown>) => {
        const leases = (tenant.leases as Array<{ is_active: boolean }>) ?? []
        const hasActive = leases.some((l) => l.is_active)
        const status = hasActive ? 'active' : leases.length > 0 ? 'former' : 'terminated'
        return { ...tenant, status } as TenantWithLease
      })
    },
  })
}

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: [TENANTS_KEY, 'detail', id],
    queryFn: async () => {
      const { data: tenant, error } = await getSupabase()
        .from('tenants')
        .select('*')
        .eq('id', id!)
        .maybeSingle()

      if (error) throw error
      if (!tenant) return null

      // Aktiver Mietvertrag
      const { data: activeLease } = await getSupabase()
        .from('leases')
        .select(`
          *,
          units(
            id, unit_number, area, rooms, floor,
            buildings(id, name, address, city, postal_code)
          )
        `)
        .eq('tenant_id', id!)
        .eq('is_active', true)
        .maybeSingle()

      // Alle Mietverträge
      const { data: allLeases } = await getSupabase()
        .from('leases')
        .select('*, units(id, unit_number, buildings(id, name))')
        .eq('tenant_id', id!)
        .order('start_date', { ascending: false })

      return {
        ...tenant,
        activeLease,
        allLeases: allLeases ?? [],
      }
    },
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async (data: TenantFormData) => {
      const insertData: Partial<TenantInsert> = {
        organization_id: profile?.organizationId ?? '',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        birth_date: data.birth_date || null,
        household_size: data.household_size || null,
        previous_landlord: data.previous_landlord || null,
        notes: data.notes || null,
      }

      const { data: tenant, error } = await getSupabase()
        .from('tenants')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return tenant as Tenant
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANTS_KEY] })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TenantFormData> }) => {
      const { data: tenant, error } = await getSupabase()
        .from('tenants')
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return tenant as Tenant
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TENANTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [TENANTS_KEY, 'detail', variables.id] })
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase()
        .from('tenants')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANTS_KEY] })
    },
  })
}
