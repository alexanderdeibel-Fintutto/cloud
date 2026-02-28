import { Link } from 'react-router-dom'
import {
  Brain, Wallet, GraduationCap, LineChart, Landmark,
  ArrowRight, CheckCircle2, Sparkles, TrendingUp,
  CreditCard, Shield, Zap, Globe, BarChart3,
  Building2, Users, Lock, Star, ArrowUpRight,
  Banknote, PieChart, FileText, Receipt
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, Breadcrumbs } from '@fintutto/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const modules = [
  {
    name: 'AI Finance Coach',
    tagline: 'Dein persoenlicher KI-Finanzberater',
    description: 'Bank-Sync, automatische Kategorisierung, Budget-Tracker und KI-gesteuerter Cashflow-Forecast. Verstehe dein Geld wie nie zuvor.',
    icon: Brain,
    gradient: 'from-indigo-600 via-violet-600 to-purple-600',
    status: 'Bald verfuegbar',
    statusColor: 'bg-indigo-100 text-indigo-700',
    score: 33,
    maxScore: 40,
    price: '10-12',
    features: [
      { title: 'KI-Insights', desc: 'Personalisierte Finanz-Tipps basierend auf deinem Verhalten', icon: Brain },
      { title: 'Bank-Sync', desc: 'Automatischer Import von allen deutschen Bankkonten', icon: Landmark },
      { title: 'Budget-Tracker', desc: 'Visualisiere Einnahmen & Ausgaben mit Smart-Kategorien', icon: PieChart },
      { title: 'Cashflow-Forecast', desc: 'KI-gestuetzte Vorhersage deiner Finanzen', icon: LineChart },
    ],
    synergies: [
      'Banking-Modul aus Vermietify',
      'KI-Assistent aus Portal-Checkern',
      'Stripe Credits-System',
      'banking_connections DB-Tabelle',
    ],
  },
  {
    name: 'Fintutto Biz',
    tagline: 'Das Freelancer Finance OS',
    description: 'Professionelle Buchhaltung fuer Freelancer und Kleinunternehmer. Rechnungen, Ausgaben, Steuern, DATEV-Export - alles in einer App.',
    icon: Wallet,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    status: 'In Entwicklung',
    statusColor: 'bg-emerald-100 text-emerald-700',
    score: 37,
    maxScore: 40,
    price: '9-39',
    features: [
      { title: 'Rechnungen', desc: 'Professionelle Rechnungen erstellen und versenden', icon: Receipt },
      { title: 'Ausgaben-Tracker', desc: 'Belege scannen, Ausgaben kategorisieren', icon: CreditCard },
      { title: 'Steuer-Export', desc: 'DATEV, ELSTER und Steuerberater-Schnittstelle', icon: FileText },
      { title: 'Cashflow-Dashboard', desc: 'Echtzeit-Ueberblick ueber Liquiditaet', icon: BarChart3 },
    ],
    synergies: [
      'Vermietify Invoice-Logik',
      'Financial Compass Landing',
      'Steuer-Rechner aus Portal',
      'Stripe-Infrastruktur',
    ],
  },
  {
    name: 'Finance Mentor',
    tagline: 'Finanz-Education gamifiziert',
    description: 'Lerne den Umgang mit Geld spielerisch. Interaktive Lernpfade, Quizzes und KI-Tutor - von Basics bis Immobilien-Investor.',
    icon: GraduationCap,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    status: 'Phase 2',
    statusColor: 'bg-amber-100 text-amber-700',
    score: 31,
    maxScore: 40,
    price: '29-99',
    features: [
      { title: 'Lernpfade', desc: 'Strukturierte Kurse von Anfaenger bis Profi', icon: TrendingUp },
      { title: 'Quizzes', desc: 'Teste dein Wissen mit interaktiven Aufgaben', icon: Zap },
      { title: 'Zertifikate', desc: 'Erhalte Nachweise fuer deine Kompetenzen', icon: Star },
      { title: 'KI-Tutor', desc: 'Persoenlicher Lernbegleiter mit KI', icon: Brain },
    ],
    synergies: [
      'LernApp-Repository',
      'Checker-Engine fuer Quizzes',
      'KI-Assistent als Tutor',
      'Portal-Credits System',
    ],
  },
]

const timeline = [
  { phase: 'Phase 1', period: 'Q1 2026', items: ['Finance Coach MVP', 'Fintutto Biz Beta', 'Bank-Sync Integration'], status: 'active' },
  { phase: 'Phase 2', period: 'Q2-Q3 2026', items: ['Finance Mentor Launch', 'B2B API Beta', 'Gamification Layer'], status: 'upcoming' },
  { phase: 'Phase 3', period: 'Q4 2026', items: ['Social Wealth Features', 'Community Challenges', 'White-Label API'], status: 'planned' },
]

export default function FintechPage() {
  useDocumentTitle('FinTech-Erweiterungen', 'Fintutto Portal')
  useMetaTags({
    title: 'FinTech-Erweiterungen - Fintutto Portal',
    description: 'Die Zukunft von Fintutto: AI Finance Coach, Freelancer Buchhaltung und Finanz-Education.',
    path: '/fintech',
  })

  return (
    <div>
      {/* Hero */}
      <section className="gradient-fintech py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-[10%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl"><Brain className="h-6 w-6 text-indigo-300" /></div>
        </div>
        <div className="absolute bottom-20 right-[15%] animate-float-delayed hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl"><LineChart className="h-6 w-6 text-emerald-300" /></div>
        </div>
        <div className="absolute top-[40%] right-[8%] animate-float-slow hidden lg:block">
          <div className="glass rounded-2xl p-4 shadow-2xl"><Wallet className="h-6 w-6 text-amber-300" /></div>
        </div>

        <div className="container relative">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'FinTech' },
            ]}
            className="mb-8 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              <span className="text-white/80 text-sm font-medium">3 neue Module in Entwicklung</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Die Zukunft von
              <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mt-2">
                Fintutto
              </span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Von KI-Finance-Coaching ueber Freelancer-Buchhaltung bis Finanz-Education -
              drei neue Module erweitern dein Oekosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24">
        <div className="container">
          <div className="space-y-24">
            {modules.map((mod, idx) => (
              <div key={mod.name} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Info Side */}
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shadow-lg`}>
                      <mod.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{mod.name}</h2>
                      <p className="text-muted-foreground text-sm">{mod.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${mod.statusColor}`}>
                      {mod.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Score: <strong className="text-foreground">{mod.score}/{mod.maxScore}</strong>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Ab <strong className="text-foreground">{mod.price}\u20ac</strong>/Monat
                    </span>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {mod.description}
                  </p>

                  {/* Synergies */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Synergien mit bestehendem System
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {mod.synergies.map((s) => (
                        <span key={s} className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features Side */}
                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {mod.features.map((feat) => (
                      <Card key={feat.title} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                        <CardContent className="p-5">
                          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <feat.icon className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-bold text-sm mb-1">{feat.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Roadmap</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unser Fahrplan fuer die naechsten 12 Monate
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-12">
                {timeline.map((phase) => (
                  <div key={phase.phase} className="relative pl-20">
                    {/* Dot */}
                    <div className={`absolute left-[26px] top-1 w-5 h-5 rounded-full border-4 border-background ${
                      phase.status === 'active' ? 'bg-primary glow-purple' :
                      phase.status === 'upcoming' ? 'bg-muted-foreground/30' : 'bg-muted'
                    }`} />

                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{phase.phase}</h3>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        phase.status === 'active'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {phase.period}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${
                            phase.status === 'active' ? 'text-primary' : 'text-muted-foreground/30'
                          }`} />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-5 tracking-tight">
            Bleib auf dem Laufenden
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Die FinTech-Module werden Schritt fuer Schritt gelauncht.
            Starte heute mit den bestehenden Tools und profitiere spaeter automatisch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-portal text-white border-0 text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/rechner">
                Jetzt Tools nutzen
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/apps">
                Alle Apps ansehen
                <Globe className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
