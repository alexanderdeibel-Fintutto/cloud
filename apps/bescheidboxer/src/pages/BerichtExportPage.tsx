import { useState, useRef } from 'react'
import {
  FileDown,
  Printer,
  BarChart3,
  FileText,
  ShieldAlert,
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { useBescheidContext } from '../contexts/BescheidContext'
import { formatCurrency, formatDate } from '../lib/utils'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../types/bescheid'
import type { BescheidStatus, BescheidTyp } from '../types/bescheid'

export default function BerichtExportPage() {
  const { bescheide, fristen, einsprueche, stats } = useBescheidContext()
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(['zusammenfassung', 'bescheide', 'fristen', 'einsprueche', 'analyse'])
  )
  const printRef = useRef<HTMLDivElement>(null)

  const toggleSection = (section: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportText = () => {
    const lines: string[] = []
    lines.push('=== STEUER-BESCHEIDPRÜFER - STEUERBERICHT ===')
    lines.push(`Erstellt am: ${formatDate(new Date())}`)
    lines.push('')

    if (selectedSections.has('zusammenfassung')) {
      lines.push('--- ZUSAMMENFASSUNG ---')
      lines.push(`Bescheide gesamt: ${stats.bescheideGesamt}`)
      lines.push(`Offene Pruefungen: ${stats.offenePruefungen}`)
      lines.push(`Einsprueche: ${stats.einsprueche}`)
      lines.push(`Einsparpotenzial: ${formatCurrency(stats.einsparpotenzial)}`)
      lines.push(`Ablaufende Fristen: ${stats.ablaufendeFristen}`)
      lines.push(`Abweichungen gesamt: ${stats.abweichungenGesamt}`)
      lines.push('')
    }

    if (selectedSections.has('bescheide')) {
      lines.push('--- BESCHEIDE ---')
      bescheide.forEach(b => {
        lines.push(`${b.titel} | ${BESCHEID_TYP_LABELS[b.typ]} | ${b.steuerjahr} | ${b.finanzamt}`)
        lines.push(`  Status: ${BESCHEID_STATUS_LABELS[b.status]} | Festgesetzt: ${formatCurrency(b.festgesetzteSteuer)}`)
        if (b.abweichung) lines.push(`  Abweichung: ${formatCurrency(b.abweichung)}`)
        lines.push('')
      })
    }

    if (selectedSections.has('fristen')) {
      lines.push('--- FRISTEN ---')
      fristen.forEach(f => {
        lines.push(`${f.bescheidTitel} | ${f.typ} | ${formatDate(f.fristdatum)} | ${f.erledigt ? 'Erledigt' : 'Offen'}`)
      })
      lines.push('')
    }

    if (selectedSections.has('einsprueche')) {
      lines.push('--- EINSPRUECHE ---')
      einsprueche.forEach(e => {
        const bescheid = bescheide.find(b => b.id === e.bescheidId)
        lines.push(`${bescheid?.titel || 'Unbekannt'} | Forderung: ${formatCurrency(e.forderung)} | Status: ${e.status}`)
      })
      lines.push('')
    }

    if (selectedSections.has('analyse')) {
      lines.push('--- ANALYSE ---')
      const mitAbweichungen = bescheide.filter(b => b.pruefungsergebnis && b.pruefungsergebnis.abweichungen.length > 0)
      mitAbweichungen.forEach(b => {
        lines.push(`${b.titel}:`)
        b.pruefungsergebnis!.abweichungen.forEach(a => {
          lines.push(`  ${a.position}: ${a.beschreibung} (Differenz: ${formatCurrency(a.differenz)})`)
        })
        lines.push(`  Empfehlung: ${b.pruefungsergebnis!.empfehlung}`)
        lines.push('')
      })
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Steuerbericht_${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sections = [
    { id: 'zusammenfassung', label: 'Zusammenfassung', icon: BarChart3 },
    { id: 'bescheide', label: 'Bescheide', icon: FileText },
    { id: 'fristen', label: 'Fristen', icon: Clock },
    { id: 'einsprueche', label: 'Einsprueche', icon: ShieldAlert },
    { id: 'analyse', label: 'Analyse-Ergebnisse', icon: AlertTriangle },
  ]

  // Stats for the report
  const bescheideNachTyp = bescheide.reduce<Record<string, number>>((acc, b) => {
    acc[b.typ] = (acc[b.typ] || 0) + 1
    return acc
  }, {})

  const bescheideNachStatus = bescheide.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  const gesamtFestgesetzt = bescheide.reduce((s, b) => s + b.festgesetzteSteuer, 0)
  const gesamtErwartet = bescheide.reduce((s, b) => s + (b.erwarteteSteuer ?? 0), 0)

  const offeneFristen = fristen.filter(f => !f.erledigt)
  const erledigteFristen = fristen.filter(f => f.erledigt)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bericht exportieren</h1>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie einen umfassenden Bericht Ihrer Steuerdaten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
          <Button onClick={handleExportText} className="gap-2">
            <FileDown className="h-4 w-4" />
            Als Textdatei
          </Button>
        </div>
      </div>

      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Berichts-Abschnitte</CardTitle>
          <CardDescription>Waehlen Sie die Abschnitte fuer Ihren Bericht</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections.map(section => {
              const isSelected = selectedSections.has(section.id)
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Printable Report */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* Report Header (print only styling) */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Steuerbericht - Steuer-Bescheidprüfer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Erstellt am {formatDate(new Date())}
          </p>
        </div>

        {/* Zusammenfassung */}
        {selectedSections.has('zusammenfassung') && (
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Zusammenfassung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="rounded-lg bg-fintutto-blue-50 dark:bg-fintutto-blue-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-fintutto-blue-700 dark:text-fintutto-blue-300">
                    {stats.bescheideGesamt}
                  </p>
                  <p className="text-xs text-muted-foreground">Bescheide</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {stats.offenePruefungen}
                  </p>
                  <p className="text-xs text-muted-foreground">Offen</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {stats.einsprueche}
                  </p>
                  <p className="text-xs text-muted-foreground">Einsprueche</p>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(stats.einsparpotenzial)}
                  </p>
                  <p className="text-xs text-muted-foreground">Einsparpotenzial</p>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {stats.ablaufendeFristen}
                  </p>
                  <p className="text-xs text-muted-foreground">Offene Fristen</p>
                </div>
                <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.abweichungenGesamt}
                  </p>
                  <p className="text-xs text-muted-foreground">Abweichungen</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Nach Steuerart</h4>
                  <div className="space-y-1.5">
                    {Object.entries(bescheideNachTyp).map(([typ, count]) => (
                      <div key={typ} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {BESCHEID_TYP_LABELS[typ as BescheidTyp] || typ}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Nach Status</h4>
                  <div className="space-y-1.5">
                    {Object.entries(bescheideNachStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {BESCHEID_STATUS_LABELS[status as BescheidStatus] || status}
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Gesamt festgesetzte Steuer</p>
                  <p className="text-xl font-bold">{formatCurrency(gesamtFestgesetzt)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Gesamt erwartete Steuer</p>
                  <p className="text-xl font-bold">{formatCurrency(gesamtErwartet)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bescheide */}
        {selectedSections.has('bescheide') && (
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bescheide ({bescheide.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Titel</th>
                      <th className="text-left py-2 pr-4 font-medium">Typ</th>
                      <th className="text-left py-2 pr-4 font-medium">Jahr</th>
                      <th className="text-left py-2 pr-4 font-medium">Finanzamt</th>
                      <th className="text-left py-2 pr-4 font-medium">Status</th>
                      <th className="text-right py-2 pr-4 font-medium">Festgesetzt</th>
                      <th className="text-right py-2 font-medium">Abweichung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bescheide.map(b => (
                      <tr key={b.id} className="border-b border-border/50">
                        <td className="py-2 pr-4 font-medium">{b.titel}</td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {BESCHEID_TYP_LABELS[b.typ]}
                        </td>
                        <td className="py-2 pr-4">{b.steuerjahr}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{b.finanzamt}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={b.status === 'erledigt' ? 'success' : b.status === 'einspruch' ? 'destructive' : 'secondary'}>
                            {BESCHEID_STATUS_LABELS[b.status]}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">
                          {formatCurrency(b.festgesetzteSteuer)}
                        </td>
                        <td className={`py-2 text-right font-mono ${
                          b.abweichung && b.abweichung > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                        }`}>
                          {b.abweichung ? formatCurrency(b.abweichung) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fristen */}
        {selectedSections.has('fristen') && (
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fristen ({fristen.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offeneFristen.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Offene Fristen ({offeneFristen.length})
                    </h4>
                    <div className="space-y-2">
                      {offeneFristen.map(f => (
                        <div key={f.id} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-3">
                          <div>
                            <p className="text-sm font-medium">{f.bescheidTitel}</p>
                            <p className="text-xs text-muted-foreground capitalize">{f.typ}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{formatDate(f.fristdatum)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {erledigteFristen.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Erledigte Fristen ({erledigteFristen.length})
                    </h4>
                    <div className="space-y-2">
                      {erledigteFristen.map(f => (
                        <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-3 opacity-60">
                          <div>
                            <p className="text-sm font-medium">{f.bescheidTitel}</p>
                            <p className="text-xs text-muted-foreground capitalize">{f.typ}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{formatDate(f.fristdatum)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Einsprueche */}
        {selectedSections.has('einsprueche') && (
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Einsprueche ({einsprueche.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {einsprueche.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Einsprueche vorhanden.</p>
              ) : (
                <div className="space-y-3">
                  {einsprueche.map(e => {
                    const bescheid = bescheide.find(b => b.id === e.bescheidId)
                    return (
                      <div key={e.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{bescheid?.titel || 'Unbekannter Bescheid'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {bescheid?.finanzamt} &middot; Frist: {formatDate(e.frist)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              e.status === 'eingereicht' ? 'default' :
                              e.status === 'entschieden' ? 'success' :
                              e.status === 'zurueckgenommen' ? 'destructive' : 'secondary'
                            }>
                              {e.status}
                            </Badge>
                            <p className="text-sm font-bold mt-1">{formatCurrency(e.forderung)}</p>
                          </div>
                        </div>
                        {e.begruendung && (
                          <p className="text-sm text-muted-foreground mt-2 border-t border-border/50 pt-2">
                            {e.begruendung.slice(0, 200)}{e.begruendung.length > 200 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analyse */}
        {selectedSections.has('analyse') && (
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Analyse-Ergebnisse
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const mitPruefung = bescheide.filter(b => b.pruefungsergebnis)
                if (mitPruefung.length === 0) {
                  return <p className="text-sm text-muted-foreground">Noch keine Analysen durchgefuehrt.</p>
                }
                return (
                  <div className="space-y-4">
                    {mitPruefung.map(b => (
                      <div key={b.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{b.titel}</p>
                          <Badge variant={
                            b.pruefungsergebnis!.empfehlung === 'akzeptieren' ? 'success' :
                            b.pruefungsergebnis!.empfehlung === 'einspruch' ? 'destructive' : 'warning'
                          }>
                            {b.pruefungsergebnis!.empfehlung}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {b.pruefungsergebnis!.zusammenfassung}
                        </p>
                        {b.pruefungsergebnis!.abweichungen.length > 0 && (
                          <div className="space-y-1.5 mt-2">
                            <p className="text-xs font-medium">
                              {b.pruefungsergebnis!.abweichungen.length} Abweichung(en):
                            </p>
                            {b.pruefungsergebnis!.abweichungen.map(a => (
                              <div key={a.id} className="flex items-center justify-between text-xs rounded bg-muted/50 p-2">
                                <span>{a.position}: {a.beschreibung}</span>
                                <span className="font-mono text-red-600 dark:text-red-400 shrink-0 ml-2">
                                  {formatCurrency(a.differenz)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Einsparpotenzial: {formatCurrency(b.pruefungsergebnis!.einsparpotenzial)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Report Footer */}
        <div className="text-center text-xs text-muted-foreground py-4 print:mt-8 print:border-t">
          <p>Erstellt mit Steuer-Bescheidprüfer &middot; {formatDate(new Date())}</p>
          <p className="mt-0.5">Dieser Bericht dient der persoenlichen Dokumentation und stellt keine Steuerberatung dar.</p>
        </div>
      </div>
    </div>
  )
}
