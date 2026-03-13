import { useState } from 'react'
import {
  Check,
  Crown,
  Zap,
  Shield,
  Star,
  ArrowRight,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyPriceId: string
  yearlyPriceId: string
  checks: string
  einsprueche: string
  features: string[]
  highlighted?: boolean
  badge?: string
  icon: React.ElementType
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Kostenlos',
    description: 'Zum Ausprobieren',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    checks: '3 / Monat',
    einsprueche: '-',
    icon: Star,
    features: [
      '3 Bescheid-Pruefungen',
      'Alle Steuerarten',
      'Grundlegende Analyse',
      'Fristen-Uebersicht',
      'Community-Support',
    ],
  },
  {
    id: 'basic',
    name: 'Basis',
    description: 'Fuer Einzelpersonen',
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    monthlyPriceId: 'price_bescheidboxer_basic_monthly',
    yearlyPriceId: 'price_bescheidboxer_basic_yearly',
    checks: '20 / Monat',
    einsprueche: '5 / Monat',
    icon: Zap,
    highlighted: true,
    badge: 'Beliebt',
    features: [
      '20 Bescheid-Pruefungen',
      'Alle Steuerarten',
      'Detaillierte KI-Analyse',
      '5 Einspruch-Generierungen',
      'Fristen-Erinnerungen (E-Mail)',
      'CSV & PDF Export',
      'E-Mail-Support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Fuer Vielnutzer',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    monthlyPriceId: 'price_bescheidboxer_premium_monthly',
    yearlyPriceId: 'price_bescheidboxer_premium_yearly',
    checks: '100 / Monat',
    einsprueche: '50 / Monat',
    icon: Crown,
    features: [
      '100 Bescheid-Pruefungen',
      'Alle Steuerarten',
      'Premium KI-Analyse',
      '50 Einspruch-Generierungen',
      'Einspruch-Vorlagen',
      'Fristen-Erinnerungen (E-Mail + Push)',
      'PDF-Bericht Export',
      'Prioritaets-Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Fuer Steuerberater',
    monthlyPrice: 24.99,
    yearlyPrice: 249.99,
    monthlyPriceId: 'price_bescheidboxer_pro_monthly',
    yearlyPriceId: 'price_bescheidboxer_pro_yearly',
    checks: 'Unbegrenzt',
    einsprueche: 'Unbegrenzt',
    icon: Shield,
    features: [
      'Unbegrenzte Pruefungen',
      'Alle Steuerarten',
      'Premium KI-Analyse + Prioritaet',
      'Unbegrenzte Einsprueche',
      'Alle Vorlagen & Templates',
      'Multi-Mandanten-Verwaltung',
      'API-Zugang',
      'Persoenlicher Support',
      'White-Label Option',
    ],
  },
]

export default function UpgradePage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState<string | null>(null)

  const currentTier = profile?.tier || 'free'

  const handleCheckout = async (plan: PricingPlan) => {
    if (plan.id === 'free') return
    if (plan.id === currentTier) return

    const priceId = billing === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId
    if (!priceId) {
      toast({
        title: 'Hinweis',
        description: 'Stripe-Integration wird eingerichtet. Bitte kontaktieren Sie support@fintutto.de',
      })
      return
    }

    setLoading(plan.id)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/einstellungen?upgrade=success`,
          cancelUrl: `${window.location.origin}/upgrade`,
          metadata: {
            userId: profile?.id,
            tierId: plan.id,
          },
        }),
      })

      if (!response.ok) throw new Error('Checkout fehlgeschlagen')

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      toast({
        title: 'Hinweis',
        description: 'Stripe-Checkout wird eingerichtet. Bitte kontaktieren Sie support@fintutto.de fuer ein manuelles Upgrade.',
      })
    } finally {
      setLoading(null)
    }
  }

  const yearlyDiscount = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 0
    const monthlyCost = plan.monthlyPrice * 12
    return Math.round(((monthlyCost - plan.yearlyPrice) / monthlyCost) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Steuer-Bescheidprüfer upgraden</h1>
        <p className="text-muted-foreground mt-2">
          Waehlen Sie den passenden Tarif fuer Ihre Beduerfnisse.
          Alle Tarife beinhalten eine 14-taegige Geld-zurueck-Garantie.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling('monthly')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Monatlich
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Jaehrlich
          <Badge variant="success" className="ml-2 text-[10px]">Spare bis zu 17%</Badge>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentTier
          const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentTier)
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
          const discount = yearlyDiscount(plan)

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? 'border-fintutto-blue-500 dark:border-fintutto-blue-400 shadow-lg ring-1 ring-fintutto-blue-500/20'
                  : ''
              } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-fintutto-blue-500 text-white shadow-md">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`rounded-xl p-3 w-fit mx-auto mb-2 ${
                  plan.highlighted
                    ? 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40'
                    : 'bg-muted'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    plan.highlighted
                      ? 'text-fintutto-blue-600 dark:text-fintutto-blue-400'
                      : 'text-muted-foreground'
                  }`} />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {price === 0 ? 'Gratis' : `${price.toFixed(2).replace('.', ',')} \u20AC`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        / {billing === 'monthly' ? 'Monat' : 'Jahr'}
                      </span>
                    )}
                  </div>
                  {billing === 'yearly' && discount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {discount}% gespart gegenueber monatlich
                    </p>
                  )}
                  {billing === 'yearly' && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      = {(plan.yearlyPrice / 12).toFixed(2).replace('.', ',')} EUR / Monat
                    </p>
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Pruefungen</p>
                    <p className="text-sm font-bold">{plan.checks}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2 text-center">
                    <p className="text-xs text-muted-foreground">Einsprueche</p>
                    <p className="text-sm font-bold">{plan.einsprueche}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <Button variant="outline" disabled className="w-full">
                    Aktueller Tarif
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="ghost" disabled className="w-full text-muted-foreground">
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    className={`w-full gap-2 ${plan.highlighted ? 'bg-fintutto-blue-600 hover:bg-fintutto-blue-700' : ''}`}
                    onClick={() => handleCheckout(plan)}
                    disabled={loading === plan.id}
                  >
                    {loading === plan.id ? (
                      'Weiterleitung...'
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        {plan.monthlyPrice === 0 ? 'Aktuell' : 'Jetzt upgraden'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Trust Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>SSL-verschluesselt</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            <span>Stripe-Zahlungen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>Jederzeit kuendbar</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Alle Preise inkl. MwSt. Zahlung ueber Stripe (Kreditkarte, SEPA-Lastschrift, PayPal).
          Sie koennen Ihr Abo jederzeit zum Ende des Abrechnungszeitraums kuendigen.
        </p>
      </div>
    </div>
  )
}
