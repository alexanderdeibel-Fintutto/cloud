import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionDeep {
  id: string;
  org_id: string | null;
  app_id: string | null;
  status: string;
  tier: string | null;
  billing_interval: string | null;
  customer_email: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  ki_access: boolean | null;
  max_objects: number | null;
  custom_limits: Record<string, unknown> | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SeatAllocation {
  id: string;
  org_id: string;
  app_id: string;
  total_seats: number | null;
  used_seats: number | null;
  created_at: string | null;
}

export interface StripeWebhookEvent {
  id: string;
  event_type: string | null;
  stripe_event_id: string | null;
  payload: Record<string, unknown> | null;
  processed: boolean | null;
  processing_error: string | null;
  created_at: string | null;
}

export function useSubscriptionsDeep() {
  return useQuery({
    queryKey: ['subscriptions-deep'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubscriptionDeep[];
    },
  });
}

export function useSeatAllocations() {
  return useQuery({
    queryKey: ['seat-allocations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seat_allocations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SeatAllocation[];
    },
  });
}

export function useStripeWebhookEvents() {
  return useQuery({
    queryKey: ['stripe-webhook-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as StripeWebhookEvent[];
    },
  });
}

export function useSubscriptionStats() {
  const { data: subs } = useSubscriptionsDeep();

  const now = new Date();
  const stats = {
    total: subs?.length || 0,
    active: subs?.filter(s => s.status === 'active').length || 0,
    trialing: subs?.filter(s => s.status === 'trialing').length || 0,
    canceled: subs?.filter(s => s.status === 'canceled').length || 0,
    pastDue: subs?.filter(s => s.status === 'past_due').length || 0,
    cancelPending: subs?.filter(s => s.cancel_at_period_end).length || 0,
    withKiAccess: subs?.filter(s => s.ki_access).length || 0,
    byTier: {} as Record<string, number>,
    byInterval: {} as Record<string, number>,
    trialExpiringSoon: 0,
  };

  subs?.forEach(sub => {
    const tier = sub.tier || 'unknown';
    stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
    const interval = sub.billing_interval || 'unknown';
    stats.byInterval[interval] = (stats.byInterval[interval] || 0) + 1;

    if (sub.trial_end) {
      const trialEnd = new Date(sub.trial_end);
      const daysLeft = (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysLeft > 0 && daysLeft <= 7) stats.trialExpiringSoon++;
    }
  });

  return stats;
}
