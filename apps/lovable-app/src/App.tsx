import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import BookingsPage from '@/pages/bookings/BookingsPage';
import BookingDetailPage from '@/pages/bookings/BookingDetailPage';
import NewBookingPage from '@/pages/bookings/NewBookingPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import NewInvoicePage from '@/pages/invoices/NewInvoicePage';
import ReceiptsPage from '@/pages/receipts/ReceiptsPage';
import ReceiptDetailPage from '@/pages/receipts/ReceiptDetailPage';
import ContactsPage from '@/pages/contacts/ContactsPage';
import ContactDetailPage from '@/pages/contacts/ContactDetailPage';
import BankAccountsPage from '@/pages/bank-accounts/BankAccountsPage';
import AccountsPage from '@/pages/accounts/AccountsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

// Landing Page
import LandingPage from '@/pages/LandingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Buchungen */}
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/new" element={<NewBookingPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />

        {/* Rechnungen */}
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/new" element={<NewInvoicePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />

        {/* Belege */}
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/receipts/:id" element={<ReceiptDetailPage />} />

        {/* Kontakte */}
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetailPage />} />

        {/* Bankkonten */}
        <Route path="/bank-accounts" element={<BankAccountsPage />} />

        {/* Kontenplan */}
        <Route path="/accounts" element={<AccountsPage />} />

        {/* Berichte */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Einstellungen */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
