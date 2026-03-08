import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// App Pages
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import SavingsGoals from "./pages/SavingsGoals";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";

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
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute><Budget /></ProtectedRoute>
        } />
        <Route path="/sparziele" element={
          <ProtectedRoute><SavingsGoals /></ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute><Insights /></ProtectedRoute>
        } />
        <Route path="/einstellungen" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
