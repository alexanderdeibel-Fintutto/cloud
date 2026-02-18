import { useQuery } from '@tanstack/react-query'
import { useAuth, useAppConfig, getSupabase } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@fintutto/ui'
import {
  ClipboardList,
  Gauge,
  Building2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface CaretakerDashboardData {
  openTasks: number
  inProgressTasks: number
  dueMeters: number
  assignedBuildings: number
  recentTasks: Array<{
    id: string
    title: string
    priority: string
    status: string
    due_date: string | null
    buildings?: { id: string; name: string } | null
  }>
}

function useCaretakerDashboard() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['caretaker-dashboard', user?.id],
    queryFn: async (): Promise<CaretakerDashboardData> => {
      const supabase = getSupabase()
      const userId = user?.id

      // Alle Queries parallel ausfuehren
      const [
        { data: openTasksData },
        { data: inProgressTasksData },
        { data: recentTasksData },
        { data: metersData },
        { data: buildingsData },
      ] = await Promise.all([
        // Offene Auftraege fuer diesen Hausmeister
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_to', userId!)
          .eq('status', 'open'),
        // In Bearbeitung
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_to', userId!)
          .eq('status', 'in_progress'),
        // Letzte zugewiesene Aufgaben
        supabase
          .from('tasks')
          .select('id, title, priority, status, due_date, buildings(id, name)')
          .eq('assigned_to', userId!)
          .in('status', ['open', 'in_progress'])
          .order('due_date', { ascending: true, nullsFirst: false })
          .limit(5),
        // Zaehler in zugewiesenen Gebaeuden
        supabase
          .from('meters')
          .select(`
            id, reading_interval_months,
            unit:units(building_id)
          `),
        // Zugewiesene Gebaeude (via tasks)
        supabase
          .from('tasks')
          .select('building_id')
          .eq('assigned_to', userId!)
          .not('building_id', 'is', null),
      ])

      // Eindeutige Gebaeude zaehlen
      const uniqueBuildingIds = new Set(
        (buildingsData ?? [])
          .map((t: { building_id: string | null }) => t.building_id)
          .filter(Boolean)
      )

      // Faellige Zaehler berechnen (vereinfacht)
      const now = new Date()
      let dueMetersCount = 0
      if (metersData && metersData.length > 0) {
        const meterIds = metersData.map((m: { id: string }) => m.id)
        const { data: readings } = await supabase
          .from('meter_readings')
          .select('meter_id, reading_date')
          .in('meter_id', meterIds)
          .order('reading_date', { ascending: false })

        const latestByMeter = new Map<string, string>()
        for (const r of readings ?? []) {
          if (!latestByMeter.has(r.meter_id)) {
            latestByMeter.set(r.meter_id, r.reading_date)
          }
        }

        for (const meter of metersData) {
          const lastDate = latestByMeter.get(meter.id)
          const interval = (meter.reading_interval_months as number) ?? 12
          if (!lastDate) {
            dueMetersCount++
          } else {
            const monthsSince = (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
            if (monthsSince >= interval - 1) dueMetersCount++
          }
        }
      }

      return {
        openTasks: (openTasksData as unknown[])?.length ?? 0,
        inProgressTasks: (inProgressTasksData as unknown[])?.length ?? 0,
        dueMeters: dueMetersCount,
        assignedBuildings: uniqueBuildingIds.size,
        recentTasks: (recentTasksData ?? []) as CaretakerDashboardData['recentTasks'],
      }
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  })
}

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  low: { label: 'Niedrig', variant: 'secondary' },
  normal: { label: 'Normal', variant: 'default' },
  high: { label: 'Hoch', variant: 'warning' },
  urgent: { label: 'Dringend', variant: 'destructive' },
}

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  in_progress: <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const config = useAppConfig()
  const { data: stats, isLoading } = useCaretakerDashboard()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  })()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Willkommen bei {config.displayName}
        </p>
      </div>

      {/* KPI-Karten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/tasks">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-orange-50 dark:bg-orange-950">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Offene Auftraege</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.openTasks ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/tasks">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-amber-50 dark:bg-amber-950">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">In Bearbeitung</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.inProgressTasks ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/meters">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-red-50 dark:bg-red-950">
                <Gauge className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Faellige Zaehler</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.dueMeters ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/buildings">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg p-2.5 bg-blue-50 dark:bg-blue-950">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Gebaeude</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.assignedBuildings ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Zugewiesene Aufgaben */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Meine Auftraege
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          ) : stats?.recentTasks && stats.recentTasks.length > 0 ? (
            <ul className="space-y-3">
              {stats.recentTasks.map((task) => {
                const pConf = priorityConfig[task.priority ?? 'normal']
                return (
                  <li key={task.id} className="flex items-center gap-3 text-sm">
                    {statusIcons[task.status] ?? statusIcons.open}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{task.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.buildings && (
                          <span className="text-xs text-muted-foreground">{task.buildings.name}</span>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={pConf.variant as 'default'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {pConf.label}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Keine offenen Auftraege.</p>
          )}
          <Link to="/tasks" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Alle Auftraege <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* Schnellzugriff */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/rounds">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-orange-50 dark:bg-orange-950">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Rundgang starten</p>
                <p className="text-xs text-muted-foreground">Gebaeude-Kontrolle</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/meters">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-orange-50 dark:bg-orange-950">
                <Gauge className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Zaehler ablesen</p>
                <p className="text-xs text-muted-foreground">Ablesung erfassen</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/tasks">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg p-2.5 bg-orange-50 dark:bg-orange-950">
                <ClipboardList className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Auftraege ansehen</p>
                <p className="text-xs text-muted-foreground">Alle meine Auftraege</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
