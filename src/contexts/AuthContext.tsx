import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase'
import { identifyUser } from '../tracker'

interface UserProfile {
  id: string
  email: string
  name: string | null
  tier: 'free' | 'mieter_basic' | 'vermieter_basic' | 'kombi_pro' | 'unlimited'
  checksUsed: number
  checksLimit: number
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  canUseChecker: () => boolean
  incrementChecksUsed: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TIER_LIMITS = {
  free: 1,
  mieter_basic: 3,
  vermieter_basic: 3,
  kombi_pro: 10,
  unlimited: -1, // unlimited
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
          
          // UAR Tracking: Identify user on sign in or sign up
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            identifyUser(session.user.email || '', session.user.id, {
              auth_event: event
            })
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return
    }

    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        tier: data.tier,
        checksUsed: data.checks_used,
        checksLimit: data.checks_limit,
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name: name || null,
        tier: 'free',
        checks_used: 0,
        checks_limit: TIER_LIMITS.free,
      })
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  const canUseChecker = (): boolean => {
    if (!profile) return true // Anonymous users get 1 free check via session
    if (profile.tier === 'unlimited') return true
    return profile.checksUsed < profile.checksLimit
  }

  const incrementChecksUsed = async () => {
    if (!profile) return

    const newCount = profile.checksUsed + 1
    await supabase
      .from('users')
      .update({ checks_used: newCount })
      .eq('id', profile.id)

    setProfile({ ...profile, checksUsed: newCount })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        canUseChecker,
        incrementChecksUsed,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
