import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Check, X, Star, Crown, Dumbbell, Apple, TrendingUp,
  Heart, Brain, Shield, Users, ChevronRight, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { FITNESS_PLANS, formatPrice } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import type { SubscriptionTier } from '@/lib/types'

export default function PricingPage() {
  const { subscriptionTier, user } = useAuth()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const plans = Object.values(FITNESS_PLANS)

  const handleCheckout = async (planId: SubscriptionTier) => {
    const plan = FITNESS_PLANS[planId]
    if (!plan.stripePriceIdMonthly) return

    try {
      const priceId = billing === 'monthly' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user?.id || '',
          userEmail: user?.email || '',
          tierId: planId,
        }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  const FEATURE_MATRIX: { feature: string; free: boolean | string; save_load: boolean | string; basic: boolean | string; premium: boolean | string }[] = [
    { feature: 'KI-Trainingsplan erstellen', free: true, save_load: true, basic: true, premium: true },
    { feature: '500+ Übungen mit Anleitungen', free: true, save_load: true, basic: true, premium: true },
    { feature: 'Basis-Trainingsansicht', free: true, save_load: true, basic: true, premium: true },
    { feature: 'Pläne speichern & laden', free: false, save_load: true, basic: true, premium: true },
    { feature: 'Mehrere Pläne verwalten', free: false, save_load: true, basic: true, premium: true },
    { feature: 'Werbefrei', free: false, save_load: true, basic: true, premium: true },
    { feature: 'Ausführliche Beschreibungen', free: false, save_load: true, basic: true, premium: true },
    { feature: 'Ernährungstracking', free: false, save_load: false, basic: true, premium: true },
    { feature: 'Makro-Tracking', free: false, save_load: false, basic: true, premium: true },
    { feature: 'Fortschrittsstatistiken', free: 'Basis', save_load: 'Basis', basic: true, premium: true },
    { feature: 'Streaks & Gamification', free: false, save_load: false, basic: true, premium: true },
    { feature: 'Persönliche Rekorde', free: false, save_load: false, basic: true, premium: true },
    { feature: 'KI-Trainingsanpassungen', free: false, save_load: false, basic: true, premium: true },
    { feature: 'Trainingshistorie', free: '7 Tage', save_load: '30 Tage', basic: 'Unbegrenzt', premium: 'Unbegrenzt' },
    { feature: '300+ Mobility-Übungen', free: false, save_load: false, basic: false, premium: true },
    { feature: 'KI-Ernährungsberater', free: false, save_load: false, basic: false, premium: true },
    { feature: 'Barcode-Scanner', free: false, save_load: false, basic: false, premium: true },
    { feature: 'Verletzungsprävention', free: false, save_load: false, basic: false, premium: true },
    { feature: 'Community-Zugang', free: false, save_load: false, basic: false, premium: true },
    { feature: 'Priority Support', free: false, save_load: false, basic: false, premium: true },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Dumbbell className="h-4 w-4" />
          FitTutto Preise
        </div>
        <h1 className="text-3xl font-bold mb-2">Wähle deinen Plan</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Starte kostenlos und upgrade jederzeit. Alle Pläne beinhalten Zugang zum Fintutto-Ökosystem.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <Tabs value={billing} onValueChange={v => setBilling(v as 'monthly' | 'yearly')}>
          <TabsList>
            <TabsTrigger value="monthly">Monatlich</TabsTrigger>
            <TabsTrigger value="yearly">
              Jährlich
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                -20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, i) => {
          const isCurrent = subscriptionTier === plan.id
          const price = billing === 'monthly' ? plan.price : plan.yearlyPrice
          const monthlyEquivalent = billing === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.price

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn(
                'relative h-full flex flex-col',
                plan.highlight && 'border-primary shadow-lg ring-1 ring-primary/20'
              )}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                      <Star className="h-3 w-3" />
                      Beliebt
                    </span>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <p className="text-sm font-semibold text-muted-foreground">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">
                      {formatPrice(monthlyEquivalent).replace(' €', '')}
                    </span>
                    <span className="text-sm text-muted-foreground">€/Monat</span>
                  </div>
                  {billing === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(price)} jährlich abgerechnet
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map(lim => (
                      <li key={lim} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 text-muted flex-shrink-0 mt-0.5" />
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Aktueller Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Link to="/onboarding" className="block">
                        <Button variant="outline" className="w-full">
                          Kostenlos starten
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant={plan.highlight ? 'fitness' : 'default'}
                        className="w-full"
                        onClick={() => handleCheckout(plan.id)}
                      >
                        {plan.highlight ? 'Jetzt starten' : 'Auswählen'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-center mb-6">Alle Features vergleichen</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Feature</th>
                {plans.map(p => (
                  <th key={p.id} className={cn('text-center py-3 px-2 font-medium', p.highlight && 'text-primary')}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map(row => (
                <tr key={row.feature} className="border-b">
                  <td className="py-2.5 px-2 text-muted-foreground">{row.feature}</td>
                  {(['free', 'save_load', 'basic', 'premium'] as const).map(tier => {
                    const val = row[tier]
                    return (
                      <td key={tier} className="text-center py-2.5 px-2">
                        {val === true ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : val === false ? (
                          <X className="h-4 w-4 text-muted mx-auto" />
                        ) : (
                          <span className="text-xs font-medium">{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fintutto Ecosystem */}
      <Card className="bg-primary/5 border-primary/20 text-center">
        <CardContent className="pt-8 pb-6">
          <Shield className="h-8 w-8 mx-auto text-primary mb-3" />
          <h3 className="text-lg font-bold mb-2">Teil des Fintutto-Ökosystems</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">
            Mit deinem FitTutto-Konto hast du Zugang zu allen Fintutto-Apps.
            Nutze Vermietify, Fintutto Portal, BescheidBoxer und mehr mit einem einzigen Konto.
          </p>
          <a href="https://portal.fintutto.cloud/apps">
            <Button variant="outline">
              Alle Fintutto-Apps entdecken
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">Häufige Fragen</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Kann ich jederzeit kündigen?',
              a: 'Ja, du kannst dein Abo jederzeit kündigen. Es läuft dann bis zum Ende der aktuellen Abrechnungsperiode.',
            },
            {
              q: 'Kann ich den Plan wechseln?',
              a: 'Ja, du kannst jederzeit upgraden oder downgraden. Bei einem Upgrade wird der Restbetrag verrechnet.',
            },
            {
              q: 'Gibt es eine Geld-zurück-Garantie?',
              a: 'Ja, wir bieten eine 14-tägige Geld-zurück-Garantie auf alle kostenpflichtigen Pläne.',
            },
            {
              q: 'Funktioniert die App auch offline?',
              a: 'Die Trainingsansicht und gespeicherte Pläne funktionieren offline. Für Ernährungstracking und KI-Features wird eine Internetverbindung benötigt.',
            },
          ].map(({ q, a }) => (
            <Card key={q}>
              <CardContent className="pt-4 pb-3">
                <p className="font-semibold text-sm">{q}</p>
                <p className="text-sm text-muted-foreground mt-1">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
