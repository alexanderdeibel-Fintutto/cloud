import { useQuery } from '@tanstack/react-query'
import { useAuth, useAppConfig, getSupabase } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@fintutto/ui'
import {
  Gauge,
  Zap,
  Droplets,
  Flame,
  Thermometer,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface MeterDashboardData {
  totalMeters: number
  dueMeters: number
  overdueMeters: number
  okMeters: number
  byType: {
    electricity: number
    gas: number
    water: number
    heating: number
  }
  recentReadings: Array<{
    id: string
    meter_number: string
    meter_type: string
    reading_value: number
    reading_date: string
  }>
}

function useMeterDashboard() {
  return useQuery({
    queryKey: ['zaehler-dashboard'],
    queryFn: async (): Promise<MeterDashboardData> => {
      const supabase = getSupabase()

      const [
        { data: meters },
        { data: recentReadingsData },
      ] = await Promise.all([
        supabase
          .from('meters')
          .select('id, meter_number, meter_type, reading_interval_months'),
        supabase
          .from('meter_readings')
          .select(`
            id, reading_value, reading_date, meter_id,
            meter:meters(meter_number, meter_type)
          `)
          .order('reading_date', { ascending: false })
          .limit(5),
      ])

      const allMeters = meters ?? []

      // Zähler nach Typ zählen
      const byType = {
        electricity: allMeters.filter((m: { meter_type: string }) => m.meter_type === 'electricity').length,
        gas: allMeters.filter((m: { meter_type: string }) => m.meter_type === 'gas').length,
        water: allMeters.filter((m: { meter_type: string }) => m.meter_type === 'water').length,
        heating: allMeters.filter((m: { meter_type: string }) => m.meter_type === 'heating').length,
      }

      // Letzte Ablesungen für Status-Berechnung laden
      const meterIds = allMeters.map((m: { id: string }) => m.id)
      let dueCount = 0
      let overdueCount = 0
      let okCount = 0

      if (meterIds.length > 0) {
        const { data: allReadings } = await supabase
          .from('meter_readings')
          .select('meter_id, reading_date')
          .in('meter_id', meterIds)
          .order('reading_date', { ascending: false })

        const now = new Date()
        const latestByMeter = new Map<string, string>()
        for (const r of (allReadings ?? []) as Array<{ meter_id: string; reading_date: string }>) {
          if (!latestByMeter.has(r.meter_id)) {
            latestByMeter.set(r.meter_id, r.reading_date)
          }
        }

        for (const meter of allMeters as Array<{ id: string; reading_interval_months?: number }>) {
          const lastDate = latestByMeter.get(meter.id)
          const intervalMonths = meter.reading_interval_months ?? 12

          if (!lastDate) {
            overdueCount++
          } else {
            const monthsSince = (now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
            if (monthsSince >= intervalMonths) overdueCount++
            else if (monthsSince >= intervalMonths - 1) dueCount++
            else okCount++
          }
        }
      }

      // Letzte Ablesungen mit Zähler-Info
      const recentReadings = (recentReadingsData ?? []).map((r: Record<string, unknown>) => {
        const meter = r.meter as { meter_number: string; meter_type: string } | null
        return {
          id: r.id as string,
          meter_number: meter?.meter_number ?? 'Unbekannt',
          meter_type: meter?.meter_type ?? 'electricity',
          reading_value: r.reading_value as number,
          reading_date: r.reading_date as string,
        }
      })

      return {
        totalMeters: allMeters.length,
        dueMeters: dueCount,
        overdueMeters: overdueCount,
        okMeters: okCount,
        byType,
        recentReadings,
      }
    },
    staleTime: 30_000,
  })
}

const meterTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  electricity: { label: 'Strom', icon: <Zap className="h-4 w-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  gas: { label: 'Gas', icon: <Flame className="h-4 w-4" />, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  water: { label: 'Wasser', icon: <Droplets className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  heating: { label: 'Heizung', icon: <Thermometer className="h-4 w-4" />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const config = useAppConfig()
  const { data: stats, isLoading } = useMeterDashboard()

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/meters">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-violet-50 p-2.5 dark:bg-violet-950">
                <Gauge className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Zähler gesamt</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalMeters ?? 0}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/meters">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Fällige Zähler</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.dueMeters ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Ablesung bald fällig</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/meters">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md border-destructive/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-950">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Überfällige Zähler</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-destructive">{stats?.overdueMeters ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Sofort ablesen</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Status-Übersicht & Typ-Verteilung */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status-Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4" />
              Status-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">In Ordnung</span>
                  </div>
                  <Badge variant="success">{stats?.okMeters ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Fällig</span>
                  </div>
                  <Badge variant="warning">{stats?.dueMeters ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Überfällig</span>
                  </div>
                  <Badge variant="destructive">{stats?.overdueMeters ?? 0}</Badge>
                </div>

                {/* Fortschrittsbalken */}
                {stats && stats.totalMeters > 0 && (
                  <div className="mt-4">
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{ width: `${(stats.okMeters / stats.totalMeters) * 100}%` }}
                      />
                      <div
                        className="bg-amber-500 transition-all"
                        style={{ width: `${(stats.dueMeters / stats.totalMeters) * 100}%` }}
                      />
                      <div
                        className="bg-red-500 transition-all"
                        style={{ width: `${(stats.overdueMeters / stats.totalMeters) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {stats.totalMeters} Zähler insgesamt
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verteilung nach Typ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Verteilung nach Typ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(meterTypeConfig).map(([type, conf]) => {
                  const count = stats?.byType[type as keyof typeof stats.byType] ?? 0
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded p-1 ${conf.bg}`}>
                          <span className={conf.color}>{conf.icon}</span>
                        </div>
                        <span className="text-sm">{conf.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Letzte Ablesungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Letzte Ablesungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : stats?.recentReadings && stats.recentReadings.length > 0 ? (
            <div className="space-y-2">
              {stats.recentReadings.map((reading) => {
                const typeConf = meterTypeConfig[reading.meter_type] ?? meterTypeConfig.electricity
                return (
                  <div key={reading.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded p-1.5 ${typeConf.bg}`}>
                        <span className={typeConf.color}>{typeConf.icon}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{reading.meter_number}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reading.reading_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{reading.reading_value.toLocaleString('de-DE')}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Ablesungen vorhanden.</p>
          )}
          <Link to="/history" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Alle Ablesungen anzeigen <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* Schnellzugriff */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Schnellzugriff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            to="/capture"
            className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
          >
            <Gauge className="h-4 w-4 text-primary" />
            <span>Neue Ablesung erfassen</span>
            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
          <Link
            to="/meters"
            className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
          >
            <Gauge className="h-4 w-4 text-primary" />
            <span>Alle Zähler anzeigen</span>
            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
          >
            <Clock className="h-4 w-4 text-primary" />
            <span>Ablesungsverlauf</span>
            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
