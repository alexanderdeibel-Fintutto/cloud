import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase } from '../supabase/client'
import type { AuthContextType, UserProfile, UserRole } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  /**
   * Standard-Rolle für neue Benutzer in dieser App.
   * z.B. 'owner' für Fintutto/Vermietify, 'tenant' für Mieter-App
   */
  defaultRole?: UserRole
  /**
   * Optionaler Callback nach erfolgreichem Login.
   * Z.B. für Onboarding-Redirect oder Analytics.
   */
  onAuthChange?: (user: User | null) => void
  /**
   * Profil-Tabelle in Supabase. Default: 'users'
   * Vermietify nutzt 'profiles', Portal nutzt 'users'
   */
  profileTable?: string
  /**
   * Mapping von DB-Spalten zu UserProfile-Feldern.
   * Erlaubt verschiedene Tabellen-Schemata pro App.
   */
  profileMapper?: (data: Record<string, unknown>) => UserProfile
}

const defaultProfileMapper = (data: Record<string, unknown>): UserProfile => ({
  id: data.id as string,
  email: (data.email as string) ?? '',
  name: (data.name as string) ?? (data.first_name as string) ?? null,
  avatarUrl: (data.avatar_url as string) ?? null,
  role: (data.role as UserRole) ?? 'owner',
  tier: (data.tier as string) ?? 'free',
  organizationId: (data.organization_id as string) ?? null,
  onboardingCompleted: (data.onboarding_completed as boolean) ?? false,
  metadata: {},
})

export function AuthProvider({
  children,
  defaultRole = 'owner',
  onAuthChange,
  profileTable = 'users',
  profileMapper = defaultProfileMapper,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const supabase = getSupabase()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from(profileTable)
      .select('*')
      .eq(profileTable === 'profiles' ? 'user_id' : 'id', userId)
      .single()

    if (error) {
      console.error('[AuthProvider] Profil laden fehlgeschlagen:', error.message)
      return
    }

    if (data) {
      setProfile(profileMapper(data as Record<string, unknown>))
    }
  }, [supabase, profileTable, profileMapper])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        fetchProfile(s.user.id)
      }
      setLoading(false)
      setInitialized(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          await fetchProfile(s.user.id)
        } else {
          setProfile(null)
        }
        onAuthChange?.(s?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile, onAuthChange])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    if (error) throw error

    if (data.user && profileTable === 'users') {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name: metadata?.name ?? null,
        tier: 'free',
        checks_used: 0,
        checks_limit: 1,
      })
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        initialized,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth muss innerhalb eines <AuthProvider> verwendet werden.')
  }
  return context
}
