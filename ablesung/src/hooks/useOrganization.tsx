import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Organization, OrgType } from '@/types/database';

export function useOrganization() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create organization and assign user to it
  // Note: Admin/Vermieter roles are automatically assigned via database trigger
  const createOrganization = useMutation({
    mutationFn: async (data: { name: string; type?: OrgType }) => {
      if (!user) throw new Error('Not authenticated');

      // Generate UUID client-side to avoid needing SELECT after INSERT
      const orgId = crypto.randomUUID();

      // Create organization with explicit ID
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({ ...data, id: orgId });

      if (orgError) throw orgError;

      // Update user's profile to link to organization
      // This triggers assign_org_creator_roles() which adds admin/vermieter roles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: orgId })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Now we can fetch the org since profile is linked
      const { data: newOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name, type, subscription_plan, created_at')
        .eq('id', orgId)
        .single();

      if (fetchError) throw fetchError;

      return newOrg as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });

  // Update organization
  const updateOrganization = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Organization> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id)
        .select('id, name, type, subscription_plan, created_at')
        .single();

      if (error) throw error;
      return updated as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    createOrganization,
    updateOrganization,
  };
}
