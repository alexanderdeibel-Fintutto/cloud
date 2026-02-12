import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useBescheide } from '../../hooks/use-bescheide'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../../types/bescheid'
import type { BescheidStatus } from '../../types/bescheid'

export default function BescheidePage() {
  const { bescheide } = useBescheide()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [sortBy, setSortBy] = useState<'datum' | 'betrag'>('datum')

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
        <Link to="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Neuer Bescheid
          </Button>
        </Link>
      </div>

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
          {filteredBescheide.map((bescheid) => (
            <Link key={bescheid.id} to={`/bescheide/${bescheid.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
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
            </Link>
          ))}
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
