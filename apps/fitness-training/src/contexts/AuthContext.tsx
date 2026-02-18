import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getUserProfile } from '@/lib/supabase'
import type { UserProfile, SubscriptionTier } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  subscriptionTier: SubscriptionTier
  setProfile: (profile: UserProfile | null) => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  subscriptionTier: 'free',
  setProfile: () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) return
    const { data } = await getUserProfile(user.id)
    if (data) {
      setProfile(data as unknown as UserProfile)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserProfile(session.user.id).then(({ data }) => {
          if (data) setProfile(data as unknown as UserProfile)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getUserProfile(session.user.id).then(({ data }) => {
          if (data) setProfile(data as unknown as UserProfile)
        })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        subscriptionTier: profile?.subscriptionTier || 'free',
        setProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
