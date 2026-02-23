import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Dumbbell, Calendar, Apple, Scale,
  MoreHorizontal, BookOpen, Brain, User, History, CreditCard, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const MAIN_TABS: NavItem[] = [
  { label: 'Dashboard', href: '/fittutto/dashboard', icon: LayoutDashboard },
  { label: 'Training', href: '/fittutto/workout', icon: Dumbbell },
  { label: 'Plaene', href: '/fittutto/plan', icon: Calendar },
  { label: 'Ernaehrung', href: '/fittutto/ernaehrung', icon: Apple },
  { label: 'Koerper', href: '/fittutto/koerper', icon: Scale },
]

const MORE_ITEMS: NavItem[] = [
  { label: 'Uebungen', href: '/fittutto/uebungen', icon: BookOpen },
  { label: 'KI-Coach', href: '/fittutto/coach', icon: Brain },
  { label: 'Profil', href: '/fittutto/profil', icon: User },
  { label: 'Historie', href: '/fittutto/historie', icon: History },
  { label: 'Preise', href: '/fittutto/preise', icon: CreditCard },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/fittutto/dashboard') {
    return pathname === '/fittutto' || pathname === '/fittutto/dashboard'
  }
  return pathname.startsWith(href)
}

function isInMore(pathname: string): boolean {
  return MORE_ITEMS.some(item => pathname.startsWith(item.href))
}

export default function FitTuttoNav() {
  const { pathname } = useLocation()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* ========== DESKTOP: Horizontal Tab Bar ========== */}
      <nav className="hidden md:block sticky top-[73px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-1 overflow-x-auto">
            {MAIN_TABS.map(tab => {
              const Icon = tab.icon
              const active = isActive(pathname, tab.href)
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px]',
                    active
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-orange-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              )
            })}

            {/* More dropdown (desktop) */}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px]',
                  isInMore(pathname)
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-orange-200'
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
                Mehr
              </button>

              <AnimatePresence>
                {showMore && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 z-50 bg-background rounded-xl shadow-lg border border-border py-2 min-w-[200px]"
                    >
                      {MORE_ITEMS.map(item => {
                        const Icon = item.icon
                        const active = pathname.startsWith(item.href)
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setShowMore(false)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                              active
                                ? 'text-orange-600 bg-orange-50'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE: Bottom Tab Bar ========== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
        <div className="grid grid-cols-6 max-w-lg mx-auto">
          {MAIN_TABS.map(tab => {
            const Icon = tab.icon
            const active = isActive(pathname, tab.href)
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-1 text-center transition-colors',
                  active ? 'text-orange-500' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight truncate w-full">{tab.label}</span>
              </Link>
            )
          })}

          {/* More button (mobile) */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-1 text-center transition-colors',
              isInMore(pathname) ? 'text-orange-500' : 'text-muted-foreground'
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">Mehr</span>
          </button>
        </div>

        {/* Mobile "More" panel */}
        <AnimatePresence>
          {showMore && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowMore(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-xl"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <span className="font-semibold">Mehr</span>
                  <button onClick={() => setShowMore(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="py-2 pb-safe">
                  {MORE_ITEMS.map(item => {
                    const Icon = item.icon
                    const active = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setShowMore(false)}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3.5 text-sm transition-colors',
                          active
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile spacer so content isn't hidden behind bottom bar */}
      <div className="md:hidden h-16" />
    </>
  )
}
