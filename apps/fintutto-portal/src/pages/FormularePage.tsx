import { Link } from 'react-router-dom'
import {
  FileSignature,
  ClipboardList,
  TrendingUp,
  Users,
  Receipt,
  ArrowRight,
  Download,
  Mail,
  Ban,
  AlertTriangle,
  FileCheck,
  Home,
  Wallet
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const formulare = [
  {
    title: 'Mietvertrag',
    description: 'Rechtssicherer Mietvertrag für Wohnraum. Vollständig anpassbar mit allen wichtigen Klauseln.',
    icon: FileSignature,
    href: '/formulare/mietvertrag',
    features: ['Wohnraummietvertrag', 'Index- oder Staffelmiete', 'Alle Pflichtangaben'],
    popular: true,
  },
  {
    title: 'Übergabeprotokoll',
    description: 'Dokumentiere den Zustand der Wohnung bei Einzug und Auszug rechtssicher.',
    icon: ClipboardList,
    href: '/formulare/uebergabeprotokoll',
    features: ['Raumweise Erfassung', 'Zählerstände', 'Schlüsselübergabe'],
    popular: true,
  },
  {
    title: 'Mieterhöhungsschreiben',
    description: 'Korrekt formuliertes Mieterhöhungsschreiben nach §558 BGB.',
    icon: TrendingUp,
    href: '/formulare/mieterhoehung',
    features: ['§558 BGB konform', 'Begründung inkl.', 'Zustimmungsfrist'],
    popular: false,
  },
  {
    title: 'Selbstauskunft',
    description: 'Mieterselbstauskunft für Wohnungsinteressenten. DSGVO-konform.',
    icon: Users,
    href: '/formulare/selbstauskunft',
    features: ['DSGVO-konform', 'Einkommensnachweis', 'Schufa-Klausel'],
    popular: false,
  },
  {
    title: 'Betriebskostenabrechnung',
    description: 'Erstelle eine korrekte Betriebskostenabrechnung für deine Mieter.',
    icon: Receipt,
    href: '/formulare/betriebskosten',
    features: ['17 Kostenarten', 'Umlageschlüssel', 'Vorauszahlungen'],
    popular: false,
  },
  {
    title: 'Kündigungsschreiben',
    description: 'Rechtssichere Kündigung für Mieter oder Vermieter nach §573/§543 BGB.',
    icon: Ban,
    href: '/formulare/kuendigung',
    features: ['Mieter & Vermieter', 'Ordentlich & Außerordentlich', '§573/§543 BGB'],
    popular: true,
  },
  {
    title: 'Mahnschreiben',
    description: 'Von Zahlungserinnerung bis letzte Mahnung – mit Mahngebühr und Fristsetzung.',
    icon: AlertTriangle,
    href: '/formulare/mahnung',
    features: ['4 Mahnstufen', 'Mahngebühr', 'Bankverbindung'],
    popular: false,
  },
  {
    title: 'Mietbescheinigung',
    description: 'Offizielle Bestätigung des Mietverhältnisses für Behörden, Banken oder neue Vermieter.',
    icon: FileCheck,
    href: '/formulare/mietbescheinigung',
    features: ['Zahlungsverhalten', 'Mietkosten', 'Mehrere Zwecke'],
    popular: false,
  },
  {
    title: 'Wohnungsgeberbestätigung',
    description: 'Pflichtdokument nach §19 BMG für die Anmeldung beim Einwohnermeldeamt.',
    icon: Home,
    href: '/formulare/wohnungsgeberbestaetigung',
    features: ['§19 BMG konform', 'Ein- & Auszug', 'Mehrere Personen'],
    popular: true,
  },
  {
    title: 'Nebenkostenvorauszahlung',
    description: 'Anpassungsschreiben für die monatliche Nebenkostenvorauszahlung nach §560 BGB.',
    icon: Wallet,
    href: '/formulare/nebenkostenvorauszahlung',
    features: ['§560 BGB konform', '8 Kostenarten', 'Vergleichsübersicht'],
    popular: false,
  },
]

export default function FormularePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Formulare & Vorlagen
            </h1>
            <p className="text-lg text-white/80">
              10 rechtssichere Dokumente für Mieter & Vermieter.
              Ausfüllen, drucken, fertig.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-5 w-5 text-primary" />
              <span className="text-sm">PDF-Export</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-sm">Per E-Mail versenden</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileSignature className="h-5 w-5 text-primary" />
              <span className="text-sm">Digital unterschreiben</span>
            </div>
          </div>
        </div>
      </section>

      {/* Formulare Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formulare.map((item) => (
              <Link key={item.title} to={item.href}>
                <Card className={`h-full hover:shadow-lg transition-all group ${item.popular ? 'border-primary/30 shadow-md' : 'hover:border-primary/30'}`}>
                  {item.popular && (
                    <div className="gradient-vermieter text-white text-xs font-medium px-3 py-1 rounded-t-xl text-center">
                      Beliebt
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-vermieter-subtle mb-3 group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7 text-fintutto-purple-600" />
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
                      Formular öffnen
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
