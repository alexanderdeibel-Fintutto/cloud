import { Link } from 'react-router-dom'
import {
  FileText,
  Calculator,
  Home,
  FileSignature,
  ClipboardList,
  Euro,
  TrendingUp,
  AlertTriangle,
  Key,
  Users,
  Building2,
  Sparkles,
  UserX,
  Shield,
  Wrench,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Kategorien für die Formulare
const kategorien = [
  {
    id: 'mietvertraege',
    title: 'Mietverträge',
    icon: FileSignature,
    formulare: [
      { id: 'mietvertrag', title: 'Wohnraum-Mietvertrag', href: '/formulare/mietvertrag', badge: 'Beliebt' },
      { id: 'untermietvertrag', title: 'Untermietvertrag', href: '/formulare/untermietvertrag' },
      { id: 'gewerbemietvertrag', title: 'Gewerbemietvertrag', href: '/formulare/gewerbemietvertrag' },
      { id: 'staffelmietvertrag', title: 'Staffelmietvertrag', href: '/formulare/staffelmietvertrag' },
      { id: 'indexmietvertrag', title: 'Indexmietvertrag', href: '/formulare/indexmietvertrag' },
      { id: 'zeitmietvertrag', title: 'Zeitmietvertrag', href: '/formulare/zeitmietvertrag' },
      { id: 'wg-mietvertrag', title: 'WG-Mietvertrag', href: '/formulare/wg-mietvertrag' },
      { id: 'garagenmietvertrag', title: 'Garagenmietvertrag', href: '/formulare/garagenmietvertrag' },
      { id: 'ferienwohnungsmietvertrag', title: 'Ferienwohnungsmietvertrag', href: '/formulare/ferienwohnungsmietvertrag' },
    ]
  },
  {
    id: 'kuendigungen',
    title: 'Kündigungen & Beendigung',
    icon: UserX,
    formulare: [
      { id: 'kuendigung', title: 'Ordentliche Kündigung', href: '/formulare/kuendigung', badge: 'Beliebt' },
      { id: 'ausserordentliche-kuendigung', title: 'Außerordentliche Kündigung', href: '/formulare/ausserordentliche-kuendigung' },
      { id: 'aufhebungsvertrag', title: 'Mietaufhebungsvertrag', href: '/formulare/aufhebungsvertrag' },
      { id: 'eigenbedarfskuendigung', title: 'Eigenbedarfskündigung', href: '/formulare/eigenbedarfskuendigung' },
      { id: 'raeumungsaufforderung', title: 'Räumungsaufforderung', href: '/formulare/raeumungsaufforderung' },
    ]
  },
  {
    id: 'mieterhoehung',
    title: 'Mieterhöhung & Anpassung',
    icon: TrendingUp,
    formulare: [
      { id: 'mieterhoehung', title: 'Mieterhöhungsverlangen', href: '/formulare/mieterhoehung' },
      { id: 'modernisierungsankuendigung', title: 'Modernisierungsankündigung', href: '/formulare/modernisierungsankuendigung' },
      { id: 'mietanpassung', title: 'Mietanpassung', href: '/formulare/mietanpassung' },
      { id: 'mieterhoehungszustimmung', title: 'Zustimmung Mieterhöhung', href: '/formulare/mieterhoehungszustimmung' },
    ]
  },
  {
    id: 'uebergabe',
    title: 'Übergabe & Protokolle',
    icon: ClipboardList,
    formulare: [
      { id: 'uebergabeprotokoll', title: 'Wohnungsübergabeprotokoll', href: '/formulare/uebergabeprotokoll', badge: 'Beliebt' },
      { id: 'schluesseluebergabe', title: 'Schlüsselübergabe', href: '/formulare/schluesseluebergabe' },
      { id: 'einzugsbestaetigung', title: 'Einzugsbestätigung', href: '/formulare/einzugsbestaetigung' },
      { id: 'auszugsbestaetigung', title: 'Auszugsbestätigung', href: '/formulare/auszugsbestaetigung' },
      { id: 'besichtigungsprotokoll', title: 'Besichtigungsprotokoll', href: '/formulare/besichtigungsprotokoll' },
    ]
  },
  {
    id: 'betriebskosten',
    title: 'Betriebskosten',
    icon: Euro,
    formulare: [
      { id: 'betriebskosten', title: 'Betriebskostenabrechnung', href: '/formulare/betriebskosten' },
      { id: 'nebenkostenabrechnung', title: 'Nebenkostenabrechnung', href: '/formulare/nebenkostenabrechnung' },
      { id: 'widerspruch-betriebskosten', title: 'Widerspruch Betriebskosten', href: '/formulare/widerspruch-betriebskosten' },
      { id: 'betriebskostenvorauszahlung', title: 'Betriebskostenvorauszahlung', href: '/formulare/betriebskostenvorauszahlung' },
      { id: 'erinnerung-nebenkosten', title: 'Erinnerung Nebenkosten', href: '/formulare/erinnerung-nebenkosten' },
    ]
  },
  {
    id: 'maengel',
    title: 'Mängel & Instandhaltung',
    icon: Wrench,
    formulare: [
      { id: 'maengelanzeige', title: 'Mängelanzeige', href: '/formulare/maengelanzeige' },
      { id: 'mietminderung', title: 'Mietminderung', href: '/formulare/mietminderung' },
      { id: 'reparaturanforderung', title: 'Reparaturanforderung', href: '/formulare/reparaturanforderung' },
      { id: 'renovierungsvereinbarung', title: 'Renovierungsvereinbarung', href: '/formulare/renovierungsvereinbarung' },
      { id: 'instandhaltungsvereinbarung', title: 'Instandhaltungsvereinbarung', href: '/formulare/instandhaltungsvereinbarung' },
      { id: 'schoenheitsreparaturen', title: 'Schönheitsreparaturen', href: '/formulare/schoenheitsreparaturen' },
    ]
  },
  {
    id: 'bescheinigungen',
    title: 'Bescheinigungen & Erlaubnisse',
    icon: Shield,
    formulare: [
      { id: 'selbstauskunft', title: 'Mieterselbstauskunft', href: '/formulare/selbstauskunft' },
      { id: 'wohnungsgeberbestaetigung', title: 'Wohnungsgeberbestätigung', href: '/formulare/wohnungsgeberbestaetigung' },
      { id: 'mietschuldenfreiheitsbescheinigung', title: 'Mietschuldenfreiheit', href: '/formulare/mietschuldenfreiheitsbescheinigung' },
      { id: 'hausordnung', title: 'Hausordnung', href: '/formulare/hausordnung' },
      { id: 'untervermietungserlaubnis', title: 'Untervermietungserlaubnis', href: '/formulare/untervermietungserlaubnis' },
      { id: 'mietbescheinigung', title: 'Mietbescheinigung', href: '/formulare/mietbescheinigung' },
      { id: 'tierhaltungserlaubnis', title: 'Tierhaltungserlaubnis', href: '/formulare/tierhaltungserlaubnis' },
    ]
  },
  {
    id: 'zahlungen',
    title: 'Zahlungen & Kaution',
    icon: CreditCard,
    formulare: [
      { id: 'sepa-lastschriftmandat', title: 'SEPA-Lastschriftmandat', href: '/formulare/sepa-lastschriftmandat' },
      { id: 'mahnung', title: 'Mahnung', href: '/formulare/mahnung' },
      { id: 'zahlungserinnerung', title: 'Zahlungserinnerung', href: '/formulare/zahlungserinnerung' },
      { id: 'mietrueckstand', title: 'Mietrückstand', href: '/formulare/mietrueckstand' },
      { id: 'kautionsabrechnung', title: 'Kautionsabrechnung', href: '/formulare/kautionsabrechnung' },
      { id: 'kautionsquittung', title: 'Kautionsquittung', href: '/formulare/kautionsquittung' },
      { id: 'kautionsrueckforderung', title: 'Kautionsrückforderung', href: '/formulare/kautionsrueckforderung' },
      { id: 'mietbuergschaft', title: 'Mietbürgschaft', href: '/formulare/mietbuergschaft' },
    ]
  },
  {
    id: 'sonstige',
    title: 'Weitere Dokumente',
    icon: FileText,
    formulare: [
      { id: 'nachtragsvereinbarung', title: 'Nachtragsvereinbarung', href: '/formulare/nachtragsvereinbarung' },
      { id: 'stellplatzvereinbarung', title: 'Stellplatzvereinbarung', href: '/formulare/stellplatzvereinbarung' },
      { id: 'vollmacht', title: 'Vollmacht Mietangelegenheiten', href: '/formulare/vollmacht' },
      { id: 'hausmeistervereinbarung', title: 'Hausmeistervereinbarung', href: '/formulare/hausmeistervereinbarung' },
      { id: 'mietvorvertrag', title: 'Mietvorvertrag', href: '/formulare/mietvorvertrag' },
      { id: 'bewerbungsschreiben', title: 'Bewerbungsschreiben', href: '/formulare/bewerbungsschreiben' },
      { id: 'verwaltervertrag', title: 'Verwaltervertrag', href: '/formulare/verwaltervertrag' },
      { id: 'bauliche-aenderung', title: 'Bauliche Änderungen', href: '/formulare/bauliche-aenderung' },
      { id: 'sondervereinbarung', title: 'Sondervereinbarung', href: '/formulare/sondervereinbarung' },
    ]
  },
]

// Highlight-Formulare für die Startseite
const highlightFormulare = [
  {
    id: 'mietvertrag',
    title: 'Mietvertrag Wohnraum',
    description: 'Vollständiger Wohnraummietvertrag mit allen wichtigen Klauseln',
    icon: FileSignature,
    href: '/formulare/mietvertrag',
    badge: 'Beliebt',
    badgeVariant: 'default' as const,
    features: ['6-Schritte-Wizard', 'KI-Unterstützung', 'PDF-Export']
  },
  {
    id: 'kuendigung',
    title: 'Kündigung Mietvertrag',
    description: 'Ordentliche und außerordentliche Kündigung für Mieter und Vermieter',
    icon: UserX,
    href: '/formulare/kuendigung',
    badge: 'Beliebt',
    badgeVariant: 'secondary' as const,
    features: ['Fristberechnung', 'Rechtssichere Formulierung']
  },
  {
    id: 'uebergabeprotokoll',
    title: 'Wohnungsübergabeprotokoll',
    description: 'Detailliertes Protokoll für Ein- und Auszug',
    icon: ClipboardList,
    href: '/formulare/uebergabeprotokoll',
    features: ['Raumweise Erfassung', 'Zählerstände', 'Fotos']
  },
  {
    id: 'betriebskosten',
    title: 'Betriebskostenabrechnung',
    description: 'Korrekte Abrechnung aller umlagefähigen Nebenkosten',
    icon: Euro,
    href: '/formulare/betriebskosten',
    features: ['17 Kostenarten', 'Automatische Berechnung']
  },
  {
    id: 'mieterhoehung',
    title: 'Mieterhöhungsverlangen',
    description: 'Formgerechte Mieterhöhung mit Begründung',
    icon: TrendingUp,
    href: '/formulare/mieterhoehung',
    features: ['Kappungsgrenze', 'Mietspiegel-Referenz']
  },
  {
    id: 'maengelanzeige',
    title: 'Mängelanzeige',
    description: 'Professionelle Meldung von Wohnungsmängeln',
    icon: AlertTriangle,
    href: '/formulare/maengelanzeige',
    features: ['Fristsetzung', 'Mietminderung']
  },
  {
    id: 'selbstauskunft',
    title: 'Mieterselbstauskunft',
    description: 'Standardisierte Selbstauskunft für Mietinteressenten',
    icon: Users,
    href: '/formulare/selbstauskunft',
    features: ['DSGVO-konform', 'Nur zulässige Fragen']
  },
  {
    id: 'untermietvertrag',
    title: 'Untermietvertrag',
    description: 'Rechtssicherer Vertrag für Untervermietung',
    icon: Key,
    href: '/formulare/untermietvertrag',
    features: ['Genehmigungsvorlage', 'Befristung']
  },
]

const rechner = [
  {
    id: 'mietpreis',
    title: 'Mietpreisrechner',
    description: 'Ortsübliche Vergleichsmiete ermitteln',
    icon: Building2,
    href: '/rechner/mietpreis',
  },
  {
    id: 'nebenkosten',
    title: 'Nebenkostenrechner',
    description: 'Monatliche Vorauszahlung kalkulieren',
    icon: Calculator,
    href: '/rechner/nebenkosten',
  },
  {
    id: 'kaution',
    title: 'Kautionsrechner',
    description: 'Maximale Kaution und Zinsen berechnen',
    icon: Euro,
    href: '/rechner/kaution',
  },
  {
    id: 'kuendigungsfrist',
    title: 'Kündigungsfrist-Rechner',
    description: 'Kündigungsfrist nach Wohndauer ermitteln',
    icon: FileText,
    href: '/rechner/kuendigungsfrist',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mietrecht Formulare</h1>
                <p className="text-sm text-muted-foreground">Professionell & rechtssicher</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/meine-dokumente">
                <Button variant="ghost">Meine Dokumente</Button>
              </Link>
              <Link to="/hilfe">
                <Button variant="ghost">Hilfe</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Mit KI-Unterstützung
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Mietrecht-Formulare einfach erstellen
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Professionelle Mietverträge, Kündigungen und mehr - rechtssicher und
            mit intelligenter Ausfüllhilfe. Schritt für Schritt zum fertigen Dokument.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/formulare/mietvertrag">
              <Button size="lg" className="gap-2">
                <FileSignature className="h-5 w-5" />
                Mietvertrag erstellen
              </Button>
            </Link>
            <a href="#alle-formulare">
              <Button size="lg" variant="outline">
                Alle Formulare ansehen
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Highlight Formulare Section */}
      <section id="formulare" className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">Beliebte Formulare</h3>
          <p className="text-muted-foreground">
            Die am häufigsten genutzten Mietrecht-Dokumente
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {highlightFormulare.map((formular) => (
            <Link key={formular.id} to={formular.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <formular.icon className="h-6 w-6 text-primary" />
                    </div>
                    {formular.badge && (
                      <Badge variant={formular.badgeVariant}>{formular.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{formular.title}</CardTitle>
                  <CardDescription>{formular.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {formular.features?.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Alle Formulare nach Kategorie */}
      <section id="alle-formulare" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">Alle 60 Formulare</h3>
          <p className="text-muted-foreground">
            Übersicht aller verfügbaren Mietrecht-Dokumente nach Kategorie
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kategorien.map((kategorie) => (
            <Card key={kategorie.id} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <kategorie.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{kategorie.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {kategorie.formulare.map((formular) => (
                    <Link
                      key={formular.id}
                      to={formular.href}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {formular.title}
                      </span>
                      {formular.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {formular.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rechner Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">Rechner & Tools</h3>
          <p className="text-muted-foreground">
            Praktische Rechner für wichtige Mietrecht-Berechnungen
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rechner.map((tool) => (
            <Link key={tool.id} to={tool.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="p-2 bg-secondary rounded-lg w-fit group-hover:bg-secondary/80 transition-colors">
                    <tool.icon className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-base">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-2">Warum unsere Formulare?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">KI-Unterstützung</h4>
            <p className="text-muted-foreground text-sm">
              Intelligente Ausfüllhilfe erklärt jedes Feld und schlägt passende Formulierungen vor
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileSignature className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Rechtssicher</h4>
            <p className="text-muted-foreground text-sm">
              Alle Formulare entsprechen der aktuellen Rechtsprechung und werden regelmäßig aktualisiert
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Professioneller PDF-Export</h4>
            <p className="text-muted-foreground text-sm">
              Fertige Dokumente im professionellen Layout zum Ausdrucken oder digitalen Versand
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Mietrecht Formulare. Alle Rechte vorbehalten.
            </div>
            <div className="flex gap-4 text-sm">
              <Link to="/impressum" className="text-muted-foreground hover:text-foreground">
                Impressum
              </Link>
              <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground">
                Datenschutz
              </Link>
              <Link to="/agb" className="text-muted-foreground hover:text-foreground">
                AGB
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
