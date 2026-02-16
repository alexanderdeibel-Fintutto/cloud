import { useAuth, useAppConfig, useFeature } from '@fintutto/core'
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@fintutto/ui'
import {
  Building2,
  Users,
  Gauge,
  CreditCard,
  Calculator,
  CheckCircle,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'

interface QuickStatProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
  to: string
  color: string
  loading?: boolean
}

function QuickStat({ icon, label, value, subtitle, to, color, loading }: QuickStatProps) {
  return (
    <Link to={to}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className={`rounded-lg p-2.5 ${color}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const config = useAppConfig()
  const { data: stats, isLoading } = useDashboard()
  const hasProperties = useFeature('properties')
  const hasTenants = useFeature('tenants')
  const hasMeters = useFeature('meters')
  const hasPayments = useFeature('payments')
  const hasCalculators = useFeature('calculators')
  const hasCheckers = useFeature('checkers')
  const hasTasks = useFeature('tasks')

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  })()

  const occupancyRate = stats && stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

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
        {hasProperties && (
          <QuickStat
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            label="Immobilien"
            value={stats?.totalBuildings ?? 0}
            subtitle={`${stats?.totalUnits ?? 0} Einheiten`}
            to="/properties"
            color="bg-blue-50 dark:bg-blue-950"
            loading={isLoading}
          />
        )}
        {hasTenants && (
          <QuickStat
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            label="Mieter"
            value={stats?.totalTenants ?? 0}
            subtitle={`${occupancyRate}% Auslastung`}
            to="/tenants"
            color="bg-emerald-50 dark:bg-emerald-950"
            loading={isLoading}
          />
        )}
        {hasPayments && (
          <QuickStat
            icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
            label="Monatliche Miete"
            value={stats ? formatEuro(stats.totalMonthlyRent) : '0 €'}
            subtitle={`${stats?.occupiedUnits ?? 0} aktive Mietverträge`}
            to="/payments"
            color="bg-amber-50 dark:bg-amber-950"
            loading={isLoading}
          />
        )}
        {hasTasks && (
          <QuickStat
            icon={<ClipboardList className="h-5 w-5 text-red-600" />}
            label="Offene Aufgaben"
            value={stats?.openTasks ?? 0}
            to="/tasks"
            color="bg-red-50 dark:bg-red-950"
            loading={isLoading}
          />
        )}
      </div>

      {/* Detail-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Aktuelle Aufgaben */}
        {hasTasks && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" />
                Aktuelle Aufgaben
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ) : stats?.recentTasks && stats.recentTasks.length > 0 ? (
                <ul className="space-y-2">
                  {stats.recentTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{task.title}</span>
                      <Badge
                        variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'warning' : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Keine offenen Aufgaben.</p>
              )}
              <Link to="/tasks" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Alle Aufgaben <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Auslastung */}
        {hasProperties && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4" />
                Auslastung
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Vermietet</span>
                    <span className="font-medium text-emerald-600">{stats?.occupiedUnits ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Leerstand</span>
                    <span className="font-medium text-amber-600">{stats?.vacantUnits ?? 0}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{occupancyRate}% belegt</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schnellzugriff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4" />
              Schnellzugriff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hasCalculators && (
              <Link
                to="/calculators"
                className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
              >
                <Calculator className="h-4 w-4 text-primary" />
                <span>7 Rechner</span>
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </Link>
            )}
            {hasCheckers && (
              <Link
                to="/checkers"
                className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
              >
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>10 Checker</span>
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </Link>
            )}
            {hasMeters && (
              <Link
                to="/meters"
                className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-accent"
              >
                <Gauge className="h-4 w-4 text-primary" />
                <span>Zählerablsung</span>
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
