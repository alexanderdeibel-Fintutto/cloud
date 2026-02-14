import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, AlertCircle, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  const cards = [
    {
      name: 'Immobilien',
      value: stats?.propertyCount?.toString() ?? '0',
      icon: Building2,
      description: 'Objekte verwaltet',
      href: '/properties',
    },
    {
      name: 'Mieter',
      value: stats?.tenantCount?.toString() ?? '0',
      icon: Users,
      description: 'Aktive Mietverhältnisse',
      href: '/tenants',
    },
    {
      name: 'Monatseinnahmen',
      value: formatCurrency((stats?.monthlyRevenue ?? 0) / 100),
      icon: CreditCard,
      description: 'Erwartete Miete',
      href: '/payments',
    },
    {
      name: 'Offene Posten',
      value: stats?.overduePayments?.toString() ?? '0',
      icon: AlertCircle,
      description: 'Ausstehende Zahlungen',
      href: '/payments',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen bei Vermietify - Ihre Immobilienverwaltung
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.name} to={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-2xl font-bold">{card.value}</div>
                )}
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>Ihre neuesten Änderungen</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.propertyCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Aktivitäten vorhanden. <Link to="/properties" className="text-primary underline">Fügen Sie Ihre erste Immobilie hinzu.</Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {stats?.propertyCount} Immobilie(n) mit {stats?.tenantCount} Mieter(n) verwaltet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstehende Aufgaben</CardTitle>
            <CardDescription>Was als nächstes zu tun ist</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.overduePayments && stats.overduePayments > 0 ? (
              <p className="text-sm text-destructive">
                {stats.overduePayments} überfällige Zahlung(en) - <Link to="/payments" className="underline">jetzt prüfen</Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine anstehenden Aufgaben.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
