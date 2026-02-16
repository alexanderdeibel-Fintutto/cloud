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

// One-time purchase products (price in cents)
const ONE_TIME_PRODUCTS: Record<string, { name: string; price: number; description: string }> = {
  single_pdf_export: {
    name: 'PDF-Export (Einzelkauf)',
    price: 199, // 1.99 EUR
    description: 'Ein einzelner PDF-Export Ihres Checker-Ergebnisses',
  },
  full_checker_analysis: {
    name: 'Komplett-Analyse',
    price: 999, // 9.99 EUR
    description: 'Vollständige Analyse mit allen 10 Checkern',
  },
  ai_legal_report: {
    name: 'KI-Rechtsgutachten',
    price: 499, // 4.99 EUR
    description: 'Detailliertes KI-gestütztes Rechtsgutachten zu Ihrem Fall',
  },
  vermieter_complete_pack: {
    name: 'Vermieter-Komplettpaket',
    price: 1499, // 14.99 EUR
    description: 'Alle 7 Rechner + alle Vermieter-Formulare als PDF',
  },
  annual_nebenkosten_report: {
    name: 'Jahres-Nebenkostenreport',
    price: 799, // 7.99 EUR
    description: 'Automatische Jahresauswertung Ihrer Nebenkosten',
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { priceId, userId, userEmail, tierId, mode, productId, resultId } = req.body

    // One-time purchase mode
    if (mode === 'payment' && productId) {
      const product = ONE_TIME_PRODUCTS[productId]
      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID' })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
        cancel_url: `${req.headers.origin}/checkout/cancel`,
        customer_email: userEmail || undefined,
        metadata: {
          userId: userId || '',
          productId,
          purchaseType: 'one_time',
          resultId: resultId || '',
        },
        locale: 'de',
      })

      return res.status(200).json({ url: session.url })
    }

    // Subscription mode (existing logic)
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
        checksLimit: String(TIER_LIMITS[tierId] || 3),
        purchaseType: 'subscription',
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
