import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAppConfig, useFeature, ProtectedRoute } from '@fintutto/core'
import { AppShell, ErrorBoundary } from '@fintutto/ui'
import { OfflineIndicator, UpdateBanner, InstallBanner } from '@fintutto/pwa'

// Lazy-loaded Feature Pages
import { Suspense, lazy } from 'react'
import { LoadingState } from '@fintutto/ui'
import { SidebarNavItems, BottomNavItems } from './navigation'

// Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'))
const TenantsPage = lazy(() => import('./pages/TenantsPage'))
const MetersPage = lazy(() => import('./pages/MetersPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'))
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'))
const CheckersPage = lazy(() => import('./pages/CheckersPage'))
const BescheidePage = lazy(() => import('./pages/BescheidePage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return <LoadingState variant="skeleton" />
}

function AppRoutes() {
  const hasProperties = useFeature('properties')
  const hasTenants = useFeature('tenants')
  const hasMeters = useFeature('meters')
  const hasDocuments = useFeature('documents')
  const hasPayments = useFeature('payments')
  const hasCalculators = useFeature('calculators')
  const hasCheckers = useFeature('checkers')
  const hasBescheide = useFeature('bescheide')
  const hasTasks = useFeature('tasks')

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Öffentliche Seiten */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Dashboard (immer aktiv) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Feature-basierte Routen */}
        {hasProperties && (
          <Route path="/properties/*" element={<ProtectedRoute><PropertiesPage /></ProtectedRoute>} />
        )}
        {hasTenants && (
          <Route path="/tenants/*" element={<ProtectedRoute><TenantsPage /></ProtectedRoute>} />
        )}
        {hasMeters && (
          <Route path="/meters/*" element={<ProtectedRoute><MetersPage /></ProtectedRoute>} />
        )}
        {hasDocuments && (
          <Route path="/documents/*" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
        )}
        {hasPayments && (
          <Route path="/payments/*" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        )}
        {hasCalculators && (
          <Route path="/calculators/*" element={<ProtectedRoute><CalculatorsPage /></ProtectedRoute>} />
        )}
        {hasCheckers && (
          <Route path="/checkers/*" element={<ProtectedRoute><CheckersPage /></ProtectedRoute>} />
        )}
        {hasBescheide && (
          <Route path="/bescheide/*" element={<ProtectedRoute><BescheidePage /></ProtectedRoute>} />
        )}
        {hasTasks && (
          <Route path="/tasks/*" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        )}

        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

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
