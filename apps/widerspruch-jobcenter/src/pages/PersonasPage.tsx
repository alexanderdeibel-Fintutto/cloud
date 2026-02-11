import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'

export default function PersonasPage() {
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  const fetchPersonas = async (p: number) => {
    setLoading(true)
    try {
      const result = await api.getPersonas(p, 25)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPersonas(page) }, [page])

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 0

  const engagementColors: Record<string, string> = {
    schreiber: 'bg-green-100 text-green-800',
    kommentierer: 'bg-blue-100 text-blue-800',
    mixed: 'bg-purple-100 text-purple-800',
    liker: 'bg-yellow-100 text-yellow-800',
    lurker_gelegentlich: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Personas ({data?.total || 0})
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Alle generierten Personas und ihre Profile</p>
        </div>
      </div>

      {/* Persona Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: selected.avatar_color || '#3498db' }}>
                {selected.display_name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold">{selected.display_name}</h3>
                <p className="text-xs text-muted-foreground">@{selected.username}</p>
              </div>
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
                    <th className="text-left p-2 font-medium">ID</th>
                    <th className="text-left p-2 font-medium">Persona</th>
                    <th className="text-left p-2 font-medium">Situation</th>
                    <th className="text-left p-2 font-medium">Engagement</th>
                    <th className="text-left p-2 font-medium">Frequenz</th>
                    <th className="text-left p-2 font-medium">Zeitprofil</th>
                    <th className="text-left p-2 font-medium">Foren</th>
                    <th className="text-left p-2 font-medium">BB-Aff.</th>
                    <th className="text-left p-2 font-medium">WP-ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p: any) => (
                    <tr
                      key={p.id}
                      className="border-t border-border hover:bg-muted/50 cursor-pointer"
                      onClick={async () => {
                        try {
                          const full = await api.getPersona(p.id)
                          setSelected(full)
                        } catch { setSelected(p) }
                      }}
                    >
                      <td className="p-2 text-muted-foreground">{p.id}</td>
                      <td className="p-2">
                        <div className="font-medium">{p.display_name}</div>
                        <div className="text-muted-foreground">@{p.username}</div>
                      </td>
                      <td className="p-2">{p.situation}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${engagementColors[p.engagement_style] || ''}`}>
                          {p.engagement_style}
                        </span>
                      </td>
                      <td className="p-2">{p.posting_frequency}</td>
                      <td className="p-2">{p.time_profile}</td>
                      <td className="p-2">{p.active_forums?.slice(0, 2).join(', ')}</td>
                      <td className="p-2">{(p.bescheidboxer_affinity * 100).toFixed(0)}%</td>
                      <td className="p-2">{p.wp_user_id || '–'}</td>
                    </tr>
                  ))}
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
          <p className="text-sm text-muted-foreground">Noch keine Personas generiert.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klicke im Dashboard auf "500 Personas generieren".
          </p>
        </div>
      )}
    </div>
  )
}
