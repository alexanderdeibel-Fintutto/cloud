import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Calculator, TrendingUp, Euro, Home, PiggyBank, Receipt,
  ArrowRight, Search, Landmark, Sparkles, BarChart3
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, useRecentTools, Breadcrumbs, RecentToolsWidget } from '@fintutto/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const rechner = [
  {
    title: 'Kautions-Rechner',
    description: 'Berechne die maximale zulaessige Kaution nach \u00a7551 BGB. Maximal 3 Nettokaltmieten.',
    icon: PiggyBank,
    href: '/rechner/kaution',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradient: 'from-purple-500 to-indigo-500',
    features: ['Max. 3 Monatsmieten', 'Ratenzahlung berechnen', '\u00a7551 BGB konform'],
    popular: true,
    tag: 'Beliebt',
  },
  {
    title: 'Mieterhoehungs-Rechner',
    description: 'Berechne die zulaessige Mieterhoehung nach \u00a7558 BGB mit Kappungsgrenze.',
    icon: TrendingUp,
    href: '/rechner/mieterhoehung',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Kappungsgrenze 15-20%', 'Ortsuebliche Vergleichsmiete', '\u00a7558 BGB konform'],
    popular: true,
    tag: 'Beliebt',
  },
  {
    title: 'Kaufnebenkosten-Rechner',
    description: 'Berechne alle Nebenkosten beim Immobilienkauf: Grunderwerbsteuer, Notar, Makler.',
    icon: Euro,
    href: '/rechner/kaufnebenkosten',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Alle 16 Bundeslaender', 'Notar & Grundbuch', 'Maklerkosten'],
    popular: false,
  },
  {
    title: 'Eigenkapital-Rechner',
    description: 'Wie viel Eigenkapital brauchst du fuer deine Immobilie? Berechne es hier.',
    icon: Home,
    href: '/rechner/eigenkapital',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Kaufnebenkosten inkl.', 'Finanzierungsquote', 'Empfehlung'],
    popular: false,
  },
  {
    title: 'Rendite-Rechner',
    description: 'Berechne Brutto- und Netto-Rendite, Cashflow und Eigenkapitalrendite.',
    icon: BarChart3,
    href: '/rechner/rendite',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    gradient: 'from-indigo-500 to-violet-500',
    features: ['Brutto-/Nettorendite', 'Cashflow-Analyse', 'EK-Rendite'],
    popular: false,
  },
  {
    title: 'Grundsteuer-Rechner',
    description: 'Berechne die Grundsteuer nach dem neuen Bundesmodell fuer alle 16 Bundeslaender.',
    icon: Landmark,
    href: '/rechner/grundsteuer',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Bundesmodell 2025', 'Alle 16 Laender', 'Hebesatz-Vergleich'],
    popular: false,
  },
  {
    title: 'Nebenkosten-Rechner',
    description: 'Erstelle eine korrekte Nebenkostenabrechnung fuer deine Mieter.',
    icon: Receipt,
    href: '/rechner/nebenkosten',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    gradient: 'from-rose-500 to-pink-500',
    features: ['Umlageschluessel', 'Vorauszahlungen', 'Abrechnungszeitraum'],
    popular: false,
  },
]

export default function RechnerPage() {
  useDocumentTitle('Rechner', 'Fintutto Portal')
  const { recentTools } = useRecentTools('portal')
  useMetaTags({
    title: 'Rechner fuer Vermieter - Fintutto Portal',
    description: '7 professionelle Rechner fuer Vermieter: Kaution, Mieterhoehung, Kaufnebenkosten, Rendite, Grundsteuer und mehr.',
    path: '/rechner',
  })

  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = rechner.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.features.some((f) => f.toLowerCase().includes(search.toLowerCase()))
  )

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

  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="container relative">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'Rechner' },
            ]}
            className="mb-6 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5 text-sm">
              <Calculator className="h-4 w-4 text-white/70" />
              <span className="text-white/80 font-medium">{rechner.length} Rechner verfuegbar</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Rechner fuer Vermieter
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              Professionelle Berechnungen fuer alle Vermieterthemen.
              Rechtssicher, praezise und kostenlos.
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
                placeholder="Rechner suchen..."
                className="w-full pl-12 pr-16 py-4 glass rounded-2xl text-white placeholder:text-white/30 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 bg-white/10 px-2 py-1 rounded font-mono">
                /
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Rechner Grid */}
      <section className="py-14">
        <div className="container">
          <RecentToolsWidget
            tools={recentTools}
            pathPrefix="/rechner"
            renderLink={({ href, children }) => <Link key={href} to={href}>{children}</Link>}
          />

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Kein Rechner gefunden fuer &quot;{search}&quot;</p>
              <button onClick={() => setSearch('')} className="text-primary mt-2 text-sm font-medium hover:underline">
                Suche zuruecksetzen
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children" role="list" aria-label="Verfuegbare Rechner">
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
                      <Sparkles className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-5">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="text-primary font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all text-sm">
                      Jetzt berechnen
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
