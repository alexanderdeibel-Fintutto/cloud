import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Baby, Info, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Kind {
  id: number
  name: string
  alter: number
  kita: number
  tagesmutter: number
  hort: number
  babysitter: number
  ferienbetreuung: number
}

let kindCounter = 2

export default function KinderbetreuungskostenPage() {
  const [kinder, setKinder] = useState<Kind[]>([
    { id: 1, name: 'Kind 1', alter: 4, kita: 2400, tagesmutter: 0, hort: 0, babysitter: 600, ferienbetreuung: 300 },
  ])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)

  const addKind = () => {
    kindCounter++
    setKinder(prev => [...prev, {
      id: kindCounter,
      name: `Kind ${kindCounter}`,
      alter: 3,
      kita: 0,
      tagesmutter: 0,
      hort: 0,
      babysitter: 0,
      ferienbetreuung: 0,
    }])
  }

  const removeKind = (id: number) => {
    setKinder(prev => prev.filter(k => k.id !== id))
  }

  const updateKind = (id: number, field: keyof Kind, value: string | number) => {
    setKinder(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k))
  }

  const ergebnis = useMemo(() => {
    const details = kinder.map(kind => {
      const gesamtKosten = kind.kita + kind.tagesmutter + kind.hort + kind.babysitter + kind.ferienbetreuung
      const abzugsfaehig = kind.alter <= 13 // Bis zum 14. Lebensjahr
      const zweiDrittel = abzugsfaehig ? Math.round(gesamtKosten * 2 / 3) : 0
      const maxAbzug = 4000 // Max pro Kind
      const tatsaechlicherAbzug = Math.min(zweiDrittel, maxAbzug)
      const steuerersparnis = Math.round(tatsaechlicherAbzug * grenzsteuersatz / 100)

      return {
        ...kind,
        gesamtKosten,
        abzugsfaehig,
        zweiDrittel,
        tatsaechlicherAbzug,
        steuerersparnis,
      }
    })

    const gesamtKosten = details.reduce((s, d) => s + d.gesamtKosten, 0)
    const gesamtAbzug = details.reduce((s, d) => s + d.tatsaechlicherAbzug, 0)
    const gesamtErsparnis = details.reduce((s, d) => s + d.steuerersparnis, 0)

    const chartData = details.map(d => ({
      name: d.name,
      kosten: d.gesamtKosten,
      abzug: d.tatsaechlicherAbzug,
      ersparnis: d.steuerersparnis,
    }))

    return { details, gesamtKosten, gesamtAbzug, gesamtErsparnis, chartData }
  }, [kinder, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Baby className="h-6 w-6 text-primary" />
          Kinderbetreuungskosten
        </h1>
        <p className="text-muted-foreground mt-1">
          Sonderausgabenabzug – § 10 Abs. 1 Nr. 5 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Abzug:</strong> <strong>2/3</strong> der Kosten, max. <strong>4.000 EUR pro Kind</strong> als Sonderausgaben.</p>
              <p><strong>Alter:</strong> Kinder bis zum <strong>14. Lebensjahr</strong> (bei Behinderung: keine Altersgrenze).</p>
              <p><strong>Absetzbar:</strong> Kita, Tagesmutter, Hort, Au-pair (Betreuungsanteil), Babysitter, Ferienbetreuung.</p>
              <p><strong>Nicht absetzbar:</strong> Nachhilfe, Sportverein, Musikunterricht, Verpflegung, Fahrtkosten.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Kinder</CardTitle>
            <Button size="sm" variant="outline" onClick={addKind} className="gap-1">
              <Plus className="h-3 w-3" /> Kind
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {kinder.map(kind => (
            <div key={kind.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  value={kind.name}
                  onChange={e => updateKind(kind.id, 'name', e.target.value)}
                  className="font-medium bg-transparent border-none outline-none text-sm flex-1"
                />
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${kind.alter <= 13 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {kind.alter <= 13 ? 'Absetzbar' : 'Zu alt (14+)'}
                  </span>
                  {kinder.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => removeKind(kind.id)} className="h-7 w-7">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Alter: {kind.alter} Jahre</label>
                <input type="range" min={0} max={18} value={kind.alter} onChange={e => updateKind(kind.id, 'alter', +e.target.value)} className="w-full accent-primary" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs text-muted-foreground">Kita/Kindergarten (EUR/Jahr)</label>
                  <input type="number" min={0} step={100} value={kind.kita} onChange={e => updateKind(kind.id, 'kita', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Tagesmutter (EUR/Jahr)</label>
                  <input type="number" min={0} step={100} value={kind.tagesmutter} onChange={e => updateKind(kind.id, 'tagesmutter', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hort/OGS (EUR/Jahr)</label>
                  <input type="number" min={0} step={100} value={kind.hort} onChange={e => updateKind(kind.id, 'hort', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Babysitter (EUR/Jahr)</label>
                  <input type="number" min={0} step={100} value={kind.babysitter} onChange={e => updateKind(kind.id, 'babysitter', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ferienbetreuung (EUR/Jahr)</label>
                  <input type="number" min={0} step={100} value={kind.ferienbetreuung} onChange={e => updateKind(kind.id, 'ferienbetreuung', +e.target.value)} className="w-full rounded border px-2 py-1.5 text-sm" />
                </div>
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
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{ergebnis.gesamtKosten.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Gesamtkosten</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Abzugsfaehig (2/3)</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtErsparnis.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Kind</th>
                  <th className="py-2 pr-4 text-center">Alter</th>
                  <th className="py-2 pr-4 text-right">Kosten</th>
                  <th className="py-2 pr-4 text-right">2/3</th>
                  <th className="py-2 pr-4 text-right">Abzug</th>
                  <th className="py-2 text-right">Ersparnis</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.details.map(d => (
                  <tr key={d.id} className="border-b">
                    <td className="py-1.5 pr-4">{d.name}</td>
                    <td className="py-1.5 pr-4 text-center">{d.alter}</td>
                    <td className="py-1.5 pr-4 text-right">{d.gesamtKosten.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right">{d.zweiDrittel.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right font-medium">{d.tatsaechlicherAbzug.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right text-green-600">{d.steuerersparnis.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2 pr-4" colSpan={2}>Gesamt</td>
                  <td className="py-2 pr-4 text-right">{ergebnis.gesamtKosten.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 pr-4 text-right"></td>
                  <td className="py-2 pr-4 text-right text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} EUR</td>
                  <td className="py-2 text-right text-green-600">{ergebnis.gesamtErsparnis.toLocaleString('de-DE')} EUR</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {ergebnis.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kosten & Abzug pro Kind</CardTitle>
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
                  <Bar dataKey="kosten" name="Kosten" fill="#94a3b8" />
                  <Bar dataKey="abzug" name="Abzug" fill="#7c3aed" />
                  <Bar dataKey="ersparnis" name="Ersparnis" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
