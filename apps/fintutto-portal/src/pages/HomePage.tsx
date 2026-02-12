import { Link } from 'react-router-dom'
import {
  Calculator, Shield, FileText, ArrowRight, CheckCircle2,
  Home, TrendingUp, Euro, PiggyBank, Receipt,
  Scale, AlertTriangle, Wrench, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const categories = [
  {
    title: 'Rechner',
    subtitle: 'F\u00fcr Vermieter',
    description: '9 professionelle Rechner f\u00fcr Immobilieneigent\u00fcmer und Vermieter.',
    icon: Calculator,
    href: '/rechner',
    gradient: 'gradient-vermieter',
    count: 7,
    highlights: ['Kaufnebenkosten', 'Rendite', 'Mieterh\u00f6hung', 'Grundsteuer'],
  },
  {
    title: 'Checker',
    subtitle: 'F\u00fcr Mieter',
    description: '11 rechtliche Pr\u00fcfungen f\u00fcr Mieter \u2013 kenne deine Rechte.',
    icon: Shield,
    href: '/checker',
    gradient: 'gradient-mieter',
    count: 10,
    highlights: ['Mietpreisbremse', 'K\u00fcndigung', 'Nebenkosten', 'Kaution'],
  },
  {
    title: 'Formulare',
    subtitle: 'F\u00fcr alle',
    description: 'Rechtssichere Vorlagen f\u00fcr Mietvertrag, \u00dcbergabe & mehr.',
    icon: FileText,
    href: '/formulare',
    gradient: 'gradient-portal',
    count: 5,
    highlights: ['Mietvertrag', '\u00dcbergabeprotokoll', 'BK-Abrechnung', 'Selbstauskunft'],
  },
]

const stats = [
  { value: '28+', label: 'Tools verf\u00fcgbar' },
  { value: '16', label: 'Bundesl\u00e4nder', },
  { value: '100%', label: 'DSGVO-konform' },
  { value: '\u00a70', label: 'Kostenlos starten' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-portal py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                Rechner + Checker + Formulare \u2013 alles an einem Ort
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Dein Mietrecht-Portal
              <span className="block text-white/80 text-2xl md:text-3xl mt-2 font-normal">
                F\u00fcr Mieter & Vermieter
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              28+ professionelle Tools: Rechner f\u00fcr Vermieter, Checker f\u00fcr Mieter
              und rechtssichere Formulare f\u00fcr alle. Basierend auf aktuellem deutschen Mietrecht.
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

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Alles was du brauchst</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ob Mieter oder Vermieter \u2013 finde das richtige Tool f\u00fcr dein Anliegen.
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

      {/* Vermietify Integration Teaser */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              Mehr als nur Tools? Entdecke Vermietify
            </h2>
            <p className="text-muted-foreground mb-6">
              Alle deine Berechnungen und Formulare flie\u00dfen nahtlos in Vermietify \u2013
              die komplette Immobilienverwaltung. Geb\u00e4ude, Mieter, Vertr\u00e4ge, Zahlungen
              und mehr \u2013 alles an einem Ort.
            </p>
            <Button variant="outline" size="lg" asChild>
              <a href="https://vermietify.fintutto.cloud" target="_blank" rel="noopener noreferrer">
                Vermietify kennenlernen <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
