import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Dumbbell, Save, Star, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FITTUTTO_PRICING_TIERS, FitTuttoPricingTier } from '@/lib/stripe-fittutto'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'

const TIER_ICONS: Record<string, typeof Dumbbell> = {
  free: Dumbbell,
  save_load: Save,
  basic: Star,
  premium: Crown,
}

export default function FitTuttoPricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const { user } = useAuth()
  const { profile: fitnessProfile } = useFitness()

  const handleSubscribe = async (tier: FitTuttoPricingTier) => {
    if (tier.id === 'free') {
      toast.info('Du nutzt bereits den kostenlosen Plan.')
      return
    }

    if (!user) {
      toast.error('Bitte melde dich zuerst an.', {
        description: 'Du musst eingeloggt sein, um ein Abo abzuschliessen.',
        action: {
          label: 'Anmelden',
          onClick: () => { window.location.href = '/login' },
        },
      })
      return
    }

    setLoadingTier(tier.id)

    try {
      const priceId = billingInterval === 'monthly' ? tier.monthlyPriceId : tier.yearlyPriceId

      if (!priceId) {
        throw new Error('Kein Preis fuer diesen Plan gefunden')
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
          tierId: tier.id,
          app: 'fittutto',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Checkout fehlgeschlagen')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('Keine Checkout-URL erhalten')
      }
    } catch (error) {
      toast.error('Fehler beim Starten der Zahlung.', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      })
    } finally {
      setLoadingTier(null)
    }
  }

  const isCurrentPlan = (tier: FitTuttoPricingTier) => {
    return fitnessProfile?.subscriptionTier === tier.id
  }

  const getButtonText = (tier: FitTuttoPricingTier) => {
    if (isCurrentPlan(tier)) return 'Aktueller Plan'
    if (tier.id === 'free') return 'Kostenlos starten'
    if (loadingTier === tier.id) return 'Wird geladen...'
    return 'Jetzt starten'
  }

  const yearlySavingsPercent = (tier: FitTuttoPricingTier) => {
    if (tier.monthlyPrice === 0) return 0
    const yearlyFromMonthly = tier.monthlyPrice * 12
    return Math.round((1 - tier.yearlyPrice / yearlyFromMonthly) * 100)
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
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Dumbbell className="w-4 h-4" />
              FitTutto Fitness
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Waehle deinen Fitness-Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trainingsplaene, Ernaehrungstracking und KI-Coaching.
              Starte kostenlos und upgrade bei Bedarf.
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
                  ? 'bg-orange-500 text-white'
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
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Jaehrlich
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Spare bis zu 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FITTUTTO_PRICING_TIERS.map((tier, index) => {
            const Icon = TIER_ICONS[tier.id] || Dumbbell
            const savings = yearlySavingsPercent(tier)

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <Card
                  className={cn(
                    'relative h-full flex flex-col',
                    tier.highlighted && 'border-orange-500 border-2 shadow-lg',
                    isCurrentPlan(tier) && 'ring-2 ring-green-500'
                  )}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-sm font-medium px-3 py-1 rounded-full">
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
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-600" />
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
                      {billingInterval === 'yearly' && savings > 0 && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          {savings}% gespart
                        </div>
                      )}
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
                      className={cn(
                        'w-full',
                        tier.highlighted && 'bg-orange-500 hover:bg-orange-600'
                      )}
                      size="lg"
                      disabled={isCurrentPlan(tier) || loadingTier === tier.id}
                      onClick={() => handleSubscribe(tier)}
                    >
                      {getButtonText(tier)}
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
                  Ja, du kannst dein Abo jederzeit kuendigen. Es gibt keine Mindestlaufzeit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Was ist der Unterschied zwischen Basic und Premium?</h3>
                <p className="text-gray-600">
                  Basic bietet individuelle Trainings- und Ernaehrungsplaene mit Analysen.
                  Premium beinhaltet zusaetzlich KI-gestuetztes Coaching, unbegrenzte Plaene und PDF-Export.
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
      </div>
    </div>
  )
}
