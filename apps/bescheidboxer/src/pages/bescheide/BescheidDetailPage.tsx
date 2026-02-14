import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
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
  Trash2,
  ChevronDown,
  Pencil,
  Save,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { formatCurrency, formatDate, daysUntil } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { DetailSkeleton } from '../../components/LoadingSkeleton'
import { useToast } from '../../hooks/use-toast'
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '../../components/ui/alert-dialog'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../../types/bescheid'
import type { BescheidStatus } from '../../types/bescheid'
import Breadcrumbs from '../../components/Breadcrumbs'

const STATUS_TRANSITIONS: Record<BescheidStatus, BescheidStatus[]> = {
  neu: ['in_pruefung'],
  in_pruefung: ['geprueft', 'einspruch'],
  geprueft: ['einspruch', 'erledigt'],
  einspruch: ['erledigt'],
  erledigt: [],
}

export default function BescheidDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { bescheide, loading, updateBescheid, updateBescheidStatus, deleteBescheid } = useBescheidContext()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

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
      <Breadcrumbs items={[
        { label: 'Bescheide', href: '/bescheide' },
        { label: bescheid.titel },
      ]} />

      {/* Header */}
      <div>
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
                      <span className={`text-xl font-bold ${bescheid.abweichung > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
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
                  pruefung.empfehlung === 'einspruch' ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' :
                  pruefung.empfehlung === 'pruefen' ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800' :
                  'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
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
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={bescheid.status} />
                {STATUS_TRANSITIONS[bescheid.status].length > 0 && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7 px-2"
                      onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    >
                      Aendern <ChevronDown className="h-3 w-3" />
                    </Button>
                    {statusMenuOpen && (
                      <div className="absolute right-0 mt-1 w-48 rounded-md border bg-background shadow-lg z-10">
                        {STATUS_TRANSITIONS[bescheid.status].map(nextStatus => (
                          <button
                            key={nextStatus}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                            onClick={async () => {
                              await updateBescheidStatus(bescheid.id, nextStatus)
                              setStatusMenuOpen(false)
                              toast({
                                title: 'Status geaendert',
                                description: `Status auf "${BESCHEID_STATUS_LABELS[nextStatus]}" gesetzt.`,
                              })
                            }}
                          >
                            {BESCHEID_STATUS_LABELS[nextStatus]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
              <Separator className="my-2" />
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Bescheid loeschen
              </Button>
            </CardContent>
          </Card>

          {/* Einsparpotenzial */}
          {pruefung && pruefung.einsparpotenzial > 0 && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">Einsparpotenzial</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(pruefung.einsparpotenzial)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Durch Einspruch moeglicherweise zurueckholbar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notizen */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notizen</CardTitle>
                {!editingNotes ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setNotesText(bescheid.notizen || '')
                      setEditingNotes(true)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                    Bearbeiten
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNotes(false)}
                      disabled={savingNotes}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={savingNotes}
                      onClick={async () => {
                        setSavingNotes(true)
                        await updateBescheid(bescheid.id, { notizen: notesText || undefined })
                        setSavingNotes(false)
                        setEditingNotes(false)
                        toast({
                          title: 'Gespeichert',
                          description: 'Notizen wurden aktualisiert.',
                        })
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Speichern
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <textarea
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                  placeholder="Notizen zum Bescheid hinzufuegen..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {bescheid.notizen || 'Keine Notizen vorhanden. Klicken Sie auf "Bearbeiten" um Notizen hinzuzufuegen.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Bescheid loeschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Moechten Sie &quot;{bescheid.titel}&quot; wirklich loeschen?
            Alle zugehoerigen Fristen und Einsprueche werden ebenfalls entfernt.
            Diese Aktion kann nicht rueckgaengig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true)
              const success = await deleteBescheid(bescheid.id)
              setDeleting(false)
              if (success) {
                toast({
                  title: 'Bescheid geloescht',
                  description: `"${bescheid.titel}" wurde entfernt.`,
                })
                navigate('/bescheide')
              } else {
                toast({
                  title: 'Fehler',
                  description: 'Der Bescheid konnte nicht geloescht werden.',
                  variant: 'destructive',
                })
                setDeleteDialogOpen(false)
              }
            }}
          >
            {deleting ? 'Loescht...' : 'Endgueltig loeschen'}
          </Button>
        </AlertDialogFooter>
      </AlertDialog>
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
