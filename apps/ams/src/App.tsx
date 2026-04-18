import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommandPalette } from "./components/ui/command-palette";
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
import UrlCheck from "./pages/UrlCheck";
import Partners from "./pages/Partners";
import Leads from "./pages/Leads";
import AppRegistry from "./pages/AppRegistry";
import Organizations from "./pages/Organizations";
import Subscriptions from "./pages/Subscriptions";
import AIConfig from "./pages/AIConfig";
import Services from "./pages/Services";
import Tools from "./pages/Tools";
import Documents from "./pages/Documents";
import Properties from "./pages/Properties";
import Notifications from "./pages/Notifications";
import RolesSecurity from "./pages/RolesSecurity";
import Finance from "./pages/Finance";
import Community from "./pages/Community";
import DevOps from "./pages/DevOps";
import ApiStatus from "./pages/ApiStatus";
import NotFound from "./pages/NotFound";
import AmsBillingPage from "./pages/AmsBillingPage";
import UarDashboard from "./pages/UarDashboard";
import GmailSync from "./pages/GmailSync";
import OnboardingGate from "./components/OnboardingGate";

const queryClient = new QueryClient();

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><OnboardingGate>{children}</OnboardingGate></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <CommandPalette />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<P><Dashboard /></P>} />
              <Route path="/users" element={<P><Users /></P>} />
              <Route path="/products" element={<P><Products /></P>} />
              <Route path="/bundles" element={<P><Bundles /></P>} />
              <Route path="/analytics" element={<P><Analytics /></P>} />
              <Route path="/errors" element={<P><Errors /></P>} />
              <Route path="/ai-center" element={<P><AICenter /></P>} />
              <Route path="/support" element={<P><Support /></P>} />
              <Route path="/settings" element={<P><Settings /></P>} />
              <Route path="/url-check" element={<P><UrlCheck /></P>} />
              <Route path="/partners" element={<P><Partners /></P>} />
              <Route path="/leads" element={<P><Leads /></P>} />
              <Route path="/app-registry" element={<P><AppRegistry /></P>} />
              <Route path="/organizations" element={<P><Organizations /></P>} />
              <Route path="/subscriptions" element={<P><Subscriptions /></P>} />
              <Route path="/ai-config" element={<P><AIConfig /></P>} />
              <Route path="/services" element={<P><Services /></P>} />
              <Route path="/tools" element={<P><Tools /></P>} />
              <Route path="/documents" element={<P><Documents /></P>} />
              <Route path="/properties" element={<P><Properties /></P>} />
              <Route path="/notifications" element={<P><Notifications /></P>} />
              <Route path="/roles-security" element={<P><RolesSecurity /></P>} />
              <Route path="/finance" element={<P><Finance /></P>} />
              <Route path="/community" element={<P><Community /></P>} />
              <Route path="/devops" element={<P><DevOps /></P>} />
              <Route path="/api-status" element={<P><ApiStatus /></P>} />
              <Route path="/ams-billing" element={<P><AmsBillingPage /></P>} />
              <Route path="/uar" element={<P><UarDashboard /></P>} />
              <Route path="/gmail-sync" element={<P><GmailSync /></P>} />
              <Route path="/gmail-sync/callback" element={<P><GmailSync /></P>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
