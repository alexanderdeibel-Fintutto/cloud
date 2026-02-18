import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  FileText,
  Clock,
  ShieldAlert,
  Filter,
  X,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { formatCurrency, formatDate, daysUntil } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../types/bescheid'

type ResultType = 'bescheid' | 'frist' | 'einspruch'

interface SearchResult {
  type: ResultType
  id: string
  title: string
  subtitle: string
  detail: string
  href: string
  badge?: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success' }
  amount?: number
}

export default function SuchePage() {
  const { bescheide, fristen, einsprueche } = useBescheidContext()
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Set<ResultType>>(new Set())

  const toggleFilter = (type: ResultType) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim()
    if (q.length < 2) return []

    const all: SearchResult[] = []

    // Search Bescheide
    bescheide.forEach(b => {
      const searchable = [
        b.titel,
        b.finanzamt,
        b.aktenzeichen,
        BESCHEID_TYP_LABELS[b.typ],
        BESCHEID_STATUS_LABELS[b.status],
        b.steuerjahr.toString(),
        b.notizen || '',
      ].join(' ').toLowerCase()

      if (searchable.includes(q)) {
        const statusVariant = {
          neu: 'secondary' as const,
          in_pruefung: 'warning' as const,
          geprueft: 'default' as const,
          einspruch: 'destructive' as const,
          erledigt: 'success' as const,
        }[b.status] ?? 'secondary' as const

        all.push({
          type: 'bescheid',
          id: b.id,
          title: b.titel,
          subtitle: `${b.finanzamt} · ${b.aktenzeichen}`,
          detail: `${BESCHEID_TYP_LABELS[b.typ]} · Steuerjahr ${b.steuerjahr}`,
          href: `/bescheide/${b.id}`,
          badge: { label: BESCHEID_STATUS_LABELS[b.status], variant: statusVariant },
          amount: b.festgesetzteSteuer,
        })
      }
    })

    // Search Fristen
    fristen.forEach(f => {
      const typLabel = { einspruch: 'Einspruchsfrist', zahlung: 'Zahlungsfrist', nachreichung: 'Nachreichung' }[f.typ]
      const searchable = [
        f.bescheidTitel,
        typLabel,
        f.notiz || '',
      ].join(' ').toLowerCase()

      if (searchable.includes(q)) {
        const days = daysUntil(f.fristdatum)
        const isOverdue = days < 0
        const isUrgent = days >= 0 && days <= 7

        all.push({
          type: 'frist',
          id: f.id,
          title: f.bescheidTitel,
          subtitle: typLabel,
          detail: `Frist: ${formatDate(f.fristdatum)}${f.erledigt ? ' (Erledigt)' : isOverdue ? ` (${Math.abs(days)} Tage ueberfaellig)` : ` (Noch ${days} Tage)`}`,
          href: `/fristen`,
          badge: f.erledigt
            ? { label: 'Erledigt', variant: 'success' as const }
            : isOverdue
              ? { label: 'Ueberfaellig', variant: 'destructive' as const }
              : isUrgent
                ? { label: 'Dringend', variant: 'warning' as const }
                : { label: 'Offen', variant: 'secondary' as const },
        })
      }
    })

    // Search Einsprueche
    einsprueche.forEach(e => {
      const bescheid = bescheide.find(b => b.id === e.bescheidId)
      const statusLabel = {
        entwurf: 'Entwurf',
        eingereicht: 'Eingereicht',
        in_bearbeitung: 'In Bearbeitung',
        entschieden: 'Entschieden',
        zurueckgenommen: 'Zurueckgenommen',
      }[e.status]

      const searchable = [
        bescheid?.titel || '',
        e.begruendung,
        statusLabel,
        e.ergebnis || '',
      ].join(' ').toLowerCase()

      if (searchable.includes(q)) {
        const statusVariant = {
          entwurf: 'secondary' as const,
          eingereicht: 'default' as const,
          in_bearbeitung: 'warning' as const,
          entschieden: 'success' as const,
          zurueckgenommen: 'destructive' as const,
        }[e.status] ?? 'secondary' as const

        all.push({
          type: 'einspruch',
          id: e.id,
          title: bescheid?.titel || 'Einspruch',
          subtitle: statusLabel,
          detail: e.begruendung.substring(0, 80) + (e.begruendung.length > 80 ? '...' : ''),
          href: `/einspruch`,
          badge: { label: statusLabel, variant: statusVariant },
          amount: e.forderung,
        })
      }
    })

    // Apply type filters
    if (activeFilters.size > 0) {
      return all.filter(r => activeFilters.has(r.type))
    }

    return all
  }, [query, bescheide, fristen, einsprueche, activeFilters])

  const typeIcon = (type: ResultType) => {
    switch (type) {
      case 'bescheid': return FileText
      case 'frist': return Clock
      case 'einspruch': return ShieldAlert
    }
  }

  const typeLabel = (type: ResultType) => {
    switch (type) {
      case 'bescheid': return 'Bescheid'
      case 'frist': return 'Frist'
      case 'einspruch': return 'Einspruch'
    }
  }

  const typeCounts = useMemo(() => {
    if (query.length < 2) return { bescheid: 0, frist: 0, einspruch: 0 }
    // Count before filters
    const q = query.toLowerCase().trim()
    let b = 0, f = 0, e = 0
    bescheide.forEach(item => {
      if ([item.titel, item.finanzamt, item.aktenzeichen, item.steuerjahr.toString(), item.notizen || ''].join(' ').toLowerCase().includes(q)) b++
    })
    fristen.forEach(item => {
      if ([item.bescheidTitel, item.notiz || ''].join(' ').toLowerCase().includes(q)) f++
    })
    einsprueche.forEach(item => {
      const bescheid = bescheide.find(x => x.id === item.bescheidId)
      if ([bescheid?.titel || '', item.begruendung, item.ergebnis || ''].join(' ').toLowerCase().includes(q)) e++
    })
    return { bescheid: b, frist: f, einspruch: e }
  }, [query, bescheide, fristen, einsprueche])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Suche</h1>
        <p className="text-muted-foreground mt-1">
          Durchsuchen Sie alle Bescheide, Fristen und Einsprueche
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Bescheide, Fristen oder Einsprueche suchen..."
          className="pl-12 h-14 text-lg"
          autoFocus
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {query.length >= 2 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(['bescheid', 'frist', 'einspruch'] as ResultType[]).map(type => {
            const Icon = typeIcon(type)
            const count = typeCounts[type]
            const isActive = activeFilters.has(type)
            return (
              <Button
                key={type}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter(type)}
                className="gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {typeLabel(type)}
                <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1 text-[10px] px-1.5 py-0">
                  {count}
                </Badge>
              </Button>
            )
          })}
          {activeFilters.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilters(new Set())}
              className="text-muted-foreground"
            >
              Alle anzeigen
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {query.length < 2 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Suche starten</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              Geben Sie mindestens 2 Zeichen ein, um Bescheide, Fristen und Einsprueche zu durchsuchen.
              Sie koennen nach Titel, Finanzamt, Aktenzeichen, Steuerjahr und mehr suchen.
            </p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Keine Ergebnisse</h3>
            <p className="text-muted-foreground text-sm">
              Keine Treffer fuer &ldquo;{query}&rdquo; gefunden.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} fuer &ldquo;{query}&rdquo;
          </p>
          {results.map(result => {
            const Icon = typeIcon(result.type)
            return (
              <Link key={`${result.type}-${result.id}`} to={result.href}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-2.5 shrink-0 ${
                        result.type === 'bescheid'
                          ? 'bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40'
                          : result.type === 'frist'
                            ? 'bg-amber-100 dark:bg-amber-900/40'
                            : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          result.type === 'bescheid'
                            ? 'text-fintutto-blue-600 dark:text-fintutto-blue-400'
                            : result.type === 'frist'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold truncate">{result.title}</h3>
                          {result.badge && (
                            <Badge variant={result.badge.variant} className="shrink-0">{result.badge.label}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.detail}</p>
                      </div>
                      {result.amount !== undefined && result.amount > 0 && (
                        <div className="text-right shrink-0">
                          <p className="font-medium">{formatCurrency(result.amount)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{typeLabel(result.type)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
