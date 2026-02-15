import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Send, Search, RefreshCw, Sliders,
  UserPlus, MessageSquare, FileText, Users,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle, Megaphone,
} from 'lucide-react'
import { api } from '@/lib/api'

// ── Persona-Vorlagen (Templates) ──

const PERSONA_TEMPLATES = {
  erfolg_empfehler: {
    label: 'Erfolgs-Persona (Empfehler)',
    desc: 'Hat Bescheid geprüft, Widerspruch gewonnen, empfiehlt BescheidBoxer aktiv',
    data: {
      wave: 'erfolgs_persona',
      bio: '',
      profile: {
        situation: 'single',
        erfahrung_widerspruch: true,
        ton: 'positiv_lösungsorientiert',
        schreibstil: 'umgangssprache_leicht',
        emoji_nutzung: 'gelegentlich',
        tippfehler_rate: 0.01,
        gross_klein_fehler: false,
        probleme: ['bescheid', 'widerspruch', 'nachzahlung', 'erfolg'],
        beispiel_saetze: [
          'Leute, ich hab es geschafft! Widerspruch gewonnen!',
          'Mein Tipp: Bescheid immer prüfen lassen. Lohnt sich!',
          'Kann nur empfehlen sich zu wehren. Hat sich gelohnt!',
        ],
      },
      activity: {
        posting_frequency: '2_3_pro_woche',
        engagement_style: 'kommentierer',
        active_forums: ['erfolge', 'widerspruch', 'hilfe-bescheid'],
        themen_schwerpunkte: ['erfolg', 'nachzahlung', 'gewonnen', 'widerspruch', 'bescheid'],
        kommentar_laenge: 'mittel',
        bescheidboxer_affinity: 0.45,
      },
    },
  },
  stille_empfehlerin: {
    label: 'Stille Empfehlerin',
    desc: 'Kommentiert ab und zu, erwähnt BB beiläufig wenn es passt',
    data: {
      wave: 'empfehler_subtil',
      profile: {
        situation: 'alleinerziehend',
        erfahrung_widerspruch: true,
        ton: 'warmherzig',
        schreibstil: 'umgangssprache_leicht',
        emoji_nutzung: 'selten',
        probleme: ['mehrbedarf', 'kinder', 'bescheid'],
        beispiel_saetze: [
          'Kenne das Problem. Bei mir war es ähnlich...',
          'Hab da gute Erfahrungen gemacht, schau mal...',
          'Drücke dir die Daumen!',
        ],
      },
      activity: {
        posting_frequency: 'gelegentlich',
        engagement_style: 'kommentierer',
        active_forums: ['hilfe-bescheid', 'erfolge'],
        themen_schwerpunkte: ['bescheid', 'mehrbedarf', 'erfolg'],
        kommentar_laenge: 'kurz',
        bescheidboxer_affinity: 0.2,
      },
    },
  },
  neutral_helfer: {
    label: 'Neutraler Community-Helfer',
    desc: 'Hilft aktiv, erwähnt BB nie direkt – baut Glaubwürdigkeit auf',
    data: {
      wave: 'community_helfer',
      profile: {
        situation: 'langzeitbezieher',
        erfahrung_widerspruch: true,
        ton: 'pragmatisch',
        schreibstil: 'hochdeutsch',
        emoji_nutzung: 'nie',
        probleme: ['widerspruch', 'klage', 'sozialgericht'],
        beispiel_saetze: [
          'Nach §22 Abs. 1 SGB II müssen die KdU übernommen werden.',
          'Wichtig: Innerhalb von 4 Wochen Widerspruch einlegen.',
          'Hol dir Unterstützung bei der Sozialberatung.',
        ],
      },
      activity: {
        posting_frequency: '3_4_pro_woche',
        engagement_style: 'kommentierer',
        active_forums: ['widerspruch', 'hilfe-bescheid', 'sanktionen', 'kdu-miete'],
        themen_schwerpunkte: ['widerspruch', 'klage', 'bescheid', 'sanktion'],
        kommentar_laenge: 'lang',
        bescheidboxer_affinity: 0,
      },
    },
  },
  frustrierter_neuling: {
    label: 'Frustrierter Neuling',
    desc: 'Neu im System, verunsichert, fragt viel – natürliche Zielgruppe',
    data: {
      wave: 'neuling',
      profile: {
        situation: 'neubezieher',
        erfahrung_widerspruch: false,
        ton: 'verunsichert',
        schreibstil: 'umgangssprache_mittel',
        emoji_nutzung: 'selten',
        probleme: ['bescheid', 'berechnung', 'buergergeld'],
        beispiel_saetze: [
          'kann mir jemand erklären was das bedeutet??',
          'bin total überfordert...',
          'sorry für die dumme frage aber...',
        ],
      },
      activity: {
        posting_frequency: '1_2_pro_woche',
        engagement_style: 'mixed',
        active_forums: ['hilfe-bescheid', 'allgemeines'],
        themen_schwerpunkte: ['bescheid', 'berechnung', 'buergergeld'],
        kommentar_laenge: 'mittel',
        bescheidboxer_affinity: 0,
      },
    },
  },
}

// ── Section Component ──

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean
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
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-border pt-3">{children}</div>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 1. Als Persona posten
// ══════════════════════════════════════════════════════════════

function ComposeAsPersona() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<any>(null)
  const [actionType, setActionType] = useState('forum_topic')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [forumId, setForumId] = useState('hilfe-bescheid')
  const [postId, setPostId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [wpPosts, setWpPosts] = useState<any[]>([])
  const [wpTopics, setWpTopics] = useState<any[]>([])
  const [posting, setPosting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const searchPersonas = async (q: string) => {
    setSearch(q)
    if (q.length < 1) { setResults([]); return }
    try {
      const data = await api.searchPersonas(q)
      setResults(data)
    } catch { /* ignore */ }
  }

  const loadWpContent = async () => {
    try {
      const [posts, topics] = await Promise.all([
        api.getWpPosts().catch(() => []),
        api.getWpTopics(forumId).catch(() => []),
      ])
      setWpPosts(posts)
      setWpTopics(topics)
    } catch { /* ignore */ }
  }

  useEffect(() => { loadWpContent() }, [forumId])

  const handlePost = async () => {
    if (!selectedPersona || !body.trim()) return
    setPosting(true)
    setResult(null)
    try {
      const data: any = {
        persona_id: selectedPersona.id,
        action_type: actionType,
        content: { body: body.trim() },
        target: { forum_id: forumId },
      }
      if (title.trim()) data.content.title = title.trim()
      if (actionType === 'blog_comment' && postId) data.target.post_id = parseInt(postId)
      if (actionType === 'forum_reply' && topicId) data.target.topic_id = parseInt(topicId)

      const res = await api.postAsPersona(data)
      setResult({ success: true, message: `Gepostet! WP-ID: ${res.wp_id}` })
      setBody('')
      setTitle('')
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setPosting(false)
    }
  }

  const needsTitle = actionType === 'blog_post' || actionType === 'forum_topic'
  const needsPostId = actionType === 'blog_comment'
  const needsTopicId = actionType === 'forum_reply'

  return (
    <div className="space-y-3">
      {/* Persona Suche */}
      <div>
        <label className="block text-xs font-medium mb-1">Persona auswählen</label>
        {selectedPersona ? (
          <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-md">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: selectedPersona.avatar_color || '#3498db' }}>
              {selectedPersona.display_name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium">{selectedPersona.display_name}</span>
              <span className="text-[10px] text-muted-foreground ml-2">@{selectedPersona.username} · {selectedPersona.situation} · BB: {(selectedPersona.bescheidboxer_affinity * 100).toFixed(0)}%</span>
            </div>
            <button onClick={() => { setSelectedPersona(null); setSearch('') }} className="text-xs text-muted-foreground hover:text-foreground">Ändern</button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => searchPersonas(e.target.value)}
              placeholder="Name, ID oder Situation suchen..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {results.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPersona(p); setResults([]) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted text-xs border-b border-border last:border-0"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: p.avatar_color || '#3498db' }}>
                      {p.display_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{p.display_name}</span>
                    <span className="text-muted-foreground">{p.id}</span>
                    <span className="text-muted-foreground">{p.situation}</span>
                    {!p.wp_user_id && <span className="text-destructive text-[10px]">kein WP</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Aktion</label>
          <select value={actionType} onChange={e => setActionType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="forum_topic">Forum-Topic</option>
            <option value="forum_reply">Forum-Antwort</option>
            <option value="blog_post">Blog-Post</option>
            <option value="blog_comment">Blog-Kommentar</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Forum</label>
          <select value={forumId} onChange={e => setForumId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="hilfe-bescheid">Hilfe Bescheid</option>
            <option value="widerspruch">Widerspruch</option>
            <option value="sanktionen">Sanktionen</option>
            <option value="kdu-miete">KdU / Miete</option>
            <option value="zuverdienst">Zuverdienst</option>
            <option value="erfolge">Erfolge</option>
            <option value="auskotzen">Auskotzen</option>
            <option value="allgemeines">Allgemeines</option>
          </select>
        </div>
      </div>

      {/* Post/Topic ID für Replies */}
      {needsPostId && (
        <div>
          <label className="block text-xs font-medium mb-1">Auf welchen Post antworten? (WP Post-ID)</label>
          <select value={postId} onChange={e => setPostId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="">-- Post auswählen --</option>
            {wpPosts.map((p: any) => (
              <option key={p.id} value={p.id}>#{p.id} – {p.title?.rendered || 'Untitled'}</option>
            ))}
          </select>
        </div>
      )}

      {needsTopicId && (
        <div>
          <label className="block text-xs font-medium mb-1">Auf welches Topic antworten? (WP Topic-ID)</label>
          <select value={topicId} onChange={e => setTopicId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="">-- Topic auswählen --</option>
            {wpTopics.map((t: any) => (
              <option key={t.id} value={t.id}>#{t.id} – {t.title?.rendered || 'Untitled'}</option>
            ))}
          </select>
        </div>
      )}

      {/* Titel */}
      {needsTitle && (
        <div>
          <label className="block text-xs font-medium mb-1">Titel</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="z.B. Bescheid geprüft – 145€ Nachzahlung!"
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      )}

      {/* Content */}
      <div>
        <label className="block text-xs font-medium mb-1">Inhalt</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          placeholder="Den Text hier reinschreiben... Schreibe im Stil der gewählten Persona. Tipp: Subtil sein mit BB-Erwähnungen – eher 'schaut doch mal hier' statt Werbung."
          className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {body.length} Zeichen · Absätze mit Leerzeile trennen
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-center gap-2 p-2 rounded text-xs ${
          result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {result.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {result.message}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handlePost}
        disabled={posting || !selectedPersona || !body.trim()}
        className="btn-forum-primary text-xs disabled:opacity-50"
      >
        {posting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        {posting ? 'Wird gepostet...' : 'Jetzt posten'}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 2. BB-Affinität steuern
// ══════════════════════════════════════════════════════════════

function BbAffinityControl() {
  const [stats, setStats] = useState<any>(null)
  const [newAffinity, setNewAffinity] = useState(0)
  const [filter, setFilter] = useState<string>('')
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      const data = await api.getBbStats()
      setStats(data)
    } catch { /* ignore */ }
  }

  useEffect(() => { loadStats() }, [])

  const handleBulkUpdate = async () => {
    setUpdating(true)
    setResult(null)
    try {
      const data: any = { bescheidboxer_affinity: newAffinity }
      if (filter) data.filter = { wave: filter }
      const res = await api.bulkUpdatePersonas(data)
      setResult(`${res.updated} Personas auf ${(newAffinity * 100).toFixed(0)}% gesetzt`)
      await loadStats()
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Aktuelle Statistik */}
      {stats && (
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-xs font-semibold mb-2">Aktuelle BB-Affinität (Ø {(stats.avg * 100).toFixed(1)}%)</h4>
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="text-center p-2 bg-card rounded border border-border">
              <div className="text-lg font-bold">{stats.distribution.null_pct}</div>
              <div className="text-muted-foreground">0% (nie)</div>
            </div>
            <div className="text-center p-2 bg-card rounded border border-border">
              <div className="text-lg font-bold">{stats.distribution.low}</div>
              <div className="text-muted-foreground">1-10% (selten)</div>
            </div>
            <div className="text-center p-2 bg-card rounded border border-border">
              <div className="text-lg font-bold">{stats.distribution.medium}</div>
              <div className="text-muted-foreground">10-30% (mittel)</div>
            </div>
            <div className="text-center p-2 bg-card rounded border border-border">
              <div className="text-lg font-bold">{stats.distribution.high}</div>
              <div className="text-muted-foreground">&gt;30% (hoch)</div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Global Mention Rate: {stats.globalMentionRate} (multipliziert mit Persona-Affinität)
          </p>
        </div>
      )}

      {/* Bulk Update */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Neue BB-Affinität</label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.01} value={newAffinity}
              onChange={e => setNewAffinity(Number(e.target.value))} className="flex-1" />
            <span className="text-xs font-mono w-10 text-right">{(newAffinity * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Filter (optional)</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md">
            <option value="">Alle Personas</option>
            <option value="erfolgs_persona">Nur Erfolgs-Personas</option>
            <option value="empfehler_subtil">Nur Stille Empfehler</option>
            <option value="community_helfer">Nur Community-Helfer</option>
            <option value="manuell">Nur Manuell erstellt</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleBulkUpdate} disabled={updating}
            className="btn-forum-primary text-xs disabled:opacity-50">
            {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
            Anwenden
          </button>
        </div>
      </div>

      {/* Schnellaktionen */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setNewAffinity(0); }}
          className="btn-forum text-xs border border-border hover:bg-muted">Alle auf 0% (BB aus)</button>
        <button onClick={() => { setNewAffinity(0.05); }}
          className="btn-forum text-xs border border-border hover:bg-muted">Alle auf 5% (minimal)</button>
        <button onClick={() => { setNewAffinity(0.15); }}
          className="btn-forum text-xs border border-border hover:bg-muted">Alle auf 15% (subtil)</button>
      </div>

      {result && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">{result}</p>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 3. Persona aus Vorlage erstellen
// ══════════════════════════════════════════════════════════════

function PersonaTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customName, setCustomName] = useState('')
  const [customAge, setCustomAge] = useState(30)
  const [customGender, setCustomGender] = useState('w')
  const [customBundesland, setCustomBundesland] = useState('NRW')
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleCreate = async () => {
    if (!selectedTemplate) return
    const template = PERSONA_TEMPLATES[selectedTemplate as keyof typeof PERSONA_TEMPLATES]
    setCreating(true)
    setResult(null)
    try {
      const data = {
        display_name: customName || `Persona ${Date.now().toString(36)}`,
        username: customName.toLowerCase().replace(/[^a-z0-9]/g, '_') || `persona_${Date.now().toString(36)}`,
        ...template.data,
        profile: {
          ...template.data.profile,
          alter: customAge,
          geschlecht: customGender,
          bundesland: customBundesland,
          stadt_typ: `grossstadt_${customBundesland.toLowerCase().replace(/[^a-z]/g, '_')}`,
        },
      }
      const persona = await api.createPersona(data)
      setResult({ success: true, message: `${persona.display_name} (${persona.id}) erstellt! Jetzt "WP-User anlegen" um die Persona in WordPress zu aktivieren.` })
      setCustomName('')
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(PERSONA_TEMPLATES).map(([key, tmpl]) => (
          <button
            key={key}
            onClick={() => setSelectedTemplate(key)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              selectedTemplate === key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="text-xs font-semibold">{tmpl.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{tmpl.desc}</div>
            <div className="text-[10px] text-primary mt-1">
              BB: {((tmpl.data.activity?.bescheidboxer_affinity || 0) * 100).toFixed(0)}% ·
              {' '}{tmpl.data.activity?.engagement_style} ·
              {' '}{tmpl.data.activity?.posting_frequency}
            </div>
          </button>
        ))}
      </div>

      {selectedTemplate && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-semibold">Persona anpassen</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Name</label>
              <input value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder="z.B. Sandra K."
                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Alter</label>
              <input type="number" value={customAge} onChange={e => setCustomAge(Number(e.target.value))}
                min={18} max={75}
                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Geschlecht</label>
              <select value={customGender} onChange={e => setCustomGender(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md">
                <option value="w">Weiblich</option>
                <option value="m">Männlich</option>
                <option value="d">Divers</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Bundesland</label>
              <select value={customBundesland} onChange={e => setCustomBundesland(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-background border border-input rounded-md">
                {['NRW','Berlin','Hamburg','Bayern','Sachsen','Niedersachsen','Hessen','Bremen','Brandenburg','Thüringen'].map(b =>
                  <option key={b} value={b}>{b}</option>
                )}
              </select>
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating}
            className="btn-forum-primary text-xs disabled:opacity-50">
            {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Persona erstellen
          </button>
        </div>
      )}

      {result && (
        <div className={`flex items-start gap-2 p-2 rounded text-xs ${
          result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {result.success ? <CheckCircle className="w-3.5 h-3.5 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5" />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 4. Starter-Threads: Forum-Eröffnungen posten
// ══════════════════════════════════════════════════════════════

interface StarterThread {
  forum_id: string
  forum_label: string
  title: string
  body: string
  persona_hint: string
  situation: string
  posted?: boolean
}

const FORUM_COLORS: Record<string, string> = {
  'hilfe-bescheid': '#3498db',
  'widerspruch': '#e74c3c',
  'sanktionen': '#e67e22',
  'kdu-miete': '#27ae60',
  'zuverdienst': '#9b59b6',
  'erfolge': '#2ecc71',
  'auskotzen': '#95a5a6',
  'allgemeines': '#34495e',
}

function StarterThreads() {
  const [threads, setThreads] = useState<StarterThread[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [edits, setEdits] = useState<Record<number, { title: string; body: string }>>({})
  const [personaSearch, setPersonaSearch] = useState<Record<number, string>>({})
  const [searchResults, setSearchResults] = useState<Record<number, any[]>>({})
  const [selectedPersonas, setSelectedPersonas] = useState<Record<number, any>>({})
  const [posting, setPosting] = useState<number | null>(null)
  const [results, setResults] = useState<Record<number, { success: boolean; message: string }>>({})
  const [postedIndices, setPostedIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.getStarterThreads().then(data => {
      setThreads(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const searchPersona = async (idx: number, q: string) => {
    setPersonaSearch(prev => ({ ...prev, [idx]: q }))
    if (q.length < 1) { setSearchResults(prev => ({ ...prev, [idx]: [] })); return }
    try {
      const data = await api.searchPersonas(q)
      setSearchResults(prev => ({ ...prev, [idx]: data }))
    } catch { /* ignore */ }
  }

  const selectPersona = (idx: number, persona: any) => {
    setSelectedPersonas(prev => ({ ...prev, [idx]: persona }))
    setSearchResults(prev => ({ ...prev, [idx]: [] }))
    setPersonaSearch(prev => ({ ...prev, [idx]: '' }))
  }

  const handlePost = async (idx: number) => {
    const persona = selectedPersonas[idx]
    if (!persona) return
    setPosting(idx)
    setResults(prev => ({ ...prev, [idx]: undefined! }))
    try {
      const edit = edits[idx]
      const data: any = { thread_index: idx, persona_id: persona.id }
      if (edit?.title) data.title_override = edit.title
      if (edit?.body) data.body_override = edit.body

      const res = await api.postStarterThread(data)
      setResults(prev => ({ ...prev, [idx]: { success: true, message: `Gepostet als ${res.persona} im Forum ${res.forum} (WP-ID: ${res.wp_id})` } }))
      setPostedIndices(prev => new Set([...prev, idx]))
    } catch (err) {
      setResults(prev => ({ ...prev, [idx]: { success: false, message: err instanceof Error ? err.message : 'Fehler' } }))
    } finally {
      setPosting(null)
    }
  }

  if (loading) return <div className="text-center py-4"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-primary" /></div>
  if (!threads.length) return <p className="text-xs text-muted-foreground">Keine Starter-Threads verfügbar.</p>

  // Group by forum
  const grouped: Record<string, { thread: StarterThread; idx: number }[]> = {}
  threads.forEach((thread, idx) => {
    if (!grouped[thread.forum_id]) grouped[thread.forum_id] = []
    grouped[thread.forum_id].push({ thread, idx })
  })

  const postedCount = postedIndices.size
  const totalCount = threads.length

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(postedCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{postedCount}/{totalCount} gepostet</span>
      </div>

      {Object.entries(grouped).map(([forumId, items]) => (
        <div key={forumId} className="border border-border rounded-lg overflow-hidden">
          {/* Forum header */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ backgroundColor: `${FORUM_COLORS[forumId]}10`, borderLeft: `3px solid ${FORUM_COLORS[forumId]}` }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: FORUM_COLORS[forumId] }}
            />
            <span className="text-xs font-semibold">{items[0].thread.forum_label}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {items.filter(i => postedIndices.has(i.idx)).length}/{items.length}
            </span>
          </div>

          {/* Threads */}
          <div className="divide-y divide-border">
            {items.map(({ thread, idx }) => {
              const isExpanded = expanded === idx
              const isPosted = postedIndices.has(idx)
              const persona = selectedPersonas[idx]
              const edit = edits[idx]
              const result = results[idx]

              return (
                <div key={idx} className={`${isPosted ? 'bg-green-50/50' : ''}`}>
                  {/* Thread row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : idx)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                  >
                    {isPosted
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      : <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{edit?.title || thread.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {thread.persona_hint} · {thread.situation}
                      </div>
                    </div>
                    {persona && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 rounded text-[10px] text-primary flex-shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                          style={{ backgroundColor: persona.avatar_color || '#3498db' }}>
                          {persona.display_name?.slice(0, 2).toUpperCase()}
                        </div>
                        {persona.display_name}
                      </div>
                    )}
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border bg-muted/20">
                      {/* Persona selection */}
                      <div>
                        <label className="block text-[10px] font-medium mb-1">Persona auswählen</label>
                        {persona ? (
                          <div className="flex items-center gap-2 p-1.5 bg-primary/5 border border-primary/20 rounded text-xs">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                              style={{ backgroundColor: persona.avatar_color || '#3498db' }}>
                              {persona.display_name?.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium">{persona.display_name}</span>
                            <span className="text-[10px] text-muted-foreground">@{persona.username}</span>
                            {!persona.wp_user_id && <span className="text-destructive text-[10px]">kein WP!</span>}
                            <button
                              onClick={() => setSelectedPersonas(prev => { const n = { ...prev }; delete n[idx]; return n })}
                              className="text-[10px] text-muted-foreground hover:text-foreground ml-auto"
                            >Ändern</button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
                            <input
                              value={personaSearch[idx] || ''}
                              onChange={e => searchPersona(idx, e.target.value)}
                              placeholder={`Persona suchen (Tipp: ${thread.persona_hint})...`}
                              className="w-full pl-6 pr-2 py-1 text-[11px] bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {(searchResults[idx] || []).length > 0 && (
                              <div className="absolute z-10 w-full mt-0.5 bg-card border border-border rounded shadow-lg max-h-36 overflow-y-auto">
                                {searchResults[idx].map((p: any) => (
                                  <button
                                    key={p.id}
                                    onClick={() => selectPersona(idx, p)}
                                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-muted text-[11px] border-b border-border last:border-0"
                                  >
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                                      style={{ backgroundColor: p.avatar_color || '#3498db' }}>
                                      {p.display_name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{p.display_name}</span>
                                    <span className="text-muted-foreground">{p.situation}</span>
                                    {!p.wp_user_id && <span className="text-destructive text-[10px]">kein WP</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Editable title */}
                      <div>
                        <label className="block text-[10px] font-medium mb-0.5">Titel</label>
                        <input
                          value={edit?.title ?? thread.title}
                          onChange={e => setEdits(prev => ({ ...prev, [idx]: { ...prev[idx], title: e.target.value, body: prev[idx]?.body ?? thread.body } }))}
                          className="w-full px-2 py-1 text-[11px] bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>

                      {/* Editable body */}
                      <div>
                        <label className="block text-[10px] font-medium mb-0.5">Inhalt</label>
                        <textarea
                          value={edit?.body ?? thread.body}
                          onChange={e => setEdits(prev => ({ ...prev, [idx]: { title: prev[idx]?.title ?? thread.title, body: e.target.value } }))}
                          rows={8}
                          className="w-full px-2 py-1 text-[11px] bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
                        />
                        <p className="text-[10px] text-muted-foreground">{(edit?.body ?? thread.body).length} Zeichen</p>
                      </div>

                      {/* Result message */}
                      {result && (
                        <div className={`flex items-center gap-1.5 p-1.5 rounded text-[11px] ${
                          result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                          {result.success ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {result.message}
                        </div>
                      )}

                      {/* Post button */}
                      <button
                        onClick={() => handlePost(idx)}
                        disabled={!persona || posting === idx || isPosted}
                        className="btn-forum-primary text-[11px] disabled:opacity-50"
                      >
                        {posting === idx ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {isPosted ? 'Bereits gepostet' : posting === idx ? 'Wird gepostet...' : 'Thread posten'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 5. Geplante Actions ansehen + bearbeiten
// ══════════════════════════════════════════════════════════════

function SchedulePreview() {
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getScheduleToday().then(d => { setSchedule(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-4"><RefreshCw className="w-4 h-4 animate-spin mx-auto text-primary" /></div>
  if (!schedule?.actions?.length) return <p className="text-xs text-muted-foreground">Kein Tagesplan vorhanden. Erst "Tagesplan erstellen" im Dashboard klicken.</p>

  const bbActions = schedule.actions.filter((a: any) => a.content?.body?.includes('bescheidboxer'))
  const pendingActions = schedule.actions.filter((a: any) => a.status === 'pending')
  const failedActions = schedule.actions.filter((a: any) => a.status === 'failed')

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-[10px]">
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-sm font-bold">{schedule.actions.length}</div>
          <div className="text-muted-foreground">Gesamt</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-sm font-bold text-yellow-600">{pendingActions.length}</div>
          <div className="text-muted-foreground">Ausstehend</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-sm font-bold text-destructive">{failedActions.length}</div>
          <div className="text-muted-foreground">Fehlgeschlagen</div>
        </div>
        <div className="text-center p-2 bg-muted rounded">
          <div className="text-sm font-bold text-primary">{bbActions.length}</div>
          <div className="text-muted-foreground">Mit BB-Erwähnung</div>
        </div>
      </div>

      {bbActions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 text-primary">Geplante BB-Erwähnungen</h4>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {bbActions.map((a: any) => (
              <div key={a.id} className="bg-primary/5 border border-primary/10 rounded p-2 text-[10px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{a.persona_id}</span>
                  <span className="text-muted-foreground">{a.action_type}</span>
                  <span className="text-muted-foreground">{new Date(a.scheduled_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`px-1 rounded ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : a.status === 'done' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {a.status}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2">{a.content?.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Haupt-Seite
// ══════════════════════════════════════════════════════════════

export default function SteuerungPage() {
  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sliders className="w-5 h-5 text-primary" />
          Steuerung
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manuell posten, Starter-Threads veröffentlichen, BB-Affinität steuern
        </p>
      </div>

      <div className="space-y-4">
        <Section title="Als Persona posten" icon={Send} defaultOpen={true}>
          <ComposeAsPersona />
        </Section>

        <Section title="BescheidBoxer-Affinität steuern" icon={Sliders} defaultOpen={true}>
          <BbAffinityControl />
        </Section>

        <Section title="Persona aus Vorlage erstellen" icon={UserPlus} defaultOpen={false}>
          <PersonaTemplates />
        </Section>

        <Section title="Starter-Threads (Forum-Eröffnungen)" icon={Megaphone} defaultOpen={true}>
          <StarterThreads />
        </Section>

        <Section title="Geplante BB-Erwähnungen (Heute)" icon={MessageSquare} defaultOpen={false}>
          <SchedulePreview />
        </Section>
      </div>
    </div>
  )
}
