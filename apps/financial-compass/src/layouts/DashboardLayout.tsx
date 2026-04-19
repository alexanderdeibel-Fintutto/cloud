import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Receipt,
  Users,
  Landmark,
  FolderTree,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  Building2,
  ChevronDown,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Buchungen', href: '/bookings', icon: Calculator },
  { name: 'Rechnungen', href: '/invoices', icon: FileText },
  { name: 'Belege', href: '/receipts', icon: Receipt },
  { name: 'Kontakte', href: '/contacts', icon: Users },
  { name: 'Bankkonten', href: '/bank-accounts', icon: Landmark },
  { name: 'Kontenplan', href: '/accounts', icon: FolderTree },
  { name: 'Berichte', href: '/reports', icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Einstellungen', href: '/settings', icon: Settings },
  { name: 'Hilfe', href: '/help', icon: HelpCircle },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, currentOrganization, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          pathname={location.pathname}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          organization={currentOrganization}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent
            pathname={location.pathname}
            onLogout={handleLogout}
            organization={currentOrganization}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -m-2.5 p-2.5 text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              {/* AI Assistant Button */}
              <Button variant="ghost" className="text-primary-600">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">KI-Assistent</span>
              </Button>

              {/* Organization Selector */}
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <Building2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {currentOrganization?.name || 'Organisation wählen'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onClose,
  onLogout,
  organization,
}: {
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
  organization: { name: string; legalForm: string } | null;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Fintutto</span>
        </Link>
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2 p-2 text-gray-500"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={onClose}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Verwaltung
          </p>
          <div className="mt-3 space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Abmelden
        </button>
      </div>
    </>
  );
}
