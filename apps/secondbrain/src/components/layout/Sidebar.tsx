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
  Inbox,
  Building2,
  CalendarClock,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { FINTUTTO_APPS } from '@fintutto/shared'

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eingang', icon: Inbox, label: 'Eingangskorb' },
  { to: '/dokumente', icon: FileText, label: 'Dokumente' },
  { to: '/upload', icon: Upload, label: 'Scannen' },
  { to: '/chat', icon: MessageSquare, label: 'KI-Chat' },
  { to: '/suche', icon: Search, label: 'Suche' },
]

const organizeNav = [
  { to: '/firmen', icon: Building2, label: 'Firmen' },
  { to: '/fristen', icon: CalendarClock, label: 'Fristen' },
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
            <p className="text-[10px] text-muted-foreground">Dokumenten-KI-Zentrale</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
          Organisation
        </p>
        {organizeNav.map((item) => (
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

      {/* Ecosystem Links */}
      <div className="p-3 border-t border-border">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fintutto Apps
        </p>
        {[
          FINTUTTO_APPS.portal,
          FINTUTTO_APPS.financialCompass,
          FINTUTTO_APPS.bescheidboxer,
          FINTUTTO_APPS.fintuttoBiz,
        ].map((app) => (
          <a
            key={app.slug}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-item text-muted-foreground hover:text-foreground group/eco"
          >
            <span className="text-base leading-none">{app.icon}</span>
            <span className="flex-1 truncate">{app.name}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover/eco:opacity-50 transition-opacity" />
          </a>
        ))}
      </div>

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
