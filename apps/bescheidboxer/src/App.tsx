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
