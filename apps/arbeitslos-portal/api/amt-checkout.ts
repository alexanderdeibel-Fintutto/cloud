import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
})

// Plan limits matching credits.ts PLANS config
const PLAN_LIMITS: Record<string, {
  chatMessagesPerDay: number
  lettersPerMonth: number
  bescheidScansPerMonth: number
  creditsPerMonth: number
}> = {
  starter: {
    chatMessagesPerDay: 10,
    lettersPerMonth: 1,
    bescheidScansPerMonth: 3,
    creditsPerMonth: 10,
  },
  kaempfer: {
    chatMessagesPerDay: -1,
    lettersPerMonth: 3,
    bescheidScansPerMonth: -1,
    creditsPerMonth: 25,
  },
  vollschutz: {
    chatMessagesPerDay: -1,
    lettersPerMonth: -1,
    bescheidScansPerMonth: -1,
    creditsPerMonth: 50,
  },
}

// Maps planId + interval -> Stripe Price ID env var name
function getPriceIdEnvName(planId: string, interval: string): string {
  const intervalUpper = interval === 'yearly' ? 'YEARLY' : 'MONTHLY'
  const planUpper = planId.toUpperCase()
  return `STRIPE_PRICE_${planUpper}_${intervalUpper}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId: priceIdFromBody, userId, userEmail, planId, interval } = req.body

    if (!planId) {
      return res.status(400).json({ error: 'planId ist erforderlich' })
    }

    if (!['starter', 'kaempfer', 'vollschutz'].includes(planId)) {
      return res.status(400).json({ error: 'Ungueltige planId. Erlaubt: starter, kaempfer, vollschutz.' })
    }

    // Resolve price ID: prefer body param (legacy), fall back to env var lookup
    const intervalNormalized = interval === 'yearly' ? 'yearly' : 'monthly'
    const priceIdEnvName = getPriceIdEnvName(planId, intervalNormalized)
    const priceId = priceIdFromBody || process.env[priceIdEnvName]

    if (!priceId) {
      return res.status(500).json({
        error: `Stripe Price ID nicht konfiguriert. Setze die Umgebungsvariable ${priceIdEnvName} in Vercel.`,
      })
    }

    const planLimits = PLAN_LIMITS[planId]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard?checkout=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/preise?checkout=cancel`,
      customer_email: userEmail || undefined,
      metadata: {
        app: 'bescheidboxer',
        userId: userId || '',
        planId,
        interval: intervalNormalized,
        chatMessagesPerDay: String(planLimits.chatMessagesPerDay),
        lettersPerMonth: String(planLimits.lettersPerMonth),
        bescheidScansPerMonth: String(planLimits.bescheidScansPerMonth),
        creditsPerMonth: String(planLimits.creditsPerMonth),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'de',
      tax_id_collection: { enabled: true },
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('BescheidBoxer checkout error:', error)
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
