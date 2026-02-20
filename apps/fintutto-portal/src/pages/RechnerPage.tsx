import { Link } from 'react-router-dom'
import {
  Calculator,
  TrendingUp,
  Euro,
  Home,
  PiggyBank,
  Receipt,
  ArrowRight
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, Breadcrumbs } from '@fintutto/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const rechner = [
  {
    title: 'Kautions-Rechner',
    description: 'Berechne die maximale zulässige Kaution nach §551 BGB. Maximal 3 Nettokaltmieten.',
    icon: PiggyBank,
    href: '/rechner/kaution',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Max. 3 Monatsmieten', 'Ratenzahlung berechnen', '§551 BGB konform'],
  },
  {
    title: 'Mieterhöhungs-Rechner',
    description: 'Berechne die zulässige Mieterhöhung nach §558 BGB mit Kappungsgrenze.',
    icon: TrendingUp,
    href: '/rechner/mieterhoehung',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Kappungsgrenze 15-20%', 'Ortsübliche Vergleichsmiete', '§558 BGB konform'],
  },
  {
    title: 'Kaufnebenkosten-Rechner',
    description: 'Berechne alle Nebenkosten beim Immobilienkauf: Grunderwerbsteuer, Notar, Makler.',
    icon: Euro,
    href: '/rechner/kaufnebenkosten',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['Alle 16 Bundesländer', 'Notar & Grundbuch', 'Maklerkosten'],
  },
  {
    title: 'Eigenkapital-Rechner',
    description: 'Wie viel Eigenkapital brauchst du für deine Immobilie? Berechne es hier.',
    icon: Home,
    href: '/rechner/eigenkapital',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Kaufnebenkosten inkl.', 'Finanzierungsquote', 'Empfehlung'],
  },
  {
    title: 'Rendite-Rechner',
    description: 'Berechne Brutto- und Netto-Rendite, Cashflow und Eigenkapitalrendite.',
    icon: Calculator,
    href: '/rechner/rendite',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    features: ['Brutto-/Nettorendite', 'Cashflow-Analyse', 'EK-Rendite'],
  },
  {
    title: 'Nebenkosten-Rechner',
    description: 'Erstelle eine korrekte Nebenkostenabrechnung für deine Mieter.',
    icon: Receipt,
    href: '/rechner/nebenkosten',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    features: ['Umlageschlüssel', 'Vorauszahlungen', 'Abrechnungszeitraum'],
  },
]

export default function RechnerPage() {
  useDocumentTitle('Rechner', 'Fintutto Portal')
  useMetaTags({
    title: 'Rechner fuer Vermieter – Fintutto Portal',
    description: '7 professionelle Rechner fuer Vermieter: Kaution, Mieterhoehung, Kaufnebenkosten, Rendite, Grundsteuer und mehr.',
    path: '/rechner',
  })
  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-16">
        <div className="container">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'Rechner' },
            ]}
            className="mb-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Rechner für Vermieter
            </h1>
            <p className="text-lg text-white/80">
              Professionelle Berechnungen für alle Vermieterthemen.
              Rechtssicher und kostenlos.
            </p>
          </div>
        </div>
      </section>

      {/* Rechner Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Verfügbare Rechner">
            {rechner.map((item) => (
              <Link key={item.title} to={item.href} aria-label={`${item.title} – ${item.description}`} role="listitem">
                <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all group">
                  <CardHeader>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Jetzt berechnen
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
