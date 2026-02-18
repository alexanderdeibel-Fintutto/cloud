import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Calendar, Clock } from 'lucide-react'
import { api } from '@/lib/api'

export default function SchedulePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const result = await api.getScheduleToday()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchedule() }, [])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    executing: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const actionLabels: Record<string, string> = {
    blog_post: 'Blog-Post',
    blog_comment: 'Kommentar',
    blog_comment_reply: 'Antwort',
    forum_topic: 'Forum-Topic',
    forum_reply: 'Forum-Antwort',
    like: 'Like',
  }

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Zeitplan heute
        </h1>
        <button onClick={fetchSchedule} className="btn-forum-ghost text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Aktualisieren
        </button>
      </div>

      {/* Summary */}
      {data?.summary && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Gesamt</p>
              <p className="text-lg font-bold">{data.summary.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Personas</p>
              <p className="text-lg font-bold">{data.summary.personas}</p>
            </div>
          </div>

          {/* Hour distribution bar chart */}
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Verteilung nach Stunde</h3>
          <div className="flex items-end gap-0.5 h-20">
            {Array.from({ length: 24 }, (_, h) => {
              const count = data.summary.byHour?.[h] || 0
              const maxCount = Math.max(1, ...Object.values(data.summary.byHour || {}) as number[])
              const height = count > 0 ? Math.max(4, (count / maxCount) * 100) : 0
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-primary/80 rounded-t-sm transition-all"
                    style={{ height: `${height}%` }}
                    title={`${h}:00 – ${count} Aktionen`}
                  />
                  {h % 3 === 0 && (
                    <span className="text-[8px] text-muted-foreground">{h}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions Table */}
      {loading ? (
        <div className="text-center py-8"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
      ) : data?.actions?.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left p-2 font-medium">Uhrzeit</th>
                  <th className="text-left p-2 font-medium">Persona</th>
                  <th className="text-left p-2 font-medium">Typ</th>
                  <th className="text-left p-2 font-medium">Forum</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Inhalt</th>
                </tr>
              </thead>
              <tbody>
                {data.actions.map((a: any) => (
                  <tr key={a.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {new Date(a.scheduled_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2">{a.persona_id}</td>
                    <td className="p-2">{actionLabels[a.action_type] || a.action_type}</td>
                    <td className="p-2 text-muted-foreground">{a.target?.forum_id || '–'}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusColors[a.status] || ''}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-2 text-muted-foreground max-w-[200px] truncate">
                      {a.content?.title || a.content?.body?.slice(0, 50) || '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Kein Zeitplan vorhanden.</p>
          <p className="text-xs text-muted-foreground mt-1">Erstelle einen Tagesplan im Dashboard.</p>
        </div>
      )}
    </div>
  )
}
