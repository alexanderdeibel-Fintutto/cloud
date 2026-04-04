import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { CrossSellBanner } from '@/components/marketing/CrossSellBanner'
import GlobalAIChatButton from '@/components/ai/GlobalAIChatButton'

// Pages
import HomePage from '@/pages/HomePage'
import MeineDokumente from '@/pages/MeineDokumente'
import Hilfe from '@/pages/Hilfe'
import Impressum from '@/pages/Impressum'
import Datenschutz from '@/pages/Datenschutz'
import AGB from '@/pages/AGB'

// Auth
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Formulare
import Mietvertrag from '@/pages/formulare/Mietvertrag'
import Kuendigung from '@/pages/formulare/Kuendigung'
import Uebergabeprotokoll from '@/pages/formulare/Uebergabeprotokoll'
import Betriebskosten from '@/pages/formulare/Betriebskosten'
import Mieterhoehung from '@/pages/formulare/Mieterhoehung'
import Maengelanzeige from '@/pages/formulare/Maengelanzeige'
import Selbstauskunft from '@/pages/formulare/Selbstauskunft'
import Untermietvertrag from '@/pages/formulare/Untermietvertrag'

// Rechner
import Mietpreisrechner from '@/pages/rechner/Mietpreisrechner'
import Nebenkostenrechner from '@/pages/rechner/Nebenkostenrechner'
import Kautionsrechner from '@/pages/rechner/Kautionsrechner'
import Kuendigungsfristrechner from '@/pages/rechner/Kuendigungsfristrechner'

// Immobilien
import Objekte from '@/pages/immobilien/Objekte'

function App() {
  return (
    <>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        {/* Immobilien */}
        <Route path="/immobilien/objekte" element={<Objekte />} />
      </Routes>
      <Toaster />
      <CrossSellBanner variant="floating" />
      <GlobalAIChatButton />
    </>
  )
}

export default App
