import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  FileSignature, ClipboardList, TrendingUp, Users, Receipt,
  ArrowRight, Download, Mail, Ban, AlertTriangle, FileCheck,
  Home, Wallet, Search, Sparkles, CheckCircle2, Printer
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, useRecentTools, Breadcrumbs, RecentToolsWidget } from '@fintutto/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const formulare = [
  {
    title: 'Mietvertrag',
    description: 'Rechtssicherer Mietvertrag fuer Wohnraum. Vollstaendig anpassbar mit allen wichtigen Klauseln.',
    icon: FileSignature,
    href: '/formulare/mietvertrag',
    gradient: 'from-purple-500 to-indigo-600',
    features: ['Wohnraummietvertrag', 'Index- oder Staffelmiete', 'Alle Pflichtangaben'],
    popular: true,
    tag: 'Beliebt',
    audience: 'Vermieter',
  },
  {
    title: 'Uebergabeprotokoll',
    description: 'Dokumentiere den Zustand der Wohnung bei Einzug und Auszug rechtssicher.',
    icon: ClipboardList,
    href: '/formulare/uebergabeprotokoll',
    gradient: 'from-blue-500 to-cyan-600',
    features: ['Raumweise Erfassung', 'Zaehlerstaende', 'Schluesseluebergabe'],
    popular: true,
    tag: 'Beliebt',
    audience: 'Beide',
  },
  {
    title: 'Mieterhoehungsschreiben',
    description: 'Korrekt formuliertes Mieterhoehungsschreiben nach \u00a7558 BGB.',
    icon: TrendingUp,
    href: '/formulare/mieterhoehung',
    gradient: 'from-orange-500 to-amber-600',
    features: ['\u00a7558 BGB konform', 'Begruendung inkl.', 'Zustimmungsfrist'],
    popular: false,
    audience: 'Vermieter',
  },
  {
    title: 'Selbstauskunft',
    description: 'Mieterselbstauskunft fuer Wohnungsinteressenten. DSGVO-konform.',
    icon: Users,
    href: '/formulare/selbstauskunft',
    gradient: 'from-green-500 to-emerald-600',
    features: ['DSGVO-konform', 'Einkommensnachweis', 'Schufa-Klausel'],
    popular: false,
    audience: 'Vermieter',
  },
  {
    title: 'Betriebskostenabrechnung',
    description: 'Erstelle eine korrekte Betriebskostenabrechnung fuer deine Mieter.',
    icon: Receipt,
    href: '/formulare/betriebskosten',
    gradient: 'from-teal-500 to-cyan-600',
    features: ['17 Kostenarten', 'Umlageschluessel', 'Vorauszahlungen'],
    popular: false,
    audience: 'Vermieter',
  },
  {
    title: 'Kuendigungsschreiben',
    description: 'Rechtssichere Kuendigung fuer Mieter oder Vermieter nach \u00a7573/\u00a7543 BGB.',
    icon: Ban,
    href: '/formulare/kuendigung',
    gradient: 'from-red-500 to-rose-600',
    features: ['Mieter & Vermieter', 'Ordentlich & Ausserordentlich', '\u00a7573/\u00a7543 BGB'],
    popular: true,
    tag: 'Wichtig',
    audience: 'Beide',
  },
  {
    title: 'Mahnschreiben',
    description: 'Von Zahlungserinnerung bis letzte Mahnung - mit Mahngebuehr und Fristsetzung.',
    icon: AlertTriangle,
    href: '/formulare/mahnung',
    gradient: 'from-amber-500 to-yellow-600',
    features: ['4 Mahnstufen', 'Mahngebuehr', 'Bankverbindung'],
    popular: false,
    audience: 'Vermieter',
  },
  {
    title: 'Mietbescheinigung',
    description: 'Offizielle Bestaetigung des Mietverhaeltnisses fuer Behoerden, Banken oder neue Vermieter.',
    icon: FileCheck,
    href: '/formulare/mietbescheinigung',
    gradient: 'from-indigo-500 to-violet-600',
    features: ['Zahlungsverhalten', 'Mietkosten', 'Mehrere Zwecke'],
    popular: false,
    audience: 'Vermieter',
  },
  {
    title: 'Wohnungsgeberbestaetigung',
    description: 'Pflichtdokument nach \u00a719 BMG fuer die Anmeldung beim Einwohnermeldeamt.',
    icon: Home,
    href: '/formulare/wohnungsgeberbestaetigung',
    gradient: 'from-pink-500 to-fuchsia-600',
    features: ['\u00a719 BMG konform', 'Ein- & Auszug', 'Mehrere Personen'],
    popular: true,
    tag: 'Pflicht',
    audience: 'Vermieter',
  },
  {
    title: 'Nebenkostenvorauszahlung',
    description: 'Anpassungsschreiben fuer die monatliche Nebenkostenvorauszahlung nach \u00a7560 BGB.',
    icon: Wallet,
    href: '/formulare/nebenkostenvorauszahlung',
    gradient: 'from-emerald-500 to-green-600',
    features: ['\u00a7560 BGB konform', '8 Kostenarten', 'Vergleichsuebersicht'],
    popular: false,
    audience: 'Vermieter',
  },
]

type Filter = 'alle' | 'Vermieter' | 'Mieter' | 'Beide'

export default function FormularePage() {
  useDocumentTitle('Formulare & Vorlagen', 'Fintutto Portal')
  const { recentTools } = useRecentTools('portal')
  useMetaTags({
    title: 'Formulare & Vorlagen - Fintutto Portal',
    description: '10 rechtssichere Formulare: Mietvertrag, Uebergabeprotokoll, Betriebskostenabrechnung, Kuendigung und mehr.',
    path: '/formulare',
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('alle')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = formulare.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.features.some((feat) => feat.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === 'alle' || f.audience === filter || f.audience === 'Beide'
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const filters: { label: string; value: Filter }[] = [
    { label: 'Alle', value: 'alle' },
    { label: 'Vermieter', value: 'Vermieter' },
    { label: 'Mieter', value: 'Mieter' },
    { label: 'Beide', value: 'Beide' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="container relative">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'Formulare' },
            ]}
            className="mb-6 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5 text-sm">
              <FileSignature className="h-4 w-4 text-white/70" />
              <span className="text-white/80 font-medium">{formulare.length} Formulare verfuegbar</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Formulare & Vorlagen
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              10 rechtssichere Dokumente fuer Mieter & Vermieter.
              Ausfuellen, drucken, fertig.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Formular suchen..."
                className="w-full pl-12 pr-16 py-4 glass rounded-2xl text-white placeholder:text-white/30 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 bg-white/10 px-2 py-1 rounded font-mono">
                /
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Download, label: 'PDF-Export' },
              { icon: Printer, label: 'Drucken' },
              { icon: Mail, label: 'Per E-Mail versenden' },
              { icon: FileSignature, label: 'Digital unterschreiben' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-muted-foreground">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-14">
        <div className="container">
          <RecentToolsWidget
            tools={recentTools}
            pathPrefix="/formulare"
            renderLink={({ href, children }) => <Link key={href} to={href}>{children}</Link>}
          />

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Kein Formular gefunden</p>
              <button
                onClick={() => { setSearch(''); setFilter('alle') }}
                className="text-primary mt-2 text-sm font-medium hover:underline"
              >
                Filter zuruecksetzen
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children" role="list" aria-label="Verfuegbare Formulare">
            {filtered.map((item) => (
              <Link key={item.title} to={item.href} aria-label={`${item.title} - ${item.description}`} role="listitem">
                <div className="tool-card h-full group">
                  {item.popular && item.tag && (
                    <div className={`bg-gradient-to-r ${item.gradient} text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 text-center`}>
                      {item.tag}
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        item.audience === 'Beide'
                          ? 'bg-purple-50 text-purple-600'
                          : item.audience === 'Mieter'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.audience}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-5">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="text-primary font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all text-sm">
                      Formular oeffnen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
