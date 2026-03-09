import { useState, useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['Ctrl', 'K'], desc: 'Command Palette offnen' },
    { keys: ['/'], desc: 'Command Palette (Kurzform)' },
    { keys: ['N'], desc: 'Neues Dokument hochladen' },
    { keys: ['I'], desc: 'Eingangskorb' },
    { keys: ['D'], desc: 'Dokumente' },
    { keys: ['C'], desc: 'KI-Chat' },
    { keys: ['S'], desc: 'Statistiken' },
  ]},
  { category: 'Dokumente', items: [
    { keys: ['J'], desc: 'Nachstes Dokument' },
    { keys: ['K'], desc: 'Vorheriges Dokument' },
    { keys: ['E'], desc: 'Als erledigt markieren' },
    { keys: ['A'], desc: 'Archivieren' },
    { keys: ['Esc'], desc: 'Ansicht schliessen' },
  ]},
  { category: 'Allgemein', items: [
    { keys: ['?'], desc: 'Diese Hilfe anzeigen' },
    { keys: ['Ctrl', 'P'], desc: 'Seite drucken' },
  ]},
]

export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card rounded-t-2xl">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            Tastenkurzel
          </h2>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-4 space-y-6">
          {shortcuts.map(group => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, ki) => (
                        <span key={ki}>
                          {ki > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border border-border bg-muted text-[11px] font-mono font-medium">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">
            Drucke <kbd className="px-1 py-0.5 rounded border bg-muted text-[10px] font-mono">?</kbd> um diese Hilfe zu offnen/schliessen
          </p>
        </div>
      </div>
    </div>
  )
}
