// ============================================================
// COPY-PASTE SNIPPETS für Admin Hub Integration
// ============================================================

// ============================================================
// 1. App.tsx - Komplett ersetzen mit:
// ============================================================

/*
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Existing pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Bundles from "./pages/Bundles";
import Analytics from "./pages/Analytics";
import Errors from "./pages/Errors";
import AICenter from "./pages/AICenter";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// NEW: Domain Management pages
import Domains from "./pages/Domains";
import DomainDetail from "./pages/DomainDetail";
import LinkChecker from "./pages/LinkChecker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/ai-center" element={<AICenter />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />

            {/* NEW: Domain Management */}
            <Route path="/domains" element={<Domains />} />
            <Route path="/domains/:id" element={<DomainDetail />} />
            <Route path="/link-checker" element={<LinkChecker />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
*/

// ============================================================
// 2. Sidebar.tsx navItems - Ersetzen mit:
// ============================================================

/*
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  TrendingUp,
  AlertTriangle,
  Brain,
  MessageSquare,
  Settings,
  Globe,        // NEW
  Link2,        // NEW
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/products", label: "Produkte & Preise", icon: Package },
  { path: "/bundles", label: "Bundles & Angebote", icon: Boxes },
  { path: "/users", label: "Nutzer & Abos", icon: Users },
  { path: "/analytics", label: "Analytics & Usage", icon: TrendingUp },
  { path: "/errors", label: "Fehler & Logs", icon: AlertTriangle },
  { path: "/ai-center", label: "KI-Center", icon: Brain },
  { path: "/support", label: "Support & FAQ", icon: MessageSquare },

  // NEW: Domain Management
  { path: "/domains", label: "Domain-Verwaltung", icon: Globe },
  { path: "/link-checker", label: "Link Checker", icon: Link2 },

  { path: "/settings", label: "Einstellungen", icon: Settings },
];
*/

export {};
