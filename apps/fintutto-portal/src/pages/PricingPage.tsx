import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, Coins, Calculator, FileText, Sparkles,
  Zap, MessageSquare, ArrowRight, Shield, Star,
  ChevronDown, ChevronUp, CreditCard, Gift
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { PLANS_LIST, CREDIT_COSTS } from '../lib/credits'
import { useDocumentTitle, useMetaTags } from '@fintutto/shared'

const creditCosts = [
  { icon: Calculator, name: 'Checker / Rechner', description: 'Mieter-Checker, Kaution, etc.', cost: CREDIT_COSTS.checker, gradient: 'from-purple-500 to-indigo-500' },
  { icon: FileText, name: 'Standard Dokumente', description: 'Nebenkostenabrechnung, Protokolle', cost: CREDIT_COSTS.standard_document, gradient: 'from-blue-500 to-cyan-500' },
  { icon: Sparkles, name: 'Premium Dokumente', description: 'Rechtssichere Vertraege & Schreiben', cost: CREDIT_COSTS.premium_document, gradient: 'from-rose-500 to-pink-500' },
  { icon: Zap, name: 'PDF-Export', description: 'Zusatz zu jeder Berechnung/Dokument', cost: CREDIT_COSTS.pdf_export, gradient: 'from-amber-500 to-orange-500' },
]

const faqs = [
  {
    q: 'Was passiert, wenn meine Credits aufgebraucht sind?',
    a: 'Du kannst jederzeit auf einen hoeheren Plan upgraden. Alternativ warte bis zum naechsten Monat, wenn deine Credits wieder aufgefuellt werden.',
  },
  {
    q: 'Kann ich jederzeit kuendigen?',
    a: 'Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kuendigen. Keine versteckten Fristen oder Gebuehren.',
  },
  {
    q: 'Werden ungenutzte Credits uebertragen?',
    a: 'Nein, Credits verfallen am Ende jedes Abrechnungszeitraums und werden neu aufgefuellt. Waehle einen Plan, der zu deiner tatsaechlichen Nutzung passt.',
  },
  {
    q: 'Welche Zahlungsmethoden werden akzeptiert?',
    a: 'Wir akzeptieren alle gaengigen Kreditkarten, SEPA-Lastschrift und PayPal ueber unseren Zahlungspartner Stripe.',
  },
]

export default function PricingPage() {
  useDocumentTitle('Preise & Credits', 'Fintutto Portal')
  useMetaTags({
    title: 'Preise - Fintutto Portal',
    description: 'Einfaches Credit-System: Zahle nur fuer das, was du nutzt. Kostenlos starten.',
    path: '/preise',
  })

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div>
      {/* Hero */}
      <section className="gradient-portal py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="absolute top-16 left-[15%] animate-float hidden lg:block">
          <div className="glass rounded-2xl p-3"><Coins className="h-5 w-5 text-yellow-300/70" /></div>
        </div>
        <div className="absolute bottom-20 right-[10%] animate-float-delayed hidden lg:block">
          <div className="glass rounded-2xl p-3"><CreditCard className="h-5 w-5 text-white/50" /></div>
        </div>

        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">Einfach & transparent</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Credits statt Abo-Chaos
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Zahle nur fuer das, was du nutzt. Kaufe Credits und setze sie flexibel ein -
            fuer Rechner, Checker und Formulare.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 glass rounded-full p-1.5">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Jaehrlich
              <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Credit Costs */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {creditCosts.map((item) => (
              <div key={item.name} className="tool-card flex items-center gap-3 px-5 py-3.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full ml-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary text-sm">{item.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-7xl mx-auto stagger-children">
            {PLANS_LIST.map((plan) => {
              const isPopular = plan.id === 'kombi_pro'
              const monthlyPrice = billingPeriod === 'yearly' && plan.yearlyPrice > 0
                ? (plan.yearlyPrice / 100 / 12).toFixed(2).replace('.', ',')
                : (plan.price / 100).toFixed(2).replace('.', ',')

              return (
                <div
                  key={plan.id}
                  className={`tool-card relative ${isPopular ? 'ring-2 ring-primary shadow-xl shadow-primary/10 scale-[1.03] z-10' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="gradient-portal text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                        Beliebteste Wahl
                      </span>
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-5">{plan.description}</p>

                    <div className="mb-5">
                      <span className="text-4xl font-black">{monthlyPrice}\u20ac</span>
                      <span className="text-muted-foreground text-sm">/Monat</span>
                      {billingPeriod === 'yearly' && plan.yearlyPrice > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {(plan.yearlyPrice / 100).toFixed(2).replace('.', ',')}\u20ac jaehrlich
                        </p>
                      )}
                    </div>

                    {/* Credits Badge */}
                    <div className="mb-6 flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="font-bold text-primary text-sm">
                          {plan.monthlyCredits === -1 ? '\u221e Unbegrenzt' : `${plan.monthlyCredits} Credits`}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-6 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full rounded-xl h-11 font-semibold ${
                        isPopular
                          ? 'gradient-portal text-white border-0 shadow-lg'
                          : ''
                      }`}
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Kostenlos starten' : 'Jetzt starten'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Credits Work */}
      <section className="py-16 bg-muted/20">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-black text-center mb-4 tracking-tight">
            So funktionieren Credits
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            In 3 Schritten zu deinem ersten Ergebnis
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12 stagger-children">
            {[
              { step: '1', title: 'Plan waehlen', desc: 'Waehle einen Plan mit Credits, die zu deinem Bedarf passen.', gradient: 'from-purple-500 to-indigo-500' },
              { step: '2', title: 'Credits nutzen', desc: 'Jede Berechnung oder jedes Dokument kostet 1-3 Credits.', gradient: 'from-blue-500 to-cyan-500' },
              { step: '3', title: 'Monatlich erneuern', desc: 'Credits werden jeden Monat aufgefuellt. Ungenutzte verfallen.', gradient: 'from-green-500 to-emerald-500' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl font-black text-white">{item.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <Card className="border-primary/20 overflow-hidden">
            <div className="gradient-portal p-5 flex items-center gap-3">
              <div className="glass-strong rounded-xl p-2.5">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">KI-Assistent inklusive</h3>
                <p className="text-white/50 text-xs">
                  Kostenpflichtige Plaene enthalten KI-Nachrichten fuer Mietrecht-Beratung.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-4 tracking-tight">
            Haeufige Fragen
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Alles was du wissen musst
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left tool-card"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-sm">{faq.q}</h3>
                    {openFaq === i
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    }
                  </div>
                  {openFaq === i && (
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed animate-fade-in-up">
                      {faq.a}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-black mb-5 tracking-tight">
            Starte jetzt kostenlos
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Kein Abo noetig. Kein Risiko. Einfach loslegen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-portal text-white border-0 text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/rechner">
                <Calculator className="h-5 w-5 mr-2" />
                Tools ausprobieren
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-14 rounded-2xl font-semibold" asChild>
              <Link to="/referral">
                <Gift className="h-5 w-5 mr-2" />
                Credits verdienen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
