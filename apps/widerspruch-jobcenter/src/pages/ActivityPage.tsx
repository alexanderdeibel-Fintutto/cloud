import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Activity, CheckCircle, XCircle, Search, Filter, X } from 'lucide-react'
import { api } from '@/lib/api'

const ACTION_TYPES = [
  { value: 'blog_post', label: 'Blog-Post' },
  { value: 'blog_comment', label: 'Kommentar' },
  { value: 'blog_comment_reply', label: 'Antwort' },
  { value: 'forum_topic', label: 'Forum-Topic' },
  { value: 'forum_reply', label: 'Forum-Antwort' },
  { value: 'like', label: 'Like' },
]

export default function ActivityPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [personaFilter, setPersonaFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | 'success' | 'failed'>('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchActivity = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.getActivity(500, {
        persona: personaFilter || undefined,
        type: typeFilter.length > 0 ? typeFilter.join(',') : undefined,
        date: dateFilter || undefined,
        status: statusFilter || undefined,
        q: search || undefined,
      })
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, personaFilter, typeFilter, dateFilter, statusFilter])

  useEffect(() => { fetchActivity() }, [fetchActivity])

  const hasActiveFilters = search || personaFilter || typeFilter.length > 0 || dateFilter || statusFilter
  const clearFilters = () => {
    setSearch('')
    setPersonaFilter('')
    setTypeFilter([])
    setDateFilter('')
    setStatusFilter('')
  }

  const toggleType = (t: string) => {
    setTypeFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Aktivitäts-Log
          {data && <span className="text-sm font-normal text-muted-foreground">({data.total} Einträge)</span>}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-forum-ghost text-xs ${hasActiveFilters ? 'text-primary' : ''}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filter
            {hasActiveFilters && <span className="ml-1 bg-primary text-primary-foreground text-[9px] px-1 rounded-full">aktiv</span>}
          </button>
          <button onClick={fetchActivity} className="btn-forum-ghost text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold">Filter</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Zurücksetzen
              </button>
            )}
          </div>

          {/* Search + Persona + Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Suche in Details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-background border border-border rounded"
              />
            </div>
            <input
              type="text"
              placeholder="Persona-ID (z.B. p_001)"
              value={personaFilter}
              onChange={e => setPersonaFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded"
            />
          </div>

          {/* Action Type Toggle + Status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Typ:</span>
            {ACTION_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  typeFilter.includes(t.value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {t.label}
              </button>
            ))}

            <span className="ml-2 text-[10px] text-muted-foreground">Status:</span>
            <button
              onClick={() => setStatusFilter(statusFilter === 'success' ? '' : 'success')}
              className={`text-[10px] px-2 py-0.5 rounded border ${
                statusFilter === 'success' ? 'bg-green-600 text-white border-green-600' : 'border-border hover:bg-muted'
              }`}
            >
              Erfolg
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'failed' ? '' : 'failed')}
              className={`text-[10px] px-2 py-0.5 rounded border ${
                statusFilter === 'failed' ? 'bg-red-600 text-white border-red-600' : 'border-border hover:bg-muted'
              }`}
            >
              Fehler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : data?.entries?.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left p-2 font-medium">Zeit</th>
                  <th className="text-left p-2 font-medium">Persona</th>
                  <th className="text-left p-2 font-medium">Aktion</th>
                  <th className="text-left p-2 font-medium">WP-ID</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e: any, i: number) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/50">
                    <td className="p-2 font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => { setPersonaFilter(e.persona_id); setShowFilters(true) }}
                        className="hover:text-primary hover:underline"
                        title={`Nach ${e.persona_id} filtern`}
                      >
                        {e.persona_id}
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => { setTypeFilter([e.action_type]); setShowFilters(true) }}
                        className="hover:text-primary hover:underline"
                        title={`Nach ${e.action_type} filtern`}
                      >
                        {ACTION_TYPES.find(t => t.value === e.action_type)?.label || e.action_type}
                      </button>
                    </td>
                    <td className="p-2">{e.wp_id || '–'}</td>
                    <td className="p-2">
                      {e.success ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground max-w-[300px] truncate">
                      {e.details || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters ? 'Keine Ergebnisse für diese Filter.' : 'Noch keine Aktivitäten.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-primary hover:underline mt-2">
              Filter zurücksetzen
            </button>
          )}
        </div>
      )}
    </div>
  )
}
