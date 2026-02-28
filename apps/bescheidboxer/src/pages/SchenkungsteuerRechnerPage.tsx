import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Gift, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STEUERKLASSEN = [
  { klasse: 'I', empfaenger: 'Ehegatte/Lebenspartner', freibetrag: 500000 },
  { klasse: 'I', empfaenger: 'Kinder, Stiefkinder', freibetrag: 400000 },
  { klasse: 'I', empfaenger: 'Enkel', freibetrag: 200000 },
  { klasse: 'I', empfaenger: 'Eltern/Grosseltern (bei Schenkung)', freibetrag: 20000 },
  { klasse: 'II', empfaenger: 'Geschwister', freibetrag: 20000 },
  { klasse: 'II', empfaenger: 'Nichten/Neffen', freibetrag: 20000 },
  { klasse: 'II', empfaenger: 'Schwiegerkinder', freibetrag: 20000 },
  { klasse: 'II', empfaenger: 'Stiefeltern', freibetrag: 20000 },
  { klasse: 'III', empfaenger: 'Sonstige Personen', freibetrag: 20000 },
]

interface Steuertarif {
  bis: number
  klasse1: number
  klasse2: number
  klasse3: number
}

const TARIFE: Steuertarif[] = [
  { bis: 75000, klasse1: 7, klasse2: 15, klasse3: 30 },
  { bis: 300000, klasse1: 11, klasse2: 20, klasse3: 30 },
  { bis: 600000, klasse1: 15, klasse2: 25, klasse3: 30 },
  { bis: 6000000, klasse1: 19, klasse2: 30, klasse3: 30 },
  { bis: 13000000, klasse1: 23, klasse2: 35, klasse3: 50 },
  { bis: 26000000, klasse1: 27, klasse2: 40, klasse3: 50 },
  { bis: Infinity, klasse1: 30, klasse2: 43, klasse3: 50 },
]

function berechneSchenkungsteuer(wert: number, freibetrag: number, steuerklasse: 'I' | 'II' | 'III'): number {
  const steuerpflichtig = Math.max(wert - freibetrag, 0)
  if (steuerpflichtig === 0) return 0

  const key = steuerklasse === 'I' ? 'klasse1' : steuerklasse === 'II' ? 'klasse2' : 'klasse3'

  for (const t of TARIFE) {
    if (steuerpflichtig <= t.bis) {
      return Math.round(steuerpflichtig * t[key] / 100)
    }
  }
  return 0
}

export default function SchenkungsteuerRechnerPage() {
  const [wert, setWert] = useState(500000)
  const [empfaengerIndex, setEmpfaengerIndex] = useState(1)

  const empfaenger = STEUERKLASSEN[empfaengerIndex]
  const steuerklasse = empfaenger.klasse as 'I' | 'II' | 'III'

  const ergebnis = useMemo(() => {
    const freibetrag = empfaenger.freibetrag
    const steuerpflichtig = Math.max(wert - freibetrag, 0)
    const steuer = berechneSchenkungsteuer(wert, freibetrag, steuerklasse)
    const steuersatz = steuerpflichtig > 0 ? Math.round(steuer / steuerpflichtig * 100 * 10) / 10 : 0
    const effektiverSatz = wert > 0 ? Math.round(steuer / wert * 100 * 10) / 10 : 0
    const netto = wert - steuer

    // 10-Jahres-Strategie: Alle 10 Jahre schenken (Freibetrag erneuert sich)
    const jahresBedarf = Math.ceil(wert / freibetrag)
    const zeitraum10J = jahresBedarf * 10

    return { freibetrag, steuerpflichtig, steuer, steuersatz, effektiverSatz, netto, jahresBedarf, zeitraum10J }
  }, [wert, empfaenger, steuerklasse])

  const chartData = STEUERKLASSEN.filter((_, i) => [0, 1, 2, 4, 8].includes(i)).map(sk => ({
    name: sk.empfaenger.length > 16 ? sk.empfaenger.slice(0, 16) + '.' : sk.empfaenger,
    steuer: berechneSchenkungsteuer(wert, sk.freibetrag, sk.klasse as 'I' | 'II' | 'III'),
    freibetrag: sk.freibetrag,
    fill: sk.empfaenger === empfaenger.empfaenger ? '#7c3aed' : '#d4d4d8',
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Schenkungsteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Schenkungsteuer berechnen – § 7 ErbStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Schenkungsteuer:</strong> Entspricht der Erbschaftsteuer (ErbStG). Schenkungen unter Lebenden werden nach denselben Steuersaetzen besteuert.</p>
              <p><strong>10-Jahres-Regel:</strong> Freibetraege erneuern sich alle 10 Jahre. Durch geschickte Planung laesst sich die Steuerlast erheblich reduzieren.</p>
              <p><strong>Anzeigepflicht:</strong> Schenkungen muessen innerhalb von 3 Monaten dem Finanzamt angezeigt werden (§ 30 ErbStG).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Wert der Schenkung: {wert.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={5000000} step={10000} value={wert} onChange={e => setWert(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10.000 EUR</span><span>5.000.000 EUR</span></div>
            </div>

            <div>
              <label className="text-sm font-medium">Empfaenger</label>
              <select value={empfaengerIndex} onChange={e => setEmpfaengerIndex(+e.target.value)} className="w-full mt-1 rounded-md border px-3 py-2 text-sm bg-background">
                {STEUERKLASSEN.map((sk, i) => (
                  <option key={i} value={i}>
                    {sk.empfaenger} – Klasse {sk.klasse} (Freibetrag: {sk.freibetrag.toLocaleString('de-DE')} EUR)
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className={`rounded-lg p-4 text-center ${ergebnis.steuer === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <p className={`text-2xl font-bold ${ergebnis.steuer === 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {ergebnis.steuer.toLocaleString('de-DE')} EUR
                </p>
                <p className="text-xs text-muted-foreground mt-1">Schenkungsteuer</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.netto.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto-Schenkung</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Wert der Schenkung</span>
                <span className="font-medium">{wert.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Freibetrag (Klasse {steuerklasse})</span>
                <span className="font-medium text-green-700">-{ergebnis.freibetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerpflichtiger Erwerb</span>
                <span className="font-medium">{ergebnis.steuerpflichtig.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuersatz</span>
                <span className="font-medium">{ergebnis.steuersatz}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-bold">
                <span>Schenkungsteuer</span>
                <span className="text-red-700 dark:text-red-400">{ergebnis.steuer.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Effektive Steuerbelastung</span>
                <span className="font-medium">{ergebnis.effektiverSatz}%</span>
              </div>
            </div>

            {ergebnis.steuer > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Steueroptimierung</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Bei Aufteilung auf {ergebnis.jahresBedarf} Schenkungen (alle 10 Jahre) = {ergebnis.zeitraum10J} Jahre: <strong>0 EUR Steuer</strong>. Jede Schenkung max. {ergebnis.freibetrag.toLocaleString('de-DE')} EUR.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerbelastung nach Empfaenger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Bar dataKey="steuer" name="Schenkungsteuer" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Freibetraege und Steuersaetze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Empfaenger</th>
                  <th className="py-2 pr-4 text-center">Steuerklasse</th>
                  <th className="py-2 pr-4 text-right">Freibetrag</th>
                  <th className="py-2 text-right">Steuer bei {wert.toLocaleString('de-DE')} EUR</th>
                </tr>
              </thead>
              <tbody>
                {STEUERKLASSEN.map((sk, i) => {
                  const steuer = berechneSchenkungsteuer(wert, sk.freibetrag, sk.klasse as 'I' | 'II' | 'III')
                  return (
                    <tr key={i} className={`border-b ${i === empfaengerIndex ? 'bg-primary/5 font-medium' : ''}`}>
                      <td className="py-1.5 pr-4">{sk.empfaenger}</td>
                      <td className="py-1.5 pr-4 text-center">{sk.klasse}</td>
                      <td className="py-1.5 pr-4 text-right">{sk.freibetrag.toLocaleString('de-DE')} EUR</td>
                      <td className={`py-1.5 text-right ${steuer > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                        {steuer > 0 ? steuer.toLocaleString('de-DE') + ' EUR' : 'steuerfrei'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
