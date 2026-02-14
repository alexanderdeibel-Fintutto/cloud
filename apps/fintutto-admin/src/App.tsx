import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/layout/Layout'
import { Dashboard, Settings, Auth } from '@/pages'

const Domains = lazy(() => import('@/pages/Domains').then(m => ({ default: m.Domains })))
const DomainDetail = lazy(() => import('@/pages/DomainDetail').then(m => ({ default: m.DomainDetail })))
const LinkChecker = lazy(() => import('@/pages/LinkChecker').then(m => ({ default: m.LinkChecker })))

const LazyFallback = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route
        path="/domains"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}><Domains /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/domains/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}><DomainDetail /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/link-checker"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}><LinkChecker /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  )
}
