import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Gift, Info, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from '../components/ui/button'

interface Vorteil {
  id: number
  bezeichnung: string
  kategorie: string
  monatlichBrutto: number
  steuerfrei: boolean
  pauschalversteuerung: boolean
  pauschalSatz: number
}

const KATEGORIEN = [
  { key: 'firmenwagen', label: 'Firmenwagen (1%-Regel)', steuerfrei: false },
  { key: 'jobticket', label: 'Jobticket', steuerfrei: true },
  { key: 'essenszuschuss', label: 'Essenszuschuss', steuerfrei: true },
  { key: 'kinderbetreuung', label: 'Kinderbetreuung', steuerfrei: true },
  { key: 'gesundheit', label: 'Gesundheitsfoerderung', steuerfrei: true },
  { key: 'personalrabatt', label: 'Personalrabatt', steuerfrei: false },
  { key: 'sachbezug', label: 'Sachbezug (50 EUR)', steuerfrei: true },
  { key: 'sonstige', label: 'Sonstige', steuerfrei: false },
]

let counter = 3

export default function GeldwerterVorteilPage() {
  const [vorteile, setVorteile] = useState<Vorteil[]>([
    { id: 1, bezeichnung: 'Firmenwagen BMW 3er', kategorie: 'firmenwagen', monatlichBrutto: 450, steuerfrei: false, pauschalversteuerung: false, pauschalSatz: 30 },
    { id: 2, bezeichnung: 'Deutschlandticket', kategorie: 'jobticket', monatlichBrutto: 49, steuerfrei: true, pauschalversteuerung: false, pauschalSatz: 25 },
  ])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)

  const addVorteil = () => {
    counter++
    setVorteile(prev => [...prev, {
      id: counter,
      bezeichnung: `Benefit ${counter}`,
      kategorie: 'sachbezug',
      monatlichBrutto: 50,
      steuerfrei: true,
      pauschalversteuerung: false,
      pauschalSatz: 30,
    }])
  }

  const removeVorteil = (id: number) => {
    setVorteile(prev => prev.filter(v => v.id !== id))
  }

  const updateVorteil = (id: number, field: keyof Vorteil, value: string | number | boolean) => {
    setVorteile(prev => prev.map(v => {
      if (v.id !== id) return v
      const updated = { ...v, [field]: value }
      // Kategorie-Wechsel aktualisiert steuerfrei-Status
      if (field === 'kategorie') {
        const kat = KATEGORIEN.find(k => k.key === value)
        updated.steuerfrei = kat?.steuerfrei ?? false
      }
      return updated
    }))
  }

  const ergebnis = useMemo(() => {
    let steuerfreiGesamt = 0
    let steuerpflichtigGesamt = 0
    let pauschalGesamt = 0
    let gesamtBrutto = 0

    const details = vorteile.map(v => {
      const jahresBrutto = v.monatlichBrutto * 12
      gesamtBrutto += jahresBrutto

      if (v.steuerfrei) {
        steuerfreiGesamt += jahresBrutto
        return { ...v, jahresBrutto, steuerbelastungAN: 0, art: 'steuerfrei' as const }
      }

      if (v.pauschalversteuerung) {
        const pauschal = Math.round(jahresBrutto * v.pauschalSatz / 100)
        pauschalGesamt += pauschal
        return { ...v, jahresBrutto, steuerbelastungAN: 0, pauschalsteuer: pauschal, art: 'pauschal' as const }
      }

      const steuer = Math.round(jahresBrutto * grenzsteuersatz / 100)
      steuerpflichtigGesamt += jahresBrutto
      return { ...v, jahresBrutto, steuerbelastungAN: steuer, art: 'individuell' as const }
    })

    const steuerbelastungAN = Math.round(steuerpflichtigGesamt * grenzsteuersatz / 100)
    const vorteilNetto = gesamtBrutto - steuerbelastungAN

    // Chart
    const chartData = [
      { name: 'Steuerfrei', betrag: steuerfreiGesamt },
      { name: 'Pauschal (AG)', betrag: pauschalGesamt },
      { name: 'Individuell', betrag: steuerpflichtigGesamt },
    ].filter(d => d.betrag > 0)

    return {
      details,
      gesamtBrutto,
      steuerfreiGesamt,
      steuerpflichtigGesamt,
      pauschalGesamt,
      steuerbelastungAN,
      vorteilNetto,
      chartData,
    }
  }, [vorteile, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Geldwerter Vorteil
        </h1>
        <p className="text-muted-foreground mt-1">
          Benefits & Sachbezuege steuerlich bewerten
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Sachbezugsfreigrenze:</strong> Bis <strong>50 EUR/Monat</strong> steuerfrei (§ 8 Abs. 2 S. 11 EStG).</p>
              <p><strong>Steuerfrei:</strong> Jobticket, Kinderbetreuung, Gesundheitsfoerderung (bis 600 EUR/Jahr).</p>
              <p><strong>Pauschalversteuerung:</strong> AG versteuert mit 30% (§ 37b) – AN steuerfrei.</p>
              <p><strong>1%-Regel:</strong> Firmenwagen: 1% des Bruttolistenpreises/Monat als geldwerter Vorteil.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Benefits & Sachbezuege</CardTitle>
            <Button size="sm" variant="outline" onClick={addVorteil} className="gap-1">
              <Plus className="h-3 w-3" />
              Benefit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {vorteile.map(v => (
            <div key={v.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input value={v.bezeichnung} onChange={e => updateVorteil(v.id, 'bezeichnung', e.target.value)} className="font-medium bg-transparent border-none outline-none text-sm flex-1" />
                {vorteile.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => removeVorteil(v.id)} className="h-7 w-7 text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs text-muted-foreground">Kategorie</label>
                  <select value={v.kategorie} onChange={e => updateVorteil(v.id, 'kategorie', e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm bg-background">
                    {KATEGORIEN.map(k => (
                      <option key={k.key} value={k.key}>{k.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Monatl. Wert (EUR)</label>
                  <input type="number" min={0} step={10} value={v.monatlichBrutto} onChange={e => updateVorteil(v.id, 'monatlichBrutto', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={v.steuerfrei} onChange={e => updateVorteil(v.id, 'steuerfrei', e.target.checked)} className="accent-primary" />
                    Steuerfrei
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={v.pauschalversteuerung} onChange={e => updateVorteil(v.id, 'pauschalversteuerung', e.target.checked)} className="accent-primary" />
                    Pauschal (AG)
                  </label>
                </div>
                {v.pauschalversteuerung && (
                  <div>
                    <label className="text-xs text-muted-foreground">Pauschalsatz %</label>
                    <input type="number" min={15} max={45} value={v.pauschalSatz} onChange={e => updateVorteil(v.id, 'pauschalSatz', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
          <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtBrutto.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Brutto-Wert/Jahr</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerfreiGesamt.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerfrei</p>
            </div>
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{ergebnis.pauschalGesamt.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Pauschalsteuer (AG)</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerbelastungAN.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuer AN</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Benefit</th>
                  <th className="py-2 pr-4">Kategorie</th>
                  <th className="py-2 pr-4 text-right">EUR/Monat</th>
                  <th className="py-2 pr-4 text-right">EUR/Jahr</th>
                  <th className="py-2 text-right">Steuer AN</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.details.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-1.5 pr-4">{d.bezeichnung}</td>
                    <td className="py-1.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.art === 'steuerfrei' ? 'bg-green-100 text-green-700' : d.art === 'pauschal' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {d.art === 'steuerfrei' ? 'steuerfrei' : d.art === 'pauschal' ? 'pauschal' : 'individuell'}
                      </span>
                    </td>
                    <td className="py-1.5 pr-4 text-right">{d.monatlichBrutto.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right">{d.jahresBrutto.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right font-medium">{d.steuerbelastungAN.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Besteuerungsart</CardTitle>
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
                  <Bar dataKey="betrag" name="Jahreswert" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
