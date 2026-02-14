import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function usePayments() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      // Payments are linked through contracts → units → properties (owned by user)
      // We fetch all payments for tenants that belong to this landlord
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:tenants (first_name, last_name),
          contract:rental_contracts (
            base_rent,
            total_rent,
            unit:units (
              name,
              property:properties (name, street, house_number)
            )
          )
        `)
        .order('due_date', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payment: {
      contract_id: string
      tenant_id: string
      amount: number
      due_date: string
      paid_date?: string | null
      payment_type?: string
      status?: string
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}
