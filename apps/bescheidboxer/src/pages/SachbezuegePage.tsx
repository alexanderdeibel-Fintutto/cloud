import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Gift, Info, Plus, Trash2 } from 'lucide-react'

interface Sachbezug {
  id: number
  bezeichnung: string
  betragMonat: number
  kategorie: 'gutschein' | 'jobticket' | 'essen' | 'fitness' | 'sonstiges'
  steuerfrei: boolean
}

const FREIGRENZE_MONAT = 50
const KATEGORIEN = [
  { value: 'gutschein', label: 'Gutschein / Geschenk' },
  { value: 'jobticket', label: 'Jobticket / ÖPNV' },
  { value: 'essen', label: 'Essenszuschuss' },
  { value: 'fitness', label: 'Gesundheit / Fitness' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export default function SachbezuegePage() {
  const [bezuege, setBezuege] = useState<Sachbezug[]>([
    { id: 1, bezeichnung: 'Tankgutschein', betragMonat: 44, kategorie: 'gutschein', steuerfrei: true },
    { id: 2, bezeichnung: 'Deutschlandticket', betragMonat: 49, kategorie: 'jobticket', steuerfrei: true },
    { id: 3, bezeichnung: 'Essenszuschuss Kantine', betragMonat: 108, kategorie: 'essen', steuerfrei: true },
    { id: 4, bezeichnung: 'Fitnessstudio', betragMonat: 40, kategorie: 'fitness', steuerfrei: false },
  ])
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)

  const addBezug = () => {
    setBezuege(prev => [...prev, { id: Date.now(), bezeichnung: '', betragMonat: 0, kategorie: 'sonstiges', steuerfrei: false }])
  }

  const removeBezug = (id: number) => {
    setBezuege(prev => prev.filter(b => b.id !== id))
  }

  const ergebnis = useMemo(() => {
    const summeMonat = bezuege.reduce((s, b) => s + b.betragMonat, 0)
    const summeJahr = summeMonat * 12

    // Sachbezüge die unter Freigrenze fallen (nur Gutscheine/sonstige, nicht Jobticket/Essen)
    const sachbezugGutscheine = bezuege.filter(b => b.kategorie === 'gutschein' || b.kategorie === 'fitness' || b.kategorie === 'sonstiges')
    const summeSachbezugMonat = sachbezugGutscheine.reduce((s, b) => s + b.betragMonat, 0)
    const freigrenzUeberschritten = summeSachbezugMonat > FREIGRENZE_MONAT

    // Jobticket ist seit 2019 steuerfrei (§ 3 Nr. 15 EStG)
    const jobticketMonat = bezuege.filter(b => b.kategorie === 'jobticket').reduce((s, b) => s + b.betragMonat, 0)

    // Essenszuschuss: bis 3,10€/Tag steuerfrei (Sachbezugswert 2025)
    const essenMonat = bezuege.filter(b => b.kategorie === 'essen').reduce((s, b) => s + b.betragMonat, 0)

    const steuerfreiBetragMonat = (freigrenzUeberschritten ? 0 : summeSachbezugMonat) + jobticketMonat + essenMonat
    const steuerpflichtigMonat = summeMonat - steuerfreiBetragMonat
    const steuerpflichtigJahr = steuerpflichtigMonat * 12

    const steuerersparnisJahr = Math.round(steuerfreiBetragMonat * 12 * grenzsteuersatz / 100)

    const kategorieAuswertung = KATEGORIEN.map(kat => {
      const items = bezuege.filter(b => b.kategorie === kat.value)
      return {
        ...kat,
        summe: items.reduce((s, b) => s + b.betragMonat, 0),
        anzahl: items.length,
      }
    }).filter(k => k.anzahl > 0)

    return {
      summeMonat,
      summeJahr,
      summeSachbezugMonat,
      freigrenzUeberschritten,
      steuerfreiBetragMonat,
      steuerpflichtigMonat,
      steuerpflichtigJahr,
      steuerersparnisJahr,
      kategorieAuswertung,
    }
  }, [bezuege, grenzsteuersatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Sachbezüge-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Sachbezugsfreigrenze, Jobticket, Essenszuschuss – steuerfreie Benefits optimieren
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Sachbezugsfreigrenze (§ 8 Abs. 2 S. 11 EStG):</strong> Bis 50 €/Monat sind Sachbezüge (Gutscheine, Geschenke) steuerfrei. Bei Überschreitung wird der <em>gesamte</em> Betrag steuerpflichtig (Freigrenze, kein Freibetrag!).</p>
              <p><strong>Jobticket (§ 3 Nr. 15 EStG):</strong> Seit 2019 steuerfrei, wird aber auf Entfernungspauschale angerechnet.</p>
              <p><strong>Essenszuschuss:</strong> Sachbezugswert 2025: Frühstück 2,17 €, Mittag/Abend 4,13 €. AG-Zuschuss bis Sachbezugswert steuerfrei.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Positionen */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sachbezüge ({bezuege.length})</CardTitle>
              <button onClick={addBezug} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Hinzufügen
              </button>
            </div>
            <CardDescription>Monatliche Sachbezüge eintragen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bezuege.map(b => (
              <div key={b.id} className="flex items-center gap-2 rounded-lg border p-2">
                <input
                  type="text"
                  value={b.bezeichnung}
                  onChange={e => setBezuege(prev => prev.map(x => x.id === b.id ? { ...x, bezeichnung: e.target.value } : x))}
                  placeholder="Bezeichnung"
                  className="flex-1 text-sm bg-transparent outline-none"
                />
                <select
                  value={b.kategorie}
                  onChange={e => setBezuege(prev => prev.map(x => x.id === b.id ? { ...x, kategorie: e.target.value as Sachbezug['kategorie'] } : x))}
                  className="text-xs rounded border px-2 py-1 bg-background"
                >
                  {KATEGORIEN.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
                <input
                  type="number"
                  value={b.betragMonat}
                  onChange={e => setBezuege(prev => prev.map(x => x.id === b.id ? { ...x, betragMonat: +e.target.value } : x))}
                  className="w-20 rounded border px-2 py-1 text-sm text-right"
                />
                <span className="text-xs text-muted-foreground">€/M</span>
                <button onClick={() => removeBezug(b.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz} %</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-xs font-medium">Freigrenze 2025</p>
              <p className="text-lg font-bold">{FREIGRENZE_MONAT} €<span className="text-xs font-normal text-muted-foreground"> / Monat</span></p>
              <p className="text-xs text-muted-foreground">Gutscheine, Sachgeschenke, etc.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Auswertung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xl font-bold">{ergebnis.summeMonat.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Gesamt/Monat</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerfreiBetragMonat.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Steuerfrei/Monat</p>
            </div>
            <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 text-center">
              <p className="text-xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerpflichtigMonat.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Steuerpflichtig/Monat</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-xl font-bold text-primary">{ergebnis.steuerersparnisJahr.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Ersparnis/Jahr</p>
            </div>
          </div>

          {ergebnis.freigrenzUeberschritten && (
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 mb-4 text-sm text-amber-800 dark:text-amber-200">
              <strong>Achtung:</strong> Sachbezugs-Freigrenze überschritten! Gutscheine/Sachgeschenke: {ergebnis.summeSachbezugMonat.toLocaleString('de-DE')} €/Monat &gt; {FREIGRENZE_MONAT} € → gesamter Betrag steuerpflichtig.
            </div>
          )}

          {/* Kategorie-Auswertung */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Nach Kategorie</p>
            {ergebnis.kategorieAuswertung.map((k, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/40">
                <span className="text-muted-foreground">{k.label} ({k.anzahl}×)</span>
                <span className="font-medium">{k.summe.toLocaleString('de-DE')} €/Monat → {(k.summe * 12).toLocaleString('de-DE')} €/Jahr</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
