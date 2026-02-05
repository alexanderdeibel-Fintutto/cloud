import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PRICING_TIERS, PricingTier } from '@/lib/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const { user, profile } = useAuth()
  const userTier = profile?.tier || 'free'

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.id === 'free') {
      toast.info('Sie nutzen bereits den kostenlosen Plan.')
      return
    }

    if (!user) {
      toast.error('Bitte melden Sie sich an, um ein Abonnement abzuschliessen.')
      return
    }

    setLoadingTier(tier.id)

    try {
      const priceId = billingInterval === 'monthly' ? tier.monthlyPriceId : tier.yearlyPriceId

      // For now, show a message that Stripe integration is coming
      // In production, this would redirect to Stripe Checkout
      const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${priceId}?prefilled_email=${encodeURIComponent(user.email || '')}`

      // Check if price IDs are configured
      if (priceId.startsWith('price_')) {
        toast.info('Stripe Checkout wird vorbereitet...', {
          description: 'Die Zahlung wird in Kuerze aktiviert.',
        })

        // Simulate redirect for demo purposes
        setTimeout(() => {
          toast.success(`${tier.name} Plan ausgewaehlt!`, {
            description: 'Die Stripe-Integration wird in Kuerze live geschaltet.',
          })
          setLoadingTier(null)
        }, 1500)
      } else {
        // Production: redirect to Stripe Checkout
        window.location.href = stripeCheckoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Fehler beim Starten der Zahlung.')
      setLoadingTier(null)
    }
  }

  const getButtonText = (tier: PricingTier) => {
    if (tier.id === 'free') return 'Aktueller Plan'
    if (userTier === tier.id) return 'Aktueller Plan'
    if (loadingTier === tier.id) return 'Wird geladen...'
    return 'Jetzt starten'
  }

  const isCurrentPlan = (tier: PricingTier) => {
    return tier.id === 'free' ? userTier === 'free' : userTier === tier.id
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Waehlen Sie Ihren Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pruefen Sie Ihre Mieterrechte mit unseren leistungsstarken Checkern.
              Starten Sie kostenlos und upgraden Sie bei Bedarf.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex justify-center items-center gap-4"
          >
            <button
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                billingInterval === 'monthly'
                  ? 'bg-fintutto-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                billingInterval === 'yearly'
                  ? 'bg-fintutto-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Jaehrlich
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card
                className={cn(
                  'relative h-full flex flex-col',
                  tier.highlighted && 'border-fintutto-primary border-2 shadow-lg',
                  isCurrentPlan(tier) && 'ring-2 ring-green-500'
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-fintutto-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {isCurrentPlan(tier) && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Aktiv
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-fintutto-primary/10 flex items-center justify-center">
                    {tier.id === 'free' && <Zap className="w-6 h-6 text-fintutto-primary" />}
                    {tier.id === 'basic' && <Shield className="w-6 h-6 text-fintutto-primary" />}
                    {tier.id === 'premium' && <Sparkles className="w-6 h-6 text-fintutto-primary" />}
                    {tier.id === 'professional' && <Users className="w-6 h-6 text-fintutto-primary" />}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">
                      {formatCurrency(billingInterval === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice)}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-gray-500 ml-1">
                        /{billingInterval === 'monthly' ? 'Monat' : 'Jahr'}
                      </span>
                    )}
                  </div>

                  <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-fintutto-primary">
                      {tier.checksPerMonth === 'unlimited' ? 'Unbegrenzt' : tier.checksPerMonth}
                    </span>
                    <span className="text-gray-600 ml-1">
                      Checks/Monat
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={tier.highlighted ? 'fintutto' : 'outline'}
                    className="w-full"
                    size="lg"
                    disabled={isCurrentPlan(tier) || loadingTier === tier.id}
                    onClick={() => handleSubscribe(tier)}
                  >
                    {getButtonText(tier)}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Haeufig gestellte Fragen
          </h2>
          <div className="max-w-3xl mx-auto grid gap-6 text-left">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Kann ich jederzeit kuendigen?</h3>
                <p className="text-gray-600">
                  Ja, Sie koennen Ihr Abonnement jederzeit kuendigen. Es gibt keine Mindestlaufzeit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Was passiert mit nicht genutzten Checks?</h3>
                <p className="text-gray-600">
                  Nicht genutzte Checks verfallen am Ende des Abrechnungszeitraums und werden nicht uebertragen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h3>
                <p className="text-gray-600">
                  Wir akzeptieren alle gaengigen Kredit- und Debitkarten, SEPA-Lastschrift, sowie Apple Pay und Google Pay.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">SSL-verschluesselt</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">DSGVO-konform</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Sofortige Aktivierung</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
