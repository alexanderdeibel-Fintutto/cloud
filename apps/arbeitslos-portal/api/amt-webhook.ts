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

// Credit amounts per plan
const PLAN_CREDITS: Record<string, number> = {
  starter: 10,
  kaempfer: 25,
  vollschutz: 50,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_AMT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  try {
    // Only process BescheidBoxer events
    const metadata = (event.data.object as Record<string, unknown>)?.metadata as Record<string, string> | undefined
    if (metadata?.app !== 'bescheidboxer' && metadata?.app !== 'amtshilfe') {
      return res.status(200).json({ received: true, skipped: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId
        const planId = session.metadata?.planId || 'starter'
        const creditsPerMonth = PLAN_CREDITS[planId] || 0
        const customerEmail = session.customer_email

        console.log('BescheidBoxer checkout completed:', { userId, planId, customerEmail })

        const updateData = {
          plan: planId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          credits_current: creditsPerMonth,
          letters_generated_this_month: 0,
          scans_this_month: 0,
          chat_messages_used_today: 0,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }

        if (userId) {
          const { error } = await supabase
            .from('amt_users')
            .update(updateData)
            .eq('id', userId)

          if (error) {
            console.error('Error updating amt_user:', error)
          }

          // Log credit transaction
          await supabase.from('amt_credit_transactions').insert({
            user_id: userId,
            amount: creditsPerMonth,
            type: 'subscription_credit',
            description: `${planId}-Plan monatliche Credits`,
            balance_after: creditsPerMonth,
          })
        } else if (customerEmail) {
          const { data: existingUser } = await supabase
            .from('amt_users')
            .select('id')
            .eq('email', customerEmail)
            .single()

          if (existingUser) {
            await supabase
              .from('amt_users')
              .update(updateData)
              .eq('id', existingUser.id)

            await supabase.from('amt_credit_transactions').insert({
              user_id: existingUser.id,
              amount: creditsPerMonth,
              type: 'subscription_credit',
              description: `${planId}-Plan monatliche Credits`,
              balance_after: creditsPerMonth,
            })
          }
        }
        break
      }

      case 'invoice.paid': {
        // Monthly renewal - reset limits and add credits
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: user } = await supabase
          .from('amt_users')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user && user.plan !== 'schnupperer') {
          const creditsPerMonth = PLAN_CREDITS[user.plan] || 0

          await supabase
            .from('amt_users')
            .update({
              credits_current: creditsPerMonth,
              letters_generated_this_month: 0,
              scans_this_month: 0,
              period_start: new Date().toISOString(),
              period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', user.id)

          await supabase.from('amt_credit_transactions').insert({
            user_id: user.id,
            amount: creditsPerMonth,
            type: 'subscription_credit',
            description: `${user.plan}-Plan monatliche Erneuerung`,
            balance_after: creditsPerMonth,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('amt_users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('amt_users')
            .update({
              plan: 'schnupperer',
              stripe_subscription_id: null,
              credits_current: 0,
              letters_generated_this_month: 0,
              scans_this_month: 0,
            })
            .eq('id', user.id)

          console.log('BescheidBoxer subscription cancelled, downgraded to schnupperer:', user.id)
        }
        break
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('BescheidBoxer webhook error:', error)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
