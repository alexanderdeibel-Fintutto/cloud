import { useState } from 'react'
import { CalendarClock, Plus, Check, Trash2, AlertTriangle, Clock, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useDeadlines,
  useCreateDeadline,
  useCompleteDeadline,
  useDeleteDeadline,
  daysUntil,
  deadlineUrgency,
  type Deadline,
} from '@/hooks/useDeadlines'

const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
  overdue: { label: 'Überfällig', color: 'text-white', bg: 'bg-destructive' },
  critical: { label: 'Kritisch', color: 'text-destructive', bg: 'bg-destructive/10' },
  warning: { label: 'Bald fällig', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/30' },
  ok: { label: 'Auf Kurs', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950/30' },
}

const typeLabels: Record<string, string> = {
  widerspruch: 'Widerspruch',
  zahlung: 'Zahlung',
  kuendigung: 'Kündigung',
  frist: 'Frist',
  termin: 'Termin',
  general: 'Allgemein',
}

export default function DeadlinesPage() {
  const { data: deadlines = [], isLoading } = useDeadlines({ includeCompleted: false })
  const createDeadline = useCreateDeadline()
  const completeDeadline = useCompleteDeadline()
  const deleteDeadline = useDeleteDeadline()

  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineType, setDeadlineType] = useState('general')
  const [priority, setPriority] = useState('high')
  const [description, setDescription] = useState('')

  const handleCreate = () => {
    if (!title.trim() || !deadlineDate) return
    const reminderDate = new Date(deadlineDate)
    reminderDate.setDate(reminderDate.getDate() - 3)
    createDeadline.mutate({
      title: title.trim(),
      deadline_date: deadlineDate,
      deadline_type: deadlineType,
      priority,
      description: description.trim() || undefined,
      reminder_date: reminderDate.toISOString().split('T')[0],
    }, {
      onSuccess: () => {
        setTitle('')
        setDeadlineDate('')
        setDescription('')
        setShowCreate(false)
      },
    })
  }

  // Group deadlines
  const overdue = deadlines.filter(d => daysUntil(d.deadline_date) < 0)
  const thisWeek = deadlines.filter(d => { const days = daysUntil(d.deadline_date); return days >= 0 && days <= 7 })
  const later = deadlines.filter(d => daysUntil(d.deadline_date) > 7)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-primary" />
            Fristen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {deadlines.length} offene Fristen
            {overdue.length > 0 && (
              <span className="text-destructive font-medium"> · {overdue.length} überfällig!</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Frist
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Neue Frist erstellen</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreate(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Titel (z.B. Widerspruchsfrist Bescheid)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              type="date"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              value={deadlineDate}
              onChange={e => setDeadlineDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Typ:</span>
            {Object.entries(typeLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={deadlineType === key ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setDeadlineType(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priorität:</span>
            <Button variant={priority === 'normal' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setPriority('normal')}>Normal</Button>
            <Button variant={priority === 'high' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setPriority('high')}>Hoch</Button>
            <Button variant={priority === 'urgent' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setPriority('urgent')}>Dringend</Button>
          </div>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none"
            placeholder="Beschreibung (optional)"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={!title.trim() || !deadlineDate}>Frist erstellen</Button>
        </div>
      )}

      {/* Deadline sections */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : deadlines.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Keine offenen Fristen</p>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <DeadlineSection
              title="Überfällig"
              icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
              deadlines={overdue}
              onComplete={id => completeDeadline.mutate(id)}
              onDelete={id => deleteDeadline.mutate(id)}
              className="border-destructive/30"
            />
          )}
          {thisWeek.length > 0 && (
            <DeadlineSection
              title="Diese Woche"
              icon={<Clock className="w-4 h-4 text-orange-500" />}
              deadlines={thisWeek}
              onComplete={id => completeDeadline.mutate(id)}
              onDelete={id => deleteDeadline.mutate(id)}
            />
          )}
          {later.length > 0 && (
            <DeadlineSection
              title="Später"
              icon={<CalendarClock className="w-4 h-4 text-muted-foreground" />}
              deadlines={later}
              onComplete={id => completeDeadline.mutate(id)}
              onDelete={id => deleteDeadline.mutate(id)}
            />
          )}
        </>
      )}
    </div>
  )
}

function DeadlineSection({
  title,
  icon,
  deadlines,
  onComplete,
  onDelete,
  className = '',
}: {
  title: string
  icon: React.ReactNode
  deadlines: Deadline[]
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}) {
  return (
    <div className={`rounded-xl border bg-card ${className}`}>
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-[10px] ml-auto">{deadlines.length}</Badge>
      </div>
      <div className="divide-y divide-border/50">
        {deadlines.map(d => {
          const days = daysUntil(d.deadline_date)
          const urgency = deadlineUrgency(d.deadline_date)
          const config = urgencyConfig[urgency]

          return (
            <div key={d.id} className="flex items-center gap-4 p-3 hover:bg-muted/30 transition-colors">
              {/* Urgency dot */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${config.bg} ${config.color}`}>
                {days < 0 ? `${Math.abs(days)}` : days === 0 ? '!' : days}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{d.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>
                    {new Date(d.deadline_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{typeLabels[d.deadline_type] || d.deadline_type}</Badge>
                  {d.priority === 'urgent' && <Badge variant="destructive" className="text-[10px]">Dringend</Badge>}
                  {d.document_title && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {d.document_title}
                    </span>
                  )}
                </div>
                {d.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.description}</p>
                )}
              </div>

              {/* Days label */}
              <span className={`text-xs font-medium shrink-0 ${config.color}`}>
                {days < 0 ? `${Math.abs(days)} Tage überfällig` :
                 days === 0 ? 'Heute!' :
                 days === 1 ? 'Morgen' :
                 `${days} Tage`}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => onComplete(d.id)}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(d.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
