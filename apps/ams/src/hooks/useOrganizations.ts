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
  // SSOT: Verknüpfung zur zentralen Adresse in core_addresses
  core_address_id?: string | null;
  // Aus v_organizations_with_address View
  formatted_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

/**
 * SSOT: Adresse einer Organisation mit core_addresses verknüpfen oder aktualisieren.
 * Erstellt einen neuen core_address Eintrag und verknüpft ihn mit der Organisation.
 */
export function useUpdateOrgAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, address }: {
      orgId: string;
      address: { street: string; postalCode: string; city: string; country?: string; placeId?: string; formattedAddress?: string; lat?: number; lng?: number };
    }) => {
      // 1. core_address anlegen
      const { data: addr, error: addrErr } = await supabase
        .from('core_addresses')
        .insert({
          street: address.street,
          postal_code: address.postalCode,
          city: address.city,
          country: address.country || 'Deutschland',
          google_place_id: address.placeId,
          formatted: address.formattedAddress,
          latitude: address.lat,
          longitude: address.lng,
        })
        .select('id')
        .single();
      if (addrErr) throw addrErr;

      // 2. Organisation mit core_address verknüpfen
      const { data, error } = await supabase
        .from('organizations')
        .update({ core_address_id: addr.id, street: address.street, zip: address.postalCode, city: address.city, country: address.country || 'Deutschland' })
        .eq('id', orgId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['core_addresses'] });
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
