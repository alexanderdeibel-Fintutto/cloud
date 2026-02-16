import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '../supabase/client'
import { useAuth } from '../auth/AuthProvider'

export interface SubscriptionData {
  subscribed: boolean
  tierId: string | null
  productId: string | null
  priceId: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

/**
 * Hook für den aktuellen Abo-Status des Nutzers.
 * Prüft gegen Supabase-Felder oder Stripe Edge Function.
 */
export function useSubscription() {
  const { user } = useAuth()

  return useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          subscribed: false,
          tierId: null,
          productId: null,
          priceId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        }
      }

      // Versuche zuerst Supabase Edge Function
      const { data, error } = await getSupabase()
        .functions.invoke('check-subscription', {
          body: { userId: user.id },
        })

      if (error || !data) {
        // Fallback: Direkt aus users-Tabelle lesen
        const { data: userData } = await getSupabase()
          .from('users')
          .select('tier, stripe_subscription_id')
          .eq('id', user.id)
          .single()

        return {
          subscribed: !!userData?.stripe_subscription_id,
          tierId: userData?.tier ?? 'free',
          productId: null,
          priceId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        }
      }

      return data as SubscriptionData
    },
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

/**
 * Erstellt eine Stripe Checkout Session und leitet weiter.
 */
export function useCheckout() {
  const { user } = useAuth()

  const checkout = async (priceId: string, options?: { successUrl?: string; cancelUrl?: string }) => {
    if (!user?.email) {
      throw new Error('Bitte zuerst anmelden.')
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        userId: user.id,
        userEmail: user.email,
        successUrl: options?.successUrl ?? `${window.location.origin}/checkout/success`,
        cancelUrl: options?.cancelUrl ?? `${window.location.origin}/checkout/cancel`,
      }),
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      throw new Error(data.error ?? 'Checkout fehlgeschlagen.')
    }
  }

  return { checkout, isAuthenticated: !!user }
}
