import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary, PageSkeleton } from '@fintutto/shared'
import { FintuttoAIChat } from '@fintutto/ai-chat'
import { Toaster } from './components/ui/toaster'
import { CreditsProvider } from './contexts/CreditsContext'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './integrations/supabase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

import Layout from './components/layout/Layout'

// Eagerly loaded
import HomePage from './pages/HomePage'

// Lazy-loaded pages
const RechnerPage = lazy(() => import('./pages/RechnerPage'))
const FormularePage = lazy(() => import('./pages/FormularePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AppsPage = lazy(() => import('./pages/AppsPage'))

// Rechner
const KautionsRechner = lazy(() => import('./pages/rechner/KautionsRechner'))
const MieterhoehungsRechner = lazy(() => import('./pages/rechner/MieterhoehungsRechner'))
const KaufnebenkostenRechner = lazy(() => import('./pages/rechner/KaufnebenkostenRechner'))
const EigenkapitalRechner = lazy(() => import('./pages/rechner/EigenkapitalRechner'))
const GrundsteuerRechner = lazy(() => import('./pages/rechner/GrundsteuerRechner'))
const RenditeRechner = lazy(() => import('./pages/rechner/RenditeRechner'))
const NebenkostenRechner = lazy(() => import('./pages/rechner/NebenkostenRechner'))

// Formulare
const MietvertragFormular = lazy(() => import('./pages/formulare/MietvertragFormular'))
const UebergabeprotokollFormular = lazy(() => import('./pages/formulare/UebergabeprotokollFormular'))
const MieterhoehungFormular = lazy(() => import('./pages/formulare/MieterhoehungFormular'))
const SelbstauskunftFormular = lazy(() => import('./pages/formulare/SelbstauskunftFormular'))
const BetriebskostenFormular = lazy(() => import('./pages/formulare/BetriebskostenFormular'))

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <CreditsProvider>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* Rechner Overview */}
            <Route path="rechner" element={<RechnerPage />} />
            <Route path="rechner/kaution" element={<KautionsRechner />} />
            <Route path="rechner/mieterhoehung" element={<MieterhoehungsRechner />} />
            <Route path="rechner/kaufnebenkosten" element={<KaufnebenkostenRechner />} />
            <Route path="rechner/eigenkapital" element={<EigenkapitalRechner />} />
            <Route path="rechner/grundsteuer" element={<GrundsteuerRechner />} />
            <Route path="rechner/rendite" element={<RenditeRechner />} />
            <Route path="rechner/nebenkosten" element={<NebenkostenRechner />} />

            {/* Formulare Overview */}
            <Route path="formulare" element={<FormularePage />} />
            <Route path="formulare/mietvertrag" element={<MietvertragFormular />} />
            <Route path="formulare/uebergabeprotokoll" element={<UebergabeprotokollFormular />} />
            <Route path="formulare/mieterhoehung" element={<MieterhoehungFormular />} />
            <Route path="formulare/selbstauskunft" element={<SelbstauskunftFormular />} />
            <Route path="formulare/betriebskosten" element={<BetriebskostenFormular />} />

            {/* Apps Ecosystem */}
            <Route path="apps" element={<AppsPage />} />

            {/* Pricing */}
            <Route path="preise" element={<PricingPage />} />
            <Route path="pricing" element={<PricingPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </Suspense>
        <Toaster />
        {/* KI-Assistent - auf allen Seiten verfuegbar (uebernommen aus vermieterportal) */}
        <FintuttoAIChat
          appId="vermieterportal"
          supabaseClient={supabase}
          userTier="free"
        />
      </BrowserRouter>
    </CreditsProvider>
    </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
