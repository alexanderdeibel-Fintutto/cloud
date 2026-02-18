import { Link, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Apple, TrendingUp, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/training', icon: Dumbbell, label: 'Training' },
  { to: '/exercises', icon: LayoutGrid, label: 'Übungen' },
  { to: '/nutrition', icon: Apple, label: 'Ernährung' },
  { to: '/progress', icon: TrendingUp, label: 'Fortschritt' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'nav-tab flex-1',
                isActive && 'nav-tab-active'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px]', isActive ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
