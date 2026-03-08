// Shared Stripe client-side utilities for all Fintutto apps

export function getStripePublishableKey(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  }
  return ''
}

export interface CheckoutOptions {
  priceId: string
  userId: string
  userEmail: string
  tierId: string
  /** Stripe product key for entitlement mapping (e.g. 'fintutto_finance_coach_premium') */
  productKey?: string
  /** Custom success URL (defaults to /checkout/success) */
  successUrl?: string
  /** Custom cancel URL (defaults to /checkout/cancel) */
  cancelUrl?: string
  /** Referral code if user was referred */
  referralCode?: string
}

export async function createCheckoutSession(
  priceIdOrOptions: string | CheckoutOptions,
  userId?: string,
  userEmail?: string,
  tierId?: string
): Promise<string> {
  // Support both old positional args and new options object
  const opts: CheckoutOptions = typeof priceIdOrOptions === 'string'
    ? { priceId: priceIdOrOptions, userId: userId!, userEmail: userEmail!, tierId: tierId! }
    : priceIdOrOptions

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || 'Failed to create checkout session')
  }

  const { url } = await response.json()
  return url
}
