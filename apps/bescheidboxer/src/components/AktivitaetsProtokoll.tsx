import { useMemo } from 'react'
import {
  FileText,
  Upload,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Search,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { formatDate } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import type { Bescheid, Einspruch, Frist } from '../types/bescheid'

interface AktivitaetEvent {
  id: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  label: string
  detail: string
  date: string
  timestamp: number
}

function bescheidToEvents(b: Bescheid): AktivitaetEvent[] {
  const events: AktivitaetEvent[] = []

  events.push({
    id: `b-created-${b.id}`,
    icon: Upload,
    iconColor: 'text-fintutto-blue-600',
    iconBg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900',
    label: `Bescheid erfasst: ${b.titel}`,
    detail: `${b.finanzamt} - Steuerjahr ${b.steuerjahr}`,
    date: b.createdAt,
    timestamp: new Date(b.createdAt).getTime(),
  })

  if (b.status === 'in_pruefung') {
    events.push({
      id: `b-pruefung-${b.id}`,
      icon: Search,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      label: `Pruefung gestartet: ${b.titel}`,
      detail: 'KI-Analyse laeuft',
      date: b.updatedAt,
      timestamp: new Date(b.updatedAt).getTime(),
    })
  }

  if (b.status === 'geprueft' && b.pruefungsergebnis) {
    events.push({
      id: `b-geprueft-${b.id}`,
      icon: b.pruefungsergebnis.empfehlung === 'einspruch' ? AlertTriangle : CheckCircle2,
      iconColor: b.pruefungsergebnis.empfehlung === 'einspruch' ? 'text-red-600' : 'text-green-600',
      iconBg: b.pruefungsergebnis.empfehlung === 'einspruch' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900',
      label: `Analyse abgeschlossen: ${b.titel}`,
      detail: b.pruefungsergebnis.empfehlung === 'einspruch'
        ? 'Einspruch empfohlen'
        : b.pruefungsergebnis.empfehlung === 'pruefen'
        ? 'Weitere Pruefung empfohlen'
        : 'Bescheid in Ordnung',
      date: b.updatedAt,
      timestamp: new Date(b.updatedAt).getTime(),
    })
  }

  if (b.status === 'erledigt') {
    events.push({
      id: `b-erledigt-${b.id}`,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100 dark:bg-green-900',
      label: `Erledigt: ${b.titel}`,
      detail: 'Bescheid als erledigt markiert',
      date: b.updatedAt,
      timestamp: new Date(b.updatedAt).getTime(),
    })
  }

  return events
}

function einspruchToEvents(e: Einspruch, bescheidTitel: string): AktivitaetEvent[] {
  const events: AktivitaetEvent[] = []

  events.push({
    id: `e-created-${e.id}`,
    icon: ShieldAlert,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100 dark:bg-red-900',
    label: `Einspruch erstellt: ${bescheidTitel}`,
    detail: 'Entwurf erstellt',
    date: e.createdAt,
    timestamp: new Date(e.createdAt).getTime(),
  })

  if (e.eingereichtAm) {
    events.push({
      id: `e-eingereicht-${e.id}`,
      icon: FileText,
      iconColor: 'text-fintutto-blue-600',
      iconBg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900',
      label: `Einspruch eingereicht: ${bescheidTitel}`,
      detail: 'An Finanzamt gesendet',
      date: e.eingereichtAm,
      timestamp: new Date(e.eingereichtAm).getTime(),
    })
  }

  if (e.status === 'zurueckgenommen') {
    events.push({
      id: `e-zurueck-${e.id}`,
      icon: XCircle,
      iconColor: 'text-muted-foreground',
      iconBg: 'bg-muted',
      label: `Einspruch zurueckgenommen: ${bescheidTitel}`,
      detail: 'Einspruch wurde zurueckgenommen',
      date: e.createdAt,
      timestamp: new Date(e.createdAt).getTime(),
    })
  }

  return events
}

function fristToEvents(f: Frist): AktivitaetEvent[] {
  if (!f.erledigt) return []
  return [{
    id: `f-done-${f.id}`,
    icon: Clock,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100 dark:bg-green-900',
    label: `Frist erledigt: ${f.bescheidTitel}`,
    detail: `${f.typ.charAt(0).toUpperCase() + f.typ.slice(1)}-Frist`,
    date: f.fristdatum,
    timestamp: new Date(f.fristdatum).getTime(),
  }]
}

export default function AktivitaetsProtokoll({ maxItems = 8 }: { maxItems?: number }) {
  const { bescheide, einsprueche, fristen } = useBescheidContext()

  const events = useMemo(() => {
    const allEvents: AktivitaetEvent[] = []

    for (const b of bescheide) {
      allEvents.push(...bescheidToEvents(b))
    }

    for (const e of einsprueche) {
      const b = bescheide.find(b => b.id === e.bescheidId)
      allEvents.push(...einspruchToEvents(e, b?.titel ?? 'Unbekannt'))
    }

    for (const f of fristen) {
      allEvents.push(...fristToEvents(f))
    }

    allEvents.sort((a, b) => b.timestamp - a.timestamp)
    return allEvents.slice(0, maxItems)
  }, [bescheide, einsprueche, fristen, maxItems])

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Noch keine Aktivitaeten vorhanden.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const Icon = event.icon
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${event.iconBg} shrink-0`}>
                <Icon className={`h-4 w-4 ${event.iconColor}`} />
              </div>
              {idx < events.length - 1 && (
                <div className="w-px flex-1 bg-border min-h-[16px]" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <p className="text-sm font-medium truncate">{event.label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{event.detail}</p>
                <span className="text-xs text-muted-foreground">&middot;</span>
                <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
