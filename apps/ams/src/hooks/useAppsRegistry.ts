import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppRegistryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  app_url: string | null;
  icon_url: string | null;
  logo_url: string | null;
  category: string | null;
  is_active: boolean | null;
  is_beta: boolean | null;
  is_public: boolean | null;
  requires_subscription: boolean | null;
  min_subscription_tier: string | null;
  available_permissions: string[] | null;
  target_audience: string[] | null;
  settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FintuttoApp {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  url: string | null;
  icon: string | null;
  category: string | null;
  active: boolean | null;
  sort_order: number | null;
  cross_sell_for: string[] | null;
}

export interface EcosystemApp {
  app_id: string | null;
  app_name: string | null;
  description: string | null;
  tagline: string | null;
  url: string | null;
  icon: string | null;
  category: string | null;
  sort_order: number | null;
  cross_sell_for: string[] | null;
  has_free_tier: boolean | null;
  starting_price: number | null;
  tier_count: number | null;
}

export interface CrossSellRule {
  id: string;
  headline: string;
  description: string | null;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  recommend_type: string;
  recommend_id: string;
  target_personas: string[] | null;
  cta_text: string | null;
  priority: number | null;
  cooldown_hours: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export function useAppsRegistry() {
  return useQuery({
    queryKey: ['apps-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apps_registry')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as AppRegistryItem[];
    },
  });
}

export function useFintuttoApps() {
  return useQuery({
    queryKey: ['fintutto-apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fintutto_apps')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as FintuttoApp[];
    },
  });
}

export function useEcosystem() {
  return useQuery({
    queryKey: ['ecosystem'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_fintutto_ecosystem')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as EcosystemApp[];
    },
  });
}

export function useCrossSellRules() {
  return useQuery({
    queryKey: ['cross-sell-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cross_sell_rules')
        .select('*')
        .order('priority');

      if (error) throw error;
      return data as CrossSellRule[];
    },
  });
}

export function useUpdateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AppRegistryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('apps_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps-registry'] });
      queryClient.invalidateQueries({ queryKey: ['ecosystem'] });
    },
  });
}

export function useUpdateCrossSellRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrossSellRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('cross_sell_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-sell-rules'] });
    },
  });
}
