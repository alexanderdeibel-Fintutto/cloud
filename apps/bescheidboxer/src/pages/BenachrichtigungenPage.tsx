import { useState, useMemo } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  CheckCheck,
  X,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatDate } from '../lib/utils'

type NotificationType = 'info' | 'warnung' | 'erfolg' | 'einspruch' | 'frist'
type NotificationFilter = 'alle' | NotificationType

interface Notification {
  id: string
  typ: NotificationType
  titel: string
  beschreibung: string
  datum: string
  gelesen: boolean
  link?: string
}

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  info: { icon: Info, color: 'text-fintutto-blue-500', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40', label: 'Info' },
  warnung: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', label: 'Warnung' },
  erfolg: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', label: 'Erfolg' },
  einspruch: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', label: 'Einspruch' },
  frist: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40', label: 'Frist' },
}

export default function BenachrichtigungenPage() {
  const { bescheide, fristen, einsprueche } = useBescheidContext()
  const [filter, setFilter] = useState<NotificationFilter>('alle')

  // Generate notifications from actual data
  const notifications: Notification[] = useMemo(() => {
    const notifs: Notification[] = []
    const now = new Date()

    // Bescheid-Benachrichtigungen
    bescheide.forEach(b => {
      if (b.status === 'geprueft') {
        notifs.push({
          id: `pruef-${b.id}`,
          typ: 'erfolg',
          titel: 'Pruefung abgeschlossen',
          beschreibung: `${b.titel} wurde erfolgreich geprueft.${
            b.pruefungsergebnis?.empfehlung === 'einspruch'
              ? ' Einspruch empfohlen!'
              : ''
          }`,
          datum: b.updatedAt,
          gelesen: false,
          link: `/bescheide/${b.id}`,
        })
      }

      if (b.status === 'neu') {
        notifs.push({
          id: `neu-${b.id}`,
          typ: 'info',
          titel: 'Neuer Bescheid',
          beschreibung: `${b.titel} wurde hochgeladen und wartet auf Pruefung.`,
          datum: b.createdAt,
          gelesen: true,
        })
      }

      if (b.abweichung && b.abweichung > 500) {
        notifs.push({
          id: `abw-${b.id}`,
          typ: 'warnung',
          titel: 'Hohe Abweichung erkannt',
          beschreibung: `${b.titel}: Abweichung von ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(b.abweichung)} festgestellt.`,
          datum: b.updatedAt,
          gelesen: false,
          link: `/bescheide/${b.id}`,
        })
      }
    })

    // Fristen-Benachrichtigungen
    fristen.forEach(f => {
      if (!f.erledigt) {
        const fristDate = new Date(f.fristdatum)
        const daysLeft = Math.ceil((fristDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysLeft < 0) {
          notifs.push({
            id: `frist-ue-${f.id}`,
            typ: 'warnung',
            titel: 'Frist ueberschritten!',
            beschreibung: `${f.bescheidTitel}: ${f.typ}-Frist am ${formatDate(f.fristdatum)} ist abgelaufen!`,
            datum: f.fristdatum,
            gelesen: false,
            link: '/fristen',
          })
        } else if (daysLeft <= 7) {
          notifs.push({
            id: `frist-${f.id}`,
            typ: 'frist',
            titel: `Frist in ${daysLeft} Tag${daysLeft !== 1 ? 'en' : ''}`,
            beschreibung: `${f.bescheidTitel}: ${f.typ}-Frist am ${formatDate(f.fristdatum)}.`,
            datum: f.fristdatum,
            gelesen: false,
            link: '/fristen',
          })
        }
      }
    })

    // Einspruch-Benachrichtigungen
    einsprueche.forEach(e => {
      const bescheid = bescheide.find(b => b.id === e.bescheidId)
      if (e.status === 'entschieden') {
        notifs.push({
          id: `ein-entsch-${e.id}`,
          typ: 'einspruch',
          titel: 'Einspruch entschieden',
          beschreibung: `Einspruch fuer ${bescheid?.titel || 'Bescheid'}: ${e.ergebnis || 'Entscheidung liegt vor'}.`,
          datum: e.antwortErhalten || e.createdAt,
          gelesen: false,
          link: '/einspruch',
        })
      }
      if (e.status === 'eingereicht') {
        notifs.push({
          id: `ein-${e.id}`,
          typ: 'info',
          titel: 'Einspruch eingereicht',
          beschreibung: `Einspruch fuer ${bescheid?.titel || 'Bescheid'} wurde eingereicht.`,
          datum: e.eingereichtAm || e.createdAt,
          gelesen: true,
          link: '/einspruch',
        })
      }
    })

    // Sort by date descending
    notifs.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    return notifs
  }, [bescheide, fristen, einsprueche])

  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(notifications.filter(n => n.gelesen).map(n => n.id))
  )

  const markAsRead = (id: string) => {
    setReadIds(prev => new Set([...prev, id]))
  }

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const deleteNotification = (id: string) => {
    setDeletedIds(prev => new Set([...prev, id]))
  }

  const visibleNotifications = useMemo(() => {
    let result = notifications.filter(n => !deletedIds.has(n.id))
    if (filter !== 'alle') {
      result = result.filter(n => n.typ === filter)
    }
    return result
  }, [notifications, deletedIds, filter])

  const unreadCount = notifications.filter(n => !readIds.has(n.id) && !deletedIds.has(n.id)).length

  const filterOptions: { value: NotificationFilter; label: string; count: number }[] = [
    { value: 'alle', label: 'Alle', count: notifications.filter(n => !deletedIds.has(n.id)).length },
    { value: 'warnung', label: 'Warnungen', count: notifications.filter(n => n.typ === 'warnung' && !deletedIds.has(n.id)).length },
    { value: 'frist', label: 'Fristen', count: notifications.filter(n => n.typ === 'frist' && !deletedIds.has(n.id)).length },
    { value: 'einspruch', label: 'Einsprueche', count: notifications.filter(n => n.typ === 'einspruch' && !deletedIds.has(n.id)).length },
    { value: 'erfolg', label: 'Erfolge', count: notifications.filter(n => n.typ === 'erfolg' && !deletedIds.has(n.id)).length },
    { value: 'info', label: 'Info', count: notifications.filter(n => n.typ === 'info' && !deletedIds.has(n.id)).length },
  ]

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: { label: string; items: typeof visibleNotifications }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const todayItems = visibleNotifications.filter(n => new Date(n.datum) >= today)
    const yesterdayItems = visibleNotifications.filter(n => {
      const d = new Date(n.datum)
      return d >= yesterday && d < today
    })
    const weekItems = visibleNotifications.filter(n => {
      const d = new Date(n.datum)
      return d >= weekAgo && d < yesterday
    })
    const olderItems = visibleNotifications.filter(n => new Date(n.datum) < weekAgo)

    if (todayItems.length > 0) groups.push({ label: 'Heute', items: todayItems })
    if (yesterdayItems.length > 0) groups.push({ label: 'Gestern', items: yesterdayItems })
    if (weekItems.length > 0) groups.push({ label: 'Diese Woche', items: weekItems })
    if (olderItems.length > 0) groups.push({ label: 'Aelter', items: olderItems })

    return groups
  }, [visibleNotifications])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Benachrichtigungen
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} neu
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bleiben Sie ueber Ihre Steuerbescheide informiert
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Alle als gelesen markieren
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
            <Badge variant={filter === opt.value ? 'secondary' : 'outline'} className="text-[10px] ml-0.5">
              {opt.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Notification List */}
      {groupedNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Keine Benachrichtigungen</p>
              <p className="text-sm mt-1">
                {filter !== 'alle'
                  ? 'Versuchen Sie einen anderen Filter.'
                  : 'Sie sind auf dem aktuellen Stand!'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map(notif => {
                  const cfg = NOTIFICATION_CONFIG[notif.typ]
                  const Icon = cfg.icon
                  const isRead = readIds.has(notif.id)

                  return (
                    <Card
                      key={notif.id}
                      className={`transition-all ${
                        !isRead ? 'border-l-4 border-l-primary' : 'opacity-80'
                      }`}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg ${cfg.bg} p-2 shrink-0 mt-0.5`}>
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium'}`}>
                                {notif.titel}
                              </p>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {cfg.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {notif.beschreibung}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(notif.datum)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => markAsRead(notif.id)}
                                title="Als gelesen markieren"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notif.id)}
                              title="Loeschen"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
