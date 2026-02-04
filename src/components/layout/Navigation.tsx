'use client'

import { Link, useLocation } from 'react-router-dom'
import { Home, FileText, Calculator, FolderOpen, HelpCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/meine-dokumente', label: 'Meine Dokumente', icon: FolderOpen },
  { to: '/hilfe', label: 'Hilfe', icon: HelpCircle },
]

const formularLinks = [
  { to: '/formulare/mietvertrag', label: 'Mietvertrag' },
  { to: '/formulare/kuendigung', label: 'Kündigung' },
  { to: '/formulare/uebergabeprotokoll', label: 'Übergabeprotokoll' },
  { to: '/formulare/betriebskosten', label: 'Betriebskosten' },
  { to: '/formulare/mieterhoehung', label: 'Mieterhöhung' },
  { to: '/formulare/maengelanzeige', label: 'Mängelanzeige' },
  { to: '/formulare/selbstauskunft', label: 'Selbstauskunft' },
  { to: '/formulare/untermietvertrag', label: 'Untermietvertrag' },
]

const rechnerLinks = [
  { to: '/rechner/mietpreis', label: 'Mietpreisrechner' },
  { to: '/rechner/nebenkosten', label: 'Nebenkostenrechner' },
  { to: '/rechner/kaution', label: 'Kautionsrechner' },
  { to: '/rechner/kuendigungsfrist', label: 'Kündigungsfrist' },
]

export function Navigation() {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Mietrecht Formulare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={pathname === item.to ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Formulare Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Formulare
              </Button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white border rounded-lg shadow-lg p-2 min-w-[200px]">
                  {formularLinks.map((link) => (
                    <Link key={link.to} to={link.to}>
                      <Button
                        variant={pathname === link.to ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Rechner Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calculator className="h-4 w-4" />
                Rechner
              </Button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white border rounded-lg shadow-lg p-2 min-w-[200px]">
                  {rechnerLinks.map((link) => (
                    <Link key={link.to} to={link.to}>
                      <Button
                        variant={pathname === link.to ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {/* Main Links */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={pathname === item.to ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Formulare */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">FORMULARE</p>
                <div className="space-y-1">
                  {formularLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={pathname === link.to ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rechner */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">RECHNER</p>
                <div className="space-y-1">
                  {rechnerLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={pathname === link.to ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
