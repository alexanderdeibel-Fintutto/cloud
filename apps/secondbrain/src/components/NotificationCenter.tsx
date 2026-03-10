import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, FileText, AlertTriangle, CalendarClock, Inbox, CheckCircle,
  X, ChevronRight, Clock, Brain, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDocuments } from '@/hooks/useDocuments'
import { useUpcomingDeadlines, daysUntil } from '@/hooks/useDeadlines'
import { useActivityLog } from '@/hooks/useActivityLog'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { formatRelativeTime } from '@/lib/utils'

interface Notification {
  id: string
  type: 'inbox' | 'deadline' | 'action' | 'ocr' | 'activity'
  title: string
  description: string
  icon: React.ReactNode
  urgent: boolean
  timestamp: string
  link?: string
}

const DISMISSED_KEY = 'sb-dismissed-notifications'

function getDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function setDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]))
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissedState] = useState<Set<string>>(getDismissed)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: documents = [] } = useDocuments()
  const { data: deadlines = [] } = useUpcomingDeadlines(14)
  const { data: activities = [] } = useActivityLog(20)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Build notifications
  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = []

    // Inbox documents needing attention
    const inboxDocs = documents.filter(d =>
      !d.status || d.status === 'inbox' || d.status === 'action_required'
    )
    if (inboxDocs.length > 0) {
      items.push({
        id: 'inbox-summary',
        type: 'inbox',
        title: `${inboxDocs.length} Dokument${inboxDocs.length !== 1 ? 'e' : ''} im Eingang`,
        description: inboxDocs.slice(0, 2).map(d => d.title).join(', ') +
          (inboxDocs.length > 2 ? ` und ${inboxDocs.length - 2} weitere` : ''),
        icon: <Inbox className="w-4 h-4 text-blue-500" />,
        urgent: inboxDocs.some(d => d.status === 'action_required' || d.priority === 'urgent'),
        timestamp: inboxDocs[0]?.created_at || new Date().toISOString(),
        link: '/eingang',
      })
    }

    // Urgent documents
    const urgentDocs = documents.filter(d => d.priority === 'urgent')
    for (const doc of urgentDocs.slice(0, 3)) {
      const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other']
      items.push({
        id: `urgent-${doc.id}`,
        type: 'action',
        title: `Dringend: ${doc.title}`,
        description: typeInfo?.label || 'Dokument erfordert sofortige Aufmerksamkeit',
        icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
        urgent: true,
        timestamp: doc.created_at,
        link: `/dokumente/${doc.id}`,
      })
    }

    // Overdue deadlines
    for (const dl of deadlines) {
      const days = daysUntil(dl.deadline_date)
      if (days < 0) {
        items.push({
          id: `deadline-overdue-${dl.id}`,
          type: 'deadline',
          title: `Frist überfällig: ${dl.title}`,
          description: `Seit ${Math.abs(days)} Tag${Math.abs(days) !== 1 ? 'en' : ''} überfällig`,
          icon: <CalendarClock className="w-4 h-4 text-destructive" />,
          urgent: true,
          timestamp: dl.deadline_date,
          link: '/fristen',
        })
      } else if (days <= 3) {
        items.push({
          id: `deadline-soon-${dl.id}`,
          type: 'deadline',
          title: `Frist in ${days} Tag${days !== 1 ? 'en' : ''}`,
          description: dl.title,
          icon: <CalendarClock className="w-4 h-4 text-orange-500" />,
          urgent: days <= 1,
          timestamp: dl.deadline_date,
          link: '/fristen',
        })
      }
    }

    // OCR processing/failed
    const ocrPending = documents.filter(d => d.ocr_status === 'processing')
    if (ocrPending.length > 0) {
      items.push({
        id: 'ocr-processing',
        type: 'ocr',
        title: `${ocrPending.length} Dokument${ocrPending.length !== 1 ? 'e' : ''} werden analysiert`,
        description: 'KI-Analyse läuft...',
        icon: <Brain className="w-4 h-4 text-primary animate-pulse" />,
        urgent: false,
        timestamp: new Date().toISOString(),
      })
    }

    const ocrFailed = documents.filter(d => d.ocr_status === 'failed')
    for (const doc of ocrFailed.slice(0, 2)) {
      items.push({
        id: `ocr-failed-${doc.id}`,
        type: 'ocr',
        title: `OCR fehlgeschlagen: ${doc.title}`,
        description: 'Klicke hier um es erneut zu versuchen',
        icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
        urgent: false,
        timestamp: doc.created_at,
        link: `/dokumente/${doc.id}`,
      })
    }

    return items
  }, [documents, deadlines])

  // Filter out dismissed
  const visible = notifications.filter(n => !dismissed.has(n.id))
  const urgentCount = visible.filter(n => n.urgent).length
  const totalCount = visible.length

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissedState(next)
    setDismissed(next)
  }

  const handleDismissAll = () => {
    const next = new Set(dismissed)
    visible.forEach(n => next.add(n.id))
    setDismissedState(next)
    setDismissed(next)
  }

  const handleClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        title={`${totalCount} Benachrichtigungen`}
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 text-[9px] font-bold rounded-full flex items-center justify-center ${
            urgentCount > 0 ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'
          }`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Benachrichtigungen
              {totalCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">{totalCount}</Badge>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {totalCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleDismissAll}>
                  Alle lesen
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {visible.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Alles erledigt!</p>
                <p className="text-xs text-muted-foreground mt-1">Keine neuen Benachrichtigungen</p>
              </div>
            ) : (
              visible.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors group ${
                    notification.urgent ? 'bg-destructive/5' : ''
                  } ${notification.link ? 'cursor-pointer' : ''}`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(notification.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {notification.link && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <button
                      className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); handleDismiss(notification.id) }}
                      title="Verwerfen"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {visible.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => { navigate('/eingang'); setOpen(false) }}
                >
                  <Inbox className="w-3 h-3 mr-1" /> Eingangskorb
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => { navigate('/fristen'); setOpen(false) }}
                >
                  <CalendarClock className="w-3 h-3 mr-1" /> Fristen
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
