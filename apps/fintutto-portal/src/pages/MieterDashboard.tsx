import { Link } from 'react-router-dom'
import {
  Key, Shield, FileText, Calculator, Scale,
  Wrench, ArrowRight, ExternalLink, MessageCircle,
  AlertTriangle, Receipt, Home, Ban, Paintbrush
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDocumentTitle, useMetaTags, CrossAppRecommendations } from '@fintutto/shared'

const features = [
  {
    icon: Shield,
    title: 'Rechte pruefen',
    description: '10 Checker fuer Mietpreisbremse, Kuendigung, Nebenkosten & mehr',
    href: '/checker',
    color: 'bg-purple-500',
    count: '10 Checker',
  },
  {
    icon: Calculator,
    title: 'Rechner',
    description: 'Mieterhoehung, Nebenkosten, Kaution berechnen',
    href: '/rechner',
    color: 'bg-amber-500',
    count: '7 Rechner',
  },
  {
    icon: FileText,
    title: 'Formulare',
    description: 'Kuendigung, Selbstauskunft, Widerspruch und mehr',
    href: '/formulare',
    color: 'bg-blue-500',
    count: '10 Vorlagen',
  },
  {
    icon: Scale,
    title: 'Mietrecht',
    description: 'Deine Rechte und Pflichten als Mieter kennen',
    href: '/checker',
    color: 'bg-green-500',
    count: 'Kostenlos',
  },
]

const checkerHighlights = [
  { name: 'Mietpreisbremse', href: '/checker/mietpreisbremse', icon: AlertTriangle, desc: 'Ist deine Miete zu hoch?' },
  { name: 'Nebenkostencheck', href: '/checker/nebenkosten', icon: Receipt, desc: 'Abrechnung korrekt?' },
  { name: 'Kuendigungscheck', href: '/checker/kuendigung', icon: Ban, desc: 'Kuendigung rechtmaessig?' },
  { name: 'Schoenheitsreparaturen', href: '/checker/schoenheitsreparaturen', icon: Paintbrush, desc: 'Musst du renovieren?' },
]

const formularHighlights = [
  { name: 'Kuendigung schreiben', href: '/formulare/kuendigung', icon: Ban },
  { name: 'Selbstauskunft', href: '/formulare/selbstauskunft', icon: FileText },
  { name: 'Wohnungsgeberbestaetigung', href: '/formulare/wohnungsgeberbestaetigung', icon: Home },
]

export default function MieterDashboard() {
  useDocumentTitle('Mieter-Dashboard', 'Fintutto Portal')
  useMetaTags({
    title: 'Mieter-Dashboard – Fintutto Portal',
    description: 'Alles rund um deine Wohnung: Rechte pruefen, Rechner nutzen, Formulare erstellen. 28+ kostenlose Tools fuer Mieter.',
    path: '/mieter',
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 py-12">
        <div className="container">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Key className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Mieter-Dashboard
              </h1>
              <p className="text-white/70">
                Alles rund um deine Wohnung an einem Ort
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.href} className="group">
                <Card className="h-full hover:shadow-lg hover:border-primary/20 transition-all">
                  <CardContent className="p-5">
                    <div className={`w-11 h-11 ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <span className="text-xs text-primary font-medium">{feature.count}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Checker Highlights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Beliebte Rechts-Checker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {checkerHighlights.map((checker) => (
                  <Link
                    key={checker.name}
                    to={checker.href}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                  >
                    <checker.icon className="h-5 w-5 text-purple-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium group-hover:text-purple-700">{checker.name}</p>
                      <p className="text-xs text-muted-foreground">{checker.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/checker">
                  Alle 10 Checker ansehen <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Formulare fuer Mieter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Formulare fuer Mieter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {formularHighlights.map((form) => (
                  <Link
                    key={form.name}
                    to={form.href}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                  >
                    <form.icon className="h-5 w-5 text-blue-500 shrink-0" />
                    <span className="text-sm font-medium group-hover:text-blue-700">{form.name}</span>
                  </Link>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/formulare">
                  Alle 10 Formulare ansehen <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* KI-Assistent Hinweis */}
          <Card className="border-emerald-200 bg-emerald-50/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-1">KI-Assistent</h3>
                  <p className="text-emerald-700 text-sm">
                    Der KI-Assistent kennt deutsches Mietrecht und hilft dir bei allen Wohnungsfragen.
                    Von Mietpreisbremse bis Kuendigung – frag einfach!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mieter-App Link */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <p className="font-semibold">Fintutto Mieter-App</p>
                    <p className="text-sm text-muted-foreground">
                      Maengel melden, mit Vermieter chatten, Zaehler ablesen
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://mieter.fintutto.cloud" target="_blank" rel="noopener noreferrer">
                    Zur App <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <CrossAppRecommendations currentPath="/mieter" currentAppSlug="portal" />
    </div>
  )
}
