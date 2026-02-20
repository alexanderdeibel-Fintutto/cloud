import { Link } from 'react-router-dom'
import {
  Calculator, Shield, FileText, ArrowRight, CheckCircle2,
  Home, TrendingUp, Euro, PiggyBank, Receipt,
  Scale, AlertTriangle, Wrench, Sparkles, Building2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProperties } from '@/hooks/useProperties'
import { getOtherApps, useDocumentTitle, useRecentTools, useMetaTags, AnnouncementBanner } from '@fintutto/shared'

const categories = [
  {
    title: 'Rechner',
    subtitle: 'Für Vermieter',
    description: '9 professionelle Rechner für Immobilieneigentümer und Vermieter.',
    icon: Calculator,
    href: '/rechner',
    gradient: 'gradient-card-left',
    count: 7,
    highlights: ['Kaufnebenkosten', 'Rendite', 'Mieterhöhung', 'Grundsteuer'],
  },
  {
    title: 'Checker',
    subtitle: 'Für Mieter',
    description: '11 rechtliche Prüfungen für Mieter – kenne deine Rechte.',
    icon: Shield,
    href: '/checker',
    gradient: 'gradient-card-center',
    count: 10,
    highlights: ['Mietpreisbremse', 'Kündigung', 'Nebenkosten', 'Kaution'],
  },
  {
    title: 'Formulare',
    subtitle: 'Für alle',
    description: 'Rechtssichere Vorlagen für Mietvertrag, Übergabe & mehr.',
    icon: FileText,
    href: '/formulare',
    gradient: 'gradient-card-right',
    count: 5,
    highlights: ['Mietvertrag', 'Übergabeprotokoll', 'BK-Abrechnung', 'Selbstauskunft'],
  },
]

const stats = [
  { value: '28+', label: 'Tools verfügbar' },
  { value: '16', label: 'Bundesländer', },
  { value: '100%', label: 'DSGVO-konform' },
  { value: '§0', label: 'Kostenlos starten' },
]

const ecosystemApps = getOtherApps('portal')

export default function HomePage() {
  useDocumentTitle('Rechner, Checker & Formulare', 'Fintutto Portal')
  useMetaTags({
    title: 'Fintutto Portal – Rechner, Checker & Formulare',
    description: 'Kostenlose Tools fuer Mieter und Vermieter: Kautions-Rechner, Mietpreisbremse-Checker, Mietvertrag-Generator und mehr.',
    path: '/',
  })
  const { user } = useAuth()
  const { properties, hasProperties } = useProperties()
  const { recentTools } = useRecentTools('portal')

  const totalUnits = properties.reduce((sum, b) => sum + b.units.length, 0)
  const rentedUnits = properties.reduce(
    (sum, b) => sum + b.units.filter((u) => u.status === 'rented').length, 0
  )

  return (
    <div>
      <AnnouncementBanner
        id="vermieter-portal-launch"
        message="Neu: Vermieter-Portal mit allen Rechner-Tools!"
        linkText="Zum Vermieter-Portal"
        linkHref="https://vermieter-portal.vercel.app"
      />

      {/* Hero */}
      <section className="gradient-portal py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                Rechner + Checker + Formulare – alles an einem Ort
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Dein Mietrecht-Portal
              <span className="block text-white/80 text-2xl md:text-3xl mt-2 font-normal">
                Für Mieter & Vermieter
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              28+ professionelle Tools: Rechner für Vermieter, Checker für Mieter
              und rechtssichere Formulare für alle. Basierend auf aktuellem deutschen Mietrecht.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90" asChild>
                <Link to="/rechner">
                  <Calculator className="h-5 w-5 mr-2" />
                  Rechner entdecken
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/checker">
                  <Shield className="h-5 w-5 mr-2" />
                  Checker ausprobieren
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Used */}
      {recentTools.length > 0 && (
        <section className="py-8 bg-muted/20">
          <div className="container">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Zuletzt verwendet
            </h3>
            <div className="flex flex-wrap gap-3">
              {recentTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:border-primary/40 hover:shadow-sm transition-all text-sm font-medium"
                >
                  {tool.title}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Alles was du brauchst</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ob Mieter oder Vermieter – finde das richtige Tool für dein Anliegen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link key={cat.title} to={cat.href}>
                <Card className="h-full hover:shadow-xl hover:border-primary/30 transition-all group overflow-hidden">
                  <div className={`${cat.gradient} p-6`}>
                    <cat.icon className="h-10 w-10 text-white mb-3" />
                    <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
                    <p className="text-white/70 text-sm">{cat.subtitle}</p>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">{cat.description}</p>
                    <div className="space-y-2 mb-4">
                      {cat.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {h}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{cat.count} Tools</span>
                      <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Alle anzeigen <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Logged-in: Your Properties Summary */}
      {user && hasProperties && (
        <section className="py-12 bg-blue-50/50 border-y border-blue-100">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold">Deine Immobilien</h2>
              <span className="text-sm text-muted-foreground">aus Vermietify</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{properties.length}</p>
                  <p className="text-xs text-muted-foreground">Gebaeude</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalUnits}</p>
                  <p className="text-xs text-muted-foreground">Einheiten</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{rentedUnits}</p>
                  <p className="text-xs text-muted-foreground">Vermietet</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{totalUnits - rentedUnits}</p>
                  <p className="text-xs text-muted-foreground">Frei</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-muted-foreground">
              Deine Rechner werden automatisch mit deinen Vermietify-Daten vorbefuellt.
            </p>
          </div>
        </section>
      )}

      {/* Ecosystem Teaser */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">
              Das komplette Fintutto Oekosystem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {ecosystemApps.length} Apps fuer jeden Schritt im Mietalltag – alle verbunden, alle kostenlos starten.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 max-w-5xl mx-auto mb-8">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <span className="text-3xl mb-2">{app.icon}</span>
                <span className="font-semibold text-sm">{app.name}</span>
                <span className="text-xs text-muted-foreground">{app.description}</span>
              </a>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/apps">
                Alle Apps entdecken <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
