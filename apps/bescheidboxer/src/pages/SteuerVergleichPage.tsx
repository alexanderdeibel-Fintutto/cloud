import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeftRight, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10394.14)
  }
  return Math.round(0.45 * zvE - 18730.89)
}

interface Szenario {
  label: string
  bruttogehalt: number
  werbungskosten: number
  sonderausgaben: number
  vorsorge: number
  paragraph35a: number
  splitting: boolean
  kirchensteuer: boolean
}

export default function SteuerVergleichPage() {
  const [szA, setSzA] = useState<Szenario>({
    label: 'Aktuell',
    bruttogehalt: 55000,
    werbungskosten: 1500,
    sonderausgaben: 500,
    vorsorge: 3000,
    paragraph35a: 0,
    splitting: false,
    kirchensteuer: false,
  })

  const [szB, setSzB] = useState<Szenario>({
    label: 'Optimiert',
    bruttogehalt: 55000,
    werbungskosten: 5000,
    sonderausgaben: 2000,
    vorsorge: 5000,
    paragraph35a: 1200,
    splitting: false,
    kirchensteuer: false,
  })

  const berechne = (sz: Szenario) => {
    const wk = Math.max(sz.werbungskosten, 1230)
    const zvE = Math.max(sz.bruttogehalt - wk - sz.sonderausgaben - sz.vorsorge, 0)
    const zvESplit = sz.splitting ? Math.round(zvE / 2) : zvE
    let est = calcESt(zvESplit)
    if (sz.splitting) est *= 2

    const soliFrei = sz.splitting ? 36260 : 18130
    let soli = 0
    if (est > soliFrei) {
      soli = Math.round(est * 0.055)
    }
    const kist = sz.kirchensteuer ? Math.round(est * 0.09) : 0

    const steuerGesamt = est + soli + kist
    const ermaessigung35a = sz.paragraph35a
    const steuerNach35a = Math.max(steuerGesamt - ermaessigung35a, 0)
    const durchschnitt = zvE > 0 ? Math.round(steuerNach35a / zvE * 10000) / 100 : 0

    return { zvE, est, soli, kist, steuerGesamt, steuerNach35a, ermaessigung35a, durchschnitt }
  }

  const ergebnis = useMemo(() => {
    const a = berechne(szA)
    const b = berechne(szB)
    const differenz = a.steuerNach35a - b.steuerNach35a

    const chartData = [
      {
        name: szA.label,
        est: a.est,
        soli: a.soli,
        kist: a.kist,
      },
      {
        name: szB.label,
        est: b.est,
        soli: b.soli,
        kist: b.kist,
      },
    ]

    return { a, b, differenz, chartData }
  }, [szA, szB])

  const SzenarioInputs = ({ sz, setSz, label }: { sz: Szenario; setSz: (s: Szenario) => void; label: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Bezeichnung</label>
          <input value={sz.label} onChange={e => setSz({ ...sz, label: e.target.value })} className="w-full rounded border px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Bruttogehalt: {sz.bruttogehalt.toLocaleString('de-DE')} EUR</label>
          <input type="range" min={20000} max={200000} step={1000} value={sz.bruttogehalt} onChange={e => setSz({ ...sz, bruttogehalt: +e.target.value })} className="w-full accent-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Werbungskosten: {sz.werbungskosten.toLocaleString('de-DE')} EUR</label>
          <input type="range" min={0} max={20000} step={100} value={sz.werbungskosten} onChange={e => setSz({ ...sz, werbungskosten: +e.target.value })} className="w-full accent-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Sonderausgaben: {sz.sonderausgaben.toLocaleString('de-DE')} EUR</label>
          <input type="range" min={0} max={10000} step={100} value={sz.sonderausgaben} onChange={e => setSz({ ...sz, sonderausgaben: +e.target.value })} className="w-full accent-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Vorsorgeaufwendungen: {sz.vorsorge.toLocaleString('de-DE')} EUR</label>
          <input type="range" min={0} max={27566} step={100} value={sz.vorsorge} onChange={e => setSz({ ...sz, vorsorge: +e.target.value })} className="w-full accent-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">§ 35a Ermäßigung: {sz.paragraph35a.toLocaleString('de-DE')} EUR</label>
          <input type="range" min={0} max={5200} step={100} value={sz.paragraph35a} onChange={e => setSz({ ...sz, paragraph35a: +e.target.value })} className="w-full accent-primary" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={sz.splitting} onChange={e => setSz({ ...sz, splitting: e.target.checked })} className="accent-primary" />
            Splitting
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={sz.kirchensteuer} onChange={e => setSz({ ...sz, kirchensteuer: e.target.checked })} className="accent-primary" />
            KiSt
          </label>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-primary" />
          Steuer-Szenarien Vergleich
        </h1>
        <p className="text-muted-foreground mt-1">
          Zwei Szenarien nebeneinander vergleichen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p>Vergleiche zwei Szenarien: z.B. <strong>mit vs. ohne</strong> Werbungskosten, <strong>Einzelveranlagung vs. Splitting</strong>, oder <strong>Gehaltssprung</strong>. Die Differenz zeigt den Steuervorteil.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Differenz-Banner */}
      <div className={`rounded-lg p-4 text-center ${ergebnis.differenz > 0 ? 'bg-green-100 dark:bg-green-900/30' : ergebnis.differenz < 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
        <p className="text-sm text-muted-foreground mb-1">Differenz ({szA.label} → {szB.label})</p>
        <p className={`text-3xl font-bold ${ergebnis.differenz > 0 ? 'text-green-700 dark:text-green-400' : ergebnis.differenz < 0 ? 'text-red-700 dark:text-red-400' : ''}`}>
          {ergebnis.differenz > 0 ? '+' : ''}{ergebnis.differenz.toLocaleString('de-DE')} EUR
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {ergebnis.differenz > 0 ? 'Ersparnis mit Szenario B' : ergebnis.differenz < 0 ? 'Mehrbelastung mit Szenario B' : 'Kein Unterschied'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SzenarioInputs sz={szA} setSz={setSzA} label="Szenario A" />
        <SzenarioInputs sz={szB} setSz={setSzB} label="Szenario B" />
      </div>

      {/* Ergebnis-Vergleich */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4"></th>
                  <th className="py-2 pr-4 text-right">{szA.label}</th>
                  <th className="py-2 pr-4 text-right">{szB.label}</th>
                  <th className="py-2 text-right">Differenz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-1.5 pr-4 text-muted-foreground">zvE</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.a.zvE.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.b.zvE.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 text-right">{(ergebnis.b.zvE - ergebnis.a.zvE).toLocaleString('de-DE')} EUR</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 pr-4 text-muted-foreground">ESt</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.a.est.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.b.est.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 text-right">{(ergebnis.a.est - ergebnis.b.est).toLocaleString('de-DE')} EUR</td>
                </tr>
                <tr className="border-b">
                  <td className="py-1.5 pr-4 text-muted-foreground">Soli</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.a.soli.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.b.soli.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 text-right">{(ergebnis.a.soli - ergebnis.b.soli).toLocaleString('de-DE')} EUR</td>
                </tr>
                {(szA.kirchensteuer || szB.kirchensteuer) && (
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">KiSt</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.a.kist.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.b.kist.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{(ergebnis.a.kist - ergebnis.b.kist).toLocaleString('de-DE')} EUR</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-1.5 pr-4 text-muted-foreground">§ 35a Ermäßigung</td>
                  <td className="py-1.5 pr-4 text-right text-green-600">-{ergebnis.a.ermaessigung35a.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 pr-4 text-right text-green-600">-{ergebnis.b.ermaessigung35a.toLocaleString('de-DE')} EUR</td>
                  <td className="py-1.5 text-right">{(ergebnis.a.ermaessigung35a - ergebnis.b.ermaessigung35a).toLocaleString('de-DE')} EUR</td>
                </tr>
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-4">Steuer gesamt</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.a.steuerNach35a.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.b.steuerNach35a.toLocaleString('de-DE')} EUR</td>
                  <td className={`py-2 text-right ${ergebnis.differenz > 0 ? 'text-green-600' : ergebnis.differenz < 0 ? 'text-red-600' : ''}`}>
                    {ergebnis.differenz > 0 ? '+' : ''}{ergebnis.differenz.toLocaleString('de-DE')} EUR
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 text-muted-foreground">Durchschnittssteuersatz</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.a.durchschnitt.toFixed(1)}%</td>
                  <td className="py-1.5 pr-4 text-right">{ergebnis.b.durchschnitt.toFixed(1)}%</td>
                  <td className="py-1.5 text-right">{(ergebnis.a.durchschnitt - ergebnis.b.durchschnitt).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerbelastung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="est" name="ESt" fill="#7c3aed" stackId="a" />
                <Bar dataKey="soli" name="Soli" fill="#f59e0b" stackId="a" />
                <Bar dataKey="kist" name="KiSt" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
