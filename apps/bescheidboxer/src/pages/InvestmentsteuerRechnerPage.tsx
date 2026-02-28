import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { PiggyBank, Info, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from '../components/ui/button'

interface Fonds {
  id: number
  name: string
  typ: 'aktienfonds' | 'mischfonds' | 'immobilienfonds' | 'sonstige'
  kaufwert: number
  aktuellerWert: number
  ausschuettungen: number
  vorabpauschale: number
  haltedauerJahre: number
}

const TEILFREISTELLUNG: Record<string, number> = {
  aktienfonds: 30,
  mischfonds: 15,
  immobilienfonds: 60,
  sonstige: 0,
}

const TEILFREISTELLUNG_LABEL: Record<string, string> = {
  aktienfonds: 'Aktienfonds (30%)',
  mischfonds: 'Mischfonds (15%)',
  immobilienfonds: 'Immobilienfonds (60%)',
  sonstige: 'Sonstige (0%)',
}

const ABGELTUNGSTEUER = 0.25
const SOLI = 0.055
const GESAMT_STEUERSATZ = ABGELTUNGSTEUER * (1 + SOLI) // 26.375%

let fondsCounter = 3

export default function InvestmentsteuerRechnerPage() {
  const [fonds, setFonds] = useState<Fonds[]>([
    { id: 1, name: 'MSCI World ETF', typ: 'aktienfonds', kaufwert: 50000, aktuellerWert: 65000, ausschuettungen: 800, vorabpauschale: 0, haltedauerJahre: 5 },
    { id: 2, name: 'Offener Immobilienfonds', typ: 'immobilienfonds', kaufwert: 20000, aktuellerWert: 22000, ausschuettungen: 600, vorabpauschale: 0, haltedauerJahre: 3 },
  ])
  const [sparerpauschbetrag, setSparerpauschbetrag] = useState<1000 | 2000>(1000)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(9)
  const [basiszins, setBasiszins] = useState(2.29)

  const addFonds = () => {
    fondsCounter++
    setFonds(prev => [...prev, {
      id: fondsCounter,
      name: `Fonds ${fondsCounter}`,
      typ: 'aktienfonds',
      kaufwert: 10000,
      aktuellerWert: 12000,
      ausschuettungen: 0,
      vorabpauschale: 0,
      haltedauerJahre: 1,
    }])
  }

  const removeFonds = (id: number) => {
    setFonds(prev => prev.filter(f => f.id !== id))
  }

  const updateFonds = (id: number, field: keyof Fonds, value: string | number | boolean) => {
    setFonds(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const ergebnis = useMemo(() => {
    let gesamtGewinn = 0
    let gesamtSteuerPflicht = 0
    let gesamtSteuerBrutto = 0
    let gesamtTeilfreistellung = 0
    let gesamtVorabpauschale = 0

    const details = fonds.map(f => {
      const gewinn = f.aktuellerWert - f.kaufwert
      const teilfreiProzent = TEILFREISTELLUNG[f.typ]

      // Vorabpauschale berechnen (§ 18 InvStG)
      const basisertrag = f.kaufwert * basiszins / 100 * 0.7
      const vorabpauschaleRoh = Math.max(basisertrag - f.ausschuettungen, 0)
      const vorabpauschaleJahr = Math.round(vorabpauschaleRoh * 100) / 100

      // Teilfreistellung auf Vorabpauschale
      const vorabpNachTF = vorabpauschaleJahr * (1 - teilfreiProzent / 100)

      // Ausschuettungen nach Teilfreistellung
      const ausschuettungNachTF = f.ausschuettungen * (1 - teilfreiProzent / 100)

      // Veraeusserungsgewinn nach Teilfreistellung (bei Verkauf)
      const gewinnNachTF = gewinn * (1 - teilfreiProzent / 100)

      // Summe steuerpflichtiger Ertrag (laufend: Vorabpauschale + Ausschuettung)
      const steuerpflichtigLaufend = vorabpNachTF + ausschuettungNachTF
      // Bei Verkauf: Gewinn abzgl. bereits versteuerter Vorabpauschalen
      const steuerpflichtigVerkauf = Math.max(gewinnNachTF - vorabpNachTF * f.haltedauerJahre, 0)

      const teilfreistellungBetrag = gewinn * teilfreiProzent / 100

      gesamtGewinn += gewinn
      gesamtSteuerPflicht += steuerpflichtigLaufend
      gesamtTeilfreistellung += teilfreistellungBetrag
      gesamtVorabpauschale += vorabpauschaleJahr

      return {
        ...f,
        gewinn,
        teilfreiProzent,
        teilfreistellungBetrag,
        vorabpauschaleJahr,
        vorabpNachTF,
        ausschuettungNachTF,
        gewinnNachTF,
        steuerpflichtigLaufend,
        steuerpflichtigVerkauf,
      }
    })

    // Sparerpauschbetrag abziehen
    const steuerpflichtigNachSPB = Math.max(gesamtSteuerPflicht - sparerpauschbetrag, 0)

    // Steuerberechnung
    let steuerSatz = GESAMT_STEUERSATZ
    if (kirchensteuer) {
      // KiSt: Abgeltungsteuer / (4 + KiSt-Satz) * KiSt-Satz
      const kistAufschlag = ABGELTUNGSTEUER * kirchensteuersatz / 100
      steuerSatz = ABGELTUNGSTEUER * (1 + SOLI) + kistAufschlag
    }

    gesamtSteuerBrutto = Math.round(steuerpflichtigNachSPB * steuerSatz)

    // Chart: Fondstypen Vergleich
    const typSummen: Record<string, { gewinn: number; steuerfrei: number; steuerpflichtig: number }> = {}
    details.forEach(d => {
      if (!typSummen[d.typ]) typSummen[d.typ] = { gewinn: 0, steuerfrei: 0, steuerpflichtig: 0 }
      typSummen[d.typ].gewinn += d.gewinn
      typSummen[d.typ].steuerfrei += d.teilfreistellungBetrag
      typSummen[d.typ].steuerpflichtig += d.steuerpflichtigLaufend
    })

    const chartData = Object.entries(typSummen).map(([typ, vals]) => ({
      name: typ === 'aktienfonds' ? 'Aktien' : typ === 'mischfonds' ? 'Misch' : typ === 'immobilienfonds' ? 'Immobilien' : 'Sonstige',
      steuerfrei: Math.round(vals.steuerfrei),
      steuerpflichtig: Math.round(vals.steuerpflichtig),
    }))

    return {
      details,
      gesamtGewinn,
      gesamtSteuerPflicht,
      gesamtTeilfreistellung,
      gesamtVorabpauschale,
      steuerpflichtigNachSPB,
      gesamtSteuerBrutto,
      steuerSatz,
      chartData,
    }
  }, [fonds, sparerpauschbetrag, kirchensteuer, kirchensteuersatz, basiszins])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          Investmentsteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Fondsbesteuerung nach InvStG 2018 – Teilfreistellung & Vorabpauschale
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Teilfreistellung (§ 20 InvStG):</strong> Aktienfonds <strong>30%</strong>, Mischfonds <strong>15%</strong>, Immobilienfonds <strong>60%</strong> steuerfrei.</p>
              <p><strong>Vorabpauschale (§ 18 InvStG):</strong> Basisertrag = Kaufwert x Basiszins x 0,7. Mindestbesteuerung bei thesaurierenden Fonds.</p>
              <p><strong>Sparerpauschbetrag:</strong> 1.000 EUR (Einzelveranlagung) / 2.000 EUR (Zusammenveranlagung).</p>
              <p><strong>Abgeltungsteuer:</strong> 25% + 5,5% Soli = <strong>26,375%</strong> (ggf. + Kirchensteuer).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fonds */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Investmentfonds</CardTitle>
            <Button size="sm" variant="outline" onClick={addFonds} className="gap-1">
              <Plus className="h-3 w-3" />
              Fonds
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fonds.map((f) => (
            <div key={f.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={f.name}
                  onChange={e => updateFonds(f.id, 'name', e.target.value)}
                  className="font-medium bg-transparent border-none outline-none text-sm flex-1"
                />
                {fonds.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeFonds(f.id)} className="h-7 w-7 text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs text-muted-foreground">Fondstyp</label>
                  <select value={f.typ} onChange={e => updateFonds(f.id, 'typ', e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm bg-background">
                    {Object.entries(TEILFREISTELLUNG_LABEL).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Kaufwert (EUR)</label>
                  <input type="number" min={0} step={1000} value={f.kaufwert} onChange={e => updateFonds(f.id, 'kaufwert', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Aktueller Wert (EUR)</label>
                  <input type="number" min={0} step={1000} value={f.aktuellerWert} onChange={e => updateFonds(f.id, 'aktuellerWert', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ausschuettungen/Jahr (EUR)</label>
                  <input type="number" min={0} step={100} value={f.ausschuettungen} onChange={e => updateFonds(f.id, 'ausschuettungen', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Haltedauer (Jahre)</label>
                  <input type="number" min={1} max={50} value={f.haltedauerJahre} onChange={e => updateFonds(f.id, 'haltedauerJahre', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-1">Sparerpauschbetrag</p>
              <div className="flex gap-2">
                {([1000, 2000] as const).map(v => (
                  <button key={v} onClick={() => setSparerpauschbetrag(v)} className={`rounded-md px-4 py-2 text-sm ${sparerpauschbetrag === v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {v.toLocaleString('de-DE')} EUR {v === 2000 ? '(Ehepaar)' : '(Einzel)'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Basiszins (BMF): {basiszins}%</label>
              <input type="range" min={0} max={5} step={0.01} value={basiszins} onChange={e => setBasiszins(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">2025: 2,29% (Deutsche Bundesbank)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer
            </label>
            {kirchensteuer && (
              <div className="flex items-center gap-2">
                {([8, 9] as const).map(v => (
                  <button key={v} onClick={() => setKirchensteuersatz(v)} className={`rounded-md px-3 py-1 text-sm ${kirchensteuersatz === v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {v}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtGewinn.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Unrealisierter Gewinn</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtTeilfreistellung.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Teilfreistellung</p>
            </div>
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{Math.round(ergebnis.gesamtVorabpauschale).toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Vorabpauschale/Jahr</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.gesamtSteuerBrutto.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuer (laufend)</p>
            </div>
          </div>

          {/* Detail-Tabelle */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Fonds</th>
                  <th className="py-2 pr-4">Typ</th>
                  <th className="py-2 pr-4 text-right">Gewinn</th>
                  <th className="py-2 pr-4 text-right">Teilfrei.</th>
                  <th className="py-2 pr-4 text-right">Vorabp.</th>
                  <th className="py-2 text-right">Stpfl. (lfd.)</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.details.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-1.5 pr-4">{d.name}</td>
                    <td className="py-1.5 pr-4 text-muted-foreground">{d.teilfreiProzent}% TF</td>
                    <td className="py-1.5 pr-4 text-right">{d.gewinn.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right text-green-600">{Math.round(d.teilfreistellungBetrag).toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right text-orange-600">{Math.round(d.vorabpauschaleJahr).toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right font-medium">{Math.round(d.steuerpflichtigLaufend).toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-4" colSpan={2}>Gesamt</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.gesamtGewinn.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right text-green-600">{Math.round(ergebnis.gesamtTeilfreistellung).toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right text-orange-600">{Math.round(ergebnis.gesamtVorabpauschale).toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 text-right text-primary">{Math.round(ergebnis.gesamtSteuerPflicht).toLocaleString('de-DE')} EUR</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Steuerpflichtig (laufend)</span>
              <span className="font-medium">{Math.round(ergebnis.gesamtSteuerPflicht).toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">- Sparerpauschbetrag</span>
              <span className="font-medium text-green-600">-{sparerpauschbetrag.toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Steuerpflichtig nach SPB</span>
              <span className="font-medium">{Math.round(ergebnis.steuerpflichtigNachSPB).toLocaleString('de-DE')} EUR</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold">
              <span>Steuer ({(ergebnis.steuerSatz * 100).toFixed(2)}%)</span>
              <span className="text-red-600">{ergebnis.gesamtSteuerBrutto.toLocaleString('de-DE')} EUR</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Teilfreistellung nach Fondstyp</CardTitle>
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
                  <Bar dataKey="steuerfrei" name="Steuerfrei (TF)" fill="#22c55e" />
                  <Bar dataKey="steuerpflichtig" name="Steuerpflichtig" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teilfreistellungssaetze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-4 text-sm">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">30%</p>
              <p className="text-xs text-muted-foreground">Aktienfonds (ab 51% Aktien)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">15%</p>
              <p className="text-xs text-muted-foreground">Mischfonds (ab 25% Aktien)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">60%</p>
              <p className="text-xs text-muted-foreground">Immobilienfonds (ab 51% Immob.)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">80%</p>
              <p className="text-xs text-muted-foreground">Ausl. Immobilienfonds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
