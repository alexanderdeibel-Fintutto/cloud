// Stripe Utility Functions for Mieterportal

export function getStripePublishableKey(): string {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
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
