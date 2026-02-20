// Stripe Configuration for FitTutto Fitness Training App
// Products and prices created via scripts/setup-stripe-fittutto.sh

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
    monthlyPriceId: 'price_1T2vXG52lqSgjCze5i2I5xwC',
    yearlyPriceId: 'price_1T2vXH52lqSgjCzeemuiOCVE',
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
    description: 'Grundlegende Fitness-Funktionen',
    monthlyPrice: 4.99,
    yearlyPrice: 47.90,
    monthlyPriceId: 'price_1T2vXI52lqSgjCzeJJmxIrv2',
    yearlyPriceId: 'price_1T2vXI52lqSgjCze9Slm5bX3',
    features: [
      'Alles aus Speichern & Laden',
      'Individuelle Trainingsplaene',
      'Ernaehrungsplaene mit Makros',
      'Fortschritts-Analysen',
      'E-Mail Support',
    ],
    highlighted: true,
    badge: 'Beliebt',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Alle Features inkl. KI-Coaching',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    monthlyPriceId: 'price_1T2vXJ52lqSgjCzeeb7z4Fjx',
    yearlyPriceId: 'price_1T2vXJ52lqSgjCzeHuMOlllM',
    features: [
      'Alles aus Basic',
      'KI-gestuetztes Coaching',
      'Erweiterte Analysen & Statistiken',
      'Unbegrenzte Trainingsplaene',
      'Prioritaets-Support',
      'PDF-Export',
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
