import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Wrench, Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Position {
  id: number
  bezeichnung: string
  kategorie: 'minijob' | 'dienstleistung' | 'handwerker'
  rechnungsbetrag: number
  lohnanteil: number
}

const KATEGORIE_INFO = {
  minijob: { label: 'Minijob im Haushalt', prozent: 20, maxErmass: 510, maxBemessung: 2550, paragraph: '§ 35a Abs. 1' },
  dienstleistung: { label: 'Haushaltsnahe Dienstleistung', prozent: 20, maxErmass: 4000, maxBemessung: 20000, paragraph: '§ 35a Abs. 2' },
  handwerker: { label: 'Handwerkerleistung', prozent: 20, maxErmass: 1200, maxBemessung: 6000, paragraph: '§ 35a Abs. 3' },
}

let posCounter = 3

export default function HaeuslicheDienstleistungenPage() {
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Gartenpflege', kategorie: 'dienstleistung', rechnungsbetrag: 2400, lohnanteil: 2000 },
    { id: 2, bezeichnung: 'Badezimmer-Renovierung', kategorie: 'handwerker', rechnungsbetrag: 8000, lohnanteil: 5000 },
  ])

  const addPosition = (kategorie: 'minijob' | 'dienstleistung' | 'handwerker') => {
    posCounter++
    setPositionen(prev => [...prev, {
      id: posCounter,
      bezeichnung: `Position ${posCounter}`,
      kategorie,
      rechnungsbetrag: 0,
      lohnanteil: 0,
    }])
  }

  const removePosition = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const updatePosition = (id: number, field: keyof Position, value: string | number) => {
    setPositionen(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const ergebnis = useMemo(() => {
    const summen: Record<string, { lohn: number; ermaessigung: number }> = {
      minijob: { lohn: 0, ermaessigung: 0 },
      dienstleistung: { lohn: 0, ermaessigung: 0 },
      handwerker: { lohn: 0, ermaessigung: 0 },
    }

    positionen.forEach(p => {
      summen[p.kategorie].lohn += p.lohnanteil
    })

    // Ermäßigung berechnen (20% des Lohnanteils, gedeckelt)
    for (const kat of Object.keys(summen)) {
      const info = KATEGORIE_INFO[kat as keyof typeof KATEGORIE_INFO]
      const bemessung = Math.min(summen[kat].lohn, info.maxBemessung)
      summen[kat].ermaessigung = Math.min(Math.round(bemessung * info.prozent / 100), info.maxErmass)
    }

    const gesamtErmaessigung = Object.values(summen).reduce((s, v) => s + v.ermaessigung, 0)
    const gesamtLohn = Object.values(summen).reduce((s, v) => s + v.lohn, 0)
    const maxGesamt = 510 + 4000 + 1200 // 5.710 EUR

    const chartData = Object.entries(KATEGORIE_INFO).map(([key, info]) => ({
      name: info.label,
      lohnanteil: summen[key].lohn,
      ermaessigung: summen[key].ermaessigung,
      maxErmaessigung: info.maxErmass,
    }))

    return { summen, gesamtErmaessigung, gesamtLohn, maxGesamt, chartData }
  }, [positionen])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Haushaltsnahe Dienstleistungen
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerermäßigung nach § 35a EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>§ 35a EStG:</strong> 20% der Arbeitskosten werden <strong>direkt von der Steuerschuld</strong> abgezogen (nicht vom Einkommen!).</p>
              <p><strong>Voraussetzung:</strong> Rechnung + unbare Zahlung (Ueberweisung). <strong>Keine Barzahlung!</strong></p>
              <p><strong>Nur Lohnanteil:</strong> Materialkosten sind <strong>nicht</strong> abzugsfaehig. Getrennte Ausweisung auf Rechnung.</p>
              <p><strong>Ort:</strong> Im eigenen Haushalt oder auf dem eigenen Grundstueck (inkl. Nebenkostenabrechnung).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positionen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Positionen</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => addPosition('minijob')} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Minijob
              </Button>
              <Button size="sm" variant="outline" onClick={() => addPosition('dienstleistung')} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Dienstleistung
              </Button>
              <Button size="sm" variant="outline" onClick={() => addPosition('handwerker')} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Handwerker
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {positionen.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Keine Positionen. Fuegen Sie eine hinzu.</p>
          )}
          {positionen.map(pos => {
            const katInfo = KATEGORIE_INFO[pos.kategorie]
            return (
              <div key={pos.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={pos.bezeichnung}
                    onChange={e => updatePosition(pos.id, 'bezeichnung', e.target.value)}
                    className="font-medium bg-transparent border-none outline-none text-sm flex-1"
                  />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pos.kategorie === 'minijob' ? 'bg-yellow-100 text-yellow-700' :
                    pos.kategorie === 'dienstleistung' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {katInfo.label}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => removePosition(pos.id)} className="h-7 w-7 text-muted-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Kategorie</label>
                    <select
                      value={pos.kategorie}
                      onChange={e => updatePosition(pos.id, 'kategorie', e.target.value)}
                      className="w-full rounded border px-2 py-1.5 text-sm bg-background"
                    >
                      <option value="minijob">Minijob im Haushalt</option>
                      <option value="dienstleistung">Haushaltsnahe Dienstleistung</option>
                      <option value="handwerker">Handwerkerleistung</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Rechnungsbetrag (EUR)</label>
                    <input
                      type="number" min={0} step={100}
                      value={pos.rechnungsbetrag}
                      onChange={e => updatePosition(pos.id, 'rechnungsbetrag', +e.target.value)}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Lohnanteil (EUR)</label>
                    <input
                      type="number" min={0} max={pos.rechnungsbetrag} step={100}
                      value={pos.lohnanteil}
                      onChange={e => updatePosition(pos.id, 'lohnanteil', +e.target.value)}
                      className="w-full rounded border px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Steuerermäßigung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtErmaessigung.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerermäßigung gesamt</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.gesamtLohn.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Lohnanteile gesamt</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Kategorie</th>
                  <th className="py-2 pr-4 text-right">Lohnanteil</th>
                  <th className="py-2 pr-4 text-right">Ermäßigung (20%)</th>
                  <th className="py-2 text-right">Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(KATEGORIE_INFO).map(([key, info]) => (
                  <tr key={key} className="border-b">
                    <td className="py-1.5 pr-4">
                      <p className="font-medium">{info.label}</p>
                      <p className="text-xs text-muted-foreground">{info.paragraph}</p>
                    </td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.summen[key].lohn.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right font-medium text-primary">{ergebnis.summen[key].ermaessigung.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right text-muted-foreground">{info.maxErmass.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-4">Gesamt</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.gesamtLohn.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right text-primary">{ergebnis.gesamtErmaessigung.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 text-right text-muted-foreground">{ergebnis.maxGesamt.toLocaleString('de-DE')} EUR</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerermäßigung nach Kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="ermaessigung" name="Ermäßigung" fill="#7c3aed" />
                <Bar dataKey="maxErmaessigung" name="Maximum" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typische Beispiele</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3">
              <p className="font-medium text-yellow-700 dark:text-yellow-400">Minijob im Haushalt</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Haushaltshilfe (Putzen)</li>
                <li>- Gaertner (geringfuegig)</li>
                <li>- Kinderbetreuung (Minijob)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
              <p className="font-medium text-blue-700 dark:text-blue-400">Haushaltsnahe Dienstleistung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Reinigungsfirma</li>
                <li>- Gartenpflege (Firma)</li>
                <li>- Winterdienst, Schornsteinfeger</li>
                <li>- Pflegeleistungen, Betreuung</li>
              </ul>
            </div>
            <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-3">
              <p className="font-medium text-orange-700 dark:text-orange-400">Handwerkerleistung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Maler, Fliesenleger</li>
                <li>- Sanitaer, Elektriker</li>
                <li>- Dacharbeiten, Fassade</li>
                <li>- Modernisierung, Reparatur</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
