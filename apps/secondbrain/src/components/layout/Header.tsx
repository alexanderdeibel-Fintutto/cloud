import { Link, useNavigate } from 'react-router-dom'
import { Brain, Search, Menu, LogOut, User, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { AppSwitcher } from '@fintutto/shared'
import NotificationCenter from '@/components/NotificationCenter'

export default function Header({ onToggleMobileMenu }: { onToggleMobileMenu?: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { resolvedTheme, toggleTheme } = useTheme()

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

        {/* Center: Search - opens Command Palette */}
        <button
          onClick={() => {
            // Dispatch Ctrl+K to open command palette
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
          }}
          className="hidden md:flex items-center gap-2 h-9 px-4 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground hover:bg-muted transition-colors w-80"
        >
          <Search className="w-4 h-4" />
          <span>Suche, Seiten, Aktionen...</span>
          <kbd className="ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <AppSwitcher currentAppSlug="secondbrain" />

          {/* Notification Center */}
          {user && <NotificationCenter />}

          <Button variant="ghost" size="icon" onClick={toggleTheme} title={resolvedTheme === 'dark' ? 'Helles Design' : 'Dunkles Design'}>
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
