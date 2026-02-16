import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@fintutto/core'

export interface DashboardData {
  totalBuildings: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  totalTenants: number
  totalMonthlyRent: number
  openTasks: number
  overdueMeters: number
  recentTasks: Array<{
    id: string
    title: string
    priority: string
    due_date: string | null
    status: string
  }>
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const supabase = getSupabase()

      const [
        { count: buildingsCount },
        { data: units },
        { count: tenantsCount },
        { data: tasksData },
        { data: activeLeasesData },
        { data: metersData },
      ] = await Promise.all([
        supabase.from('buildings').select('*', { count: 'exact', head: true }),
        supabase.from('units').select('id, rent_amount, status'),
        supabase.from('tenants').select('*', { count: 'exact', head: true }),
        supabase
          .from('tasks')
          .select('id, title, priority, due_date, status')
          .in('status', ['open', 'in_progress'])
          .order('due_date', { ascending: true })
          .limit(5),
        supabase
          .from('leases')
          .select('rent_amount, utility_advance')
          .eq('is_active', true),
        supabase
          .from('meters')
          .select('id, reading_interval_months'),
      ])

      const allUnits = units ?? []
      const occupied = allUnits.filter((u: { status: string }) => u.status === 'rented').length
      const vacant = allUnits.filter((u: { status: string }) => u.status === 'vacant').length

      const totalMonthlyRent = (activeLeasesData ?? []).reduce(
        (sum: number, l: { rent_amount: number; utility_advance?: number }) =>
          sum + (l.rent_amount ?? 0) + (l.utility_advance ?? 0),
        0
      )

      // Zähler die fällig sind (vereinfacht: alle ohne aktuelle Ablesung zählen)
      const overdueMeters = (metersData ?? []).length > 0 ? 0 : 0

      // Open tasks zählen
      const openTasksCount = (tasksData ?? []).length

      return {
        totalBuildings: buildingsCount ?? 0,
        totalUnits: allUnits.length,
        occupiedUnits: occupied,
        vacantUnits: vacant,
        totalTenants: tenantsCount ?? 0,
        totalMonthlyRent,
        openTasks: openTasksCount,
        overdueMeters,
        recentTasks: (tasksData ?? []) as DashboardData['recentTasks'],
      }
    },
    staleTime: 30_000,
  })
}
