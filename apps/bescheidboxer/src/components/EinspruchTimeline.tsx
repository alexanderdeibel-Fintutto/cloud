import { CheckCircle2, Circle, Clock, Send, MessageSquare, XCircle } from 'lucide-react'
import type { EinspruchStatus } from '../types/bescheid'
import { formatDate, cn } from '../lib/utils'

interface TimelineStep {
  status: EinspruchStatus
  label: string
  icon: React.ElementType
  date?: string | null
}

const STEPS: TimelineStep[] = [
  { status: 'entwurf', label: 'Entwurf erstellt', icon: Circle },
  { status: 'eingereicht', label: 'Eingereicht', icon: Send },
  { status: 'in_bearbeitung', label: 'In Bearbeitung', icon: Clock },
  { status: 'entschieden', label: 'Entschieden', icon: MessageSquare },
]

const STATUS_ORDER: Record<EinspruchStatus, number> = {
  entwurf: 0,
  eingereicht: 1,
  in_bearbeitung: 2,
  entschieden: 3,
  zurueckgenommen: -1,
}

interface EinspruchTimelineProps {
  status: EinspruchStatus
  createdAt: string
  eingereichtAm: string | null
  antwortErhalten: string | null
}

export default function EinspruchTimeline({ status, createdAt, eingereichtAm, antwortErhalten }: EinspruchTimelineProps) {
  const currentOrder = STATUS_ORDER[status]

  // Special case: withdrawn
  if (status === 'zurueckgenommen') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-destructive">Einspruch zurueckgenommen</p>
          <p className="text-xs text-muted-foreground">
            Erstellt am {formatDate(createdAt)}
          </p>
        </div>
      </div>
    )
  }

  const dates: Record<string, string | null> = {
    entwurf: createdAt,
    eingereicht: eingereichtAm,
    in_bearbeitung: eingereichtAm, // no separate date, use eingereicht
    entschieden: antwortErhalten,
  }

  return (
    <div className="relative">
      <div className="space-y-0">
        {STEPS.map((step, idx) => {
          const stepOrder = STATUS_ORDER[step.status]
          const isCompleted = stepOrder < currentOrder
          const isCurrent = stepOrder === currentOrder
          const isFuture = stepOrder > currentOrder
          const Icon = isCompleted ? CheckCircle2 : step.icon
          const date = dates[step.status]

          return (
            <div key={step.status} className="flex gap-3">
              {/* Vertical line + icon */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-green-500 bg-green-500 text-white',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isFuture && 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-8',
                      stepOrder < currentOrder ? 'bg-green-500' : 'bg-border',
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <p className={cn(
                  'text-sm font-medium',
                  isFuture && 'text-muted-foreground',
                )}>
                  {step.label}
                </p>
                {date && !isFuture && (
                  <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                )}
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Aktuell
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
