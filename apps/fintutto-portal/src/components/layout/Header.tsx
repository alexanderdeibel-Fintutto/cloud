import { Link, useLocation } from 'react-router-dom'
 claude/improve-app-integration-k7JF2
import { Calculator, FileText, Shield, Menu, X, Sparkles, LayoutGrid, Gift, Search } from 'lucide-react'
import { useState } from 'react'

import { Calculator, FileText, Shield, Menu, X, Sparkles, LayoutGrid, Gift } from 'lucide-react'
import { useState, useEffect } from 'react'
 main
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { initTheme } from '@/lib/darkMode'

const navigation = [
  { name: 'Rechner', href: '/rechner', icon: Calculator, description: 'Für Vermieter' },
  { name: 'Checker', href: '/checker', icon: Shield, description: 'Für Mieter' },
  { name: 'Formulare', href: '/formulare', icon: FileText, description: 'Für alle' },
  { name: 'Preise', href: '/preise', icon: null, description: '' },
  { name: 'Apps', href: '/apps', icon: LayoutGrid, description: 'Alle Fintutto-Apps' },
  { name: 'Referral', href: '/referral', icon: Gift, description: 'Empfehlen & profitieren' },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => { initTheme() }, [])

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

        <div className="hidden md:flex items-center gap-3">
 claude/improve-app-integration-k7JF2
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg hover:bg-muted transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Suche</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border">
              Ctrl K
            </kbd>
          </button>

          <ThemeToggle />
 main
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Anmelden</Link>
          </Button>
          <Button size="sm" className="gradient-portal text-white border-0" asChild>
            <Link to="/register">Kostenlos starten</Link>
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-2">
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
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Anmelden</Link>
              </Button>
              <Button className="w-full gradient-portal text-white border-0" asChild>
                <Link to="/register">Kostenlos starten</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
