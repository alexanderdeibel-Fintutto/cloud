import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { formatDate, daysUntil } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { useToast } from '../../hooks/use-toast'
import type { Frist } from '../../types/bescheid'

export default function FristenPage() {
  const { fristen, toggleFrist } = useBescheidContext()
  const { toast } = useToast()
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [showErledigt, setShowErledigt] = useState(false)

  const filteredFristen = fristen
    .filter(f => showErledigt || !f.erledigt)
    .filter(f => filterTyp === 'alle' || f.typ === filterTyp)
    .sort((a, b) => new Date(a.fristdatum).getTime() - new Date(b.fristdatum).getTime())

  const ueberfaellig = fristen.filter(f => !f.erledigt && daysUntil(f.fristdatum) < 0).length
  const dringend = fristen.filter(f => !f.erledigt && daysUntil(f.fristdatum) >= 0 && daysUntil(f.fristdatum) <= 7).length
  const offen = fristen.filter(f => !f.erledigt).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Fristen</h1>
        <p className="text-muted-foreground mt-1">
          Behalten Sie alle wichtigen Termine und Fristen im Blick
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card stat-card-red">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ueberfaellig}</p>
              <p className="text-xs text-muted-foreground">Ueberfaellig</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dringend}</p>
              <p className="text-xs text-muted-foreground">Dringend (7 Tage)</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2">
              <Calendar className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offen}</p>
              <p className="text-xs text-muted-foreground">Offen gesamt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterTyp} onValueChange={setFilterTyp}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Typen</SelectItem>
            <SelectItem value="einspruch">Einspruchsfrist</SelectItem>
            <SelectItem value="zahlung">Zahlungsfrist</SelectItem>
            <SelectItem value="nachreichung">Nachreichung</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showErledigt ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowErledigt(!showErledigt)}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Erledigte anzeigen
        </Button>
      </div>

      {/* Fristen List */}
      {filteredFristen.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Keine offenen Fristen</h3>
            <p className="text-muted-foreground">Alle Fristen sind erledigt oder es liegen keine vor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFristen.map((frist) => (
            <FristCard key={frist.id} frist={frist} onToggle={() => {
              toggleFrist(frist.id)
              toast({
                title: frist.erledigt ? 'Frist wieder geoeffnet' : 'Frist als erledigt markiert',
                description: frist.bescheidTitel,
              })
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

function FristCard({ frist, onToggle }: { frist: Frist; onToggle: () => void }) {
  const days = daysUntil(frist.fristdatum)
  const isOverdue = days < 0
  const isUrgent = days >= 0 && days <= 7

  const typLabel = {
    einspruch: 'Einspruchsfrist',
    zahlung: 'Zahlungsfrist',
    nachreichung: 'Nachreichung',
  }[frist.typ]

  return (
    <Card className={`transition-colors ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/30' : isUrgent ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`rounded-lg p-2.5 ${
              isOverdue ? 'bg-red-100 dark:bg-red-900/40' : isUrgent ? 'bg-amber-100 dark:bg-amber-900/40' : frist.erledigt ? 'bg-green-100 dark:bg-green-900/40' : 'bg-muted'
            }`}>
              {frist.erledigt ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : isOverdue ? (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Clock className={`h-5 w-5 ${isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{frist.bescheidTitel}</h3>
                <Badge variant="secondary" className="text-xs">{typLabel}</Badge>
              </div>
              {frist.notiz && (
                <p className="text-sm text-muted-foreground">{frist.notiz}</p>
              )}
              <Link to={`/bescheide/${frist.bescheidId}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                Bescheid ansehen
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:text-right">
            <div>
              <p className="text-sm font-medium">{formatDate(frist.fristdatum)}</p>
              {!frist.erledigt && (
                <Badge
                  variant={isOverdue ? 'destructive' : isUrgent ? 'warning' : 'secondary'}
                  className="mt-1"
                >
                  {isOverdue
                    ? `${Math.abs(days)} Tage ueberfaellig`
                    : `Noch ${days} Tage`}
                </Badge>
              )}
              {frist.erledigt && (
                <Badge variant="success" className="mt-1">Erledigt</Badge>
              )}
            </div>
            <Button
              variant={frist.erledigt ? 'outline' : 'default'}
              size="sm"
              onClick={onToggle}
              className="gap-1 shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {frist.erledigt ? 'Oeffnen' : 'Erledigen'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
