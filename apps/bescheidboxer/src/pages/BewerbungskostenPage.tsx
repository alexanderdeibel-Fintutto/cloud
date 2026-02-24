import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { FileSearch, Info, Plus, Trash2 } from 'lucide-react'

interface Position {
  id: number
  bezeichnung: string
  betrag: number
  kategorie: 'porto' | 'foto' | 'fahrt' | 'unterkunft' | 'sonstiges'
}

const PAUSCHALE_SCHRIFTLICH = 8.50
const PAUSCHALE_ONLINE = 2.50

export default function BewerbungskostenPage() {
  const [methode, setMethode] = useState<'pauschale' | 'einzelnachweis'>('pauschale')
  const [anzahlSchriftlich, setAnzahlSchriftlich] = useState(5)
  const [anzahlOnline, setAnzahlOnline] = useState(15)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [positionen, setPositionen] = useState<Position[]>([
    { id: 1, bezeichnung: 'Bewerbungsmappe & Porto (5×)', betrag: 42, kategorie: 'porto' },
    { id: 2, bezeichnung: 'Bewerbungsfotos', betrag: 65, kategorie: 'foto' },
    { id: 3, bezeichnung: 'Fahrt zum Vorstellungsgespräch (180 km × 0,30€)', betrag: 108, kategorie: 'fahrt' },
    { id: 4, bezeichnung: 'Hotel Übernachtung', betrag: 95, kategorie: 'unterkunft' },
    { id: 5, bezeichnung: 'Fachliteratur & Kurse', betrag: 45, kategorie: 'sonstiges' },
  ])

  const addPosition = () => {
    setPositionen(prev => [...prev, {
      id: Date.now(),
      bezeichnung: '',
      betrag: 0,
      kategorie: 'sonstiges',
    }])
  }

  const removePosition = (id: number) => {
    setPositionen(prev => prev.filter(p => p.id !== id))
  }

  const ergebnis = useMemo(() => {
    if (methode === 'pauschale') {
      const gesamt = anzahlSchriftlich * PAUSCHALE_SCHRIFTLICH + anzahlOnline * PAUSCHALE_ONLINE
      return {
        abzug: gesamt,
        ersparnis: Math.round(gesamt * grenzsteuersatz / 100),
        details: [
          { label: `${anzahlSchriftlich}× schriftlich à ${PAUSCHALE_SCHRIFTLICH.toFixed(2)} €`, wert: anzahlSchriftlich * PAUSCHALE_SCHRIFTLICH },
          { label: `${anzahlOnline}× online à ${PAUSCHALE_ONLINE.toFixed(2)} €`, wert: anzahlOnline * PAUSCHALE_ONLINE },
        ],
      }
    }

    const byKat: Record<string, number> = {}
    positionen.forEach(p => {
      byKat[p.kategorie] = (byKat[p.kategorie] || 0) + p.betrag
    })
    const gesamt = positionen.reduce((s, p) => s + p.betrag, 0)
    const katLabels: Record<string, string> = {
      porto: 'Porto & Mappen',
      foto: 'Bewerbungsfotos',
      fahrt: 'Fahrtkosten',
      unterkunft: 'Übernachtung',
      sonstiges: 'Sonstiges',
    }

    return {
      abzug: gesamt,
      ersparnis: Math.round(gesamt * grenzsteuersatz / 100),
      details: Object.entries(byKat).map(([k, v]) => ({
        label: katLabels[k] || k,
        wert: v,
      })),
    }
  }, [methode, anzahlSchriftlich, anzahlOnline, grenzsteuersatz, positionen])

  // Vergleich
  const pauschaleGesamt = anzahlSchriftlich * PAUSCHALE_SCHRIFTLICH + anzahlOnline * PAUSCHALE_ONLINE
  const einzelnachweisGesamt = positionen.reduce((s, p) => s + p.betrag, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" />
          Bewerbungskosten-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Bewerbungskosten als Werbungskosten steuerlich absetzen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Werbungskosten:</strong> Alle Kosten im Zusammenhang mit einer Bewerbung sind als WK absetzbar – auch bei erfolgloser Bewerbung.</p>
              <p><strong>Pauschale:</strong> Vom Finanzamt oft akzeptiert: ~8,50 € schriftlich, ~2,50 € online (ohne Belege).</p>
              <p><strong>Einzelnachweis:</strong> Bei hohen Kosten (Vorstellungsreise, Umzug) lohnt sich der Einzelnachweis mit Belegen.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Methode & Parameter */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Methode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { value: 'pauschale' as const, label: 'Pauschale', desc: 'Feste Beträge pro Bewerbung, ohne Belege' },
                { value: 'einzelnachweis' as const, label: 'Einzelnachweis', desc: 'Tatsächliche Kosten mit Belegen' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMethode(opt.value)}
                  className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${
                    methode === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {methode === 'pauschale' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anzahl Bewerbungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Schriftlich: {anzahlSchriftlich}</label>
                  <input type="range" min={0} max={50} value={anzahlSchriftlich} onChange={e => setAnzahlSchriftlich(+e.target.value)} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium">Online: {anzahlOnline}</label>
                  <input type="range" min={0} max={100} value={anzahlOnline} onChange={e => setAnzahlOnline(+e.target.value)} className="w-full accent-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Kostenpositionen</CardTitle>
                  <button onClick={addPosition} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Position
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {positionen.map(pos => (
                  <div key={pos.id} className="flex items-center gap-2 rounded-lg border p-2">
                    <input
                      type="text"
                      value={pos.bezeichnung}
                      onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, bezeichnung: e.target.value } : p))}
                      placeholder="Bezeichnung"
                      className="flex-1 text-sm bg-transparent outline-none"
                    />
                    <select
                      value={pos.kategorie}
                      onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, kategorie: e.target.value as Position['kategorie'] } : p))}
                      className="text-xs rounded border px-1.5 py-1 bg-background"
                    >
                      <option value="porto">Porto</option>
                      <option value="foto">Fotos</option>
                      <option value="fahrt">Fahrt</option>
                      <option value="unterkunft">Hotel</option>
                      <option value="sonstiges">Sonstig</option>
                    </select>
                    <input
                      type="number"
                      value={pos.betrag}
                      onChange={e => setPositionen(prev => prev.map(p => p.id === pos.id ? { ...p, betrag: +e.target.value } : p))}
                      className="w-20 rounded border px-2 py-1 text-sm text-right"
                    />
                    <span className="text-xs text-muted-foreground">€</span>
                    <button onClick={() => removePosition(pos.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Ergebnis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{ergebnis.abzug.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Werbungskosten</p>
                </div>
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">Steuerersparnis</p>
                </div>
              </div>
              <div className="space-y-2">
                {ergebnis.details.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.wert.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vergleich */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vergleich</CardTitle>
              <CardDescription>Pauschale vs. Einzelnachweis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Pauschale', abzug: pauschaleGesamt },
                  { label: 'Einzelnachweis', abzug: einzelnachweisGesamt },
                ].map((v, i) => {
                  const max = Math.max(pauschaleGesamt, einzelnachweisGesamt, 1)
                  const isBest = v.abzug >= max
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={isBest ? 'font-semibold text-primary' : ''}>{v.label} {isBest && '← empfohlen'}</span>
                        <span className="font-medium">{v.abzug.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${isBest ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ width: `${(v.abzug / max) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tipps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Absetzbare Bewerbungskosten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Bewerbungsmappen & Porto',
                  'Bewerbungsfotos',
                  'Fahrt zum Vorstellungsgespräch',
                  'Übernachtung & Verpflegung',
                  'Telefon- & Internetkosten (anteilig)',
                  'Coaching / Beratung',
                  'Stellenanzeigen-Kosten',
                  'Umzugskosten (bei Jobwechsel)',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
