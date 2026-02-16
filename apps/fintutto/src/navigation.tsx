import {
  LayoutDashboard,
  Building2,
  Users,
  Gauge,
  FileText,
  CreditCard,
  Calculator,
  CheckCircle,
  FileBox,
  ClipboardList,
  Settings,
  Home,
  Plus,
  Bell,
  User,
} from 'lucide-react'

export const SidebarNavItems = [
  { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/' },
  { icon: <Building2 className="h-4 w-4" />, label: 'Immobilien', path: '/properties' },
  { icon: <Users className="h-4 w-4" />, label: 'Mieter', path: '/tenants' },
  { icon: <Gauge className="h-4 w-4" />, label: 'Zähler', path: '/meters' },
  { icon: <FileText className="h-4 w-4" />, label: 'Dokumente', path: '/documents' },
  { icon: <CreditCard className="h-4 w-4" />, label: 'Zahlungen', path: '/payments' },
  { icon: <Calculator className="h-4 w-4" />, label: 'Rechner', path: '/calculators' },
  { icon: <CheckCircle className="h-4 w-4" />, label: 'Checker', path: '/checkers' },
  { icon: <FileBox className="h-4 w-4" />, label: 'Bescheide', path: '/bescheide' },
  { icon: <ClipboardList className="h-4 w-4" />, label: 'Aufgaben', path: '/tasks' },
  { icon: <Settings className="h-4 w-4" />, label: 'Einstellungen', path: '/settings' },
]

export const BottomNavItems = [
  { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
  { icon: <Building2 className="h-5 w-5" />, label: 'Objekte', path: '/properties' },
  { icon: <Plus className="h-5 w-5" />, label: 'Neu', path: '/new', primary: true },
  { icon: <Bell className="h-5 w-5" />, label: 'Alerts', path: '/notifications' },
  { icon: <User className="h-5 w-5" />, label: 'Profil', path: '/settings' },
]
