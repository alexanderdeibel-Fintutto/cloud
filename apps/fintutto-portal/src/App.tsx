import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import Receipts from "./pages/Receipts";
import Contacts from "./pages/Contacts";
import BankAccounts from "./pages/BankAccounts";
import BankConnect from "./pages/BankConnect";
import Elster from "./pages/Elster";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Companies from "./pages/Companies";
import Handover from "./pages/Handover";
import Calendar from "./pages/Calendar";
import EmailTemplates from "./pages/EmailTemplates";
import Notifications from "./pages/Notifications";
import HelpCenter from "./pages/HelpCenter";
import BankCallback from "./pages/BankCallback";
import NotFound from "./pages/NotFound";
import RecurringTransactions from "./pages/RecurringTransactions";
import Quotes from "./pages/Quotes";
import OrderConfirmations from "./pages/OrderConfirmations";
import Automation from "./pages/Automation";
import SepaPayments from "./pages/SepaPayments";
import TaxAdvisorPortal from "./pages/TaxAdvisorPortal";
import EcommerceIntegration from "./pages/EcommerceIntegration";
import OnlinePayments from "./pages/OnlinePayments";
import AccountingSoftware from "./pages/AccountingSoftware";
import ReceiptScanner from "./pages/ReceiptScanner";
import BankReconciliation from "./pages/BankReconciliation";
import CashFlowAnalysis from "./pages/CashFlowAnalysis";
import ComparisonReports from "./pages/ComparisonReports";
import BusinessForecast from "./pages/BusinessForecast";
import Budgeting from "./pages/Budgeting";
import DataBackup from "./pages/DataBackup";
import AssetManagement from "./pages/AssetManagement";
import MultiCurrency from "./pages/MultiCurrency";
import DocumentArchive from "./pages/DocumentArchive";
import KPIDashboard from "./pages/KPIDashboard";
import UserRoles from "./pages/UserRoles";
import ApiDocumentation from "./pages/ApiDocumentation";
import AuditLog from "./pages/AuditLog";
import TaxCalendar from "./pages/TaxCalendar";
import ReportScheduler from "./pages/ReportScheduler";
import BankRules from "./pages/BankRules";
import BookingTemplates from "./pages/BookingTemplates";
import SupplierInvoices from "./pages/SupplierInvoices";
import YearEndClosing from "./pages/YearEndClosing";
import Payments from "./pages/Payments";
import CostCenters from "./pages/CostCenters";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import VATHelper from "./pages/VATHelper";
import ProjectAccounting from "./pages/ProjectAccounting";
import RecurringBookings from "./pages/RecurringBookings";
import OpenItems from "./pages/OpenItems";
import Dunning from "./pages/Dunning";
import CashBook from "./pages/CashBook";
import BWA from "./pages/BWA";
import TrialBalance from "./pages/TrialBalance";
import AccountStatements from "./pages/AccountStatements";
import Inventory from "./pages/Inventory";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CompanyProvider>
      <NotificationProvider>
        <AppLayout>{children}</AppLayout>
      </NotificationProvider>
    </CompanyProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/buchungen" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/wiederkehrend" element={<ProtectedRoute><RecurringTransactions /></ProtectedRoute>} />
      <Route path="/angebote" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
      <Route path="/auftraege" element={<ProtectedRoute><OrderConfirmations /></ProtectedRoute>} />
      <Route path="/rechnungen" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/belege" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
      <Route path="/kontakte" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      <Route path="/bankkonten" element={<ProtectedRoute><BankAccounts /></ProtectedRoute>} />
      <Route path="/bankverbindung" element={<ProtectedRoute><BankConnect /></ProtectedRoute>} />
      <Route path="/elster" element={<ProtectedRoute><Elster /></ProtectedRoute>} />
      <Route path="/berichte" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/automatisierung" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
      <Route path="/sepa" element={<ProtectedRoute><SepaPayments /></ProtectedRoute>} />
      <Route path="/steuerberater" element={<ProtectedRoute><TaxAdvisorPortal /></ProtectedRoute>} />
      <Route path="/ecommerce" element={<ProtectedRoute><EcommerceIntegration /></ProtectedRoute>} />
      <Route path="/zahlungen" element={<ProtectedRoute><OnlinePayments /></ProtectedRoute>} />
      <Route path="/software" element={<ProtectedRoute><AccountingSoftware /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><ReceiptScanner /></ProtectedRoute>} />
      <Route path="/abstimmung" element={<ProtectedRoute><BankReconciliation /></ProtectedRoute>} />
      <Route path="/cashflow" element={<ProtectedRoute><CashFlowAnalysis /></ProtectedRoute>} />
      <Route path="/vergleiche" element={<ProtectedRoute><ComparisonReports /></ProtectedRoute>} />
      <Route path="/prognose" element={<ProtectedRoute><BusinessForecast /></ProtectedRoute>} />
      <Route path="/budget" element={<ProtectedRoute><Budgeting /></ProtectedRoute>} />
      <Route path="/backup" element={<ProtectedRoute><DataBackup /></ProtectedRoute>} />
      <Route path="/anlagen" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
      <Route path="/waehrungen" element={<ProtectedRoute><MultiCurrency /></ProtectedRoute>} />
      <Route path="/archiv" element={<ProtectedRoute><DocumentArchive /></ProtectedRoute>} />
      <Route path="/kpi" element={<ProtectedRoute><KPIDashboard /></ProtectedRoute>} />
      <Route path="/benutzer" element={<ProtectedRoute><UserRoles /></ProtectedRoute>} />
      <Route path="/api-docs" element={<ProtectedRoute><ApiDocumentation /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      <Route path="/steuerkalender" element={<ProtectedRoute><TaxCalendar /></ProtectedRoute>} />
      <Route path="/report-scheduler" element={<ProtectedRoute><ReportScheduler /></ProtectedRoute>} />
      <Route path="/bankregeln" element={<ProtectedRoute><BankRules /></ProtectedRoute>} />
      <Route path="/buchungsvorlagen" element={<ProtectedRoute><BookingTemplates /></ProtectedRoute>} />
      <Route path="/eingangsrechnungen" element={<ProtectedRoute><SupplierInvoices /></ProtectedRoute>} />
      <Route path="/jahresabschluss" element={<ProtectedRoute><YearEndClosing /></ProtectedRoute>} />
      <Route path="/zahlungsuebersicht" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/kostenstellen" element={<ProtectedRoute><CostCenters /></ProtectedRoute>} />
      <Route path="/kontenplan" element={<ProtectedRoute><ChartOfAccounts /></ProtectedRoute>} />
      <Route path="/ustva" element={<ProtectedRoute><VATHelper /></ProtectedRoute>} />
      <Route path="/projekte" element={<ProtectedRoute><ProjectAccounting /></ProtectedRoute>} />
      <Route path="/dauerbuchungen" element={<ProtectedRoute><RecurringBookings /></ProtectedRoute>} />
      <Route path="/offene-posten" element={<ProtectedRoute><OpenItems /></ProtectedRoute>} />
      <Route path="/mahnwesen" element={<ProtectedRoute><Dunning /></ProtectedRoute>} />
      <Route path="/kassenbuch" element={<ProtectedRoute><CashBook /></ProtectedRoute>} />
      <Route path="/bwa" element={<ProtectedRoute><BWA /></ProtectedRoute>} />
      <Route path="/saldenliste" element={<ProtectedRoute><TrialBalance /></ProtectedRoute>} />
      <Route path="/kontoauszuege" element={<ProtectedRoute><AccountStatements /></ProtectedRoute>} />
      <Route path="/inventar" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/einstellungen" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/firmen" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
      <Route path="/uebergabe" element={<ProtectedRoute><Handover /></ProtectedRoute>} />
      <Route path="/kalender" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/vorlagen" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
      <Route path="/benachrichtigungen" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/hilfe" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="/bank-callback" element={<BankCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
