import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MessageSquare, FileText, Trash2, Upload, Star, Search, Eye, Filter, ArrowRight, Merge, Archive, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActivityLog, useClearActivityLog } from '@/hooks/useActivityLog'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

const actionConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  upload: { icon: Upload, label: 'Hochgeladen', color: 'text-green-500 bg-green-500/10' },
  view: { icon: Eye, label: 'Angesehen', color: 'text-blue-500 bg-blue-500/10' },
  search: { icon: Search, label: 'Gesucht', color: 'text-purple-500 bg-purple-500/10' },
  chat: { icon: MessageSquare, label: 'Chat', color: 'text-indigo-500 bg-indigo-500/10' },
  favorite: { icon: Star, label: 'Favorisiert', color: 'text-yellow-500 bg-yellow-500/10' },
  delete: { icon: Trash2, label: 'Gelöscht', color: 'text-red-500 bg-red-500/10' },
  forward: { icon: ArrowRight, label: 'Weitergeleitet', color: 'text-cyan-500 bg-cyan-500/10' },
  merge: { icon: Merge, label: 'Zusammengeführt', color: 'text-orange-500 bg-orange-500/10' },
  archive: { icon: Archive, label: 'Archiviert', color: 'text-slate-500 bg-slate-500/10' },
  done: { icon: CheckCircle, label: 'Erledigt', color: 'text-emerald-500 bg-emerald-500/10' },
}

const filterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'upload', label: 'Hochgeladen' },
  { value: 'view', label: 'Angesehen' },
  { value: 'favorite', label: 'Favorisiert' },
  { value: 'search', label: 'Gesucht' },
  { value: 'chat', label: 'Chat' },
  { value: 'delete', label: 'Gelöscht' },
]

export default function HistoryPage() {
  const { data: activities = [], isLoading } = useActivityLog(200)
  const clearLog = useClearActivityLog()
  const [actionFilter, setActionFilter] = useState('all')

  const handleClear = async () => {
    try {
      await clearLog.mutateAsync()
      toast.success('Verlauf gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  const filtered = useMemo(() => {
    if (actionFilter === 'all') return activities
    return activities.filter(a => a.action === actionFilter)
  }, [activities, actionFilter])

  // Action counts for filter badges
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of activities) {
      counts[a.action] = (counts[a.action] || 0) + 1
    }
    return counts
  }, [activities])

  // Group activities by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, activity) => {
    const d = new Date(activity.created_at)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    let date: string
    if (d.toDateString() === today.toDateString()) {
      date = 'Heute'
    } else if (d.toDateString() === yesterday.toDateString()) {
      date = 'Gestern'
    } else {
      date = d.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Verlauf
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activities.length} Aktivität{activities.length !== 1 ? 'en' : ''} aufgezeichnet
          </p>
        </div>
        {activities.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} disabled={clearLog.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Verlauf löschen
          </Button>
        )}
      </div>

      {/* Action type filters */}
      {activities.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterOptions.map(opt => {
            const count = opt.value === 'all' ? activities.length : (actionCounts[opt.value] || 0)
            if (opt.value !== 'all' && count === 0) return null
            return (
              <button
                key={opt.value}
                onClick={() => setActionFilter(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  actionFilter === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {opt.label}
                <span className={`text-[10px] ${actionFilter === opt.value ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Activity summary stats */}
      {activities.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([action, count]) => {
              const config = actionConfig[action] || { icon: Clock, label: action, color: 'text-muted-foreground bg-muted' }
              const Icon = config.icon
              return (
                <button
                  key={action}
                  onClick={() => setActionFilter(action)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                    actionFilter === action ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none">{count}</p>
                    <p className="text-[10px] text-muted-foreground">{config.label}</p>
                  </div>
                </button>
              )
            })}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {actionFilter !== 'all' ? 'Keine Einträge für diesen Filter' : 'Kein Verlauf'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {actionFilter !== 'all'
                ? 'Wähle einen anderen Filter oder zeige alle Aktivitäten.'
                : 'Deine Aktivitäten werden hier angezeigt, sobald du Dokumente hochlädst oder den KI-Chat nutzt.'}
            </p>
            {actionFilter !== 'all' && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setActionFilter('all')}>
                Alle anzeigen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                {date}
                <Badge variant="secondary" className="text-[10px]">{entries.length}</Badge>
              </h3>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {entries.map((entry) => {
                    const config = actionConfig[entry.action] || { icon: Clock, label: entry.action, color: 'text-muted-foreground bg-muted' }
                    const Icon = config.icon
                    const meta = entry.metadata as Record<string, string>
                    const description = meta?.title || meta?.query || meta?.file_name || ''
                    const isDocument = entry.entity_type === 'document' && entry.entity_id

                    const content = (
                      <div className={`flex items-center gap-3 p-3 transition-colors ${isDocument ? 'hover:bg-muted/50 cursor-pointer' : ''}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{config.label}</p>
                            {entry.entity_type === 'document' && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                <FileText className="w-2.5 h-2.5 mr-0.5" />
                                Dokument
                              </Badge>
                            )}
                          </div>
                          {description && (
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(entry.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )

                    return isDocument ? (
                      <Link key={entry.id} to={`/dokumente/${entry.entity_id}`}>
                        {content}
                      </Link>
                    ) : (
                      <div key={entry.id}>{content}</div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
