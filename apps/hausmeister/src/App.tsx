import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useReferralCapture } from "@/hooks/useReferralCapture";

// Pages
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import TasksPage from "@/pages/TasksPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import BuildingsPage from "@/pages/BuildingsPage";
import BuildingDetailPage from "@/pages/BuildingDetailPage";
import CalendarPage from "@/pages/CalendarPage";
import MessagesPage from "@/pages/MessagesPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import AppsPage from "@/pages/AppsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import DocumentDetailPage from "@/pages/DocumentDetailPage";
import PricingPage from "@/pages/PricingPage";
import SuccessPage from "@/pages/SuccessPage";
import DashboardPage from "@/pages/DashboardPage";
import ReferralPage from "@/pages/ReferralPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ReferralCaptureWrapper({ children }: { children: React.ReactNode }) {
  useReferralCapture();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ReferralCaptureWrapper>
              <Routes>
                {/* Auth Routes (public) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registrieren" element={<SignupPage />} />
                <Route path="/passwort-vergessen" element={<ForgotPasswordPage />} />
                
                {/* Public Routes */}
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/success" element={<SuccessPage />} />
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Protected App Routes with Layout */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/aufgaben" element={<TasksPage />} />
                  <Route path="/aufgaben/:id" element={<TaskDetailPage />} />
                  <Route path="/objekte" element={<BuildingsPage />} />
                  <Route path="/objekte/:id" element={<BuildingDetailPage />} />
                  <Route path="/kalender" element={<CalendarPage />} />
                  <Route path="/nachrichten" element={<MessagesPage />} />
                  <Route path="/nachrichten/:id" element={<ChatPage />} />
                  <Route path="/profil" element={<ProfilePage />} />
                  <Route path="/belege" element={<DocumentsPage />} />
                  <Route path="/belege/:id" element={<DocumentDetailPage />} />
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/empfehlungen" element={<ReferralPage />} />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ReferralCaptureWrapper>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
