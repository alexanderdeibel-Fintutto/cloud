import { Link, useNavigate } from 'react-router-dom'
import { Brain, Search, Menu, LogOut, User, Moon, Sun, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { AppSwitcher } from '@fintutto/shared'
import { useDocuments } from '@/hooks/useDocuments'

export default function Header({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(true)
  const { data: documents = [] } = useDocuments()
  const pendingCount = documents.filter(d =>
    d.status === 'action_required' || d.priority === 'urgent' || !d.status || d.status === 'inbox'
  ).length

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left: Mobile menu + Brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleMobileMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brain flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:inline gradient-brain-text">
              SecondBrain
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <button
          onClick={() => navigate('/suche')}
          className="hidden md:flex items-center gap-2 h-9 px-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:bg-muted transition-colors w-80"
        >
          <Search className="w-4 h-4" />
          <span>Dokumente durchsuchen...</span>
          <kbd className="ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">
            /
          </kbd>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <AppSwitcher currentAppSlug="secondbrain" />

          {/* Notification bell */}
          {user && pendingCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/eingang')}
              title={`${pendingCount} Dokumente im Eingang`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/einstellungen')}>
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Anmelden
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
