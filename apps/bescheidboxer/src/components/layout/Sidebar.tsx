import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  Clock,
  ShieldAlert,
  Search,
  Users,
  Settings,
  HelpCircle,
  BarChart3,
  ArrowLeftRight,
  CalendarDays,
  Calculator,
  User,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bescheide', href: '/bescheide', icon: FileText },
  { name: 'Upload & Analyse', href: '/upload', icon: Upload },
  { name: 'Analyse', href: '/analyse', icon: Search },
  { name: 'Fristen', href: '/fristen', icon: Clock },
  { name: 'Kalender', href: '/kalender', icon: CalendarDays },
  { name: 'Einspruch', href: '/einspruch', icon: ShieldAlert },
  { name: 'Vergleich', href: '/vergleich', icon: ArrowLeftRight },
  { name: 'Steuer-Rechner', href: '/steuerrechner', icon: Calculator },
  { name: 'Jahresbericht', href: '/jahresbericht', icon: BarChart3 },
  { name: 'Mein Profil', href: '/profil', icon: User },
  { name: 'Freunde werben', href: '/referral', icon: Users },
  { name: 'Hilfe & Glossar', href: '/hilfe', icon: HelpCircle },
  { name: 'Einstellungen', href: '/einstellungen', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-muted/30 p-4">
      <nav className="flex flex-col gap-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="rounded-lg bg-gradient-to-br from-fintutto-blue-800 to-fintutto-blue-600 p-4 text-white">
          <p className="text-sm font-semibold">Bescheidboxer Pro</p>
          <p className="text-xs opacity-80 mt-1">
            Unbegrenzte Analysen & automatische Einsprueche
          </p>
          <button className="mt-3 w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  )
}
