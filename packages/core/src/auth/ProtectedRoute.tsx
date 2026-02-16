import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  /**
   * Erlaubte Rollen. Wenn leer, reicht Authentication.
   */
  allowedRoles?: UserRole[]
  /**
   * Wohin bei fehlender Auth redirected wird.
   */
  loginPath?: string
  /**
   * Wohin bei fehlender Berechtigung redirected wird.
   */
  unauthorizedPath?: string
  /**
   * Lade-Komponente während Auth-Check.
   */
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = '/login',
  unauthorizedPath = '/',
  fallback,
}: ProtectedRouteProps) {
  const { user, profile, loading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return fallback ? <>{fallback}</> : (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to={unauthorizedPath} replace />
    }
  }

  return <>{children}</>
}
