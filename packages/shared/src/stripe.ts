// Shared Stripe client-side utilities for all Fintutto apps

export function getStripePublishableKey(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  }
  return ''
}

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string,
  tierId: string
): Promise<string> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId,
      userEmail,
      tierId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || 'Failed to create checkout session')
  }

  const { url } = await response.json()
  return url
}
