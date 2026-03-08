import { Clock, MessageSquare, FileText, Trash2, Upload, Star, Search, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
}

export default function HistoryPage() {
  const { data: activities = [], isLoading } = useActivityLog()
  const clearLog = useClearActivityLog()

  const handleClear = async () => {
    try {
      await clearLog.mutateAsync()
      toast.success('Verlauf gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  // Group activities by date
  const grouped = activities.reduce<Record<string, typeof activities>>((acc, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
            Deine letzten Aktivitäten und Chat-Verläufe
          </p>
        </div>
        {activities.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} disabled={clearLog.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Verlauf löschen
          </Button>
        )}
      </div>

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
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">Kein Verlauf</h3>
            <p className="text-sm text-muted-foreground">
              Deine Aktivitäten werden hier angezeigt, sobald du Dokumente hochlädst oder den KI-Chat nutzt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {entries.map((entry) => {
                    const config = actionConfig[entry.action] || { icon: Clock, label: entry.action, color: 'text-muted-foreground bg-muted' }
                    const Icon = config.icon
                    const meta = entry.metadata as Record<string, string>
                    const description = meta?.title || meta?.query || meta?.file_name || ''

                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{config.label}</p>
                          {description && (
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelativeTime(entry.created_at)}
                        </span>
                      </div>
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
