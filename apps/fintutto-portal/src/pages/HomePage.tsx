import { Link } from 'react-router-dom'
import {
  Calculator, Shield, FileText, ArrowRight, CheckCircle2,
  Home, TrendingUp, Euro, PiggyBank, Receipt,
 claude/improve-app-integration-k7JF2
  Scale, AlertTriangle, Wrench, Sparkles, Building2

  Scale, AlertTriangle, Wrench, Sparkles, ExternalLink,
  Building2, Key, Gauge, BarChart3, Zap, Users,
  Star, Gift, Lock, Globe, ChevronRight
 main
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProperties } from '@/hooks/useProperties'
import { getOtherApps, useDocumentTitle, useRecentTools, useMetaTags, AnnouncementBanner } from '@fintutto/shared'

const ecosystemApps = [
  {
    name: 'Vermietify',
    tagline: 'Die komplette Immobilienverwaltung',
    description: 'Gebäude, Mieter, Verträge, Zahlungen, Dokumente – alles in einer App. Mit 69 Formularen, automatischer Nebenkostenabrechnung und KI-Assistent.',
    icon: Building2,
    emoji: '🏠',
    url: 'https://vermietify.vercel.app',
    audience: 'Für Vermieter',
    gradient: 'from-blue-600 to-cyan-500',
    highlights: ['69 Formulare', 'Nebenkostenabrechnung', 'KI-Assistent', 'Dokumenten-Archiv'],
    preview: {
      stats: [
        { label: 'Immobilien', value: '12' },
        { label: 'Mieter', value: '34' },
        { label: 'Einnahmen', value: '€18.400' },
      ],
    },
  },
  {
    name: 'Mieter-App',
    tagline: 'Dein digitaler Mieter-Assistent',
    description: 'Mängel melden, Zähler ablesen, Dokumente anfordern und direkt mit der Hausverwaltung chatten. Mit 10 Rechts-Checkern für deine Mietrechte.',
    icon: Key,
    emoji: '🔑',
    url: 'https://mieter.fintutto.cloud',
    audience: 'Für Mieter',
    gradient: 'from-green-600 to-emerald-500',
    highlights: ['Mängel melden', 'Live-Chat', '10 Rechts-Checker', 'KI-Assistent'],
    preview: {
      stats: [
        { label: 'Checker', value: '10' },
        { label: 'Chat', value: 'Live' },
        { label: 'KI', value: 'Ja' },
      ],
    },
  },
  {
    name: 'HausmeisterPro',
    tagline: 'Facility Management leicht gemacht',
    description: 'Aufgaben verwalten, Belege fotografieren, mit Eigentümern kommunizieren. Die digitale Zentrale für Hausmeister und Facility Manager.',
    icon: Wrench,
    emoji: '🔧',
    url: 'https://hausmeister-pro.vercel.app',
    audience: 'Für Facility Manager',
    gradient: 'from-orange-500 to-amber-500',
    highlights: ['Aufgaben-Tracking', 'Foto-Belege', 'Live-Chat', 'Material-Management'],
    preview: {
      stats: [
        { label: 'Aufgaben', value: '∞' },
        { label: 'Chat', value: 'Live' },
        { label: 'Belege', value: 'Foto' },
      ],
    },
  },
  {
    name: 'Ablesung',
    tagline: 'Zählerstand-Erfassung digitalisiert',
    description: 'Strom, Gas, Wasser, Heizung – alle Zählerstände digital erfassen, tracken und analysieren. Mit Verbrauchsanalyse und CSV-Import.',
    icon: BarChart3,
    emoji: '📊',
    url: 'https://ablesung.vercel.app',
    audience: 'Für Vermieter',
    gradient: 'from-teal-500 to-cyan-500',
    highlights: ['4+ Zählertypen', 'Verbrauchsanalyse', 'CSV-Import', 'Vermietify-Anbindung'],
    preview: {
      stats: [
        { label: 'Zähler', value: '4+' },
        { label: 'Analyse', value: 'Ja' },
        { label: 'Import', value: 'CSV' },
      ],
    },
  },
  {
    name: 'BescheidBoxer',
    tagline: 'Bescheide verstehen & anfechten',
    description: 'Lade deinen Bescheid hoch und lass ihn von KI analysieren. Grundsteuer, Nebenkosten, Betriebskostenabrechnungen – finde versteckte Fehler und spare Geld.',
    icon: Zap,
    emoji: '🥊',
    url: 'https://bescheidboxer.vercel.app',
    audience: 'Für alle',
    gradient: 'from-red-500 to-rose-500',
    highlights: ['KI-Analyse', '5+ Bescheid-Typen', 'Auto-Widerspruch', 'Ersparnis-Rechner'],
    badge: 'Neu',
    preview: {
      stats: [
        { label: 'Typen', value: '5+' },
        { label: 'KI', value: 'Ja' },
        { label: 'Widerspruch', value: 'Auto' },
      ],
    },
  },
  {
    name: 'Portal',
    tagline: '28+ Rechner, Checker & Formulare',
    description: 'Alle Mietrecht-Tools an einem Ort: 7 Vermieter-Rechner, 10 Mieter-Checker und 10 rechtssichere Formulare. Basierend auf aktuellem deutschen Mietrecht.',
    icon: Sparkles,
    emoji: '✨',
    url: '/rechner',
    audience: 'Für Mieter & Vermieter',
    gradient: 'from-purple-600 to-indigo-600',
    highlights: ['7 Rechner', '10 Checker', '10 Formulare', 'PDF-Export'],
    badge: 'Du bist hier',
    preview: {
      stats: [
        { label: 'Tools', value: '28+' },
        { label: 'DSGVO', value: '100%' },
        { label: 'Bundesländer', value: '16' },
      ],
    },
  },
]

const categories = [
  {
    title: 'Rechner',
    subtitle: 'Für Vermieter',
    description: 'Kaufnebenkosten, Rendite, Mieterhöhung, Grundsteuer, Kaution und mehr – professionell berechnen.',
    icon: Calculator,
    href: '/rechner',
    gradient: 'gradient-card-left',
    count: 7,
    tools: ['Kaufnebenkosten', 'Mietrendite', 'Mieterhöhung', 'Grundsteuer', 'Kaution', 'Eigenkapital', 'Nebenkosten'],
  },
  {
    title: 'Checker',
    subtitle: 'Für Mieter',
    description: 'Mietpreisbremse, Kündigung, Nebenkosten, Kaution, Eigenbedarf – kenne deine Rechte.',
    icon: Shield,
    href: '/checker',
    gradient: 'gradient-card-center',
    count: 10,
    tools: ['Mietpreisbremse', 'Mieterhöhung', 'Nebenkosten', 'Kündigung', 'Kaution', 'Mietminderung'],
  },
  {
    title: 'Formulare',
    subtitle: 'Für alle',
    description: 'Mietvertrag, Übergabeprotokoll, Kündigung, Mahnung – rechtssicher generieren.',
    icon: FileText,
    href: '/formulare',
    gradient: 'gradient-card-right',
    count: 10,
    tools: ['Mietvertrag', 'Übergabeprotokoll', 'Kündigung', 'Mahnung', 'Mietbescheinigung', 'Selbstauskunft'],
  },
]

const stats = [
  { value: '6', label: 'Apps', icon: Globe },
  { value: '28+', label: 'Tools', icon: Wrench },
  { value: '16', label: 'Bundesländer', icon: Building2 },
  { value: '100%', label: 'DSGVO-konform', icon: Lock },
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
      <section className="bg-firma py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,164,148,0.1),transparent_50%)]" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/10">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                6 Apps · 28+ Tools · 1 Ökosystem
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Dein Mietrecht-
              <span className="block bg-gradient-to-r from-white via-[#e8a494] to-[#c07888] bg-clip-text text-transparent">
                Ökosystem
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto font-light">
              Von der Wohnungssuche bis zur Nebenkostenabrechnung.
            </p>
            <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
              6 spezialisierte Apps, 28+ professionelle Tools – für Mieter, Vermieter,
              Hausmeister und Hausverwaltungen. Alle verbunden. Alle kostenlos starten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 text-base px-8 h-12" asChild>
                <Link to="/rechner">
                  <Calculator className="h-5 w-5 mr-2" />
                  Tools entdecken
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12" asChild>
                <Link to="/apps">
                  <Globe className="h-5 w-5 mr-2" />
                  Alle 6 Apps ansehen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-border bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3 py-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="text-xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground ml-1.5">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 claude/improve-app-integration-k7JF2
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

      {/* Portal-Tools: Rechner, Checker, Formulare */}
      <section className="py-20">
 main
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Portal-Tools
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Alles was du brauchst – direkt hier
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ob Mieter oder Vermieter – 28+ professionelle Rechner, Checker und Formulare
              basierend auf aktuellem deutschen Mietrecht.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link key={cat.title} to={cat.href} className="group">
                <Card className="h-full hover:shadow-2xl hover:border-primary/20 transition-all duration-300 overflow-hidden border-2">
                  <div className={`${cat.gradient} p-8`}>
                    <div className="flex items-center gap-3 mb-2">
                      <cat.icon className="h-8 w-8 text-white" />
                      <span className="text-white/60 text-sm font-medium">{cat.subtitle}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{cat.title}</h3>
                    <p className="text-white/60 text-sm">{cat.count} Tools verfügbar</p>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{cat.description}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {cat.tools.slice(0, 4).map((tool) => (
                        <span key={tool} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                          {tool}
                        </span>
                      ))}
                      {cat.tools.length > 4 && (
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                          +{cat.tools.length - 4} mehr
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                      Alle {cat.title} ansehen
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

 claude/improve-app-integration-k7JF2
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

      {/* Ökosystem – App-Vorschauen */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Das Ökosystem
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              6 Apps für jeden Schritt im Mietalltag
            </h2>
          </div>

          {/* Ecosystem Story */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Das Fintutto Ökosystem verbindet alle Akteure im Mietverhältnis:
              <strong className="text-foreground"> Vermieter</strong> verwalten Immobilien mit Vermietify,
              <strong className="text-foreground"> Mieter</strong> melden Mängel über die Mieter-App,
              <strong className="text-foreground"> Hausmeister</strong> bearbeiten Aufträge mit HausmeisterPro,
              und <strong className="text-foreground"> Zählerstände</strong> werden digital mit Ablesung erfasst.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Der BescheidBoxer analysiert Bescheide per KI und das Portal bietet 28+ Rechner, Checker
              und Formulare. Ein Konto – alle Apps. Alle Daten fließen nahtlos zusammen.
            </p>
          </div>

          {/* App Preview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemApps.map((app) => (
              <a
                key={app.name}
                href={app.url.startsWith('/') ? undefined : app.url}
                target={app.url.startsWith('/') ? undefined : '_blank'}
                rel={app.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                className="group"
              >
                {app.url.startsWith('/') ? (
                  <Link to={app.url} className="block">
                    <AppPreviewCard app={app} />
                  </Link>
                ) : (
                  <AppPreviewCard app={app} />
                )}
 main
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/apps">
                Alle Apps im Detail
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Warum Fintutto? */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Warum Fintutto?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deutsches Mietrecht ist komplex. Wir machen es einfach, digital und für jeden zugänglich.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Ein Konto – alle Apps',
                desc: 'Melde dich einmal an und nutze alle 6 Fintutto-Apps. Deine Daten sind überall verfügbar.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Lock,
                title: '100% DSGVO-konform',
                desc: 'Alle Daten werden in Deutschland verarbeitet. Kein Tracking, kein Verkauf an Dritte.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Star,
                title: 'Kostenlos starten',
                desc: 'Jede App bietet einen kostenlosen Plan. Upgrade nur, wenn du mehr brauchst.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                icon: Gift,
                title: 'Empfehlen & sparen',
                desc: 'Mit dem Referral-Programm verdienst du Bonus-Credits für jede Empfehlung.',
                color: 'bg-purple-100 text-purple-600',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} mx-auto mb-4`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section className="py-16 gradient-portal">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              So arbeiten die Apps zusammen
            </h2>
            <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">
              Ein Beispiel: Ein Mieter meldet einen Wasserschaden – und alle Apps greifen nahtlos ineinander.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: '1', app: 'Mieter-App', action: 'Mangel melden', emoji: '🔑' },
                { step: '2', app: 'Vermietify', action: 'Auftrag erstellen', emoji: '🏠' },
                { step: '3', app: 'HausmeisterPro', action: 'Reparatur ausführen', emoji: '🔧' },
                { step: '4', app: 'Ablesung', action: 'Zähler prüfen', emoji: '📊' },
                { step: '5', app: 'Portal', action: 'Kosten berechnen', emoji: '✨' },
              ].map((item, i) => (
                <div key={item.step} className="text-center">
                  <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-5 mb-3 hover:bg-white/15 transition-colors">
                    <span className="text-3xl mb-2 block">{item.emoji}</span>
                    <div className="text-white font-semibold text-sm">{item.app}</div>
                    <div className="text-white/50 text-xs mt-1">{item.action}</div>
                  </div>
                  {i < 4 && (
                    <ChevronRight className="h-5 w-5 text-white/30 mx-auto hidden md:block rotate-0 mt-[-52px] ml-[calc(100%+4px)]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit loszulegen?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Starte kostenlos mit einem beliebigen Tool. Kein Abo nötig, keine Kreditkarte – einfach loslegen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-portal text-white border-0 text-base px-8 h-12" asChild>
              <Link to="/rechner">
                <Calculator className="h-5 w-5 mr-2" />
                Rechner starten
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
              <Link to="/checker">
                <Shield className="h-5 w-5 mr-2" />
                Rechte prüfen
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" asChild>
              <Link to="/formulare">
                <FileText className="h-5 w-5 mr-2" />
                Formulare erstellen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function AppPreviewCard({ app }: { app: typeof ecosystemApps[0] }) {
  return (
    <Card className="h-full overflow-hidden border-2 hover:border-primary/20 hover:shadow-2xl transition-all duration-300">
      {/* Mini App Header */}
      <div className={`bg-gradient-to-r ${app.gradient} p-5 relative`}>
        {app.badge && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            {app.badge}
          </span>
        )}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{app.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{app.name}</h3>
            <p className="text-white/60 text-xs">{app.audience}</p>
          </div>
        </div>
        <p className="text-white/80 text-sm font-medium">{app.tagline}</p>
      </div>

      {/* Mini Preview / Stats */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
          {app.preview.stats.map((stat) => (
            <div key={stat.label} className="text-center flex-1">
              <div className="font-bold text-base">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-muted-foreground text-xs mb-4 line-clamp-2 leading-relaxed">
          {app.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {app.highlights.map((h) => (
            <span key={h} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 gap-1 transition-all">
          {app.url.startsWith('/') ? 'Öffnen' : 'App besuchen'}
          <ExternalLink className="h-3.5 w-3.5" />
        </div>
      </CardContent>
    </Card>
  )
}
