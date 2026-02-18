import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { TrendingUp, TrendingDown, Minus, Info, Calculator } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface JahresDaten {
  jahr: number
  einkommensteuer: number
  grundsteuer: number
  gewerbesteuer: number
  solidaritaet: number
  kirchensteuer: number
  erstattungen: number
}

const HISTORISCHE_DATEN: JahresDaten[] = [
  { jahr: 2021, einkommensteuer: 12400, grundsteuer: 680, gewerbesteuer: 3200, solidaritaet: 310, kirchensteuer: 820, erstattungen: 2100 },
  { jahr: 2022, einkommensteuer: 13800, grundsteuer: 690, gewerbesteuer: 3600, solidaritaet: 0, kirchensteuer: 910, erstattungen: 1800 },
  { jahr: 2023, einkommensteuer: 14200, grundsteuer: 700, gewerbesteuer: 3900, solidaritaet: 0, kirchensteuer: 940, erstattungen: 2400 },
  { jahr: 2024, einkommensteuer: 15100, grundsteuer: 720, gewerbesteuer: 4100, solidaritaet: 0, kirchensteuer: 990, erstattungen: 1950 },
  { jahr: 2025, einkommensteuer: 15800, grundsteuer: 850, gewerbesteuer: 4300, solidaritaet: 0, kirchensteuer: 1040, erstattungen: 2200 },
]

const TOOLTIP_FORMATTER = (value: number) => `${value.toLocaleString('de-DE')} €`

export default function SteuerlastPrognosePage() {
  const [prognoseFaktor, setPrognoseFaktor] = useState(3)

  const chartData = useMemo(() => {
    const letztes = HISTORISCHE_DATEN[HISTORISCHE_DATEN.length - 1]
    const faktor = 1 + prognoseFaktor / 100

    const prognose2026: JahresDaten = {
      jahr: 2026,
      einkommensteuer: Math.round(letztes.einkommensteuer * faktor),
      grundsteuer: Math.round(letztes.grundsteuer * 1.15),
      gewerbesteuer: Math.round(letztes.gewerbesteuer * faktor),
      solidaritaet: 0,
      kirchensteuer: Math.round(letztes.kirchensteuer * faktor),
      erstattungen: Math.round(letztes.erstattungen * 0.95),
    }

    const alle = [...HISTORISCHE_DATEN, prognose2026]
    return alle.map(d => ({
      jahr: d.jahr.toString(),
      Einkommensteuer: d.einkommensteuer,
      Grundsteuer: d.grundsteuer,
      Gewerbesteuer: d.gewerbesteuer,
      Kirchensteuer: d.kirchensteuer,
      Erstattungen: d.erstattungen,
      Gesamt: d.einkommensteuer + d.grundsteuer + d.gewerbesteuer + d.solidaritaet + d.kirchensteuer - d.erstattungen,
      isPrognose: d.jahr >= 2026,
    }))
  }, [prognoseFaktor])

  const aktuell = chartData[chartData.length - 2]
  const prognose = chartData[chartData.length - 1]
  const differenz = prognose.Gesamt - aktuell.Gesamt
  const differenzProzent = (differenz / aktuell.Gesamt) * 100

  const steuerarten = [
    { key: 'Einkommensteuer', color: '#3b82f6' },
    { key: 'Grundsteuer', color: '#10b981' },
    { key: 'Gewerbesteuer', color: '#f59e0b' },
    { key: 'Kirchensteuer', color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Steuerlast-Prognose</h1>
        <p className="text-muted-foreground mt-1">
          Historische Entwicklung und Vorausschau Ihrer Steuerbelastung
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuerlast 2025</p>
            <p className="text-2xl font-bold mt-1">
              {aktuell.Gesamt.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Prognose 2026</p>
            <p className="text-2xl font-bold mt-1 text-primary">
              {prognose.Gesamt.toLocaleString('de-DE')} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Veränderung</p>
            <div className="flex items-center gap-2 mt-1">
              {differenz > 0 ? <TrendingUp className="h-5 w-5 text-red-500" /> : differenz < 0 ? <TrendingDown className="h-5 w-5 text-green-500" /> : <Minus className="h-5 w-5" />}
              <p className={`text-2xl font-bold ${differenz > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {differenz > 0 ? '+' : ''}{differenz.toLocaleString('de-DE')} €
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Veränd. in %</p>
            <p className={`text-2xl font-bold mt-1 ${differenzProzent > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {differenzProzent > 0 ? '+' : ''}{differenzProzent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prognose-Einstellung */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <label className="text-sm font-medium">Erwartetes Einkommenswachstum 2026:</label>
            <input
              type="range"
              min={-10}
              max={20}
              value={prognoseFaktor}
              onChange={e => setPrognoseFaktor(Number(e.target.value))}
              className="flex-1 min-w-[200px]"
            />
            <span className="text-sm font-bold w-16 text-right">{prognoseFaktor > 0 ? '+' : ''}{prognoseFaktor}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gesamtbelastung im Zeitverlauf</CardTitle>
            <CardDescription>Netto-Steuerlast nach Erstattungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="jahr" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={TOOLTIP_FORMATTER} />
                  <Area
                    type="monotone"
                    dataKey="Gesamt"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    strokeDasharray={((_: unknown, index: number) => index === chartData.length - 1 ? '5 5' : '0') as unknown as string}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aufschlüsselung nach Steuerart</CardTitle>
            <CardDescription>Stacked Bar Chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="jahr" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={TOOLTIP_FORMATTER} />
                  <Legend />
                  {steuerarten.map(s => (
                    <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailtabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jahresvergleich Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Steuerart</th>
                  {chartData.map(d => (
                    <th key={d.jahr} className={`text-right py-2 font-medium ${d.isPrognose ? 'text-primary' : ''}`}>
                      {d.jahr}{d.isPrognose ? ' *' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {steuerarten.map(s => (
                  <tr key={s.key} className="border-b">
                    <td className="py-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                      {s.key}
                    </td>
                    {chartData.map(d => (
                      <td key={d.jahr} className={`text-right py-2 ${d.isPrognose ? 'font-medium text-primary' : ''}`}>
                        {(d[s.key as keyof typeof d] as number).toLocaleString('de-DE')} €
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b">
                  <td className="py-2 text-green-600">Erstattungen</td>
                  {chartData.map(d => (
                    <td key={d.jahr} className={`text-right py-2 text-green-600 ${d.isPrognose ? 'font-medium' : ''}`}>
                      -{d.Erstattungen.toLocaleString('de-DE')} €
                    </td>
                  ))}
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Netto-Steuerlast</td>
                  {chartData.map(d => (
                    <td key={d.jahr} className={`text-right py-2 ${d.isPrognose ? 'text-primary' : ''}`}>
                      {d.Gesamt.toLocaleString('de-DE')} €
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="h-3 w-3" /> * Prognose basierend auf eingestelltem Wachstumsfaktor ({prognoseFaktor > 0 ? '+' : ''}{prognoseFaktor}%)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
