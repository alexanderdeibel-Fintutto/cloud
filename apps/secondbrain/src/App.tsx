import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/layout/Layout'

// Eagerly loaded
import DashboardPage from '@/pages/DashboardPage'

// Lazy-loaded pages
const InboxPage = lazy(() => import('@/pages/InboxPage'))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const ChatPage = lazy(() => import('@/pages/ChatPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const DeadlinesPage = lazy(() => import('@/pages/DeadlinesPage'))
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const DocumentDetailPage = lazy(() => import('@/pages/DocumentDetailPage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="eingang" element={<InboxPage />} />
              <Route path="dokumente" element={<DocumentsPage />} />
              <Route path="dokumente/:id" element={<DocumentDetailPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="suche" element={<SearchPage />} />
              <Route path="firmen" element={<CompaniesPage />} />
              <Route path="fristen" element={<DeadlinesPage />} />
              <Route path="sammlungen" element={<CollectionsPage />} />
              <Route path="favoriten" element={<FavoritesPage />} />
              <Route path="verlauf" element={<HistoryPage />} />
              <Route path="statistiken" element={<AnalyticsPage />} />
              <Route path="zeitstrahl" element={<TimelinePage />} />
              <Route path="einstellungen" element={<SettingsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="registrieren" element={<RegisterPage />} />
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
