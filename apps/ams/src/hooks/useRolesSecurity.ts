import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  name: string | null;
  description: string | null;
  permissions: string[] | null;
  is_system: boolean | null;
  created_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  org_id: string | null;
  app_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string | null;
}

export interface Invitation {
  id: string;
  email: string | null;
  org_id: string | null;
  role: string | null;
  status: string | null;
  invited_by: string | null;
  created_at: string | null;
  expires_at: string | null;
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Role[];
    },
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Invitation[];
    },
  });
}
