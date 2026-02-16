import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'
import type { Lease, LeaseFormData, LeaseInsert } from '@fintutto/shared'

const LEASES_KEY = 'leases'

export interface LeaseWithDetails extends Lease {
  tenants?: { id: string; first_name: string; last_name: string; email: string | null }
  units?: {
    id: string
    unit_number: string
    building_id: string
    buildings?: { id: string; name: string; address: string }
  }
}

export function useLeasesList(filters?: {
  isActive?: boolean
  tenantId?: string
  unitId?: string
}) {
  return useQuery({
    queryKey: [LEASES_KEY, 'list', filters],
    queryFn: async () => {
      let query = getSupabase()
        .from('leases')
        .select(`
          *,
          tenants!inner(id, first_name, last_name, email),
          units!inner(
            id, unit_number, building_id,
            buildings(id, name, address)
          )
        `)
        .order('created_at', { ascending: false })

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      if (filters?.tenantId) {
        query = query.eq('tenant_id', filters.tenantId)
      }
      if (filters?.unitId) {
        query = query.eq('unit_id', filters.unitId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as LeaseWithDetails[]
    },
  })
}

export function useCreateLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeaseFormData) => {
      const insertData: Partial<LeaseInsert> = {
        unit_id: data.unit_id,
        tenant_id: data.tenant_id,
        start_date: data.start_date,
        end_date: data.end_date || null,
        rent_amount: data.rent_amount,
        utility_advance: data.utility_advance || 0,
        deposit_amount: data.deposit_amount || 0,
        deposit_paid: data.deposit_paid || false,
        payment_day: data.payment_day || 1,
        is_active: true,
      }

      const { data: lease, error } = await getSupabase()
        .from('leases')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      // Einheit auf "rented" setzen
      await getSupabase()
        .from('units')
        .update({ status: 'rented' })
        .eq('id', data.unit_id)

      return lease as Lease
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEASES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}

export function useTerminateLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, terminationDate }: { id: string; terminationDate: string }) => {
      const { data: lease } = await getSupabase()
        .from('leases')
        .select('unit_id')
        .eq('id', id)
        .single()

      const { data: updated, error } = await getSupabase()
        .from('leases')
        .update({ is_active: false, end_date: terminationDate })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Einheit auf "vacant" setzen
      if (lease?.unit_id) {
        await getSupabase()
          .from('units')
          .update({ status: 'vacant' })
          .eq('id', lease.unit_id)
      }

      return updated as Lease
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEASES_KEY] })
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}
