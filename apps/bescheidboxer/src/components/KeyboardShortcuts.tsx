import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Befehlspalette oeffnen' },
      { keys: ['?'], description: 'Tastenkuerzel anzeigen' },
      { keys: ['Esc'], description: 'Dialog schliessen' },
    ],
  },
  {
    title: 'Befehlspalette',
    shortcuts: [
      { keys: ['↑', '↓'], description: 'Navigieren' },
      { keys: ['↵'], description: 'Ausfuehren' },
      { keys: ['Esc'], description: 'Schliessen' },
    ],
  },
  {
    title: 'Allgemein',
    shortcuts: [
      { keys: ['Tab'], description: 'Naechstes Element' },
      { keys: ['Shift', 'Tab'], description: 'Vorheriges Element' },
      { keys: ['Space'], description: 'Button/Toggle aktivieren' },
    ],
  },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only open on "?" when no input is focused
      if (
        e.key === '?' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Tastenkuerzel">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-lg font-semibold">Tastenkuerzel</h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-muted transition-colors"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
            {SHORTCUT_GROUPS.map(group => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, kidx) => (
                          <span key={kidx}>
                            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 rounded border bg-muted px-1.5 text-xs font-mono">
                              {key}
                            </kbd>
                            {kidx < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t px-5 py-3 text-center">
            <p className="text-[10px] text-muted-foreground">
              Druecken Sie <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">?</kbd> um dieses Fenster zu oeffnen/schliessen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
