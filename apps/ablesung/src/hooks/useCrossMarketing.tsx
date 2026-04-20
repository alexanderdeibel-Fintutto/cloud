import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

function useRotatingIndex(count: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const safeCount = Math.max(count, 1);

  useEffect(() => {
    if (safeCount <= 1) return;
    const id = setInterval(() => setIndex(prev => (prev + 1) % safeCount), intervalMs);
    return () => clearInterval(id);
  }, [safeCount, intervalMs]);

  return index % safeCount;
}

export interface CrossSellTrigger {
  id: string;
  source_app_id: string;
  target_app_id: string;
  headline: string;
  description: string | null;
  cta_text: string;
  cta_url: string | null;
  image_url: string | null;
  icon_name: string | null;
  background_gradient: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CURRENT_APP_ID = 'zaehler';

export function useCrossMarketing() {
  const { user } = useAuth();

  // Fetch cross-sell triggers for this app
  const { data: triggers, isLoading: triggersLoading } = useQuery({
    queryKey: ['cross-sell-triggers', CURRENT_APP_ID],
    queryFn: async (): Promise<CrossSellTrigger[]> => {
      const { data, error } = await supabase
        .from('ai_cross_sell_triggers')
        .select('*')
        .eq('source_app_id', CURRENT_APP_ID)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as CrossSellTrigger[];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 Minuten Cache
  });

  // Fetch user's subscriptions across all apps
  const { data: userSubscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['user-all-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('app_id, plan_id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing']);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Filter triggers to only show apps the user doesn't have
  const subscribedAppIds = new Set((userSubscriptions || []).map(s => s.app_id));
  
  const eligibleTriggers = (triggers || []).filter(
    trigger => !subscribedAppIds.has(trigger.target_app_id)
  );

  // Rotate through triggers – change every 30 seconds based on timestamp
  const rotationIndex = useRotatingIndex(eligibleTriggers.length, 15_000);
  const activeBanner = eligibleTriggers.length > 0 ? eligibleTriggers[rotationIndex] : null;

  return {
    activeBanner,
    allTriggers: eligibleTriggers,
    isLoading: triggersLoading || subsLoading,
    subscribedApps: Array.from(subscribedAppIds),
  };
}
