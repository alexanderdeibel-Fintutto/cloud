import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  Search,
  Settings,
  X,
  FolderOpen,
  Star,
  Clock,
  Inbox,
  Building2,
  CalendarClock,
  BarChart3,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  { to: '/tags', icon: Tag, label: 'Tags' },
  { to: '/verlauf', icon: Clock, label: 'Verlauf' },
  { to: '/statistiken', icon: BarChart3, label: 'Statistiken' },
  { to: '/zeitstrahl', icon: Calendar, label: 'Zeitstrahl' },
]

const ecosystemApps = [
  FINTUTTO_APPS.portal,
  FINTUTTO_APPS.financialCompass,
  FINTUTTO_APPS.bescheidboxer,
  FINTUTTO_APPS.fintuttoBiz,
]

export default function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:hidden animate-slide-in-left overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-bold gradient-brain-text">SecondBrain</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hauptmenü
          </p>
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
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
              onClick={onClose}
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
            Fintutto Apps
          </p>
          {ecosystemApps.map((app) => (
            <a
              key={app.slug}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-item text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <span className="text-base leading-none">{app.icon}</span>
              <span className="flex-1 truncate">{app.name}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}

          <Separator className="my-3" />

          <NavLink
            to="/einstellungen"
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-item', isActive && 'sidebar-item-active')
            }
          >
            <Settings className="w-4 h-4" />
            Einstellungen
          </NavLink>
        </nav>
      </div>
    </>
  )
}
