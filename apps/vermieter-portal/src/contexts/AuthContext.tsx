import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../integrations/supabase'
import { logActivity } from '../lib/activityLogger'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isLoading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState({ user: session?.user ?? null, session, isLoading: false })
        if (event === 'SIGNED_IN') logActivity('login')
        if (event === 'SIGNED_OUT') logActivity('logout')
        if (event === 'USER_UPDATED') logActivity('signup')
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
