import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { GitCompareArrows, ArrowUp, ArrowDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface BescheidPosition {
  bezeichnung: string
  alt: number
  neu: number
}

interface BescheidSet {
  label: string
  jahr: number
  datum: string
  positionen: BescheidPosition[]
}

const DEMO_SETS: BescheidSet[] = [
  {
    label: 'ESt-Bescheid 2024 (Original)',
    jahr: 2024,
    datum: '2025-06-15',
    positionen: [
      { bezeichnung: 'Einkünfte aus nichtselbstständiger Arbeit', alt: 0, neu: 68000 },
      { bezeichnung: 'Einkünfte aus Vermietung und Verpachtung', alt: 0, neu: 4200 },
      { bezeichnung: 'Werbungskosten (Anlage N)', alt: 0, neu: -2850 },
      { bezeichnung: 'Sonderausgaben', alt: 0, neu: -3600 },
      { bezeichnung: 'Vorsorgeaufwendungen', alt: 0, neu: -5400 },
      { bezeichnung: 'Zu versteuerndes Einkommen', alt: 0, neu: 60350 },
      { bezeichnung: 'Festgesetzte Einkommensteuer', alt: 0, neu: 15234 },
      { bezeichnung: 'Solidaritätszuschlag', alt: 0, neu: 0 },
      { bezeichnung: 'Kirchensteuer', alt: 0, neu: 1371 },
      { bezeichnung: 'Angerechnete Lohnsteuer', alt: 0, neu: -17800 },
      { bezeichnung: 'Erstattung / Nachzahlung', alt: 0, neu: 1195 },
    ],
  },
  {
    label: 'ESt-Bescheid 2024 (nach Einspruch)',
    jahr: 2024,
    datum: '2025-10-20',
    positionen: [
      { bezeichnung: 'Einkünfte aus nichtselbstständiger Arbeit', alt: 68000, neu: 68000 },
      { bezeichnung: 'Einkünfte aus Vermietung und Verpachtung', alt: 4200, neu: 3800 },
      { bezeichnung: 'Werbungskosten (Anlage N)', alt: -2850, neu: -4200 },
      { bezeichnung: 'Sonderausgaben', alt: -3600, neu: -3600 },
      { bezeichnung: 'Vorsorgeaufwendungen', alt: -5400, neu: -5400 },
      { bezeichnung: 'Zu versteuerndes Einkommen', alt: 60350, neu: 58600 },
      { bezeichnung: 'Festgesetzte Einkommensteuer', alt: 15234, neu: 14520 },
      { bezeichnung: 'Solidaritätszuschlag', alt: 0, neu: 0 },
      { bezeichnung: 'Kirchensteuer', alt: 1371, neu: 1307 },
      { bezeichnung: 'Angerechnete Lohnsteuer', alt: -17800, neu: -17800 },
      { bezeichnung: 'Erstattung / Nachzahlung', alt: 1195, neu: 1973 },
    ],
  },
]

export default function BescheidVergleicherPage() {
  const [selectedSet, setSelectedSet] = useState(1)
  const bescheid = DEMO_SETS[selectedSet]

  const abweichungen = bescheid.positionen.filter(p => p.alt !== p.neu)
  const gesamtDifferenz = bescheid.positionen
    .filter(p => p.bezeichnung === 'Erstattung / Nachzahlung')
    .reduce((s, p) => s + (p.neu - p.alt), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-violet-500" />
          Bescheid-Vergleicher
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerbescheide Position für Position vergleichen und Abweichungen erkennen
        </p>
      </div>

      {/* Auswahl */}
      <div className="flex gap-2 flex-wrap">
        {DEMO_SETS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelectedSet(i)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
              selectedSet === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bescheid-Datum</p>
            <p className="text-lg font-bold">{new Date(bescheid.datum).toLocaleDateString('de-DE')}</p>
            <p className="text-xs text-muted-foreground">Steuerjahr {bescheid.jahr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Abweichungen</p>
            <p className="text-2xl font-bold text-amber-600">{abweichungen.length}</p>
            <p className="text-xs text-muted-foreground">von {bescheid.positionen.length} Positionen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Erstattungs-Differenz</p>
            <p className={`text-2xl font-bold ${gesamtDifferenz >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gesamtDifferenz >= 0 ? '+' : ''}{gesamtDifferenz.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vergleichstabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Positionsvergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Position</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Alt</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Neu</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Differenz</th>
                  <th className="pb-2 text-center font-medium text-muted-foreground w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {bescheid.positionen.map((p, i) => {
                  const diff = p.neu - p.alt
                  const hasChange = diff !== 0
                  const isErstattung = p.bezeichnung === 'Erstattung / Nachzahlung'
                  const isSumme = p.bezeichnung === 'Zu versteuerndes Einkommen' || p.bezeichnung === 'Festgesetzte Einkommensteuer' || isErstattung

                  return (
                    <tr
                      key={i}
                      className={`border-b last:border-0 transition-colors ${
                        hasChange ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''
                      } ${isSumme ? 'font-medium' : ''}`}
                    >
                      <td className="py-2.5">{p.bezeichnung}</td>
                      <td className="py-2.5 text-right text-muted-foreground font-mono">
                        {p.alt !== 0 ? `${p.alt.toLocaleString('de-DE')} €` : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        {p.neu.toLocaleString('de-DE')} €
                      </td>
                      <td className={`py-2.5 text-right font-mono font-medium ${
                        !hasChange ? 'text-muted-foreground' :
                        (isErstattung ? (diff > 0 ? 'text-green-600' : 'text-red-600') :
                        (diff > 0 ? 'text-red-600' : 'text-green-600'))
                      }`}>
                        {hasChange ? `${diff > 0 ? '+' : ''}${diff.toLocaleString('de-DE')} €` : '—'}
                      </td>
                      <td className="py-2.5 text-center">
                        {!hasChange ? (
                          <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                        ) : isErstattung ? (
                          diff > 0 ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                        ) : (
                          diff > 0 ? <ArrowUp className="h-4 w-4 text-red-500 mx-auto" /> : <ArrowDown className="h-4 w-4 text-green-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Abweichungs-Details */}
      {abweichungen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Erkannte Abweichungen ({abweichungen.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {abweichungen.map((p, i) => {
                const diff = p.neu - p.alt
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <div>
                      <p className="text-sm font-medium">{p.bezeichnung}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.alt !== 0 ? `${p.alt.toLocaleString('de-DE')} €` : 'Neu'} → {p.neu.toLocaleString('de-DE')} €
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diff > 0 ? '+' : ''}{diff.toLocaleString('de-DE')} €
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Demo-Daten: Vergleich Original- vs. geändertem Bescheid nach Einspruch. Im Portal können Sie eigene Bescheide hochladen.
      </p>
    </div>
  )
}
