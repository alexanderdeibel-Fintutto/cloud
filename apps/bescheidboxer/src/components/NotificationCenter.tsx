import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn, formatDate } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'

interface Notification {
  id: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  detail: string
  date: string
  href: string
  urgency: 'high' | 'medium' | 'low'
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('bescheidboxer-dismissed-notifications')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })
  const ref = useRef<HTMLDivElement>(null)
  const { bescheide, fristen, einsprueche } = useBescheidContext()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const notifications = useMemo(() => {
    const now = new Date()
    const items: Notification[] = []

    // Overdue Fristen
    for (const f of fristen) {
      if (f.erledigt) continue
      const fristDate = new Date(f.fristdatum)
      const daysLeft = Math.ceil((fristDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft < 0) {
        items.push({
          id: `frist-overdue-${f.id}`,
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900',
          title: `Frist ueberfaellig: ${f.bescheidTitel}`,
          detail: `${Math.abs(daysLeft)} Tage ueberfaellig (${f.typ})`,
          date: f.fristdatum,
          href: '/fristen',
          urgency: 'high',
        })
      } else if (daysLeft <= 7) {
        items.push({
          id: `frist-urgent-${f.id}`,
          icon: Clock,
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100 dark:bg-amber-900',
          title: `Frist laeuft ab: ${f.bescheidTitel}`,
          detail: `Noch ${daysLeft} Tag${daysLeft !== 1 ? 'e' : ''} (${f.typ})`,
          date: f.fristdatum,
          href: '/fristen',
          urgency: daysLeft <= 3 ? 'high' : 'medium',
        })
      }
    }

    // Bescheide with Einspruch recommendation
    for (const b of bescheide) {
      if (b.pruefungsergebnis?.empfehlung === 'einspruch' && b.status !== 'einspruch' && b.status !== 'erledigt') {
        const hasEinspruch = einsprueche.some(e => e.bescheidId === b.id)
        if (!hasEinspruch) {
          items.push({
            id: `einspruch-empf-${b.id}`,
            icon: ShieldAlert,
            iconColor: 'text-red-600',
            iconBg: 'bg-red-100 dark:bg-red-900',
            title: `Einspruch empfohlen: ${b.titel}`,
            detail: 'KI-Analyse empfiehlt einen Einspruch',
            date: b.updatedAt,
            href: `/einspruch/neu/${b.id}`,
            urgency: 'high',
          })
        }
      }
    }

    // Unchecked Bescheide
    const unchecked = bescheide.filter(b => b.status === 'neu')
    if (unchecked.length > 0) {
      items.push({
        id: 'unchecked-bescheide',
        icon: FileText,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900',
        title: `${unchecked.length} Bescheid${unchecked.length > 1 ? 'e' : ''} ungepr\u00fcft`,
        detail: 'Starten Sie die KI-Analyse',
        date: unchecked[0].createdAt,
        href: '/analyse',
        urgency: 'low',
      })
    }

    // Pending Einsprueche
    const pendingEinsprueche = einsprueche.filter(e => e.status === 'in_bearbeitung')
    for (const e of pendingEinsprueche) {
      const b = bescheide.find(b => b.id === e.bescheidId)
      items.push({
        id: `einspruch-pending-${e.id}`,
        icon: ShieldAlert,
        iconColor: 'text-fintutto-blue-600',
        iconBg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900',
        title: `Einspruch in Bearbeitung`,
        detail: b?.titel ?? 'Unbekannter Bescheid',
        date: e.createdAt,
        href: '/einspruch',
        urgency: 'low',
      })
    }

    // Sort by urgency, then date
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    items.sort((a, b) => {
      const u = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (u !== 0) return u
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return items
  }, [bescheide, fristen, einsprueche])

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id))
  const unreadCount = visibleNotifications.filter(n => n.urgency !== 'low').length

  const dismiss = (id: string) => {
    const next = new Set(dismissed)
    next.add(id)
    setDismissed(next)
    localStorage.setItem('bescheidboxer-dismissed-notifications', JSON.stringify([...next]))
  }

  const clearAll = () => {
    const ids = new Set(notifications.map(n => n.id))
    setDismissed(ids)
    localStorage.setItem('bescheidboxer-dismissed-notifications', JSON.stringify([...ids]))
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label="Benachrichtigungen"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Benachrichtigungen</h3>
            {visibleNotifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Alle ausblenden
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">Alles erledigt!</p>
                <p className="text-xs text-muted-foreground">Keine neuen Benachrichtigungen</p>
              </div>
            ) : (
              visibleNotifications.map(notif => {
                const Icon = notif.icon
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors hover:bg-accent/50',
                      notif.urgency === 'high' && 'bg-red-50/50 dark:bg-red-900/10',
                    )}
                  >
                    <div className={cn('rounded-full p-1.5 mt-0.5 shrink-0', notif.iconBg)}>
                      <Icon className={cn('h-3.5 w-3.5', notif.iconColor)} />
                    </div>
                    <Link
                      to={notif.href}
                      onClick={() => setOpen(false)}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.detail}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(notif.date)}</p>
                    </Link>
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="shrink-0 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Ausblenden"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2">
            <Link
              to="/fristen"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              Alle Fristen anzeigen
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
