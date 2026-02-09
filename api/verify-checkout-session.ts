import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: session.payment_status,
      })
    }

    // Extract metadata
    const { userId, tierId, checksLimit } = session.metadata || {}
    const customerEmail = session.customer_email || (session.customer as Stripe.Customer)?.email
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

    // Update user in database if we have a userId
    if (userId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          tier: tierId || 'basic',
          checks_limit: checksLimit ? parseInt(checksLimit) : 3,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Database update error:', updateError)
        // Don't fail the request - webhook will handle this as backup
      }
    } else if (customerEmail) {
      // Fallback: find user by email
      const { error: updateError } = await supabase
        .from('users')
        .update({
          tier: tierId || 'basic',
          checks_limit: checksLimit ? parseInt(checksLimit) : 3,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('email', customerEmail)

      if (updateError) {
        console.error('Database update error (by email):', updateError)
      }
    }

    return res.status(200).json({
      success: true,
      tier: tierId || 'basic',
      checksLimit: checksLimit ? parseInt(checksLimit) : 3,
      customerEmail,
    })
  } catch (error) {
    console.error('Session verification error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session',
        details: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to verify session',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
