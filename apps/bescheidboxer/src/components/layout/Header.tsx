import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FileSearch, Menu, X, ExternalLink, Settings, LogOut, User, Sun, Moon, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationCenter from '../NotificationCenter'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://portal.fintutto.cloud'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Bescheide', href: '/bescheide' },
  { label: 'Upload', href: '/upload' },
  { label: 'Fristen', href: '/fristen' },
  { label: 'Einspruch', href: '/einspruch' },
]

const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: 'Freunde werben', href: '/referral' },
  { label: 'Einstellungen', href: '/einstellungen' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Fintutto Ecosystem Bar */}
      <div className="bg-fintutto-blue-900 text-white/80 text-xs py-1 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={PORTAL_URL} className="hover:text-white transition-colors flex items-center gap-1">
            Fintutto Portal <ExternalLink className="h-3 w-3" />
          </a>
          <a href="https://formulare.fintutto.cloud" className="hover:text-white transition-colors hidden sm:inline">
            Formulare
          </a>
          <a href="https://rendite.fintutto.cloud" className="hover:text-white transition-colors hidden sm:inline">
            Rendite-Rechner
          </a>
        </div>
        <span className="text-white/50 hidden sm:inline">Fintutto Oekosystem</span>
      </div>

      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fintutto-blue-700 to-fintutto-blue-500">
            <FileSearch className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-foreground">Bescheidboxer</span>
            <span className="text-xs text-muted-foreground ml-1">by Fintutto</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  isActive(item.href) && 'bg-accent text-accent-foreground font-semibold'
                )}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Cmd+K search trigger */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Suche oeffnen (Strg+K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Suche...</span>
            <kbd className="ml-2 rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <NotificationCenter />

          {/* User menu (desktop) */}
          <div className="relative hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Benutzermenue"
              aria-expanded={userMenuOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline text-sm">
                {profile?.name || profile?.email || 'Benutzer'}
              </span>
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border bg-background shadow-lg z-50" role="menu">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{profile?.name || 'Benutzer'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/profil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                    role="menuitem"
                  >
                    <User className="h-4 w-4" />
                    Mein Profil
                  </Link>
                  <Link
                    to="/einstellungen"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background p-4">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {MOBILE_NAV_ITEMS.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    isActive(item.href) && 'bg-accent text-accent-foreground font-semibold'
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="border-t border-border/40 mt-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleSignOut()
                }}
                className="flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
