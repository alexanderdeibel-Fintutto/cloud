// Stripe Configuration for FitTutto Fitness Training App
// Price IDs can be overridden via environment variables

const env = (key: string, fallback: string) =>
  (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || fallback

export interface FitTuttoPricingTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyPriceId: string
  yearlyPriceId: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

export const FITTUTTO_PRICING_TIERS: FitTuttoPricingTier[] = [
  {
    id: 'free',
    name: 'Kostenlos',
    description: 'Perfekt zum Ausprobieren',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    features: [
      'Grundlegende Trainingsplaene',
      'Standard-Uebungsbibliothek',
      'Kein Speichern moeglich',
    ],
  },
  {
    id: 'save_load',
    name: 'Speichern & Laden',
    description: 'Speichere und lade deine Plaene',
    monthlyPrice: 2.99,
    yearlyPrice: 28.70,
    monthlyPriceId: env('VITE_STRIPE_FITTUTTO_SAVE_MONTHLY', 'price_1T2vXG52lqSgjCze5i2I5xwC'),
    yearlyPriceId: env('VITE_STRIPE_FITTUTTO_SAVE_YEARLY', 'price_1T2vXH52lqSgjCzeemuiOCVE'),
    features: [
      'Trainingsplaene speichern & laden',
      'Ernaehrungsplaene speichern & laden',
      'Standard-Uebungsbibliothek',
      'Fortschritts-Tracking',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Individuelle Plaene & Analysen',
    monthlyPrice: 4.99,
    yearlyPrice: 47.90,
    monthlyPriceId: env('VITE_STRIPE_FITTUTTO_BASIC_MONTHLY', 'price_1T2vXI52lqSgjCzeJJmxIrv2'),
    yearlyPriceId: env('VITE_STRIPE_FITTUTTO_BASIC_YEARLY', 'price_1T2vXI52lqSgjCze9Slm5bX3'),
    features: [
      'Alles aus Speichern & Laden',
      'Individuelle Trainingsplaene',
      'Ernaehrungstracking mit Makros',
      'KI-Uebungsvorschlaege',
      'Fortschritts-Analysen',
      'E-Mail Support',
    ],
    highlighted: true,
    badge: 'Beliebt',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Alles inkl. KI-Coach & Export',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    monthlyPriceId: env('VITE_STRIPE_FITTUTTO_PREMIUM_MONTHLY', 'price_1T2vXJ52lqSgjCzeeb7z4Fjx'),
    yearlyPriceId: env('VITE_STRIPE_FITTUTTO_PREMIUM_YEARLY', 'price_1T2vXJ52lqSgjCzeHuMOlllM'),
    features: [
      'Alles aus Basic',
      'KI-Coach mit Trainings-Tipps',
      'Ernaehrungsberatung per KI',
      'Body-Tracking mit Grafiken',
      'Erweiterte Statistiken',
      'Unbegrenzte Trainingsplaene',
      'PDF-Export',
      'Prioritaets-Support',
    ],
  },
]

export function getFitTuttoTierById(tierId: string): FitTuttoPricingTier | undefined {
  return FITTUTTO_PRICING_TIERS.find(t => t.id === tierId)
}

export function getFitTuttoPriceId(tierId: string, interval: 'monthly' | 'yearly'): string {
  const tier = getFitTuttoTierById(tierId)
  if (!tier) return ''
  return interval === 'monthly' ? tier.monthlyPriceId : tier.yearlyPriceId
}
