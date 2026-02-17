import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Upload,
  Search,
  Clock,
  ShieldAlert,
  Settings,
  HelpCircle,
  Users,
  Moon,
  Sun,
  Type,
  Download,
  BarChart3,
  ArrowLeftRight,
  CalendarDays,
  Calculator,
  User,
  Building2,
  ClipboardCheck,
  FileStack,
  CreditCard,
  FolderUp,
  FileDown,
  Archive,
  Zap,
  PieChart,
  FolderOpen,
  Bell,
  Sparkles,
  Activity,
  Lightbulb,
  LifeBuoy,
  FolderDown,
  Home,
} from 'lucide-react'
import { useBescheidContext } from '../contexts/BescheidContext'
import { useTheme } from '../contexts/ThemeContext'
import { exportBescheideAsCsv } from '../lib/csv-export'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
  category: 'navigation' | 'aktion' | 'einstellung'
}

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  aktion: 'Aktionen',
  einstellung: 'Einstellungen',
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { bescheide } = useBescheidContext()
  const { theme, setTheme, fontSize, setFontSize } = useTheme()

  const runAndClose = useCallback((fn: () => void) => {
    fn()
    setOpen(false)
    setQuery('')
  }, [])

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Zur Uebersicht', icon: LayoutDashboard, category: 'navigation', keywords: ['home', 'start', 'uebersicht'], action: () => runAndClose(() => navigate('/')) },
    { id: 'nav-bescheide', label: 'Bescheide', description: 'Alle Steuerbescheide', icon: FileText, category: 'navigation', keywords: ['steuer', 'liste'], action: () => runAndClose(() => navigate('/bescheide')) },
    { id: 'nav-upload', label: 'Bescheid hochladen', description: 'Neuen Bescheid hochladen', icon: Upload, category: 'navigation', keywords: ['neu', 'pdf', 'foto', 'dokument'], action: () => runAndClose(() => navigate('/upload')) },
    { id: 'nav-analyse', label: 'Analyse', description: 'Bescheid pruefen lassen', icon: Search, category: 'navigation', keywords: ['ki', 'pruefen', 'check'], action: () => runAndClose(() => navigate('/analyse')) },
    { id: 'nav-fristen', label: 'Fristen', description: 'Fristen & Termine', icon: Clock, category: 'navigation', keywords: ['termin', 'deadline', 'ablauf'], action: () => runAndClose(() => navigate('/fristen')) },
    { id: 'nav-kalender', label: 'Steuer-Kalender', description: 'Kalenderansicht fuer Fristen', icon: CalendarDays, category: 'navigation', keywords: ['kalender', 'monat', 'termin', 'calendar'], action: () => runAndClose(() => navigate('/kalender')) },
    { id: 'nav-einspruch', label: 'Einspruch', description: 'Einsprueche verwalten', icon: ShieldAlert, category: 'navigation', keywords: ['widerspruch', 'beschwerde'], action: () => runAndClose(() => navigate('/einspruch')) },
    { id: 'nav-referral', label: 'Freunde werben', description: 'Referral-Programm', icon: Users, category: 'navigation', keywords: ['empfehlung', 'werben', 'bonus'], action: () => runAndClose(() => navigate('/referral')) },
    { id: 'nav-hilfe', label: 'Hilfe & Glossar', description: 'Steuer-Begriffe erklaert', icon: HelpCircle, category: 'navigation', keywords: ['faq', 'glossar', 'hilfe', 'erklaerung'], action: () => runAndClose(() => navigate('/hilfe')) },
    { id: 'nav-jahresbericht', label: 'Jahresbericht', description: 'Jaehrliche Zusammenfassung', icon: BarChart3, category: 'navigation', keywords: ['bericht', 'zusammenfassung', 'statistik', 'report'], action: () => runAndClose(() => navigate('/jahresbericht')) },
    { id: 'nav-vergleich', label: 'Bescheid-Vergleich', description: 'Zwei Bescheide vergleichen', icon: ArrowLeftRight, category: 'navigation', keywords: ['vergleich', 'vergleichen', 'gegenueber', 'diff'], action: () => runAndClose(() => navigate('/vergleich')) },
    { id: 'nav-rechner', label: 'Steuer-Rechner', description: 'Einkommensteuer berechnen', icon: Calculator, category: 'navigation', keywords: ['rechner', 'calculator', 'berechnen', 'steuer', 'einkommen'], action: () => runAndClose(() => navigate('/steuerrechner')) },
    { id: 'nav-suche', label: 'Suche', description: 'Alles durchsuchen', icon: Search, category: 'navigation', keywords: ['suche', 'suchen', 'finden', 'search'], action: () => runAndClose(() => navigate('/suche')) },
    { id: 'nav-profil', label: 'Mein Profil', description: 'Profil & Statistiken', icon: User, category: 'navigation', keywords: ['profil', 'konto', 'account', 'benutzer'], action: () => runAndClose(() => navigate('/profil')) },
    { id: 'nav-vorlagen', label: 'Einspruch-Vorlagen', description: 'Professionelle Einspruch-Templates', icon: FileStack, category: 'navigation', keywords: ['vorlage', 'template', 'einspruch', 'muster'], action: () => runAndClose(() => navigate('/einspruch/vorlagen')) },
    { id: 'nav-checkliste', label: 'Steuer-Checkliste', description: 'Schritt-fuer-Schritt Pruefung', icon: ClipboardCheck, category: 'navigation', keywords: ['checkliste', 'todo', 'schritte', 'pruefung'], action: () => runAndClose(() => navigate('/checkliste')) },
    { id: 'nav-finanzaemter', label: 'Finanzamt-Verzeichnis', description: 'Finanzaemter finden', icon: Building2, category: 'navigation', keywords: ['finanzamt', 'verzeichnis', 'adresse', 'kontakt', 'telefon'], action: () => runAndClose(() => navigate('/finanzaemter')) },
    { id: 'nav-upgrade', label: 'Upgrade', description: 'Tarife & Preise', icon: CreditCard, category: 'navigation', keywords: ['upgrade', 'premium', 'pro', 'tarif', 'preis', 'abo'], action: () => runAndClose(() => navigate('/upgrade')) },
    { id: 'nav-mehrfach', label: 'Mehrfach-Upload', description: 'Mehrere Bescheide hochladen', icon: FolderUp, category: 'navigation', keywords: ['mehrfach', 'batch', 'multi', 'upload', 'drag', 'drop'], action: () => runAndClose(() => navigate('/mehrfach-upload')) },
    { id: 'nav-bericht', label: 'Bericht exportieren', description: 'Steuerbericht erstellen', icon: FileDown, category: 'navigation', keywords: ['bericht', 'export', 'pdf', 'drucken', 'report'], action: () => runAndClose(() => navigate('/bericht')) },
    { id: 'nav-archiv', label: 'Archiv', description: 'Abgeschlossene Bescheide', icon: Archive, category: 'navigation', keywords: ['archiv', 'erledigt', 'abgeschlossen', 'alt', 'history'], action: () => runAndClose(() => navigate('/archiv')) },
    { id: 'nav-schnell', label: 'Schnellerfassung', description: 'Bescheid schnell anlegen', icon: Zap, category: 'navigation', keywords: ['schnell', 'neu', 'anlegen', 'erfassen', 'wizard', 'quick'], action: () => runAndClose(() => navigate('/schnellerfassung')) },
    { id: 'nav-statistik', label: 'Statistiken', description: 'Charts & Auswertungen', icon: PieChart, category: 'navigation', keywords: ['statistik', 'chart', 'auswertung', 'analytics', 'diagramm'], action: () => runAndClose(() => navigate('/statistiken')) },
    { id: 'nav-dokumente', label: 'Dokumente', description: 'Alle hochgeladenen Dateien', icon: FolderOpen, category: 'navigation', keywords: ['dokument', 'datei', 'file', 'pdf', 'bild', 'foto'], action: () => runAndClose(() => navigate('/dokumente')) },
    { id: 'nav-benachrichtigungen', label: 'Benachrichtigungen', description: 'Alle Nachrichten', icon: Bell, category: 'navigation', keywords: ['benachrichtigung', 'nachricht', 'notification', 'alarm', 'glocke'], action: () => runAndClose(() => navigate('/benachrichtigungen')) },
    { id: 'nav-onboarding', label: 'Einfuehrung', description: 'App-Tour starten', icon: Sparkles, category: 'navigation', keywords: ['onboarding', 'tour', 'einfuehrung', 'willkommen', 'hilfe', 'start'], action: () => runAndClose(() => navigate('/onboarding')) },
    { id: 'nav-aktivitaeten', label: 'Aktivitaeten', description: 'Aktivitaets-Protokoll', icon: Activity, category: 'navigation', keywords: ['aktivitaet', 'protokoll', 'timeline', 'verlauf', 'log'], action: () => runAndClose(() => navigate('/aktivitaeten')) },
    { id: 'nav-steuer-tipps', label: 'Steuer-Tipps', description: 'Tipps zur Steuerersparnis', icon: Lightbulb, category: 'navigation', keywords: ['tipp', 'steuer', 'sparen', 'ratgeber', 'hinweis'], action: () => runAndClose(() => navigate('/steuer-tipps')) },
    { id: 'nav-kontakt', label: 'Kontakt & Support', description: 'Hilfe & FAQ', icon: LifeBuoy, category: 'navigation', keywords: ['kontakt', 'support', 'hilfe', 'faq', 'frage', 'telefon', 'email'], action: () => runAndClose(() => navigate('/kontakt')) },
    { id: 'nav-daten-export', label: 'Daten-Export', description: 'Daten herunterladen', icon: FolderDown, category: 'navigation', keywords: ['export', 'daten', 'download', 'csv', 'json', 'pdf', 'herunterladen'], action: () => runAndClose(() => navigate('/daten-export')) },
    { id: 'nav-immobilien', label: 'Immobilien', description: 'Immobilien verwalten', icon: Home, category: 'navigation', keywords: ['immobilie', 'haus', 'wohnung', 'gebaeude', 'property'], action: () => runAndClose(() => navigate('/immobilien')) },
    { id: 'nav-mieterbereich', label: 'Mieterbereich', description: 'Mieter Self-Service', icon: Users, category: 'navigation', keywords: ['mieter', 'tenant', 'wohnung', 'zaehler', 'meldung'], action: () => runAndClose(() => navigate('/mieterbereich')) },
    { id: 'nav-settings', label: 'Einstellungen', description: 'Konto & Einstellungen', icon: Settings, category: 'navigation', keywords: ['einstellungen', 'konto', 'passwort'], action: () => runAndClose(() => navigate('/einstellungen')) },

    // Aktionen
    { id: 'act-export', label: 'Bescheide exportieren', description: 'Als CSV herunterladen', icon: Download, category: 'aktion', keywords: ['csv', 'download', 'export', 'excel'], action: () => runAndClose(() => exportBescheideAsCsv(bescheide)) },

    // Einstellungen
    { id: 'set-dark', label: 'Dunkles Design', description: theme === 'dark' ? 'Aktiv' : 'Aktivieren', icon: Moon, category: 'einstellung', keywords: ['dark', 'dunkel', 'nacht'], action: () => runAndClose(() => setTheme('dark')) },
    { id: 'set-light', label: 'Helles Design', description: theme === 'light' ? 'Aktiv' : 'Aktivieren', icon: Sun, category: 'einstellung', keywords: ['light', 'hell', 'tag'], action: () => runAndClose(() => setTheme('light')) },
    { id: 'set-font-large', label: 'Grosse Schrift', description: fontSize === 'large' ? 'Aktiv' : 'Aktivieren', icon: Type, category: 'einstellung', keywords: ['schrift', 'gross', 'font', 'accessibility'], action: () => runAndClose(() => setFontSize(fontSize === 'large' ? 'normal' : 'large')) },
    { id: 'set-font-xlarge', label: 'Sehr grosse Schrift', description: fontSize === 'xlarge' ? 'Aktiv' : 'Aktivieren', icon: Type, category: 'einstellung', keywords: ['schrift', 'sehr gross', 'font', 'xl'], action: () => runAndClose(() => setFontSize(fontSize === 'xlarge' ? 'normal' : 'xlarge')) },
  ]

  const filtered = query.trim()
    ? commands.filter(cmd => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some(k => k.includes(q))
        )
      })
    : commands

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  // Flat list for keyboard navigation
  const flatList = Object.values(grouped).flat()

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-cmd-item]')
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, flatList.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      flatList[selectedIndex]?.action()
    }
  }

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  let flatIdx = -1

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Befehlspalette">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setOpen(false); setQuery('') }}
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg">
        <div className="mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Suche oder Befehl eingeben..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatList.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Keine Ergebnisse fuer &ldquo;{query}&rdquo;
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[category] || category}
                  </p>
                  {items.map(cmd => {
                    flatIdx++
                    const idx = flatIdx
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-cmd-item
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedIndex === idx
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{cmd.label}</span>
                          {cmd.description && (
                            <span className="ml-2 text-xs text-muted-foreground">{cmd.description}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑</kbd>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↓</kbd>
                Navigieren
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                Ausfuehren
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">⌘K</kbd>
              Oeffnen
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
