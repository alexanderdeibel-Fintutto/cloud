import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Shield, ArrowRight, Scale, AlertTriangle, Wrench, Home,
  Euro, Ban, HardHat, Paintbrush, Search, Sparkles, FileWarning,
  CheckCircle2
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, useRecentTools, Breadcrumbs, RecentToolsWidget } from '@fintutto/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const checkers = [
  {
    title: 'Mietpreisbremse',
    description: 'Ist deine Miete zu hoch? Pruefe ob die Mietpreisbremse greift und wie viel du sparen kannst.',
    icon: Euro,
    href: '/checker/mietpreisbremse',
    gradient: 'from-red-500 to-rose-600',
    features: ['Mietpreisbremse \u00a7556d BGB', 'Ortsvergleich', 'Sparpotential berechnen'],
    popular: true,
    tag: 'Top-Checker',
    savings: 'bis 30%',
  },
  {
    title: 'Mieterhoehung',
    description: 'Ist die angekuendigte Mieterhoehung rechtmaessig? Pruefe Fristen und Grenzen.',
    icon: Scale,
    href: '/checker/mieterhoehung',
    gradient: 'from-blue-500 to-indigo-600',
    features: ['Kappungsgrenze pruefen', '\u00a7558 BGB', 'Widerspruchshilfe'],
    popular: true,
    tag: 'Beliebt',
    savings: 'bis 20%',
  },
  {
    title: 'Nebenkosten',
    description: 'Stimmt deine Nebenkostenabrechnung? Finde moegliche Fehler und Ungereimtheiten.',
    icon: FileWarning,
    href: '/checker/nebenkosten',
    gradient: 'from-green-500 to-emerald-600',
    features: ['17 Kostenarten', 'Fristenpruefung', 'Umlagefaehigkeit'],
    popular: false,
    savings: 'bis 500\u20ac',
  },
  {
    title: 'Betriebskosten',
    description: 'Pruefe deine Betriebskostenabrechnung auf formelle und inhaltliche Fehler.',
    icon: AlertTriangle,
    href: '/checker/betriebskosten',
    gradient: 'from-orange-500 to-amber-600',
    features: ['Formelle Pruefung', 'Inhaltliche Pruefung', 'Abrechnungsfrist'],
    popular: false,
  },
  {
    title: 'Kuendigung',
    description: 'Wurde dir gekuendigt? Pruefe ob die Kuendigung wirksam ist.',
    icon: Ban,
    href: '/checker/kuendigung',
    gradient: 'from-red-600 to-red-800',
    features: ['\u00a7573 BGB', 'Formvorschriften', 'Kuendigungsfristen'],
    popular: true,
    tag: 'Wichtig',
  },
  {
    title: 'Kaution',
    description: 'Probleme mit der Kaution? Pruefe Rueckzahlungsanspruch und Fristen.',
    icon: Euro,
    href: '/checker/kaution',
    gradient: 'from-purple-500 to-violet-600',
    features: ['\u00a7551 BGB', 'Verzinsung', 'Rueckzahlungsfrist'],
    popular: false,
  },
  {
    title: 'Mietminderung',
    description: 'Maengel in der Wohnung? Pruefe ob und wie viel du mindern darfst.',
    icon: Wrench,
    href: '/checker/mietminderung',
    gradient: 'from-amber-500 to-yellow-600',
    features: ['\u00a7536 BGB', 'Minderungsquoten', 'Mangelanzeige'],
    popular: false,
  },
  {
    title: 'Eigenbedarf',
    description: 'Eigenbedarfskuendigung erhalten? Pruefe ob sie rechtmaessig ist.',
    icon: Home,
    href: '/checker/eigenbedarf',
    gradient: 'from-indigo-500 to-blue-700',
    features: ['\u00a7573 Abs. 2 BGB', 'Begruendungspruefung', 'Haertefallpruefung'],
    popular: false,
  },
  {
    title: 'Modernisierung',
    description: 'Modernisierungsmassnahmen angekuendigt? Pruefe deine Rechte.',
    icon: HardHat,
    href: '/checker/modernisierung',
    gradient: 'from-teal-500 to-cyan-600',
    features: ['\u00a7559 BGB', 'Duldungspflicht', 'Mieterhoehung pruefen'],
    popular: false,
  },
  {
    title: 'Schoenheitsreparaturen',
    description: 'Musst du beim Auszug renovieren? Pruefe ob die Klausel wirksam ist.',
    icon: Paintbrush,
    href: '/checker/schoenheitsreparaturen',
    gradient: 'from-pink-500 to-fuchsia-600',
    features: ['Klauselpruefung', 'BGH-Rechtsprechung', 'Fristenplan'],
    popular: false,
  },
]

export default function CheckerPage() {
  useDocumentTitle('Mietrechts-Checker', 'Fintutto Portal')
  const { recentTools } = useRecentTools('portal')
  useMetaTags({
    title: 'Checker fuer Mieter - Fintutto Portal',
    description: '10 kostenlose Mietrechts-Checker: Mietpreisbremse, Mieterhoehung, Nebenkosten, Kuendigung und mehr.',
    path: '/checker',
  })

  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = checkers.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.features.some((f) => f.toLowerCase().includes(search.toLowerCase()))
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
      <section className="gradient-mieter py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="container relative">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'Checker' },
            ]}
            className="mb-6 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5 text-sm">
              <Shield className="h-4 w-4 text-white/70" />
              <span className="text-white/80 font-medium">{checkers.length} Checker verfuegbar</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Kenne deine Rechte
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              Pruefe Mieterhoehung, Kuendigung, Nebenkosten und mehr -
              basierend auf aktuellem deutschen Mietrecht.
            </p>
          </div>

          {/* Trust Stats */}
          <div className="mt-8 flex flex-wrap gap-6">
            {[
              { value: '10', label: 'Checker' },
              { value: '100%', label: 'kostenlos' },
              { value: 'BGB', label: 'basiert' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl font-black text-white">{s.value}</span>
                <span className="text-white/50 text-sm">{s.label}</span>
              </div>
            ))}
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
                placeholder="Checker suchen..."
                className="w-full pl-12 pr-16 py-4 glass rounded-2xl text-white placeholder:text-white/30 text-base focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/30 bg-white/10 px-2 py-1 rounded font-mono">
                /
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Checker Grid */}
      <section className="py-14">
        <div className="container">
          <RecentToolsWidget
            tools={recentTools}
            pathPrefix="/checker"
            renderLink={({ href, children }: { href: string; children: React.ReactNode }) => <Link key={href} to={href}>{children}</Link>}
          />

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Kein Checker gefunden fuer &quot;{search}&quot;</p>
              <button onClick={() => setSearch('')} className="text-primary mt-2 text-sm font-medium hover:underline">
                Suche zuruecksetzen
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children" role="list" aria-label="Verfuegbare Checker">
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
                      {item.savings && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          Spar {item.savings}
                        </span>
                      )}
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
                      Jetzt pruefen
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
