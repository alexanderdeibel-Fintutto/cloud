import { Link, useLocation } from 'react-router-dom'
import { Swords, MessageCircle, FileText, Users, Menu, X, CreditCard, ScanSearch, Calculator } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'BescheidScan', href: '/scan', icon: ScanSearch },
  { name: 'KI-Berater', href: '/chat', icon: MessageCircle },
  { name: 'Rechner', href: '/rechner', icon: Calculator },
  { name: 'Dokumenten-Werkstatt', href: '/musterschreiben', icon: FileText },
  { name: 'Community', href: '/forum', icon: Users },
  { name: 'Preise', href: '/preise', icon: CreditCard },
]

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container flex items-center justify-between py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-boxer">
            <Swords className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg gradient-text-boxer">Bescheid</span>
            <span className="font-extrabold text-lg text-foreground/80">Boxer</span>
            <span className="text-xs block text-muted-foreground -mt-1">Dein KI-Assistent gegen falsche Bescheide</span>
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
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Anmelden</Link>
          </Button>
          <Button size="sm" variant="amt" asChild>
            <Link to="/register">Kostenlos starten</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-border">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Anmelden</Link>
              </Button>
              <Button className="w-full" variant="amt" asChild>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Kostenlos starten</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
