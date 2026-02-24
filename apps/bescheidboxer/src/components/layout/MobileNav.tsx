import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, Clock, ShieldAlert } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Bescheide', href: '/bescheide', icon: FileText },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Fristen', href: '/fristen', icon: Clock },
  { label: 'Einspruch', href: '/einspruch', icon: ShieldAlert },
]

export default function MobileNav() {
  const location = useLocation()
  const { fristen } = useBescheidContext()

  const openFristen = fristen.filter(f => !f.erledigt).length

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          const showBadge = href === '/fristen' && openFristen > 0

          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                    {openFristen}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px]', active ? 'font-semibold' : 'font-medium')}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
