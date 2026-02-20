import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  CheckSquare,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { formatCurrency, formatDate, cn } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { ListSkeleton } from '../../components/LoadingSkeleton'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../../types/bescheid'
import type { BescheidStatus } from '../../types/bescheid'
import { exportBescheideAsCsv } from '../../lib/csv-export'

export default function BescheidePage() {
  const { bescheide, loading, deleteBescheid, updateBescheidStatus } = useBescheidContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [sortBy, setSortBy] = useState<'datum' | 'betrag'>('datum')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  if (loading) return <ListSkeleton />

  const filteredBescheide = bescheide
    .filter(b => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          b.titel.toLowerCase().includes(q) ||
          b.finanzamt.toLowerCase().includes(q) ||
          b.aktenzeichen.toLowerCase().includes(q)
        )
      }
      return true
    })
    .filter(b => filterTyp === 'alle' || b.typ === filterTyp)
    .filter(b => filterStatus === 'alle' || b.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'datum') {
        return new Date(b.eingangsdatum).getTime() - new Date(a.eingangsdatum).getTime()
      }
      return b.festgesetzteSteuer - a.festgesetzteSteuer
    })

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredBescheide.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredBescheide.map(b => b.id)))
    }
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    for (const id of selectedIds) {
      await deleteBescheid(id)
    }
    exitSelectMode()
  }

  const handleBatchStatus = async (status: BescheidStatus) => {
    if (selectedIds.size === 0) return
    for (const id of selectedIds) {
      await updateBescheidStatus(id, status)
    }
    exitSelectMode()
  }

  const handleBatchExport = () => {
    const selected = bescheide.filter(b => selectedIds.has(b.id))
    exportBescheideAsCsv(selected)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bescheide</h1>
          <p className="text-muted-foreground mt-1">
            Alle Ihre Steuerbescheide auf einen Blick
          </p>
        </div>
        <div className="flex gap-2">
          {bescheide.length > 0 && !selectMode && (
            <>
              <Button variant="outline" size="icon" onClick={() => setSelectMode(true)} title="Mehrfachauswahl">
                <CheckSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => exportBescheideAsCsv(bescheide)}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">CSV Export</span>
              </Button>
            </>
          )}
          <Link to="/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Neuer Bescheid
            </Button>
          </Link>
        </div>
      </div>

      {/* Batch action bar */}
      {selectMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={selectAll} className="gap-2">
                {selectedIds.size === filteredBescheide.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedIds.size === filteredBescheide.length ? 'Alle abwaehlen' : 'Alle auswaehlen'}
              </Button>

              <span className="text-sm text-muted-foreground">
                {selectedIds.size} ausgewaehlt
              </span>

              <div className="flex-1" />

              <Select onValueChange={(val) => handleBatchStatus(val as BescheidStatus)} value="">
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Status aendern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="in_pruefung">In Pruefung</SelectItem>
                  <SelectItem value="geprueft">Geprueft</SelectItem>
                  <SelectItem value="erledigt">Erledigt</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleBatchExport} disabled={selectedIds.size === 0} className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>

              <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={selectedIds.size === 0} className="gap-1">
                <Trash2 className="h-3.5 w-3.5" />
                Loeschen
              </Button>

              <Button variant="ghost" size="icon" onClick={exitSelectMode} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Titel, Finanzamt, Aktenzeichen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTyp} onValueChange={setFilterTyp}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Typen</SelectItem>
                <SelectItem value="einkommensteuer">Einkommensteuer</SelectItem>
                <SelectItem value="gewerbesteuer">Gewerbesteuer</SelectItem>
                <SelectItem value="umsatzsteuer">Umsatzsteuer</SelectItem>
                <SelectItem value="grundsteuer">Grundsteuer</SelectItem>
                <SelectItem value="sonstige">Sonstige</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="neu">Neu</SelectItem>
                <SelectItem value="in_pruefung">In Pruefung</SelectItem>
                <SelectItem value="geprueft">Geprueft</SelectItem>
                <SelectItem value="einspruch">Einspruch</SelectItem>
                <SelectItem value="erledigt">Erledigt</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortBy(sortBy === 'datum' ? 'betrag' : 'datum')}
              title={`Sortieren nach ${sortBy === 'datum' ? 'Betrag' : 'Datum'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredBescheide.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Keine Bescheide gefunden</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterTyp !== 'alle' || filterStatus !== 'alle'
                ? 'Aendern Sie Ihre Filterkriterien oder laden Sie einen neuen Bescheid hoch.'
                : 'Laden Sie Ihren ersten Steuerbescheid hoch um zu beginnen.'}
            </p>
            <Link to="/upload">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Bescheid hochladen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBescheide.map((bescheid) => {
            const isSelected = selectedIds.has(bescheid.id)

            const cardContent = (
              <Card className={cn(
                'transition-colors cursor-pointer',
                selectMode && isSelected
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/30',
              )}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {selectMode && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleSelect(bescheid.id)
                          }}
                          className="shrink-0"
                          aria-label={isSelected ? 'Abwaehlen' : 'Auswaehlen'}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <div className="rounded-lg bg-muted p-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{bescheid.titel}</h3>
                        <p className="text-sm text-muted-foreground">
                          {BESCHEID_TYP_LABELS[bescheid.typ]} &middot; {bescheid.finanzamt} &middot; {bescheid.aktenzeichen}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Eingegangen: {formatDate(bescheid.eingangsdatum)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-lg font-bold">{formatCurrency(bescheid.festgesetzteSteuer)}</p>
                        {bescheid.abweichung !== null && bescheid.abweichung > 0 && (
                          <p className="text-sm text-destructive font-medium">
                            +{formatCurrency(bescheid.abweichung)} ({bescheid.abweichungProzent?.toFixed(1)}%)
                          </p>
                        )}
                      </div>
                      <StatusBadge status={bescheid.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )

            if (selectMode) {
              return (
                <div key={bescheid.id} onClick={() => toggleSelect(bescheid.id)}>
                  {cardContent}
                </div>
              )
            }

            return (
              <Link key={bescheid.id} to={`/bescheide/${bescheid.id}`}>
                {cardContent}
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        {filteredBescheide.length} von {bescheide.length} Bescheiden
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: BescheidStatus }) {
  const variant = {
    neu: 'secondary' as const,
    in_pruefung: 'warning' as const,
    geprueft: 'default' as const,
    einspruch: 'destructive' as const,
    erledigt: 'success' as const,
  }[status]

  return (
    <Badge variant={variant}>
      {BESCHEID_STATUS_LABELS[status]}
    </Badge>
  )
}
