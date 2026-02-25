import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import OcrScanPage from '@/pages/OcrScanPage'
import RechnungenPage from '@/pages/RechnungenPage'
import EinstellungenPage from '@/pages/EinstellungenPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AppsPage from '@/pages/AppsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ocr" element={<OcrScanPage />} />
          <Route path="rechnungen" element={<RechnungenPage />} />
          <Route path="einstellungen" element={<EinstellungenPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="apps" element={<AppsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
