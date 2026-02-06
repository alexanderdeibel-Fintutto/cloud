import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase'

interface UserProfile {
  id: string
  email: string
  name: string | null
  tier: 'free' | 'basic' | 'premium'
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
  getRemainingChecks: () => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TIER_LIMITS = {
  free: 1,
  basic: 3,
  premium: -1, // unlimited
}

const ANONYMOUS_STORAGE_KEY = 'fintutto_anonymous_checks'
const ANONYMOUS_CHECK_LIMIT = 1

interface AnonymousCheckData {
  checksUsed: number
  resetDate: string // ISO date string for monthly reset
}

function getAnonymousCheckData(): AnonymousCheckData {
  try {
    const stored = localStorage.getItem(ANONYMOUS_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as AnonymousCheckData
      const resetDate = new Date(data.resetDate)
      const now = new Date()

      // Reset monthly
      if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        const newData: AnonymousCheckData = { checksUsed: 0, resetDate: now.toISOString() }
        localStorage.setItem(ANONYMOUS_STORAGE_KEY, JSON.stringify(newData))
        return newData
      }
      return data
    }
  } catch {
    // Ignore localStorage errors
  }
  const newData: AnonymousCheckData = { checksUsed: 0, resetDate: new Date().toISOString() }
  localStorage.setItem(ANONYMOUS_STORAGE_KEY, JSON.stringify(newData))
  return newData
}

function incrementAnonymousChecks(): void {
  const data = getAnonymousCheckData()
  data.checksUsed += 1
  localStorage.setItem(ANONYMOUS_STORAGE_KEY, JSON.stringify(data))
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
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
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
      console.error('Error fetching profile:', error)
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
    // For logged-in users
    if (profile) {
      if (profile.tier === 'premium') return true
      return profile.checksUsed < profile.checksLimit
    }

    // For anonymous users - check localStorage
    const anonymousData = getAnonymousCheckData()
    return anonymousData.checksUsed < ANONYMOUS_CHECK_LIMIT
  }

  const incrementChecksUsed = async () => {
    // For logged-in users
    if (profile) {
      const newCount = profile.checksUsed + 1
      await supabase
        .from('users')
        .update({ checks_used: newCount })
        .eq('id', profile.id)

      setProfile({ ...profile, checksUsed: newCount })
      return
    }

    // For anonymous users
    incrementAnonymousChecks()
  }

  const getRemainingChecks = (): number => {
    if (profile) {
      if (profile.tier === 'premium') return -1 // unlimited
      return Math.max(0, profile.checksLimit - profile.checksUsed)
    }
    const anonymousData = getAnonymousCheckData()
    return Math.max(0, ANONYMOUS_CHECK_LIMIT - anonymousData.checksUsed)
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
        getRemainingChecks,
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
