import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { lazy, Suspense } from 'react'
import { OfflineProvider } from '@/context/OfflineContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'

// Lazy-load non-critical pages for smaller initial bundle
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <OfflineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<TranslatorPage />} />
              <Route path="info" element={<Suspense fallback={<PageLoader />}><InfoPage /></Suspense>} />
              <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
              <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
              <Route path="datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
              <Route path="impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </OfflineProvider>
    </ErrorBoundary>
  )
}

export default App
