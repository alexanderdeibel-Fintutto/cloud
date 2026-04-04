import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
  last_login_at: string | null;
}

export interface Subscription {
  id: string;
  org_id: string | null;
  product_id: string | null;
  status: string | null;
  tier: string | null;
  customer_email: string | null;
  current_period_end: string | null;
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });
}

export function useUsersWithSubscriptions() {
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();

  const usersWithSubs = profiles?.map(profile => {
    const userSub = subscriptions?.find(s => s.customer_email === profile.email);
    
    return {
      ...profile,
      subscription: userSub,
      subscriptionTier: userSub?.tier || 'Free',
      subscriptionStatus: userSub?.status || 'none',
    };
  });

  return {
    data: usersWithSubs,
    isLoading: profilesLoading || subscriptionsLoading,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
