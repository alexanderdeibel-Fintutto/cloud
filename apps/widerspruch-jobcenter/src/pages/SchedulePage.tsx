import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function SchedulePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [availableDates, setAvailableDates] = useState<string[]>([])

  const isToday = selectedDate === todayStr()

  const fetchSchedule = async (date: string) => {
    setLoading(true)
    try {
      const result = date === todayStr()
        ? await api.getScheduleToday()
        : await api.getScheduleByDate(date)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.getScheduleDates().then(setAvailableDates).catch(() => {})
  }, [])

  useEffect(() => { fetchSchedule(selectedDate) }, [selectedDate])

  const goBack = () => setSelectedDate(addDays(selectedDate, -1))
  const goForward = () => {
    const next = addDays(selectedDate, 1)
    if (next <= todayStr()) setSelectedDate(next)
  }
  const goToday = () => setSelectedDate(todayStr())

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

  const statusLabels: Record<string, string> = {
    pending: 'Ausstehend',
    executing: 'Wird ausgeführt',
    done: 'Erledigt',
    failed: 'Fehlgeschlagen',
  }

  // Status counts for summary
  const statusCounts = data?.actions?.reduce((acc: Record<string, number>, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="forum-container">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      {/* Header with date navigation */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Zeitplan
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-1">
            <button onClick={goBack} className="p-1.5 hover:bg-muted rounded" title="Tag zurück">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={goToday}
              className={`px-2 py-1 text-xs font-medium rounded ${isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {formatDate(selectedDate)}
            </button>
            <button
              onClick={goForward}
              disabled={isToday}
              className="p-1.5 hover:bg-muted rounded disabled:opacity-30"
              title="Tag vor"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {!isToday && (
            <button onClick={goToday} className="btn-forum-ghost text-xs">
              Heute
            </button>
          )}
          <button onClick={() => fetchSchedule(selectedDate)} className="btn-forum-ghost text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date quick-select for available history dates */}
      {availableDates.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {availableDates.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`text-[10px] px-2 py-1 rounded border ${
                d === selectedDate
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      {data?.summary && data.summary.total > 0 && (
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
            {statusCounts.done > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Erledigt</p>
                <p className="text-lg font-bold text-green-600">{statusCounts.done}</p>
              </div>
            )}
            {statusCounts.failed > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Fehlgeschlagen</p>
                <p className="text-lg font-bold text-red-600">{statusCounts.failed}</p>
              </div>
            )}
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
                        {statusLabels[a.status] || a.status}
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
          <p className="text-sm text-muted-foreground">
            {isToday ? 'Kein Zeitplan vorhanden.' : `Kein Zeitplan für ${formatDate(selectedDate)} vorhanden.`}
          </p>
          {isToday && (
            <p className="text-xs text-muted-foreground mt-1">Erstelle einen Tagesplan im Dashboard.</p>
          )}
        </div>
      )}
    </div>
  )
}
