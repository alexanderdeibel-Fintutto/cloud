import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Users,
  CreditCard,
  AlertCircle,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useDomainStats, useDomains } from '@/hooks/useDomains'
import { useBrokenLinks } from '@/hooks/usePageLinks'
import { useCheckAllDomains } from '@/hooks/useDomainActions'
import { toast } from 'sonner'

const propertyStats = [
  {
    name: 'Immobilien',
    value: '0',
    icon: Building2,
    description: 'Objekte verwaltet',
  },
  {
    name: 'Mieter',
    value: '0',
    icon: Users,
    description: 'Aktive Mietverhältnisse',
  },
  {
    name: 'Monatseinnahmen',
    value: formatCurrency(0),
    icon: CreditCard,
    description: 'Erwartete Miete',
  },
  {
    name: 'Offene Posten',
    value: '0',
    icon: AlertCircle,
    description: 'Ausstehende Zahlungen',
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDomainStats()
  const { data: domains } = useDomains()
  const { data: brokenLinks } = useBrokenLinks()
  const checkAll = useCheckAllDomains()

  const criticalDomains = (domains || []).filter((d) => d.health === 'critical')
  const warningDomains = (domains || []).filter((d) => d.health === 'warning')
  const overallProgress = stats?.totalPages
    ? Math.round((stats.pagesFertig / stats.totalPages) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen bei Vermietify - Ihre Immobilienverwaltung
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {propertyStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Domain Health Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Domain-Übersicht
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={checkAll.isPending}
              onClick={() => {
                checkAll.mutate(undefined, {
                  onSuccess: (data) => toast.success(`${data?.checked ?? 0} Domains geprüft`),
                  onError: (e) => toast.error('Fehler', { description: e.message }),
                })
              }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkAll.isPending ? 'animate-spin' : ''}`} />
              {checkAll.isPending ? 'Prüfe...' : 'Alle prüfen'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/domains')}>
              Alle Domains <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
                <p className="text-xs text-muted-foreground">{stats?.setupComplete ?? 0} fertig eingerichtet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats?.healthy ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.warning ?? 0} Warnungen, {stats?.critical ?? 0} kritisch
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seiten-Fortschritt</CardTitle>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <Progress value={overallProgress} className="mt-1 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.pagesFertig ?? 0} / {stats?.totalPages ?? 0} Seiten fertig
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kaputte Links</CardTitle>
                <Link2 className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(brokenLinks?.length ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {brokenLinks?.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(brokenLinks?.length ?? 0) > 0 ? (
                    <button onClick={() => navigate('/link-checker')} className="text-primary hover:underline">
                      Link Checker öffnen
                    </button>
                  ) : (
                    'Alles ok'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Handlungsbedarf
            </CardTitle>
            <CardDescription>Domains die Aufmerksamkeit brauchen</CardDescription>
          </CardHeader>
          <CardContent>
            {criticalDomains.length === 0 && warningDomains.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Alle Domains sind online. Keine Probleme erkannt.
              </div>
            ) : (
              <div className="space-y-2">
                {criticalDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/domains/${d.id}`)}
                    className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{d.label}</span>
                      <span className="text-xs text-red-600 ml-2">Kritisch</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
                {warningDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/domains/${d.id}`)}
                    className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{d.label}</span>
                      <span className="text-xs text-amber-600 ml-2">Warnung</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Schnellzugriff
            </CardTitle>
            <CardDescription>Häufig verwendete Funktionen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/domains')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Domain-Verwaltung
              <span className="ml-auto text-xs text-muted-foreground">{stats?.total ?? 0} Domains</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/link-checker')}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Link Checker
              {(brokenLinks?.length ?? 0) > 0 && (
                <span className="ml-auto text-xs text-red-600">{brokenLinks?.length} Probleme</span>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/url-management')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              URL Management
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/calculators')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Rechner
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
