import { Link } from 'react-router-dom'
import {
  Calculator,
  FileText,
  Shield,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle2,
  Euro,
  PiggyBank,
  Home,
  Receipt,
  FileSignature,
  ClipboardList,
  Users,
  Scale
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'
import { useProperties } from '../hooks/useProperties'
import { getOtherApps } from '@fintutto/shared'

const ecosystemApps = getOtherApps('portal')

const rechnerCards = [
  {
    title: 'Kautions-Rechner',
    description: 'Berechne die maximale Kaution nach §551 BGB',
    icon: PiggyBank,
    href: '/rechner/kaution',
    color: 'text-purple-600',
  },
  {
    title: 'Mieterhöhungs-Rechner',
    description: 'Berechne zulässige Mieterhöhungen nach §558 BGB',
    icon: TrendingUp,
    href: '/rechner/mieterhoehung',
    color: 'text-blue-600',
  },
  {
    title: 'Kaufnebenkosten-Rechner',
    description: 'Alle Kosten beim Immobilienkauf im Überblick',
    icon: Euro,
    href: '/rechner/kaufnebenkosten',
    color: 'text-green-600',
  },
  {
    title: 'Eigenkapital-Rechner',
    description: 'Wie viel Eigenkapital brauchst du?',
    icon: Home,
    href: '/rechner/eigenkapital',
    color: 'text-orange-600',
  },
  {
    title: 'Rendite-Rechner',
    description: 'Berechne Brutto- und Netto-Rendite deiner Immobilie',
    icon: Calculator,
    href: '/rechner/rendite',
    color: 'text-indigo-600',
  },
  {
    title: 'Nebenkosten-Rechner',
    description: 'Berechne die Nebenkosten-Abrechnung',
    icon: Receipt,
    href: '/rechner/nebenkosten',
    color: 'text-teal-600',
  },
]

const formulareCards = [
  {
    title: 'Mietvertrag',
    description: 'Rechtssicherer Mietvertrag für Wohnraum',
    icon: FileSignature,
    href: '/formulare/mietvertrag',
  },
  {
    title: 'Übergabeprotokoll',
    description: 'Dokumentiere den Zustand bei Ein-/Auszug',
    icon: ClipboardList,
    href: '/formulare/uebergabeprotokoll',
  },
  {
    title: 'Mieterhöhung',
    description: 'Mieterhöhungsschreiben nach §558 BGB',
    icon: TrendingUp,
    href: '/formulare/mieterhoehung',
  },
  {
    title: 'Selbstauskunft',
    description: 'Mieterselbstauskunft für Interessenten',
    icon: Users,
    href: '/formulare/selbstauskunft',
  },
  {
    title: 'Betriebskosten',
    description: 'Betriebskostenabrechnung erstellen',
    icon: Receipt,
    href: '/formulare/betriebskosten',
  },
]

const features = [
  {
    icon: Shield,
    title: 'Rechtssicher',
    description: 'Alle Tools basieren auf aktuellem deutschen Mietrecht',
  },
  {
    icon: Calculator,
    title: 'Präzise Berechnungen',
    description: 'Exakte Ergebnisse nach gesetzlichen Vorgaben',
  },
  {
    icon: FileText,
    title: 'Sofort nutzbar',
    description: 'PDF-Export und direkter Versand möglich',
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const { properties, hasProperties } = useProperties()

  const totalUnits = properties.reduce((sum, b) => sum + b.units.length, 0)
  const rentedUnits = properties.reduce(
    (sum, b) => sum + b.units.filter((u) => u.status === 'rented').length, 0
  )

  return (
    <div>
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden">
        <div className="gradient-vermieter">
          <div className="container py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6">
                <Building2 className="h-4 w-4" />
                Professionelle Tools für Vermieter
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Alles für Vermieter.
                <br />
                <span className="text-white/80">An einem Ort.</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
                Rechner, Formulare und Tools für die professionelle Immobilienvermietung.
                Rechtssicher, kostenlos und sofort nutzbar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-fintutto-purple-700 hover:bg-white/90"
                  asChild
                >
                  <Link to="/rechner">
                    <Calculator className="mr-2 h-5 w-5" />
                    Zu den Rechnern
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/formulare">
                    <FileText className="mr-2 h-5 w-5" />
                    Formulare entdecken
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </section>

      {/* Features Bar */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-vermieter-subtle">
                  <feature.icon className="h-6 w-6 text-fintutto-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rechner Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Rechner</h2>
              <p className="text-muted-foreground">
                Professionelle Berechnungen für alle Vermieterthemen
              </p>
            </div>
            <Link
              to="/rechner"
              className="hidden md:flex items-center gap-1 text-primary hover:underline"
            >
              Alle Rechner
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rechnerCards.map((rechner) => (
              <Link key={rechner.title} to={rechner.href}>
                <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all group">
                  <CardHeader>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-2 group-hover:scale-110 transition-transform`}>
                      <rechner.icon className={`h-6 w-6 ${rechner.color}`} />
                    </div>
                    <CardTitle className="text-lg">{rechner.title}</CardTitle>
                    <CardDescription>{rechner.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Jetzt berechnen
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Link
            to="/rechner"
            className="md:hidden flex items-center justify-center gap-1 text-primary mt-8"
          >
            Alle Rechner anzeigen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Formulare Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Formulare & Vorlagen</h2>
              <p className="text-muted-foreground">
                Rechtssichere Dokumente zum Ausfüllen und Ausdrucken
              </p>
            </div>
            <Link
              to="/formulare"
              className="hidden md:flex items-center gap-1 text-primary hover:underline"
            >
              Alle Formulare
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {formulareCards.map((formular) => (
              <Link key={formular.title} to={formular.href}>
                <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all group">
                  <CardHeader className="text-center">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl gradient-vermieter-subtle mb-2 group-hover:scale-110 transition-transform">
                      <formular.icon className="h-7 w-7 text-fintutto-purple-600" />
                    </div>
                    <CardTitle className="text-base">{formular.title}</CardTitle>
                    <CardDescription className="text-xs">{formular.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <Link
            to="/formulare"
            className="md:hidden flex items-center justify-center gap-1 text-primary mt-8"
          >
            Alle Formulare anzeigen
            <ArrowRight className="h-4 w-4" />
          </Link>
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
              Das Fintutto Oekosystem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {ecosystemApps.length} weitere Apps fuer jeden Schritt im Vermieteralltag.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 max-w-5xl mx-auto">
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
                <span className="text-xs text-muted-foreground text-center">{app.description}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="gradient-vermieter rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Bereit für professionelle Vermietung?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Alle Rechner und Formulare sind kostenlos nutzbar.
              Registriere dich für erweiterte Funktionen wie PDF-Export und gespeicherte Berechnungen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-fintutto-purple-700 hover:bg-white/90">
                Kostenlos registrieren
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/pricing">
                  Preise ansehen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm">DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-success" />
              <span className="text-sm">Deutsches Mietrecht</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm">SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-success" />
              <span className="text-sm">Made in Germany</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
