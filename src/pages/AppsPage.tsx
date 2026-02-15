import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink, Gift, ArrowRight, CheckCircle2, Star,
  Users, Sparkles, Copy, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FINTUTTO_APPS, type AppInfo } from '@/lib/apps'
import { REFERRAL_REWARDS } from '@/lib/referral'

function AppCard({ app }: { app: AppInfo }) {
  const highlightedPlan = app.pricing.plans.find((p) => p.highlight) || app.pricing.plans[0]

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${app.color} p-6 relative`}>
        {app.badge && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
            {app.badge}
          </span>
        )}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{app.icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{app.name}</h3>
            <p className="text-white/70 text-sm">{app.targetAudience}</p>
          </div>
        </div>
        <p className="text-white/90 font-medium">{app.tagline}</p>
      </div>

      <CardContent className="p-6">
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {app.description}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          {app.stats.map((stat) => (
            <div key={stat.label} className="text-center flex-1">
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-5">
          {app.features.slice(0, 4).map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
          {app.features.length > 4 && (
            <div className="text-xs text-muted-foreground pl-6">
              +{app.features.length - 4} weitere Features
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="border rounded-lg p-4 mb-4 bg-gradient-to-r from-muted/30 to-muted/50">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
              Kostenlos starten
            </span>
            <span className="text-xs text-green-600 font-medium">{app.pricing.free}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              ab {highlightedPlan.price}&euro;
            </span>
            <span className="text-muted-foreground text-sm">{highlightedPlan.period}</span>
          </div>
          {app.pricing.plans.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {app.pricing.plans.map((plan) => (
                <span
                  key={plan.name}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    plan.highlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {plan.name}: {plan.price}&euro;
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className={`flex-1 bg-gradient-to-r ${app.color} text-white border-0 hover:opacity-90`} asChild>
            <a href={app.registerUrl} target="_blank" rel="noopener noreferrer">
              Kostenlos starten
              <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={app.url} target="_blank" rel="noopener noreferrer" title="App öffnen">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AppsPage() {
  const [filter, setFilter] = useState<'alle' | 'mieter' | 'vermieter' | 'alle-nutzer'>('alle')

  const filteredApps = FINTUTTO_APPS.filter((app) => {
    if (filter === 'alle') return true
    if (filter === 'mieter')
      return app.targetAudience.includes('Mieter')
    if (filter === 'vermieter')
      return app.targetAudience.includes('Vermieter') || app.targetAudience.includes('Hausverwaltung')
    return true
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,80,255,0.15),transparent_70%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                6 Apps &middot; 1 &Ouml;kosystem &middot; Alles kostenlos starten
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Das Fintutto &Ouml;kosystem
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Von der Wohnungssuche bis zur Nebenkostenabrechnung &ndash; f&uuml;r jeden Schritt die
              richtige App. Alle verbunden, alle mit Supabase & Stripe.
            </p>

            {/* Referral Banner */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="h-6 w-6 text-yellow-300" />
                <h3 className="text-white font-semibold text-lg">Empfehlen & profitieren</h3>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Empfiehl Fintutto-Apps an Freunde und erhalte{' '}
                <strong className="text-yellow-300">{REFERRAL_REWARDS.referrer.onSignup.description}</strong>{' '}
                pro Anmeldung!
              </p>
              <Button className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold" asChild>
                <Link to="/referral">
                  <Gift className="h-4 w-4 mr-2" />
                  Referral-Programm starten
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 border-b bg-muted/30 sticky top-16 z-40 backdrop-blur">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'alle', label: 'Alle Apps', icon: '🌐' },
              { key: 'mieter', label: 'Für Mieter', icon: '🔑' },
              { key: 'vermieter', label: 'Für Vermieter', icon: '🏠' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border hover:bg-accent'
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* App Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Warum ein &Ouml;kosystem?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Alle Apps teilen eine gemeinsame Datenbasis. Einmal anmelden &ndash; &uuml;berall nutzen.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ein Konto &ndash; alle Apps</h3>
              <p className="text-muted-foreground text-sm">
                Melde dich einmal an und nutze alle Fintutto-Apps mit demselben Account.
                Deine Daten sind &uuml;berall verf&uuml;gbar.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 mx-auto mb-4">
                <Star className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Kostenlos starten</h3>
              <p className="text-muted-foreground text-sm">
                Jede App bietet einen kostenlosen Plan. Upgrade nur, wenn du mehr brauchst.
                Keine versteckten Kosten.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 mx-auto mb-4">
                <Gift className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Empfehlen & sparen</h3>
              <p className="text-muted-foreground text-sm">
                Mit dem Referral-Programm verdienst du Bonus-Credits f&uuml;r jede Empfehlung.
                Je mehr Freunde, desto mehr sparst du.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit loszulegen?</h2>
          <p className="text-muted-foreground mb-8">
            W&auml;hle eine App und starte kostenlos. Alle deine Daten sind sofort in allen
            anderen Fintutto-Apps verf&uuml;gbar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0" asChild>
              <Link to="/referral">
                <Gift className="h-5 w-5 mr-2" />
                Referral-Programm
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
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
