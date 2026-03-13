import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowDownUp, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function SteuerlicheVerlustePage() {
  const [einkuenfte, setEinkuenfte] = useState(60000)
  const [verlust, setVerlust] = useState(20000)
  const [verlustvortrag, setVerlustvortrag] = useState(15000)
  const [verlustruecktrag, setVerlustruecktrag] = useState(true)
  const [vorjahresZvE, setVorjahresZvE] = useState(55000)
  const [splitting, setSplitting] = useState(false)

  const ergebnis = useMemo(() => {
    const gesamtVerlust = verlust + verlustvortrag

    // Verlustverrechnung im laufenden Jahr (horizontaler + vertikaler Ausgleich)
    const zvEOhneVerrechnung = Math.max(einkuenfte, 0)
    const verrechnungLaufend = Math.min(gesamtVerlust, zvEOhneVerrechnung)
    const zvENachVerrechnung = zvEOhneVerrechnung - verrechnungLaufend
    const restVerlust = gesamtVerlust - verrechnungLaufend

    // Verlustrücktrag (§ 10d Abs. 1): max. 10 Mio / 20 Mio bei Splitting
    const maxRuecktrag = splitting ? 20000000 : 10000000
    const ruecktragBetrag = verlustruecktrag ? Math.min(restVerlust, maxRuecktrag, vorjahresZvE) : 0
    const verbleibendeVerluste = restVerlust - ruecktragBetrag

    // Steuer ohne Verlustverrechnung
    const estOhne = calcESt(splitting ? Math.round(zvEOhneVerrechnung / 2) : zvEOhneVerrechnung) * (splitting ? 2 : 1)

    // Steuer mit Verlustverrechnung
    const estMit = calcESt(splitting ? Math.round(zvENachVerrechnung / 2) : zvENachVerrechnung) * (splitting ? 2 : 1)

    // Steuerersparnis laufendes Jahr
    const ersparnisLaufend = estOhne - estMit

    // Rücktrag-Ersparnis (Vorjahr)
    const estVorjahrOhne = calcESt(splitting ? Math.round(vorjahresZvE / 2) : vorjahresZvE) * (splitting ? 2 : 1)
    const estVorjahrMit = calcESt(splitting ? Math.round((vorjahresZvE - ruecktragBetrag) / 2) : vorjahresZvE - ruecktragBetrag) * (splitting ? 2 : 1)
    const ersparnisRuecktrag = estVorjahrOhne - estVorjahrMit

    const gesamtErsparnis = ersparnisLaufend + ersparnisRuecktrag

    const chartData = [
      { name: 'Ohne Verluste', est: estOhne, zvE: zvEOhneVerrechnung },
      { name: 'Mit Verrechnung', est: estMit, zvE: zvENachVerrechnung },
      { name: 'Vorjahr (ohne)', est: estVorjahrOhne, zvE: vorjahresZvE },
      { name: 'Vorjahr (mit Rtg)', est: estVorjahrMit, zvE: vorjahresZvE - ruecktragBetrag },
    ]

    return {
      zvEOhneVerrechnung, zvENachVerrechnung, verrechnungLaufend,
      ruecktragBetrag, verbleibendeVerluste,
      estOhne, estMit, ersparnisLaufend, ersparnisRuecktrag, gesamtErsparnis,
      chartData,
    }
  }, [einkuenfte, verlust, verlustvortrag, verlustruecktrag, vorjahresZvE, splitting])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowDownUp className="h-6 w-6 text-primary" />
          Steuerliche Verluste
        </h1>
        <p className="text-muted-foreground mt-1">
          Verlustverrechnung, -rücktrag & -vortrag – § 10d EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Verlustausgleich:</strong> Horizontaler (gleiche Einkunftsart) und vertikaler (verschiedene Einkunftsarten) Ausgleich im laufenden Jahr.</p>
              <p><strong>Verlustrücktrag (§ 10d Abs. 1):</strong> Bis 10 Mio EUR (20 Mio bei Splitting) in das Vorjahr zurücktragbar.</p>
              <p><strong>Verlustvortrag (§ 10d Abs. 2):</strong> 1 Mio EUR unbeschränkt + 60% des übersteigenden GdE (Mindestbesteuerung).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Positive Einkünfte (lfd. Jahr): {einkuenfte.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={einkuenfte} onChange={e => setEinkuenfte(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Verlust (lfd. Jahr): {verlust.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={verlust} onChange={e => setVerlust(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Verlustvortrag aus Vorjahren: {verlustvortrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={verlustvortrag} onChange={e => setVerlustvortrag(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Vorjahres-zvE (für Rücktrag): {vorjahresZvE.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={vorjahresZvE} onChange={e => setVorjahresZvE(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={verlustruecktrag} onChange={e => setVerlustruecktrag(e.target.checked)} className="accent-primary" />
                Verlustrücktrag nutzen
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
                Zusammenveranlagung
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-6">
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtErsparnis.toLocaleString('de-DE')} EUR</p>
              <p className="text-sm text-muted-foreground mt-1">Gesamte Steuerersparnis</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Positive Einkünfte</span>
                <span className="font-medium">{einkuenfte.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verluste gesamt</span>
                <span className="font-medium text-red-600">-{(verlust + verlustvortrag).toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verrechnung (lfd. Jahr)</span>
                <span className="font-medium text-green-600">-{ergebnis.verrechnungLaufend.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">zvE nach Verrechnung</span>
                <span className="font-medium">{ergebnis.zvENachVerrechnung.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Ersparnis (lfd. Jahr)</span>
                <span className="font-medium text-green-600">{ergebnis.ersparnisLaufend.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.ruecktragBetrag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Verlustrücktrag (Vorjahr)</span>
                  <span className="font-medium text-green-600">{ergebnis.ruecktragBetrag.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.ruecktragBetrag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Ersparnis (Rücktrag)</span>
                  <span className="font-medium text-green-600">{ergebnis.ersparnisRuecktrag.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Verbleibender Verlustvortrag</span>
                <span className="font-medium">{ergebnis.verbleibendeVerluste.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Steuervergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="est" name="Einkommensteuer" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Verlustarten & Besonderheiten</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Allgemeine Verluste</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Gewerbebetrieb, V+V</li>
                <li>- Freiberufler, Land+Forst</li>
                <li>- Horizontal + vertikal</li>
                <li>- § 10d Rücktrag/Vortrag</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Kapitalverluste</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Nur mit Kapitalerträgen</li>
                <li>- Aktien-Topf separat</li>
                <li>- Kein vertikaler Ausgleich</li>
                <li>- Verlustbescheinigung 15.12.</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">§ 15b / § 15a</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Steuerstundungsmodelle</li>
                <li>- Nur gleiche Einkunftsquelle</li>
                <li>- Kommanditisten-Verluste</li>
                <li>- Beschränkte Haftung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
