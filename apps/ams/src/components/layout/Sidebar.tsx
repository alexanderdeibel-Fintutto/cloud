import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Settings,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  AlertTriangle,
  Bot,
  HelpCircle,
  Globe,
  Handshake,
  Target,
  AppWindow,
  Building2,
  CreditCard,
  Brain,
  Server,
  Wrench,
  FileText,
  Home,
  Bell,
  Shield,
  Wallet,
  MessageCircle,
  Activity,
  Zap,
  Fingerprint,
  Signal,
  Mail,
  TrendingUp,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const SUPERADMIN_EMAILS = ['admin@fintutto.de', 'alexander@fintutto.world', 'alexander@fintutto.de'];

const navSections = [
  {
    label: 'Ubersicht',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: BarChart3, label: 'Analytics & Usage', path: '/analytics' },
      { icon: AlertTriangle, label: 'Fehler & Logs', path: '/errors' },
      { icon: TrendingUp, label: 'Wachstum (Superadmin)', path: '/growth', superadmin: true },
      { icon: Lock, label: 'Berechtigungen (Superadmin)', path: '/permissions', superadmin: true },
    ],
  },
  {
    label: 'Ecosystem',
    items: [
      { icon: AppWindow, label: 'App Registry', path: '/app-registry' },
      { icon: Wrench, label: 'Tools Registry', path: '/tools' },
      { icon: Server, label: 'Services & APIs', path: '/services' },
      { icon: Globe, label: 'URL Check', path: '/url-check' },
    ],
  },
  {
    label: 'Kunden & Revenue',
    items: [
      { icon: Users, label: 'Benutzer & Abos', path: '/users' },
      { icon: Building2, label: 'Organisationen', path: '/organizations' },
      { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
      { icon: Zap, label: 'AMS Schaltzentrale', path: '/ams-billing' },
      { icon: Fingerprint, label: 'Universal Accounts (UAR)', path: '/uar' },
      { icon: Target, label: 'Lead Management', path: '/leads' },
      { icon: Handshake, label: 'Partner & Affiliate', path: '/partners' },
    ],
  },
  {
    label: 'Produkte & Content',
    items: [
      { icon: Package, label: 'Produkte & Preise', path: '/products' },
      { icon: Layers, label: 'Bundles & Angebote', path: '/bundles' },
      { icon: FileText, label: 'Dokumente', path: '/documents' },
      { icon: Home, label: 'Immobilien', path: '/properties' },
    ],
  },
  {
    label: 'KI & Konfiguration',
    items: [
      { icon: Brain, label: 'KI-Konfiguration', path: '/ai-config' },
      { icon: Bot, label: 'KI-Center', path: '/ai-center' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Bell, label: 'Benachrichtigungen', path: '/notifications' },
      { icon: Shield, label: 'Rollen & Sicherheit', path: '/roles-security' },
      { icon: Wallet, label: 'Finanzen', path: '/finance' },
      { icon: MessageCircle, label: 'Community', path: '/community' },
      { icon: Activity, label: 'DevOps & Monitoring', path: '/devops' },
      { icon: Signal, label: 'API Verfügbarkeit', path: '/api-status' },
      { icon: Mail, label: 'Gmail-Sync', path: '/gmail-sync' },
    ],
  },
  {
    label: '',
    items: [
      { icon: HelpCircle, label: 'Support & FAQ', path: '/support' },
      { icon: Settings, label: 'Einstellungen', path: '/settings' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isSuperAdmin = user?.email && SUPERADMIN_EMAILS.includes(user.email.toLowerCase());

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Fintutto</span>
          <span className="text-[10px] text-muted-foreground">Command Center</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-1">
            {section.label && (
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item: any) => {
                if (item.superadmin && !isSuperAdmin) return null;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                    {item.superadmin && (
                      <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide text-orange-500">SA</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex-1 justify-start gap-2 text-sidebar-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Hell' : 'Dunkel'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-sidebar-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
