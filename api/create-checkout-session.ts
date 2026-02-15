import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Map tier IDs to check limits
const TIER_LIMITS: Record<string, number> = {
  basic: 3,
  premium: -1, // unlimited
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, tierId, couponId, trialDays, appId, bundleId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
        checksLimit: String(TIER_LIMITS[tierId] || 3),
        appId: appId || 'mieter-checker',
        bundleId: bundleId || '',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'de',
      currency: 'eur',
    }

    // #15: Apply referral coupon if provided (1 Monat gratis fuer Geworbenen)
    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }]
      delete sessionParams.allow_promotion_codes
    }

    // #18: Add trial period if specified (7 Tage Standard)
    if (trialDays && trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
