import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingDown,
  ArrowLeft,
  FileText,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { formatCurrency } from '../../lib/utils'
import { useBescheidContext } from '../../contexts/BescheidContext'
import type { Abweichung } from '../../types/bescheid'

const KATEGORIE_LABELS: Record<string, string> = {
  werbungskosten: 'Werbungskosten',
  sonderausgaben: 'Sonderausgaben',
  aussergewoehnliche_belastungen: 'Aussergew. Belastungen',
  vorsorgeaufwendungen: 'Vorsorgeaufwendungen',
  einkuenfte: 'Einkuenfte',
  freibetraege: 'Freibetraege',
  sonstige: 'Sonstige',
}

const KATEGORIE_COLORS: Record<string, string> = {
  werbungskosten: '#3b82f6',
  sonderausgaben: '#8b5cf6',
  aussergewoehnliche_belastungen: '#ec4899',
  vorsorgeaufwendungen: '#06b6d4',
  einkuenfte: '#f59e0b',
  freibetraege: '#22c55e',
  sonstige: '#6b7280',
}

export default function AnalysePage() {
  const { id } = useParams()
  const { bescheide } = useBescheidContext()
  const [selectedBescheid, setSelectedBescheid] = useState(
    id ? bescheide.find(b => b.id === id) : bescheide.find(b => b.pruefungsergebnis && b.pruefungsergebnis.abweichungen.length > 0)
  )

  if (!selectedBescheid) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bescheid-Analyse</h1>
          <p className="text-muted-foreground mt-1">Waehlen Sie einen Bescheid zur Analyse aus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bescheide.map(b => (
            <Card
              key={b.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedBescheid(b)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{b.titel}</CardTitle>
                  <Badge variant={b.pruefungsergebnis ? 'default' : 'secondary'}>
                    {b.pruefungsergebnis ? 'Analysiert' : 'Ausstehend'}
                  </Badge>
                </div>
                <CardDescription>{b.finanzamt} &middot; {b.aktenzeichen}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Festgesetzte Steuer</span>
                  <span className="font-medium">{formatCurrency(b.festgesetzteSteuer)}</span>
                </div>
                {b.abweichung !== null && b.abweichung > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Abweichung</span>
                    <span className="font-medium text-destructive">+{formatCurrency(b.abweichung)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const pruefung = selectedBescheid.pruefungsergebnis

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 mb-2 -ml-2"
            onClick={() => setSelectedBescheid(undefined)}
          >
            <ArrowLeft className="h-3 w-3" />
            Zurueck zur Auswahl
          </Button>
          <h1 className="text-3xl font-bold">{selectedBescheid.titel}</h1>
          <p className="text-muted-foreground mt-1">
            {selectedBescheid.finanzamt} &middot; Aktenzeichen: {selectedBescheid.aktenzeichen}
          </p>
        </div>
        {pruefung?.empfehlung === 'einspruch' && (
          <Link to={`/einspruch/neu/${selectedBescheid.id}`}>
            <Button className="gap-2" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              Einspruch einlegen
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Festgesetzt</p>
                <p className="text-xl font-bold">{formatCurrency(selectedBescheid.festgesetzteSteuer)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Erwartet</p>
                <p className="text-xl font-bold">
                  {selectedBescheid.erwarteteSteuer ? formatCurrency(selectedBescheid.erwarteteSteuer) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/40 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abweichung</p>
                <p className="text-xl font-bold text-destructive">
                  {selectedBescheid.abweichung ? `+${formatCurrency(selectedBescheid.abweichung)}` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2">
                <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Einsparpotenzial</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {pruefung ? formatCurrency(pruefung.einsparpotenzial) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {pruefung ? (
        <Tabs defaultValue="zusammenfassung">
          <TabsList>
            <TabsTrigger value="zusammenfassung">Zusammenfassung</TabsTrigger>
            <TabsTrigger value="abweichungen">
              Abweichungen ({pruefung.abweichungen.length})
            </TabsTrigger>
            <TabsTrigger value="vergleich">Vergleich</TabsTrigger>
            <TabsTrigger value="kategorien">Kategorien</TabsTrigger>
          </TabsList>

          <TabsContent value="zusammenfassung" className="space-y-4">
            {/* Empfehlung */}
            <Card>
              <CardContent className="pt-6">
                <div className={`rounded-lg p-4 ${
                  pruefung.empfehlung === 'einspruch' ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' :
                  pruefung.empfehlung === 'pruefen' ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800' :
                  'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {pruefung.empfehlung === 'einspruch' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : pruefung.empfehlung === 'pruefen' ? (
                      <Search className="h-5 w-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    <h3 className={`font-semibold ${
                      pruefung.empfehlung === 'einspruch' ? 'text-red-800 dark:text-red-200' :
                      pruefung.empfehlung === 'pruefen' ? 'text-amber-800 dark:text-amber-200' :
                      'text-green-800 dark:text-green-200'
                    }`}>
                      Empfehlung: {
                        pruefung.empfehlung === 'einspruch' ? 'Einspruch einlegen' :
                        pruefung.empfehlung === 'pruefen' ? 'Weitere Pruefung empfohlen' :
                        'Bescheid akzeptieren'
                      }
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    pruefung.empfehlung === 'einspruch' ? 'text-red-700 dark:text-red-300' :
                    pruefung.empfehlung === 'pruefen' ? 'text-amber-700 dark:text-amber-300' :
                    'text-green-700 dark:text-green-300'
                  }`}>
                    {pruefung.zusammenfassung}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abweichungen" className="space-y-4">
            {pruefung.abweichungen.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">Keine Abweichungen</h3>
                  <p className="text-muted-foreground">Der Bescheid stimmt mit Ihrer Erklaerung ueberein.</p>
                </CardContent>
              </Card>
            ) : (
              pruefung.abweichungen.map((abw) => (
                <AbweichungCard key={abw.id} abweichung={abw} />
              ))
            )}
          </TabsContent>

          <TabsContent value="vergleich" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Positionen-Vergleich</CardTitle>
                <CardDescription>Gegenueber&shy;stellung: Ihre Erklaerung vs. Festsetzung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 pr-4 font-medium">Position</th>
                        <th className="text-right py-3 px-4 font-medium">Erklaert</th>
                        <th className="text-right py-3 px-4 font-medium">Festgesetzt</th>
                        <th className="text-right py-3 pl-4 font-medium">Differenz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pruefung.abweichungen.map((abw) => (
                        <tr key={abw.id} className="border-b last:border-0">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <SchwereGradIcon schweregrad={abw.schweregrad} />
                              <span>{abw.position}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{formatCurrency(abw.erklaerterBetrag)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(abw.festgesetzterBetrag)}</td>
                          <td className={`text-right py-3 pl-4 font-medium ${abw.differenz > 0 ? 'text-destructive' : abw.differenz < 0 ? 'text-green-600' : ''}`}>
                            {abw.differenz > 0 ? '+' : ''}{formatCurrency(abw.differenz)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td className="py-3 pr-4 font-semibold">Gesamt</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(pruefung.abweichungen.reduce((s, a) => s + a.erklaerterBetrag, 0))}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(pruefung.abweichungen.reduce((s, a) => s + a.festgesetzterBetrag, 0))}
                        </td>
                        <td className="text-right py-3 pl-4 font-semibold text-destructive">
                          +{formatCurrency(pruefung.abweichungen.reduce((s, a) => s + a.differenz, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kategorien" className="space-y-4">
            <KategorienAnalyse abweichungen={pruefung.abweichungen} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Analyse ausstehend</h3>
            <p className="text-muted-foreground mb-4">
              Dieser Bescheid wurde noch nicht analysiert.
            </p>
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Analyse starten
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AbweichungCard({ abweichung }: { abweichung: Abweichung }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <SchwereGradIcon schweregrad={abweichung.schweregrad} />
            <div>
              <h4 className="font-medium">{abweichung.position}</h4>
              <Badge variant="secondary" className="mt-1 capitalize">{abweichung.kategorie.replace('_', ' ')}</Badge>
            </div>
          </div>
          <Badge variant={
            abweichung.schweregrad === 'kritisch' ? 'destructive' :
            abweichung.schweregrad === 'warnung' ? 'warning' : 'secondary'
          }>
            {abweichung.schweregrad === 'kritisch' ? 'Kritisch' :
             abweichung.schweregrad === 'warnung' ? 'Warnung' : 'Info'}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{abweichung.beschreibung}</p>

        <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Erklaert</p>
            <p className="font-medium">{formatCurrency(abweichung.erklaerterBetrag)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Festgesetzt</p>
            <p className="font-medium">{formatCurrency(abweichung.festgesetzterBetrag)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Differenz</p>
            <p className={`font-medium ${abweichung.differenz > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {abweichung.differenz > 0 ? '+' : ''}{formatCurrency(abweichung.differenz)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SchwereGradIcon({ schweregrad }: { schweregrad: string }) {
  if (schweregrad === 'kritisch') return <AlertTriangle className="h-4 w-4 text-red-500" />
  if (schweregrad === 'warnung') return <AlertTriangle className="h-4 w-4 text-amber-500" />
  return <Info className="h-4 w-4 text-blue-500" />
}

function KategorienAnalyse({ abweichungen }: { abweichungen: Abweichung[] }) {
  const categoryData = useMemo(() => {
    const map: Record<string, { kategorie: string; label: string; differenz: number; count: number; color: string }> = {}

    for (const abw of abweichungen) {
      if (!map[abw.kategorie]) {
        map[abw.kategorie] = {
          kategorie: abw.kategorie,
          label: KATEGORIE_LABELS[abw.kategorie] || abw.kategorie,
          differenz: 0,
          count: 0,
          color: KATEGORIE_COLORS[abw.kategorie] || '#6b7280',
        }
      }
      map[abw.kategorie].differenz += Math.abs(abw.differenz)
      map[abw.kategorie].count++
    }

    return Object.values(map).sort((a, b) => b.differenz - a.differenz)
  }, [abweichungen])

  const severityData = useMemo(() => {
    const counts = { kritisch: 0, warnung: 0, info: 0 }
    for (const abw of abweichungen) {
      counts[abw.schweregrad]++
    }
    return [
      { label: 'Kritisch', count: counts.kritisch, color: '#ef4444', pct: abweichungen.length > 0 ? (counts.kritisch / abweichungen.length) * 100 : 0 },
      { label: 'Warnung', count: counts.warnung, color: '#f59e0b', pct: abweichungen.length > 0 ? (counts.warnung / abweichungen.length) * 100 : 0 },
      { label: 'Info', count: counts.info, color: '#3b82f6', pct: abweichungen.length > 0 ? (counts.info / abweichungen.length) * 100 : 0 },
    ]
  }, [abweichungen])

  if (abweichungen.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Keine Abweichungen</h3>
          <p className="text-muted-foreground">Keine Kategorien-Analyse moeglich.</p>
        </CardContent>
      </Card>
    )
  }

  const maxDiff = Math.max(...categoryData.map(d => d.differenz), 1)

  return (
    <>
      {/* Category breakdown with chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Abweichungen nach Kategorie
            </CardTitle>
            <CardDescription>Aufschluesselung nach Steuer-Positionen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <YAxis type="category" dataKey="label" width={120} className="text-xs" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Differenz']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="differenz" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.kategorie} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schweregrad-Verteilung</CardTitle>
            <CardDescription>Wie kritisch sind die Abweichungen?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {severityData.map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">{item.count} ({item.pct.toFixed(0)}%)</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gesamt-Abweichungen</span>
                <span className="font-bold">{abweichungen.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Betroffene Kategorien</span>
                <span className="font-bold">{categoryData.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Groesste Abweichung</span>
                <span className="font-bold text-destructive">
                  {formatCurrency(Math.max(...abweichungen.map(a => Math.abs(a.differenz))))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category detail cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kategorien im Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map(cat => (
              <div key={cat.kategorie} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium">{cat.label}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {cat.count} Abweichung{cat.count > 1 ? 'en' : ''}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-destructive">{formatCurrency(cat.differenz)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(cat.differenz / maxDiff) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
