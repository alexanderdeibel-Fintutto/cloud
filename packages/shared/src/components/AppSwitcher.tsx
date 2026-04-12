import { useState, useEffect, useRef } from 'react'
import { FINTUTTO_APPS, APP_CATEGORIES, type AppCategory } from '../apps'

interface AppSwitcherProps {
  currentAppSlug: string
}

export function AppSwitcher({ currentAppSlug }: AppSwitcherProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const apps = Object.entries(FINTUTTO_APPS).filter(([_, app]) => app.slug !== currentAppSlug)
  const grouped = Object.entries(APP_CATEGORIES).map(([key, label]) => ({
    key: key as AppCategory,
    label,
    apps: apps.filter(([_, app]) => app.category === key),
  })).filter(g => g.apps.length > 0)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: open ? 'var(--primary, #6366f1)' : 'var(--muted-foreground, #64748b)',
          backgroundColor: open ? 'var(--accent, #f1f5f9)' : 'transparent',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = 'var(--accent, #f1f5f9)'
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="Alle Fintutto-Apps anzeigen"
      >
        <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Apps
        <svg style={{ width: '0.625rem', height: '0.625rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.5rem',
            width: '420px',
            maxHeight: '70vh',
            overflowY: 'auto',
            backgroundColor: 'var(--background, white)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            zIndex: 9998,
            padding: '0.75rem',
          }}
        >
          {grouped.map((group) => (
            <div key={group.key} style={{ marginBottom: '0.75rem' }}>
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--muted-foreground, #9ca3af)',
                padding: '0.25rem 0.5rem',
                marginBottom: '0.25rem',
              }}>
                {group.label}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.25rem',
              }}>
                {group.apps.map(([key, app]) => (
                  <a
                    key={key}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent, #f1f5f9)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setOpen(false)}
                  >
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{app.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.name}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground, #9ca3af)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.description}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
