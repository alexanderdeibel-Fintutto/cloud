import * as React from 'react'
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  showLoginModal: () => void
  hideLoginModal: () => void
  isLoginModalOpen: boolean
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Helper to convert Supabase user to our User type
function toUser(supabaseUser: SupabaseUser | null, profile?: { full_name?: string | null }): User | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || ''
  }
}

// Fallback to localStorage if Supabase is not configured
function getLocalUser(): User | null {
  const stored = localStorage.getItem('mietrecht_user')
  return stored ? JSON.parse(stored) : null
}

function setLocalUser(user: User | null) {
  if (user) {
    localStorage.setItem('mietrecht_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('mietrecht_user')
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)

  // Initialize auth state
  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      setUser(getLocalUser())
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile for full_name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()

        setUser(toUser(session.user, profile || undefined))
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()

        setUser(toUser(session.user, profile || undefined))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('mietrecht_users') || '[]')
      const found = users.find((u: any) => u.email === email && u.password === password)

      if (found) {
        const userData = { id: found.id, email: found.email, name: found.name }
        setUser(userData)
        setLocalUser(userData)
        setIsLoginModalOpen(false)
        return { success: true }
      }
      return { success: false, error: 'E-Mail oder Passwort falsch' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { success: false, error: translateAuthError(error.message) }
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single()

      setUser(toUser(data.user, profile || undefined))
      setIsLoginModalOpen(false)
      return { success: true }
    }

    return { success: false, error: 'Unbekannter Fehler' }
  }

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('mietrecht_users') || '[]')

      if (users.some((u: any) => u.email === email)) {
        return { success: false, error: 'E-Mail bereits registriert' }
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name
      }

      users.push(newUser)
      localStorage.setItem('mietrecht_users', JSON.stringify(users))

      const userData = { id: newUser.id, email: newUser.email, name: newUser.name }
      setUser(userData)
      setLocalUser(userData)
      setIsLoginModalOpen(false)
      return { success: true }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error) {
      return { success: false, error: translateAuthError(error.message) }
    }

    if (data.user) {
      // Create profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: name,
        subscription_tier: 'free'
      })

      setUser(toUser(data.user, { full_name: name }))
      setIsLoginModalOpen(false)
      return { success: true }
    }

    return { success: false, error: 'Unbekannter Fehler' }
  }

  const logout = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      setLocalUser(null)
      return
    }

    await supabase.auth.signOut()
    setUser(null)
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Passwort-Reset nicht verfügbar' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      return { success: false, error: translateAuthError(error.message) }
    }

    return { success: true }
  }

  const showLoginModal = () => setIsLoginModalOpen(true)
  const hideLoginModal = () => setIsLoginModalOpen(false)

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      showLoginModal,
      hideLoginModal,
      isLoginModalOpen,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Translate Supabase auth errors to German
function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'E-Mail oder Passwort falsch',
    'Email not confirmed': 'E-Mail noch nicht bestätigt. Bitte prüfen Sie Ihr Postfach.',
    'User already registered': 'E-Mail bereits registriert',
    'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben',
    'Unable to validate email address: invalid format': 'Ungültiges E-Mail-Format',
    'Email rate limit exceeded': 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
    'Signup disabled': 'Registrierung momentan nicht möglich',
  }

  return translations[message] || message
}
