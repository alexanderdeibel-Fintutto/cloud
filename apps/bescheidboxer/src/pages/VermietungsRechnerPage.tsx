import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Building2, Info, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Position {
  id: number
  bezeichnung: string
  betrag: number
  typ: 'einnahme' | 'ausgabe'
  kategorie: string
}

const AUSGABE_KATEGORIEN = [
  'Zinsen', 'AfA', 'Reparatur', 'Versicherung', 'Verwaltung', 'Grundsteuer', 'Hausgeld', 'Sonstiges',
]

export default function VermietungsRechnerPage() {
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Kaltmiete Whg. 1', betrag: 850, typ: 'einnahme', kategorie: 'Miete' },
    { id: 2, bezeichnung: 'Nebenkosten-Vorauszahlung', betrag: 200, typ: 'einnahme', kategorie: 'Nebenkosten' },
    { id: 3, bezeichnung: 'Darlehenszinsen', betrag: 420, typ: 'ausgabe', kategorie: 'Zinsen' },
    { id: 4, bezeichnung: 'AfA (2% linear)', betrag: 333, typ: 'ausgabe', kategorie: 'AfA' },
    { id: 5, bezeichnung: 'Hausverwaltung', betrag: 35, typ: 'ausgabe', kategorie: 'Verwaltung' },
    { id: 6, bezeichnung: 'Gebäudeversicherung', betrag: 45, typ: 'ausgabe', kategorie: 'Versicherung' },
    { id: 7, bezeichnung: 'Grundsteuer', betrag: 30, typ: 'ausgabe', kategorie: 'Grundsteuer' },
    { id: 8, bezeichnung: 'Instandhaltungsrücklage', betrag: 80, typ: 'ausgabe', kategorie: 'Hausgeld' },
  ])

  const addPosition = (typ: 'einnahme' | 'ausgabe') => {
    setPositionen(prev => [...prev, {
      id: Date.now(),
      bezeichnung: '',
      betrag: 0,
      typ,
      kategorie: typ === 'einnahme' ? 'Miete' : 'Sonstiges',
    }])
  }

  const removePosition = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const ergebnis = useMemo(() => {
    const einnahmenMonat = positionen.filter(p => p.typ === 'einnahme').reduce((s, p) => s + p.betrag, 0)
    const ausgabenMonat = positionen.filter(p => p.typ === 'ausgabe').reduce((s, p) => s + p.betrag, 0)
    const ueberschussMonat = einnahmenMonat - ausgabenMonat
    const ueberschussJahr = ueberschussMonat * 12
    const einnahmenJahr = einnahmenMonat * 12
    const ausgabenJahr = ausgabenMonat * 12

    const steuerEffekt = Math.round(ueberschussJahr * grenzsteuersatz / 100)
    const nachSteuerJahr = ueberschussJahr - steuerEffekt
    const renditeVorSteuer = einnahmenJahr > 0 ? ueberschussJahr : 0

    // Kategorie-Auswertung Ausgaben
    const kategorien = AUSGABE_KATEGORIEN.map(kat => {
      const summe = positionen.filter(p => p.typ === 'ausgabe' && p.kategorie === kat).reduce((s, p) => s + p.betrag, 0)
      return { label: kat, summe }
    }).filter(k => k.summe > 0)

    return {
      einnahmenMonat, ausgabenMonat, ueberschussMonat,
      einnahmenJahr, ausgabenJahr, ueberschussJahr,
      steuerEffekt, nachSteuerJahr, renditeVorSteuer,
      kategorien,
    }
  }, [positionen, grenzsteuersatz])

  const chartData = [
    { name: 'Jan', einnahmen: ergebnis.einnahmenMonat, ausgaben: ergebnis.ausgabenMonat },
    { name: 'Q1', einnahmen: ergebnis.einnahmenMonat * 3, ausgaben: ergebnis.ausgabenMonat * 3 },
    { name: 'H1', einnahmen: ergebnis.einnahmenMonat * 6, ausgaben: ergebnis.ausgabenMonat * 6 },
    { name: 'Jahr', einnahmen: ergebnis.einnahmenJahr, ausgaben: ergebnis.ausgabenJahr },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Vermietungsrechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Einkünfte aus Vermietung & Verpachtung (§ 21 EStG) – Überschussrechnung
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Einkünfte aus V+V (§ 21 EStG):</strong> Einnahmen minus Werbungskosten = Überschuss. Dieser wird mit dem persönlichen Steuersatz besteuert.</p>
              <p><strong>Wichtige Werbungskosten:</strong> Darlehenszinsen (nicht Tilgung!), AfA (2% linear bei Gebäuden ab 1925, 2,5% bei älteren), Reparaturen, Versicherungen, Verwaltung.</p>
              <p><strong>Tipp:</strong> Negative Einkünfte aus V+V können mit anderen Einkünften verrechnet werden (Verlustausgleich).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Einnahmen */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-700 dark:text-green-400">Einnahmen</CardTitle>
              <button onClick={() => addPosition('einnahme')} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Position
              </button>
            </div>
            <CardDescription>Monatliche Mieteinnahmen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.filter(p => p.typ === 'einnahme').map(pos => (
              <div key={pos.id} className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-900 p-2">
                <input
                  type="text"
                  value={pos.bezeichnung}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, bezeichnung: e.target.value } : p))}
                  placeholder="Bezeichnung"
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <input
                  type="number"
                  value={pos.betrag}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, betrag: +e.target.value } : p))}
                  className="w-24 rounded border px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground">€/M</span>
                <button onClick={() => removePosition(pos.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ausgaben */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-red-700 dark:text-red-400">Werbungskosten</CardTitle>
              <button onClick={() => addPosition('ausgabe')} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Position
              </button>
            </div>
            <CardDescription>Monatliche absetzbare Kosten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {positionen.filter(p => p.typ === 'ausgabe').map(pos => (
              <div key={pos.id} className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900 p-2">
                <input
                  type="text"
                  value={pos.bezeichnung}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, bezeichnung: e.target.value } : p))}
                  placeholder="Bezeichnung"
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <select
                  value={pos.kategorie}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, kategorie: e.target.value } : p))}
                  className="text-xs rounded border px-1 py-1 bg-background"
                >
                  {AUSGABE_KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <input
                  type="number"
                  value={pos.betrag}
                  onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, betrag: +e.target.value } : p))}
                  className="w-20 rounded border px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground">€/M</span>
                <button onClick={() => removePosition(pos.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
        <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary max-w-md" />
      </div>

      {/* Ergebnis */}
      <Card className={`border-2 ${ergebnis.ueberschussJahr >= 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <CardHeader>
          <CardTitle className="text-lg">Jahresübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{ergebnis.einnahmenJahr.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Einnahmen/Jahr</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 text-center">
              <p className="text-xl font-bold text-red-700 dark:text-red-400">{ergebnis.ausgabenJahr.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Werbungskosten/Jahr</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${ergebnis.ueberschussJahr >= 0 ? 'bg-primary/10' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-xl font-bold ${ergebnis.ueberschussJahr >= 0 ? 'text-primary' : 'text-red-700 dark:text-red-400'}`}>{ergebnis.ueberschussJahr.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Überschuss/Jahr</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className={`text-xl font-bold ${ergebnis.steuerEffekt >= 0 ? '' : 'text-green-700 dark:text-green-400'}`}>{ergebnis.steuerEffekt >= 0 ? `−${ergebnis.steuerEffekt.toLocaleString('de-DE')}` : `+${Math.abs(ergebnis.steuerEffekt).toLocaleString('de-DE')}`} €</p>
              <p className="text-xs text-muted-foreground">{ergebnis.steuerEffekt >= 0 ? 'Steuer' : 'Steuererstattung'}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 text-center mb-4">
            <p className="text-lg font-bold">{ergebnis.nachSteuerJahr.toLocaleString('de-DE')} €</p>
            <p className="text-xs text-muted-foreground">Netto-Ergebnis nach Steuern/Jahr ({Math.round(ergebnis.nachSteuerJahr / 12).toLocaleString('de-DE')} €/Monat)</p>
          </div>

          {ergebnis.kategorien.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Werbungskosten nach Kategorie (monatlich)</p>
              {ergebnis.kategorien.map((k, i) => {
                const max = Math.max(...ergebnis.kategorien.map(x => x.summe))
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{k.label}</span>
                      <span className="font-medium">{k.summe.toLocaleString('de-DE')} €/M → {(k.summe * 12).toLocaleString('de-DE')} €/J</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${max > 0 ? (k.summe / max) * 100 : 0}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einnahmen vs. Ausgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} €`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                <Legend />
                <Bar dataKey="einnahmen" name="Einnahmen" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ausgaben" name="Werbungskosten" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
