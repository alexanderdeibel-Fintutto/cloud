import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../utils'

interface SidebarItem {
  icon: React.ReactNode
  label: string
  path: string
  badge?: string
}

interface AppShellProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  bottomNavItems?: SidebarItem[]
  logo?: React.ReactNode
  appName: string
  headerRight?: React.ReactNode
  className?: string
}

/**
 * AppShell — Layout-Rahmen für alle Fintutto-Apps.
 * Desktop: Sidebar links + Content rechts
 * Mobile: Content + BottomNav unten
 */
export function AppShell({
  children,
  sidebarItems,
  bottomNavItems,
  logo,
  appName,
  headerRight,
  className,
}: AppShellProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          {logo}
          <span className="text-lg font-bold">{appName}</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-card shadow-xl">
            <div className="flex h-16 items-center gap-2 border-b px-4">
              {logo}
              <span className="text-lg font-bold">{appName}</span>
            </div>
            <nav className="p-3">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="md:hidden flex items-center gap-2">
            {logo}
            <span className="font-bold">{appName}</span>
          </div>
          <div className="hidden md:block" />
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </header>

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto p-4 md:p-6',
          bottomNavItems ? 'pb-20 md:pb-6' : ''
        )}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      {bottomNavItems && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card md:hidden safe-area-bottom">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
