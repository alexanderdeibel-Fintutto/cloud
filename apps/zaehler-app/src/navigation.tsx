import {
  LayoutDashboard,
  Gauge,
  PenLine,
  History,
  Settings,
  Home,
  User,
} from 'lucide-react'

export const SidebarNavItems = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/' },
  { icon: <Gauge className="h-4 w-4" />, label: 'Alle Zähler', path: '/meters' },
  { icon: <PenLine className="h-4 w-4" />, label: 'Ablesung erfassen', path: '/capture' },
  { icon: <History className="h-4 w-4" />, label: 'Verlauf', path: '/history' },
  { icon: <Settings className="h-4 w-4" />, label: 'Einstellungen', path: '/settings' },
]

export const BottomNavItems = [
  { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
  { icon: <Gauge className="h-5 w-5" />, label: 'Zähler', path: '/meters' },
  { icon: <PenLine className="h-5 w-5" />, label: 'Erfassen', path: '/capture', primary: true },
  { icon: <History className="h-5 w-5" />, label: 'Verlauf', path: '/history' },
  { icon: <User className="h-5 w-5" />, label: 'Profil', path: '/settings' },
]
