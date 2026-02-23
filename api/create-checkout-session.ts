import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Map tier IDs to check limits (portal + fittutto)
const TIER_LIMITS: Record<string, number> = {
  basic: 3,
  premium: -1, // unlimited
  // FitTutto tiers
  save_load: 0,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, tierId, app } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || '',
        tierId: tierId || '',
        app: app || 'portal',
        checksLimit: String(TIER_LIMITS[tierId] ?? 3),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'de',
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
