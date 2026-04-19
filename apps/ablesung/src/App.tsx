import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/activityLogger'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import OcrScanPage from '@/pages/OcrScanPage'
import RechnungenPage from '@/pages/RechnungenPage'
import EinstellungenPage from '@/pages/EinstellungenPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import MeterDetailPage from '@/pages/MeterDetailPage'
import MeterListPage from '@/pages/MeterListPage'

function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') logActivity('login')
      if (event === 'SIGNED_OUT') logActivity('logout')
      if (event === 'USER_UPDATED') logActivity('signup')
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ocr" element={<OcrScanPage />} />
          <Route path="rechnungen" element={<RechnungenPage />} />
          <Route path="einstellungen" element={<EinstellungenPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="zaehler" element={<MeterListPage />} />
          <Route path="zaehler/:id" element={<MeterDetailPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
