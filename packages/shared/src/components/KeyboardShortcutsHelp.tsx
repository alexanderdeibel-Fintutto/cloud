import { useState, useEffect } from 'react'

interface Shortcut {
  keys: string[]
  description: string
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'Suche öffnen' },
  { keys: ['Esc'], description: 'Zurück zur Übersicht' },
  { keys: ['?'], description: 'Tastenkürzel anzeigen' },
]

/**
 * A keyboard shortcuts help overlay that opens when the user presses "?".
 * Shows available keyboard shortcuts in a modal dialog.
 *
 * Usage: <KeyboardShortcutsHelp /> — place once in the layout
 */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Tastenkürzel"
    >
      <div
        style={{
          background: 'var(--card, #fff)',
          color: 'var(--foreground, #0f172a)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid var(--border, #e2e8f0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Tastenkürzel</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Schließen"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--muted-foreground, #64748b)',
              fontSize: '1.25rem',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.description}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--foreground, #0f172a)' }}>
                {shortcut.description}
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '1.5rem',
                      height: '1.5rem',
                      padding: '0 0.375rem',
                      fontSize: '0.75rem',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      borderRadius: '0.25rem',
                      border: '1px solid var(--border, #e2e8f0)',
                      background: 'var(--muted, #f1f5f9)',
                      color: 'var(--muted-foreground, #64748b)',
                      boxShadow: '0 1px 0 var(--border, #e2e8f0)',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted-foreground, #94a3b8)',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          Drücke ? um diese Hilfe ein-/auszublenden
        </p>
      </div>
    </div>
  )
}
