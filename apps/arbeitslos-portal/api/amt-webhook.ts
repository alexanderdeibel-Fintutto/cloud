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
    // Only process Amtshilfe events
    const metadata = (event.data.object as Record<string, unknown>)?.metadata as Record<string, string> | undefined
    if (metadata?.app !== 'amtshilfe') {
      // Not our event, let the main webhook handler deal with it
      return res.status(200).json({ received: true, skipped: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const customerEmail = session.customer_email

        console.log('Amtshilfe checkout completed:', { userId, planId, customerEmail })

        if (userId) {
          const { error } = await supabase
            .from('amt_users')
            .update({
              plan: planId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              free_letters_remaining: planId === 'premium' ? 3 : 0,
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating amt_user:', error)
          }
        } else if (customerEmail) {
          const { data: existingUser } = await supabase
            .from('amt_users')
            .select('id')
            .eq('email', customerEmail)
            .single()

          if (existingUser) {
            await supabase
              .from('amt_users')
              .update({
                plan: planId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                free_letters_remaining: planId === 'premium' ? 3 : 0,
              })
              .eq('id', existingUser.id)
          }
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
              plan: 'free',
              stripe_subscription_id: null,
              free_letters_remaining: 0,
            })
            .eq('id', user.id)
        }
        break
      }
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Amtshilfe webhook error:', error)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
