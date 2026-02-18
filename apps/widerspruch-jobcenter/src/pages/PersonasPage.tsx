import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, Users, ChevronLeft, ChevronRight,
  Plus, Pencil, Search, X, Bot, User, ArrowUpDown,
} from 'lucide-react'
import { api } from '@/lib/api'
import PersonaForm from '@/components/PersonaForm'

type FilterType = 'all' | 'auto' | 'manuell'
type SortType = '' | 'name' | 'bb_desc' | 'newest' | 'wave'

const WAVE_LABELS: Record<string, { label: string; color: string }> = {
  auto: { label: 'Auto-Bot', color: 'bg-gray-100 text-gray-600' },
  gruender: { label: 'Gründer', color: 'bg-gray-100 text-gray-600' },
  welle2: { label: 'Welle 2', color: 'bg-gray-100 text-gray-600' },
  spaeteinsteiger: { label: 'Späteinsteiger', color: 'bg-gray-100 text-gray-600' },
  manuell: { label: 'Manuell', color: 'bg-blue-100 text-blue-700' },
  erfolgs_persona: { label: 'Erfolgs-Persona', color: 'bg-green-100 text-green-700' },
  empfehler_subtil: { label: 'Stille Empfehlerin', color: 'bg-emerald-100 text-emerald-700' },
  community_helfer: { label: 'Community-Helfer', color: 'bg-purple-100 text-purple-700' },
  neuling: { label: 'Neuling', color: 'bg-orange-100 text-orange-700' },
}

function getWaveBadge(wave: string) {
  const info = WAVE_LABELS[wave] || { label: wave, color: 'bg-yellow-100 text-yellow-700' }
  return info
}

export default function PersonasPage() {
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>('closed')
  const [editPersona, setEditPersona] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('')
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const fetchPersonas = useCallback(async (p: number, q?: string, type?: FilterType, sort?: SortType) => {
    setLoading(true)
    try {
      const result = await api.getPersonas(p, 25, {
        q: q || undefined,
        type: type === 'all' ? undefined : type,
        sort: sort || undefined,
      })
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPersonas(page, activeSearch, filterType, sortType)
  }, [page, activeSearch, filterType, sortType, fetchPersonas])

  // Debounced search
  const handleSearchInput = (val: string) => {
    setSearchText(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      setActiveSearch(val)
    }, 300)
  }

  const clearSearch = () => {
    setSearchText('')
    setActiveSearch('')
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const engagementColors: Record<string, string> = {
    schreiber: 'bg-green-100 text-green-800',
    kommentierer: 'bg-blue-100 text-blue-800',
    mixed: 'bg-purple-100 text-purple-800',
    liker: 'bg-yellow-100 text-yellow-800',
    lurker_gelegentlich: 'bg-gray-100 text-gray-800',
  }

  const handleCreate = () => {
    setSelected(null)
    setEditPersona(null)
    setFormMode('create')
  }

  const handleEdit = async (personaId: string) => {
    try {
      const full = await api.getPersona(personaId)
      setEditPersona(full)
      setSelected(null)
      setFormMode('edit')
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (formData: any) => {
    setSaving(true)
    try {
      if (formMode === 'create') {
        await api.createPersona(formData)
      } else if (formMode === 'edit' && editPersona) {
        await api.updatePersona(editPersona.id, formData)
      }
      setFormMode('closed')
      setEditPersona(null)
      await fetchPersonas(page, activeSearch, filterType, sortType)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editPersona) return
    if (!confirm(`Persona "${editPersona.display_name}" (${editPersona.id}) wirklich löschen?`)) return
    try {
      await api.deletePersona(editPersona.id)
      setFormMode('closed')
      setEditPersona(null)
      await fetchPersonas(page, activeSearch, filterType, sortType)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  // Show form in full-screen overlay
  if (formMode !== 'closed') {
    return (
      <div className="forum-container">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
        <div className="bg-card border border-border rounded-lg p-6">
          <PersonaForm
            persona={formMode === 'edit' ? editPersona : undefined}
            onSave={handleSave}
            onDelete={formMode === 'edit' ? handleDelete : undefined}
            onCancel={() => { setFormMode('closed'); setEditPersona(null) }}
            saving={saving}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Personas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {data ? `${data.total_auto || 0} Auto-Bots · ${data.total_manuell || 0} Manuell erstellt` : 'Wird geladen...'}
          </p>
        </div>
        <button onClick={handleCreate} className="btn-forum-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          Neue Persona
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-card border border-border rounded-lg p-3 mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchText}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Suche nach Name, Username, ID, Situation, Wave..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchText && (
            <button onClick={clearSearch} className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs + Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {([
              { key: 'all', label: 'Alle', icon: Users, count: data ? (data.total_auto + data.total_manuell) : undefined },
              { key: 'auto', label: 'Auto-Bots', icon: Bot, count: data?.total_auto },
              { key: 'manuell', label: 'Meine Personas', icon: User, count: data?.total_manuell },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilterType(tab.key); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1 rounded ${
                    filterType === tab.key ? 'bg-white/20' : 'bg-background'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
            <select
              value={sortType}
              onChange={e => { setSortType(e.target.value as SortType); setPage(1) }}
              className="text-xs bg-background border border-input rounded-md px-2 py-1"
            >
              <option value="">Standard (ID)</option>
              <option value="name">Name A-Z</option>
              <option value="bb_desc">BB-Affinität hoch→niedrig</option>
              <option value="newest">Neueste zuerst</option>
              <option value="wave">Nach Wave/Typ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active search info */}
      {activeSearch && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Search className="w-3 h-3" />
          <span>{data?.total || 0} Ergebnisse für "<strong className="text-foreground">{activeSearch}</strong>"</span>
          <button onClick={clearSearch} className="text-primary hover:underline">Zurücksetzen</button>
        </div>
      )}

      {/* Persona Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: selected.avatar_color || '#3498db' }}>
                  {selected.display_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{selected.display_name}</h3>
                  <p className="text-xs text-muted-foreground">@{selected.username}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(selected.id) }}
                className="btn-forum-primary text-xs"
              >
                <Pencil className="w-3 h-3" />
                Bearbeiten
              </button>
            </div>
            <pre className="text-[10px] bg-muted rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(selected, null, 2)}
            </pre>
            <button onClick={() => setSelected(null)} className="btn-forum-primary text-xs mt-3">Schließen</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : data?.data?.length > 0 ? (
        <>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left p-2 font-medium">Persona</th>
                    <th className="text-left p-2 font-medium">Typ</th>
                    <th className="text-left p-2 font-medium">Situation</th>
                    <th className="text-left p-2 font-medium">Engagement</th>
                    <th className="text-left p-2 font-medium">Frequenz</th>
                    <th className="text-left p-2 font-medium">BB</th>
                    <th className="text-left p-2 font-medium">WP</th>
                    <th className="text-left p-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p: any) => {
                    const waveBadge = getWaveBadge(p.wave || 'auto')
                    const isManual = !['auto', 'gruender', 'welle2', 'spaeteinsteiger', ''].includes(p.wave || 'auto')

                    return (
                      <tr
                        key={p.id}
                        className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
                          isManual ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={async () => {
                          try {
                            const full = await api.getPersona(p.id)
                            setSelected(full)
                          } catch { setSelected(p) }
                        }}
                      >
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: p.avatar_color || '#3498db' }}
                            >
                              {p.display_name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.display_name}</div>
                              <div className="text-muted-foreground text-[10px]">{p.id} · @{p.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${waveBadge.color}`}>
                            {waveBadge.label}
                          </span>
                        </td>
                        <td className="p-2">{p.situation}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${engagementColors[p.engagement_style] || ''}`}>
                            {p.engagement_style}
                          </span>
                        </td>
                        <td className="p-2 text-[10px]">{p.posting_frequency}</td>
                        <td className="p-2">
                          <span className={`font-mono text-[10px] ${
                            p.bescheidboxer_affinity > 0.3 ? 'text-green-600 font-bold' :
                            p.bescheidboxer_affinity > 0 ? 'text-yellow-600' : 'text-muted-foreground'
                          }`}>
                            {(p.bescheidboxer_affinity * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-2">
                          {p.wp_user_id ? (
                            <span className="text-green-600 text-[10px]">#{p.wp_user_id}</span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">–</span>
                          )}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(p.id) }}
                            className="p-1 text-muted-foreground hover:text-primary rounded hover:bg-muted"
                            title="Bearbeiten"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Seite {page} von {totalPages} ({data.total} Personas)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-forum-ghost text-xs disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                const p = start + i
                if (p > totalPages) return null
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2 py-1 rounded text-xs ${
                      p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-forum-ghost text-xs disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          {activeSearch || filterType !== 'all' ? (
            <>
              <p className="text-sm text-muted-foreground">Keine Personas gefunden.</p>
              <button onClick={() => { clearSearch(); setFilterType('all') }} className="text-xs text-primary hover:underline mt-2">
                Filter zurücksetzen
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Noch keine Personas generiert.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Klicke auf "Neue Persona" oder im Dashboard auf "500 Personas generieren".
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
