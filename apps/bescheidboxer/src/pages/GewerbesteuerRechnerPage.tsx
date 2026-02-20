import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Factory, Info, TrendingDown } from 'lucide-react'

interface HebesatzPreset {
  stadt: string
  hebesatz: number
}

const HEBESATZ_PRESETS: HebesatzPreset[] = [
  { stadt: 'Berlin', hebesatz: 410 },
  { stadt: 'München', hebesatz: 490 },
  { stadt: 'Hamburg', hebesatz: 470 },
  { stadt: 'Frankfurt', hebesatz: 460 },
  { stadt: 'Köln', hebesatz: 475 },
  { stadt: 'Düsseldorf', hebesatz: 440 },
  { stadt: 'Stuttgart', hebesatz: 420 },
  { stadt: 'Leipzig', hebesatz: 460 },
  { stadt: 'Nürnberg', hebesatz: 447 },
  { stadt: 'Monheim am Rhein', hebesatz: 250 },
  { stadt: 'Grünwald (bei München)', hebesatz: 240 },
  { stadt: 'Ingelheim', hebesatz: 310 },
]

const RECHTSFORM_OPTIONEN = [
  { value: 'einzelunternehmen', label: 'Einzelunternehmen / Freiberufler', freibetrag: 24500, anrechnung: true },
  { value: 'personengesellschaft', label: 'Personengesellschaft (OHG, KG)', freibetrag: 24500, anrechnung: true },
  { value: 'kapitalgesellschaft', label: 'Kapitalgesellschaft (GmbH, AG, UG)', freibetrag: 0, anrechnung: false },
]

function calcGewerbesteuer(gewinn: number, hinzurechnungen: number, kuerzungen: number, freibetrag: number, hebesatz: number) {
  const gewerbeertrag = Math.max(0, gewinn + hinzurechnungen - kuerzungen)
  const nachFreibetrag = Math.max(0, gewerbeertrag - freibetrag)
  // Steuermesszahl: 3,5%
  const messbetrag = nachFreibetrag * 0.035
  const gewerbesteuer = Math.round(messbetrag * (hebesatz / 100))
  // ESt-Anrechnung: max. 4,0 × Messbetrag (§ 35 EStG)
  const anrechnung = Math.round(messbetrag * 4.0)
  const effektiv = Math.max(0, gewerbesteuer - anrechnung)
  return { gewerbeertrag, nachFreibetrag, messbetrag: Math.round(messbetrag), gewerbesteuer, anrechnung, effektiv }
}

export default function GewerbesteuerRechnerPage() {
  const [gewinn, setGewinn] = useState(120000)
  const [hinzurechnungen, setHinzurechnungen] = useState(5000)
  const [kuerzungen, setKuerzungen] = useState(0)
  const [hebesatz, setHebesatz] = useState(410)
  const [rechtsformIdx, setRechtsformIdx] = useState(0)

  const rechtsform = RECHTSFORM_OPTIONEN[rechtsformIdx]

  const result = useMemo(() => {
    return calcGewerbesteuer(gewinn, hinzurechnungen, kuerzungen, rechtsform.freibetrag, hebesatz)
  }, [gewinn, hinzurechnungen, kuerzungen, rechtsform.freibetrag, hebesatz])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Factory className="h-6 w-6 text-orange-500" />
          Gewerbesteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Gewerbesteuer berechnen mit Hebesatz, Freibetrag und ESt-Anrechnung
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eingaben */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensdaten</CardTitle>
              <CardDescription>Rechtsform und Gewerbeertrag</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rechtsform</label>
                <select
                  value={rechtsformIdx}
                  onChange={e => setRechtsformIdx(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                >
                  {RECHTSFORM_OPTIONEN.map((r, i) => (
                    <option key={i} value={i}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Gewinn aus Gewerbebetrieb (€)</label>
                <input
                  type="number"
                  value={gewinn}
                  onChange={e => setGewinn(Number(e.target.value))}
                  min={0}
                  step={5000}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <input type="range" min={0} max={1000000} step={5000} value={gewinn} onChange={e => setGewinn(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>

              <div>
                <label className="text-sm font-medium">Hinzurechnungen § 8 GewStG (€)</label>
                <input
                  type="number"
                  value={hinzurechnungen}
                  onChange={e => setHinzurechnungen(Number(e.target.value))}
                  min={0}
                  step={1000}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">z.B. 25% der Zinsen, Mieten, Pachten über 200.000 € Freibetrag</p>
              </div>

              <div>
                <label className="text-sm font-medium">Kürzungen § 9 GewStG (€)</label>
                <input
                  type="number"
                  value={kuerzungen}
                  onChange={e => setKuerzungen(Number(e.target.value))}
                  min={0}
                  step={1000}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">z.B. 1,2% des Einheitswerts des Betriebsgrundstücks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hebesatz wählen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={hebesatz}
                  onChange={e => setHebesatz(Number(e.target.value))}
                  min={200}
                  max={900}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HEBESATZ_PRESETS.map(p => (
                  <button
                    key={p.stadt}
                    onClick={() => setHebesatz(p.hebesatz)}
                    className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                      hebesatz === p.hebesatz ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
                    }`}
                  >
                    {p.stadt} ({p.hebesatz}%)
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Berechnung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Gewinn aus Gewerbebetrieb</span>
                  <span className="font-medium">{gewinn.toLocaleString('de-DE')} €</span>
                </div>
                {hinzurechnungen > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>+ Hinzurechnungen</span>
                    <span className="font-medium text-red-600">+{hinzurechnungen.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                {kuerzungen > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>- Kürzungen</span>
                    <span className="font-medium text-green-600">-{kuerzungen.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Gewerbeertrag</span>
                  <span className="font-medium">{result.gewerbeertrag.toLocaleString('de-DE')} €</span>
                </div>
                {rechtsform.freibetrag > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>- Freibetrag</span>
                    <span className="font-medium text-green-600">-{rechtsform.freibetrag.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Steuerpflichtiger Gewerbeertrag</span>
                  <span className="font-medium">{result.nachFreibetrag.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>× Steuermesszahl (3,5%)</span>
                  <span className="font-medium">{result.messbetrag.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>× Hebesatz ({hebesatz}%)</span>
                  <span className="font-medium">{result.gewerbesteuer.toLocaleString('de-DE')} €</span>
                </div>

                <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 p-4 mt-2">
                  <p className="text-sm text-orange-600 dark:text-orange-400">Gewerbesteuer</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {result.gewerbesteuer.toLocaleString('de-DE')} €
                  </p>
                </div>

                {rechtsform.anrechnung && (
                  <>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                        ESt-Anrechnung (4,0 × Messbetrag)
                      </span>
                      <span className="font-medium text-green-600">-{result.anrechnung.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
                      <p className="text-sm text-green-600 dark:text-green-400">Effektive Belastung nach Anrechnung</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {result.effektiv.toLocaleString('de-DE')} €
                      </p>
                      {result.gewerbesteuer > 0 && (
                        <p className="text-xs text-green-500 mt-1">
                          Effektiver GewSt-Satz: {((result.effektiv / gewinn) * 100).toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Hinweis:</strong> Bei {rechtsform.label} gilt ein Freibetrag von {rechtsform.freibetrag.toLocaleString('de-DE')} €.</p>
                {rechtsform.anrechnung && (
                  <p>Die ESt-Anrechnung nach § 35 EStG beträgt max. das 4,0-fache des Steuermessbetrags und wird auf die Einkommensteuer angerechnet.</p>
                )}
                {!rechtsform.anrechnung && (
                  <p>Bei Kapitalgesellschaften erfolgt keine ESt-Anrechnung. Die GewSt ist nicht als Betriebsausgabe abzugsfähig.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
