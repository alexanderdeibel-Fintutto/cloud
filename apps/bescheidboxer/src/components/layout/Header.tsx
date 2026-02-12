import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileSearch, Menu, X, Bell, ExternalLink, Settings, LogOut, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://portal.fintutto.cloud'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

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
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Link to="/">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link to="/bescheide">
            <Button variant="ghost" size="sm">Bescheide</Button>
          </Link>
          <Link to="/upload">
            <Button variant="ghost" size="sm">Upload</Button>
          </Link>
          <Link to="/fristen">
            <Button variant="ghost" size="sm">Fristen</Button>
          </Link>
          <Link to="/einspruch">
            <Button variant="ghost" size="sm">Einspruch</Button>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]" variant="destructive">
              3
            </Badge>
          </Button>

          {/* User menu (desktop) */}
          <div className="relative hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden lg:inline text-sm">
                {profile?.name || profile?.email || 'Benutzer'}
              </span>
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border bg-background shadow-lg z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{profile?.name || 'Benutzer'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/einstellungen"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Link>
                  <Link
                    to="/referral"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Freunde werben
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
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
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background p-4">
          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link to="/bescheide" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Bescheide</Button>
            </Link>
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Upload</Button>
            </Link>
            <Link to="/fristen" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Fristen</Button>
            </Link>
            <Link to="/einspruch" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Einspruch</Button>
            </Link>
            <Link to="/referral" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Freunde werben</Button>
            </Link>
            <Link to="/einstellungen" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Einstellungen</Button>
            </Link>
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
