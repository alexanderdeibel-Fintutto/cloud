import { useState, useEffect, useRef } from 'react'
import { StickyNote, X, Plus, Trash2, GripVertical, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'

const NOTES_KEY = 'sb-quick-notes'

interface QuickNote {
  id: string
  text: string
  color: string
  createdAt: string
  updatedAt: string
}

const COLORS = [
  { name: 'Gelb', value: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { name: 'Blau', value: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
  { name: 'Grün', value: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { name: 'Rosa', value: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' },
  { name: 'Lila', value: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' },
]

function loadNotes(): QuickNote[] {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveNotes(notes: QuickNote[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export default function QuickNotes() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [notes, setNotes] = useState<QuickNote[]>(loadNotes)
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const addNote = () => {
    const note: QuickNote = {
      id: crypto.randomUUID(),
      text: '',
      color: COLORS[notes.length % COLORS.length].value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes(prev => [note, ...prev])
    // Focus the new note after render
    setTimeout(() => textareaRefs.current.get(note.id)?.focus(), 50)
  }

  const updateNote = (id: string, text: string) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, text, updatedAt: new Date().toISOString() } : n
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const changeColor = (id: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n
      const currentIdx = COLORS.findIndex(c => c.value === n.color)
      const nextColor = COLORS[(currentIdx + 1) % COLORS.length].value
      return { ...n, color: nextColor }
    }))
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-yellow-400 dark:bg-yellow-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center no-print group"
        title="Quick Notes"
      >
        <StickyNote className="w-5 h-5 text-yellow-900 dark:text-yellow-100" />
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 no-print transition-all ${
      minimized ? 'w-64' : 'w-80'
    }`}>
      <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold">Quick Notes</span>
            {notes.length > 0 && (
              <span className="text-[10px] text-muted-foreground">({notes.length})</span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={addNote} title="Neue Notiz">
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMinimized(!minimized)}>
              {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        {!minimized && (
          <div className="max-h-[50vh] overflow-y-auto p-2 space-y-2">
            {notes.length === 0 ? (
              <div className="py-8 text-center">
                <StickyNote className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-2">Keine Notizen</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={addNote}>
                  <Plus className="w-3 h-3 mr-1" /> Notiz erstellen
                </Button>
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`rounded-lg border p-2 transition-colors ${note.color}`}
                >
                  <textarea
                    ref={el => { if (el) textareaRefs.current.set(note.id, el) }}
                    value={note.text}
                    onChange={e => updateNote(note.id, e.target.value)}
                    placeholder="Notiz schreiben..."
                    className="w-full bg-transparent text-xs resize-none outline-none min-h-[60px] placeholder:text-muted-foreground/60"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => changeColor(note.id)}
                        className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Farbe ändern"
                      >
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 via-blue-400 to-pink-400" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-0.5 rounded hover:bg-destructive/20 text-destructive/60 hover:text-destructive transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
