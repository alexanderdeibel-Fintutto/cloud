import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Flower2,
  Home,
  Droplets,
  Plane,
  ShoppingCart,
  Calendar,
  Search,
  ScanLine,
  Settings,
  LogOut,
  Leaf,
  ChevronLeft,
  Menu,
  Gift,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FINTUTTO_APPS, buildCrossMarketingLink } from '@/lib/referral';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plants', icon: Flower2, label: 'Meine Pflanzen' },
  { to: '/catalog', icon: Search, label: 'Pflanzenkatalog' },
  { to: '/scanner', icon: ScanLine, label: 'Pflanzen-Scanner' },
  { to: '/apartments', icon: Home, label: 'Wohnungen' },
  { to: '/care', icon: Droplets, label: 'Pflege & Giessplan' },
  { to: '/vacation', icon: Plane, label: 'Urlaubsplan' },
  { to: '/shopping', icon: ShoppingCart, label: 'Einkaufsliste' },
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
];

const extraItems = [
  { to: '/referral', icon: Gift, label: 'Empfehlungen' },
  { to: '/pricing', icon: Tag, label: 'Preise & Angebote' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card rounded-lg p-2 shadow-md border"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64',
          'lg:relative lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sidebar-foreground text-lg leading-tight">
                Pflanzen
              </h1>
              <p className="text-xs text-muted-foreground">Manager</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'lg:justify-center lg:px-2'
                )
              }
              end={item.to === '/'}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Separator */}
          {!collapsed && (
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Fintutto
              </p>
            </div>
          )}
          {collapsed && <div className="border-t border-sidebar-border my-2" />}

          {extraItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'lg:justify-center lg:px-2'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Ecosystem quick links */}
          {!collapsed && (
            <div className="pt-2 space-y-0.5">
              {FINTUTTO_APPS.slice(0, 3).map(app => (
                <a
                  key={app.key}
                  href={buildCrossMarketingLink(app.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <span className="text-base w-5 text-center">{app.icon}</span>
                  <span className="truncate">{app.name}</span>
                  <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-50" />
                </a>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'lg:justify-center lg:px-2'
              )
            }
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Einstellungen</span>}
          </NavLink>
          {user && (
            <button
              onClick={signOut}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
                collapsed && 'lg:justify-center lg:px-2'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Abmelden</span>}
            </button>
          )}

          {/* Fintutto branding */}
          {!collapsed && (
            <div className="px-3 py-2 mt-1">
              <a
                href="https://fintutto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ein Produkt von <span className="font-semibold">Fintutto</span>
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
