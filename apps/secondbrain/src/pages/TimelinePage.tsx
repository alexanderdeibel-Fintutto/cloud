import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, FileText, ChevronLeft, ChevronRight, Filter, Calendar,
  Receipt, AlertTriangle, Star, Building2, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDocuments } from '@/hooks/useDocuments'
import { useCompanies } from '@/hooks/useCompanies'
import { DOCUMENT_TYPES } from '@/hooks/useWorkflows'
import { formatFileSize } from '@/lib/utils'

type GroupBy = 'day' | 'week' | 'month'

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function getWeekNumber(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function groupKey(date: Date, groupBy: GroupBy): string {
  if (groupBy === 'day') return date.toISOString().split('T')[0]
  if (groupBy === 'week') return `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, '0')}`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function groupLabel(key: string, groupBy: GroupBy): string {
  if (groupBy === 'day') {
    const d = new Date(key)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Heute'
    if (d.toDateString() === yesterday.toDateString()) return 'Gestern'
    return `${WEEKDAYS_DE[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`
  }
  if (groupBy === 'week') {
    const [year, w] = key.split('-W')
    return `KW ${w}, ${year}`
  }
  const [year, month] = key.split('-')
  return `${MONTHS_DE[parseInt(month) - 1]} ${year}`
}

export default function TimelinePage() {
  const { data: documents = [], isLoading } = useDocuments()
  const { data: companies = [] } = useCompanies()
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Group documents by time period
  const groups = useMemo(() => {
    let docs = documents
    if (filterType) docs = docs.filter(d => d.document_type === filterType)

    const map = new Map<string, typeof docs>()
    for (const doc of docs) {
      const key = groupKey(new Date(doc.created_at), groupBy)
      const list = map.get(key) || []
      list.push(doc)
      map.set(key, list)
    }

    // Sort groups by date descending
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
  }, [documents, groupBy, filterType])

  // Stats for the header
  const totalFiltered = useMemo(() => {
    if (!filterType) return documents.length
    return documents.filter(d => d.document_type === filterType).length
  }, [documents, filterType])

  // Type distribution for mini chart
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    documents.forEach(d => {
      const t = d.document_type || 'other'
      counts[t] = (counts[t] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
  }, [documents])

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-6">
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
            <div className="h-20 bg-muted animate-pulse rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Zeitstrahl
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalFiltered} Dokumente chronologisch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filter
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {(['day', 'week', 'month'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${groupBy === g ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                {g === 'day' ? 'Tag' : g === 'week' ? 'Woche' : 'Monat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <Card className="animate-fade-in-up">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Dokumenttyp</p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={filterType === null ? 'default' : 'outline'}
                size="sm"
                className="text-[11px] h-6 px-2"
                onClick={() => setFilterType(null)}
              >
                Alle
              </Button>
              {typeDistribution.map(([type]) => {
                const info = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other
                return (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    className="text-[11px] h-6 px-2"
                    onClick={() => setFilterType(filterType === type ? null : type)}
                  >
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: info.color }} />
                    {info.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type distribution bar */}
      {documents.length > 0 && (
        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
          {typeDistribution.map(([type, count]) => {
            const info = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other
            const pct = (count / documents.length) * 100
            return (
              <div
                key={type}
                className="h-full transition-all cursor-pointer hover:opacity-80"
                style={{ width: `${pct}%`, backgroundColor: info.color }}
                title={`${info.label}: ${count}`}
                onClick={() => setFilterType(filterType === type ? null : type)}
              />
            )
          })}
        </div>
      )}

      {/* Timeline */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Dokumente gefunden</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          {groups.map(([key, docs]) => (
            <div key={key} className="relative mb-8">
              {/* Group header with dot */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[39px] flex justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm relative z-10" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{groupLabel(key, groupBy)}</h3>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{docs.length}</Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="ml-[39px] space-y-1.5">
                {docs.map(doc => {
                  const typeInfo = DOCUMENT_TYPES[doc.document_type || 'other'] || DOCUMENT_TYPES.other
                  const company = companies.find(c => c.id === doc.company_id)
                  const time = new Date(doc.created_at)
                  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

                  return (
                    <Link key={doc.id} to={`/dokumente/${doc.id}`}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group">
                        {/* Time */}
                        <span className="text-[11px] text-muted-foreground font-mono w-10 shrink-0">{timeStr}</span>

                        {/* Type color bar */}
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: typeInfo.color }} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            {doc.is_favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {doc.document_type && doc.document_type !== 'other' && (
                              <span className="text-[10px] text-muted-foreground">{typeInfo.label}</span>
                            )}
                            {doc.sender && (
                              <span className="text-[10px] text-muted-foreground">von {doc.sender}</span>
                            )}
                            {company && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: company.color }} />
                                {company.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right side info */}
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.amount && doc.amount > 0 && (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: doc.currency || 'EUR' }).format(doc.amount)}
                            </span>
                          )}
                          {doc.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1">!</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
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
