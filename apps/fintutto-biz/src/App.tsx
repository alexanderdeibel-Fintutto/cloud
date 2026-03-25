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
import Zeiterfassung from "./pages/Zeiterfassung";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";

// Components
import { ProtectedRoute } from "@/components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/preise" element={<Pricing />} />

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
        <Route path="/zeiterfassung" element={
          <ProtectedRoute><Zeiterfassung /></ProtectedRoute>
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
