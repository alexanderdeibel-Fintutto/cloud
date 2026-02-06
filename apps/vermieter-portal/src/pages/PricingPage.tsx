import { useState } from 'react'
import { CheckCircle2, XCircle, Coins, Calculator, FileText, Sparkles, Zap, MessageSquare } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const plans = [
  {
    name: 'Free',
    description: 'Zum Ausprobieren',
    price: '0',
    period: 'für immer',
    credits: 3,
    features: [
      { text: '3 Credits pro Monat', included: true, highlight: true },
      { text: 'Alle Rechner verfügbar', included: true },
      { text: 'Alle Formulare verfügbar', included: true },
      { text: 'PDF-Export (mit Wasserzeichen)', included: true },
      { text: 'Berechnungen speichern', included: false },
      { text: 'KI-Assistent', included: false },
    ],
    cta: 'Kostenlos starten',
    popular: false,
  },
  {
    name: 'Starter',
    description: 'Für gelegentliche Nutzung',
    price: '2,99',
    period: 'pro Monat',
    yearlyPrice: '28,70',
    credits: 10,
    features: [
      { text: '10 Credits pro Monat', included: true, highlight: true },
      { text: 'Alle Rechner verfügbar', included: true },
      { text: 'Alle Formulare verfügbar', included: true },
      { text: 'PDF-Export ohne Wasserzeichen', included: true },
      { text: 'Berechnungen speichern', included: true },
      { text: 'KI-Assistent', included: false },
    ],
    cta: 'Starter wählen',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Für aktive Vermieter',
    price: '7,99',
    period: 'pro Monat',
    yearlyPrice: '76,70',
    credits: 30,
    features: [
      { text: '30 Credits pro Monat', included: true, highlight: true },
      { text: 'Alle Rechner verfügbar', included: true },
      { text: 'Alle Formulare verfügbar', included: true },
      { text: 'PDF-Export ohne Wasserzeichen', included: true },
      { text: 'Berechnungen speichern', included: true },
      { text: 'KI-Assistent (50 Nachrichten/Monat)', included: true },
    ],
    cta: 'Pro werden',
    popular: true,
  },
  {
    name: 'Unlimited',
    description: 'Für Profis & Hausverwaltungen',
    price: '14,99',
    period: 'pro Monat',
    yearlyPrice: '143,90',
    credits: -1, // unlimited
    features: [
      { text: 'Unbegrenzte Credits', included: true, highlight: true },
      { text: 'Alle Rechner verfügbar', included: true },
      { text: 'Alle Formulare verfügbar', included: true },
      { text: 'PDF-Export ohne Wasserzeichen', included: true },
      { text: 'Berechnungen speichern', included: true },
      { text: 'KI-Assistent (unbegrenzt)', included: true },
    ],
    cta: 'Unlimited wählen',
    popular: false,
  },
]

const creditCosts = [
  { icon: Calculator, name: 'Einfache Rechner', description: 'Kaution, Mieterhöhung, etc.', cost: 1 },
  { icon: FileText, name: 'Standard Dokumente', description: 'Nebenkostenabrechnung, Protokolle', cost: 2 },
  { icon: Sparkles, name: 'Premium Dokumente', description: 'Rechtssichere Verträge & Schreiben', cost: 3 },
  { icon: Zap, name: 'PDF-Export', description: 'Zusatz zu jeder Berechnung/Dokument', cost: 1 },
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
            Zahle nur für das, was du nutzt. Kaufe Credits und setze sie flexibel ein.
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
              Jährlich
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}
              >
                {plan.popular && (
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
                      {billingPeriod === 'yearly' && plan.yearlyPrice
                        ? (parseFloat(plan.yearlyPrice.replace(',', '.')) / 12).toFixed(2).replace('.', ',')
                        : plan.price}€
                    </span>
                    <span className="text-muted-foreground">/Monat</span>
                    {billingPeriod === 'yearly' && plan.yearlyPrice && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.yearlyPrice}€ jährlich abgerechnet
                      </p>
                    )}
                  </div>

                  {/* Credits Badge */}
                  <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">
                        {plan.credits === -1 ? '∞ Unbegrenzt' : `${plan.credits} Credits/Monat`}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-success'}`} />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular ? 'gradient-vermieter text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
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
              <h3 className="font-semibold mb-2">Plan wählen</h3>
              <p className="text-sm text-muted-foreground">
                Wähle einen Plan mit Credits, die zu deinem Bedarf passen.
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
                Credits werden jeden Monat aufgefüllt. Ungenutzte verfallen.
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
                    Pro-Nutzer erhalten 50 KI-Nachrichten pro Monat, Unlimited-Nutzer unbegrenzt.
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
          <h2 className="text-2xl font-bold text-center mb-8">Häufige Fragen</h2>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Was passiert, wenn meine Credits aufgebraucht sind?</h3>
              <p className="text-muted-foreground text-sm">
                Du kannst jederzeit auf einen höheren Plan upgraden. Alternativ warte bis zum nächsten Monat,
                wenn deine Credits wieder aufgefüllt werden.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Kann ich jederzeit kündigen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kündigen.
                Keine versteckten Fristen oder Gebühren.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Werden ungenutzte Credits übertragen?</h3>
              <p className="text-muted-foreground text-sm">
                Nein, Credits verfallen am Ende jedes Abrechnungszeitraums und werden neu aufgefüllt.
                Wähle einen Plan, der zu deiner tatsächlichen Nutzung passt.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h3>
              <p className="text-muted-foreground text-sm">
                Wir akzeptieren alle gängigen Kreditkarten, SEPA-Lastschrift und PayPal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
