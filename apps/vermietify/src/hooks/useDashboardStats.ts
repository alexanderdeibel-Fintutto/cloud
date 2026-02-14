import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export interface DashboardStats {
  propertyCount: number
  tenantCount: number
  monthlyRevenue: number  // in Cent
  overduePayments: number
}

export function useDashboardStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch properties count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)

      // Fetch active tenants count
      const { count: tenantCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user!.id)
        .eq('is_active', true)

      // Fetch total monthly revenue from active contracts
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select(`
          total_rent,
          unit:units!inner (
            property:properties!inner (user_id)
          )
        `)
        .is('end_date', null)

      const monthlyRevenue = (contracts || [])
        .filter((c: any) => c.unit?.property?.user_id === user!.id)
        .reduce((sum: number, c: any) => sum + (c.total_rent || 0), 0)

      // Fetch overdue payments count
      const { count: overduePayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue')

      return {
        propertyCount: propertyCount || 0,
        tenantCount: tenantCount || 0,
        monthlyRevenue,
        overduePayments: overduePayments || 0,
      }
    },
    enabled: !!user,
  })
}
