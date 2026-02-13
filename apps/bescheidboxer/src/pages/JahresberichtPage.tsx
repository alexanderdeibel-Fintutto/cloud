import { useState, useRef } from 'react'
import {
  FileText,
  TrendingDown,
  ShieldAlert,
  Clock,
  Printer,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatCurrency, formatDate } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import { BESCHEID_STATUS_LABELS, BESCHEID_TYP_LABELS } from '../types/bescheid'

export default function JahresberichtPage() {
  const { bescheide, fristen, einsprueche } = useBescheidContext()
  const reportRef = useRef<HTMLDivElement>(null)

  const years = [...new Set(bescheide.map(b => b.steuerjahr))].sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState<string>(years[0]?.toString() || new Date().getFullYear().toString())
  const year = parseInt(selectedYear)

  const yearBescheide = bescheide.filter(b => b.steuerjahr === year)
  const yearEinsprueche = einsprueche.filter(e => {
    const b = bescheide.find(b => b.id === e.bescheidId)
    return b?.steuerjahr === year
  })
  const yearFristen = fristen.filter(f => {
    const b = bescheide.find(b => b.id === f.bescheidId)
    return b?.steuerjahr === year
  })

  const totalFestgesetzt = yearBescheide.reduce((sum, b) => sum + b.festgesetzteSteuer, 0)
  const totalErwartet = yearBescheide.reduce((sum, b) => sum + (b.erwarteteSteuer || 0), 0)
  const totalAbweichung = yearBescheide.reduce((sum, b) => sum + (b.abweichung || 0), 0)
  const totalEinsparpotenzial = yearBescheide.reduce((sum, b) => sum + (b.pruefungsergebnis?.einsparpotenzial || 0), 0)
  const erledigteFristen = yearFristen.filter(f => f.erledigt).length

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jahresbericht</h1>
          <p className="text-muted-foreground mt-1">
            Zusammenfassung Ihrer Steuer-Aktivitaeten
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent>
              {years.length > 0 ? (
                years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))
              ) : (
                <SelectItem value={new Date().getFullYear().toString()}>
                  {new Date().getFullYear()}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Drucken</span>
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 print:space-y-4">
        {/* Print header */}
        <div className="hidden print:block text-center pb-4 border-b">
          <h1 className="text-2xl font-bold">Fintutto Bescheidboxer - Jahresbericht {year}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Erstellt am {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{yearBescheide.length}</p>
                  <p className="text-xs text-muted-foreground">Bescheide</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900 p-2">
                  <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalEinsparpotenzial)}</p>
                  <p className="text-xs text-muted-foreground">Einsparpotenzial</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 dark:bg-red-900 p-2">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{yearEinsprueche.length}</p>
                  <p className="text-xs text-muted-foreground">Einsprueche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900 p-2">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{erledigteFristen}/{yearFristen.length}</p>
                  <p className="text-xs text-muted-foreground">Fristen erledigt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Finanzuebersicht {year}</CardTitle>
            <CardDescription>Festgesetzte vs. erwartete Steuer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Festgesetzte Steuer</p>
                <p className="text-2xl font-bold">{formatCurrency(totalFestgesetzt)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Erwartete Steuer</p>
                <p className="text-2xl font-bold">{formatCurrency(totalErwartet)}</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${totalAbweichung > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950'}`}>
                <p className="text-sm text-muted-foreground mb-1">Abweichung</p>
                <p className={`text-2xl font-bold ${totalAbweichung > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {totalAbweichung > 0 ? '+' : ''}{formatCurrency(totalAbweichung)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bescheide List */}
        {yearBescheide.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bescheide im Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">Bescheid</th>
                      <th className="text-left py-2 px-4 hidden sm:table-cell">Typ</th>
                      <th className="text-right py-2 px-4">Festgesetzt</th>
                      <th className="text-right py-2 px-4 hidden sm:table-cell">Abweichung</th>
                      <th className="text-center py-2 pl-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearBescheide.map(b => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{b.titel}</p>
                          <p className="text-xs text-muted-foreground">{b.finanzamt}</p>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                          {BESCHEID_TYP_LABELS[b.typ]}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(b.festgesetzteSteuer)}
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          {b.abweichung != null && b.abweichung !== 0 ? (
                            <span className={b.abweichung > 0 ? 'text-destructive' : 'text-green-600'}>
                              {b.abweichung > 0 ? '+' : ''}{formatCurrency(b.abweichung)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <Badge variant={
                            b.status === 'erledigt' ? 'success' :
                            b.status === 'einspruch' ? 'destructive' :
                            b.status === 'in_pruefung' ? 'warning' : 'secondary'
                          }>
                            {BESCHEID_STATUS_LABELS[b.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Einsprueche */}
        {yearEinsprueche.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Einsprueche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yearEinsprueche.map(e => {
                  const b = bescheide.find(b => b.id === e.bescheidId)
                  return (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{b?.titel || 'Unbekannter Bescheid'}</p>
                        <p className="text-xs text-muted-foreground">
                          Forderung: {formatCurrency(e.forderung)} &middot; Frist: {formatDate(e.frist)}
                        </p>
                      </div>
                      <Badge variant={
                        e.status === 'entschieden' ? 'success' :
                        e.status === 'eingereicht' || e.status === 'in_bearbeitung' ? 'warning' :
                        'secondary'
                      }>
                        {e.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {yearBescheide.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Keine Daten fuer {year}</h3>
              <p className="text-muted-foreground">
                Es wurden keine Bescheide fuer dieses Steuerjahr gefunden.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center pt-4 border-t text-xs text-muted-foreground">
          <p>Fintutto Bescheidboxer &middot; www.fintutto.de &middot; Erstellt am {new Date().toLocaleDateString('de-DE')}</p>
        </div>
      </div>
    </div>
  )
}
