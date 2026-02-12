import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, Menu, X, Bell } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          </nav>
        </div>
      )}
    </header>
  )
}
