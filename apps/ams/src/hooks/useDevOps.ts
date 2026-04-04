import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemMetric {
  id: string;
  metric_name: string | null;
  metric_value: number | null;
  app_id: string | null;
  tags: Record<string, unknown> | null;
  recorded_at: string | null;
}

export interface GitHubEvent {
  id: string;
  event_type: string | null;
  repo: string | null;
  actor: string | null;
  payload: Record<string, unknown> | null;
  created_at: string | null;
}

export interface WebhookLog {
  id: string;
  source: string | null;
  event_type: string | null;
  payload: Record<string, unknown> | null;
  status_code: number | null;
  response_body: string | null;
  processed: boolean | null;
  processing_error: string | null;
  created_at: string | null;
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as SystemMetric[];
    },
  });
}

export function useGitHubEvents() {
  return useQuery({
    queryKey: ['github-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('github_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as GitHubEvent[];
    },
  });
}

export function useWebhookLogs() {
  return useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as WebhookLog[];
    },
  });
}

export function useDevOpsStats() {
  const { data: metrics } = useSystemMetrics();
  const { data: github } = useGitHubEvents();
  const { data: webhooks } = useWebhookLogs();

  return {
    totalMetrics: metrics?.length || 0,
    totalGithubEvents: github?.length || 0,
    totalWebhooks: webhooks?.length || 0,
    failedWebhooks: webhooks?.filter(w => !w.processed || w.processing_error).length || 0,
    webhooksBySource: webhooks?.reduce((acc, w) => {
      const source = w.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    githubByType: github?.reduce((acc, e) => {
      const type = e.event_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
