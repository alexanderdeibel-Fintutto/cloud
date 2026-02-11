import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom'
import { Bot, Users, Calendar, Activity, Settings, BarChart3 } from 'lucide-react'
import DashboardPage from './pages/DashboardPage'
import PersonasPage from './pages/PersonasPage'
import SchedulePage from './pages/SchedulePage'
import ActivityPage from './pages/ActivityPage'
import SettingsPage from './pages/SettingsPage'

function DashboardLayout() {
  const location = useLocation()

  const nav = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/personas', label: 'Personas', icon: Users },
    { path: '/schedule', label: 'Zeitplan', icon: Calendar },
    { path: '/activity', label: 'Aktivität', icon: Activity },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1e293b] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold">Board-Bot</span>
            <span className="text-[10px] bg-green-400/20 text-green-300 px-1.5 py-0.5 rounded">
              widerspruchjobcenter.de
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-gray-500 text-[10px] py-3 text-center">
        Board-Bot v1.0 – Lokales Tool für automatisiertes Community-Management
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="personas" element={<PersonasPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
