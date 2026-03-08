import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PLAN_CREDIT_LIMITS } from '../packages/shared/src/credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, tierId, productKey, successUrl, cancelUrl, referralCode } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    const origin = req.headers.origin || ''

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || '',
        tierId: tierId || '',
        creditsLimit: String(PLAN_CREDIT_LIMITS[tierId] || 3),
        productKey: productKey || '',
        referralCode: referralCode || '',
      },
      subscription_data: productKey ? {
        metadata: {
          productKey: productKey,
        },
      } : undefined,
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
