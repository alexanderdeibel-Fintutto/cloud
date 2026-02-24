import { Languages, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Übersetzer', path: '/' },
  { label: 'Live', path: '/live' },
  { label: 'Info', path: '/info' },
]

export default function Header() {
  const location = useLocation()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') setIsDark(true)
    else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDark(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg gradient-translator flex items-center justify-center">
            <Languages className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="hidden sm:inline">Fintutto <span className="gradient-text-translator">Translator</span></span>
        </Link>

        <nav className="flex items-center gap-1 ml-4">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? 'Heller Modus' : 'Dunkler Modus'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
