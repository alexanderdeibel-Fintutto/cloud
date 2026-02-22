import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'
import { BescheidProvider } from './contexts/BescheidContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import BescheidePage from './pages/bescheide/BescheidePage'
import BescheidDetailPage from './pages/bescheide/BescheidDetailPage'
import UploadPage from './pages/UploadPage'
import AnalysePage from './pages/analyse/AnalysePage'
import FristenPage from './pages/fristen/FristenPage'
import EinspruchPage from './pages/einspruch/EinspruchPage'
import EinspruchNeuPage from './pages/einspruch/EinspruchNeuPage'
import ReferralPage from './pages/referral/ReferralPage'
import EinstellungenPage from './pages/einstellungen/EinstellungenPage'
import HilfePage from './pages/HilfePage'
import JahresberichtPage from './pages/JahresberichtPage'
import VergleichPage from './pages/VergleichPage'
import KalenderPage from './pages/KalenderPage'
import SteuerRechnerPage from './pages/SteuerRechnerPage'
import SuchePage from './pages/SuchePage'
import ProfilPage from './pages/ProfilPage'
import UpgradePage from './pages/UpgradePage'
import EinspruchVorlagenPage from './pages/einspruch/EinspruchVorlagenPage'
import FinanzamtVerzeichnisPage from './pages/FinanzamtVerzeichnisPage'
import ChecklistePage from './pages/ChecklistePage'
import MehrfachUploadPage from './pages/MehrfachUploadPage'
import BerichtExportPage from './pages/BerichtExportPage'
import ArchivPage from './pages/ArchivPage'
import SchnellerfassungPage from './pages/SchnellerfassungPage'
import StatistikPage from './pages/StatistikPage'
import DokumentenPage from './pages/DokumentenPage'
import BenachrichtigungenPage from './pages/BenachrichtigungenPage'
import OnboardingPage from './pages/OnboardingPage'
import AktivitaetsProtokollPage from './pages/AktivitaetsProtokollPage'
import SteuerTippsPage from './pages/SteuerTippsPage'
import KontaktPage from './pages/KontaktPage'
import DatenExportPage from './pages/DatenExportPage'
import ImmobilienPage from './pages/ImmobilienPage'
import MieterBereichPage from './pages/MieterBereichPage'
import NebenkostenabrechnungPage from './pages/NebenkostenabrechnungPage'
import DokumentScannerPage from './pages/DokumentScannerPage'
import SteuerKalenderPage from './pages/SteuerKalenderPage'
import VerwalterDashboardPage from './pages/VerwalterDashboardPage'
import GrundsteuerSimulatorPage from './pages/GrundsteuerSimulatorPage'
import WiderspruchTrackerPage from './pages/WiderspruchTrackerPage'
import ZahlungsUebersichtPage from './pages/ZahlungsUebersichtPage'
import BenchmarkPage from './pages/BenchmarkPage'
import SteuerBeraterPage from './pages/SteuerBeraterPage'
import AutomatisierungPage from './pages/AutomatisierungPage'
import WissensDatenbankPage from './pages/WissensDatenbankPage'
import MandantenVerwaltungPage from './pages/MandantenVerwaltungPage'
import SteuerlastPrognosePage from './pages/SteuerlastPrognosePage'
import BelegManagerPage from './pages/BelegManagerPage'
import AbschreibungsRechnerPage from './pages/AbschreibungsRechnerPage'
import SteuerNewsPage from './pages/SteuerNewsPage'
import VorauszahlungsPlanerPage from './pages/VorauszahlungsPlanerPage'
import SteuerSparRechnerPage from './pages/SteuerSparRechnerPage'
import BetriebspruefungPage from './pages/BetriebspruefungPage'
import DokumentVorlagenPage from './pages/DokumentVorlagenPage'
import PendelRechnerPage from './pages/PendelRechnerPage'
import SteuerIdentPage from './pages/SteuerIdentPage'
import ELSTERStatusPage from './pages/ELSTERStatusPage'
import FinanzPlanungPage from './pages/FinanzPlanungPage'
import ErbschaftSteuerRechnerPage from './pages/ErbschaftSteuerRechnerPage'
import SteuerTerminPage from './pages/SteuerTerminPage'
import KassenBuchPage from './pages/KassenBuchPage'
import UmsatzsteuerPage from './pages/UmsatzsteuerPage'
import GewerbesteuerRechnerPage from './pages/GewerbesteuerRechnerPage'
import SteuerHistoriePage from './pages/SteuerHistoriePage'
import HaushaltsnaheRechnerPage from './pages/HaushaltsnaheRechnerPage'
import SteuerFormularePage from './pages/SteuerFormularePage'
import DoppelteHaushaltsfuehrungPage from './pages/DoppelteHaushaltsfuehrungPage'
import SpendenRechnerPage from './pages/SpendenRechnerPage'
import RiesterRechnerPage from './pages/RiesterRechnerPage'
import VerlustverrechnungPage from './pages/VerlustverrechnungPage'
import NotFoundPage from './pages/NotFoundPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />

          {/* Protected app routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <BescheidProvider>
                  <Layout />
                </BescheidProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="bescheide" element={<BescheidePage />} />
            <Route path="bescheide/:id" element={<BescheidDetailPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="analyse" element={<AnalysePage />} />
            <Route path="analyse/:id" element={<AnalysePage />} />
            <Route path="fristen" element={<FristenPage />} />
            <Route path="einspruch" element={<EinspruchPage />} />
            <Route path="einspruch/neu/:bescheidId" element={<EinspruchNeuPage />} />
            <Route path="referral" element={<ReferralPage />} />
            <Route path="einstellungen" element={<EinstellungenPage />} />
            <Route path="hilfe" element={<HilfePage />} />
            <Route path="jahresbericht" element={<JahresberichtPage />} />
            <Route path="vergleich" element={<VergleichPage />} />
            <Route path="kalender" element={<KalenderPage />} />
            <Route path="steuerrechner" element={<SteuerRechnerPage />} />
            <Route path="suche" element={<SuchePage />} />
            <Route path="profil" element={<ProfilPage />} />
            <Route path="upgrade" element={<UpgradePage />} />
            <Route path="einspruch/vorlagen" element={<EinspruchVorlagenPage />} />
            <Route path="finanzaemter" element={<FinanzamtVerzeichnisPage />} />
            <Route path="checkliste" element={<ChecklistePage />} />
            <Route path="mehrfach-upload" element={<MehrfachUploadPage />} />
            <Route path="bericht" element={<BerichtExportPage />} />
            <Route path="archiv" element={<ArchivPage />} />
            <Route path="schnellerfassung" element={<SchnellerfassungPage />} />
            <Route path="statistiken" element={<StatistikPage />} />
            <Route path="dokumente" element={<DokumentenPage />} />
            <Route path="benachrichtigungen" element={<BenachrichtigungenPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="aktivitaeten" element={<AktivitaetsProtokollPage />} />
            <Route path="steuer-tipps" element={<SteuerTippsPage />} />
            <Route path="kontakt" element={<KontaktPage />} />
            <Route path="daten-export" element={<DatenExportPage />} />
            <Route path="immobilien" element={<ImmobilienPage />} />
            <Route path="mieterbereich" element={<MieterBereichPage />} />
            <Route path="nebenkosten" element={<NebenkostenabrechnungPage />} />
            <Route path="dokument-scanner" element={<DokumentScannerPage />} />
            <Route path="steuerkalender" element={<SteuerKalenderPage />} />
            <Route path="verwalter" element={<VerwalterDashboardPage />} />
            <Route path="grundsteuer-simulator" element={<GrundsteuerSimulatorPage />} />
            <Route path="widerspruch-tracker" element={<WiderspruchTrackerPage />} />
            <Route path="zahlungen" element={<ZahlungsUebersichtPage />} />
            <Route path="benchmark" element={<BenchmarkPage />} />
            <Route path="steuerberater" element={<SteuerBeraterPage />} />
            <Route path="automatisierung" element={<AutomatisierungPage />} />
            <Route path="wissensdatenbank" element={<WissensDatenbankPage />} />
            <Route path="mandanten" element={<MandantenVerwaltungPage />} />
            <Route path="steuerlast-prognose" element={<SteuerlastPrognosePage />} />
            <Route path="belege" element={<BelegManagerPage />} />
            <Route path="afa-rechner" element={<AbschreibungsRechnerPage />} />
            <Route path="steuer-news" element={<SteuerNewsPage />} />
            <Route path="vorauszahlungen" element={<VorauszahlungsPlanerPage />} />
            <Route path="steuerspar-rechner" element={<SteuerSparRechnerPage />} />
            <Route path="betriebspruefung" element={<BetriebspruefungPage />} />
            <Route path="dokument-vorlagen" element={<DokumentVorlagenPage />} />
            <Route path="pendler-rechner" element={<PendelRechnerPage />} />
            <Route path="steuer-ident" element={<SteuerIdentPage />} />
            <Route path="elster-status" element={<ELSTERStatusPage />} />
            <Route path="finanzplanung" element={<FinanzPlanungPage />} />
            <Route path="erbschaftsteuer" element={<ErbschaftSteuerRechnerPage />} />
            <Route path="steuer-termine" element={<SteuerTerminPage />} />
            <Route path="kassenbuch" element={<KassenBuchPage />} />
            <Route path="umsatzsteuer" element={<UmsatzsteuerPage />} />
            <Route path="gewerbesteuer" element={<GewerbesteuerRechnerPage />} />
            <Route path="steuer-historie" element={<SteuerHistoriePage />} />
            <Route path="haushaltsnahe" element={<HaushaltsnaheRechnerPage />} />
            <Route path="steuer-formulare" element={<SteuerFormularePage />} />
            <Route path="doppelte-haushaltsfuehrung" element={<DoppelteHaushaltsfuehrungPage />} />
            <Route path="spenden-rechner" element={<SpendenRechnerPage />} />
            <Route path="riester-rechner" element={<RiesterRechnerPage />} />
            <Route path="verlustverrechnung" element={<VerlustverrechnungPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
