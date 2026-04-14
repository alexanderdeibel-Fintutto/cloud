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

/**
 * Resolves the Stripe Price ID for a given plan + interval.
 *
 * Strategy (in order):
 * 1. Explicit priceId in request body (legacy)
 * 2. Stripe Lookup Key: "bescheidboxer_<planId>_<interval>"
 *    (you set the lookup_key on each Price in Stripe Dashboard)
 * 3. Env var fallback: STRIPE_PRICE_<PLAN>_<INTERVAL>
 *
 * Using Lookup Keys is strongly preferred - you configure prices in
 * Stripe Dashboard once and don't need to redeploy to change them.
 */
async function resolvePriceId(
  planId: string,
  interval: string,
  bodyPriceId?: string,
): Promise<{ priceId: string | null; error?: string }> {
  // 1. Explicit priceId from request body
  if (bodyPriceId) {
    return { priceId: bodyPriceId }
  }

  const intervalNormalized = interval === 'yearly' ? 'yearly' : 'monthly'

  // 2. Stripe Lookup Key
  const lookupKey = `bescheidboxer_${planId}_${intervalNormalized}`
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    })
    if (prices.data.length > 0) {
      return { priceId: prices.data[0].id }
    }
  } catch (err) {
    console.warn(`Lookup key search failed for ${lookupKey}:`, err)
  }

  // 3. Env var fallback
  const envName = `STRIPE_PRICE_${planId.toUpperCase()}_${intervalNormalized.toUpperCase()}`
  const envValue = process.env[envName]
  if (envValue) {
    return { priceId: envValue }
  }

  return {
    priceId: null,
    error:
      `Kein Stripe-Preis fuer ${planId} (${intervalNormalized}) gefunden. ` +
      `Setze entweder einen Lookup Key "${lookupKey}" auf dem Price im Stripe Dashboard ` +
      `oder die Umgebungsvariable ${envName} in Vercel.`,
  }
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

    const intervalNormalized = interval === 'yearly' ? 'yearly' : 'monthly'
    const resolved = await resolvePriceId(planId, intervalNormalized, priceIdFromBody)

    if (!resolved.priceId) {
      return res.status(500).json({ error: resolved.error || 'Stripe-Preis nicht gefunden' })
    }

    const planLimits = PLAN_LIMITS[planId]

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: resolved.priceId,
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
