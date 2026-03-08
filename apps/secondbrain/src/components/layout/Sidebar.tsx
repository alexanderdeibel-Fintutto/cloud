import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  Search,
  Settings,
  Brain,
  FolderOpen,
  Star,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dokumente', icon: FileText, label: 'Dokumente' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/chat', icon: MessageSquare, label: 'KI-Chat' },
  { to: '/suche', icon: Search, label: 'Suche' },
]

const secondaryNav = [
  { to: '/sammlungen', icon: FolderOpen, label: 'Sammlungen' },
  { to: '/favoriten', icon: Star, label: 'Favoriten' },
  { to: '/verlauf', icon: Clock, label: 'Verlauf' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar hidden lg:flex flex-col w-64 border-r border-border bg-card/50 h-[calc(100vh-3.5rem)] sticky top-14 no-print">
      {/* Brand */}
      <div className="p-4">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">SecondBrain</h2>
            <p className="text-[10px] text-muted-foreground">Wissensmanagement</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hauptmenü
        </p>
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        <Separator className="my-3" />

        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bibliothek
        </p>
        {secondaryNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border">
        <NavLink
          to="/einstellungen"
          className={({ isActive }) =>
            cn('sidebar-item', isActive && 'sidebar-item-active')
          }
        >
          <Settings className="w-4 h-4" />
          Einstellungen
        </NavLink>
      </div>
    </aside>
  )
}
