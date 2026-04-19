import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, FileText, Receipt, Users,
  Building2, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight, TrendingUp, Landmark, Calculator, Menu, X,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buchungen', icon: BookOpen, label: 'Buchungen' },
  { to: '/rechnungen', icon: FileText, label: 'Rechnungen' },
  { to: '/belege', icon: Receipt, label: 'Belege & OCR' },
  { to: '/kontakte', icon: Users, label: 'Kontakte' },
  { to: '/bankkonten', icon: Landmark, label: 'Bankkonten' },
  { to: '/kontenrahmen', icon: Calculator, label: 'Kontenrahmen' },
  { to: '/berichte', icon: BarChart3, label: 'Berichte' },
  { to: '/firmen', icon: Building2, label: 'Firmen' },
  { to: '/einstellungen', icon: Settings, label: 'Einstellungen' },
]

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-sm">Financial Compass</span>
            </div>
          )}
          {collapsed && <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto" />}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-700">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`
            }>
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Abmelden</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center h-16 px-4 bg-white border-b border-gray-200">
          <button onClick={() => setMobileOpen(true)} className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-sm">Financial Compass</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
