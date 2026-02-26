import { Link, useLocation } from 'react-router-dom'
import {
  Calculator, Shield, FileText, ArrowRight, CheckCircle2,
  Sparkles
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, getOtherApps, EcosystemStatsBar, CrossAppRecommendations } from '@fintutto/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ecosystemApps = getOtherApps('mieter-checker')

const categories = [
  {
    title: 'Rechner',
    subtitle: 'Für Vermieter',
    description: '7 professionelle Rechner für Immobilieneigentümer und Vermieter.',
    icon: Calculator,
    href: '/rechner',
    gradient: 'gradient-card-left',
    count: 7,
    highlights: ['Kaufnebenkosten', 'Rendite', 'Mieterhöhung', 'Grundsteuer'],
  },
  {
    title: 'Checker',
    subtitle: 'Für Mieter',
    description: '10 rechtliche Prüfungen für Mieter – kenne deine Rechte.',
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
    count: 10,
    highlights: ['Mietvertrag', 'Übergabeprotokoll', 'BK-Abrechnung', 'Selbstauskunft'],
  },
]

const stats = [
  { value: '27', label: 'Tools verfügbar' },
  { value: '16', label: 'Bundesländer' },
  { value: '100%', label: 'DSGVO-konform' },
  { value: '§0', label: 'Kostenlos starten' },
]

export default function HomePage() {
  const { pathname } = useLocation()
  useDocumentTitle('Mietrechts-Checker', 'Fintutto')
  useMetaTags({
    title: 'Fintutto Checker – Mietrecht pruefen',
    description: '10 kostenlose Mietrechts-Checker: Mietpreisbremse, Mieterhoehung, Nebenkosten, Kuendigung und mehr – basierend auf aktuellem deutschem Recht.',
    path: '/',
    siteName: 'Fintutto Checker',
  })

  return (
    <div>
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
              27 professionelle Tools: Rechner für Vermieter, Checker für Mieter
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

      <EcosystemStatsBar
        linkTo="/apps"
        renderLink={({ to, children, className }) => (
          <Link to={to} className={className}>{children}</Link>
        )}
      />

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
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
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

      {/* Ecosystem Teaser */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Das Fintutto Oekosystem
            </h2>
            <p className="text-gray-600">
              Noch mehr Tools fuer Mieter und Vermieter – alle verbunden.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-xl border bg-white hover:shadow-lg hover:border-fintutto-primary/30 transition-all"
              >
                <span className="text-3xl mb-2">{app.icon}</span>
                <span className="font-semibold text-sm text-gray-900">{app.name}</span>
                <span className="text-xs text-gray-500 text-center">{app.description}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-fintutto-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit, Ihre Mietrechte zu pruefen?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Starten Sie jetzt kostenlos und erhalten Sie sofort eine fundierte Einschaetzung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-fintutto-primary hover:bg-blue-50" asChild>
              <Link to="/checker/mietpreisbremse">
                Jetzt kostenlos pruefen
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/apps">
                Alle Apps entdecken <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CrossAppRecommendations currentPath={pathname} currentAppSlug="mieter-checker" />
    </div>
  )
}
