import * as React from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  showLoginModal: () => void
  hideLoginModal: () => void
  isLoginModalOpen: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const stored = localStorage.getItem('mietrecht_user')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simplified login - in production, this would call an API
    const users = JSON.parse(localStorage.getItem('mietrecht_users') || '[]')
    const found = users.find((u: any) => u.email === email && u.password === password)

    if (found) {
      const userData = { id: found.id, email: found.email, name: found.name }
      setUser(userData)
      localStorage.setItem('mietrecht_user', JSON.stringify(userData))
      setIsLoginModalOpen(false)
      return true
    }
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('mietrecht_users') || '[]')

    if (users.some((u: any) => u.email === email)) {
      return false // Email already exists
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
    localStorage.setItem('mietrecht_user', JSON.stringify(userData))
    setIsLoginModalOpen(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mietrecht_user')
  }

  const showLoginModal = () => setIsLoginModalOpen(true)
  const hideLoginModal = () => setIsLoginModalOpen(false)

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      showLoginModal,
      hideLoginModal,
      isLoginModalOpen
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
