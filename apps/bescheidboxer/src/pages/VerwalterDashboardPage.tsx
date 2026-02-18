import {} from 'react'
import {
  LayoutGrid,
  Building2,
  Users,
  Euro,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Wrench,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { formatCurrency } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'

// Demo data for property manager overview
const DEMO_OVERVIEW = {
  properties: 5,
  units: 24,
  tenants: 21,
  vacancyRate: 12.5,
  monthlyIncome: 18500,
  outstandingPayments: 2850,
  maintenanceOpen: 3,
  maintenanceResolved: 12,
  upcomingLeaseEnds: 2,
}

const DEMO_PROPERTIES_SUMMARY = [
  { id: '1', name: 'Musterhaus Berlin', units: 6, tenants: 5, rent: 5700, occupancy: 83, issues: 1 },
  { id: '2', name: 'Wohnpark Muenchen', units: 8, tenants: 8, rent: 7200, occupancy: 100, issues: 0 },
  { id: '3', name: 'Gewerbe Hamburg', units: 2, tenants: 2, rent: 3200, occupancy: 100, issues: 1 },
  { id: '4', name: 'Altbau Koeln', units: 4, tenants: 3, rent: 1800, occupancy: 75, issues: 0 },
  { id: '5', name: 'Neubau Frankfurt', units: 4, tenants: 3, rent: 600, occupancy: 75, issues: 1 },
]

const DEMO_RECENT_PAYMENTS = [
  { tenant: 'M. Mustermann', property: 'Musterhaus Berlin', amount: 950, status: 'paid' },
  { tenant: 'A. Schmidt', property: 'Wohnpark Muenchen', amount: 1100, status: 'paid' },
  { tenant: 'K. Mueller', property: 'Altbau Koeln', amount: 680, status: 'overdue' },
  { tenant: 'S. Weber', property: 'Neubau Frankfurt', amount: 750, status: 'pending' },
]

export default function VerwalterDashboardPage() {
  const { bescheide } = useBescheidContext()
  const o = DEMO_OVERVIEW

  const bescheideOffen = bescheide.filter(b => b.status === 'neu' || b.status === 'in_pruefung').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutGrid className="h-8 w-8" />
          Verwalter-Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Ihre Immobilien-Verwaltung auf einen Blick
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <Building2 className="h-5 w-5 text-fintutto-blue-500 mb-1" />
            <p className="text-2xl font-bold">{o.properties}</p>
            <p className="text-xs text-muted-foreground">Immobilien</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <Users className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-2xl font-bold">{o.tenants}/{o.units}</p>
            <p className="text-xs text-muted-foreground">Mieter/Einheiten</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <TrendingUp className="h-5 w-5 text-emerald-500 mb-1" />
            <p className="text-lg font-bold">{formatCurrency(o.monthlyIncome)}</p>
            <p className="text-xs text-muted-foreground">Mieteinnahmen/Mt.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(o.outstandingPayments)}</p>
            <p className="text-xs text-muted-foreground">Ausstehend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <Wrench className="h-5 w-5 text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{o.maintenanceOpen}</p>
            <p className="text-xs text-muted-foreground">Offene Meldungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <FileText className="h-5 w-5 text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{bescheideOffen}</p>
            <p className="text-xs text-muted-foreground">Bescheide offen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immobilien-Uebersicht */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Immobilien
              </CardTitle>
              <Link to="/immobilien">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Alle anzeigen <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_PROPERTIES_SUMMARY.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.issues > 0 && (
                      <Badge variant="destructive" className="text-[10px]">{p.issues}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{p.tenants}/{p.units} belegt</span>
                    <span>{formatCurrency(p.rent)}/Mt.</span>
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Auslastung</span>
                    <span className={`font-medium ${p.occupancy === 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {p.occupancy}%
                    </span>
                  </div>
                  <Progress value={p.occupancy} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Zahlungen */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Letzte Zahlungen
              </CardTitle>
              <Link to="/mieterbereich">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Details <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_RECENT_PAYMENTS.map((pay, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">{pay.tenant}</p>
                  <p className="text-xs text-muted-foreground">{pay.property}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{formatCurrency(pay.amount)}</p>
                  {pay.status === 'paid' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : pay.status === 'overdue' ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leerstand-Warnung */}
        {o.vacancyRate > 0 && (
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/40 p-3">
                  <TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Leerstand: {o.vacancyRate}%</p>
                  <p className="text-sm text-muted-foreground">
                    {o.units - o.tenants} von {o.units} Einheiten sind nicht vermietet.
                    {o.upcomingLeaseEnds > 0 && ` ${o.upcomingLeaseEnds} Mietvertraege laufen bald aus.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Schnellzugriff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Neuen Bescheid', href: '/upload', icon: FileText },
                { label: 'NK-Abrechnung', href: '/nebenkosten', icon: Euro },
                { label: 'Immobilie', href: '/immobilien', icon: Building2 },
                { label: 'Steuerkalender', href: '/steuerkalender', icon: Clock },
              ].map(link => (
                <Link key={link.href} to={link.href}>
                  <Button variant="outline" className="w-full gap-2 justify-start h-auto py-3">
                    <link.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{link.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
