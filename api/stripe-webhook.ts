import Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Credit limits per plan (aligned with credits.ts)
const PLAN_CREDIT_LIMITS: Record<string, number> = {
  // Portal plans
  free: 3,
  mieter_basic: 15,
  vermieter_basic: 20,
  kombi_pro: 50,
  unlimited: -1,
  // Legacy plan names (backwards compatibility)
  basic: 3,
  premium: -1,
  // Vermietify plans
  starter: 3,
  pro: 30,
  enterprise: -1,
  // Mieter-Checker plans (mieterportal)
  mieter_checker_basis: 5,
  mieter_checker_premium: 15,
}

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId
        const tierId = session.metadata?.tierId
        const creditsLimit = parseInt(session.metadata?.creditsLimit || '3', 10)
        const customerEmail = session.customer_email
        const referralCode = session.metadata?.referralCode

        console.log('Checkout completed:', { userId, tierId, customerEmail, referralCode })

        let resolvedUserId = userId

        if (userId) {
          // Update existing user
          const { error } = await supabase
            .from('users')
            .update({
              tier: tierId,
              checks_limit: creditsLimit,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating user:', error)
          }
        } else if (customerEmail) {
          // Try to find user by email and update
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', customerEmail)
            .single()

          if (existingUser) {
            resolvedUserId = existingUser.id
            await supabase
              .from('users')
              .update({
                tier: tierId,
                checks_limit: creditsLimit,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
              })
              .eq('id', existingUser.id)
          }
        }

        // Process referral subscription reward
        if (resolvedUserId && tierId && tierId !== 'free') {
          await processReferralSubscription(resolvedUserId)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by stripe customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          const isActive = subscription.status === 'active'

          if (!isActive) {
            // Downgrade to free tier
            await supabase
              .from('users')
              .update({
                tier: 'free',
                checks_limit: PLAN_CREDIT_LIMITS.free,
              })
              .eq('id', user.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by stripe customer ID and downgrade
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({
              tier: 'free',
              checks_limit: PLAN_CREDIT_LIMITS.free,
              stripe_subscription_id: null,
            })
            .eq('id', user.id)
        }
        break
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}

// Process referral rewards when a referred user subscribes
async function processReferralSubscription(subscribedUserId: string) {
  try {
    // Find a referral where this user was the referred person and status is 'signed_up'
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, referrer_user_id, status')
      .eq('referred_user_id', subscribedUserId)
      .eq('status', 'signed_up')
      .limit(1)
      .single()

    if (!referral) return

    // Update referral status to subscribed
    await supabase
      .from('referrals')
      .update({ status: 'subscribed', subscribed_at: new Date().toISOString() })
      .eq('id', referral.id)

    // Reward referrer: +15 credits + 1 free month
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: referral.referrer_user_id,
        referral_id: referral.id,
        reward_type: 'credits',
        reward_value: 15,
        description: 'Referral-Bonus: Abo abgeschlossen (+15 Credits)',
      })

    // Reward referrer: free month
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: referral.referrer_user_id,
        referral_id: referral.id,
        reward_type: 'free_month',
        reward_value: 1,
        description: 'Referral-Bonus: 1 Monat kostenlos',
      })

    // Reward referred user: 20% discount
    await supabase
      .from('referral_rewards')
      .insert({
        user_id: subscribedUserId,
        referral_id: referral.id,
        reward_type: 'discount',
        reward_value: 20,
        description: 'Willkommens-Rabatt: 20% auf den ersten Monat',
      })

    console.log('Referral subscription rewards processed:', {
      referralId: referral.id,
      referrer: referral.referrer_user_id,
      subscriber: subscribedUserId,
    })
  } catch (err) {
    console.error('Error processing referral subscription:', err)
  }
}
