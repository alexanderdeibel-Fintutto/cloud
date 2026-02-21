import { Link, useLocation } from 'react-router-dom'
 claude/fitness-training-app-nf0CN
 claude/fitness-training-app-nf0CN
import { Calculator, FileText, Shield, Menu, X, Sparkles, LayoutGrid, Gift, User, LogOut, Dumbbell } from 'lucide-react'

import { Calculator, FileText, Shield, Menu, X, Sparkles, LayoutGrid, Gift, User, LogOut } from 'lucide-react'
 main
 main

import { Calculator, FileText, Shield, Menu, X, Sparkles, LayoutGrid, Gift, User, LogOut, Search } from 'lucide-react'
 main
import { useState } from 'react'
import { modKey } from '@fintutto/shared'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Rechner', href: '/rechner', icon: Calculator, description: 'Fuer Vermieter' },
  { name: 'Checker', href: '/checker', icon: Shield, description: 'Fuer Mieter' },
  { name: 'Formulare', href: '/formulare', icon: FileText, description: 'Fuer alle' },
  { name: 'FitTutto', href: '/fittutto', icon: Dumbbell, description: 'Fitness & Training' },
  { name: 'Preise', href: '/preise', icon: null, description: '' },
  { name: 'Apps', href: '/apps', icon: LayoutGrid, description: 'Alle Fintutto-Apps' },
  { name: 'Referral', href: '/referral', icon: Gift, description: 'Empfehlen & profitieren' },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-portal">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg gradient-text-portal">Fintutto</span>
            <span className="text-xs block text-muted-foreground -mt-1">Portal</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link flex items-center gap-1.5 ${
                location.pathname.startsWith(item.href) ? 'nav-link-active' : ''
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search + Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Suche</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 rounded border">
              {modKey()} K
            </kbd>
          </button>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-fintutto-primary">
                <User className="w-5 h-5" />
                <span>{profile?.name || user.email}</span>
              </Link>
              {profile && (
                <span className="text-xs bg-fintutto-light text-fintutto-primary px-2 py-1 rounded-full">
                  {profile.checksUsed}/{profile.checksLimit === -1 ? 'unbegrenzt' : profile.checksLimit} Checks
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Anmelden</Link>
              </Button>
              <Button variant="fintutto" asChild>
                <Link to="/register">Kostenlos starten</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setTimeout(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })), 100)
              }}
              className="flex items-center gap-2 w-full p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm"
            >
              <Search className="h-4 w-4" />
              Tool suchen...
            </button>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-muted ${
                  location.pathname.startsWith(item.href) ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>{profile?.name || user.email}</span>
                </Link>
                <Button variant="ghost" size="sm" className="w-full" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Anmelden</Link>
                </Button>
                <Button className="w-full gradient-portal text-white border-0" asChild>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Kostenlos starten</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
