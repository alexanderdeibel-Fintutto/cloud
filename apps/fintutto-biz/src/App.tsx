import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// App Pages
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Expenses from "./pages/Expenses";
import Clients from "./pages/Clients";
import TaxOverview from "./pages/TaxOverview";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import ImpressumPage from "./pages/ImpressumPage";
import DatenschutzPage from "./pages/DatenschutzPage";
import AgbPage from "./pages/AgbPage";

// Components
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/preise" element={<Pricing />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/agb" element={<AgbPage />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/rechnungen" element={
          <ProtectedRoute><Invoices /></ProtectedRoute>
        } />
        <Route path="/ausgaben" element={
          <ProtectedRoute><Expenses /></ProtectedRoute>
        } />
        <Route path="/kunden" element={
          <ProtectedRoute><Clients /></ProtectedRoute>
        } />
        <Route path="/steuern" element={
          <ProtectedRoute><TaxOverview /></ProtectedRoute>
        } />
        <Route path="/einstellungen" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
