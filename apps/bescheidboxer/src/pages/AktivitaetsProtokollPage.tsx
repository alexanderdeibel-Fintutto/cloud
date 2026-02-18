import { useMemo, useState } from 'react'
import {
  Activity,
  Upload,
  Search,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatDate } from '../lib/utils'

type AktivitaetsTyp = 'upload' | 'analyse' | 'einspruch' | 'frist' | 'ansicht' | 'system'

interface Aktivitaet {
  id: string
  typ: AktivitaetsTyp
  titel: string
  beschreibung: string
  datum: string
  icon: typeof Activity
  farbe: string
  bg: string
}

const TYP_CONFIG: Record<AktivitaetsTyp, { icon: typeof Activity; farbe: string; bg: string; label: string }> = {
  upload: { icon: Upload, farbe: 'text-fintutto-blue-500', bg: 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40', label: 'Upload' },
  analyse: { icon: Search, farbe: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/40', label: 'Analyse' },
  einspruch: { icon: ShieldAlert, farbe: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', label: 'Einspruch' },
  frist: { icon: Clock, farbe: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/40', label: 'Frist' },
  ansicht: { icon: Eye, farbe: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/40', label: 'Ansicht' },
  system: { icon: CheckCircle2, farbe: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/40', label: 'System' },
}

export default function AktivitaetsProtokollPage() {
  const { bescheide, einsprueche, fristen } = useBescheidContext()
  const [filterTyp, setFilterTyp] = useState<string>('alle')

  // Generate activity from real data
  const aktivitaeten: Aktivitaet[] = useMemo(() => {
    const items: Aktivitaet[] = []

    bescheide.forEach(b => {
      items.push({
        id: `upload-${b.id}`,
        typ: 'upload',
        titel: 'Bescheid hochgeladen',
        beschreibung: `${b.titel} (${b.steuerjahr}) wurde hochgeladen.`,
        datum: b.createdAt,
        ...TYP_CONFIG.upload,
      })

      if (b.status !== 'neu') {
        items.push({
          id: `analyse-${b.id}`,
          typ: 'analyse',
          titel: 'Analyse durchgefuehrt',
          beschreibung: `${b.titel} wurde analysiert.${
            b.pruefungsergebnis?.empfehlung === 'einspruch'
              ? ' Einspruch empfohlen.'
              : b.pruefungsergebnis?.empfehlung === 'akzeptieren'
                ? ' Bescheid korrekt.'
                : ''
          }`,
          datum: b.updatedAt,
          ...TYP_CONFIG.analyse,
        })
      }
    })

    einsprueche.forEach(e => {
      const b = bescheide.find(x => x.id === e.bescheidId)
      items.push({
        id: `einspruch-${e.id}`,
        typ: 'einspruch',
        titel: `Einspruch ${e.status === 'eingereicht' ? 'eingereicht' : e.status === 'entschieden' ? 'entschieden' : 'erstellt'}`,
        beschreibung: `Einspruch fuer ${b?.titel || 'Bescheid'} (${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(e.forderung)}).`,
        datum: e.eingereichtAm || e.createdAt,
        ...TYP_CONFIG.einspruch,
      })
    })

    fristen.forEach(f => {
      if (f.erledigt) {
        items.push({
          id: `frist-${f.id}`,
          typ: 'frist',
          titel: 'Frist erledigt',
          beschreibung: `${f.typ}-Frist fuer ${f.bescheidTitel} wurde als erledigt markiert.`,
          datum: f.fristdatum,
          ...TYP_CONFIG.frist,
        })
      }
    })

    // Sort newest first
    items.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    return items
  }, [bescheide, einsprueche, fristen])

  const filtered = useMemo(() => {
    if (filterTyp === 'alle') return aktivitaeten
    return aktivitaeten.filter(a => a.typ === filterTyp)
  }, [aktivitaeten, filterTyp])

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; items: Aktivitaet[] }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const todayItems = filtered.filter(a => new Date(a.datum) >= today)
    const yesterdayItems = filtered.filter(a => {
      const d = new Date(a.datum)
      return d >= yesterday && d < today
    })
    const weekItems = filtered.filter(a => {
      const d = new Date(a.datum)
      return d >= weekAgo && d < yesterday
    })
    const monthItems = filtered.filter(a => {
      const d = new Date(a.datum)
      return d >= monthAgo && d < weekAgo
    })
    const olderItems = filtered.filter(a => new Date(a.datum) < monthAgo)

    if (todayItems.length > 0) groups.push({ label: 'Heute', items: todayItems })
    if (yesterdayItems.length > 0) groups.push({ label: 'Gestern', items: yesterdayItems })
    if (weekItems.length > 0) groups.push({ label: 'Diese Woche', items: weekItems })
    if (monthItems.length > 0) groups.push({ label: 'Diesen Monat', items: monthItems })
    if (olderItems.length > 0) groups.push({ label: 'Aelter', items: olderItems })

    return groups
  }, [filtered])

  const typCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    aktivitaeten.forEach(a => {
      counts[a.typ] = (counts[a.typ] || 0) + 1
    })
    return counts
  }, [aktivitaeten])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8" />
            Aktivitaets-Protokoll
          </h1>
          <p className="text-muted-foreground mt-1">
            {aktivitaeten.length} Aktivitaeten insgesamt
          </p>
        </div>
        <Select value={filterTyp} onValueChange={setFilterTyp}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle ({aktivitaeten.length})</SelectItem>
            {Object.entries(TYP_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label} ({typCounts[key] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(TYP_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setFilterTyp(filterTyp === key ? 'alle' : key)}
              className={`rounded-lg border p-3 text-center transition-all ${
                filterTyp === key ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon className={`h-5 w-5 mx-auto ${cfg.farbe}`} />
              <p className="text-lg font-bold mt-1">{typCounts[key] || 0}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Keine Aktivitaeten</p>
              <p className="text-sm mt-1">
                {filterTyp !== 'alle'
                  ? 'Versuchen Sie einen anderen Filter.'
                  : 'Laden Sie Ihren ersten Bescheid hoch, um hier Aktivitaeten zu sehen.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                {group.label}
                <Badge variant="secondary" className="text-[10px]">{group.items.length}</Badge>
                <div className="h-px flex-1 bg-border" />
              </h3>

              <div className="relative pl-8 space-y-0">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="relative pb-6 last:pb-0">
                      {/* Timeline dot */}
                      <div className={`absolute -left-8 rounded-full p-1.5 ${item.bg} ring-2 ring-background`}>
                        <Icon className={`h-3.5 w-3.5 ${item.farbe}`} />
                      </div>

                      <div className="rounded-lg border border-border/60 bg-card p-3 hover:border-border transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{item.titel}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.beschreibung}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                            {formatDate(item.datum)}
                          </span>
                        </div>
                      </div>
                    </div>
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
