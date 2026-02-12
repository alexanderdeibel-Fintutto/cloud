import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useBescheide } from '../../hooks/use-bescheide'
import { EINSPRUCH_STATUS_LABELS } from '../../types/bescheid'
import type { EinspruchStatus } from '../../types/bescheid'

export default function EinspruchPage() {
  const { einsprueche, bescheide } = useBescheide()

  const bescheideMitEinspruchOption = bescheide.filter(
    b => b.pruefungsergebnis?.empfehlung === 'einspruch' && b.status !== 'einspruch' && b.status !== 'erledigt'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Einsprueche</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Einsprueche gegen Steuerbescheide
          </p>
        </div>
      </div>

      {/* Einspruch-Vorschlaege */}
      {bescheideMitEinspruchOption.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Einspruch empfohlen
            </CardTitle>
            <CardDescription>
              Fuer folgende Bescheide wurde ein Einspruch empfohlen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bescheideMitEinspruchOption.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">{b.titel}</p>
                      <p className="text-sm text-muted-foreground">
                        Einsparpotenzial: {formatCurrency(b.pruefungsergebnis?.einsparpotenzial ?? 0)}
                      </p>
                    </div>
                  </div>
                  <Link to={`/einspruch/neu/${b.id}`}>
                    <Button size="sm" className="gap-1">
                      <Plus className="h-3 w-3" />
                      Einspruch erstellen
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bestehende Einsprueche */}
      <Card>
        <CardHeader>
          <CardTitle>Eingereichte Einsprueche</CardTitle>
          <CardDescription>
            {einsprueche.length} Einspruch/Einsprueche insgesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {einsprueche.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Keine Einsprueche</h3>
              <p className="text-muted-foreground mb-4">
                Sie haben noch keine Einsprueche eingereicht.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {einsprueche.map(einspruch => {
                const bescheid = bescheide.find(b => b.id === einspruch.bescheidId)
                return (
                  <div key={einspruch.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            Einspruch: {bescheid?.titel ?? 'Unbekannter Bescheid'}
                          </h3>
                          <EinspruchStatusBadge status={einspruch.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Forderung: {formatCurrency(einspruch.forderung)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {einspruch.eingereichtAm
                          ? `Eingereicht am ${formatDate(einspruch.eingereichtAm)}`
                          : 'Noch nicht eingereicht'}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 mb-3">
                      <p className="text-sm">{einspruch.begruendung}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Frist: {formatDate(einspruch.frist)}</span>
                        {einspruch.antwortErhalten && (
                          <span>Antwort: {formatDate(einspruch.antwortErhalten)}</span>
                        )}
                      </div>
                      {bescheid && (
                        <Link to={`/bescheide/${bescheid.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Details <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg bg-fintutto-blue-100/50 border border-fintutto-blue-200 p-4">
            <h4 className="font-semibold text-fintutto-blue-800 mb-2">Hinweis zum Einspruch</h4>
            <ul className="text-sm text-fintutto-blue-700 space-y-1">
              <li>Die Einspruchsfrist betraegt in der Regel einen Monat nach Bekanntgabe des Bescheids.</li>
              <li>Ein Einspruch hemmt nicht die Zahlungspflicht - beantragen Sie ggf. Aussetzung der Vollziehung.</li>
              <li>Der Einspruch muss schriftlich oder elektronisch beim zustaendigen Finanzamt eingehen.</li>
              <li>Eine ausfuehrliche Begruendung erhoeht die Erfolgschancen erheblich.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EinspruchStatusBadge({ status }: { status: EinspruchStatus }) {
  const variant = {
    entwurf: 'secondary' as const,
    eingereicht: 'default' as const,
    in_bearbeitung: 'warning' as const,
    entschieden: 'success' as const,
    zurueckgenommen: 'destructive' as const,
  }[status]

  return (
    <Badge variant={variant}>
      {EINSPRUCH_STATUS_LABELS[status]}
    </Badge>
  )
}
