import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load pages for code splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BuildingNew = lazy(() => import("./pages/BuildingNew"));
const BuildingDetail = lazy(() => import("./pages/BuildingDetail"));
const Units = lazy(() => import("./pages/Units"));
const UnitDetail = lazy(() => import("./pages/UnitDetail"));
const MeterDetail = lazy(() => import("./pages/MeterDetail"));
const ReadMeter = lazy(() => import("./pages/ReadMeter"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Success = lazy(() => import("./pages/Success"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Referrals = lazy(() => import("./pages/Referrals"));

// NEW: Feature pages
const ConsumptionAnalysis = lazy(() => import("./pages/ConsumptionAnalysis"));
const Contracts = lazy(() => import("./pages/Contracts"));
const ProviderComparison = lazy(() => import("./pages/ProviderComparison"));
const SavingsPotential = lazy(() => import("./pages/SavingsPotential"));
const SolarDashboard = lazy(() => import("./pages/SolarDashboard"));
const WeatherCorrelation = lazy(() => import("./pages/WeatherCorrelation"));
const BKIntegration = lazy(() => import("./pages/BKIntegration"));

// Phase B: Core feature pages
const TariffManager = lazy(() => import("./pages/TariffManager"));
const HeatPumpDashboard = lazy(() => import("./pages/HeatPumpDashboard"));
const SmartAlerts = lazy(() => import("./pages/SmartAlerts"));
const MeterSchedule = lazy(() => import("./pages/MeterSchedule"));
const CostCalculation = lazy(() => import("./pages/CostCalculation"));
const BatchScanner = lazy(() => import("./pages/BatchScanner"));

// Phase C: Analysis & AI pages
const ConsumptionHeatmap = lazy(() => import("./pages/ConsumptionHeatmap"));
const SavingsSimulator = lazy(() => import("./pages/SavingsSimulator"));
const EnergyChat = lazy(() => import("./pages/EnergyChat"));
const EnergyFlow = lazy(() => import("./pages/EnergyFlow"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Public auth routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Protected routes - Core */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/buildings/new" element={<ProtectedRoute><BuildingNew /></ProtectedRoute>} />
        <Route path="/buildings/:id" element={<ProtectedRoute><BuildingDetail /></ProtectedRoute>} />
        <Route path="/units" element={<ProtectedRoute><Units /></ProtectedRoute>} />
        <Route path="/units/new" element={<ProtectedRoute><BuildingNew /></ProtectedRoute>} />
        <Route path="/units/:id" element={<ProtectedRoute><UnitDetail /></ProtectedRoute>} />
        <Route path="/meters/:id" element={<ProtectedRoute><MeterDetail /></ProtectedRoute>} />
        <Route path="/read" element={<ProtectedRoute><ReadMeter /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

        {/* Protected routes - NEW Feature Pages */}
        <Route path="/analysis" element={<ProtectedRoute><ConsumptionAnalysis /></ProtectedRoute>} />
        <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
        <Route path="/comparison" element={<ProtectedRoute><ProviderComparison /></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><SavingsPotential /></ProtectedRoute>} />
        <Route path="/solar" element={<ProtectedRoute><SolarDashboard /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><WeatherCorrelation /></ProtectedRoute>} />
        <Route path="/bk-integration" element={<ProtectedRoute><BKIntegration /></ProtectedRoute>} />

        {/* Protected routes - Phase B Feature Pages */}
        <Route path="/tariffs" element={<ProtectedRoute><TariffManager /></ProtectedRoute>} />
        <Route path="/heat-pump" element={<ProtectedRoute><HeatPumpDashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><SmartAlerts /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><MeterSchedule /></ProtectedRoute>} />
        <Route path="/costs" element={<ProtectedRoute><CostCalculation /></ProtectedRoute>} />
        <Route path="/batch-scan" element={<ProtectedRoute><BatchScanner /></ProtectedRoute>} />

        {/* Protected routes - Phase C Analysis & AI */}
        <Route path="/heatmap" element={<ProtectedRoute><ConsumptionHeatmap /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute><SavingsSimulator /></ProtectedRoute>} />
        <Route path="/energy-chat" element={<ProtectedRoute><EnergyChat /></ProtectedRoute>} />
        <Route path="/energy-flow" element={<ProtectedRoute><EnergyFlow /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <main className="min-h-screen">
          <AppRoutes />
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
