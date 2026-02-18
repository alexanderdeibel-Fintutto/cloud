import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAppConfig, ProtectedRoute } from '@fintutto/core'
import { AppShell, ErrorBoundary } from '@fintutto/ui'
import { OfflineIndicator, UpdateBanner, InstallBanner } from '@fintutto/pwa'

// Lazy-loaded Feature Pages
import { Suspense, lazy } from 'react'
import { LoadingState } from '@fintutto/ui'
import { SidebarNavItems, BottomNavItems } from './navigation'

// Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ApartmentPage = lazy(() => import('./pages/ApartmentPage'))
const MetersPage = lazy(() => import('./pages/MetersPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const DefectsPage = lazy(() => import('./pages/DefectsPage'))
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
        {/* Oeffentliche Seiten */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Mieter-Routen */}
        <Route
          path="/apartment"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <ApartmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meters"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <MetersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/defects"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <DefectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
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
