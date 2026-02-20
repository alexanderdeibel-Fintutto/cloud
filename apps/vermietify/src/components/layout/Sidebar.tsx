import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  Building2,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Gauge,
  Mail,
  Calculator,
  FolderOpen,
  Receipt,
  Euro,
  TrendingUp,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Immobilien', href: '/properties', icon: Building2 },
  { name: 'Mieter', href: '/tenants', icon: Users },
  { name: 'Verträge', href: '/contracts', icon: FileText },
  { name: 'Zahlungen', href: '/payments', icon: CreditCard },
  { name: 'Zähler', href: '/meters', icon: Gauge },
  { name: 'Dokumente', href: '/documents', icon: FolderOpen },
  { name: 'Kommunikation', href: '/communication', icon: Mail },
  { name: 'Rechner', href: '/calculators', icon: Calculator },
  { name: 'Steuer', href: '/tax', icon: Receipt },
  { name: 'AfA-Rechner', href: '/afa', icon: Euro },
  { name: 'Capital Gains', href: '/capital-gains', icon: TrendingUp },
]

export function Sidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-sidebar-foreground">Vermietify</span>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-3 space-y-1">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Einstellungen
        </Link>

        {user && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Abmelden
          </Button>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          {user?.email}
        </p>
      </div>
    </div>
  )
}
