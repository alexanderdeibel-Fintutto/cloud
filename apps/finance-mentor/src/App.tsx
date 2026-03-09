import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// App Pages
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import LearningPaths from "./pages/LearningPaths";
import CourseDetail from "./pages/CourseDetail";
import Certificates from "./pages/Certificates";
import Glossary from "./pages/Glossary";
import Calculators from "./pages/Calculators";
import Checklist from "./pages/Checklist";
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
        <Route path="/lernpfade" element={
          <ProtectedRoute><LearningPaths /></ProtectedRoute>
        } />
        <Route path="/kurse" element={
          <ProtectedRoute><Courses /></ProtectedRoute>
        } />
        <Route path="/kurse/:courseId" element={
          <ProtectedRoute><CourseDetail /></ProtectedRoute>
        } />
        <Route path="/zertifikate" element={
          <ProtectedRoute><Certificates /></ProtectedRoute>
        } />
        <Route path="/glossar" element={
          <ProtectedRoute><Glossary /></ProtectedRoute>
        } />
        <Route path="/rechner" element={
          <ProtectedRoute><Calculators /></ProtectedRoute>
        } />
        <Route path="/checkliste" element={
          <ProtectedRoute><Checklist /></ProtectedRoute>
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
