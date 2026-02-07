import { Link, useLocation } from 'react-router-dom'
import { Swords, MessageCircle, FileText, Users, Menu, X, CreditCard, ScanSearch, Calculator, ClipboardList, User, Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import FristAlarm from '@/components/FristAlarm'
import { useTheme } from '@/contexts/ThemeContext'

const navigation = [
  { name: 'BescheidScan', href: '/scan', icon: ScanSearch },
  { name: 'KI-Berater', href: '/chat', icon: MessageCircle },
  { name: 'Rechner', href: '/rechner', icon: Calculator },
  { name: 'Dokumenten-Werkstatt', href: '/musterschreiben', icon: FileText },
  { name: 'Tracker', href: '/tracker', icon: ClipboardList },
  { name: 'Community', href: '/forum', icon: Users },
  { name: 'Preise', href: '/preise', icon: CreditCard },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }
  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title={theme === 'light' ? 'Hell (klick fuer Dunkel)' : theme === 'dark' ? 'Dunkel (klick fuer System)' : 'System (klick fuer Hell)'}
    >
      {theme === 'light' && <Sun className="h-4 w-4" />}
      {theme === 'dark' && <Moon className="h-4 w-4" />}
      {theme === 'system' && <Monitor className="h-4 w-4" />}
    </button>
  )
}

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container flex items-center justify-between py-3" aria-label="Hauptnavigation">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="BescheidBoxer Startseite">
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
          <FristAlarm />
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/profil" className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Profil
            </Link>
          </Button>
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
          aria-label={mobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
          aria-expanded={mobileMenuOpen}
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
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-muted-foreground">Erscheinungsbild</span>
                <ThemeToggle />
              </div>
              <Link
                to="/profil"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Mein Profil
              </Link>
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
