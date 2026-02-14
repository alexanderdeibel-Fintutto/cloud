import { useState } from 'react'
import {
  ArrowLeftRight,
  FileText,
  TrendingDown,
  TrendingUp,
  Equal,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { formatCurrency } from '../lib/utils'
import { useBescheidContext } from '../contexts/BescheidContext'
import { BESCHEID_TYP_LABELS, BESCHEID_STATUS_LABELS } from '../types/bescheid'
import type { Bescheid } from '../types/bescheid'

function ComparisonBar({ labelA, labelB, valueA, valueB }: { labelA: string; labelB: string; valueA: number; valueB: number }) {
  const max = Math.max(valueA, valueB, 1)
  const pctA = (valueA / max) * 100
  const pctB = (valueB / max) * 100
  const diff = valueB - valueA

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{labelA}</span>
        <span className="text-muted-foreground">{labelB}</span>
      </div>
      <div className="flex gap-1 items-center">
        <div className="flex-1 flex justify-end">
          <div
            className="h-6 rounded-l-md bg-fintutto-blue-500 transition-all duration-500"
            style={{ width: `${pctA}%`, minWidth: valueA > 0 ? '2px' : '0' }}
          />
        </div>
        <div className="w-px h-8 bg-border shrink-0" />
        <div className="flex-1">
          <div
            className="h-6 rounded-r-md bg-amber-500 transition-all duration-500"
            style={{ width: `${pctB}%`, minWidth: valueB > 0 ? '2px' : '0' }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{formatCurrency(valueA)}</span>
        <span className={diff > 0 ? 'text-destructive' : diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
        </span>
        <span>{formatCurrency(valueB)}</span>
      </div>
    </div>
  )
}

function BescheidSummaryCard({ bescheid, color }: { bescheid: Bescheid; color: 'blue' | 'amber' }) {
  const colorClasses = color === 'blue'
    ? 'border-fintutto-blue-200 bg-fintutto-blue-50/50 dark:bg-fintutto-blue-900/20 dark:border-fintutto-blue-800'
    : 'border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-800'

  return (
    <Card className={`${colorClasses}`}>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold truncate">{bescheid.titel}</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Typ</span>
            <span>{BESCHEID_TYP_LABELS[bescheid.typ]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Steuerjahr</span>
            <span>{bescheid.steuerjahr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Finanzamt</span>
            <span className="truncate ml-2">{bescheid.finanzamt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Aktenzeichen</span>
            <span className="truncate ml-2">{bescheid.aktenzeichen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={
              bescheid.status === 'erledigt' ? 'success' :
              bescheid.status === 'einspruch' ? 'destructive' :
              bescheid.status === 'in_pruefung' ? 'warning' : 'secondary'
            }>
              {BESCHEID_STATUS_LABELS[bescheid.status]}
            </Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Festgesetzt</span>
              <span>{formatCurrency(bescheid.festgesetzteSteuer)}</span>
            </div>
            {bescheid.erwarteteSteuer != null && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Erwartet</span>
                <span>{formatCurrency(bescheid.erwarteteSteuer)}</span>
              </div>
            )}
            {bescheid.abweichung != null && bescheid.abweichung !== 0 && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Abweichung</span>
                <span className={bescheid.abweichung > 0 ? 'text-destructive' : 'text-green-600'}>
                  {bescheid.abweichung > 0 ? '+' : ''}{formatCurrency(bescheid.abweichung)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VergleichPage() {
  const { bescheide } = useBescheidContext()
  const [bescheidAId, setBescheidAId] = useState<string>('')
  const [bescheidBId, setBescheidBId] = useState<string>('')

  const bescheidA = bescheide.find(b => b.id === bescheidAId)
  const bescheidB = bescheide.find(b => b.id === bescheidBId)
  const bothSelected = bescheidA && bescheidB

  const swap = () => {
    setBescheidAId(bescheidBId)
    setBescheidBId(bescheidAId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bescheid-Vergleich</h1>
        <p className="text-muted-foreground mt-1">
          Vergleichen Sie zwei Steuerbescheide direkt miteinander
        </p>
      </div>

      {/* Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bescheid A</label>
              <Select value={bescheidAId} onValueChange={setBescheidAId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bescheid auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {bescheide.filter(b => b.id !== bescheidBId).map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.titel} ({b.steuerjahr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 mt-5 sm:mt-0"
              onClick={swap}
              disabled={!bescheidAId || !bescheidBId}
              aria-label="Bescheide tauschen"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bescheid B</label>
              <Select value={bescheidBId} onValueChange={setBescheidBId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bescheid auswaehlen..." />
                </SelectTrigger>
                <SelectContent>
                  {bescheide.filter(b => b.id !== bescheidAId).map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.titel} ({b.steuerjahr})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!bothSelected ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Bescheide auswaehlen</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Waehlen Sie oben zwei Bescheide aus, um einen detaillierten Vergleich zu sehen.
              Ideal zum Vergleichen verschiedener Steuerjahre oder Steuerarten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Side-by-side summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BescheidSummaryCard bescheid={bescheidA} color="blue" />
            <BescheidSummaryCard bescheid={bescheidB} color="amber" />
          </div>

          {/* Visual Comparison Bars */}
          <Card>
            <CardHeader>
              <CardTitle>Finanzieller Vergleich</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-fintutto-blue-500" /> {bescheidA.titel}
                  <span className="mx-1">vs.</span>
                  <span className="h-3 w-3 rounded-sm bg-amber-500" /> {bescheidB.titel}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <ComparisonBar
                labelA="Festgesetzte Steuer A"
                labelB="Festgesetzte Steuer B"
                valueA={bescheidA.festgesetzteSteuer}
                valueB={bescheidB.festgesetzteSteuer}
              />
              {(bescheidA.erwarteteSteuer != null || bescheidB.erwarteteSteuer != null) && (
                <ComparisonBar
                  labelA="Erwartete Steuer A"
                  labelB="Erwartete Steuer B"
                  valueA={bescheidA.erwarteteSteuer ?? 0}
                  valueB={bescheidB.erwarteteSteuer ?? 0}
                />
              )}
              {(bescheidA.abweichung != null || bescheidB.abweichung != null) && (
                <ComparisonBar
                  labelA="Abweichung A"
                  labelB="Abweichung B"
                  valueA={Math.abs(bescheidA.abweichung ?? 0)}
                  valueB={Math.abs(bescheidB.abweichung ?? 0)}
                />
              )}
              {(bescheidA.pruefungsergebnis || bescheidB.pruefungsergebnis) && (
                <ComparisonBar
                  labelA="Einsparpotenzial A"
                  labelB="Einsparpotenzial B"
                  valueA={bescheidA.pruefungsergebnis?.einsparpotenzial ?? 0}
                  valueB={bescheidB.pruefungsergebnis?.einsparpotenzial ?? 0}
                />
              )}
            </CardContent>
          </Card>

          {/* Difference Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschiede im Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 pr-4 font-medium">Merkmal</th>
                      <th className="text-right py-3 px-4 font-medium text-fintutto-blue-600">
                        {bescheidA.titel}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-amber-600">
                        {bescheidB.titel}
                      </th>
                      <th className="text-center py-3 pl-4 font-medium">Differenz</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow
                      label="Festgesetzte Steuer"
                      valueA={bescheidA.festgesetzteSteuer}
                      valueB={bescheidB.festgesetzteSteuer}
                    />
                    <ComparisonRow
                      label="Erwartete Steuer"
                      valueA={bescheidA.erwarteteSteuer ?? 0}
                      valueB={bescheidB.erwarteteSteuer ?? 0}
                    />
                    <ComparisonRow
                      label="Abweichung"
                      valueA={bescheidA.abweichung ?? 0}
                      valueB={bescheidB.abweichung ?? 0}
                    />
                    <ComparisonRow
                      label="Einsparpotenzial"
                      valueA={bescheidA.pruefungsergebnis?.einsparpotenzial ?? 0}
                      valueB={bescheidB.pruefungsergebnis?.einsparpotenzial ?? 0}
                    />
                    <tr className="border-b last:border-0">
                      <td className="py-3 pr-4">Steuerart</td>
                      <td className="py-3 px-4 text-right">{BESCHEID_TYP_LABELS[bescheidA.typ]}</td>
                      <td className="py-3 px-4 text-right">{BESCHEID_TYP_LABELS[bescheidB.typ]}</td>
                      <td className="py-3 pl-4 text-center">
                        {bescheidA.typ === bescheidB.typ ? (
                          <Badge variant="secondary">Gleich</Badge>
                        ) : (
                          <Badge variant="warning">Unterschiedlich</Badge>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b last:border-0">
                      <td className="py-3 pr-4">Status</td>
                      <td className="py-3 px-4 text-right">{BESCHEID_STATUS_LABELS[bescheidA.status]}</td>
                      <td className="py-3 px-4 text-right">{BESCHEID_STATUS_LABELS[bescheidB.status]}</td>
                      <td className="py-3 pl-4 text-center">
                        {bescheidA.status === bescheidB.status ? (
                          <Badge variant="secondary">Gleich</Badge>
                        ) : (
                          <Badge variant="warning">Unterschiedlich</Badge>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b last:border-0">
                      <td className="py-3 pr-4">Finanzamt</td>
                      <td className="py-3 px-4 text-right truncate max-w-[150px]">{bescheidA.finanzamt}</td>
                      <td className="py-3 px-4 text-right truncate max-w-[150px]">{bescheidB.finanzamt}</td>
                      <td className="py-3 pl-4 text-center">
                        {bescheidA.finanzamt === bescheidB.finanzamt ? (
                          <Badge variant="secondary">Gleich</Badge>
                        ) : (
                          <Badge variant="warning">Unterschiedlich</Badge>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Verdict */}
          <Card>
            <CardContent className="pt-6">
              <ComparisonVerdict bescheidA={bescheidA} bescheidB={bescheidB} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ComparisonRow({ label, valueA, valueB }: { label: string; valueA: number; valueB: number }) {
  const diff = valueB - valueA
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4">{label}</td>
      <td className="py-3 px-4 text-right font-medium">{formatCurrency(valueA)}</td>
      <td className="py-3 px-4 text-right font-medium">{formatCurrency(valueB)}</td>
      <td className="py-3 pl-4 text-center">
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
          diff > 0 ? 'text-destructive' : diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}>
          {diff > 0 ? <TrendingUp className="h-3 w-3" /> : diff < 0 ? <TrendingDown className="h-3 w-3" /> : <Equal className="h-3 w-3" />}
          {diff !== 0 ? `${diff > 0 ? '+' : ''}${formatCurrency(diff)}` : '-'}
        </span>
      </td>
    </tr>
  )
}

function ComparisonVerdict({ bescheidA, bescheidB }: { bescheidA: Bescheid; bescheidB: Bescheid }) {
  const diffSteuer = bescheidB.festgesetzteSteuer - bescheidA.festgesetzteSteuer
  const diffAbweichung = (bescheidB.abweichung ?? 0) - (bescheidA.abweichung ?? 0)
  const betterA = diffSteuer > 0
  const savingsA = bescheidA.pruefungsergebnis?.einsparpotenzial ?? 0
  const savingsB = bescheidB.pruefungsergebnis?.einsparpotenzial ?? 0

  const hasSignificantDiff = Math.abs(diffSteuer) > 100

  if (!hasSignificantDiff) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
        <div>
          <h4 className="font-semibold">Bescheide nahezu identisch</h4>
          <p className="text-sm text-muted-foreground">
            Die festgesetzten Steuerbetraege unterscheiden sich nur minimal (Differenz: {formatCurrency(Math.abs(diffSteuer))}).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 rounded-lg p-4 ${
        betterA ? 'bg-fintutto-blue-50 dark:bg-fintutto-blue-900/20 border border-fintutto-blue-200 dark:border-fintutto-blue-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        <AlertTriangle className={`h-6 w-6 shrink-0 ${betterA ? 'text-fintutto-blue-600' : 'text-amber-600'}`} />
        <div>
          <h4 className="font-semibold">
            {betterA ? bescheidA.titel : bescheidB.titel} hat die niedrigere Steuerlast
          </h4>
          <p className="text-sm text-muted-foreground">
            Die Differenz betraegt {formatCurrency(Math.abs(diffSteuer))} bei der festgesetzten Steuer.
            {Math.abs(diffAbweichung) > 50 && ` Die Abweichung unterscheidet sich um ${formatCurrency(Math.abs(diffAbweichung))}.`}
          </p>
        </div>
      </div>
      {(savingsA > 0 || savingsB > 0) && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <TrendingDown className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">Einsparpotenzial</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {bescheidA.titel}: {formatCurrency(savingsA)} &middot; {bescheidB.titel}: {formatCurrency(savingsB)}
              {savingsA !== savingsB && ` (Differenz: ${formatCurrency(Math.abs(savingsA - savingsB))})`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
