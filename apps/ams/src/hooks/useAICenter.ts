import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export function useAIUsageLogs() {
  return useQuery({
    queryKey: ['ai-usage-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAIConversations() {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAICostsSummary() {
  return useQuery({
    queryKey: ['ai-costs-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_ai_costs_summary')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
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

export function useAICenterStats() {
  const { data: usageLogs } = useAIUsageLogs();
  const { data: costs } = useAICostsSummary();
  const { data: userUsage } = useAIUsageDailyByUser();

  return useMemo(() => {
    const last7d = usageLogs?.filter(l => {
      const d = new Date(l.created_at || '');
      return d > new Date(Date.now() - 7 * 86400000);
    }) || [];

    const tokens7d = last7d.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
    const cost7d = last7d.reduce((sum, l) => sum + (l.cost_usd || 0), 0);
    const requests7d = last7d.length;
    const uniqueUserIds = new Set(last7d.map(l => l.user_id).filter(Boolean));
    const errorCount = last7d.filter(l => !l.success).length;
    const avgResponseTime = last7d.length
      ? last7d.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / last7d.length
      : 0;

    // Cost chart data
    const costChart = (costs || [])
      .map(c => ({ date: c.date || '', cost: c.cost_usd || 0, requests: c.requests || 0, tokens: c.tokens || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top users by token usage
    const userMap = new Map<string, { user_id: string; tokens: number; cost: number; requests: number }>();
    userUsage?.forEach(u => {
      const uid = u.user_id || 'unknown';
      const existing = userMap.get(uid) || { user_id: uid, tokens: 0, cost: 0, requests: 0 };
      existing.tokens += u.tokens || 0;
      existing.cost += u.cost_usd || 0;
      existing.requests += u.requests || 0;
      userMap.set(uid, existing);
    });
    const topUsers = Array.from(userMap.values()).sort((a, b) => b.tokens - a.tokens).slice(0, 10);

    // Model usage breakdown
    const modelMap = new Map<string, { model: string; requests: number; tokens: number; cost: number }>();
    (usageLogs || []).forEach(l => {
      const model = l.model_name || 'unknown';
      const existing = modelMap.get(model) || { model, requests: 0, tokens: 0, cost: 0 };
      existing.requests++;
      existing.tokens += l.total_tokens || 0;
      existing.cost += l.cost_usd || 0;
      modelMap.set(model, existing);
    });
    const byModel = Array.from(modelMap.values()).sort((a, b) => b.requests - a.requests);

    return {
      tokens7d,
      cost7d,
      requests7d,
      activeUsers: uniqueUserIds.size,
      errorCount,
      avgResponseTime: Math.round(avgResponseTime),
      costChart,
      topUsers,
      byModel,
    };
  }, [usageLogs, costs, userUsage]);
}
