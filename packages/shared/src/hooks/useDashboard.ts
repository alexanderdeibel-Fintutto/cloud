import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardStats, OccupancyStats } from '../types/database'

/**
 * Shared hook: Fetch cross-app dashboard stats.
 * Works from any Fintutto app connected to the same Supabase.
 */
export function useDashboardStats(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [buildings, units, tenants, tasks] = await Promise.all([
        supabase.from('buildings').select('id', { count: 'exact', head: true }),
        supabase.from('units').select('id, status, rent_amount'),
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      ])

      const unitData = units.data || []
      const occupied = unitData.filter((u: any) => u.status === 'rented').length
      const vacant = unitData.filter((u: any) => u.status === 'vacant').length
      const totalRent = unitData
        .filter((u: any) => u.status === 'rented')
        .reduce((sum: number, u: any) => sum + (u.rent_amount || 0), 0)

      return {
        total_buildings: buildings.count || 0,
        total_units: unitData.length,
        occupied_units: occupied,
        vacant_units: vacant,
        total_tenants: tenants.count || 0,
        total_monthly_rent: totalRent,
        overdue_payments: 0,
        open_tasks: tasks.count || 0,
      } satisfies DashboardStats
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  })
}

/**
 * Shared hook: Fetch occupancy statistics.
 */
export function useOccupancyStats(supabase: SupabaseClient) {
  return useQuery({
    queryKey: ['occupancy-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('status')

      if (error) throw error

      const units = data || []
      const total = units.length
      const occupied = units.filter((u: any) => u.status === 'rented').length
      const vacant = units.filter((u: any) => u.status === 'vacant').length
      const maintenance = units.filter((u: any) => u.status === 'renovating').length

      return {
        total,
        occupied,
        vacant,
        maintenance,
        occupancy_rate: total > 0 ? (occupied / total) * 100 : 0,
      } satisfies OccupancyStats
    },
    staleTime: 5 * 60 * 1000,
  })
}
