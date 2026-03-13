import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CalendarClock, Info } from 'lucide-react'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function SteuerlicheOptimierungTimingPage() {
  const [einkuenfteJahr1, setEinkuenfteJahr1] = useState(60000)
  const [einkuenfteJahr2, setEinkuenfteJahr2] = useState(60000)
  const [verschiebung, setVerschiebung] = useState(10000)
  const [richtung, setRichtung] = useState<'vorziehen' | 'verschieben'>('verschieben')
  const [artVerschiebung, setArtVerschiebung] = useState<'einnahme' | 'ausgabe'>('ausgabe')

  const ergebnis = useMemo(() => {
    // Ohne Verschiebung
    const estJ1Ohne = calcESt(einkuenfteJahr1)
    const estJ2Ohne = calcESt(einkuenfteJahr2)
    const gesamtOhne = estJ1Ohne + estJ2Ohne

    // Mit Verschiebung
    let j1Mit: number, j2Mit: number
    if (artVerschiebung === 'ausgabe') {
      // Ausgabe vorziehen = weniger Einkünfte in Jahr 1
      // Ausgabe verschieben = weniger Einkünfte in Jahr 2
      if (richtung === 'vorziehen') {
        j1Mit = einkuenfteJahr1 - verschiebung
        j2Mit = einkuenfteJahr2 + verschiebung
      } else {
        j1Mit = einkuenfteJahr1 + verschiebung
        j2Mit = einkuenfteJahr2 - verschiebung
      }
    } else {
      // Einnahme vorziehen = mehr Einkünfte in Jahr 1
      // Einnahme verschieben = mehr Einkünfte in Jahr 2
      if (richtung === 'vorziehen') {
        j1Mit = einkuenfteJahr1 + verschiebung
        j2Mit = einkuenfteJahr2 - verschiebung
      } else {
        j1Mit = einkuenfteJahr1 - verschiebung
        j2Mit = einkuenfteJahr2 + verschiebung
      }
    }

    j1Mit = Math.max(j1Mit, 0)
    j2Mit = Math.max(j2Mit, 0)

    const estJ1Mit = calcESt(j1Mit)
    const estJ2Mit = calcESt(j2Mit)
    const gesamtMit = estJ1Mit + estJ2Mit

    const ersparnis = gesamtOhne - gesamtMit
    const lohntSich = ersparnis > 0

    return {
      estJ1Ohne, estJ2Ohne, gesamtOhne,
      j1Mit, j2Mit,
      estJ1Mit, estJ2Mit, gesamtMit,
      ersparnis, lohntSich,
    }
  }, [einkuenfteJahr1, einkuenfteJahr2, verschiebung, richtung, artVerschiebung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          Timing-Optimierung
        </h1>
        <p className="text-muted-foreground mt-1">
          Einnahmen & Ausgaben zeitlich steuern
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Progressionseffekt:</strong> Durch die progressive Besteuerung zahlen Sie bei gleichmäßig verteilten Einkünften <strong>weniger Steuern</strong> als bei starken Schwankungen.</p>
              <p><strong>Ausgaben vorziehen:</strong> Vor dem Jahreswechsel noch Rechnungen bezahlen, Arbeitsmittel kaufen, Fortbildungen buchen.</p>
              <p><strong>Einnahmen verschieben:</strong> Bei Selbständigen: Rechnungsstellung nach dem 31.12. → Zufluss erst im Folgejahr (Zufluss-/Abflussprinzip § 11 EStG).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Einkünfte Jahr 1: {einkuenfteJahr1.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={einkuenfteJahr1} onChange={e => setEinkuenfteJahr1(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Einkünfte Jahr 2: {einkuenfteJahr2.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={einkuenfteJahr2} onChange={e => setEinkuenfteJahr2(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Was verschieben?</p>
              <div className="flex gap-2">
                <button onClick={() => setArtVerschiebung('ausgabe')} className={`rounded-md px-4 py-2 text-sm ${artVerschiebung === 'ausgabe' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Ausgabe
                </button>
                <button onClick={() => setArtVerschiebung('einnahme')} className={`rounded-md px-4 py-2 text-sm ${artVerschiebung === 'einnahme' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Einnahme
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Richtung</p>
              <div className="flex gap-2">
                <button onClick={() => setRichtung('vorziehen')} className={`rounded-md px-4 py-2 text-sm ${richtung === 'vorziehen' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  In Jahr 1 vorziehen
                </button>
                <button onClick={() => setRichtung('verschieben')} className={`rounded-md px-4 py-2 text-sm ${richtung === 'verschieben' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  In Jahr 2 verschieben
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Betrag: {verschiebung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={1000} value={verschiebung} onChange={e => setVerschiebung(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className={`rounded-lg p-4 text-center mb-6 ${ergebnis.lohntSich ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-3xl font-bold ${ergebnis.lohntSich ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {ergebnis.ersparnis > 0 ? '+' : ''}{ergebnis.ersparnis.toLocaleString('de-DE')} EUR
              </p>
              <p className="text-sm text-muted-foreground mt-1">{ergebnis.lohntSich ? 'Steuerersparnis' : 'Mehrbelastung'}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4"></th>
                    <th className="py-2 pr-4 text-right">Ohne Verschiebung</th>
                    <th className="py-2 text-right">Mit Verschiebung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Einkünfte Jahr 1</td>
                    <td className="py-1.5 pr-4 text-right">{einkuenfteJahr1.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.j1Mit.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Einkünfte Jahr 2</td>
                    <td className="py-1.5 pr-4 text-right">{einkuenfteJahr2.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.j2Mit.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">ESt Jahr 1</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.estJ1Ohne.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.estJ1Mit.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">ESt Jahr 2</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.estJ2Ohne.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.estJ2Mit.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-t-2 font-bold">
                    <td className="py-2 pr-4">ESt Gesamt</td>
                    <td className="py-2 pr-4 text-right">{ergebnis.gesamtOhne.toLocaleString('de-DE')} EUR</td>
                    <td className="py-2 text-right">{ergebnis.gesamtMit.toLocaleString('de-DE')} EUR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Typische Gestaltungen</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Ausgaben vorziehen</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Arbeitsmittel vor Jahresende kaufen</li>
                <li>- Handwerker-Rechnungen noch bezahlen</li>
                <li>- Fortbildung noch 2025 buchen</li>
                <li>- Spenden vor dem 31.12.</li>
                <li>- Vorauszahlung KV/Rürup</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Einnahmen verschieben</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Rechnung erst im Januar stellen</li>
                <li>- Bonus/Prämie ins Folgejahr</li>
                <li>- Mieteinnahmen zeitlich steuern</li>
                <li>- § 11 EStG: Zufluss-/Abflussprinzip</li>
                <li>- Nur bei EÜR, nicht bei Bilanzierung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
