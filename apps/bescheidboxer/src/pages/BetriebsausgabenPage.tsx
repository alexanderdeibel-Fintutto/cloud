import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Receipt, Info, Plus, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Ausgabe {
  id: number
  bezeichnung: string
  betrag: number
  kategorie: string
  abzugsfaehig: number // Prozent
}

const KATEGORIEN = [
  { name: 'Miete/Pacht', abzug: 100 },
  { name: 'Bürobedarf', abzug: 100 },
  { name: 'Telefon/Internet', abzug: 100 },
  { name: 'Kfz-Kosten', abzug: 100 },
  { name: 'Reisekosten', abzug: 100 },
  { name: 'Bewirtung', abzug: 70 },
  { name: 'Geschenke (< 50 EUR)', abzug: 100 },
  { name: 'Geschenke (>= 50 EUR)', abzug: 0 },
  { name: 'Versicherungen', abzug: 100 },
  { name: 'Fortbildung', abzug: 100 },
  { name: 'Arbeitsmittel', abzug: 100 },
  { name: 'Häusliches Arbeitszimmer', abzug: 100 },
  { name: 'Repräsentation', abzug: 0 },
  { name: 'Sonstige', abzug: 100 },
]

const FARBEN = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0891b2', '#65a30d', '#e11d48', '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#a855f7']

let idCounter = 3

export default function BetriebsausgabenPage() {
  const [ausgaben, setAusgaben] = useState<Ausgabe[]>([
    { id: 1, bezeichnung: 'Büromiete', betrag: 800, kategorie: 'Miete/Pacht', abzugsfaehig: 100 },
    { id: 2, bezeichnung: 'Geschäftsessen', betrag: 120, kategorie: 'Bewirtung', abzugsfaehig: 70 },
  ])

  const addAusgabe = () => {
    setAusgaben(prev => [...prev, {
      id: ++idCounter,
      bezeichnung: '',
      betrag: 0,
      kategorie: 'Sonstige',
      abzugsfaehig: 100,
    }])
  }

  const removeAusgabe = (id: number) => {
    setAusgaben(prev => prev.filter(a => a.id !== id))
  }

  const updateAusgabe = (id: number, field: keyof Ausgabe, value: string | number) => {
    setAusgaben(prev => prev.map(a => {
      if (a.id !== id) return a
      if (field === 'kategorie') {
        const kat = KATEGORIEN.find(k => k.name === value)
        return { ...a, kategorie: value as string, abzugsfaehig: kat?.abzug ?? 100 }
      }
      return { ...a, [field]: value }
    }))
  }

  const ergebnis = useMemo(() => {
    const gesamtBrutto = ausgaben.reduce((s, a) => s + a.betrag, 0)
    const gesamtAbzug = ausgaben.reduce((s, a) => s + Math.round(a.betrag * a.abzugsfaehig / 100), 0)
    const nichtAbzugsfaehig = gesamtBrutto - gesamtAbzug

    // Kategorien-Zusammenfassung
    const katMap = new Map<string, number>()
    ausgaben.forEach(a => {
      const abzug = Math.round(a.betrag * a.abzugsfaehig / 100)
      katMap.set(a.kategorie, (katMap.get(a.kategorie) || 0) + abzug)
    })

    const chartData = Array.from(katMap.entries())
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Steuerersparnis bei verschiedenen Grenzsteuersätzen
    const steuersaetze = [25, 33, 42, 45]
    const ersparnis = steuersaetze.map(satz => ({
      satz,
      ersparnis: Math.round(gesamtAbzug * satz / 100),
    }))

    return { gesamtBrutto, gesamtAbzug, nichtAbzugsfaehig, chartData, ersparnis }
  }, [ausgaben])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Betriebsausgaben-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Erfassen und berechnen Sie den steuerlichen Abzug Ihrer Betriebsausgaben
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Betriebsausgaben</strong> mindern den Gewinn und damit die Steuerlast (§ 4 Abs. 4 EStG).</p>
              <p><strong>Bewirtung:</strong> Nur 70% abzugsfähig (§ 4 Abs. 5 Nr. 2 EStG). <strong>Geschenke:</strong> Max. 50 EUR/Person/Jahr.</p>
              <p><strong>Repräsentation:</strong> Nicht abzugsfähig (z.B. Jagd, Segeln, Gästehäuser).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ausgaben erfassen</CardTitle>
            <button onClick={addAusgabe} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Hinzufügen
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px_150px_60px_40px] gap-2 text-xs font-medium text-muted-foreground">
              <span>Bezeichnung</span>
              <span>Betrag</span>
              <span>Kategorie</span>
              <span>Abzug</span>
              <span></span>
            </div>
            {ausgaben.map(a => (
              <div key={a.id} className="grid grid-cols-[1fr_100px_150px_60px_40px] gap-2 items-center">
                <input
                  type="text"
                  value={a.bezeichnung}
                  onChange={e => updateAusgabe(a.id, 'bezeichnung', e.target.value)}
                  placeholder="Beschreibung"
                  className="border rounded px-2 py-1.5 text-sm bg-background"
                />
                <input
                  type="number"
                  value={a.betrag || ''}
                  onChange={e => updateAusgabe(a.id, 'betrag', +e.target.value)}
                  placeholder="0"
                  className="border rounded px-2 py-1.5 text-sm bg-background"
                />
                <select
                  value={a.kategorie}
                  onChange={e => updateAusgabe(a.id, 'kategorie', e.target.value)}
                  className="border rounded px-2 py-1.5 text-sm bg-background"
                >
                  {KATEGORIEN.map(k => (
                    <option key={k.name} value={k.name}>{k.name}</option>
                  ))}
                </select>
                <span className="text-sm text-center font-medium">{a.abzugsfaehig}%</span>
                <button onClick={() => removeAusgabe(a.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Zusammenfassung</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold">{ergebnis.gesamtBrutto.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground">Ausgaben gesamt</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground">Steuerlich absetzbar</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 text-center">
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{ergebnis.nichtAbzugsfaehig.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground">Nicht absetzbar</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">Steuerersparnis nach Grenzsteuersatz</p>
              {ergebnis.ersparnis.map(e => (
                <div key={e.satz} className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Bei {e.satz}% Grenzsteuersatz</span>
                  <span className="font-medium text-green-600">{e.ersparnis.toLocaleString('de-DE')} EUR</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {ergebnis.chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Verteilung nach Kategorie</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ergebnis.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {ergebnis.chartData.map((_, i) => (
                        <Cell key={i} fill={FARBEN[i % FARBEN.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
