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
  // SSOT: Verknüpfung zum zentralen Kontakt
  core_contact_id?: string | null;
  // Aus v_leads_with_contact View
  contact_type?: string | null;
  company_name?: string | null;
  primary_address?: string | null;
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

/**
 * SSOT: Synchronisiert einen Lead in die core_contacts Tabelle.
 * Ruft die Datenbank-Funktion sync_lead_to_core_contact auf.
 */
export function useSyncLeadToCoreContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .rpc('sync_lead_to_core_contact', { p_lead_id: leadId });
      if (error) throw error;
      return data as string; // core_contact_id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['core_contacts'] });
    },
  });
}

/**
 * SSOT: Zeigt Cross-App-Daten für einen Lead (Mieter in Vermietify, Kunde in Financial Compass, Dokumente in SecondBrain)
 */
export function useLeadCrossAppData(coreContactId: string | null | undefined) {
  return useQuery({
    queryKey: ['lead_cross_app', coreContactId],
    enabled: !!coreContactId,
    queryFn: async () => {
      if (!coreContactId) return null;
      const [tenantsRes, clientsRes, docsRes] = await Promise.allSettled([
        supabase.from('tenants').select('id, first_name, last_name, unit_id, created_at').eq('core_contact_id', coreContactId).limit(5),
        supabase.from('biz_clients').select('id, name, email, created_at').eq('core_contact_id', coreContactId).limit(5),
        supabase.from('sb_document_entity_links').select('id, entity_type, document_id, created_at').eq('entity_type', 'core_contact').eq('entity_id', coreContactId).limit(10),
      ]);
      return {
        tenants: tenantsRes.status === 'fulfilled' ? tenantsRes.value.data || [] : [],
        clients: clientsRes.status === 'fulfilled' ? clientsRes.value.data || [] : [],
        documents: docsRes.status === 'fulfilled' ? docsRes.value.data || [] : [],
      };
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
    // SSOT: Wie viele Leads sind bereits mit core_contacts verknüpft?
    synced_to_ssot: leads?.filter(l => l.core_contact_id != null).length || 0,
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
