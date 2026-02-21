import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary, PageSkeleton } from '@fintutto/shared'
import { AuthProvider } from '@/contexts/AuthContext'
import { CheckerProvider } from '@/contexts/CheckerContext'
import { FitnessProvider } from '@/contexts/FitnessContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ExitIntentPopup } from '@/components/monetization'
import Layout from '@/components/layout/Layout'

// Eager: HomePage loads instantly (landing page)
import HomePage from '@/pages/HomePage'

// Lazy: everything else loads on demand
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const FitTuttoPricingPage = lazy(() => import('@/pages/FitTuttoPricingPage'))
const FitTuttoDashboardPage = lazy(() => import('@/pages/FitTuttoDashboardPage'))
const FitTuttoProfilePage = lazy(() => import('@/pages/FitTuttoProfilePage'))
const FitTuttoExercisesPage = lazy(() => import('@/pages/FitTuttoExercisesPage'))
const FitTuttoWorkoutPage = lazy(() => import('@/pages/FitTuttoWorkoutPage'))
const FitTuttoPlanPage = lazy(() => import('@/pages/FitTuttoPlanPage'))
const FitTuttoCoachPage = lazy(() => import('@/pages/FitTuttoCoachPage'))
const FitTuttoNutritionPage = lazy(() => import('@/pages/FitTuttoNutritionPage'))
const FitTuttoBodyTrackingPage = lazy(() => import('@/pages/FitTuttoBodyTrackingPage'))
const FitTuttoHistoryPage = lazy(() => import('@/pages/FitTuttoHistoryPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const CheckoutSuccessPage = lazy(() => import('@/pages/CheckoutSuccessPage'))
const CheckoutCancelPage = lazy(() => import('@/pages/CheckoutCancelPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ResultPage = lazy(() => import('@/pages/ResultPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const AgbPage = lazy(() => import('@/pages/AgbPage'))
const UeberUnsPage = lazy(() => import('@/pages/UeberUnsPage'))

// Hub / Listing Pages
const RechnerPage = lazy(() => import('@/pages/RechnerPage'))
const CheckerPage = lazy(() => import('@/pages/CheckerPage'))
const FormularePage = lazy(() => import('@/pages/FormularePage'))
const AppsPage = lazy(() => import('@/pages/AppsPage'))
const ReferralPage = lazy(() => import('@/pages/ReferralPage'))

// Rechner (7 Vermieter-Tools)
const KautionsRechner = lazy(() => import('@/pages/rechner/KautionsRechner'))
const MieterhoehungsRechner = lazy(() => import('@/pages/rechner/MieterhoehungsRechner'))
const KaufnebenkostenRechner = lazy(() => import('@/pages/rechner/KaufnebenkostenRechner'))
const EigenkapitalRechner = lazy(() => import('@/pages/rechner/EigenkapitalRechner'))
const GrundsteuerRechner = lazy(() => import('@/pages/rechner/GrundsteuerRechner'))
const RenditeRechner = lazy(() => import('@/pages/rechner/RenditeRechner'))
const NebenkostenRechner = lazy(() => import('@/pages/rechner/NebenkostenRechner'))

// Checker (10 Mieter-Tools)
const MietpreisbremseChecker = lazy(() => import('@/pages/checkers/MietpreisbremseChecker'))
const MieterhoehungChecker = lazy(() => import('@/pages/checkers/MieterhoehungChecker'))
const NebenkostenChecker = lazy(() => import('@/pages/checkers/NebenkostenChecker'))
const BetriebskostenChecker = lazy(() => import('@/pages/checkers/BetriebskostenChecker'))
const KuendigungChecker = lazy(() => import('@/pages/checkers/KuendigungChecker'))
const KautionChecker = lazy(() => import('@/pages/checkers/KautionChecker'))
const MietminderungChecker = lazy(() => import('@/pages/checkers/MietminderungChecker'))
const EigenbedarfChecker = lazy(() => import('@/pages/checkers/EigenbedarfChecker'))
const ModernisierungChecker = lazy(() => import('@/pages/checkers/ModernisierungChecker'))
const SchoenheitsreparaturenChecker = lazy(() => import('@/pages/checkers/SchoenheitsreparaturenChecker'))

// Formulare (10 Vorlagen)
const MietvertragFormular = lazy(() => import('@/pages/formulare/MietvertragFormular'))
const UebergabeprotokollFormular = lazy(() => import('@/pages/formulare/UebergabeprotokollFormular'))
const MieterhoehungFormular = lazy(() => import('@/pages/formulare/MieterhoehungFormular'))
const SelbstauskunftFormular = lazy(() => import('@/pages/formulare/SelbstauskunftFormular'))
const BetriebskostenFormular = lazy(() => import('@/pages/formulare/BetriebskostenFormular'))
const KuendigungFormular = lazy(() => import('@/pages/formulare/KuendigungFormular'))
const MahnungFormular = lazy(() => import('@/pages/formulare/MahnungFormular'))
const MietbescheinigungFormular = lazy(() => import('@/pages/formulare/MietbescheinigungFormular'))
const WohnungsgeberbestaetigungFormular = lazy(() => import('@/pages/formulare/WohnungsgeberbestaetigungFormular'))
const NebenkostenvorauszahlungFormular = lazy(() => import('@/pages/formulare/NebenkostenvorauszahlungFormular'))

function PageLoader() {
  return <PageSkeleton />
}

function App() {
  useDocumentTitle()

  return (
    <ErrorBoundary>
    <AuthProvider>
      <FitnessProvider>
      <CheckerProvider>
        <ScrollToTop />
        <Layout>
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/preise" element={<PricingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* FitTutto Fitness */}
              <Route path="/fittutto" element={<FitTuttoDashboardPage />} />
              <Route path="/fittutto/dashboard" element={<FitTuttoDashboardPage />} />
              <Route path="/fittutto/profil" element={<FitTuttoProfilePage />} />
              <Route path="/fittutto/uebungen" element={<FitTuttoExercisesPage />} />
              <Route path="/fittutto/workout" element={<FitTuttoWorkoutPage />} />
              <Route path="/fittutto/plan" element={<FitTuttoPlanPage />} />
              <Route path="/fittutto/coach" element={<FitTuttoCoachPage />} />
              <Route path="/fittutto/ernaehrung" element={<FitTuttoNutritionPage />} />
              <Route path="/fittutto/koerper" element={<FitTuttoBodyTrackingPage />} />
              <Route path="/fittutto/historie" element={<FitTuttoHistoryPage />} />
              <Route path="/fittutto/preise" element={<FitTuttoPricingPage />} />

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

              {/* Legal Pages */}
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="/datenschutz" element={<DatenschutzPage />} />
              <Route path="/agb" element={<AgbPage />} />
              <Route path="/ueber-uns" element={<UeberUnsPage />} />

              {/* Result Page */}
              <Route path="/ergebnis/:checkerId/:resultId" element={<ResultPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Layout>
        <Toaster position="top-right" richColors />
        <ExitIntentPopup />
      </CheckerProvider>
      </FitnessProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
