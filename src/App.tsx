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

// ============================================
// FORMULARE - Mietverträge (8)
// ============================================
const Mietvertrag = lazy(() => import('@/pages/formulare/Mietvertrag'))
const Untermietvertrag = lazy(() => import('@/pages/formulare/Untermietvertrag'))
const Gewerbemietvertrag = lazy(() => import('@/pages/formulare/Gewerbemietvertrag'))
const Staffelmietvertrag = lazy(() => import('@/pages/formulare/Staffelmietvertrag'))
const Indexmietvertrag = lazy(() => import('@/pages/formulare/Indexmietvertrag'))
const Zeitmietvertrag = lazy(() => import('@/pages/formulare/Zeitmietvertrag'))
const WGMietvertrag = lazy(() => import('@/pages/formulare/WGMietvertrag'))
const Garagenmietvertrag = lazy(() => import('@/pages/formulare/Garagenmietvertrag'))
const Ferienwohnungsmietvertrag = lazy(() => import('@/pages/formulare/Ferienwohnungsmietvertrag'))

// ============================================
// FORMULARE - Kündigungen & Beendigung (4)
// ============================================
const Kuendigung = lazy(() => import('@/pages/formulare/Kuendigung'))
const AusserordentlicheKuendigung = lazy(() => import('@/pages/formulare/AusserordentlicheKuendigung'))
const Aufhebungsvertrag = lazy(() => import('@/pages/formulare/Aufhebungsvertrag'))

// ============================================
// FORMULARE - Mieterhöhung (1)
// ============================================
const Mieterhoehung = lazy(() => import('@/pages/formulare/Mieterhoehung'))

// ============================================
// FORMULARE - Übergabe & Protokolle (2)
// ============================================
const Uebergabeprotokoll = lazy(() => import('@/pages/formulare/Uebergabeprotokoll'))

// ============================================
// FORMULARE - Betriebskosten (1)
// ============================================
const Betriebskosten = lazy(() => import('@/pages/formulare/Betriebskosten'))

// ============================================
// FORMULARE - Mängel & Instandhaltung (1)
// ============================================
const Maengelanzeige = lazy(() => import('@/pages/formulare/Maengelanzeige'))

// ============================================
// FORMULARE - Bescheinigungen & Bestätigungen (3)
// ============================================
const Selbstauskunft = lazy(() => import('@/pages/formulare/Selbstauskunft'))
const Wohnungsgeberbestaetigung = lazy(() => import('@/pages/formulare/Wohnungsgeberbestaetigung'))
const Mietschuldenfreiheitsbescheinigung = lazy(() => import('@/pages/formulare/Mietschuldenfreiheitsbescheinigung'))

// ============================================
// FORMULARE - Zahlungen & Bankverbindung (3)
// ============================================
const SEPALastschriftmandat = lazy(() => import('@/pages/formulare/SEPALastschriftmandat'))
const Mahnung = lazy(() => import('@/pages/formulare/Mahnung'))
const Kautionsrueckforderung = lazy(() => import('@/pages/formulare/Kautionsrueckforderung'))

// ============================================
// RECHNER
// ============================================
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

          {/* Formulare - Mietverträge */}
          <Route path="/formulare/mietvertrag" element={<Mietvertrag />} />
          <Route path="/formulare/untermietvertrag" element={<Untermietvertrag />} />
          <Route path="/formulare/gewerbemietvertrag" element={<Gewerbemietvertrag />} />
          <Route path="/formulare/staffelmietvertrag" element={<Staffelmietvertrag />} />
          <Route path="/formulare/indexmietvertrag" element={<Indexmietvertrag />} />
          <Route path="/formulare/zeitmietvertrag" element={<Zeitmietvertrag />} />
          <Route path="/formulare/wg-mietvertrag" element={<WGMietvertrag />} />
          <Route path="/formulare/garagenmietvertrag" element={<Garagenmietvertrag />} />
          <Route path="/formulare/ferienwohnungsmietvertrag" element={<Ferienwohnungsmietvertrag />} />

          {/* Formulare - Kündigungen */}
          <Route path="/formulare/kuendigung" element={<Kuendigung />} />
          <Route path="/formulare/ausserordentliche-kuendigung" element={<AusserordentlicheKuendigung />} />
          <Route path="/formulare/aufhebungsvertrag" element={<Aufhebungsvertrag />} />

          {/* Formulare - Mieterhöhung */}
          <Route path="/formulare/mieterhoehung" element={<Mieterhoehung />} />

          {/* Formulare - Übergabe */}
          <Route path="/formulare/uebergabeprotokoll" element={<Uebergabeprotokoll />} />

          {/* Formulare - Betriebskosten */}
          <Route path="/formulare/betriebskosten" element={<Betriebskosten />} />

          {/* Formulare - Mängel */}
          <Route path="/formulare/maengelanzeige" element={<Maengelanzeige />} />

          {/* Formulare - Bescheinigungen */}
          <Route path="/formulare/selbstauskunft" element={<Selbstauskunft />} />
          <Route path="/formulare/wohnungsgeberbestaetigung" element={<Wohnungsgeberbestaetigung />} />
          <Route path="/formulare/mietschuldenfreiheitsbescheinigung" element={<Mietschuldenfreiheitsbescheinigung />} />

          {/* Formulare - Zahlungen */}
          <Route path="/formulare/sepa-lastschriftmandat" element={<SEPALastschriftmandat />} />
          <Route path="/formulare/mahnung" element={<Mahnung />} />
          <Route path="/formulare/kautionsrueckforderung" element={<Kautionsrueckforderung />} />

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
