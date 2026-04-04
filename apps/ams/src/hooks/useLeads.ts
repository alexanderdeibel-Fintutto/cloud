import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: string | null;
  status: string | null;
  lead_score: number | null;
  source: string | null;
  source_app: string | null;
  source_tool: string | null;
  source_url: string | null;
  source_domain: string | null;
  landing_page: string | null;
  referrer: string | null;
  interested_in: string[] | null;
  tags: string[] | null;
  assigned_to: string | null;
  conversion_goal: string | null;
  converted_at: string | null;
  converted_to_user_id: string | null;
  converted_to_org_id: string | null;
  total_calculations: number | null;
  total_documents: number | null;
  last_activity_at: string | null;
  last_contact_at: string | null;
  next_follow_up: string | null;
  notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string | null;
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useLeadStats() {
  const { data: leads } = useLeads();

  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    qualified: leads?.filter(l => l.status === 'qualified').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    lost: leads?.filter(l => l.status === 'lost').length || 0,
    avgScore: 0,
    bySource: {} as Record<string, number>,
    byApp: {} as Record<string, number>,
  };

  if (leads?.length) {
    const scores = leads.filter(l => l.lead_score != null).map(l => l.lead_score!);
    stats.avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    leads.forEach(lead => {
      const source = lead.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      const app = lead.source_app || 'unknown';
      stats.byApp[app] = (stats.byApp[app] || 0) + 1;
    });
  }

  return stats;
}
