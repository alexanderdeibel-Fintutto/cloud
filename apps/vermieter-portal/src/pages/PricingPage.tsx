import { CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const plans = [
  {
    name: 'Free',
    description: 'Für Einsteiger',
    price: '0',
    period: 'für immer',
    features: [
      'Alle Rechner unbegrenzt',
      'Alle Formulare nutzen',
      'PDF-Export (mit Wasserzeichen)',
      'E-Mail Support',
    ],
    cta: 'Kostenlos starten',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Für aktive Vermieter',
    price: '9,99',
    period: 'pro Monat',
    yearlyPrice: '95,90',
    features: [
      'Alles aus Free',
      'PDF-Export ohne Wasserzeichen',
      'Berechnungen speichern',
      'Formulare archivieren',
      'Prioritäts-Support',
      'Automatische Updates',
    ],
    cta: 'Pro werden',
    popular: true,
  },
  {
    name: 'Business',
    description: 'Für Hausverwaltungen',
    price: '29,99',
    period: 'pro Monat',
    yearlyPrice: '287,90',
    features: [
      'Alles aus Pro',
      'Mehrere Objekte verwalten',
      'Team-Zugang (5 Nutzer)',
      'API-Zugang',
      'Eigenes Branding',
      'Dedizierter Support',
    ],
    cta: 'Kontakt aufnehmen',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-vermieter py-16">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Einfache, transparente Preise
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Starte kostenlos und upgrade wenn du mehr brauchst.
            Keine versteckten Kosten.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="gradient-vermieter text-white text-xs font-medium px-4 py-1 rounded-full">
                      Empfohlen
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                    {plan.yearlyPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        oder {plan.yearlyPrice}€/Jahr (2 Monate gratis)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span>{feature}</span>
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

      {/* FAQ */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Häufige Fragen</h2>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Kann ich jederzeit kündigen?</h3>
              <p className="text-muted-foreground text-sm">
                Ja, du kannst dein Abo jederzeit zum Ende des Abrechnungszeitraums kündigen.
                Keine versteckten Fristen oder Gebühren.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h3>
              <p className="text-muted-foreground text-sm">
                Wir akzeptieren alle gängigen Kreditkarten, SEPA-Lastschrift und PayPal.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">Gibt es eine Testphase?</h3>
              <p className="text-muted-foreground text-sm">
                Der Free-Plan ist dauerhaft kostenlos. Du kannst alle Rechner und Formulare
                ohne Einschränkungen nutzen, nur der PDF-Export hat ein Wasserzeichen.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
