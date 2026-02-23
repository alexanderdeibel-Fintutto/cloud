import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'
import InfoPage from '@/pages/InfoPage'
import LiveLandingPage from '@/pages/LiveLandingPage'
import LiveSessionPage from '@/pages/LiveSessionPage'

if (import.meta.env.DEV) {
  console.log('[Translator] Cloud TTS API Key:', import.meta.env.VITE_GOOGLE_TTS_API_KEY ? '✓ gesetzt' : '✗ fehlt')
}

function App() {
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
