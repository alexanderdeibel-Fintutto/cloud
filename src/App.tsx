import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CheckerProvider } from '@/contexts/CheckerContext'
import Layout from '@/components/layout/Layout'

// Pages
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import PricingPage from '@/pages/PricingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import CheckoutSuccessPage from '@/pages/CheckoutSuccessPage'
import CheckoutCancelPage from '@/pages/CheckoutCancelPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ResultPage from '@/pages/ResultPage'

// Hub / Listing Pages
import RechnerPage from '@/pages/RechnerPage'
import CheckerPage from '@/pages/CheckerPage'
import FormularePage from '@/pages/FormularePage'
import AppsPage from '@/pages/AppsPage'
import ReferralPage from '@/pages/ReferralPage'

// Rechner (7 Vermieter-Tools)
import KautionsRechner from '@/pages/rechner/KautionsRechner'
import MieterhoehungsRechner from '@/pages/rechner/MieterhoehungsRechner'
import KaufnebenkostenRechner from '@/pages/rechner/KaufnebenkostenRechner'
import EigenkapitalRechner from '@/pages/rechner/EigenkapitalRechner'
import GrundsteuerRechner from '@/pages/rechner/GrundsteuerRechner'
import RenditeRechner from '@/pages/rechner/RenditeRechner'
import NebenkostenRechner from '@/pages/rechner/NebenkostenRechner'

// Checker (10 Mieter-Tools)
import MietpreisbremseChecker from '@/pages/checkers/MietpreisbremseChecker'
import MieterhoehungChecker from '@/pages/checkers/MieterhoehungChecker'
import NebenkostenChecker from '@/pages/checkers/NebenkostenChecker'
import BetriebskostenChecker from '@/pages/checkers/BetriebskostenChecker'
import KuendigungChecker from '@/pages/checkers/KuendigungChecker'
import KautionChecker from '@/pages/checkers/KautionChecker'
import MietminderungChecker from '@/pages/checkers/MietminderungChecker'
import EigenbedarfChecker from '@/pages/checkers/EigenbedarfChecker'
import ModernisierungChecker from '@/pages/checkers/ModernisierungChecker'
import SchoenheitsreparaturenChecker from '@/pages/checkers/SchoenheitsreparaturenChecker'

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
    <AuthProvider>
      <CheckerProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/preise" element={<PricingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

            {/* Hub Pages */}
            <Route path="/rechner" element={<RechnerPage />} />
            <Route path="/checker" element={<CheckerPage />} />
            <Route path="/formulare" element={<FormularePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/referral" element={<ReferralPage />} />

            {/* Rechner Routes */}
            <Route path="/rechner/kaution" element={<KautionsRechner />} />
            <Route path="/rechner/mieterhoehung" element={<MieterhoehungsRechner />} />
            <Route path="/rechner/kaufnebenkosten" element={<KaufnebenkostenRechner />} />
            <Route path="/rechner/eigenkapital" element={<EigenkapitalRechner />} />
            <Route path="/rechner/grundsteuer" element={<GrundsteuerRechner />} />
            <Route path="/rechner/rendite" element={<RenditeRechner />} />
            <Route path="/rechner/nebenkosten" element={<NebenkostenRechner />} />

            {/* Checker Routes */}
            <Route path="/checker/mietpreisbremse" element={<MietpreisbremseChecker />} />
            <Route path="/checker/mieterhoehung" element={<MieterhoehungChecker />} />
            <Route path="/checker/nebenkosten" element={<NebenkostenChecker />} />
            <Route path="/checker/betriebskosten" element={<BetriebskostenChecker />} />
            <Route path="/checker/kuendigung" element={<KuendigungChecker />} />
            <Route path="/checker/kaution" element={<KautionChecker />} />
            <Route path="/checker/mietminderung" element={<MietminderungChecker />} />
            <Route path="/checker/eigenbedarf" element={<EigenbedarfChecker />} />
            <Route path="/checker/modernisierung" element={<ModernisierungChecker />} />
            <Route path="/checker/schoenheitsreparaturen" element={<SchoenheitsreparaturenChecker />} />

            {/* Formulare Routes */}
            <Route path="/formulare/mietvertrag" element={<MietvertragFormular />} />
            <Route path="/formulare/uebergabeprotokoll" element={<UebergabeprotokollFormular />} />
            <Route path="/formulare/mieterhoehung" element={<MieterhoehungFormular />} />
            <Route path="/formulare/selbstauskunft" element={<SelbstauskunftFormular />} />
            <Route path="/formulare/betriebskosten" element={<BetriebskostenFormular />} />
            <Route path="/formulare/kuendigung" element={<KuendigungFormular />} />
            <Route path="/formulare/mahnung" element={<MahnungFormular />} />
            <Route path="/formulare/mietbescheinigung" element={<MietbescheinigungFormular />} />
            <Route path="/formulare/wohnungsgeberbestaetigung" element={<WohnungsgeberbestaetigungFormular />} />
            <Route path="/formulare/nebenkostenvorauszahlung" element={<NebenkostenvorauszahlungFormular />} />

            {/* Result Page */}
            <Route path="/ergebnis/:checkerId/:resultId" element={<ResultPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" richColors />
      </CheckerProvider>
    </AuthProvider>
  )
}

export default App
