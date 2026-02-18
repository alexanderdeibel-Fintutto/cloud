import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { WorkoutProvider } from '@/contexts/WorkoutContext'
import Layout from '@/components/layout/Layout'

// Pages
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import OnboardingPage from '@/pages/OnboardingPage'
import ExercisesPage from '@/pages/ExercisesPage'
import TrainingPage from '@/pages/TrainingPage'
import NewPlanPage from '@/pages/NewPlanPage'
import WorkoutPage from '@/pages/WorkoutPage'
import NutritionPage from '@/pages/NutritionPage'
import ProgressPage from '@/pages/ProgressPage'
import PricingPage from '@/pages/PricingPage'
import AuthPage from '@/pages/AuthPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkoutProvider>
          <Routes>
            {/* Public pages (no layout) */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/workout" element={<WorkoutPage />} />

            {/* Pages with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="exercises" element={<ExercisesPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="training/new" element={<NewPlanPage />} />
              <Route path="nutrition" element={<NutritionPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="preise" element={<PricingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<ProfilePage />} />

              {/* Checkout */}
              <Route path="checkout/success" element={<DashboardPage />} />
              <Route path="checkout/cancel" element={<PricingPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </WorkoutProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
