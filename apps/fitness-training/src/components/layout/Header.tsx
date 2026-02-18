import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dumbbell, User, Crown, Menu, X, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Header() {
  const { user, profile, subscriptionTier } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const tierBadge = {
    free: null,
    save_load: { label: 'Save', color: 'bg-blue-500/10 text-blue-600' },
    basic: { label: 'Basic', color: 'bg-primary/10 text-primary' },
    premium: { label: 'Premium', color: 'bg-amber-500/10 text-amber-600' },
  }[subscriptionTier]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-fitness">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">
            Fit<span className="gradient-text-fitness">Tutto</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/training', label: 'Training' },
            { to: '/exercises', label: 'Übungen' },
            { to: '/nutrition', label: 'Ernährung' },
            { to: '/progress', label: 'Fortschritt' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname.startsWith(to) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {tierBadge && (
            <span className={cn('hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold', tierBadge.color)}>
              <Crown className="h-3 w-3" />
              {tierBadge.label}
            </span>
          )}

          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm">Anmelden</Button>
            </Link>
          )}

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/training', label: 'Training' },
            { to: '/exercises', label: 'Übungen' },
            { to: '/nutrition', label: 'Ernährung' },
            { to: '/progress', label: 'Fortschritt' },
            { to: '/pricing', label: 'Preise' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
