import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/activityLogger'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'
import InfoPage from '@/pages/InfoPage'
import LiveLandingPage from '@/pages/LiveLandingPage'
import LiveSessionPage from '@/pages/LiveSessionPage'

if (import.meta.env.DEV) {
  console.log('[Translator] Cloud TTS API Key:', import.meta.env.VITE_GOOGLE_TTS_API_KEY ? '✓ gesetzt' : '✗ fehlt')
}

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
          <Route index element={<TranslatorPage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="live" element={<LiveLandingPage />} />
          <Route path="live/:code" element={<LiveSessionPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
