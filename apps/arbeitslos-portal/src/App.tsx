import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { CreditsProvider } from '@/contexts/CreditsContext'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import ChatPage from '@/pages/ChatPage'
import MusterschreibenPage from '@/pages/MusterschreibenPage'
import GeneratorPage from '@/pages/GeneratorPage'
import ForumPage from '@/pages/ForumPage'
import PricingPage from '@/pages/PricingPage'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <CreditsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />

              {/* KI-Rechtsberater */}
              <Route path="chat" element={<ChatPage />} />

              {/* Musterschreiben */}
              <Route path="musterschreiben" element={<MusterschreibenPage />} />
              <Route path="generator/:templateId" element={<GeneratorPage />} />

              {/* Forum */}
              <Route path="forum" element={<ForumPage />} />

              {/* Pricing */}
              <Route path="preise" element={<PricingPage />} />
              <Route path="pricing" element={<PricingPage />} />

              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Auth */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Legal (placeholder) */}
              <Route path="impressum" element={<div className="container py-16"><h1 className="text-2xl font-bold">Impressum</h1><p className="text-muted-foreground mt-4">Wird ergaenzt.</p></div>} />
              <Route path="datenschutz" element={<div className="container py-16"><h1 className="text-2xl font-bold">Datenschutz</h1><p className="text-muted-foreground mt-4">Wird ergaenzt.</p></div>} />
              <Route path="agb" element={<div className="container py-16"><h1 className="text-2xl font-bold">AGB</h1><p className="text-muted-foreground mt-4">Wird ergaenzt.</p></div>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </CreditsProvider>
    </AuthProvider>
  )
}

export default App
