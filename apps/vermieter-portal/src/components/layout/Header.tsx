import { Link, useLocation } from 'react-router-dom'
import { Building2, Calculator, FileText, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { CreditsDisplay } from '../CreditsDisplay'

const navigation = [
  { name: 'Rechner', href: '/rechner', icon: Calculator },
  { name: 'Formulare', href: '/formulare', icon: FileText },
  { name: 'Preise', href: '/preise', icon: null },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-vermieter">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg gradient-text-vermieter">Fintutto</span>
            <span className="text-xs block text-muted-foreground -mt-1">Vermieter-Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
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

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <CreditsDisplay />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/anmelden">Anmelden</Link>
          </Button>
          <Button size="sm" className="gradient-vermieter text-white border-0" asChild>
            <Link to="/registrieren">Kostenlos starten</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-muted ${
                  location.pathname.startsWith(item.href)
                    ? 'bg-accent text-accent-foreground'
                    : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full">
                Anmelden
              </Button>
              <Button className="w-full gradient-vermieter text-white border-0">
                Kostenlos starten
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
