import { useState } from 'react'
import { CheckCircle2, XCircle, Coins, Calculator, FileText, Sparkles, Zap, MessageSquare } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { PLANS_LIST, CREDIT_COSTS } from '../lib/credits'

const creditCosts = [
  { icon: Calculator, name: 'Checker / Rechner', description: 'Mieter-Checker, Kaution, etc.', cost: CREDIT_COSTS.checker },
  { icon: FileText, name: 'Standard Dokumente', description: 'Nebenkostenabrechnung, Protokolle', cost: CREDIT_COSTS.standard_document },
  { icon: Sparkles, name: 'Premium Dokumente', description: 'Rechtssichere Vertraege & Schreiben', cost: CREDIT_COSTS.premium_document },
  { icon: Zap, name: 'PDF-Export', description: 'Zusatz zu jeder Berechnung/Dokument', cost: CREDIT_COSTS.pdf_export },
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Einfaches Credit-System
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Zahle nur fuer das, was du nutzt. Kaufe Credits und setze sie flexibel ein.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-primary'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-primary'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Jaehrlich
              <span className="ml-1 text-xs bg-success text-white px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Credit Costs Info */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-6">
            {creditCosts.map((item) => (
              <div key={item.name} className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">{item.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {PLANS_LIST.map((plan) => {
              const isPopular = plan.id === 'kombi_pro'
              const priceInCents = billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice
              const monthlyPrice = billingPeriod === 'yearly' && plan.yearlyPrice > 0
                ? (plan.yearlyPrice / 100 / 12).toFixed(2).replace('.', ',')
                : (plan.price / 100).toFixed(2).replace('.', ',')

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isPopular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="gradient-vermieter text-white text-xs font-medium px-4 py-1 rounded-full">
                        Beliebteste Wahl
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-4xl font-bold">
                        {monthlyPrice}\u20AC
                      </span>
                      <span className="text-muted-foreground">/Monat</span>
                      {billingPeriod === 'yearly' && plan.yearlyPrice > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {(plan.yearlyPrice / 100).toFixed(2).replace('.', ',')}\u20AC jaehrlich abgerechnet
                        </p>
                      )}
                    </div>

                    {/* Credits Badge */}
                    <div className="mb-6 flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                        <Coins className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-primary">
                          {plan.monthlyCredits === -1 ? '\u221E Unbegrenzt' : `${plan.monthlyCredits} Credits/Monat`}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${isPopular ? 'gradient-vermieter text-white' : ''}`}
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Kostenlos starten' : 'Jetzt starten'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How Credits Work */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">So funktionieren Credits</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Plan waehlen</h3>
              <p className="text-sm text-muted-foreground">
                Waehle einen Plan mit Credits, die zu deinem Bedarf passen.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Credits nutzen</h3>
              <p className="text-sm text-muted-foreground">
                Jede Berechnung oder jedes Dokument kostet 1-3 Credits.
              </p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Monatlich erneuern</h3>
              <p className="text-sm text-muted-foreground">
                Credits werden jeden Monat aufgefuellt. Ungenutzte verfallen.
              </p>
            </div>
          </div>

          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">KI-Assistent</h3>
                  <p className="text-sm text-muted-foreground">
                    Kostenpflichtige Plaene enthalten KI-Nachrichten pro Monat.
                    Der Assistent hilft bei Fragen zu Mietrecht, Berechnungen und Dokumenten.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Haeufige Fragen</h2>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Was passiert, wenn meine Credits aufgebraucht sind?</h3>
              <p className="text-muted-foreground text-sm">
                Du kannst jederzeit auf einen hoeheren Plan upgraden. Alternativ warte bis zum naechsten Monat,
                wenn deine Credits wieder aufgefuellt werden.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Kann ich jederzeit kuendigen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kuendigen.
                Keine versteckten Fristen oder Gebuehren.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Werden ungenutzte Credits uebertragen?</h3>
              <p className="text-muted-foreground text-sm">
                Nein, Credits verfallen am Ende jedes Abrechnungszeitraums und werden neu aufgefuellt.
                Waehle einen Plan, der zu deiner tatsaechlichen Nutzung passt.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h3>
              <p className="text-muted-foreground text-sm">
                Wir akzeptieren alle gaengigen Kreditkarten, SEPA-Lastschrift und PayPal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
