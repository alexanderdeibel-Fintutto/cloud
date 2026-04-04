import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceRegistryItem {
  id: string;
  service_key: string;
  display_name: string;
  description: string | null;
  category: string;
  integration_type: string;
  is_active: boolean | null;
  is_live: boolean | null;
  api_base_url: string | null;
  api_docs_url: string | null;
  edge_function_name: string | null;
  edge_function_url: string | null;
  requires_api_key: boolean | null;
  api_key_secret_name: string | null;
  apps_enabled: string[] | null;
  tiers_enabled: string[] | null;
  rate_limits: Record<string, unknown> | null;
  pricing: Record<string, unknown> | null;
  cost_config: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceUsageLog {
  id: string;
  service_key: string | null;
  app_id: string;
  user_id: string | null;
  org_id: string | null;
  request_count: number | null;
  cost_cents: number | null;
  created_at: string | null;
}

export function useServicesRegistry() {
  return useQuery({
    queryKey: ['services-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services_registry')
        .select('*')
        .order('display_name');
      if (error) throw error;
      return data as ServiceRegistryItem[];
    },
  });
}

export function useServiceUsageLogs() {
  return useQuery({
    queryKey: ['service-usage-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_usage_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as ServiceUsageLog[];
    },
  });
}

export function useServicesOverview() {
  return useQuery({
    queryKey: ['services-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services_overview')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceRegistryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('services_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-registry'] });
    },
  });
}
