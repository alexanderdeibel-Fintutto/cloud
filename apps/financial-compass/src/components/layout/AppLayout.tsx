import { Outlet } from 'react-router-dom'
import { Compass, BarChart3, Receipt, FileText, Users, CreditCard, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { href: '/', icon: Compass, label: 'Dashboard' },
  { href: '/buchungen', icon: BarChart3, label: 'Buchungen' },
  { href: '/rechnungen', icon: Receipt, label: 'Rechnungen' },
  { href: '/belege', icon: FileText, label: 'Belege' },
  { href: '/kontakte', icon: Users, label: 'Kontakte' },
  { href: '/bankkonten', icon: CreditCard, label: 'Bankkonten' },
  { href: '/einstellungen', icon: Settings, label: 'Einstellungen' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 border-r flex-col bg-white">
        <div className="p-4 border-b">
          <span className="font-bold text-lg">Financial Compass</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === href
                  ? 'bg-blue-50 text-blue-700 font-medium'
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
