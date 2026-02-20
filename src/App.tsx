import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@fintutto/shared'
import { AuthProvider } from '@/contexts/AuthContext'
import { CheckerProvider } from '@/contexts/CheckerContext'
import Layout from '@/components/layout/Layout'

// Eagerly loaded
import HomePage from '@/pages/HomePage'

// Lazy-loaded pages
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
const ResultPage = lazy(() => import('@/pages/ResultPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const CheckoutSuccessPage = lazy(() => import('@/pages/CheckoutSuccessPage'))
const CheckoutCancelPage = lazy(() => import('@/pages/CheckoutCancelPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintutto-primary" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <CheckerProvider>
        <Layout>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/preise" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

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

            {/* Result Page */}
            <Route path="/ergebnis/:checkerId/:resultId" element={<ResultPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </Layout>
        <Toaster position="top-right" richColors />
      </CheckerProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
