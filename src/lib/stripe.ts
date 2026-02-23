// Stripe Configuration for Fintutto Checker
// Update these price IDs with your actual Stripe price IDs

export interface PricingTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyPriceId: string
  yearlyPriceId: string
  checksPerMonth: number | 'unlimited'
  features: string[]
  highlighted?: boolean
  badge?: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Kostenlos',
    description: 'Perfekt zum Ausprobieren',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    checksPerMonth: 1,
    features: [
      '1 Berechnung pro Monat',
      'Alle 10 Checker verfuegbar',
      'Sofortige Ergebnisse',
      'Kein Speichern moeglich',
    ],
  },
  {
    id: 'basic',
    name: 'Basis',
    description: 'Fuer gelegentliche Nutzung',
    monthlyPrice: 0.99,
    yearlyPrice: 9.99,
    monthlyPriceId: 'price_1Sxc4652lqSgjCzeEKVlLxwP',
    yearlyPriceId: 'price_1Sxc4652lqSgjCzeoHFU2Ykn',
    checksPerMonth: 3,
    features: [
      '3 Berechnungen pro Monat',
      'Alle 10 Checker verfuegbar',
      'Ergebnisse speichern',
      'Aendern & neu berechnen',
      'E-Mail Support',
    ],
    highlighted: true,
    badge: 'Beliebt',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Fuer unbegrenzte Nutzung',
    monthlyPrice: 3.99,
    yearlyPrice: 39.99,
    monthlyPriceId: 'price_1Sxc4752lqSgjCzeRlMLZeP5',
    yearlyPriceId: 'price_1Sxc4752lqSgjCzeC971KXL0',
    checksPerMonth: 'unlimited',
    features: [
      'Unbegrenzte Berechnungen',
      'Alle 10 Checker verfuegbar',
      'Unbegrenzt speichern',
      'Aendern & neu berechnen',
      'Prioritaets-Support',
      'PDF-Export',
    ],
  },
]

