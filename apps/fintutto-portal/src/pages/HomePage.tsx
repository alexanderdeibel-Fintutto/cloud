import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Calculator, Shield, FileText, ArrowRight, CheckCircle2,
  Home, TrendingUp, Euro, PiggyBank, Receipt,
  Scale, AlertTriangle, Wrench, Sparkles, ExternalLink,
  Building2, Key, Gauge, BarChart3, Zap, Users,
  Star, Gift, Lock, Globe, ChevronRight, Search,
  Brain, Wallet, GraduationCap, LineChart, Landmark,
  ArrowUpRight, MousePointerClick, Layers, CreditCard
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProperties } from '@/hooks/useProperties'
import { getOtherApps, useDocumentTitle, useRecentTools, useMetaTags, AnnouncementBanner, EcosystemStatsBar } from '@fintutto/shared'

/* ============================
   ANIMATED COUNTER HOOK
   ============================ */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!startOnView) {
      setCount(end)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          const startTime = performance.now()
          const tick = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, startOnView])

  return { count, ref }
}

/* ============================
   REVEAL ON SCROLL HOOK
   ============================ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ============================
   DATA
   ============================ */
const ecosystemApps = [
  {
    name: 'Vermietify',
    tagline: 'Die komplette Immobilienverwaltung',
    description: 'Gebaude, Mieter, Vertrage, Zahlungen, Dokumente - alles in einer App.',
    icon: Building2,
    url: 'https://vermietify.vercel.app',
    audience: 'Vermieter',
    gradient: 'from-blue-600 to-cyan-500',
    color: 'blue',
    stats: { primary: '69', label: 'Formulare' },
  },
  {
    name: 'Mieter-App',
    tagline: 'Dein digitaler Mieter-Assistent',
    description: 'Mangel melden, Zahler ablesen, Dokumente anfordern und direkt chatten.',
    icon: Key,
    url: 'https://mieter.fintutto.cloud',
    audience: 'Mieter',
    gradient: 'from-green-600 to-emerald-500',
    color: 'green',
    stats: { primary: '10', label: 'Checker' },
  },
  {
    name: 'HausmeisterPro',
    tagline: 'Facility Management leicht gemacht',
    description: 'Aufgaben verwalten, Belege fotografieren, mit Eigentumern kommunizieren.',
    icon: Wrench,
    url: 'https://hausmeister-pro.vercel.app',
    audience: 'Facility',
    gradient: 'from-orange-500 to-amber-500',
    color: 'orange',
    stats: { primary: 'Live', label: 'Chat' },
  },
  {
    name: 'Ablesung',
    tagline: 'Zahlerstand-Erfassung digitalisiert',
    description: 'Strom, Gas, Wasser, Heizung - alle Zahlerstande digital erfassen.',
    icon: BarChart3,
    url: 'https://ablesung.vercel.app',
    audience: 'Alle',
    gradient: 'from-teal-500 to-cyan-500',
    color: 'teal',
    stats: { primary: 'OCR', label: 'KI-Scan' },
  },
  {
    name: 'BescheidBoxer',
    tagline: 'Bescheide verstehen & anfechten',
    description: 'Bescheid hochladen, KI analysieren lassen, versteckte Fehler finden.',
    icon: Zap,
    url: 'https://bescheidboxer.vercel.app',
    audience: 'Alle',
    gradient: 'from-red-500 to-rose-500',
    color: 'red',
    stats: { primary: 'KI', label: 'Analyse' },
  },
  {
    name: 'Fintutto Biz',
    tagline: 'Geschaftskonto & Buchhaltung',
    description: 'Freelancer-OS: Rechnungen, Ausgaben, Steuern - alles in einer App.',
    icon: Landmark,
    url: 'https://biz.fintutto.cloud',
    audience: 'Business',
    gradient: 'from-emerald-600 to-green-500',
    color: 'emerald',
    stats: { primary: 'Neu', label: '2026' },
    badge: 'Neu',
  },
]

const portalTools = [
  {
    category: 'Rechner',
    subtitle: 'Fur Vermieter',
    icon: Calculator,
    href: '/rechner',
    gradient: 'gradient-card-left',
    glassGradient: 'from-purple-500/20 to-indigo-500/10',
    count: 7,
    tools: [
      { name: 'Kaufnebenkosten', icon: Euro, href: '/rechner/kaufnebenkosten' },
      { name: 'Mietrendite', icon: TrendingUp, href: '/rechner/rendite' },
      { name: 'Mieterhoehung', icon: Scale, href: '/rechner/mieterhoehung' },
      { name: 'Grundsteuer', icon: Landmark, href: '/rechner/grundsteuer' },
      { name: 'Kaution', icon: PiggyBank, href: '/rechner/kaution' },
      { name: 'Eigenkapital', icon: Home, href: '/rechner/eigenkapital' },
      { name: 'Nebenkosten', icon: Receipt, href: '/rechner/nebenkosten' },
    ],
  },
  {
    category: 'Checker',
    subtitle: 'Fur Mieter',
    icon: Shield,
    href: '/checker',
    gradient: 'gradient-card-center',
    glassGradient: 'from-fuchsia-500/20 to-purple-500/10',
    count: 10,
    tools: [
      { name: 'Mietpreisbremse', icon: Euro, href: '/checker/mietpreisbremse' },
      { name: 'Mieterhoehung', icon: Scale, href: '/checker/mieterhoehung' },
      { name: 'Nebenkosten', icon: AlertTriangle, href: '/checker/nebenkosten' },
      { name: 'Kuendigung', icon: AlertTriangle, href: '/checker/kuendigung' },
      { name: 'Kaution', icon: PiggyBank, href: '/checker/kaution' },
      { name: 'Mietminderung', icon: Wrench, href: '/checker/mietminderung' },
    ],
  },
  {
    category: 'Formulare',
    subtitle: 'Fur alle',
    icon: FileText,
    href: '/formulare',
    gradient: 'gradient-card-right',
    glassGradient: 'from-rose-500/20 to-orange-500/10',
    count: 10,
    tools: [
      { name: 'Mietvertrag', icon: FileText, href: '/formulare/mietvertrag' },
      { name: 'Uebergabeprotokoll', icon: FileText, href: '/formulare/uebergabeprotokoll' },
      { name: 'Kuendigung', icon: FileText, href: '/formulare/kuendigung' },
      { name: 'Mahnung', icon: AlertTriangle, href: '/formulare/mahnung' },
      { name: 'Mietbescheinigung', icon: FileText, href: '/formulare/mietbescheinigung' },
      { name: 'Selbstauskunft', icon: Users, href: '/formulare/selbstauskunft' },
    ],
  },
]

const fintechModules = [
  {
    name: 'Finance Coach',
    description: 'KI-gestuetztes Budget-Management, Bank-Sync und personalisierte Finanz-Insights.',
    icon: Brain,
    gradient: 'from-indigo-600 to-violet-600',
    status: 'Bald verfuegbar',
    features: ['KI-Insights', 'Bank-Sync', 'Budget-Tracker', 'Cashflow-Forecast'],
    score: '33/40',
  },
  {
    name: 'Fintutto Biz',
    description: 'Das Freelancer Finance OS: Rechnungen, Ausgaben, Steuern und DATEV-Export.',
    icon: Wallet,
    gradient: 'from-emerald-600 to-teal-600',
    status: 'In Entwicklung',
    features: ['Rechnungen', 'Ausgaben-Tracker', 'Steuer-Export', 'DATEV-Anbindung'],
    score: '37/40',
  },
  {
    name: 'Finance Mentor',
    description: 'Gamifizierte Finanz-Education mit Quizzes, Lernpfaden und Zertifikaten.',
    icon: GraduationCap,
    gradient: 'from-amber-500 to-orange-600',
    status: 'Phase 2',
    features: ['Lernpfade', 'Quizzes', 'Zertifikate', 'KI-Tutor'],
    score: '31/40',
  },
]

const workflowSteps = [
  { step: '1', app: 'Mieter-App', action: 'Mangel melden', icon: Key, color: 'from-green-500 to-emerald-500' },
  { step: '2', app: 'Vermietify', action: 'Auftrag erstellen', icon: Building2, color: 'from-blue-500 to-cyan-500' },
  { step: '3', app: 'HausmeisterPro', action: 'Reparatur ausfuehren', icon: Wrench, color: 'from-orange-500 to-amber-500' },
  { step: '4', app: 'Ablesung', action: 'Zahler pruefen', icon: BarChart3, color: 'from-teal-500 to-cyan-500' },
  { step: '5', app: 'Portal', action: 'Kosten berechnen', icon: Calculator, color: 'from-purple-500 to-indigo-500' },
]

/* ============================
   MAIN COMPONENT
   ============================ */
export default function HomePage() {
  useDocumentTitle('Rechner, Checker & Formulare', 'Fintutto Portal')
  useMetaTags({
    title: 'Fintutto Portal - Dein Mietrecht-Oekosystem',
    description: 'Kostenlose Tools fuer Mieter und Vermieter: 7 Rechner, 10 Checker, 10 Formulare. Basierend auf aktuellem deutschen Mietrecht.',
    path: '/',
  })
  const { user } = useAuth()
  const { properties, hasProperties } = useProperties()
  const { recentTools } = useRecentTools('portal')

  const totalUnits = properties.reduce((sum, b) => sum + b.units.length, 0)
  const rentedUnits = properties.reduce(
    (sum, b) => sum + b.units.filter((u) => u.status === 'rented').length, 0
  )

  const statsRef1 = useCounter(6)
  const statsRef2 = useCounter(28)
  const statsRef3 = useCounter(16)

  const revealTools = useReveal()
  const revealEcosystem = useReveal()
  const revealFintech = useReveal()
  const revealWorkflow = useReveal()
  const revealWhy = useReveal()

  return (
    <div className="overflow-hidden">
      {/* ==================== HERO ==================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-portal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,164,148,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(107,58,128,0.3),transparent_60%)]" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-rose-500/8 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl animate-pulse-glow" />

        {/* Floating Tool Icons */}
        <div className="absolute top-[18%] left-[8%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl">
            <Calculator className="h-7 w-7 text-white/70" />
          </div>
        </div>
        <div className="absolute top-[25%] right-[12%] animate-float-delayed hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl">
            <Shield className="h-7 w-7 text-white/70" />
          </div>
        </div>
        <div className="absolute bottom-[25%] left-[12%] animate-float-slow hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl">
            <FileText className="h-7 w-7 text-white/70" />
          </div>
        </div>
        <div className="absolute bottom-[30%] right-[8%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl">
            <Brain className="h-7 w-7 text-white/70" />
          </div>
        </div>

        {/* Content */}
        <div className="container relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2.5 glass rounded-full px-6 py-2.5 mb-10">
              <div className="flex -space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-white/90 text-sm font-medium tracking-wide">
                6 Apps &middot; 28+ Tools &middot; 1 Oekosystem
              </span>
              <Sparkles className="h-4 w-4 text-yellow-300/80" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-[0.95] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Dein Mietrecht-
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-white via-[#e8a494] to-[#c07888] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                  Oekosystem
                </span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/60 mb-6 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Von der Wohnungssuche bis zur Nebenkostenabrechnung.
              <span className="hidden md:inline"> Alles verbunden. Alles intelligent.</span>
            </p>
            <p className="text-base text-white/40 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              6 spezialisierte Apps, 28+ professionelle Tools - fur Mieter, Vermieter
              und Hausverwaltungen. Kostenlos starten.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90 text-base px-10 h-14 rounded-2xl font-semibold shadow-2xl shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02]" asChild>
                <Link to="/rechner">
                  <MousePointerClick className="h-5 w-5 mr-2" />
                  Tools entdecken
                </Link>
              </Button>
              <Button size="lg" className="glass text-white hover:bg-white/15 text-base px-10 h-14 rounded-2xl font-semibold border-white/20 transition-all hover:scale-[1.02]" asChild>
                <Link to="/apps">
                  <Layers className="h-5 w-5 mr-2" />
                  Alle 6 Apps
                </Link>
              </Button>
            </div>

            {/* Quick Stats under Hero */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <span ref={statsRef1.ref} className="text-3xl md:text-4xl font-black text-white counter-value">{statsRef1.count}</span>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">Apps</p>
              </div>
              <div className="text-center">
                <span ref={statsRef2.ref} className="text-3xl md:text-4xl font-black text-white counter-value">{statsRef2.count}+</span>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">Tools</p>
              </div>
              <div className="text-center">
                <span ref={statsRef3.ref} className="text-3xl md:text-4xl font-black text-white counter-value">{statsRef3.count}</span>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">Bundeslaender</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      <EcosystemStatsBar
        linkTo="/apps"
        renderLink={({ to, children, className }) => (
          <Link to={to} className={className}>{children}</Link>
        )}
      />

      {/* Recently Used */}
      {recentTools.length > 0 && (
        <section className="py-6 bg-muted/30 border-b border-border">
          <div className="container">
            <div className="flex items-center gap-4 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Zuletzt verwendet
              </span>
              <div className="flex gap-2">
                {recentTools.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border hover:border-primary/40 hover:shadow-md transition-all text-sm font-medium whitespace-nowrap group"
                  >
                    {tool.title}
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== PORTAL TOOLS ==================== */}
      <section className="py-24" ref={revealTools}>
        <div className="container reveal">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-5 py-2 mb-5 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Portal-Tools
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
              Alles was du brauchst
              <span className="block text-3xl md:text-4xl font-bold text-muted-foreground mt-2">direkt hier</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              28+ professionelle Rechner, Checker und Formulare
              basierend auf aktuellem deutschen Mietrecht.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {portalTools.map((cat) => (
              <Link key={cat.category} to={cat.href} className="group">
                <div className="tool-card h-full">
                  {/* Gradient Header */}
                  <div className={`${cat.gradient} p-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="glass-strong rounded-2xl p-3">
                          <cat.icon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-white/50 text-sm font-medium px-3 py-1 glass rounded-full">
                          {cat.subtitle}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-1">{cat.category}</h3>
                      <p className="text-white/50 text-sm">{cat.count} Tools verfuegbar</p>
                    </div>
                  </div>

                  {/* Tool Preview Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {cat.tools.slice(0, 4).map((tool) => (
                        <div key={tool.name} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-xs font-medium text-muted-foreground">
                          <tool.icon className="h-3.5 w-3.5 text-primary/60" />
                          <span className="truncate">{tool.name}</span>
                        </div>
                      ))}
                    </div>
                    {cat.tools.length > 4 && (
                      <p className="text-xs text-muted-foreground mb-4">
                        +{cat.tools.length - 4} weitere Tools
                      </p>
                    )}
                    <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all text-sm">
                      Alle {cat.category} ansehen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LOGGED IN: PROPERTIES ==================== */}
      {user && hasProperties && (
        <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Deine Immobilien</h2>
                <span className="text-xs text-muted-foreground">aus Vermietify synchronisiert</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { value: properties.length, label: 'Gebaeude', color: 'text-blue-600' },
                { value: totalUnits, label: 'Einheiten', color: 'text-blue-600' },
                { value: rentedUnits, label: 'Vermietet', color: 'text-green-600' },
                { value: totalUnits - rentedUnits, label: 'Frei', color: 'text-orange-600' },
              ].map((stat) => (
                <Card key={stat.label} className="border-blue-100/50">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Deine Rechner werden automatisch mit deinen Vermietify-Daten vorbefuellt.
            </p>
          </div>
        </section>
      )}

      {/* ==================== FINTECH MODULES ==================== */}
      <section className="py-24 bg-muted/20" ref={revealFintech}>
        <div className="container reveal">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-5 py-2 mb-5 text-sm font-semibold">
              <Brain className="h-4 w-4" />
              FinTech-Erweiterungen
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
              Die Zukunft von Fintutto
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Drei neue Module erweitern das Oekosystem - von KI-Finance-Coaching
              ueber Freelancer-Buchhaltung bis hin zu Finanz-Education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {fintechModules.map((mod) => (
              <div key={mod.name} className="group">
                <div className="tool-card h-full relative">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full glass-strong text-white">
                      {mod.status}
                    </span>
                  </div>

                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-br ${mod.gradient} p-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]" />
                    <div className="relative">
                      <div className="glass-strong rounded-2xl p-3 w-fit mb-4">
                        <mod.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">{mod.name}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{mod.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Features</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Score: {mod.score}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {mod.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary/50" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ECOSYSTEM ==================== */}
      <section className="py-24" ref={revealEcosystem}>
        <div className="container reveal">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-5 py-2 mb-5 text-sm font-semibold">
              <Globe className="h-4 w-4" />
              Das Oekosystem
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
              6 Apps fur jeden Schritt
            </h2>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Das Fintutto Oekosystem verbindet alle Akteure:
              <strong className="text-foreground"> Vermieter</strong> verwalten mit Vermietify,
              <strong className="text-foreground"> Mieter</strong> melden Maengel,
              <strong className="text-foreground"> Hausmeister</strong> reparieren,
              <strong className="text-foreground"> Zaehler</strong> werden digital erfasst.
              Ein Konto - alle Apps.
            </p>
          </div>

          {/* App Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {ecosystemApps.map((app) => {
              const isInternal = app.url.startsWith('/')
              const Wrapper = isInternal ? Link : 'a'
              const wrapperProps = isInternal
                ? { to: app.url }
                : { href: app.url, target: '_blank', rel: 'noopener noreferrer' }

              return (
                <Wrapper key={app.name} {...(wrapperProps as any)} className="group block">
                  <div className="tool-card h-full">
                    <div className={`bg-gradient-to-r ${app.gradient} p-5 relative overflow-hidden`}>
                      {app.badge && (
                        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {app.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="glass-strong rounded-xl p-2.5">
                          <app.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{app.name}</h3>
                          <p className="text-white/50 text-xs">{app.audience}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-white">{app.stats.primary}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">{app.stats.label}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">{app.description}</p>
                      <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                        {isInternal ? 'Oeffnen' : 'App besuchen'}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </Wrapper>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" className="rounded-xl h-12 px-8" asChild>
              <Link to="/apps">
                Alle Apps im Detail
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== WORKFLOW ==================== */}
      <section className="py-20 gradient-portal relative overflow-hidden" ref={revealWorkflow}>
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.04),transparent_50%)]" />

        <div className="container relative z-10 reveal">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-4">
              So arbeiten die Apps zusammen
            </h2>
            <p className="text-white/40 text-center mb-14 max-w-2xl mx-auto text-base">
              Ein Beispiel: Ein Mieter meldet einen Wasserschaden - alle Apps greifen nahtlos ineinander.
            </p>

            {/* Workflow Steps */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
              {workflowSteps.map((item, i) => (
                <div key={item.step} className="flex items-center gap-2 md:gap-0 flex-1">
                  <div className="text-center flex-1">
                    <div className={`glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-default mx-auto max-w-[160px]`}>
                      <div className={`bg-gradient-to-br ${item.color} rounded-xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-white font-bold text-sm">{item.app}</div>
                      <div className="text-white/40 text-xs mt-1">{item.action}</div>
                    </div>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-white/20 hidden md:block flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHY FINTUTTO ==================== */}
      <section className="py-24" ref={revealWhy}>
        <div className="container reveal">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
              Warum Fintutto?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deutsches Mietrecht ist komplex. Wir machen es einfach, digital und fuer jeden zugaenglich.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              {
                icon: Users,
                title: 'Ein Konto - alle Apps',
                desc: 'Einmal anmelden, alle 6 Apps nutzen. Deine Daten sind ueberall verfuegbar.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Lock,
                title: '100% DSGVO-konform',
                desc: 'Alle Daten in Deutschland. Kein Tracking, kein Verkauf an Dritte.',
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                icon: CreditCard,
                title: 'Kostenlos starten',
                desc: 'Jede App bietet einen kostenlosen Plan. Upgrade nur wenn noetig.',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: Gift,
                title: 'Empfehlen & sparen',
                desc: 'Mit dem Referral-Programm verdienst du Bonus-Credits fuer jede Empfehlung.',
                gradient: 'from-purple-500 to-indigo-500',
              },
            ].map((item) => (
              <div key={item.title} className="tool-card text-center p-8 group">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container relative z-10 max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Bereit loszulegen?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Starte kostenlos mit einem beliebigen Tool. Kein Abo noetig, keine Kreditkarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-portal text-white border-0 text-base px-10 h-14 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" asChild>
              <Link to="/rechner">
                <Calculator className="h-5 w-5 mr-2" />
                Rechner starten
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold hover:scale-[1.02] transition-all" asChild>
              <Link to="/checker">
                <Shield className="h-5 w-5 mr-2" />
                Rechte pruefen
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold hover:scale-[1.02] transition-all" asChild>
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
