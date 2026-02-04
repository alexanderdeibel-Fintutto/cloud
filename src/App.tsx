import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Wird geladen...</p>
      </div>
    </div>
  )
}

// Pages - eagerly loaded (small, commonly accessed)
import HomePage from '@/pages/HomePage'

// Lazy loaded pages
const MeineDokumente = lazy(() => import('@/pages/MeineDokumente'))
const Hilfe = lazy(() => import('@/pages/Hilfe'))
const Impressum = lazy(() => import('@/pages/Impressum'))
const Datenschutz = lazy(() => import('@/pages/Datenschutz'))
const AGB = lazy(() => import('@/pages/AGB'))

// Formulare - lazy loaded (large, contains PDF generators)
const Mietvertrag = lazy(() => import('@/pages/formulare/Mietvertrag'))
const Kuendigung = lazy(() => import('@/pages/formulare/Kuendigung'))
const Uebergabeprotokoll = lazy(() => import('@/pages/formulare/Uebergabeprotokoll'))
const Betriebskosten = lazy(() => import('@/pages/formulare/Betriebskosten'))
const Mieterhoehung = lazy(() => import('@/pages/formulare/Mieterhoehung'))
const Maengelanzeige = lazy(() => import('@/pages/formulare/Maengelanzeige'))
const Selbstauskunft = lazy(() => import('@/pages/formulare/Selbstauskunft'))
const Untermietvertrag = lazy(() => import('@/pages/formulare/Untermietvertrag'))

// Rechner - lazy loaded
const Mietpreisrechner = lazy(() => import('@/pages/rechner/Mietpreisrechner'))
const Nebenkostenrechner = lazy(() => import('@/pages/rechner/Nebenkostenrechner'))
const Kautionsrechner = lazy(() => import('@/pages/rechner/Kautionsrechner'))
const Kuendigungsfristrechner = lazy(() => import('@/pages/rechner/Kuendigungsfristrechner'))

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Hauptseiten */}
          <Route path="/" element={<HomePage />} />
          <Route path="/meine-dokumente" element={<MeineDokumente />} />
          <Route path="/hilfe" element={<Hilfe />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />

          {/* Formulare */}
          <Route path="/formulare/mietvertrag" element={<Mietvertrag />} />
          <Route path="/formulare/kuendigung" element={<Kuendigung />} />
          <Route path="/formulare/uebergabeprotokoll" element={<Uebergabeprotokoll />} />
          <Route path="/formulare/betriebskosten" element={<Betriebskosten />} />
          <Route path="/formulare/mieterhoehung" element={<Mieterhoehung />} />
          <Route path="/formulare/maengelanzeige" element={<Maengelanzeige />} />
          <Route path="/formulare/selbstauskunft" element={<Selbstauskunft />} />
          <Route path="/formulare/untermietvertrag" element={<Untermietvertrag />} />

          {/* Rechner */}
          <Route path="/rechner/mietpreis" element={<Mietpreisrechner />} />
          <Route path="/rechner/nebenkosten" element={<Nebenkostenrechner />} />
          <Route path="/rechner/kaution" element={<Kautionsrechner />} />
          <Route path="/rechner/kuendigungsfrist" element={<Kuendigungsfristrechner />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  )
}

export default App
