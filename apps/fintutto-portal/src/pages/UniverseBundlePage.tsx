import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain, Wallet, GraduationCap, Check, ArrowRight,
  Sparkles, Zap, Shield, Crown, Star
} from 'lucide-react'
import { useDocumentTitle, useMetaTags, Breadcrumbs, createCheckoutSession } from '@fintutto/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const INCLUDED_APPS = [
  {
    name: 'AI Finance Coach',
    icon: Brain,
    gradient: 'from-emerald-500 to-teal-600',
    features: ['KI-Insights', 'Budget-Tracker', 'Cashflow-Forecast', 'Multi-Bank Sync'],
    standalone: '7,99',
  },
  {
    name: 'Fintutto Biz',
    icon: Wallet,
    gradient: 'from-blue-600 to-violet-600',
    features: ['Unlimitierte Rechnungen', 'Steuer-Reports', 'Banking-Sync', 'KI-CFO'],
    standalone: '19,99',
  },
  {
    name: 'Finance Mentor',
    icon: GraduationCap,
    gradient: 'from-purple-500 to-indigo-600',
    features: ['Alle Premium-Kurse', 'Zertifikate', 'KI-Tutor', 'Offline-Modus'],
    standalone: '4,99',
  },
]

const BUNDLE_BENEFITS = [
  { icon: Crown, title: 'Alles inklusive', desc: 'Voller Zugriff auf alle 3 FinTech-Apps' },
  { icon: Zap, title: 'KI ueberall', desc: 'KI-Features in jeder App freigeschaltet' },
  { icon: Shield, title: 'Lebenslange Updates', desc: 'Neue Features automatisch inklusive' },
  { icon: Star, title: 'Priority Support', desc: 'Bevorzugter Support ueber alle Apps' },
]

export default function UniverseBundlePage() {
  const [loading, setLoading] = useState(false)

  useDocumentTitle('Universe Bundle', 'Fintutto Portal')
  useMetaTags({
    title: 'Universe Bundle - Fintutto Portal',
    description: 'Alle Fintutto FinTech-Apps in einem Bundle: Finance Coach, Biz und Mentor fuer 19,99 EUR/Monat.',
    path: '/universe-bundle',
  })

  const standaloneTotal = '32,97'
  const bundlePrice = '19,99'

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const url = await createCheckoutSession({
        priceId: import.meta.env.VITE_STRIPE_PRICE_UNIVERSE_BUNDLE || '',
        userId: '',
        userEmail: '',
        tierId: 'universe_bundle',
        productKey: 'fintutto_universe_bundle',
        successUrl: `${window.location.origin}/fintech?upgraded=true`,
        cancelUrl: `${window.location.origin}/universe-bundle`,
      })
      window.location.href = url
    } catch (err) {
      console.error('Bundle checkout error:', err)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Hero */}
      <section className="gradient-fintech py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.25),transparent_60%)]" />

        <div className="container relative">
          <Breadcrumbs
            items={[
              { label: 'Startseite', href: '/' },
              { label: 'FinTech', href: '/fintech' },
              { label: 'Universe Bundle' },
            ]}
            className="mb-8 [&_a]:text-white/60 [&_a:hover]:text-white [&_span[aria-current]]:text-white [&_span[aria-hidden]]:text-white/30"
          />

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-white/80 text-sm font-medium">Spare ueber 39% gegenueber Einzelkauf</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Universe
              <span className="block bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent mt-2">
                Bundle
              </span>
            </h1>

            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              Alle 3 FinTech-Apps zum Preis von einer. KI-Finanzcoach, Freelancer-Buchhaltung
              und Finanz-Kurse - ein Abo, voller Zugriff.
            </p>

            {/* Price Block */}
            <div className="inline-block glass rounded-3xl p-8 mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-sm text-white/40 line-through">{standaloneTotal}{'\u20ac'}</span>
                <span className="text-5xl font-black text-white">{bundlePrice}{'\u20ac'}</span>
                <span className="text-white/60">/Monat</span>
              </div>
              <p className="text-sm text-white/40">Statt 3 einzelne Abos</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-base px-12 h-14 rounded-2xl font-bold hover:opacity-90"
                disabled={loading}
                onClick={handleCheckout}
              >
                {loading ? 'Weiterleitung...' : 'Bundle jetzt starten'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Was ist enthalten?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Voller Premium-Zugriff auf alle 3 FinTech-Apps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {INCLUDED_APPS.map((app) => (
              <Card key={app.name} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${app.gradient}`} />
                <CardContent className="p-7">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-4`}>
                    <app.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{app.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Einzeln: <span className="line-through">{app.standalone}{'\u20ac'}/Monat</span>
                  </p>
                  <div className="space-y-2">
                    {app.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Bundle-Vorteile</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {BUNDLE_BENEFITS.map((b) => (
              <div key={b.title} className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Einzeln vs. Bundle</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Einzeln */}
            <Card className="border-muted">
              <CardContent className="p-7">
                <h3 className="text-lg font-bold mb-2 text-muted-foreground">3 Einzelabos</h3>
                <div className="text-3xl font-black mb-6">{standaloneTotal}{'\u20ac'}<span className="text-base font-normal text-muted-foreground">/Monat</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Finance Coach Premium: 7,99{'\u20ac'}</p>
                  <p>Fintutto Biz Pro: 19,99{'\u20ac'}</p>
                  <p>Finance Mentor Premium: 4,99{'\u20ac'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bundle */}
            <Card className="border-primary/50 ring-1 ring-primary/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  BEST VALUE
                </span>
              </div>
              <CardContent className="p-7">
                <h3 className="text-lg font-bold mb-2">Universe Bundle</h3>
                <div className="text-3xl font-black mb-6">{bundlePrice}{'\u20ac'}<span className="text-base font-normal text-muted-foreground">/Monat</span></div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Alles aus allen 3 Apps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>KI-Features inklusive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>API Startup Zugang</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container max-w-3xl text-center">
          <h2 className="text-4xl font-black mb-5 tracking-tight">
            Ein Abo. Alles drin.
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Starte mit dem Universe Bundle und spare ueber 39% gegenueber Einzelabos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-base px-12 h-14 rounded-2xl font-bold hover:opacity-90"
              disabled={loading}
              onClick={handleCheckout}
            >
              {loading ? 'Weiterleitung...' : `Fuer ${bundlePrice}\u20ac/Monat starten`}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/fintech">
                Apps einzeln ansehen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
