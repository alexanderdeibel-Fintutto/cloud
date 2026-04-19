import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionState {
  plan_id: string;
  status: string;
  subscription_end: string | null;
  stripe_subscription_id: string | null;
  cancel_at_period_end: boolean;
  subscribed: boolean;
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan_id: 'free',
  status: 'active',
  subscription_end: null,
  stripe_subscription_id: null,
  cancel_at_period_end: false,
  subscribed: false,
};

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setSubscription({
        plan_id: data.plan_id || 'free',
        status: data.status || 'active',
        subscription_end: data.subscription_end || null,
        stripe_subscription_id: data.stripe_subscription_id || null,
        cancel_at_period_end: data.cancel_at_period_end || false,
        subscribed: data.subscribed || false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error checking subscription:', errorMessage);
      setError(errorMessage);
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Refresh subscription every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const isPro = subscription.plan_id === 'pro';
  const isStarter = subscription.plan_id === 'starter';
  const isFree = subscription.plan_id === 'free';
  const isActive = subscription.status === 'active';

  return {
    subscription,
    plan: subscription.plan_id,
    isPro,
    isStarter,
    isFree,
    isActive,
    isLoading,
    error,
    refresh: checkSubscription,
  };
}
