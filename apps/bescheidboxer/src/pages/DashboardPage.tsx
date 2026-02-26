import { Link, useLocation } from 'react-router-dom'
import {
  FileText,
  Search,
  ShieldAlert,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
  Upload,
} from 'lucide-react'
import { CrossAppRecommendations, EcosystemStatsBar } from '@fintutto/shared'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatCurrency, formatDate, daysUntil } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import { DashboardSkeleton } from '../components/LoadingSkeleton'
import DeadlineBanner from '../components/DeadlineBanner'
import SteuerTipps from '../components/SteuerTipps'
import { useAnimatedCounter } from '../hooks/use-animated-counter'
import AktivitaetsProtokoll from '../components/AktivitaetsProtokoll'
import FortschrittsRing from '../components/FortschrittsRing'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../types/bescheid'

const STATUS_COLORS: Record<string, string> = {
  neu: '#6b7280',
  in_pruefung: '#f59e0b',
  geprueft: '#3b82f6',
  einspruch: '#ef4444',
  erledigt: '#22c55e',
}

export default function DashboardPage() {
  const { pathname } = useLocation()
  const { bescheide, fristen, stats, loading } = useBescheidContext()

  if (loading) return <DashboardSkeleton />

  const animBescheide = useAnimatedCounter(stats.bescheideGesamt)
  const animOffen = useAnimatedCounter(stats.offenePruefungen)
  const animEinsprueche = useAnimatedCounter(stats.einsprueche)
  const animFristen = useAnimatedCounter(stats.ablaufendeFristen)
  const animAbweichungen = useAnimatedCounter(stats.abweichungenGesamt)

  const recentBescheide = bescheide.slice(0, 3)
  const urgentFristen = fristen
    .filter(f => !f.erledigt)
    .sort((a, b) => new Date(a.fristdatum).getTime() - new Date(b.fristdatum).getTime())
    .slice(0, 4)

  // Chart data: Steuer pro Jahr
  const steuerProJahr = bescheide.reduce<Record<number, { year: number; festgesetzt: number; erwartet: number }>>((acc, b) => {
    if (!acc[b.steuerjahr]) {
      acc[b.steuerjahr] = { year: b.steuerjahr, festgesetzt: 0, erwartet: 0 }
    }
    acc[b.steuerjahr].festgesetzt += b.festgesetzteSteuer ?? 0
    acc[b.steuerjahr].erwartet += b.erwarteteSteuer ?? 0
    return acc
  }, {})
  const barChartData = Object.values(steuerProJahr).sort((a, b) => a.year - b.year)

  // Chart data: Status-Verteilung
  const statusCounts = bescheide.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})
  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: BESCHEID_STATUS_LABELS[status as keyof typeof BESCHEID_STATUS_LABELS] || status,
    value: count,
    color: STATUS_COLORS[status] || '#6b7280',
  }))

  return (
    <div className="space-y-8">
      <DeadlineBanner />
      <SteuerTipps />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Uebersicht ueber Ihre Steuerbescheide und offene Aufgaben
          </p>
        </div>
        <Link to="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Bescheid hochladen
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
              <FileText className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{animBescheide}</p>
              <p className="text-xs text-muted-foreground">Bescheide</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-2">
              <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{animOffen}</p>
              <p className="text-xs text-muted-foreground">Offen</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{animEinsprueche}</p>
              <p className="text-xs text-muted-foreground">Einsprueche</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
              <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.einsparpotenzial)}</p>
              <p className="text-xs text-muted-foreground">Einsparpotenzial</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{animFristen}</p>
              <p className="text-xs text-muted-foreground">Offene Fristen</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
              <AlertTriangle className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{animAbweichungen}</p>
              <p className="text-xs text-muted-foreground">Abweichungen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Steuervergleich pro Jahr</CardTitle>
            <CardDescription>Festgesetzte vs. erwartete Steuer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Steuerjahr ${label}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="erwartet" name="Erwartet" fill="hsl(210 80% 60% / 0.3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="festgesetzt" name="Festgesetzt" fill="hsl(210 80% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status-Verteilung</CardTitle>
            <CardDescription>Aktuelle Bescheide nach Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(0 0% 100%)"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} Bescheid(e)`, '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bescheide */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Aktuelle Bescheide</CardTitle>
              <CardDescription>Zuletzt eingegangene Steuerbescheide</CardDescription>
            </div>
            <Link to="/bescheide">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBescheide.map((bescheid) => (
                <Link
                  key={bescheid.id}
                  to={`/bescheide/${bescheid.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{bescheid.titel}</p>
                      <p className="text-sm text-muted-foreground">
                        {BESCHEID_TYP_LABELS[bescheid.typ]} &middot; {bescheid.finanzamt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {bescheid.abweichung !== null && bescheid.abweichung > 0 && (
                      <span className="text-sm font-medium text-destructive">
                        +{formatCurrency(bescheid.abweichung)}
                      </span>
                    )}
                    <StatusBadge status={bescheid.status} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fristen */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fristen</CardTitle>
              <CardDescription>Naechste ablaufende Fristen</CardDescription>
            </div>
            <Link to="/fristen">
              <Button variant="ghost" size="sm" className="gap-1">
                Alle <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentFristen.map((frist) => {
                const days = daysUntil(frist.fristdatum)
                const isUrgent = days <= 7
                const isOverdue = days < 0

                return (
                  <div
                    key={frist.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div className={`mt-0.5 rounded-full p-1.5 ${isOverdue ? 'bg-red-100 dark:bg-red-900/40' : isUrgent ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-muted'}`}>
                      <Clock className={`h-3 w-3 ${isOverdue ? 'text-red-600 dark:text-red-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{frist.bescheidTitel}</p>
                      <p className="text-xs text-muted-foreground capitalize">{frist.typ}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(frist.fristdatum)}
                        </span>
                        <Badge
                          variant={isOverdue ? 'destructive' : isUrgent ? 'warning' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {isOverdue ? `${Math.abs(days)} Tage ueberfaellig` : `${days} Tage`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitaeten</CardTitle>
            <CardDescription>Letzte Ereignisse und Aenderungen</CardDescription>
          </CardHeader>
          <CardContent>
            <AktivitaetsProtokoll maxItems={6} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ihr Fortschritt</CardTitle>
            <CardDescription>Wie weit sind Sie?</CardDescription>
          </CardHeader>
          <CardContent>
            <FortschrittsRing size={120} strokeWidth={8} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/upload">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
                  <Upload className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bescheid hochladen</p>
                  <p className="text-xs text-muted-foreground">PDF oder Foto</p>
                </div>
              </div>
            </Link>
            <Link to="/analyse">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2">
                  <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bescheid pruefen</p>
                  <p className="text-xs text-muted-foreground">KI-Analyse starten</p>
                </div>
              </div>
            </Link>
            <Link to="/einspruch">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Einspruch erstellen</p>
                  <p className="text-xs text-muted-foreground">Automatisch generiert</p>
                </div>
              </div>
            </Link>
            <Link to="/fristen">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Fristen verwalten</p>
                  <p className="text-xs text-muted-foreground">Termine im Blick</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CrossAppRecommendations currentPath={pathname} currentAppSlug="bescheidboxer" />

      <EcosystemStatsBar />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variant = {
    neu: 'secondary' as const,
    in_pruefung: 'warning' as const,
    geprueft: 'default' as const,
    einspruch: 'destructive' as const,
    erledigt: 'success' as const,
  }[status] ?? 'secondary' as const

  return (
    <Badge variant={variant}>
      {BESCHEID_STATUS_LABELS[status as keyof typeof BESCHEID_STATUS_LABELS] ?? status}
    </Badge>
  )
}
