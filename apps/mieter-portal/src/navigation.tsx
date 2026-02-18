import {
  LayoutDashboard,
  Home,
  Gauge,
  FileText,
  AlertTriangle,
  Settings,
  Building2,
  User,
} from 'lucide-react'

export const SidebarNavItems = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/' },
  { icon: <Home className="h-4 w-4" />, label: 'Meine Wohnung', path: '/apartment' },
  { icon: <Gauge className="h-4 w-4" />, label: 'Zaehler', path: '/meters' },
  { icon: <FileText className="h-4 w-4" />, label: 'Dokumente', path: '/documents' },
  { icon: <AlertTriangle className="h-4 w-4" />, label: 'Maengel melden', path: '/defects' },
  { icon: <Settings className="h-4 w-4" />, label: 'Einstellungen', path: '/settings' },
]

export const BottomNavItems = [
  { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
  { icon: <Building2 className="h-5 w-5" />, label: 'Wohnung', path: '/apartment' },
  { icon: <Gauge className="h-5 w-5" />, label: 'Zaehler', path: '/meters' },
  { icon: <AlertTriangle className="h-5 w-5" />, label: 'Maengel', path: '/defects' },
  { icon: <User className="h-5 w-5" />, label: 'Profil', path: '/settings' },
]
