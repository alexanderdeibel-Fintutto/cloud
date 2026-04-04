import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  primary_color: string | null;
  street: string | null;
  house_number: string | null;
  zip: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  vat_id: string | null;
  stripe_customer_id: string | null;
  partner_id: string | null;
  referral_code_used: string | null;
  white_label_source: string | null;
  settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: string | null;
  created_at: string | null;
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useOrgMemberships() {
  return useQuery({
    queryKey: ['org-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_memberships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrgMembership[];
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Organization> & { id: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useOrgStats() {
  const { data: orgs } = useOrganizations();
  const { data: memberships } = useOrgMemberships();

  return {
    total: orgs?.length || 0,
    active: orgs?.filter(o => o.status === 'active').length || 0,
    withPartner: orgs?.filter(o => o.partner_id).length || 0,
    withStripe: orgs?.filter(o => o.stripe_customer_id).length || 0,
    whiteLabel: orgs?.filter(o => o.white_label_source).length || 0,
    totalMembers: memberships?.length || 0,
    byType: orgs?.reduce((acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };
}
