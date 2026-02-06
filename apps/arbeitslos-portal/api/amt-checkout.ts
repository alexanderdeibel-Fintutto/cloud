import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const AMT_PLAN_LIMITS = {
  plus: {
    chatQuestionsPerDay: 20,
    lettersPerMonth: 3,
  },
  premium: {
    chatQuestionsPerDay: -1, // unlimited
    lettersPerMonth: -1, // unlimited
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, planId } = req.body

    if (!priceId || !planId) {
      return res.status(400).json({ error: 'Price ID and Plan ID are required' })
    }

    if (!['plus', 'premium'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' })
    }

    const planLimits = AMT_PLAN_LIMITS[planId as keyof typeof AMT_PLAN_LIMITS]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/preise?checkout=cancel`,
      customer_email: userEmail || undefined,
      metadata: {
        app: 'amtshilfe',
        userId: userId || '',
        planId,
        chatQuestionsPerDay: String(planLimits.chatQuestionsPerDay),
        lettersPerMonth: String(planLimits.lettersPerMonth),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'de',
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Amtshilfe checkout error:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
