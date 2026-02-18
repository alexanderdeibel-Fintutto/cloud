import {
  LayoutDashboard,
  ClipboardList,
  Route,
  Gauge,
  Building2,
  Settings,
  Home,
  User,
} from 'lucide-react'

export const SidebarNavItems = [
  { icon: <LayoutDashboard className="h-4 w-4 text-orange-500" />, label: 'Dashboard', path: '/' },
  { icon: <ClipboardList className="h-4 w-4 text-orange-500" />, label: 'Auftraege', path: '/tasks' },
  { icon: <Route className="h-4 w-4 text-orange-500" />, label: 'Rundgaenge', path: '/rounds' },
  { icon: <Gauge className="h-4 w-4 text-orange-500" />, label: 'Zaehler', path: '/meters' },
  { icon: <Building2 className="h-4 w-4 text-orange-500" />, label: 'Gebaeude', path: '/buildings' },
  { icon: <Settings className="h-4 w-4 text-orange-500" />, label: 'Einstellungen', path: '/settings' },
]

export const BottomNavItems = [
  { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
  { icon: <ClipboardList className="h-5 w-5" />, label: 'Auftraege', path: '/tasks' },
  { icon: <Gauge className="h-5 w-5" />, label: 'Zaehler', path: '/meters' },
  { icon: <Building2 className="h-5 w-5" />, label: 'Gebaeude', path: '/buildings' },
  { icon: <User className="h-5 w-5" />, label: 'Profil', path: '/settings' },
]
