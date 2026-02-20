import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Heart, AlertTriangle, Info } from 'lucide-react'

interface TaxClass {
  label: string
  description: string
  freibetrag: number
  rates: { bis: number; rate: number }[]
}

const TAX_CLASSES: Record<string, TaxClass> = {
  I: {
    label: 'Steuerklasse I',
    description: 'Ehegatten, Kinder, Enkel, Eltern (bei Erbschaft)',
    freibetrag: 500000,
    rates: [
      { bis: 75000, rate: 7 },
      { bis: 300000, rate: 11 },
      { bis: 600000, rate: 15 },
      { bis: 6000000, rate: 19 },
      { bis: 13000000, rate: 23 },
      { bis: 26000000, rate: 27 },
      { bis: Infinity, rate: 30 },
    ],
  },
  II: {
    label: 'Steuerklasse II',
    description: 'Geschwister, Nichten/Neffen, Stiefeltern, Schwiegerkinder',
    freibetrag: 20000,
    rates: [
      { bis: 75000, rate: 15 },
      { bis: 300000, rate: 20 },
      { bis: 600000, rate: 25 },
      { bis: 6000000, rate: 30 },
      { bis: 13000000, rate: 35 },
      { bis: 26000000, rate: 40 },
      { bis: Infinity, rate: 43 },
    ],
  },
  III: {
    label: 'Steuerklasse III',
    description: 'Alle übrigen Empfänger (z.B. Freunde, entfernte Verwandte)',
    freibetrag: 20000,
    rates: [
      { bis: 75000, rate: 30 },
      { bis: 300000, rate: 30 },
      { bis: 600000, rate: 30 },
      { bis: 6000000, rate: 30 },
      { bis: 13000000, rate: 50 },
      { bis: 26000000, rate: 50 },
      { bis: Infinity, rate: 50 },
    ],
  },
}

const RELATIONSHIP_MAP: { label: string; klasse: string; freibetrag: number }[] = [
  { label: 'Ehegatte / eingetr. Lebenspartner', klasse: 'I', freibetrag: 500000 },
  { label: 'Kind', klasse: 'I', freibetrag: 400000 },
  { label: 'Enkel (Elternteil lebt)', klasse: 'I', freibetrag: 200000 },
  { label: 'Enkel (Elternteil verstorben)', klasse: 'I', freibetrag: 400000 },
  { label: 'Elternteil (Erbschaft)', klasse: 'I', freibetrag: 100000 },
  { label: 'Elternteil (Schenkung)', klasse: 'II', freibetrag: 20000 },
  { label: 'Geschwister', klasse: 'II', freibetrag: 20000 },
  { label: 'Nichte / Neffe', klasse: 'II', freibetrag: 20000 },
  { label: 'Nicht verwandt', klasse: 'III', freibetrag: 20000 },
]

function calcTax(steuerpflichtig: number, rates: { bis: number; rate: number }[]): number {
  if (steuerpflichtig <= 0) return 0
  let remaining = steuerpflichtig
  let tax = 0
  let prevBis = 0
  for (const bracket of rates) {
    const bracketSize = bracket.bis - prevBis
    const taxable = Math.min(remaining, bracketSize)
    tax += taxable * (bracket.rate / 100)
    remaining -= taxable
    prevBis = bracket.bis
    if (remaining <= 0) break
  }
  return Math.round(tax)
}

export default function ErbschaftSteuerRechnerPage() {
  const [betrag, setBetrag] = useState(500000)
  const [relationIdx, setRelationIdx] = useState(1)
  const [isSchenkung, setIsSchenkung] = useState(false)

  const relation = RELATIONSHIP_MAP[relationIdx]
  const taxClass = TAX_CLASSES[relation.klasse]
  const freibetrag = relation.freibetrag

  const result = useMemo(() => {
    const steuerpflichtig = Math.max(0, betrag - freibetrag)
    const steuer = calcTax(steuerpflichtig, taxClass.rates)
    const effektiverSatz = betrag > 0 ? ((steuer / betrag) * 100).toFixed(2) : '0.00'
    return { steuerpflichtig, steuer, effektiverSatz }
  }, [betrag, freibetrag, taxClass])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          Erbschaft- & Schenkungsteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie die Erbschaft- oder Schenkungsteuer nach dem ErbStG
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Eingaben</CardTitle>
            <CardDescription>Wert, Verwandtschaftsgrad und Art der Zuwendung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Art der Zuwendung</label>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => setIsSchenkung(false)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                    !isSchenkung ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border'
                  }`}
                >
                  Erbschaft
                </button>
                <button
                  onClick={() => setIsSchenkung(true)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                    isSchenkung ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border'
                  }`}
                >
                  Schenkung
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Verwandtschaftsgrad</label>
              <select
                value={relationIdx}
                onChange={e => setRelationIdx(Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                {RELATIONSHIP_MAP.map((r, i) => (
                  <option key={i} value={i}>
                    {r.label} — Freibetrag {r.freibetrag.toLocaleString('de-DE')} €
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Wert der Zuwendung (€)</label>
              <input
                type="number"
                value={betrag}
                onChange={e => setBetrag(Number(e.target.value))}
                min={0}
                step={10000}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <input
                type="range"
                min={0}
                max={5000000}
                step={10000}
                value={betrag}
                onChange={e => setBetrag(Number(e.target.value))}
                className="w-full mt-2 accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 €</span>
                <span>5.000.000 €</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>{taxClass.label}</strong>: {taxClass.description}
                  <br />
                  Freibetrag: <strong>{freibetrag.toLocaleString('de-DE')} €</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Zuwendungswert</p>
                  <p className="text-xl font-bold">{betrag.toLocaleString('de-DE')} €</p>
                </div>
                <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm">
                  <span>abzgl. Freibetrag</span>
                  <span className="font-medium text-green-600">-{freibetrag.toLocaleString('de-DE')} €</span>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Steuerpflichtiger Erwerb</p>
                  <p className="text-xl font-bold">{result.steuerpflichtig.toLocaleString('de-DE')} €</p>
                </div>
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-4">
                  <p className="text-sm text-rose-600 dark:text-rose-400">Erbschaft-/Schenkungsteuer</p>
                  <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                    {result.steuer.toLocaleString('de-DE')} €
                  </p>
                  <p className="text-xs text-rose-500 mt-1">
                    Effektiver Steuersatz: {result.effektiverSatz}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Netto-Zuwendung</p>
                  <p className="text-xl font-bold text-green-600">
                    {(betrag - result.steuer).toLocaleString('de-DE')} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Steuertarif {taxClass.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {taxClass.rates.map((r, i) => {
                  const prevBis = i === 0 ? 0 : taxClass.rates[i - 1].bis
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {prevBis === 0 ? 'bis' : 'ab'} {r.bis === Infinity ? `${prevBis.toLocaleString('de-DE')}` : r.bis.toLocaleString('de-DE')} €
                      </span>
                      <span className="font-medium">{r.rate}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {result.steuer > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Bei Schenkungen kann der Freibetrag alle 10 Jahre erneut genutzt werden.
                  Eine gestaffelte Schenkung kann die Steuerlast erheblich reduzieren.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
