import { useAppConfig, useCheckout } from '@fintutto/core'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge } from '@fintutto/ui'
import { Check } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: '',
    features: ['Dashboard', '3 Rechner pro Monat', '1 Checker pro Monat'],
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '9,99',
    period: '/Monat',
    features: ['Alles aus Free', 'Bis zu 3 Immobilien', '10 Rechner pro Monat', '5 Checker pro Monat', 'KI-Assistent (Basis)'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '24,99',
    period: '/Monat',
    features: ['Alles aus Starter', 'Bis zu 20 Immobilien', 'Unbegrenzte Rechner & Checker', 'KI-Assistent (Erweitert)', 'Bescheide-Prüfung', 'PDF-Export'],
    highlighted: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '49,99',
    period: '/Monat',
    features: ['Alles aus Pro', 'Unbegrenzte Immobilien', 'Unbegrenzter KI-Assistent', 'Priority Support', 'API-Zugang'],
    highlighted: false,
  },
]

export default function PricingPage() {
  const config = useAppConfig()
  const { checkout, isAuthenticated } = useCheckout()

  const handleCheckout = (planId: string) => {
    const priceId = config.stripe.products[planId]?.monthly
    if (priceId) {
      checkout(priceId)
    }
  }

  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Preise</h1>
        <p className="mt-2 text-muted-foreground">
          Wähle den passenden Plan für deine Bedürfnisse
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Beliebt</Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={() => handleCheckout(plan.id)}
                disabled={plan.id === 'free'}
              >
                {plan.id === 'free' ? 'Aktueller Plan' : 'Auswählen'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
