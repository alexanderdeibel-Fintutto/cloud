import { Link } from 'react-router-dom'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatCurrency, formatDate, daysUntil } from '../lib/utils'
import { useMockData } from '../hooks/use-mock-data'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../types/bescheid'

export default function DashboardPage() {
  const { bescheide, fristen, stats } = useMockData()

  const recentBescheide = bescheide.slice(0, 3)
  const urgentFristen = fristen
    .filter(f => !f.erledigt)
    .sort((a, b) => new Date(a.fristdatum).getTime() - new Date(b.fristdatum).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-8">
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
            <div className="rounded-lg bg-fintutto-blue-100 p-2">
              <FileText className="h-5 w-5 text-fintutto-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.bescheideGesamt}</p>
              <p className="text-xs text-muted-foreground">Bescheide</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Search className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.offenePruefungen}</p>
              <p className="text-xs text-muted-foreground">Offen</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.einsprueche}</p>
              <p className="text-xs text-muted-foreground">Einsprueche</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats.einsparpotenzial)}</p>
              <p className="text-xs text-muted-foreground">Einsparpotenzial</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.ablaufendeFristen}</p>
              <p className="text-xs text-muted-foreground">Offene Fristen</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fintutto-blue-100 p-2">
              <AlertTriangle className="h-5 w-5 text-fintutto-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.abweichungenGesamt}</p>
              <p className="text-xs text-muted-foreground">Abweichungen</p>
            </div>
          </div>
        </div>
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
                    <div className={`mt-0.5 rounded-full p-1.5 ${isOverdue ? 'bg-red-100' : isUrgent ? 'bg-amber-100' : 'bg-muted'}`}>
                      <Clock className={`h-3 w-3 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-muted-foreground'}`} />
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/upload">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-fintutto-blue-100 p-2">
                  <Upload className="h-5 w-5 text-fintutto-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bescheid hochladen</p>
                  <p className="text-xs text-muted-foreground">PDF oder Foto</p>
                </div>
              </div>
            </Link>
            <Link to="/analyse">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bescheid pruefen</p>
                  <p className="text-xs text-muted-foreground">KI-Analyse starten</p>
                </div>
              </div>
            </Link>
            <Link to="/einspruch">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-red-100 p-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Einspruch erstellen</p>
                  <p className="text-xs text-muted-foreground">Automatisch generiert</p>
                </div>
              </div>
            </Link>
            <Link to="/fristen">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Clock className="h-5 w-5 text-amber-600" />
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
