import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLog {
  id: string;
  error_type: string | null;
  error_message: string | null;
  error_stack: string | null;
  error_code: string | null;
  app_id: string | null;
  user_id: string | null;
  endpoint: string | null;
  request_data: Record<string, unknown> | null;
  environment: string | null;
  resolved: boolean | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  occurred_at: string | null;
}

export function useErrorLogs() {
  return useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ErrorLog[];
    },
  });
}

export function useResolveError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
    },
  });
}

export function useErrorStats() {
  const { data: errors } = useErrorLogs();

  const stats = {
    total: errors?.length || 0,
    open: errors?.filter(e => !e.resolved).length || 0,
    resolved: errors?.filter(e => e.resolved).length || 0,
    critical: errors?.filter(e => e.error_type === 'critical').length || 0,
    byApp: {} as Record<string, number>,
  };

  errors?.forEach(error => {
    const appId = error.app_id || 'unknown';
    stats.byApp[appId] = (stats.byApp[appId] || 0) + 1;
  });

  return stats;
}
