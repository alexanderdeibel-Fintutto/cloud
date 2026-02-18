import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from '@/components/layout/Layout'

// Pages
import HomePage from '@/pages/HomePage'
import RechnerPage from '@/pages/RechnerPage'
import CheckerPage from '@/pages/CheckerPage'
import FormularePage from '@/pages/FormularePage'
import PricingPage from '@/pages/PricingPage'
import AppsPage from '@/pages/AppsPage'
import ReferralPage from '@/pages/ReferralPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Rechner (7 Vermieter-Tools)
import KautionsRechner from '@/pages/rechner/KautionsRechner'
import MieterhoehungsRechner from '@/pages/rechner/MieterhoehungsRechner'
import KaufnebenkostenRechner from '@/pages/rechner/KaufnebenkostenRechner'
import EigenkapitalRechner from '@/pages/rechner/EigenkapitalRechner'
import GrundsteuerRechner from '@/pages/rechner/GrundsteuerRechner'
import RenditeRechner from '@/pages/rechner/RenditeRechner'
import NebenkostenRechner from '@/pages/rechner/NebenkostenRechner'

// Checker (10 Mieter-Tools)
import MietpreisbremseChecker from '@/pages/checker/MietpreisbremseChecker'
import MieterhoehungChecker from '@/pages/checker/MieterhoehungChecker'
import NebenkostenChecker from '@/pages/checker/NebenkostenChecker'
import BetriebskostenChecker from '@/pages/checker/BetriebskostenChecker'
import KuendigungChecker from '@/pages/checker/KuendigungChecker'
import KautionChecker from '@/pages/checker/KautionChecker'
import MietminderungChecker from '@/pages/checker/MietminderungChecker'
import EigenbedarfChecker from '@/pages/checker/EigenbedarfChecker'
import ModernisierungChecker from '@/pages/checker/ModernisierungChecker'
import SchoenheitsreparaturenChecker from '@/pages/checker/SchoenheitsreparaturenChecker'

// Formulare (10 Vorlagen)
import MietvertragFormular from '@/pages/formulare/MietvertragFormular'
import UebergabeprotokollFormular from '@/pages/formulare/UebergabeprotokollFormular'
import MieterhoehungFormular from '@/pages/formulare/MieterhoehungFormular'
import SelbstauskunftFormular from '@/pages/formulare/SelbstauskunftFormular'
import BetriebskostenFormular from '@/pages/formulare/BetriebskostenFormular'
import KuendigungFormular from '@/pages/formulare/KuendigungFormular'
import MahnungFormular from '@/pages/formulare/MahnungFormular'
import MietbescheinigungFormular from '@/pages/formulare/MietbescheinigungFormular'
import WohnungsgeberbestaetigungFormular from '@/pages/formulare/WohnungsgeberbestaetigungFormular'
import NebenkostenvorauszahlungFormular from '@/pages/formulare/NebenkostenvorauszahlungFormular'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* === RECHNER (Vermieter) === */}
          <Route path="rechner" element={<RechnerPage />} />
          <Route path="rechner/kaution" element={<KautionsRechner />} />
          <Route path="rechner/mieterhoehung" element={<MieterhoehungsRechner />} />
          <Route path="rechner/kaufnebenkosten" element={<KaufnebenkostenRechner />} />
          <Route path="rechner/eigenkapital" element={<EigenkapitalRechner />} />
          <Route path="rechner/grundsteuer" element={<GrundsteuerRechner />} />
          <Route path="rechner/rendite" element={<RenditeRechner />} />
          <Route path="rechner/nebenkosten" element={<NebenkostenRechner />} />

          {/* === CHECKER (Mieter) === */}
          <Route path="checker" element={<CheckerPage />} />
          <Route path="checker/mietpreisbremse" element={<MietpreisbremseChecker />} />
          <Route path="checker/mieterhoehung" element={<MieterhoehungChecker />} />
          <Route path="checker/nebenkosten" element={<NebenkostenChecker />} />
          <Route path="checker/betriebskosten" element={<BetriebskostenChecker />} />
          <Route path="checker/kuendigung" element={<KuendigungChecker />} />
          <Route path="checker/kaution" element={<KautionChecker />} />
          <Route path="checker/mietminderung" element={<MietminderungChecker />} />
          <Route path="checker/eigenbedarf" element={<EigenbedarfChecker />} />
          <Route path="checker/modernisierung" element={<ModernisierungChecker />} />
          <Route path="checker/schoenheitsreparaturen" element={<SchoenheitsreparaturenChecker />} />

          {/* === FORMULARE (10 Vorlagen – Mieter + Vermieter) === */}
          <Route path="formulare" element={<FormularePage />} />
          <Route path="formulare/mietvertrag" element={<MietvertragFormular />} />
          <Route path="formulare/uebergabeprotokoll" element={<UebergabeprotokollFormular />} />
          <Route path="formulare/mieterhoehung" element={<MieterhoehungFormular />} />
          <Route path="formulare/selbstauskunft" element={<SelbstauskunftFormular />} />
          <Route path="formulare/betriebskosten" element={<BetriebskostenFormular />} />
          <Route path="formulare/kuendigung" element={<KuendigungFormular />} />
          <Route path="formulare/mahnung" element={<MahnungFormular />} />
          <Route path="formulare/mietbescheinigung" element={<MietbescheinigungFormular />} />
          <Route path="formulare/wohnungsgeberbestaetigung" element={<WohnungsgeberbestaetigungFormular />} />
          <Route path="formulare/nebenkostenvorauszahlung" element={<NebenkostenvorauszahlungFormular />} />

          {/* === META === */}
          <Route path="preise" element={<PricingPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="apps" element={<AppsPage />} />
          <Route path="referral" element={<ReferralPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
