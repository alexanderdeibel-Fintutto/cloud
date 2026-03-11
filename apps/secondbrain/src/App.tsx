import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'

// Eagerly loaded
import DashboardPage from '@/pages/DashboardPage'

// Lazy-loaded pages
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const AgbPage = lazy(() => import('@/pages/AgbPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes without Layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registrieren" element={<RegisterPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="/agb" element={<AgbPage />} />

            {/* App routes with Layout */}
            <Route element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dokumente" element={<DocumentsPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="suche" element={<SearchPage />} />
              <Route path="sammlungen" element={<CollectionsPage />} />
              <Route path="favoriten" element={<FavoritesPage />} />
              <Route path="verlauf" element={<HistoryPage />} />
              <Route path="einstellungen" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
