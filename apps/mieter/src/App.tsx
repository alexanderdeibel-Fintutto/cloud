import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages - loaded eagerly as they're entry points
import Login from "./pages/Login";
import Register from "./pages/Register";

// Lazy-loaded Protected Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Finanzen = lazy(() => import("./pages/Finanzen"));
const Chat = lazy(() => import("./pages/Chat"));
const Mehr = lazy(() => import("./pages/Mehr"));
const MangelMelden = lazy(() => import("./pages/MangelMelden"));
const ZaehlerAblesen = lazy(() => import("./pages/ZaehlerAblesen"));
const DokumentAnfragen = lazy(() => import("./pages/DokumentAnfragen"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Success = lazy(() => import("./pages/Success"));
const Hausordnung = lazy(() => import("./pages/Hausordnung"));
const Wohnung = lazy(() => import("./pages/Wohnung"));
const Dokumente = lazy(() => import("./pages/Dokumente"));
const Notfallkontakte = lazy(() => import("./pages/Notfallkontakte"));
const Einstellungen = lazy(() => import("./pages/Einstellungen"));
const MeineMeldungen = lazy(() => import("./pages/MeineMeldungen"));
const FintuttoApps = lazy(() => import("./pages/FintuttoApps"));
const CheckerHub = lazy(() => import("./pages/CheckerHub"));
const FormulareHub = lazy(() => import("./pages/FormulareHub"));
const RechnerHub = lazy(() => import("./pages/RechnerHub"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <main className="min-h-screen">
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/registrieren" element={<Register />} />

              {/* Public Routes */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/success" element={<Success />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/finanzen" element={<Finanzen />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/mehr" element={<Mehr />} />
                <Route path="/mangel-melden" element={<MangelMelden />} />
                <Route path="/zaehler-ablesen" element={<ZaehlerAblesen />} />
                <Route path="/dokument-anfragen" element={<DokumentAnfragen />} />
                <Route path="/hausordnung" element={<Hausordnung />} />
                <Route path="/wohnung" element={<Wohnung />} />
                <Route path="/dokumente" element={<Dokumente />} />
                <Route path="/notfallkontakte" element={<Notfallkontakte />} />
                <Route path="/einstellungen" element={<Einstellungen />} />
                <Route path="/meine-meldungen" element={<MeineMeldungen />} />
                <Route path="/fintutto-apps" element={<FintuttoApps />} />
                <Route path="/checker" element={<CheckerHub />} />
                <Route path="/formulare" element={<FormulareHub />} />
                <Route path="/rechner" element={<RechnerHub />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
