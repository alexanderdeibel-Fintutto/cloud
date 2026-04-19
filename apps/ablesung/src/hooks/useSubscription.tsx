import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { PlanId } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  plan_id: PlanId;
  subscribed: boolean;
  subscription_end: string | null;
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: PlanId;
  isPro: boolean;
  isBusiness: boolean;
  isActive: boolean;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  openCheckout: (priceId: string) => Promise<void>;
  openPortal: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription({ plan_id: 'free', subscribed: false, subscription_end: null });
      } else {
        setSubscription({
          plan_id: data.plan_id || 'free',
          subscribed: data.subscribed || false,
          subscription_end: data.subscription_end || null,
        });
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscription({ plan_id: 'free', subscribed: false, subscription_end: null });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const openCheckout = useCallback(async (priceId: string) => {
    if (!user) {
      toast({
        title: 'Nicht eingeloggt',
        description: 'Bitte melden Sie sich an, um ein Abo abzuschließen.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      toast({
        title: 'Fehler',
        description: 'Checkout konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const openPortal = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Nicht eingeloggt',
        description: 'Bitte melden Sie sich an.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      toast({
        title: 'Fehler',
        description: 'Kundenportal konnte nicht geöffnet werden.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const plan = subscription?.plan_id || 'free';
  const isPro = plan === 'pro' || plan === 'business';
  const isBusiness = plan === 'business';
  const isActive = subscription?.subscribed || false;

  return {
    subscription,
    plan,
    isPro,
    isBusiness,
    isActive,
    isLoading,
    checkSubscription,
    openCheckout,
    openPortal,
  };
};
