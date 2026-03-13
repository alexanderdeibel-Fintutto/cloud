import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ArrowUpFromLine, Info, AlertTriangle, Plus, Trash2 } from 'lucide-react'

interface ProgressionsEinkommen {
  id: number
  bezeichnung: string
  betrag: number
  typ: string
}

const TYPEN = [
  'Arbeitslosengeld (ALG I)',
  'Kurzarbeitergeld',
  'Elterngeld',
  'Krankengeld',
  'Insolvenzgeld',
  'Mutterschaftsgeld',
  'Ausländische Einkünfte (DBA)',
  'Sonstiges',
]

const DEMO_EINKOMMEN: ProgressionsEinkommen[] = [
  { id: 1, bezeichnung: 'Arbeitslosengeld Jan-März', betrag: 4800, typ: 'Arbeitslosengeld (ALG I)' },
  { id: 2, bezeichnung: 'Elterngeld April-Dezember', betrag: 10800, typ: 'Elterngeld' },
]

function calcESt(zvE: number): number {
  if (zvE <= 0) return 0
  if (zvE <= 11784) return 0
  if (zvE <= 17005) { const y = (zvE - 11784) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10602.13)
  return Math.round(0.45 * zvE - 18936.88)
}

let nextId = 100

export default function ProgressionsvorbehaltPage() {
  const [zvE, setZvE] = useState(38000)
  const [einkommen, setEinkommen] = useState<ProgressionsEinkommen[]>(DEMO_EINKOMMEN)
  const [showAdd, setShowAdd] = useState(false)
  const [neuBesch, setNeuBesch] = useState('')
  const [neuBetrag, setNeuBetrag] = useState(0)
  const [neuTyp, setNeuTyp] = useState(TYPEN[0])

  const ergebnis = useMemo(() => {
    const summeProgressionsEinkommen = einkommen.reduce((s, e) => s + e.betrag, 0)

    // Steuer OHNE Progressionsvorbehalt
    const steuerOhne = calcESt(zvE)
    const steuersatzOhne = zvE > 0 ? ((steuerOhne / zvE) * 100).toFixed(2) : '0.00'

    // Besonderer Steuersatz MIT Progressionsvorbehalt
    const zvEMitProgression = zvE + summeProgressionsEinkommen
    const steuerAufGesamt = calcESt(zvEMitProgression)
    const besondererSteuersatz = zvEMitProgression > 0 ? (steuerAufGesamt / zvEMitProgression) : 0

    // Steuer auf das zu versteuernde Einkommen mit besonderem Steuersatz
    const steuerMit = Math.round(zvE * besondererSteuersatz)
    const steuersatzMit = zvE > 0 ? ((steuerMit / zvE) * 100).toFixed(2) : '0.00'

    const mehrbelastung = steuerMit - steuerOhne

    return {
      summeProgressionsEinkommen,
      steuerOhne, steuersatzOhne,
      steuerMit, steuersatzMit,
      besondererSteuersatz: (besondererSteuersatz * 100).toFixed(2),
      mehrbelastung,
    }
  }, [zvE, einkommen])

  const handleAdd = () => {
    if (!neuBesch || neuBetrag <= 0) return
    setEinkommen(prev => [...prev, { id: nextId++, bezeichnung: neuBesch, betrag: neuBetrag, typ: neuTyp }])
    setNeuBesch('')
    setNeuBetrag(0)
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowUpFromLine className="h-6 w-6 text-rose-500" />
            Progressionsvorbehalt
          </h1>
          <p className="text-muted-foreground mt-1">
            Auswirkung von steuerfreien Lohnersatzleistungen auf den persönlichen Steuersatz
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zu versteuerndes Einkommen</CardTitle>
              <CardDescription>Ohne die steuerfreien Lohnersatzleistungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">zvE (€)</label>
                <input type="number" value={zvE} onChange={e => setZvE(Number(e.target.value))} min={0} step={1000} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={0} max={150000} step={1000} value={zvE} onChange={e => setZvE(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lohnersatzleistungen ({einkommen.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {einkommen.map(e => (
                  <div key={e.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.bezeichnung}</p>
                      <p className="text-xs text-muted-foreground">{e.typ}</p>
                    </div>
                    <span className="text-sm font-medium">{e.betrag.toLocaleString('de-DE')} €</span>
                    <button onClick={() => setEinkommen(prev => prev.filter(x => x.id !== e.id))} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t font-medium">
                  <span>Summe Progressionseinkommen</span>
                  <span>{ergebnis.summeProgressionsEinkommen.toLocaleString('de-DE')} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {showAdd && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Neue Lohnersatzleistung</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Typ</label>
                  <select value={neuTyp} onChange={e => setNeuTyp(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Beschreibung</label>
                  <input value={neuBesch} onChange={e => setNeuBesch(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Betrag (€)</label>
                  <input type="number" value={neuBetrag || ''} onChange={e => setNeuBetrag(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <button onClick={handleAdd} disabled={!neuBesch || neuBetrag <= 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  Hinzufügen
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Steuervergleich</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ohne Progressionsvorbehalt</h3>
                <div className="flex justify-between text-sm">
                  <span>Einkommensteuer</span>
                  <span className="font-medium">{ergebnis.steuerOhne.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Durchschnittssteuersatz</span>
                  <span className="font-medium">{ergebnis.steuersatzOhne}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mit Progressionsvorbehalt</h3>
                <div className="flex justify-between text-sm">
                  <span>Besonderer Steuersatz</span>
                  <span className="font-medium">{ergebnis.besondererSteuersatz}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Einkommensteuer (auf zvE)</span>
                  <span className="font-medium">{ergebnis.steuerMit.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Effektiver Steuersatz</span>
                  <span className="font-medium">{ergebnis.steuersatzMit}%</span>
                </div>
              </div>

              <div className={`rounded-xl p-4 ${
                ergebnis.mehrbelastung > 0
                  ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900'
                  : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900'
              }`}>
                <p className={`text-sm ${ergebnis.mehrbelastung > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-green-600'}`}>
                  {ergebnis.mehrbelastung > 0 ? 'Steuerliche Mehrbelastung' : 'Keine Mehrbelastung'}
                </p>
                <p className={`text-3xl font-bold ${ergebnis.mehrbelastung > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-green-700 dark:text-green-300'}`}>
                  {ergebnis.mehrbelastung > 0 ? '+' : ''}{ergebnis.mehrbelastung.toLocaleString('de-DE')} €
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Steuersatzerhöhung: +{(parseFloat(ergebnis.steuersatzMit) - parseFloat(ergebnis.steuersatzOhne)).toFixed(2)} Prozentpunkte
                </p>
              </div>
            </CardContent>
          </Card>

          {ergebnis.mehrbelastung > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Nachzahlung wahrscheinlich!</strong> Die Lohnsteuer wird ohne Progressionsvorbehalt einbehalten. Die Differenz von {ergebnis.mehrbelastung.toLocaleString('de-DE')} € wird bei der Einkommensteuererklärung nachgefordert.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Progressionsvorbehalt (§ 32b EStG):</strong> Steuerfreie Leistungen erhöhen nicht das zvE, aber den Steuersatz auf das restliche Einkommen.</p>
                <p>Betrifft: ALG I, Kurzarbeitergeld, Elterngeld, Krankengeld, Mutterschaftsgeld, ausländische Einkünfte mit DBA-Freistellung.</p>
                <p><strong>Pflicht:</strong> Bei mehr als 410 € Lohnersatzleistungen besteht eine Pflicht zur Abgabe der Einkommensteuererklärung.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
