import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Profile, ProfileWithRoles, AppRole, Organization } from '@/types/database';

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current user's profile with roles
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<ProfileWithRoles | null> => {
      if (!user) return null;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      // Fetch organization if user has one
      let organization: Organization | undefined;
      if (profileData.organization_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, type, subscription_plan, created_at')
          .eq('id', profileData.organization_id)
          .single();
        organization = orgData as Organization;
      }

      return {
        ...(profileData as Profile),
        roles: (rolesData || []).map(r => r.role as AppRole),
        organization,
      };
    },
    enabled: !!user,
  });

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Helper functions for role checks
  const hasRole = (role: AppRole): boolean => {
    return profile?.roles?.includes(role) ?? false;
  };

  const isAdmin = hasRole('admin');
  const isVermieter = hasRole('vermieter') || isAdmin;
  const isMieter = hasRole('mieter');
  const isHausmeister = hasRole('hausmeister');

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    hasRole,
    isAdmin,
    isVermieter,
    isMieter,
    isHausmeister,
  };
}
