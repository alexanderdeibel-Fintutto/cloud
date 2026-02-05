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
    checksPerMonth: 3,
    features: [
      '3 Checks pro Monat',
      'Alle 10 Checker verfuegbar',
      'Sofortige Ergebnisse',
      'Basis-Analyse',
    ],
  },
  {
    id: 'basic',
    name: 'Basis',
    description: 'Fuer gelegentliche Nutzung',
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    monthlyPriceId: 'price_basic_monthly', // Update with actual Stripe price ID
    yearlyPriceId: 'price_basic_yearly', // Update with actual Stripe price ID
    checksPerMonth: 20,
    features: [
      '20 Checks pro Monat',
      'Alle 10 Checker verfuegbar',
      'Detaillierte Analyse',
      'PDF-Export',
      'E-Mail Support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Fuer regelmaessige Nutzer',
    monthlyPrice: 19.99,
    yearlyPrice: 199,
    monthlyPriceId: 'price_premium_monthly', // Update with actual Stripe price ID
    yearlyPriceId: 'price_premium_yearly', // Update with actual Stripe price ID
    checksPerMonth: 100,
    features: [
      '100 Checks pro Monat',
      'Alle 10 Checker verfuegbar',
      'Erweiterte KI-Analyse',
      'PDF-Export',
      'Prioritaets-Support',
      'Formulare vorausgefuellt',
    ],
    highlighted: true,
    badge: 'Beliebt',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Fuer Profis & Vermieter',
    monthlyPrice: 49.99,
    yearlyPrice: 499,
    monthlyPriceId: 'price_professional_monthly', // Update with actual Stripe price ID
    yearlyPriceId: 'price_professional_yearly', // Update with actual Stripe price ID
    checksPerMonth: 'unlimited',
    features: [
      'Unbegrenzte Checks',
      'Alle 10 Checker verfuegbar',
      'Premium KI-Analyse',
      'PDF-Export',
      'Telefon-Support',
      'Formulare vorausgefuellt',
      'API-Zugang',
      'Multi-User Accounts',
    ],
  },
]

export function getTierByChecks(checksUsed: number): PricingTier {
  const tier = PRICING_TIERS.find(t => {
    if (t.checksPerMonth === 'unlimited') return true
    return checksUsed < t.checksPerMonth
  })
  return tier || PRICING_TIERS[0]
}

export function getStripePublishableKey(): string {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
}

export async function createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string): Promise<string> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      successUrl,
      cancelUrl,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout session')
  }

  const { url } = await response.json()
  return url
}
