import { Outlet } from 'react-router-dom'
import { Wrench, ClipboardList, Building2, FileText, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { href: '/', icon: Wrench, label: 'Dashboard' },
  { href: '/aufgaben', icon: ClipboardList, label: 'Aufgaben' },
  { href: '/gebaeude', icon: Building2, label: 'Gebaeude' },
  { href: '/protokolle', icon: FileText, label: 'Protokolle' },
  { href: '/einstellungen', icon: Settings, label: 'Einstellungen' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 border-r flex-col bg-white">
        <div className="p-4 border-b">
          <span className="font-bold text-lg">HausmeisterPro</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === href
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
