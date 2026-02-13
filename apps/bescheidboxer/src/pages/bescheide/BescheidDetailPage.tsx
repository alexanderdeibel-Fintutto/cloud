import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Search,
  ShieldAlert,
  Calendar,
  Building2,
  Hash,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { formatCurrency, formatDate, daysUntil } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { DetailSkeleton } from '../../components/LoadingSkeleton'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../../types/bescheid'
import type { BescheidStatus } from '../../types/bescheid'

export default function BescheidDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bescheide, loading } = useBescheidContext()

  if (loading) return <DetailSkeleton />

  const bescheid = bescheide.find(b => b.id === id)

  if (!bescheid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bescheid nicht gefunden</h2>
        <Link to="/bescheide">
          <Button variant="outline">Zurueck zu den Bescheiden</Button>
        </Link>
      </div>
    )
  }

  const fristTage = daysUntil(bescheid.einspruchsfrist)
  const pruefung = bescheid.pruefungsergebnis

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 mb-2 -ml-2"
          onClick={() => navigate('/bescheide')}
        >
          <ArrowLeft className="h-3 w-3" />
          Zurueck
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{bescheid.titel}</h1>
              <StatusBadge status={bescheid.status} />
            </div>
            <p className="text-muted-foreground">
              {BESCHEID_TYP_LABELS[bescheid.typ]} &middot; Steuerjahr {bescheid.steuerjahr}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/analyse/${bescheid.id}`}>
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Analyse
              </Button>
            </Link>
            {(bescheid.status === 'geprueft' || bescheid.status === 'neu') && (
              <Link to={`/einspruch/neu/${bescheid.id}`}>
                <Button variant="destructive" className="gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Einspruch
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bescheid-Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={Building2} label="Finanzamt" value={bescheid.finanzamt} />
                <DetailItem icon={Hash} label="Aktenzeichen" value={bescheid.aktenzeichen} />
                <DetailItem icon={Calendar} label="Eingangsdatum" value={formatDate(bescheid.eingangsdatum)} />
                <DetailItem
                  icon={Clock}
                  label="Einspruchsfrist"
                  value={formatDate(bescheid.einspruchsfrist)}
                  extra={
                    fristTage > 0 ? (
                      <Badge variant={fristTage <= 7 ? 'warning' : 'secondary'} className="ml-2">
                        {fristTage} Tage
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">Abgelaufen</Badge>
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Steuerliche Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Festgesetzte Steuer</span>
                  <span className="text-xl font-bold">{formatCurrency(bescheid.festgesetzteSteuer)}</span>
                </div>
                <Separator />
                {bescheid.erwarteteSteuer !== null && (
                  <>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Erwartete Steuer (lt. Erklaerung)</span>
                      <span className="text-lg font-medium">{formatCurrency(bescheid.erwarteteSteuer)}</span>
                    </div>
                    <Separator />
                  </>
                )}
                {bescheid.abweichung !== null && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Abweichung</span>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${bescheid.abweichung > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {bescheid.abweichung > 0 ? '+' : ''}{formatCurrency(bescheid.abweichung)}
                      </span>
                      {bescheid.abweichungProzent !== null && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({bescheid.abweichungProzent.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pruefungsergebnis */}
          {pruefung && (
            <Card>
              <CardHeader>
                <CardTitle>Pruefungsergebnis</CardTitle>
                <CardDescription>KI-gestuetzte Analyse des Bescheids</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-lg p-4 ${
                  pruefung.empfehlung === 'einspruch' ? 'bg-red-50 border border-red-200' :
                  pruefung.empfehlung === 'pruefen' ? 'bg-amber-50 border border-amber-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {pruefung.empfehlung === 'einspruch' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : pruefung.empfehlung === 'akzeptieren' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Search className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-semibold">
                      {pruefung.empfehlung === 'einspruch' ? 'Einspruch empfohlen' :
                       pruefung.empfehlung === 'akzeptieren' ? 'Bescheid korrekt' :
                       'Weitere Pruefung empfohlen'}
                    </span>
                  </div>
                  <p className="text-sm">{pruefung.zusammenfassung}</p>
                </div>

                {pruefung.abweichungen.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Gefundene Abweichungen ({pruefung.abweichungen.length})</h4>
                    {pruefung.abweichungen.map(abw => (
                      <div key={abw.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          {abw.schweregrad === 'kritisch' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : abw.schweregrad === 'warnung' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm">{abw.position}</span>
                        </div>
                        <span className={`text-sm font-medium ${abw.differenz > 0 ? 'text-destructive' : ''}`}>
                          {abw.differenz > 0 ? '+' : ''}{formatCurrency(abw.differenz)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Link to={`/analyse/${bescheid.id}`}>
                  <Button variant="outline" className="gap-2 w-full">
                    <ExternalLink className="h-4 w-4" />
                    Detaillierte Analyse ansehen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/analyse/${bescheid.id}`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="h-4 w-4" />
                  Bescheid analysieren
                </Button>
              </Link>
              <Link to={`/einspruch/neu/${bescheid.id}`} className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Einspruch erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Einsparpotenzial */}
          {pruefung && pruefung.einsparpotenzial > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-700 mb-1">Einsparpotenzial</p>
                  <p className="text-3xl font-bold text-green-700">
                    {formatCurrency(pruefung.einsparpotenzial)}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Durch Einspruch moeglicherweise zurueckholbar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notizen */}
          {bescheid.notizen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notizen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{bescheid.notizen}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon: Icon, label, value, extra }: {
  icon: React.ElementType
  label: string
  value: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-muted p-2 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center">
          <p className="font-medium">{value}</p>
          {extra}
        </div>
      </div>
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
