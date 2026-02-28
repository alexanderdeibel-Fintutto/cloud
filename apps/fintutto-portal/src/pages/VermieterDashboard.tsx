import { Link } from 'react-router-dom'
import {
  Building2, Users, Wallet, AlertCircle,
  Receipt, FileText, TrendingUp, Calculator,
  ArrowRight, BarChart3, Wrench, ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProperties } from '@/hooks/useProperties'
import { useDocumentTitle, useMetaTags, CrossAppRecommendations } from '@fintutto/shared'

const quickActions = [
  { name: 'NK-Abrechnung', href: '/formulare/betriebskosten', icon: Receipt, color: 'bg-green-100 text-green-600' },
  { name: 'Mietvertrag', href: '/formulare/mietvertrag', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { name: 'Mieterhoehung', href: '/rechner/mieterhoehung', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
  { name: 'Kaution berechnen', href: '/rechner/kaution', icon: Calculator, color: 'bg-purple-100 text-purple-600' },
  { name: 'Rendite pruefen', href: '/rechner/rendite', icon: BarChart3, color: 'bg-teal-100 text-teal-600' },
  { name: 'Uebergabeprotokoll', href: '/formulare/uebergabeprotokoll', icon: FileText, color: 'bg-orange-100 text-orange-600' },
]

const externalApps = [
  { name: 'Vermietify', desc: 'Immobilienverwaltung', url: 'https://vermietify.fintutto.cloud', emoji: '🏠' },
  { name: 'Ablesung', desc: 'Zaehlerstaende', url: 'https://ablesung.fintutto.cloud', emoji: '📊' },
  { name: 'HausmeisterPro', desc: 'Facility Management', url: 'https://hausmeister.fintutto.cloud', emoji: '🔧' },
]

export default function VermieterDashboard() {
  useDocumentTitle('Vermieter-Dashboard', 'Fintutto Portal')
  useMetaTags({
    title: 'Vermieter-Dashboard – Fintutto Portal',
    description: 'Uebersicht fuer Vermieter: Immobilien, Rechner, Formulare und Tools auf einen Blick.',
    path: '/vermieter',
  })
  const { user } = useAuth()
  const { properties, hasProperties } = useProperties()

  const totalUnits = properties.reduce((sum, b) => sum + b.units.length, 0)
  const rentedUnits = properties.reduce(
    (sum, b) => sum + b.units.filter((u) => u.status === 'rented').length, 0
  )
  const totalRent = properties.reduce(
    (sum, b) => sum + b.units.reduce((s, u) => s + (u.rent_amount || 0), 0), 0
  )

  const stats = user && hasProperties
    ? [
        { name: 'Gebaeude', value: String(properties.length), icon: Building2, color: 'bg-blue-500' },
        { name: 'Einheiten', value: String(totalUnits), icon: Users, color: 'bg-green-500' },
        { name: 'Mieteinnahmen/Mo', value: `${totalRent.toLocaleString('de-DE')} EUR`, icon: Wallet, color: 'bg-indigo-500' },
        { name: 'Leerstand', value: String(totalUnits - rentedUnits), icon: AlertCircle, color: totalUnits - rentedUnits > 0 ? 'bg-red-500' : 'bg-green-500' },
      ]
    : [
        { name: 'Rechner', value: '7', icon: Calculator, color: 'bg-blue-500' },
        { name: 'Formulare', value: '10', icon: FileText, color: 'bg-green-500' },
        { name: 'Apps', value: '6', icon: Building2, color: 'bg-indigo-500' },
        { name: 'Kostenlos', value: 'Ja', icon: Wallet, color: 'bg-amber-500' },
      ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="container">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Vermieter-Dashboard
              </h1>
              <p className="text-white/70">
                {user ? 'Uebersicht Ihrer Immobilien & Tools' : 'Alle Vermieter-Tools auf einen Blick'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 ${stat.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-center font-medium">{action.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tool-Kategorien */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  7 Vermieter-Rechner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {['Kaufnebenkosten', 'Mietrendite', 'Mieterhoehung', 'Grundsteuer', 'Kaution', 'Eigenkapital', 'Nebenkosten'].map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/rechner">
                    Alle Rechner <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  10 Formulare & Vorlagen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {['Mietvertrag', 'Uebergabeprotokoll', 'Mieterhoehung', 'Kuendigung', 'Betriebskosten', 'Mahnung', 'Mietbescheinigung'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                  <li className="text-sm text-primary font-medium">+3 weitere</li>
                </ul>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/formulare">
                    Alle Formulare <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Ecosystem Apps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Weitere Vermieter-Apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {externalApps.map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <span className="text-2xl">{app.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.desc}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <CrossAppRecommendations currentPath="/vermieter" currentAppSlug="portal" />
    </div>
  )
}
