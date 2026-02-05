import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoginModal } from '@/components/LoginModal'

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
// FORMULARE - Kündigungen & Beendigung (5)
// ============================================
const Kuendigung = lazy(() => import('@/pages/formulare/Kuendigung'))
const AusserordentlicheKuendigung = lazy(() => import('@/pages/formulare/AusserordentlicheKuendigung'))
const Aufhebungsvertrag = lazy(() => import('@/pages/formulare/Aufhebungsvertrag'))
const Eigenbedarfskuendigung = lazy(() => import('@/pages/formulare/Eigenbedarfskuendigung'))

// ============================================
// FORMULARE - Mieterhöhung & Modernisierung (3)
// ============================================
const Mieterhoehung = lazy(() => import('@/pages/formulare/Mieterhoehung'))
const Modernisierungsankuendigung = lazy(() => import('@/pages/formulare/Modernisierungsankuendigung'))
const Mietanpassung = lazy(() => import('@/pages/formulare/Mietanpassung'))

// ============================================
// FORMULARE - Übergabe & Protokolle (4)
// ============================================
const Uebergabeprotokoll = lazy(() => import('@/pages/formulare/Uebergabeprotokoll'))
const Schluesseluebergabe = lazy(() => import('@/pages/formulare/Schluesseluebergabe'))
const Einzugsbestaetigung = lazy(() => import('@/pages/formulare/Einzugsbestaetigung'))
const Auszugsbestaetigung = lazy(() => import('@/pages/formulare/Auszugsbestaetigung'))

// ============================================
// FORMULARE - Betriebskosten (4)
// ============================================
const Betriebskosten = lazy(() => import('@/pages/formulare/Betriebskosten'))
const Nebenkostenabrechnung = lazy(() => import('@/pages/formulare/Nebenkostenabrechnung'))
const WiderspruchBetriebskosten = lazy(() => import('@/pages/formulare/WiderspruchBetriebskosten'))
const Betriebskostenvorauszahlung = lazy(() => import('@/pages/formulare/Betriebskostenvorauszahlung'))

// ============================================
// FORMULARE - Mängel & Instandhaltung (4)
// ============================================
const Maengelanzeige = lazy(() => import('@/pages/formulare/Maengelanzeige'))
const Mietminderung = lazy(() => import('@/pages/formulare/Mietminderung'))
const Reparaturanforderung = lazy(() => import('@/pages/formulare/Reparaturanforderung'))
const Renovierungsvereinbarung = lazy(() => import('@/pages/formulare/Renovierungsvereinbarung'))

// ============================================
// FORMULARE - Bescheinigungen & Bestätigungen (7)
// ============================================
const Selbstauskunft = lazy(() => import('@/pages/formulare/Selbstauskunft'))
const Wohnungsgeberbestaetigung = lazy(() => import('@/pages/formulare/Wohnungsgeberbestaetigung'))
const Mietschuldenfreiheitsbescheinigung = lazy(() => import('@/pages/formulare/Mietschuldenfreiheitsbescheinigung'))
const Hausordnung = lazy(() => import('@/pages/formulare/Hausordnung'))
const Untervermietungserlaubnis = lazy(() => import('@/pages/formulare/Untervermietungserlaubnis'))
const Mietbescheinigung = lazy(() => import('@/pages/formulare/Mietbescheinigung'))
const Tierhaltungserlaubnis = lazy(() => import('@/pages/formulare/Tierhaltungserlaubnis'))

// ============================================
// FORMULARE - Zahlungen & Bankverbindung (8)
// ============================================
const SEPALastschriftmandat = lazy(() => import('@/pages/formulare/SEPALastschriftmandat'))
const Mahnung = lazy(() => import('@/pages/formulare/Mahnung'))
const Kautionsrueckforderung = lazy(() => import('@/pages/formulare/Kautionsrueckforderung'))
const Zahlungserinnerung = lazy(() => import('@/pages/formulare/Zahlungserinnerung'))
const Kautionsabrechnung = lazy(() => import('@/pages/formulare/Kautionsabrechnung'))
const Kautionsquittung = lazy(() => import('@/pages/formulare/Kautionsquittung'))
const Mietrueckstand = lazy(() => import('@/pages/formulare/Mietrueckstand'))
const Mietbuergschaft = lazy(() => import('@/pages/formulare/Mietbuergschaft'))

// ============================================
// FORMULARE - Vertragsänderungen (2)
// ============================================
const Nachtragsvereinbarung = lazy(() => import('@/pages/formulare/Nachtragsvereinbarung'))
const Stellplatzvereinbarung = lazy(() => import('@/pages/formulare/Stellplatzvereinbarung'))

// ============================================
// FORMULARE - Verwaltung & Vollmachten (4)
// ============================================
const Vollmacht = lazy(() => import('@/pages/formulare/Vollmacht'))
const Besichtigungsprotokoll = lazy(() => import('@/pages/formulare/Besichtigungsprotokoll'))
const Mieterhoehungszustimmung = lazy(() => import('@/pages/formulare/Mieterhoehungszustimmung'))
const Hausmeistervereinbarung = lazy(() => import('@/pages/formulare/Hausmeistervereinbarung'))

// ============================================
// FORMULARE - Weitere Dokumente (12)
// ============================================
const Raeumungsaufforderung = lazy(() => import('@/pages/formulare/Raeumungsaufforderung'))
const Instandhaltungsvereinbarung = lazy(() => import('@/pages/formulare/Instandhaltungsvereinbarung'))
const Mietvorvertrag = lazy(() => import('@/pages/formulare/Mietvorvertrag'))
const Bewerbungsschreiben = lazy(() => import('@/pages/formulare/Bewerbungsschreiben'))
const Schoenheitsreparaturen = lazy(() => import('@/pages/formulare/Schoenheitsreparaturen'))
const Verwaltervertrag = lazy(() => import('@/pages/formulare/Verwaltervertrag'))
const ErinnerungNebenkosten = lazy(() => import('@/pages/formulare/ErinnerungNebenkosten'))
const BaulicheAenderung = lazy(() => import('@/pages/formulare/BaulicheAenderung'))
const Sondervereinbarung = lazy(() => import('@/pages/formulare/Sondervereinbarung'))
const Abmahnung = lazy(() => import('@/pages/formulare/Abmahnung'))
const Gartennutzungsvereinbarung = lazy(() => import('@/pages/formulare/Gartennutzungsvereinbarung'))

// ============================================
// RECHNER
// ============================================
const Mietpreisrechner = lazy(() => import('@/pages/rechner/Mietpreisrechner'))
const Nebenkostenrechner = lazy(() => import('@/pages/rechner/Nebenkostenrechner'))
const Kautionsrechner = lazy(() => import('@/pages/rechner/Kautionsrechner'))
const Kuendigungsfristrechner = lazy(() => import('@/pages/rechner/Kuendigungsfristrechner'))

function App() {
  return (
    <AuthProvider>
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
          <Route path="/formulare/eigenbedarfskuendigung" element={<Eigenbedarfskuendigung />} />

          {/* Formulare - Mieterhöhung & Modernisierung */}
          <Route path="/formulare/mieterhoehung" element={<Mieterhoehung />} />
          <Route path="/formulare/modernisierungsankuendigung" element={<Modernisierungsankuendigung />} />
          <Route path="/formulare/mietanpassung" element={<Mietanpassung />} />

          {/* Formulare - Übergabe */}
          <Route path="/formulare/uebergabeprotokoll" element={<Uebergabeprotokoll />} />
          <Route path="/formulare/schluesseluebergabe" element={<Schluesseluebergabe />} />
          <Route path="/formulare/einzugsbestaetigung" element={<Einzugsbestaetigung />} />
          <Route path="/formulare/auszugsbestaetigung" element={<Auszugsbestaetigung />} />

          {/* Formulare - Betriebskosten */}
          <Route path="/formulare/betriebskosten" element={<Betriebskosten />} />
          <Route path="/formulare/nebenkostenabrechnung" element={<Nebenkostenabrechnung />} />
          <Route path="/formulare/widerspruch-betriebskosten" element={<WiderspruchBetriebskosten />} />
          <Route path="/formulare/betriebskostenvorauszahlung" element={<Betriebskostenvorauszahlung />} />

          {/* Formulare - Mängel */}
          <Route path="/formulare/maengelanzeige" element={<Maengelanzeige />} />
          <Route path="/formulare/mietminderung" element={<Mietminderung />} />
          <Route path="/formulare/reparaturanforderung" element={<Reparaturanforderung />} />
          <Route path="/formulare/renovierungsvereinbarung" element={<Renovierungsvereinbarung />} />

          {/* Formulare - Bescheinigungen */}
          <Route path="/formulare/selbstauskunft" element={<Selbstauskunft />} />
          <Route path="/formulare/wohnungsgeberbestaetigung" element={<Wohnungsgeberbestaetigung />} />
          <Route path="/formulare/mietschuldenfreiheitsbescheinigung" element={<Mietschuldenfreiheitsbescheinigung />} />
          <Route path="/formulare/hausordnung" element={<Hausordnung />} />
          <Route path="/formulare/untervermietungserlaubnis" element={<Untervermietungserlaubnis />} />
          <Route path="/formulare/mietbescheinigung" element={<Mietbescheinigung />} />
          <Route path="/formulare/tierhaltungserlaubnis" element={<Tierhaltungserlaubnis />} />

          {/* Formulare - Zahlungen */}
          <Route path="/formulare/sepa-lastschriftmandat" element={<SEPALastschriftmandat />} />
          <Route path="/formulare/mahnung" element={<Mahnung />} />
          <Route path="/formulare/kautionsrueckforderung" element={<Kautionsrueckforderung />} />
          <Route path="/formulare/zahlungserinnerung" element={<Zahlungserinnerung />} />
          <Route path="/formulare/kautionsabrechnung" element={<Kautionsabrechnung />} />
          <Route path="/formulare/kautionsquittung" element={<Kautionsquittung />} />
          <Route path="/formulare/mietrueckstand" element={<Mietrueckstand />} />
          <Route path="/formulare/mietbuergschaft" element={<Mietbuergschaft />} />

          {/* Formulare - Vertragsänderungen */}
          <Route path="/formulare/nachtragsvereinbarung" element={<Nachtragsvereinbarung />} />
          <Route path="/formulare/stellplatzvereinbarung" element={<Stellplatzvereinbarung />} />

          {/* Formulare - Verwaltung & Vollmachten */}
          <Route path="/formulare/vollmacht" element={<Vollmacht />} />
          <Route path="/formulare/besichtigungsprotokoll" element={<Besichtigungsprotokoll />} />
          <Route path="/formulare/mieterhoehungszustimmung" element={<Mieterhoehungszustimmung />} />
          <Route path="/formulare/hausmeistervereinbarung" element={<Hausmeistervereinbarung />} />

          {/* Formulare - Weitere Dokumente */}
          <Route path="/formulare/raeumungsaufforderung" element={<Raeumungsaufforderung />} />
          <Route path="/formulare/instandhaltungsvereinbarung" element={<Instandhaltungsvereinbarung />} />
          <Route path="/formulare/mietvorvertrag" element={<Mietvorvertrag />} />
          <Route path="/formulare/bewerbungsschreiben" element={<Bewerbungsschreiben />} />
          <Route path="/formulare/schoenheitsreparaturen" element={<Schoenheitsreparaturen />} />
          <Route path="/formulare/verwaltervertrag" element={<Verwaltervertrag />} />
          <Route path="/formulare/erinnerung-nebenkosten" element={<ErinnerungNebenkosten />} />
          <Route path="/formulare/bauliche-aenderung" element={<BaulicheAenderung />} />
          <Route path="/formulare/sondervereinbarung" element={<Sondervereinbarung />} />
          <Route path="/formulare/abmahnung" element={<Abmahnung />} />
          <Route path="/formulare/gartennutzungsvereinbarung" element={<Gartennutzungsvereinbarung />} />

          {/* Rechner */}
          <Route path="/rechner/mietpreis" element={<Mietpreisrechner />} />
          <Route path="/rechner/nebenkosten" element={<Nebenkostenrechner />} />
          <Route path="/rechner/kaution" element={<Kautionsrechner />} />
          <Route path="/rechner/kuendigungsfrist" element={<Kuendigungsfristrechner />} />
        </Routes>
      </Suspense>
      <LoginModal />
      <Toaster />
    </AuthProvider>
  )
}

export default App
