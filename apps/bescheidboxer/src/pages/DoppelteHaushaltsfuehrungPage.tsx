import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Building, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react'

interface Kostenposition {
  id: number
  beschreibung: string
  betragMonat: number
  kategorie: string
  absetzbar: boolean
}

const KATEGORIEN = [
  { value: 'miete', label: 'Miete Zweitwohnung', absetzbar: true },
  { value: 'nebenkosten', label: 'Nebenkosten', absetzbar: true },
  { value: 'einrichtung', label: 'Einrichtung (bis 5.000 €)', absetzbar: true },
  { value: 'fahrtkosten', label: 'Familienheimfahrten', absetzbar: true },
  { value: 'verpflegung', label: 'Verpflegungsmehraufwand', absetzbar: true },
  { value: 'umzug', label: 'Umzugskosten', absetzbar: true },
  { value: 'sonstiges', label: 'Sonstige Kosten', absetzbar: true },
]

const DEMO_KOSTEN: Kostenposition[] = [
  { id: 1, beschreibung: 'Miete 2-Zimmer-Wohnung München', betragMonat: 950, kategorie: 'miete', absetzbar: true },
  { id: 2, beschreibung: 'Nebenkosten (Strom, Wasser, Heizung)', betragMonat: 180, kategorie: 'nebenkosten', absetzbar: true },
  { id: 3, beschreibung: 'Familienheimfahrt wöchentlich (280 km)', betragMonat: 336, kategorie: 'fahrtkosten', absetzbar: true },
  { id: 4, beschreibung: 'Internet & Rundfunkbeitrag', betragMonat: 35, kategorie: 'nebenkosten', absetzbar: true },
]

let nextId = 100

export default function DoppelteHaushaltsfuehrungPage() {
  const [kosten, setKosten] = useState<Kostenposition[]>(DEMO_KOSTEN)
  const [entfernung, setEntfernung] = useState(280)
  const [fahrtenProMonat, setFahrtenProMonat] = useState(4)
  const [verpflegungsTage, setVerpflegungsTage] = useState(0)
  const [einrichtungskosten, setEinrichtungskosten] = useState(3200)
  const [showAdd, setShowAdd] = useState(false)
  const [neueBesch, setNeueBesch] = useState('')
  const [neuerBetrag, setNeuerBetrag] = useState(0)
  const [neueKat, setNeueKat] = useState('miete')

  const ergebnis = useMemo(() => {
    // Monatliche Unterkunftskosten (max 1.000 €/Monat)
    const unterkunftMonat = kosten
      .filter(k => k.kategorie === 'miete' || k.kategorie === 'nebenkosten')
      .reduce((s, k) => s + k.betragMonat, 0)
    const unterkunftAbsetzbar = Math.min(unterkunftMonat, 1000) * 12

    // Familienheimfahrten: 0,30 €/km einfache Strecke
    const fahrtkostenJahr = entfernung * 0.30 * fahrtenProMonat * 12

    // Verpflegungsmehraufwand: erste 3 Monate, 14 €/Tag bei >8h Abwesenheit
    const verpflegungJahr = verpflegungsTage * 14

    // Einrichtung (max 5.000 € gesamt)
    const einrichtungAbsetzbar = Math.min(einrichtungskosten, 5000)

    // Sonstige monatliche Kosten
    const sonstigeMonat = kosten
      .filter(k => k.kategorie !== 'miete' && k.kategorie !== 'nebenkosten' && k.kategorie !== 'fahrtkosten' && k.kategorie !== 'einrichtung')
      .reduce((s, k) => s + k.betragMonat, 0)
    const sonstigeJahr = sonstigeMonat * 12

    const gesamt = unterkunftAbsetzbar + fahrtkostenJahr + verpflegungJahr + einrichtungAbsetzbar + sonstigeJahr
    // Geschätzte Steuerersparnis bei 42% Grenzsteuersatz
    const ersparnis42 = Math.round(gesamt * 0.42)

    return { unterkunftMonat, unterkunftAbsetzbar, fahrtkostenJahr, verpflegungJahr, einrichtungAbsetzbar, sonstigeJahr, gesamt: Math.round(gesamt), ersparnis42 }
  }, [kosten, entfernung, fahrtenProMonat, verpflegungsTage, einrichtungskosten])

  const handleAdd = () => {
    if (!neueBesch || neuerBetrag <= 0) return
    setKosten(prev => [...prev, { id: nextId++, beschreibung: neueBesch, betragMonat: neuerBetrag, kategorie: neueKat, absetzbar: true }])
    setNeueBesch('')
    setNeuerBetrag(0)
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-sky-500" />
            Doppelte Haushaltsführung
          </h1>
          <p className="text-muted-foreground mt-1">
            Werbungskosten bei beruflich veranlasstem Zweithaushalt berechnen
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Position
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unterkunftskosten</CardTitle>
              <CardDescription>Max. 1.000 €/Monat absetzbar (§ 9 Abs. 1 S. 3 Nr. 5 EStG)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kosten.filter(k => k.kategorie === 'miete' || k.kategorie === 'nebenkosten').map(k => (
                  <div key={k.id} className="flex items-center gap-2 text-sm rounded-lg border border-border p-2.5">
                    <span className="flex-1">{k.beschreibung}</span>
                    <span className="font-medium">{k.betragMonat.toLocaleString('de-DE')} €/mtl.</span>
                    <button onClick={() => setKosten(prev => prev.filter(x => x.id !== k.id))} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Summe/Monat</span>
                  <span className={`font-medium ${ergebnis.unterkunftMonat > 1000 ? 'text-amber-600' : 'text-green-600'}`}>
                    {ergebnis.unterkunftMonat.toLocaleString('de-DE')} €
                    {ergebnis.unterkunftMonat > 1000 && ' (gedeckelt auf 1.000 €)'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Familienheimfahrten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Entfernung einfach (km)</label>
                <input type="number" value={entfernung} onChange={e => setEntfernung(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Fahrten pro Monat</label>
                <input type="number" value={fahrtenProMonat} onChange={e => setFahrtenProMonat(Number(e.target.value))} min={0} max={8} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <p className="text-xs text-muted-foreground">0,30 €/km einfache Strecke · {Math.round(ergebnis.fahrtkostenJahr).toLocaleString('de-DE')} €/Jahr</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Weitere Kosten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Verpflegungsmehraufwand (Tage, erste 3 Monate)</label>
                <input type="number" value={verpflegungsTage} onChange={e => setVerpflegungsTage(Number(e.target.value))} min={0} max={90} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <p className="text-xs text-muted-foreground mt-1">14 €/Tag bei &gt;8h Abwesenheit (erste 3 Monate)</p>
              </div>
              <div>
                <label className="text-sm font-medium">Einrichtungskosten einmalig (€)</label>
                <input type="number" value={einrichtungskosten} onChange={e => setEinrichtungskosten(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <p className="text-xs text-muted-foreground mt-1">Max. 5.000 € für notwendige Einrichtung absetzbar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jährliche Werbungskosten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Unterkunft (12 × max. 1.000 €)</span>
                  <span className="font-medium">{ergebnis.unterkunftAbsetzbar.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Familienheimfahrten</span>
                  <span className="font-medium">{Math.round(ergebnis.fahrtkostenJahr).toLocaleString('de-DE')} €</span>
                </div>
                {ergebnis.verpflegungJahr > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Verpflegungsmehraufwand</span>
                    <span className="font-medium">{ergebnis.verpflegungJahr.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                {ergebnis.einrichtungAbsetzbar > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Einrichtung</span>
                    <span className="font-medium">{ergebnis.einrichtungAbsetzbar.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                {ergebnis.sonstigeJahr > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Sonstige Kosten</span>
                    <span className="font-medium">{ergebnis.sonstigeJahr.toLocaleString('de-DE')} €</span>
                  </div>
                )}

                <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 p-4 mt-2">
                  <p className="text-sm text-sky-600 dark:text-sky-400">Absetzbare Werbungskosten gesamt</p>
                  <p className="text-3xl font-bold text-sky-700 dark:text-sky-300">
                    {ergebnis.gesamt.toLocaleString('de-DE')} €
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Geschätzte Steuerersparnis (42% Grenzsteuersatz)</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {ergebnis.ersparnis42.toLocaleString('de-DE')} €
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Voraussetzungen:</strong> Eigener Hausstand am Hauptwohnort, berufliche Veranlassung, regelmäßige Heimfahrten.</p>
                <p>Die Zweitwohnung muss am Beschäftigungsort oder in dessen Einzugsbereich liegen.</p>
                <p>Unterkunftskosten: max. 1.000 €/Monat. Darüber hinausgehende Kosten sind nicht absetzbar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Neue Kostenposition</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Kategorie</label>
                <select value={neueKat} onChange={e => setNeueKat(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {KATEGORIEN.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Beschreibung</label>
                <input value={neueBesch} onChange={e => setNeueBesch(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium">Betrag/Monat (€)</label>
                <input type="number" value={neuerBetrag || ''} onChange={e => setNeuerBetrag(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={!neueBesch || neuerBetrag <= 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Hinzufügen
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
