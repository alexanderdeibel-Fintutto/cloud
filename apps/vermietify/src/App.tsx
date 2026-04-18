import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { TenantProtectedRoute } from "./components/tenant-portal/TenantProtectedRoute";
import { AIAssistant } from "./components/ai/AIAssistant";

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy-loaded Pages
const BulkUpload = lazy(() => import("./pages/BulkUpload"));
const OnboardingWizardPage = lazy(() => import("./pages/onboarding/OnboardingWizardPage"));

// App Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Properties = lazy(() => import("./pages/Properties"));
const Tenants = lazy(() => import("./pages/Tenants"));
const Finances = lazy(() => import("./pages/Finances"));
const Documents = lazy(() => import("./pages/Documents"));
const Billing = lazy(() => import("./pages/Billing"));
const Taxes = lazy(() => import("./pages/Taxes"));
const Communication = lazy(() => import("./pages/Communication"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Detail Pages
const BuildingDetail = lazy(() => import("./pages/buildings/BuildingDetail"));
const UnitDetail = lazy(() => import("./pages/einheiten/UnitDetail"));
const UnitsList = lazy(() => import("./pages/units/UnitsList"));
const TenantDetailNew = lazy(() => import("./pages/mieter/TenantDetail"));
const ContractList = lazy(() => import("./pages/contracts/ContractList"));
const ContractDetail = lazy(() => import("./pages/contracts/ContractDetail"));
const NewContract = lazy(() => import("./pages/contracts/NewContract"));
const PaymentList = lazy(() => import("./pages/payments/PaymentList"));
const OperatingCosts = lazy(() => import("./pages/betriebskosten"));
const NewBilling = lazy(() => import("./pages/betriebskosten/neu"));
const OperatingCostDetail = lazy(() => import("./pages/betriebskosten/[id]"));
const CostTypes = lazy(() => import("./pages/betriebskosten/kostenarten"));
const MeterList = lazy(() => import("./pages/zaehler"));
const MeterDetail = lazy(() => import("./pages/zaehler/[id]"));
const Auswertung = lazy(() => import("./pages/zaehler/Auswertung"));
const TaskList = lazy(() => import("./pages/tasks/TaskList"));
const TaskDetail = lazy(() => import("./pages/tasks/TaskDetail"));
const NewTask = lazy(() => import("./pages/tasks/NewTask"));
const CalendarPage = lazy(() => import("./pages/calendar/CalendarPage"));

// Letter Pages
const LetterManagement = lazy(() => import("./pages/letters/LetterManagement"));
const LetterSettings = lazy(() => import("./pages/letters/LetterSettings"));
const LetterTemplates = lazy(() => import("./pages/letters/LetterTemplates"));

// Signature Pages
const SignatureManagement = lazy(() => import("./pages/signatures/SignatureManagement"));

// WhatsApp Pages
const WhatsAppDashboard = lazy(() => import("./pages/whatsapp/WhatsAppDashboard"));

// Banking Pages
const BankingDashboard = lazy(() => import("./pages/banking/BankingDashboard"));
const BankConnect = lazy(() => import("./pages/banking/BankConnect"));
const BankTransactions = lazy(() => import("./pages/banking/Transactions"));
const MatchingRules = lazy(() => import("./pages/banking/MatchingRules"));

// Custom Tax/AfA/Capital Gains Pages
const Tax = lazy(() => import("./pages/Tax"));
const AfaCalculator = lazy(() => import("./pages/AfaCalculator"));
const CapitalGainsPage = lazy(() => import("./pages/CapitalGains"));

// Tax Pages
const AnlageVWizard = lazy(() => import("./pages/taxes/AnlageVWizard"));
const TaxDocuments = lazy(() => import("./pages/taxes/TaxDocuments"));
const AITaxAdvisor = lazy(() => import("./pages/taxes/AITaxAdvisor"));

// ELSTER Pages
const ElsterDashboard = lazy(() => import("./pages/elster/ElsterDashboard"));
const ElsterSubmit = lazy(() => import("./pages/elster/ElsterSubmit"));

// Handover Pages
const HandoverList = lazy(() => import("./pages/handover/HandoverList"));
const NewHandover = lazy(() => import("./pages/handover/NewHandover"));
const HandoverProtocol = lazy(() => import("./pages/handover/HandoverProtocol"));
const HandoverPDF = lazy(() => import("./pages/handover/HandoverPDF"));

// Rent Adjustment Pages
const RentAdjustments = lazy(() => import("./pages/rent/RentAdjustments"));

// CO2 Pages
const CO2Dashboard = lazy(() => import("./pages/co2/CO2Dashboard"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const OrgManagement = lazy(() => import("./pages/admin/OrgManagement"));
const Analytics = lazy(() => import("./pages/Analytics"));
// Tenant Portal Pages
const MieterDashboard = lazy(() => import("./pages/tenant-portal/MieterDashboard"));
const DefectReport = lazy(() => import("./pages/tenant-portal/DefectReport"));
const TenantMeterReading = lazy(() => import("./pages/tenant-portal/TenantMeterReading"));
const TenantDocuments = lazy(() => import("./pages/tenant-portal/TenantDocuments"));
const TenantFinances = lazy(() => import("./pages/tenant-portal/TenantFinances"));
const TenantUnit = lazy(() => import("./pages/tenant-portal/TenantUnit"));
// Communication Pages
const EmailTemplates = lazy(() => import("./pages/communication/EmailTemplates"));
const ComposeEmail = lazy(() => import("./pages/communication/ComposeEmail"));
const EmailHistory = lazy(() => import("./pages/communication/EmailHistory"));

// Inbound Email Pages
const InboundEmailSettings = lazy(() => import("./pages/inbound/InboundEmailSettings"));
const InboundEmailQueue = lazy(() => import("./pages/inbound/InboundEmailQueue"));

// Listings Pages
const ListingsManagement = lazy(() => import("./pages/listings/ListingsManagement"));

// Offer Pages
const OfferList = lazy(() => import("./pages/offers/OfferList"));
const NewOffer = lazy(() => import("./pages/offers/NewOffer"));
const OfferDetail = lazy(() => import("./pages/offers/OfferDetail"));
const KduRatesManagement = lazy(() => import("./pages/offers/KduRatesManagement"));

// Automation Pages
const AutomationDashboard = lazy(() => import("./pages/automation/AutomationDashboard"));
const WorkflowBuilder = lazy(() => import("./pages/automation/WorkflowBuilder"));

// Notifications Pages
const NotificationList = lazy(() => import("./pages/notifications/NotificationList"));
const NotificationSettings = lazy(() => import("./pages/notifications/NotificationSettings"));

// Help & Settings Pages
const HelpCenter = lazy(() => import("./pages/help/HelpCenter"));
const AuditLog = lazy(() => import("./pages/settings/AuditLog"));
const PrivacySettings = lazy(() => import("./pages/settings/PrivacySettings"));

// Ecosystem Pages
const ReferralDashboard = lazy(() => import("./pages/ecosystem/ReferralDashboard"));

// Portal Pages
const PortalHub = lazy(() => import("./pages/portal/PortalHub"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AIAssistant />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Suspense fallback={<PageLoader />}><Pricing /></Suspense>} />

              {/* Protected Routes */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingWizardPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/immobilien" element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } />
              <Route path="/gebaeude/:id" element={
                <ProtectedRoute>
                  <BuildingDetail />
                </ProtectedRoute>
              } />
              <Route path="/einheiten" element={
                <ProtectedRoute>
                  <UnitsList />
                </ProtectedRoute>
              } />
              <Route path="/einheiten/:id" element={
                <ProtectedRoute>
                  <UnitDetail />
                </ProtectedRoute>
              } />
              <Route path="/mieter" element={
                <ProtectedRoute>
                  <Tenants />
                </ProtectedRoute>
              } />
              <Route path="/mieter/:id" element={
                <ProtectedRoute>
                  <TenantDetailNew />
                </ProtectedRoute>
              } />
              <Route path="/angebote" element={
                <ProtectedRoute>
                  <OfferList />
                </ProtectedRoute>
              } />
              <Route path="/angebote/neu" element={
                <ProtectedRoute>
                  <NewOffer />
                </ProtectedRoute>
              } />
              <Route path="/angebote/:id" element={
                <ProtectedRoute>
                  <OfferDetail />
                </ProtectedRoute>
              } />
              <Route path="/kdu-richtwerte" element={
                <ProtectedRoute>
                  <KduRatesManagement />
                </ProtectedRoute>
              } />
              <Route path="/vertraege" element={
                <ProtectedRoute>
                  <ContractList />
                </ProtectedRoute>
              } />
              <Route path="/vertraege/neu" element={
                <ProtectedRoute>
                  <NewContract />
                </ProtectedRoute>
              } />
              <Route path="/vertraege/:id" element={
                <ProtectedRoute>
                  <ContractDetail />
                </ProtectedRoute>
              } />
              <Route path="/zahlungen" element={
                <ProtectedRoute>
                  <PaymentList />
                </ProtectedRoute>
              } />
              <Route path="/finanzen" element={
                <ProtectedRoute>
                  <Finances />
                </ProtectedRoute>
              } />
              <Route path="/betriebskosten" element={
                <ProtectedRoute>
                  <OperatingCosts />
                </ProtectedRoute>
              } />
              <Route path="/betriebskosten/neu" element={
                <ProtectedRoute>
                  <NewBilling />
                </ProtectedRoute>
              } />
              <Route path="/betriebskosten/:id" element={
                <ProtectedRoute>
                  <OperatingCostDetail />
                </ProtectedRoute>
              } />
              <Route path="/betriebskosten/kostenarten" element={
                <ProtectedRoute>
                  <CostTypes />
                </ProtectedRoute>
              } />
              <Route path="/zaehler" element={
                <ProtectedRoute>
                  <MeterList />
                </ProtectedRoute>
              } />
              <Route path="/zaehler/auswertung" element={
                <ProtectedRoute>
                  <Auswertung />
                </ProtectedRoute>
              } />
              <Route path="/zaehler/:id" element={
                <ProtectedRoute>
                  <MeterDetail />
                </ProtectedRoute>
              } />
              <Route path="/aufgaben" element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              } />
              <Route path="/aufgaben/neu" element={
                <ProtectedRoute>
                  <NewTask />
                </ProtectedRoute>
              } />
              <Route path="/aufgaben/:id" element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              } />
              <Route path="/kalender" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              <Route path="/dokumente" element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } />
              <Route path="/abrechnung" element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } />
              <Route path="/steuern" element={
                <ProtectedRoute>
                  <Taxes />
                </ProtectedRoute>
              } />
              <Route path="/kommunikation" element={
                <ProtectedRoute>
                  <Communication />
                </ProtectedRoute>
              } />
              <Route path="/kommunikation/vorlagen" element={
                <ProtectedRoute>
                  <EmailTemplates />
                </ProtectedRoute>
              } />
              <Route path="/kommunikation/verfassen" element={
                <ProtectedRoute>
                  <ComposeEmail />
                </ProtectedRoute>
              } />
              <Route path="/kommunikation/verlauf" element={
                <ProtectedRoute>
                  <EmailHistory />
                </ProtectedRoute>
              } />
              <Route path="/eingehende-emails" element={
                <ProtectedRoute>
                  <InboundEmailSettings />
                </ProtectedRoute>
              } />
              <Route path="/eingehende-emails/warteschlange" element={
                <ProtectedRoute>
                  <InboundEmailQueue />
                </ProtectedRoute>
              } />
              <Route path="/briefe" element={
                <ProtectedRoute>
                  <LetterManagement />
                </ProtectedRoute>
              } />
              <Route path="/briefe/einstellungen" element={
                <ProtectedRoute>
                  <LetterSettings />
                </ProtectedRoute>
              } />
              <Route path="/briefe/vorlagen" element={
                <ProtectedRoute>
                  <LetterTemplates />
                </ProtectedRoute>
              } />
              <Route path="/unterschriften" element={
                <ProtectedRoute>
                  <SignatureManagement />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={
                <ProtectedRoute>
                  <WhatsAppDashboard />
                </ProtectedRoute>
              } />
              <Route path="/banking" element={
                <ProtectedRoute>
                  <BankingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/banking/verbinden" element={
                <ProtectedRoute>
                  <BankConnect />
                </ProtectedRoute>
              } />
              <Route path="/banking/transaktionen" element={
                <ProtectedRoute>
                  <BankTransactions />
                </ProtectedRoute>
              } />
              <Route path="/banking/regeln" element={
                <ProtectedRoute>
                  <MatchingRules />
                </ProtectedRoute>
              } />
              <Route path="/uebergabe" element={
                <ProtectedRoute>
                  <HandoverList />
                </ProtectedRoute>
              } />
              <Route path="/uebergabe/neu" element={
                <ProtectedRoute>
                  <NewHandover />
                </ProtectedRoute>
              } />
              <Route path="/uebergabe/:id" element={
                <ProtectedRoute>
                  <HandoverProtocol />
                </ProtectedRoute>
              } />
              <Route path="/uebergabe/:id/pdf" element={
                <ProtectedRoute>
                  <HandoverPDF />
                </ProtectedRoute>
              } />
              <Route path="/mietanpassung" element={
                <ProtectedRoute>
                  <RentAdjustments />
                </ProtectedRoute>
              } />
              <Route path="/co2" element={
                <ProtectedRoute>
                  <CO2Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/steuern/anlage-v" element={
                <ProtectedRoute>
                  <AnlageVWizard />
                </ProtectedRoute>
              } />
              <Route path="/steuern/dokumente" element={
                <ProtectedRoute>
                  <TaxDocuments />
                </ProtectedRoute>
              } />
              <Route path="/steuern/ki-berater" element={
                <ProtectedRoute>
                  <AITaxAdvisor />
                </ProtectedRoute>
              } />
              <Route path="/elster" element={
                <ProtectedRoute>
                  <ElsterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/elster/einreichen" element={
                <ProtectedRoute>
                  <ElsterSubmit />
                </ProtectedRoute>
              } />
              <Route path="/inserate" element={
                <ProtectedRoute>
                  <ListingsManagement />
                </ProtectedRoute>
              } />
              <Route path="/automatisierung" element={
                <ProtectedRoute>
                  <AutomationDashboard />
                </ProtectedRoute>
              } />
              <Route path="/automatisierung/workflow" element={
                <ProtectedRoute>
                  <WorkflowBuilder />
                </ProtectedRoute>
              } />
              <Route path="/benachrichtigungen" element={
                <ProtectedRoute>
                  <NotificationList />
                </ProtectedRoute>
              } />
              <Route path="/benachrichtigungen/einstellungen" element={
                <ProtectedRoute>
                  <NotificationSettings />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/portal" element={
                <ProtectedRoute>
                  <PortalHub />
                </ProtectedRoute>
              } />
              <Route path="/empfehlungen" element={
                <ProtectedRoute>
                  <ReferralDashboard />
                </ProtectedRoute>
              } />
              <Route path="/einstellungen" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />

              {/* Help & Additional Settings Routes */}
              <Route path="/hilfe" element={
                <ProtectedRoute>
                  <HelpCenter />
                </ProtectedRoute>
              } />
              <Route path="/einstellungen/aktivitaeten" element={
                <ProtectedRoute>
                  <AuditLog />
                </ProtectedRoute>
              } />
              <Route path="/einstellungen/datenschutz" element={
                <ProtectedRoute>
                  <PrivacySettings />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/benutzer" element={
                <AdminProtectedRoute>
                  <UserManagement />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/organisationen" element={
                <AdminProtectedRoute>
                  <OrgManagement />
                </AdminProtectedRoute>
              } />

              {/* Tenant Portal Routes */}
              <Route path="/mieter-portal" element={
                <TenantProtectedRoute>
                  <MieterDashboard />
                </TenantProtectedRoute>
              } />
              <Route path="/mieter-portal/mangel-melden" element={
                <TenantProtectedRoute>
                  <DefectReport />
                </TenantProtectedRoute>
              } />
              <Route path="/mieter-portal/zaehler" element={
                <TenantProtectedRoute>
                  <TenantMeterReading />
                </TenantProtectedRoute>
              } />
              <Route path="/mieter-portal/dokumente" element={
                <TenantProtectedRoute>
                  <TenantDocuments />
                </TenantProtectedRoute>
              } />
              <Route path="/mieter-portal/finanzen" element={
                <TenantProtectedRoute>
                  <TenantFinances />
                </TenantProtectedRoute>
              } />
              <Route path="/mieter-portal/wohnung" element={
                <TenantProtectedRoute>
                  <TenantUnit />
                </TenantProtectedRoute>
              } />

              {/* Tax/AfA/Capital Gains Routes */}
              <Route path="/tax" element={
                <ProtectedRoute>
                  <Tax />
                </ProtectedRoute>
              } />
              <Route path="/afa" element={
                <ProtectedRoute>
                  <AfaCalculator />
                </ProtectedRoute>
              } />
              <Route path="/capital-gains" element={
                <ProtectedRoute>
                  <CapitalGainsPage />
                </ProtectedRoute>
              } />

              {/* Massenimport */}
              <Route path="/massenimport" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
