import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Subscribe to Supabase Realtime changes and auto-invalidate React Query caches.
 * Call this once at the app level or per page for targeted updates.
 */
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'error_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['error-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stripe_payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['revenue-chart'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_usage_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ai-usage-logs'] });
        queryClient.invalidateQueries({ queryKey: ['ai-costs-summary'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'webhook_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['webhook-logs-settings'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
