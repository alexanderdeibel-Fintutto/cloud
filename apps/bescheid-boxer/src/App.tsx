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
const UploadPage = lazy(() => import('./pages/UploadPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return <LoadingState variant="skeleton" />
}

function AppRoutes() {
  const hasDocuments = useFeature('documents')
  const hasBescheide = useFeature('bescheide')

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Öffentliche Seiten */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard (immer aktiv) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Upload-Seite */}
        {hasBescheide && (
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
        )}

        {/* Dokumente / Bescheide */}
        {hasDocuments && (
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
        )}

        {/* Analyse */}
        {hasBescheide && (
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
        )}
        {hasBescheide && (
          <Route
            path="/analysis/:documentId"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
        )}

        {/* Einstellungen */}
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
