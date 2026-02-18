import {
  LayoutDashboard,
  Upload,
  FileBox,
  BarChart3,
  Settings,
  Home,
  User,
} from 'lucide-react'

export const SidebarNavItems = [
  { icon: <LayoutDashboard className="h-4 w-4 text-red-500" />, label: 'Dashboard', path: '/' },
  { icon: <Upload className="h-4 w-4 text-red-500" />, label: 'Bescheide hochladen', path: '/upload' },
  { icon: <FileBox className="h-4 w-4 text-red-500" />, label: 'Meine Bescheide', path: '/documents' },
  { icon: <BarChart3 className="h-4 w-4 text-red-500" />, label: 'Analyse', path: '/analysis' },
  { icon: <Settings className="h-4 w-4 text-red-500" />, label: 'Einstellungen', path: '/settings' },
]

export const BottomNavItems = [
  { icon: <Home className="h-5 w-5 text-red-500" />, label: 'Home', path: '/' },
  { icon: <Upload className="h-5 w-5 text-red-500" />, label: 'Upload', path: '/upload', primary: true },
  { icon: <FileBox className="h-5 w-5 text-red-500" />, label: 'Bescheide', path: '/documents' },
  { icon: <BarChart3 className="h-5 w-5 text-red-500" />, label: 'Analyse', path: '/analysis' },
  { icon: <User className="h-5 w-5 text-red-500" />, label: 'Profil', path: '/settings' },
]
