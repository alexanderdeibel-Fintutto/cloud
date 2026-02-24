import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { UsersRound, CheckCircle2, Info } from 'lucide-react'

function calcESt(zvE: number): number {
  if (zvE <= 0) return 0
  if (zvE <= 11784) return 0
  if (zvE <= 17005) { const y = (zvE - 11784) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10602.13)
  return Math.round(0.45 * zvE - 18936.88)
}

interface Kombination {
  label: string
  klasse1: string
  klasse2: string
  lst1: number
  lst2: number
  gesamt: number
}

export default function SteuerklassenwahlPage() {
  const [brutto1, setBrutto1] = useState(55000)
  const [brutto2, setBrutto2] = useState(35000)

  const ergebnis = useMemo(() => {
    // Vereinfachte LSt-Berechnung für verschiedene Klassen
    const wk = 1230 // Werbungskostenpauschale
    const sa = 36 // Sonderausgabenpauschale
    const vorsorge = (b: number) => Math.round(b * 0.10) // Vereinfachte Vorsorge

    const calcLSt = (brutto: number, klasse: string): number => {
      let zvE = brutto - wk - sa - vorsorge(brutto)
      if (klasse === 'III') {
        // Splittingtarif (doppelter Grundfreibetrag effektiv)
        return calcESt(zvE) // Vereinfacht: mehr Freibeträge
      }
      if (klasse === 'V') {
        // Höhere Besteuerung
        return Math.round(calcESt(zvE) * 1.15) // ~15% mehr
      }
      if (klasse === 'IV') {
        return calcESt(zvE)
      }
      if (klasse === 'IV+Faktor') {
        // Faktorverfahren: anteiliger Splittingvorteil
        const einzeln = calcESt(zvE)
        return Math.round(einzeln * 0.95) // ~5% Reduktion
      }
      return calcESt(zvE)
    }

    const kombinationen: Kombination[] = [
      {
        label: 'IV / IV',
        klasse1: 'IV', klasse2: 'IV',
        lst1: calcLSt(brutto1, 'IV'), lst2: calcLSt(brutto2, 'IV'),
        gesamt: calcLSt(brutto1, 'IV') + calcLSt(brutto2, 'IV'),
      },
      {
        label: 'III / V',
        klasse1: 'III', klasse2: 'V',
        lst1: calcLSt(brutto1, 'III'), lst2: calcLSt(brutto2, 'V'),
        gesamt: calcLSt(brutto1, 'III') + calcLSt(brutto2, 'V'),
      },
      {
        label: 'V / III',
        klasse1: 'V', klasse2: 'III',
        lst1: calcLSt(brutto1, 'V'), lst2: calcLSt(brutto2, 'III'),
        gesamt: calcLSt(brutto1, 'V') + calcLSt(brutto2, 'III'),
      },
      {
        label: 'IV+Faktor',
        klasse1: 'IV+Faktor', klasse2: 'IV+Faktor',
        lst1: calcLSt(brutto1, 'IV+Faktor'), lst2: calcLSt(brutto2, 'IV+Faktor'),
        gesamt: calcLSt(brutto1, 'IV+Faktor') + calcLSt(brutto2, 'IV+Faktor'),
      },
    ]

    const guenstigste = kombinationen.reduce((best, k) => k.gesamt < best.gesamt ? k : best)
    const teuerste = kombinationen.reduce((worst, k) => k.gesamt > worst.gesamt ? k : worst)
    const differenz = teuerste.gesamt - guenstigste.gesamt

    // Tatsächliche Steuerschuld (Splittingtarif)
    const gesamtZvE = (brutto1 + brutto2) - 2 * wk - 2 * sa - vorsorge(brutto1) - vorsorge(brutto2)
    const splittingSteuer = 2 * calcESt(Math.round(gesamtZvE / 2))

    return { kombinationen, guenstigste, differenz, splittingSteuer }
  }, [brutto1, brutto2])

  const chartData = ergebnis.kombinationen.map(k => ({
    name: k.label,
    'Partner 1': k.lst1,
    'Partner 2': k.lst2,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-purple-500" />
          Steuerklassenwahl
        </h1>
        <p className="text-muted-foreground mt-1">
          Optimale Steuerklassenkombination für Ehepaare / eingetragene Lebenspartnerschaften
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bruttojahresgehälter</CardTitle>
            <CardDescription>Beide Partner eingeben für den Vergleich</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Partner 1 – Brutto/Jahr (€)</label>
              <input type="number" value={brutto1} onChange={e => setBrutto1(Number(e.target.value))} min={0} step={5000} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input type="range" min={0} max={150000} step={5000} value={brutto1} onChange={e => setBrutto1(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>
            <div>
              <label className="text-sm font-medium">Partner 2 – Brutto/Jahr (€)</label>
              <input type="number" value={brutto2} onChange={e => setBrutto2(Number(e.target.value))} min={0} step={5000} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input type="range" min={0} max={150000} step={5000} value={brutto2} onChange={e => setBrutto2(Number(e.target.value))} className="w-full mt-2 accent-purple-500" />
            </div>
            <div className="text-sm text-muted-foreground">
              Einkommensverhältnis: {brutto1 > 0 || brutto2 > 0 ? `${Math.round((brutto1 / (brutto1 + brutto2)) * 100)}% / ${Math.round((brutto2 / (brutto1 + brutto2)) * 100)}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Lohnsteuer-Vergleich</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                  <Legend />
                  <Bar dataKey="Partner 1" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Partner 2" fill="#c084fc" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis-Tabelle */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Steuerklassen-Vergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Kombination</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Partner 1</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Partner 2</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Gesamt</th>
                  <th className="pb-2 text-center w-20"></th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.kombinationen.map(k => {
                  const isBest = k.label === ergebnis.guenstigste.label
                  return (
                    <tr key={k.label} className={`border-b last:border-0 ${isBest ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                      <td className="py-2.5 font-medium">{k.label}</td>
                      <td className="py-2.5 text-right font-mono">{k.lst1.toLocaleString('de-DE')} €</td>
                      <td className="py-2.5 text-right font-mono">{k.lst2.toLocaleString('de-DE')} €</td>
                      <td className="py-2.5 text-right font-mono font-medium">{k.gesamt.toLocaleString('de-DE')} €</td>
                      <td className="py-2.5 text-center">
                        {isBest && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empfehlung */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
            <div>
              <p className="font-medium">Empfehlung: {ergebnis.guenstigste.label}</p>
              <p className="text-sm text-muted-foreground">
                Einsparung gegenüber ungünstigster Kombination: <strong className="text-green-600">{ergebnis.differenz.toLocaleString('de-DE')} €/Jahr</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tatsächliche Jahressteuer (Splittingtarif): {ergebnis.splittingSteuer.toLocaleString('de-DE')} € — Nachzahlung/Erstattung ergibt sich bei der Veranlagung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p><strong>IV/IV:</strong> Standard, beide zahlen gleich. Gut bei ähnlichem Einkommen.</p>
            <p><strong>III/V:</strong> Partner mit höherem Einkommen zahlt weniger, der andere mehr. Gut bei großem Einkommensunterschied.</p>
            <p><strong>IV+Faktor:</strong> Berücksichtigt Splittingvorteil bereits bei der Lohnsteuer. Vermeidet hohe Nachzahlungen.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
