import { Link } from 'react-router-dom'
import { Menu, X, User, LogOut, FileText } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const checkerLinks = [
    { name: 'Mietpreisbremse', href: '/checker/mietpreisbremse' },
    { name: 'Mieterhoehung', href: '/checker/mieterhoehung' },
    { name: 'Nebenkosten', href: '/checker/nebenkosten' },
    { name: 'Betriebskosten', href: '/checker/betriebskosten' },
    { name: 'Kuendigung', href: '/checker/kuendigung' },
    { name: 'Kaution', href: '/checker/kaution' },
    { name: 'Mietminderung', href: '/checker/mietminderung' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-fintutto-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">Fintutto</span>
              <span className="text-fintutto-primary font-semibold ml-1">Mieterportal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button className="text-gray-600 hover:text-fintutto-primary font-medium flex items-center">
                Checker
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                <Link
                  to="/checker"
                  className="block px-4 py-2 text-sm font-semibold text-fintutto-primary hover:bg-fintutto-light border-b border-gray-100"
                >
                  Alle Checker anzeigen
                </Link>
                {checkerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-fintutto-light hover:text-fintutto-primary"
                  >
                    {link.name}-Checker
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/formulare"
              className="text-gray-600 hover:text-fintutto-primary font-medium"
            >
              Formulare
            </Link>

            {user && (
              <Link
                to="/meine-dokumente"
                className="text-gray-600 hover:text-fintutto-primary font-medium flex items-center"
              >
                <FileText className="w-4 h-4 mr-1" />
                Meine Dokumente
              </Link>
            )}

            <Link
              to="/preise"
              className="text-gray-600 hover:text-fintutto-primary font-medium"
            >
              Preise
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
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
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="space-y-2">
              <Link
                to="/checker"
                className="block px-4 py-2 font-semibold text-fintutto-primary hover:bg-fintutto-light rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Alle Checker
              </Link>
              {checkerLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-2 pl-6 text-gray-700 hover:bg-fintutto-light rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}-Checker
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                to="/formulare"
                className="block px-4 py-2 text-gray-700 hover:bg-fintutto-light rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Formulare
              </Link>
              {user && (
                <Link
                  to="/meine-dokumente"
                  className="block px-4 py-2 text-gray-700 hover:bg-fintutto-light rounded-lg flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Meine Dokumente
                </Link>
              )}
              <Link
                to="/preise"
                className="block px-4 py-2 text-gray-700 hover:bg-fintutto-light rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Preise
              </Link>
              <hr className="my-2" />
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-700 hover:bg-fintutto-light rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 bg-fintutto-primary text-white rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kostenlos starten
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
