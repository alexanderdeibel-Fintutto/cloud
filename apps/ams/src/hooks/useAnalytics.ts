import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function useAIUsageDaily() {
  return useQuery({
    queryKey: ['ai-usage-daily-by-app'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_usage_daily_by_app')
        .select('*')
        .order('date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAIUsageDailyByUser() {
  return useQuery({
    queryKey: ['ai-usage-daily-by-user'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_usage_daily_by_user')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAITopFeatures() {
  return useQuery({
    queryKey: ['ai-top-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_top_features')
        .select('*')
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useServiceUsageDaily() {
  return useQuery({
    queryKey: ['service-usage-daily'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_usage_daily')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_admin_dashboard')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useAnalyticsStats() {
  const { data: aiUsage } = useAIUsageDaily();
  const { data: serviceUsage } = useServiceUsageDaily();
  const { data: dashboard } = useAdminDashboard();
  const { data: topFeatures } = useAITopFeatures();

  return useMemo(() => {
    const totalAIRequests = aiUsage?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0;
    const totalServiceRequests = serviceUsage?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0;
    const totalAICost = aiUsage?.reduce((sum, d) => sum + (d.total_cost_usd || 0), 0) || 0;
    const avgResponseTime = aiUsage?.length
      ? aiUsage.reduce((sum, d) => sum + (d.avg_response_time_ms || 0), 0) / aiUsage.length
      : 0;
    const uniqueUsers = serviceUsage?.reduce((sum, d) => sum + (d.unique_users || 0), 0) || 0;

    // Group AI usage by date for chart
    const aiByDate = new Map<string, { date: string; requests: number; cost: number; tokens: number }>();
    aiUsage?.forEach(d => {
      const date = d.date || '';
      const existing = aiByDate.get(date) || { date, requests: 0, cost: 0, tokens: 0 };
      existing.requests += d.total_requests || 0;
      existing.cost += d.total_cost_usd || 0;
      existing.tokens += d.total_tokens || 0;
      aiByDate.set(date, existing);
    });
    const aiChart = Array.from(aiByDate.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

    // Group service usage by date for chart
    const serviceByDate = new Map<string, { date: string; requests: number; revenue: number; users: number }>();
    serviceUsage?.forEach(d => {
      const date = d.usage_date || '';
      const existing = serviceByDate.get(date) || { date, requests: 0, revenue: 0, users: 0 };
      existing.requests += d.total_requests || 0;
      existing.revenue += d.total_revenue || 0;
      existing.users += d.unique_users || 0;
      serviceByDate.set(date, existing);
    });
    const serviceChart = Array.from(serviceByDate.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

    return {
      totalAIRequests,
      totalServiceRequests,
      totalAICost,
      avgResponseTime: Math.round(avgResponseTime),
      uniqueUsers,
      totalUsers: dashboard?.total_users || 0,
      newUsers7d: dashboard?.new_users_7d || 0,
      newUsers30d: dashboard?.new_users_30d || 0,
      activeApps: dashboard?.active_apps || 0,
      errorsToday: dashboard?.errors_today || 0,
      aiChart,
      serviceChart,
      topFeatures: topFeatures || [],
    };
  }, [aiUsage, serviceUsage, dashboard, topFeatures]);
}
