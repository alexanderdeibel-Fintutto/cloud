import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CheckerProvider } from '@/contexts/CheckerContext'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
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
import ResultPage from '@/pages/ResultPage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <CheckerProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

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
        </Layout>
        <Toaster position="top-right" richColors />
      </CheckerProvider>
    </AuthProvider>
  )
}

export default App
