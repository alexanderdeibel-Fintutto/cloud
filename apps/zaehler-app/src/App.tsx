import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAppConfig, ProtectedRoute } from '@fintutto/core'
import { AppShell, ErrorBoundary } from '@fintutto/ui'
import { OfflineIndicator, UpdateBanner, InstallBanner } from '@fintutto/pwa'

// Lazy-loaded Pages
import { Suspense, lazy } from 'react'
import { LoadingState } from '@fintutto/ui'
import { SidebarNavItems, BottomNavItems } from './navigation'

// Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const MetersPage = lazy(() => import('./pages/MetersPage'))
const CapturePage = lazy(() => import('./pages/CapturePage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return <LoadingState variant="skeleton" />
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Öffentliche Seiten */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Zähler-Routen */}
        <Route
          path="/meters/*"
          element={
            <ProtectedRoute>
              <MetersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/capture"
          element={
            <ProtectedRoute>
              <CapturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const config = useAppConfig()

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <UpdateBanner />
      <AppShell
        appName={config.displayName}
        sidebarItems={SidebarNavItems}
        bottomNavItems={BottomNavItems}
      >
        <AppRoutes />
      </AppShell>
      <InstallBanner appName={config.displayName} />
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  )
}
