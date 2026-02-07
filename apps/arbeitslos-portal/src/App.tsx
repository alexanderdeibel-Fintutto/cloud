import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CreditsProvider } from '@/contexts/CreditsContext'
import Layout from '@/components/layout/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import ScrollToTop from '@/components/ScrollToTop'

// Eagerly load the home page for fast first paint
import HomePage from '@/pages/HomePage'

// Lazy load everything else
const BescheidScanPage = lazy(() => import('@/pages/BescheidScanPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const MusterschreibenPage = lazy(() => import('@/pages/MusterschreibenPage'))
const GeneratorPage = lazy(() => import('@/pages/GeneratorPage'))
const ForumPage = lazy(() => import('@/pages/ForumPage'))
const ForumNewPostPage = lazy(() => import('@/pages/forum/ForumNewPostPage'))
const ForumTopicPage = lazy(() => import('@/pages/forum/ForumTopicPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const ProblemePage = lazy(() => import('@/pages/ProblemePage'))
const RechnerPage = lazy(() => import('@/pages/RechnerPage'))
const BuergergeldRechner = lazy(() => import('@/pages/rechner/BuergergeldRechner'))
const KduRechner = lazy(() => import('@/pages/rechner/KduRechner'))
const MehrbedarfRechner = lazy(() => import('@/pages/rechner/MehrbedarfRechner'))
const FreibetragsRechner = lazy(() => import('@/pages/rechner/FreibetragsRechner'))
const SanktionsRechner = lazy(() => import('@/pages/rechner/SanktionsRechner'))
const SchonvermoegensRechner = lazy(() => import('@/pages/rechner/SchonvermoegensRechner'))
const FristenRechner = lazy(() => import('@/pages/rechner/FristenRechner'))
const WiderspruchTracker = lazy(() => import('@/pages/WiderspruchTracker'))
const PkhRechner = lazy(() => import('@/pages/rechner/PkhRechner'))
const ErstausstattungsRechner = lazy(() => import('@/pages/rechner/ErstausstattungsRechner'))
const UmzugskostenRechner = lazy(() => import('@/pages/rechner/UmzugskostenRechner'))
const ProfilPage = lazy(() => import('@/pages/ProfilPage'))
const SuchePage = lazy(() => import('@/pages/SuchePage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const AgbPage = lazy(() => import('@/pages/AgbPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Wird geladen...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <CreditsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Onboarding (no layout) */}
              <Route path="onboarding" element={<OnboardingPage />} />

              {/* Main app with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />

                {/* BescheidScan */}
                <Route path="scan" element={<BescheidScanPage />} />

                {/* KI-Rechtsberater */}
                <Route path="chat" element={<ChatPage />} />

                {/* Dokumenten-Werkstatt */}
                <Route path="musterschreiben" element={<MusterschreibenPage />} />
                <Route path="generator/:templateId" element={<GeneratorPage />} />

                {/* Community Forum */}
                <Route path="forum" element={<ForumPage />} />
                <Route path="forum/neu" element={<ForumNewPostPage />} />
                <Route path="forum/:topicId" element={<ForumTopicPage />} />

                {/* Pricing */}
                <Route path="preise" element={<PricingPage />} />
                <Route path="pricing" element={<PricingPage />} />

                {/* AmtsRechner Suite */}
                <Route path="rechner" element={<RechnerPage />} />
                <Route path="rechner/buergergeld" element={<BuergergeldRechner />} />
                <Route path="rechner/kdu" element={<KduRechner />} />
                <Route path="rechner/mehrbedarf" element={<MehrbedarfRechner />} />
                <Route path="rechner/freibetrag" element={<FreibetragsRechner />} />
                <Route path="rechner/sanktion" element={<SanktionsRechner />} />
                <Route path="rechner/schonvermoegen" element={<SchonvermoegensRechner />} />
                <Route path="rechner/fristen" element={<FristenRechner />} />
                <Route path="rechner/pkh" element={<PkhRechner />} />
                <Route path="rechner/erstausstattung" element={<ErstausstattungsRechner />} />
                <Route path="rechner/umzugskosten" element={<UmzugskostenRechner />} />

                {/* Widerspruch-Tracker */}
                <Route path="tracker" element={<WiderspruchTracker />} />

                {/* Probleme-Guide */}
                <Route path="probleme" element={<ProblemePage />} />

                {/* Dashboard, Profile & Search */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profil" element={<ProfilPage />} />
                <Route path="suche" element={<SuchePage />} />
                <Route path="faq" element={<FaqPage />} />

                {/* Auth */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Legal Pages */}
                <Route path="impressum" element={<ImpressumPage />} />
                <Route path="datenschutz" element={<DatenschutzPage />} />
                <Route path="agb" element={<AgbPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </CreditsProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
