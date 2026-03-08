import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink, Gift, ArrowRight, CheckCircle2, Star,
  Users, Sparkles, Copy, Check, Globe, Zap,
  Building2, Key, Wrench, BarChart3, Landmark,
  Shield, Calculator, FileText, ArrowUpRight,
  Brain, Wallet, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FINTUTTO_APPS, type AppInfo } from '@/lib/apps'
import { REFERRAL_REWARDS } from '@/lib/referral'
import { useDocumentTitle, useMetaTags } from '@fintutto/shared'

function AppCard({ app }: { app: AppInfo }) {
  const highlightedPlan = app.pricing.plans.find((p) => p.highlight) || app.pricing.plans[0]

  return (
    <div className="tool-card group h-full">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${app.color} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        {app.badge && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {app.badge}
          </span>
        )}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl drop-shadow-lg">{app.icon}</span>
            <div>
              <h3 className="text-xl font-black text-white">{app.name}</h3>
              <p className="text-white/60 text-xs font-medium">{app.targetAudience}</p>
            </div>
          </div>
          <p className="text-white/90 font-medium text-sm">{app.tagline}</p>
        </div>
      </div>

      <div className="p-6">
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
          {app.description}
        </p>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {app.stats.map((stat) => (
            <div key={stat.label} className="text-center flex-1 p-2.5 bg-muted/50 rounded-xl">
              <div className="font-black text-lg">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-5">
          {app.features.slice(0, 4).map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-xs">{feature}</span>
            </div>
          ))}
          {app.features.length > 4 && (
            <div className="text-[10px] text-muted-foreground/60 pl-5">
              +{app.features.length - 4} weitere Features
            </div>
          )}
        </div>

        {/* Pricing Preview */}
        <div className="rounded-xl p-3.5 mb-5 bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">ab {highlightedPlan.price}\u20ac</span>
              <span className="text-muted-foreground text-xs">{highlightedPlan.period}</span>
            </div>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
              {app.pricing.free}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className={`flex-1 bg-gradient-to-r ${app.color} text-white border-0 hover:opacity-90 rounded-xl h-11 font-semibold text-sm`} asChild>
            <a href={app.registerUrl} target="_blank" rel="noopener noreferrer">
              Kostenlos starten
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </a>
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-11 w-11" asChild>
            <a href={app.url} target="_blank" rel="noopener noreferrer" title="App oeffnen">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

const categories = [
  { key: 'alle', label: 'Alle Apps', icon: Globe },
  { key: 'immobilien', label: 'Immobilien', icon: Building2 },
  { key: 'finanzen', label: 'Finanzen', icon: Calculator },
  { key: 'lifestyle', label: 'Lifestyle', icon: Star },
  { key: 'mieter', label: 'Mieter', icon: Key },
  { key: 'vermieter', label: 'Vermieter', icon: Building2 },
] as const

type FilterKey = typeof categories[number]['key']

export default function AppsPage() {
  useDocumentTitle('Alle Apps', 'Fintutto Portal')
  useMetaTags({
    title: 'Fintutto Oekosystem - Alle Apps',
    description: '15 spezialisierte Apps fuer Mieter, Vermieter und Hausverwaltungen. Ein Konto, alle Apps.',
    path: '/apps',
  })

  const [filter, setFilter] = useState<FilterKey>('alle')

  const filteredApps = FINTUTTO_APPS.filter((app) => {
    if (filter === 'alle') return true
    if (filter === 'mieter')
      return app.targetAudience.includes('Mieter')
    if (filter === 'vermieter')
      return app.targetAudience.includes('Vermieter') || app.targetAudience.includes('Hausverwaltung')
    if (filter === 'immobilien' || filter === 'finanzen' || filter === 'lifestyle' || filter === 'sales')
      return app.category === filter
    return true
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(120,80,255,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,164,148,0.1),transparent_50%)]" />

        {/* Floating Icons */}
        <div className="absolute top-16 left-[10%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-3 shadow-2xl"><Building2 className="h-5 w-5 text-blue-300" /></div>
        </div>
        <div className="absolute bottom-16 right-[12%] animate-float-delayed hidden lg:block">
          <div className="glass rounded-2xl p-3 shadow-2xl"><Shield className="h-5 w-5 text-green-300" /></div>
        </div>
        <div className="absolute top-[40%] right-[8%] animate-float-slow hidden lg:block">
          <div className="glass rounded-2xl p-3 shadow-2xl"><BarChart3 className="h-5 w-5 text-teal-300" /></div>
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">
                15 Apps &middot; 1 Oekosystem &middot; Alles kostenlos starten
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Das Fintutto
              <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent mt-2">
                Oekosystem
              </span>
            </h1>
            <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              Von der Wohnungssuche bis zur Nebenkostenabrechnung -
              fuer jeden Schritt die richtige App. Alle verbunden.
            </p>

            {/* Referral Banner */}
            <div className="glass rounded-2xl p-6 max-w-lg mx-auto animate-border-glow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-yellow-300" />
                </div>
                <h3 className="text-white font-bold text-base">Empfehlen & profitieren</h3>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Empfiehl Fintutto-Apps an Freunde und erhalte{' '}
                <strong className="text-yellow-300">{REFERRAL_REWARDS.referrer.onSignup.description}</strong>{' '}
                pro Anmeldung!
              </p>
              <Button className="bg-yellow-400/90 text-slate-900 hover:bg-yellow-300 font-semibold rounded-xl" asChild>
                <Link to="/referral">
                  <Gift className="h-4 w-4 mr-2" />
                  Referral-Programm
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-5 border-b bg-background/95 backdrop-blur sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat.key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted hover:bg-accent text-muted-foreground'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* App Grid */}
      <section className="py-14">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
          {filteredApps.length === 0 && (
            <div className="text-center py-20">
              <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Keine Apps in dieser Kategorie.</p>
              <button onClick={() => setFilter('alle')} className="text-primary text-sm font-medium mt-2 hover:underline">
                Alle Apps anzeigen
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">
            Warum ein Oekosystem?
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto">
            Alle Apps teilen eine gemeinsame Datenbasis. Einmal anmelden - ueberall nutzen.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto stagger-children">
            {[
              {
                icon: Users,
                title: 'Ein Konto - alle Apps',
                desc: 'Melde dich einmal an und nutze alle Fintutto-Apps. Deine Daten sind ueberall verfuegbar.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Star,
                title: 'Kostenlos starten',
                desc: 'Jede App bietet einen kostenlosen Plan. Upgrade nur, wenn du mehr brauchst.',
                gradient: 'from-green-500 to-emerald-500',
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

      {/* FinTech Teaser */}
      <section className="py-20 gradient-fintech relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
            <Brain className="h-4 w-4 text-indigo-300" />
            <span className="text-white/80 text-sm font-medium">FinTech Universe - Jetzt live!</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            3 neue FinTech-Apps
          </h2>
          <p className="text-white/50 mb-10 max-w-xl mx-auto">
            Finance Coach (KI-Budgetierung), Fintutto Biz (Freelancer-Buchhaltung) und Finance Mentor (Finanz-Kurse) - jetzt kostenlos starten.
          </p>
          <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90 rounded-xl h-12 px-8 font-semibold" asChild>
            <Link to="/fintech">
              Alle FinTech-Apps
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight">
            Bereit loszulegen?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Waehle eine App und starte kostenlos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-portal text-white border-0 text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/referral">
                <Gift className="h-5 w-5 mr-2" />
                Referral-Programm
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/preise">
                Preise vergleichen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
