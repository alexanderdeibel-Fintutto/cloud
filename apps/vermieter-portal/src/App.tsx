import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/toaster'
import { CreditsProvider } from './contexts/CreditsContext'
import { AuthProvider } from './contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import RechnerPage from './pages/RechnerPage'
import FormularePage from './pages/FormularePage'
import PricingPage from './pages/PricingPage'
import NotFoundPage from './pages/NotFoundPage'

// Rechner
import KautionsRechner from './pages/rechner/KautionsRechner'
import MieterhoehungsRechner from './pages/rechner/MieterhoehungsRechner'
import KaufnebenkostenRechner from './pages/rechner/KaufnebenkostenRechner'
import EigenkapitalRechner from './pages/rechner/EigenkapitalRechner'
import GrundsteuerRechner from './pages/rechner/GrundsteuerRechner'
import RenditeRechner from './pages/rechner/RenditeRechner'
import NebenkostenRechner from './pages/rechner/NebenkostenRechner'

// Formulare
import MietvertragFormular from './pages/formulare/MietvertragFormular'
import UebergabeprotokollFormular from './pages/formulare/UebergabeprotokollFormular'
import MieterhoehungFormular from './pages/formulare/MieterhoehungFormular'
import SelbstauskunftFormular from './pages/formulare/SelbstauskunftFormular'
import BetriebskostenFormular from './pages/formulare/BetriebskostenFormular'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <CreditsProvider>
      <BrowserRouter>
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

            {/* Pricing */}
            <Route path="preise" element={<PricingPage />} />
            <Route path="pricing" element={<PricingPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </CreditsProvider>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
