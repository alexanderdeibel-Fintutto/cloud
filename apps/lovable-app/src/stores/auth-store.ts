import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  legalForm: string;
  role: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organizations: [],
      currentOrganization: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setOrganizations: (organizations) => set({ organizations }),

      setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({
              user: {
                id: data.user.id,
                email: data.user.email!,
                firstName: profile?.first_name,
                lastName: profile?.last_name,
                avatar: profile?.avatar_url,
              },
              isAuthenticated: true,
            });

            // Fetch organizations
            const { data: orgs } = await supabase
              .from('organization_members')
              .select(`
                role,
                organization:organizations(id, name, slug, legal_form)
              `)
              .eq('user_id', data.user.id);

            if (orgs && orgs.length > 0) {
              const organizations = orgs.map((o: any) => ({
                id: o.organization.id,
                name: o.organization.name,
                slug: o.organization.slug,
                legalForm: o.organization.legal_form,
                role: o.role,
              }));
              set({
                organizations,
                currentOrganization: organizations[0],
              });
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
              },
            },
          });

          if (error) throw error;

          if (authData.user) {
            set({
              user: {
                id: authData.user.id,
                email: authData.user.email!,
                firstName: data.firstName,
                lastName: data.lastName,
              },
              isAuthenticated: true,
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          organizations: [],
          currentOrganization: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              user: {
                id: session.user.id,
                email: session.user.email!,
                firstName: profile?.first_name,
                lastName: profile?.last_name,
                avatar: profile?.avatar_url,
              },
              isAuthenticated: true,
            });

            // Fetch organizations
            const { data: orgs } = await supabase
              .from('organization_members')
              .select(`
                role,
                organization:organizations(id, name, slug, legal_form)
              `)
              .eq('user_id', session.user.id);

            if (orgs && orgs.length > 0) {
              const organizations = orgs.map((o: any) => ({
                id: o.organization.id,
                name: o.organization.name,
                slug: o.organization.slug,
                legalForm: o.organization.legal_form,
                role: o.role,
              }));

              const current = get().currentOrganization;
              set({
                organizations,
                currentOrganization: current || organizations[0],
              });
            }
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'fintutto-auth',
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
      }),
    }
  )
);
