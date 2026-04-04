import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  request_type: string;
  status: string | null;
  urgency: string | null;
  category: string | null;
  building_id: string;
  tenant_id: string;
  unit_id: string | null;
  org_id: string;
  assigned_to: string | null;
  photos: string[] | null;
  internal_notes: string | null;
  response_to_tenant: string | null;
  completed_at: string | null;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useServiceRequests() {
  return useQuery({
    queryKey: ['service-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as ServiceRequest[];
    },
  });
}

export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    },
  });
}

export function useSupportStats() {
  const { data: requests } = useServiceRequests();

  return useMemo(() => {
    const items = requests || [];
    const open = items.filter(r => r.status === 'open' || r.status === 'pending' || r.status === 'new');
    const urgent = items.filter(r => r.urgency === 'high' || r.urgency === 'urgent' || r.urgency === 'critical');
    const today = new Date().toISOString().slice(0, 10);
    const resolvedToday = items.filter(r =>
      r.status === 'completed' && r.completed_at?.startsWith(today)
    );

    const byCategory = new Map<string, number>();
    items.forEach(r => {
      const cat = r.category || r.request_type || 'Sonstige';
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    });

    const byStatus = new Map<string, number>();
    items.forEach(r => {
      const s = r.status || 'unknown';
      byStatus.set(s, (byStatus.get(s) || 0) + 1);
    });

    return {
      total: items.length,
      openCount: open.length,
      urgentCount: urgent.length,
      resolvedToday: resolvedToday.length,
      byCategory: Object.fromEntries(byCategory),
      byStatus: Object.fromEntries(byStatus),
    };
  }, [requests]);
}
