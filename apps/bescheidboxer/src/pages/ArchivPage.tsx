import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  FileText,
  Search,
  CheckCircle2,
  ShieldAlert,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Calendar,
  Building2,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatCurrency, formatDate } from '../lib/utils'
import { BESCHEID_TYP_LABELS } from '../types/bescheid'

type SortField = 'datum' | 'betrag' | 'jahr' | 'titel'
type SortDir = 'asc' | 'desc'

export default function ArchivPage() {
  const { bescheide, einsprueche, updateBescheidStatus } = useBescheidContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [filterJahr, setFilterJahr] = useState<string>('alle')
  const [sortField, setSortField] = useState<SortField>('datum')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Only show archived (erledigt) Bescheide
  const archivedBescheide = useMemo(() => {
    return bescheide.filter(b => b.status === 'erledigt')
  }, [bescheide])

  const uniqueYears = useMemo(() => {
    const years = new Set(archivedBescheide.map(b => b.steuerjahr))
    return Array.from(years).sort((a, b) => b - a)
  }, [archivedBescheide])

  const uniqueTypes = useMemo(() => {
    return [...new Set(archivedBescheide.map(b => b.typ))]
  }, [archivedBescheide])

  const filtered = useMemo(() => {
    let result = archivedBescheide

    // Search
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase()
      result = result.filter(b =>
        b.titel.toLowerCase().includes(q) ||
        b.finanzamt.toLowerCase().includes(q) ||
        b.aktenzeichen.toLowerCase().includes(q)
      )
    }

    // Filter by type
    if (filterTyp !== 'alle') {
      result = result.filter(b => b.typ === filterTyp)
    }

    // Filter by year
    if (filterJahr !== 'alle') {
      result = result.filter(b => b.steuerjahr === parseInt(filterJahr))
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'datum':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'betrag':
          cmp = a.festgesetzteSteuer - b.festgesetzteSteuer
          break
        case 'jahr':
          cmp = a.steuerjahr - b.steuerjahr
          break
        case 'titel':
          cmp = a.titel.localeCompare(b.titel)
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [archivedBescheide, searchQuery, filterTyp, filterJahr, sortField, sortDir])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleReactivate = async (id: string) => {
    await updateBescheidStatus(id, 'geprueft')
  }

  // Archiv-Statistik
  const totalSteuer = archivedBescheide.reduce((s, b) => s + b.festgesetzteSteuer, 0)
  const totalEinsparung = archivedBescheide.reduce((s, b) => {
    return s + (b.pruefungsergebnis?.einsparpotenzial ?? 0)
  }, 0)
  const mitEinspruch = archivedBescheide.filter(b => {
    return einsprueche.some(e => e.bescheidId === b.id)
  }).length

  const getEinspruchForBescheid = (bescheidId: string) => {
    return einsprueche.find(e => e.bescheidId === bescheidId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Archive className="h-8 w-8" />
          Archiv
        </h1>
        <p className="text-muted-foreground mt-1">
          Abgeschlossene Bescheide und deren Ergebnisse
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
                <FileText className="h-4 w-4 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{archivedBescheide.length}</p>
                <p className="text-xs text-muted-foreground">Archiviert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totalEinsparung)}</p>
                <p className="text-xs text-muted-foreground">Gespart</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{mitEinspruch}</p>
                <p className="text-xs text-muted-foreground">Mit Einspruch</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-2">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totalSteuer)}</p>
                <p className="text-xs text-muted-foreground">Gesamt Steuer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Bescheide durchsuchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTyp} onValueChange={setFilterTyp}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Steuerart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Steuerarten</SelectItem>
                {uniqueTypes.map(typ => (
                  <SelectItem key={typ} value={typ}>
                    {BESCHEID_TYP_LABELS[typ]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterJahr} onValueChange={setFilterJahr}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Jahr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Jahre</SelectItem>
                {uniqueYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={`${sortField}-${sortDir}`} onValueChange={v => {
              const [field, dir] = v.split('-') as [SortField, SortDir]
              setSortField(field)
              setSortDir(dir)
            }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datum-desc">Neueste zuerst</SelectItem>
                <SelectItem value="datum-asc">Aelteste zuerst</SelectItem>
                <SelectItem value="betrag-desc">Hoechster Betrag</SelectItem>
                <SelectItem value="betrag-asc">Niedrigster Betrag</SelectItem>
                <SelectItem value="jahr-desc">Jahr absteigend</SelectItem>
                <SelectItem value="jahr-asc">Jahr aufsteigend</SelectItem>
                <SelectItem value="titel-asc">A-Z</SelectItem>
                <SelectItem value="titel-desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-30" />
              {archivedBescheide.length === 0 ? (
                <>
                  <p className="font-medium">Noch keine archivierten Bescheide</p>
                  <p className="text-sm mt-1">
                    Bescheide mit Status &ldquo;Erledigt&rdquo; erscheinen hier automatisch.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Keine Treffer</p>
                  <p className="text-sm mt-1">
                    Versuchen Sie andere Filter oder Suchbegriffe.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} archivierte{filtered.length === 1 ? 'r' : ''} Bescheid{filtered.length !== 1 ? 'e' : ''}
          </p>

          {filtered.map(bescheid => {
            const isExpanded = expandedIds.has(bescheid.id)
            const einspruch = getEinspruchForBescheid(bescheid.id)

            return (
              <Card key={bescheid.id}>
                <div
                  className="cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => toggleExpand(bescheid.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{bescheid.titel}</p>
                          <Badge variant="success" className="text-[10px] shrink-0">Erledigt</Badge>
                          {einspruch && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">Einspruch</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{BESCHEID_TYP_LABELS[bescheid.typ]}</span>
                          <span>&middot;</span>
                          <span>{bescheid.steuerjahr}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {bescheid.finanzamt}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold">{formatCurrency(bescheid.festgesetzteSteuer)}</p>
                        {bescheid.abweichung !== null && bescheid.abweichung > 0 && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            +{formatCurrency(bescheid.abweichung)} Abweichung
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <Separator className="mb-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Details */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Details</h4>
                        <div className="text-sm space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aktenzeichen</span>
                            <span className="font-mono">{bescheid.aktenzeichen}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Eingangsdatum</span>
                            <span>{formatDate(bescheid.eingangsdatum)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Einspruchsfrist</span>
                            <span>{formatDate(bescheid.einspruchsfrist)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Festgesetzt</span>
                            <span className="font-bold">{formatCurrency(bescheid.festgesetzteSteuer)}</span>
                          </div>
                          {bescheid.erwarteteSteuer !== null && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Erwartet</span>
                              <span>{formatCurrency(bescheid.erwarteteSteuer)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pruefungsergebnis */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Pruefungsergebnis</h4>
                        {bescheid.pruefungsergebnis ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {bescheid.pruefungsergebnis.zusammenfassung}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                bescheid.pruefungsergebnis.empfehlung === 'akzeptieren' ? 'success' :
                                bescheid.pruefungsergebnis.empfehlung === 'einspruch' ? 'destructive' : 'warning'
                              }>
                                Empfehlung: {bescheid.pruefungsergebnis.empfehlung}
                              </Badge>
                            </div>
                            {bescheid.pruefungsergebnis.einsparpotenzial > 0 && (
                              <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                                <TrendingDown className="h-3.5 w-3.5" />
                                Einsparpotenzial: {formatCurrency(bescheid.pruefungsergebnis.einsparpotenzial)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Keine Pruefung durchgefuehrt.</p>
                        )}
                      </div>
                    </div>

                    {/* Einspruch info */}
                    {einspruch && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Einspruch
                          </h4>
                          <div className="rounded-lg border border-border p-3 text-sm space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <Badge variant="secondary">{einspruch.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Forderung</span>
                              <span className="font-bold">{formatCurrency(einspruch.forderung)}</span>
                            </div>
                            {einspruch.ergebnis && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Ergebnis</span>
                                <span>{einspruch.ergebnis}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Link to={`/bescheide/${bescheid.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReactivate(bescheid.id)
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reaktivieren
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
