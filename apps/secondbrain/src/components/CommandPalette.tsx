import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Upload, MessageSquare, Inbox, Building2, CalendarClock,
  FolderOpen, Star, Clock, Settings, BarChart3, ArrowRight, Brain, X,
  Download, Moon, Sun, Printer,
} from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'

interface CommandItem {
  id: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  action: () => void
  category: 'page' | 'document' | 'action'
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data: documents = [] } = useDocuments()

  // Open on Ctrl+K or /
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault()
          setOpen(true)
        }
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const pages: CommandItem[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: <Brain className="w-4 h-4" />, action: () => go('/'), category: 'page' },
    { id: 'inbox', label: 'Eingangskorb', sublabel: 'Neue Dokumente bearbeiten', icon: <Inbox className="w-4 h-4" />, action: () => go('/eingang'), category: 'page' },
    { id: 'docs', label: 'Dokumente', sublabel: 'Alle Dokumente anzeigen', icon: <FileText className="w-4 h-4" />, action: () => go('/dokumente'), category: 'page' },
    { id: 'upload', label: 'Scannen / Upload', sublabel: 'Neues Dokument hochladen', icon: <Upload className="w-4 h-4" />, action: () => go('/upload'), category: 'page' },
    { id: 'chat', label: 'KI-Chat', sublabel: 'Frag dein SecondBrain', icon: <MessageSquare className="w-4 h-4" />, action: () => go('/chat'), category: 'page' },
    { id: 'search', label: 'Volltextsuche', sublabel: 'Dokumente durchsuchen', icon: <Search className="w-4 h-4" />, action: () => go('/suche'), category: 'page' },
    { id: 'companies', label: 'Firmen', sublabel: 'Firmenverwaltung', icon: <Building2 className="w-4 h-4" />, action: () => go('/firmen'), category: 'page' },
    { id: 'deadlines', label: 'Fristen', sublabel: 'Fristen & Termine', icon: <CalendarClock className="w-4 h-4" />, action: () => go('/fristen'), category: 'page' },
    { id: 'collections', label: 'Sammlungen', icon: <FolderOpen className="w-4 h-4" />, action: () => go('/sammlungen'), category: 'page' },
    { id: 'favorites', label: 'Favoriten', icon: <Star className="w-4 h-4" />, action: () => go('/favoriten'), category: 'page' },
    { id: 'history', label: 'Verlauf', icon: <Clock className="w-4 h-4" />, action: () => go('/verlauf'), category: 'page' },
    { id: 'analytics', label: 'Statistiken', sublabel: 'Analysen & Export', icon: <BarChart3 className="w-4 h-4" />, action: () => go('/statistiken'), category: 'page' },
    { id: 'settings', label: 'Einstellungen', icon: <Settings className="w-4 h-4" />, action: () => go('/einstellungen'), category: 'page' },
  ], [])

  const docItems: CommandItem[] = useMemo(() =>
    documents.slice(0, 50).map(doc => {
      const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
      return {
        id: `doc-${doc.id}`,
        label: doc.title,
        sublabel: typeInfo.label + (doc.sender ? ` — ${doc.sender}` : ''),
        icon: <FileText className="w-4 h-4" />,
        action: () => go(`/dokumente/${doc.id}`),
        category: 'document' as const,
      }
    }),
    [documents]
  )

  const actions: CommandItem[] = useMemo(() => [
    {
      id: 'action-upload', label: 'Neues Dokument hochladen', sublabel: 'Scannen & KI-Analyse starten',
      icon: <Upload className="w-4 h-4" />, action: () => go('/upload'), category: 'action',
    },
    {
      id: 'action-darkmode', label: 'Dark Mode umschalten',
      icon: <Moon className="w-4 h-4" />,
      action: () => { document.documentElement.classList.toggle('dark'); setOpen(false) },
      category: 'action',
    },
    {
      id: 'action-print', label: 'Seite drucken',
      icon: <Printer className="w-4 h-4" />,
      action: () => { setOpen(false); setTimeout(() => window.print(), 200) },
      category: 'action',
    },
    {
      id: 'action-export', label: 'CSV Export',  sublabel: 'Alle Dokumente exportieren',
      icon: <Download className="w-4 h-4" />,
      action: () => go('/statistiken'),
      category: 'action',
    },
  ], [])

  const allItems = useMemo(() => [...pages, ...actions, ...docItems], [pages, actions, docItems])

  const filtered = useMemo(() => {
    if (!query.trim()) return [...pages.slice(0, 8), ...actions.slice(0, 3)]
    const q = query.toLowerCase()
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel?.toLowerCase().includes(q)
    ).slice(0, 12)
  }, [query, allItems, pages])

  // Reset index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[selectedIndex]?.action()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  const categoryLabels: Record<string, string> = {
    page: 'Seiten',
    document: 'Dokumente',
    action: 'Aktionen',
  }

  // Group by category
  const grouped: { category: string; items: CommandItem[] }[] = []
  const seen = new Set<string>()
  filtered.forEach(item => {
    if (!seen.has(item.category)) {
      seen.add(item.category)
      grouped.push({ category: item.category, items: [] })
    }
    grouped.find(g => g.category === item.category)!.items.push(item)
  })

  let globalIndex = -1

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[91] w-full max-w-xl">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Seite, Dokument oder Aktion suchen..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
            />
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Keine Ergebnisse für "{query}"
              </div>
            ) : (
              grouped.map(group => (
                <div key={group.category}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                    {categoryLabels[group.category] || group.category}
                  </p>
                  {group.items.map(item => {
                    globalIndex++
                    const idx = globalIndex
                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          idx === selectedIndex
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <span className={idx === selectedIndex ? 'text-primary' : 'text-muted-foreground'}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.sublabel && (
                            <p className="text-[11px] text-muted-foreground truncate">{item.sublabel}</p>
                          )}
                        </div>
                        {idx === selectedIndex && (
                          <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            <span><kbd className="font-mono bg-muted px-1 rounded">↑↓</kbd> Navigieren</span>
            <span><kbd className="font-mono bg-muted px-1 rounded">↵</kbd> Öffnen</span>
            <span><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> Schließen</span>
          </div>
        </div>
      </div>
    </>
  )
}
