import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  type: "property_management" | "tax_advisor" | "caretaker" | "personal";
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  plan: "free" | "starter" | "professional" | "enterprise";
  owner_id: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "invited" | "active" | "suspended";
  joined_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface OrgInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// ============ HOOKS ============

/**
 * Gibt alle Organisationen zurück, in denen der aktuelle Nutzer Mitglied ist.
 */
export function useMyOrganizations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["organizations", "my", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Mitgliedschaften laden
      const { data: memberships, error } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          status,
          organizations (
            id,
            name,
            slug,
            type,
            logo_url,
            plan,
            owner_id,
            created_at
          )
        `)
        .eq("user_id", user!.id)
        .eq("status", "active");

      if (error) throw error;

      return (memberships ?? [])
        .map((m: any) => ({
          ...m.organizations,
          my_role: m.role,
        }))
        .filter(Boolean) as (Organization & { my_role: string })[];
    },
  });
}

/**
 * Gibt die aktuelle Organisation des Nutzers zurück (aus profiles.organization_id).
 */
export function useCurrentOrganization() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["organizations", "current", profile?.organization_id],
    enabled: !!profile?.organization_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile!.organization_id!)
        .single();

      if (error) throw error;
      return data as Organization;
    },
  });
}

/**
 * Gibt alle Mitglieder einer Organisation zurück.
 */
export function useOrgMembers(organizationId?: string) {
  return useQuery({
    queryKey: ["organizations", "members", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organizationId!)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as OrgMember[];
    },
  });
}

/**
 * Gibt alle offenen Einladungen einer Organisation zurück.
 */
export function useOrgInvitations(organizationId?: string) {
  return useQuery({
    queryKey: ["organizations", "invitations", organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("organization_id", organizationId!)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as OrgInvitation[];
    },
  });
}

/**
 * Mutation: Mitglied einladen.
 */
export function useInviteOrgMember(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: string;
    }) => {
      const { data, error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id: organizationId,
          email,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", "invitations", organizationId],
      });
      toast.success("Einladung wurde versendet");
    },
    onError: (error: any) => {
      toast.error("Einladung fehlgeschlagen: " + error.message);
    },
  });
}

/**
 * Mutation: Mitglieds-Rolle ändern.
 */
export function useUpdateOrgMemberRole(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      const { error } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("id", memberId)
        .eq("organization_id", organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", "members", organizationId],
      });
      toast.success("Rolle wurde aktualisiert");
    },
    onError: (error: any) => {
      toast.error("Fehler beim Aktualisieren: " + error.message);
    },
  });
}

/**
 * Mutation: Mitglied entfernen.
 */
export function useRemoveOrgMember(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", "members", organizationId],
      });
      toast.success("Mitglied wurde entfernt");
    },
    onError: (error: any) => {
      toast.error("Fehler beim Entfernen: " + error.message);
    },
  });
}

/**
 * Mutation: Organisation wechseln (profile.organization_id aktualisieren).
 */
export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ organization_id: organizationId })
        .eq("id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Seite neu laden damit alle Daten mit neuer org_id geladen werden
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error("Fehler beim Wechseln: " + error.message);
    },
  });
}
