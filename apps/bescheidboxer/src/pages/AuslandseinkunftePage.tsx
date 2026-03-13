import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Globe, Info } from 'lucide-react'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

type Methode = 'freistellung' | 'anrechnung'

export default function AuslandseinkunftePage() {
  const [inlandEinkuenfte, setInlandEinkuenfte] = useState(50000)
  const [auslandEinkuenfte, setAuslandEinkuenfte] = useState(20000)
  const [auslandSteuer, setAuslandSteuer] = useState(4000)
  const [methode, setMethode] = useState<Methode>('freistellung')
  const [splitting, setSplitting] = useState(false)

  const ergebnis = useMemo(() => {
    const gesamtEinkuenfte = inlandEinkuenfte + auslandEinkuenfte

    // Freistellungsmethode (mit Progressionsvorbehalt)
    const zvEFreistellung = inlandEinkuenfte
    const steuersatzGesamt = gesamtEinkuenfte > 0
      ? calcESt(splitting ? Math.round(gesamtEinkuenfte / 2) : gesamtEinkuenfte) * (splitting ? 2 : 1) / gesamtEinkuenfte
      : 0
    const estFreistellung = Math.round(zvEFreistellung * steuersatzGesamt)

    // Anrechnungsmethode
    const zvEAnrechnung = gesamtEinkuenfte
    const estVorAnrechnung = calcESt(splitting ? Math.round(zvEAnrechnung / 2) : zvEAnrechnung) * (splitting ? 2 : 1)
    // Max. anrechenbare Steuer: anteilige deutsche ESt auf Auslandseinkünfte
    const anteilAusland = gesamtEinkuenfte > 0 ? auslandEinkuenfte / gesamtEinkuenfte : 0
    const maxAnrechnung = Math.round(estVorAnrechnung * anteilAusland)
    const tatsAnrechnung = Math.min(auslandSteuer, maxAnrechnung)
    const estAnrechnung = estVorAnrechnung - tatsAnrechnung

    // Vergleich
    const steuerFreistellung = estFreistellung
    const steuerAnrechnung = estAnrechnung
    const besserMethode: Methode = steuerFreistellung <= steuerAnrechnung ? 'freistellung' : 'anrechnung'

    const gewaehlteMethodeSteuer = methode === 'freistellung' ? steuerFreistellung : steuerAnrechnung
    const gesamtBelastung = gewaehlteMethodeSteuer + (methode === 'freistellung' ? auslandSteuer : 0)

    return {
      gesamtEinkuenfte, steuersatzGesamt: Math.round(steuersatzGesamt * 10000) / 100,
      estFreistellung, estAnrechnung, estVorAnrechnung,
      maxAnrechnung, tatsAnrechnung,
      steuerFreistellung, steuerAnrechnung, besserMethode,
      gewaehlteMethodeSteuer, gesamtBelastung,
    }
  }, [inlandEinkuenfte, auslandEinkuenfte, auslandSteuer, methode, splitting])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Auslandseinkünfte & DBA
        </h1>
        <p className="text-muted-foreground mt-1">
          Freistellung vs. Anrechnung – Doppelbesteuerungsabkommen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Freistellungsmethode:</strong> Auslandseinkünfte in D steuerfrei, aber Progressionsvorbehalt (§ 32b EStG).</p>
              <p><strong>Anrechnungsmethode:</strong> Ausländische Steuer wird auf die deutsche ESt angerechnet (§ 34c EStG).</p>
              <p><strong>DBA:</strong> Doppelbesteuerungsabkommen regelt, welche Methode gilt. Deutschland hat über 90 DBA.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Inlands-Einkünfte: {inlandEinkuenfte.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={inlandEinkuenfte} onChange={e => setInlandEinkuenfte(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Auslands-Einkünfte: {auslandEinkuenfte.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={1000} value={auslandEinkuenfte} onChange={e => setAuslandEinkuenfte(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Im Ausland gezahlte Steuer: {auslandSteuer.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={auslandSteuer} onChange={e => setAuslandSteuer(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Methode (lt. DBA)</p>
              <div className="flex gap-2">
                <button onClick={() => setMethode('freistellung')} className={`rounded-md px-4 py-2 text-sm ${methode === 'freistellung' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Freistellung
                </button>
                <button onClick={() => setMethode('anrechnung')} className={`rounded-md px-4 py-2 text-sm ${methode === 'anrechnung' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Anrechnung
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
              Zusammenveranlagung
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary/10 p-4 text-center mb-6">
              <p className="text-2xl font-bold text-primary">{ergebnis.gewaehlteMethodeSteuer.toLocaleString('de-DE')} EUR</p>
              <p className="text-xs text-muted-foreground mt-1">Deutsche ESt ({methode === 'freistellung' ? 'Freistellung' : 'Anrechnung'})</p>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4"></th>
                    <th className="py-2 pr-4 text-right">Freistellung</th>
                    <th className="py-2 text-right">Anrechnung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Steuerpflichtiges zvE</td>
                    <td className="py-1.5 pr-4 text-right">{inlandEinkuenfte.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.gesamtEinkuenfte.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Steuersatz (Progression)</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.steuersatzGesamt.toFixed(1)}%</td>
                    <td className="py-1.5 text-right">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">ESt (vor Anrechnung)</td>
                    <td className="py-1.5 pr-4 text-right">{ergebnis.estFreistellung.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{ergebnis.estVorAnrechnung.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1.5 pr-4 text-muted-foreground">Anrechnung ausl. Steuer</td>
                    <td className="py-1.5 pr-4 text-right">-</td>
                    <td className="py-1.5 text-right text-green-600">-{ergebnis.tatsAnrechnung.toLocaleString('de-DE')} EUR</td>
                  </tr>
                  <tr className="border-t-2 font-bold">
                    <td className="py-2 pr-4">Deutsche ESt</td>
                    <td className={`py-2 pr-4 text-right ${ergebnis.besserMethode === 'freistellung' ? 'text-green-600' : ''}`}>{ergebnis.steuerFreistellung.toLocaleString('de-DE')} EUR</td>
                    <td className={`py-2 text-right ${ergebnis.besserMethode === 'anrechnung' ? 'text-green-600' : ''}`}>{ergebnis.steuerAnrechnung.toLocaleString('de-DE')} EUR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {ergebnis.besserMethode !== methode && (
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3 text-center">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {ergebnis.besserMethode === 'freistellung' ? 'Freistellung' : 'Anrechnung'} wäre günstiger (Ersparnis: {Math.abs(ergebnis.steuerFreistellung - ergebnis.steuerAnrechnung).toLocaleString('de-DE')} EUR)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Methoden-Übersicht</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className={`rounded-lg p-3 ${methode === 'freistellung' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
              <p className="font-medium">Freistellungsmethode</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Auslandseinkünfte in D steuerfrei</li>
                <li>- Progressionsvorbehalt (§ 32b)</li>
                <li>- Höherer Steuersatz auf Inlandseinkünfte</li>
                <li>- Typisch für: Arbeitslohn, Immobilien</li>
                <li>- Anlage AUS + N-AUS</li>
              </ul>
            </div>
            <div className={`rounded-lg p-3 ${methode === 'anrechnung' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
              <p className="font-medium">Anrechnungsmethode</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Welteinkommen in D steuerpflichtig</li>
                <li>- Ausländische Steuer wird angerechnet</li>
                <li>- Max.: anteilige deutsche ESt (§ 34c)</li>
                <li>- Typisch für: Dividenden, Zinsen, Lizenzen</li>
                <li>- Anlage AUS</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
