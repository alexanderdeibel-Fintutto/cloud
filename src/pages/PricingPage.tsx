import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Users, Sparkles, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PLANS_LIST, Plan } from '@/lib/credits'
import { createCheckoutSession } from '@/lib/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Zap,
  mieter_basic: Shield,
  vermieter_basic: Users,
  kombi_pro: Sparkles,
  unlimited: Crown,
}

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { user, profile } = useAuth()
  const userPlan = profile?.tier || 'free'

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === 'free') {
      toast.info('Sie nutzen bereits den kostenlosen Plan.')
      return
    }

    const priceId = billingInterval === 'monthly'
      ? plan.stripePriceIdMonthly
      : plan.stripePriceIdYearly

    if (!priceId) {
      toast.error('Dieser Plan ist noch nicht verfuegbar.')
      return
    }

    setLoadingPlan(plan.id)

    try {
      toast.info('Stripe Checkout wird vorbereitet...')

      const url = await createCheckoutSession(
        priceId,
        user?.id || '',
        user?.email || '',
        plan.id
      )

      if (url) {
        window.location.href = url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Fehler beim Starten der Zahlung.', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      })
      setLoadingPlan(null)
    }
  }

  const getButtonText = (plan: Plan) => {
    if (plan.id === 'free') return 'Aktueller Plan'
    if (userPlan === plan.id) return 'Aktueller Plan'
    if (loadingPlan === plan.id) return 'Wird geladen...'
    return 'Jetzt starten'
  }

  const isCurrentPlan = (plan: Plan) => {
    return plan.id === userPlan
  }

  const isHighlighted = (plan: Plan) => {
    return plan.id === 'kombi_pro'
  }

  const formatPrice = (cents: number): string => {
    return (cents / 100).toFixed(2).replace('.', ',') + ' \u20AC'
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
              Nutzen Sie Checker, Rechner und Formulare mit unserem flexiblen Credit-System.
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
                -20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {PLANS_LIST.map((plan, index) => {
            const Icon = PLAN_ICONS[plan.id] || Zap
            const highlighted = isHighlighted(plan)

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <Card
                  className={cn(
                    'relative h-full flex flex-col',
                    highlighted && 'border-fintutto-primary border-2 shadow-lg',
                    isCurrentPlan(plan) && 'ring-2 ring-green-500'
                  )}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-fintutto-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                        Beliebt
                      </span>
                    </div>
                  )}

                  {isCurrentPlan(plan) && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Aktiv
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-fintutto-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-fintutto-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">
                        {plan.price === 0
                          ? '0 \u20AC'
                          : formatPrice(billingInterval === 'monthly' ? plan.price : plan.yearlyPrice)
                        }
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{billingInterval === 'monthly' ? 'Monat' : 'Jahr'}
                        </span>
                      )}
                    </div>

                    <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg font-semibold text-fintutto-primary">
                        {plan.monthlyCredits === -1 ? 'Unbegrenzt' : plan.monthlyCredits}
                      </span>
                      <span className="text-gray-600 ml-1">
                        Credits/Monat
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant={highlighted ? 'fintutto' : 'outline'}
                      className="w-full"
                      size="lg"
                      disabled={isCurrentPlan(plan) || loadingPlan === plan.id}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {getButtonText(plan)}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
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
                <h3 className="font-semibold mb-2">Was passiert mit nicht genutzten Credits?</h3>
                <p className="text-gray-600">
                  Nicht genutzte Credits verfallen am Ende des Abrechnungszeitraums und werden nicht uebertragen.
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
