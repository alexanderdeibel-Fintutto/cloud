import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const stats = [
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Willkommen bei Vermietify - Ihre Immobilienverwaltung
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <CardDescription>Ihre neuesten Änderungen</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noch keine Aktivitäten vorhanden. Fügen Sie Ihre erste Immobilie hinzu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstehende Aufgaben</CardTitle>
            <CardDescription>Was als nächstes zu tun ist</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keine anstehenden Aufgaben.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
