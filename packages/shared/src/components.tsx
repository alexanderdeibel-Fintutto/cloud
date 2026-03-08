import React, { Component, type ReactNode } from 'react'

// ─── ErrorBoundary ───────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Etwas ist schiefgelaufen.</p>
          <button className="mt-4 text-sm underline" onClick={() => this.setState({ hasError: false })}>
            Erneut versuchen
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── PageSkeleton ────────────────────────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="container py-12 animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-96 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-foreground transition-colors">{item.label}</a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// ─── RecentToolsWidget ───────────────────────────────────────────────────────

export function RecentToolsWidget({ tools }: { tools?: string[] }) {
  if (!tools || tools.length === 0) return null
  return (
    <div className="text-sm text-muted-foreground">
      <p className="font-medium mb-2">Zuletzt verwendet</p>
      <div className="flex flex-wrap gap-2">
        {tools.map(t => (
          <span key={t} className="bg-muted px-2 py-1 rounded text-xs">{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── ShareResultButton ──────────────────────────────────────────────────────

export function ShareResultButton({ title, text }: { title?: string; text?: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, text, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Teilen
    </button>
  )
}

// ─── CrossAppRecommendations ────────────────────────────────────────────────

export function CrossAppRecommendations({ currentTool }: { currentTool?: string }) {
  return null // Rendered conditionally based on ecosystem context
}

// ─── AnnouncementBanner ─────────────────────────────────────────────────────

export function AnnouncementBanner({ message, href }: { message?: string; href?: string }) {
  if (!message) return null
  return (
    <div className="bg-primary/10 text-primary text-center py-2 text-sm">
      {href ? <a href={href} className="underline">{message}</a> : message}
    </div>
  )
}

// ─── EcosystemStatsBar ──────────────────────────────────────────────────────

export function EcosystemStatsBar() {
  return null // Stats loaded dynamically
}

// ─── CommandPalette ─────────────────────────────────────────────────────────

interface ToolDef {
  id: string
  label: string
  href: string
  category?: string
}

export function CommandPalette({ tools }: { tools?: ToolDef[] }) {
  return null // Activated via keyboard shortcut
}

// ─── PrintStyles ────────────────────────────────────────────────────────────

export function PrintStyles() {
  return (
    <style>{`
      @media print {
        nav, footer, .no-print { display: none !important; }
        body { font-size: 12pt; }
      }
    `}</style>
  )
}

// ─── KeyboardShortcutsHelp ──────────────────────────────────────────────────

export function KeyboardShortcutsHelp() {
  return null // Shown via modal
}

// ─── AppSwitcher ────────────────────────────────────────────────────────────

export function AppSwitcher({ currentApp }: { currentApp?: string }) {
  return null // Dropdown rendered in header
}
