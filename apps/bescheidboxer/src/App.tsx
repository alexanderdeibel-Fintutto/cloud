import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import BescheidePage from './pages/bescheide/BescheidePage'
import BescheidDetailPage from './pages/bescheide/BescheidDetailPage'
import UploadPage from './pages/UploadPage'
import AnalysePage from './pages/analyse/AnalysePage'
import FristenPage from './pages/fristen/FristenPage'
import EinspruchPage from './pages/einspruch/EinspruchPage'
import EinspruchNeuPage from './pages/einspruch/EinspruchNeuPage'
import ReferralPage from './pages/referral/ReferralPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
