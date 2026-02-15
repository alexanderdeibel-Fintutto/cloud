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

// Map tier IDs to check limits
const TIER_LIMITS: Record<string, number> = {
  basic: 3,
  premium: -1, // unlimited
}

// Referral reward tier per app (which tier the free month covers)
const REFERRAL_REWARD_TIERS: Record<string, { tier: string; monthlyPriceEur: number }> = {
  'mieter-checker': { tier: 'premium', monthlyPriceEur: 3.99 },
  'fintutto-portal': { tier: 'kombi_pro', monthlyPriceEur: 14.99 },
  'vermieter-portal': { tier: 'pro', monthlyPriceEur: 7.99 },
  'bescheidboxer': { tier: 'kaempfer', monthlyPriceEur: 4.99 },
  'vermietify': { tier: 'basic', monthlyPriceEur: 9.99 },
  'hausmeisterpro': { tier: 'starter', monthlyPriceEur: 9.99 },
  'ablesung': { tier: 'basic', monthlyPriceEur: 9.99 },
  'mieter-app': { tier: 'basic', monthlyPriceEur: 4.99 },
  'financial-compass': { tier: 'basic', monthlyPriceEur: 9.99 },
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
        const checksLimit = parseInt(session.metadata?.checksLimit || '3', 10)
        const customerEmail = session.customer_email

        console.log('Checkout completed:', { userId, tierId, customerEmail })

        if (userId) {
          // Update existing user
          const { error } = await supabase
            .from('users')
            .update({
              tier: tierId,
              checks_limit: checksLimit,
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
            await supabase
              .from('users')
              .update({
                tier: tierId,
                checks_limit: checksLimit,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
              })
              .eq('id', existingUser.id)
          }
        }

        // --- REFERRAL REWARD LOGIC ---
        // Check if the subscriber was referred and apply rewards for BOTH sides
        // Supports cross-app referral: referrer gets reward in their own app
        const subscriberEmail = customerEmail || session.customer_details?.email
        const appId = session.metadata?.appId || 'mieter-checker'
        if (subscriberEmail) {
          await processReferralReward(subscriberEmail, session.customer as string, appId)
        }

        // Track subscription in user_app_subscriptions for bundle discount calculation
        if (userId && tierId && tierId !== 'free') {
          await supabase.from('user_app_subscriptions').upsert({
            user_id: userId,
            app_id: appId,
            plan_id: tierId,
            is_active: true,
            stripe_subscription_id: session.subscription as string,
            subscribed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,app_id' })
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
                checks_limit: 1,
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
              checks_limit: 1,
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

// ============================================================================
// REFERRAL REWARD LOGIC
// 1 Monat gratis fuer BEIDE Seiten (Werber + Geworbener)
// Cross-App: Referrer bekommt Reward in SEINER App, Geworbener in SEINER
// ============================================================================
async function processReferralReward(subscriberEmail: string, stripeCustomerId: string, referredAppId: string) {
  try {
    // Find the subscriber and check if they were referred
    const { data: subscriber } = await supabase
      .from('users')
      .select('id, referred_by')
      .eq('email', subscriberEmail.toLowerCase())
      .single()

    if (!subscriber?.referred_by) {
      return // No referral to process
    }

    // Check if reward was already applied
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id, reward_applied_referrer')
      .eq('referred_user_id', subscriber.id)
      .eq('referrer_user_id', subscriber.referred_by)
      .single()

    if (existingReferral?.reward_applied_referrer) {
      return // Already rewarded
    }

    // Get referrer's email for Stripe lookup
    const { data: referrer } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', subscriber.referred_by)
      .single()

    if (!referrer?.email) {
      return
    }

    // Determine referrer's app (for cross-app referral)
    const { data: referrerAppSub } = await supabase
      .from('user_app_subscriptions')
      .select('app_id')
      .eq('user_id', referrer.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    const referrerAppId = referrerAppSub?.app_id || referredAppId
    const rewardInfo = REFERRAL_REWARD_TIERS[referrerAppId] || { tier: 'basic', monthlyPriceEur: 9.99 }

    console.log('Processing referral reward:', {
      referrerEmail: referrer.email,
      subscriberEmail,
      referrerApp: referrerAppId,
      referredApp: referredAppId,
      rewardTier: rewardInfo.tier,
    })

    // Create 100% off coupon for referrer (1 month free)
    const referrerCoupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      name: `Referral: 1 Monat ${rewardInfo.tier} gratis (${subscriberEmail} eingeladen)`,
      max_redemptions: 1,
      metadata: {
        type: 'referral_reward',
        referrer_app: referrerAppId,
        referred_app: referredAppId,
      },
    })

    // Create 100% off coupon for referred user too (1 month free for BOTH sides)
    const referredCoupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      name: `Willkommensgeschenk: 1 Monat gratis (eingeladen von ${referrer.email})`,
      max_redemptions: 1,
      metadata: {
        type: 'referral_welcome',
        referrer_app: referrerAppId,
        referred_app: referredAppId,
      },
    })

    // Apply coupon to referrer's active subscription
    const referrerCustomers = await stripe.customers.list({
      email: referrer.email,
      limit: 1,
    })

    if (referrerCustomers.data.length > 0) {
      const referrerSubs = await stripe.subscriptions.list({
        customer: referrerCustomers.data[0].id,
        status: 'active',
        limit: 1,
      })

      if (referrerSubs.data.length > 0) {
        await stripe.subscriptions.update(referrerSubs.data[0].id, {
          coupon: referrerCoupon.id,
        })
        console.log('Referrer coupon applied to subscription:', referrerSubs.data[0].id)
      }
    }

    // Apply coupon to referred user's subscription (just created)
    const referredSubs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    })

    if (referredSubs.data.length > 0) {
      await stripe.subscriptions.update(referredSubs.data[0].id, {
        coupon: referredCoupon.id,
      })
      console.log('Referred user coupon applied to subscription:', referredSubs.data[0].id)
    }

    // Update referral record
    const updateData = {
      reward_applied_referrer: true,
      reward_applied_referred: true,
      reward_applied_at: new Date().toISOString(),
      stripe_coupon_id_referrer: referrerCoupon.id,
      stripe_coupon_id_referred: referredCoupon.id,
      referrer_app_id: referrerAppId,
      referred_app_id: referredAppId,
      status: 'converted',
      converted_at: new Date().toISOString(),
    }

    if (existingReferral) {
      await supabase
        .from('referrals')
        .update(updateData)
        .eq('id', existingReferral.id)
    } else {
      // Update by referrer + referred match
      await supabase
        .from('referrals')
        .update(updateData)
        .eq('referred_user_id', subscriber.id)
        .eq('referrer_user_id', subscriber.referred_by)
    }

    console.log('Referral reward applied successfully')
  } catch (err) {
    console.error('Error processing referral reward:', err)
  }
}
