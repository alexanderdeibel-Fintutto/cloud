import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, Shield, AlertTriangle, AlertCircle,
  Info, Search, MessageSquare, Plus, CheckCircle,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import { api } from '@/lib/api'

// ── Section Component ──

function Section({ title, icon: Icon, children, defaultOpen = true, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="w-4 h-4 text-primary" />
          {title}
          {badge && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{badge}</span>}
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-border pt-3">{children}</div>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Organik Score Display
// ══════════════════════════════════════════════════════════════

function ScoreDisplay({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : score >= 40 ? 'text-orange-600' : 'text-red-600'
  const bg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : score >= 40 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
  const ring = score >= 80 ? 'stroke-green-500' : score >= 60 ? 'stroke-yellow-500' : score >= 40 ? 'stroke-orange-500' : 'stroke-red-500'

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`flex items-center gap-6 p-4 rounded-lg border ${bg}`}>
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            className={ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        <h3 className={`text-sm font-bold ${color}`}>Organik-Score</h3>
        <p className="text-xs text-muted-foreground">
          {score >= 80 ? 'Deine Bot-Aktivität wirkt natürlich. Weiter so!' :
           score >= 60 ? 'Einige Muster sind noch erkennbar. Sieh dir die Warnungen an.' :
           score >= 40 ? 'Mehrere auffällige Muster. Dringend optimieren!' :
           'Hohes Erkennungsrisiko. Sofortige Maßnahmen nötig.'}
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Warnungen / Checklist
// ══════════════════════════════════════════════════════════════

function WarningsList({ warnings }: { warnings: any[] }) {
  const iconMap = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }
  const colorMap = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  const iconColorMap = {
    critical: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-400',
  }

  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
        <CheckCircle className="w-4 h-4" />
        Keine Warnungen – alles sieht organisch aus!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const Icon = iconMap[w.level as keyof typeof iconMap] || Info
        return (
          <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${colorMap[w.level as keyof typeof colorMap] || ''}`}>
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColorMap[w.level as keyof typeof iconColorMap] || ''}`} />
            <div>
              <div className="font-semibold">{w.message}</div>
              <div className="opacity-80 mt-0.5">{w.detail}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Posting Heatmap (Stunden x Wochentage)
// ══════════════════════════════════════════════════════════════

function PostingHeatmap({ heatmap }: { heatmap: number[][] }) {
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const maxVal = Math.max(1, ...heatmap.flat())

  const getColor = (val: number) => {
    if (val === 0) return 'bg-gray-100'
    const intensity = val / maxVal
    if (intensity > 0.7) return 'bg-green-600'
    if (intensity > 0.4) return 'bg-green-400'
    if (intensity > 0.2) return 'bg-green-300'
    return 'bg-green-200'
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5">
        <div className="w-8" />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="w-4 text-center text-[8px] text-muted-foreground">
            {h % 3 === 0 ? h : ''}
          </div>
        ))}
      </div>
      {days.map((day, d) => (
        <div key={d} className="flex items-center gap-0.5">
          <div className="w-8 text-[10px] text-muted-foreground text-right pr-1">{day}</div>
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className={`w-4 h-4 rounded-sm ${getColor(heatmap[d]?.[h] || 0)}`}
              title={`${day} ${h}:00 – ${heatmap[d]?.[h] || 0} Posts`}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
        <span>Wenig</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-300" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </div>
        <span>Viel</span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Statistik-Kacheln
// ══════════════════════════════════════════════════════════════

function StatTiles({ stats }: { stats: any }) {
  const tiles = [
    { label: 'Personas', value: stats.totalPersonas, sub: `${stats.personasWithWp} mit WP` },
    { label: 'Heute geplant', value: stats.todayActions, sub: 'Aktionen' },
    { label: 'Reply-Quote', value: `${stats.replyRatio}%`, sub: stats.replyRatio >= 60 ? 'Gut' : 'Zu niedrig' },
    { label: 'BB-Erwähnung', value: `${stats.bbMentionRate}%`, sub: stats.bbMentionRate <= 8 ? 'Subtil' : 'Auffällig' },
    { label: 'Aktive Stunden', value: stats.activeHours, sub: stats.activeHours >= 10 ? 'Verteilt' : 'Konzentriert' },
    { label: 'Tiefe Threads', value: stats.deepThreads, sub: 'Konversationen' },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {tiles.map(t => (
        <div key={t.label} className="text-center p-2 bg-muted/50 rounded-lg">
          <div className="text-lg font-bold">{t.value}</div>
          <div className="text-[10px] text-muted-foreground">{t.label}</div>
          <div className="text-[9px] text-muted-foreground">{t.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Account-Reife Verteilung
// ══════════════════════════════════════════════════════════════

function AgeDistribution({ dist }: { dist: { fresh: number; warmup: number; active: number; mature: number } }) {
  const total = dist.fresh + dist.warmup + dist.active + dist.mature
  if (total === 0) return null

  const segments = [
    { label: 'Frisch (0-3d)', count: dist.fresh, color: 'bg-red-400', desc: 'Keine Aktivität' },
    { label: 'Warm-Up (3-14d)', count: dist.warmup, color: 'bg-yellow-400', desc: 'Nur Kommentare' },
    { label: 'Eingewöhnt (14-30d)', count: dist.active, color: 'bg-blue-400', desc: '70% Aktivität' },
    { label: 'Reif (30d+)', count: dist.mature, color: 'bg-green-500', desc: 'Volle Aktivität' },
  ]

  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden">
        {segments.map(s => (
          s.count > 0 && (
            <div
              key={s.label}
              className={`${s.color} transition-all`}
              style={{ width: `${(s.count / total) * 100}%` }}
              title={`${s.label}: ${s.count}`}
            />
          )
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 text-[10px]">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
            <div>
              <span className="font-medium">{s.count}</span>
              <span className="text-muted-foreground ml-1">{s.label}</span>
              <div className="text-[9px] text-muted-foreground">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Konversations-Planer
// ══════════════════════════════════════════════════════════════

function ConversationPlanner() {
  const [forumId, setForumId] = useState('hilfe-bescheid')
  const [topicTitle, setTopicTitle] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPersonas, setSelectedPersonas] = useState<any[]>([])
  const [delay, setDelay] = useState(30)
  const [planning, setPlanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const searchPersonas = async (q: string) => {
    setSearchText(q)
    if (q.length < 1) { setSearchResults([]); return }
    try {
      const data = await api.searchPersonas(q)
      setSearchResults(data.filter((p: any) => !selectedPersonas.some(s => s.id === p.id)))
    } catch { /* ignore */ }
  }

  const addPersona = (persona: any) => {
    setSelectedPersonas(prev => [...prev, persona])
    setSearchResults([])
    setSearchText('')
  }

  const removePersona = (id: string) => {
    setSelectedPersonas(prev => prev.filter(p => p.id !== id))
  }

  const handlePlan = async () => {
    if (selectedPersonas.length < 2 || !topicTitle.trim()) return
    setPlanning(true)
    setResult(null)
    try {
      const data = await api.planConversation({
        forum_id: forumId,
        topic_title: topicTitle.trim(),
        persona_ids: selectedPersonas.map(p => p.id),
        start_delay_minutes: delay,
      })
      setResult(data)
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setPlanning(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Plane eine natürliche Konversation: Persona 1 erstellt ein Topic, weitere Personas antworten mit realistischen Zeitabständen (20min-4h).
      </p>

      {/* Forum + Title */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-medium mb-1">Forum</label>
          <select value={forumId} onChange={e => setForumId(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="hilfe-bescheid">Hilfe Bescheid</option>
            <option value="widerspruch">Widerspruch</option>
            <option value="sanktionen">Sanktionen</option>
            <option value="kdu-miete">KdU / Miete</option>
            <option value="erfolge">Erfolge</option>
            <option value="auskotzen">Auskotzen</option>
            <option value="allgemeines">Allgemeines</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-medium mb-1">Topic-Titel</label>
          <input value={topicTitle} onChange={e => setTopicTitle(e.target.value)}
            placeholder="z.B. Bescheid falsch berechnet – was tun?"
            className="w-full px-2 py-1.5 text-xs bg-background border border-input rounded-md" />
        </div>
      </div>

      {/* Persona Selection */}
      <div>
        <label className="block text-[10px] font-medium mb-1">
          Personas ({selectedPersonas.length} gewählt, mind. 2)
        </label>

        {/* Selected Personas */}
        {selectedPersonas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedPersonas.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1 bg-primary/5 border border-primary/20 rounded px-2 py-1 text-[10px]">
                <span className="font-medium">{i + 1}.</span>
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px]"
                  style={{ backgroundColor: p.avatar_color || '#3498db' }}>
                  {p.display_name?.slice(0, 1)}
                </div>
                <span>{p.display_name}</span>
                <span className="text-muted-foreground">
                  {i === 0 ? '(erstellt Topic)' : '(antwortet)'}
                </span>
                <button onClick={() => removePersona(p.id)} className="text-muted-foreground hover:text-destructive ml-1">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
          <input
            value={searchText}
            onChange={e => searchPersonas(e.target.value)}
            placeholder="Persona hinzufügen..."
            className="w-full pl-7 pr-3 py-1 text-xs bg-background border border-input rounded-md"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-36 overflow-y-auto">
              {searchResults.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => addPersona(p)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-muted text-[10px] border-b border-border last:border-0"
                >
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px]"
                    style={{ backgroundColor: p.avatar_color || '#3498db' }}>
                    {p.display_name?.slice(0, 1)}
                  </div>
                  <span className="font-medium">{p.display_name}</span>
                  <span className="text-muted-foreground">{p.situation}</span>
                  {!p.wp_user_id && <span className="text-destructive">kein WP</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delay */}
      <div className="flex items-center gap-3">
        <label className="text-[10px] font-medium">Start in:</label>
        <select value={delay} onChange={e => setDelay(Number(e.target.value))}
          className="text-xs bg-background border border-input rounded-md px-2 py-1">
          <option value={10}>10 Minuten</option>
          <option value={30}>30 Minuten</option>
          <option value={60}>1 Stunde</option>
          <option value={120}>2 Stunden</option>
          <option value={240}>4 Stunden</option>
        </select>
      </div>

      {/* Plan Button */}
      <button
        onClick={handlePlan}
        disabled={planning || selectedPersonas.length < 2 || !topicTitle.trim()}
        className="btn-forum-primary text-xs disabled:opacity-50"
      >
        {planning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Konversation planen
      </button>

      {/* Result */}
      {result && !result.error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-green-800 font-semibold">
            <CheckCircle className="w-4 h-4" />
            {result.message}
          </div>
          <div className="space-y-1">
            {result.actions?.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 text-[10px] text-green-700">
                <span className="font-mono">{a.time}</span>
                <span className="font-medium">{a.persona_name}</span>
                <span className="text-green-600">→ {a.action_type === 'forum_topic' ? 'Erstellt Topic' : 'Antwortet'}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-green-600">
            Die Inhalte werden beim Ausführen automatisch generiert, oder du schreibst sie vorher manuell in der Steuerung.
          </p>
        </div>
      )}
      {result?.error && (
        <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded p-2">
          <AlertCircle className="w-4 h-4" />
          {result.error}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Haupt-Seite
// ══════════════════════════════════════════════════════════════

export default function OrganikPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadCheck = async () => {
    setLoading(true)
    try {
      const result = await api.getOrganikCheck()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCheck() }, [])

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Organik-Check
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Wie natürlich wirkt die Bot-Aktivität? Muster-Analyse und Optimierung.
          </p>
        </div>
        <button onClick={loadCheck} disabled={loading} className="btn-forum text-xs border border-border hover:bg-muted">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Neu prüfen
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : data ? (
        <div className="space-y-4">
          {/* Score */}
          <ScoreDisplay score={data.score} label={data.scoreLabel} />

          {/* Stats */}
          <StatTiles stats={data.stats} />

          {/* Warnungen */}
          <Section title="Warnungen & Empfehlungen" icon={AlertTriangle}
            badge={`${data.warnings.filter((w: any) => w.level === 'critical').length} kritisch`}>
            <WarningsList warnings={data.warnings} />
          </Section>

          {/* Account-Reife */}
          <Section title="Account-Reife (Warm-Up Status)" icon={Shield}>
            <AgeDistribution dist={data.stats.ageDistribution} />
            <p className="text-[10px] text-muted-foreground mt-2">
              Neue Personas durchlaufen automatisch ein Warm-Up: 0-3 Tage still → 3-14 Tage nur Kommentare → 14-30 Tage 70% Aktivität → ab 30 Tagen volle Frequenz.
            </p>
          </Section>

          {/* Heatmap */}
          <Section title="Posting-Heatmap (Stunde x Wochentag)" icon={Info} defaultOpen={false}>
            <PostingHeatmap heatmap={data.heatmap} />
            <p className="text-[10px] text-muted-foreground mt-2">
              Ideal: Posts über alle Tageszeiten verteilt. Lücken nachts (0-6 Uhr) sind verdächtig wenn ALLE Personas gleichzeitig inaktiv sind.
            </p>
          </Section>

          {/* Konversations-Planer */}
          <Section title="Konversation planen" icon={MessageSquare} defaultOpen={false}
            badge="Multi-Persona">
            <ConversationPlanner />
          </Section>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Fehler beim Laden. Ist der Server gestartet?
        </div>
      )}
    </div>
  )
}
