import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function useTenants() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tenants', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          unit:units (
            *,
            property:properties (id, name, street, house_number, city)
          ),
          rental_contracts (*)
        `)
        .eq('landlord_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (tenant: {
      unit_id?: string | null
      first_name: string
      last_name: string
      email?: string | null
      phone?: string | null
      move_in_date: string
      move_out_date?: string | null
      deposit_amount?: number | null
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert({ ...tenant, landlord_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}
