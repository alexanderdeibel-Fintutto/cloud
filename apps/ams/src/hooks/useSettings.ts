import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  description: string | null;
  is_active: boolean | null;
  org_id: string;
  user_id: string | null;
  permissions: string[] | null;
  allowed_apps: string[] | null;
  allowed_ips: string[] | null;
  rate_limit_per_minute: number | null;
  rate_limit_per_day: number | null;
  usage_count: number | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface WebhookLog {
  id: string;
  source: string;
  event_type: string | null;
  event_id: string | null;
  endpoint: string | null;
  status_code: number | null;
  processed: boolean | null;
  error_message: string | null;
  retry_count: number | null;
  received_at: string | null;
  processed_at: string | null;
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ApiKey[];
    },
  });
}

export function useWebhookLogs() {
  return useQuery({
    queryKey: ['webhook-logs-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as WebhookLog[];
    },
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ApiKey> & { id: string }) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}
