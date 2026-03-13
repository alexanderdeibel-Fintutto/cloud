import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Clock, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function KurzarbeitergeldPage() {
  const [bruttoVoll, setBruttoVoll] = useState(4000)
  const [bruttoReduziert, setBruttoReduziert] = useState(2000)
  const [steuerklasse, setSteuerklasse] = useState(1)
  const [kinder, setKinder] = useState(false)
  const [monate, setMonate] = useState(6)

  const ergebnis = useMemo(() => {
    // KuG: 60% des Netto-Differenz (67% mit Kind)
    const kugSatz = kinder ? 67 : 60

    // Vereinfachte Netto-Berechnung (Pauschalisiert-Netto nach SGB III)
    const pauschaleAbzuege = (b: number) => {
      const lst = Math.round(b * (steuerklasse <= 3 ? 0.15 : 0.20) * 12) / 12
      const sv = Math.round(b * 0.20)
      return Math.round(b - lst - sv)
    }

    const nettoVoll = pauschaleAbzuege(bruttoVoll)
    const nettoReduziert = pauschaleAbzuege(bruttoReduziert)
    const nettoDifferenz = nettoVoll - nettoReduziert

    const kugMonat = Math.round(nettoDifferenz * kugSatz / 100)
    const gesamtMonat = nettoReduziert + kugMonat
    const verlustMonat = nettoVoll - gesamtMonat
    const verlustProzent = Math.round(verlustMonat / nettoVoll * 100)

    // KuG ist steuerfrei aber unterliegt Progressionsvorbehalt!
    const kugJahr = kugMonat * monate
    // Progressionsvorbehalt: KuG erhoet den Steuersatz auf das restliche Einkommen
    const progressionsEffekt = Math.round(kugJahr * 0.05) // ca. 5% Mehrsteuer geschaetzt

    // Chart: Einkommensverlauf
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const monat = i + 1
      const inKurzarbeit = monat <= monate
      return {
        monat: `M ${monat}`,
        netto: inKurzarbeit ? nettoReduziert : nettoVoll,
        kug: inKurzarbeit ? kugMonat : 0,
        vollesNetto: nettoVoll,
      }
    })

    return {
      nettoVoll,
      nettoReduziert,
      nettoDifferenz,
      kugMonat,
      gesamtMonat,
      verlustMonat,
      verlustProzent,
      kugJahr,
      progressionsEffekt,
      kugSatz,
      chartData,
    }
  }, [bruttoVoll, bruttoReduziert, steuerklasse, kinder, monate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Kurzarbeitergeld-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          KuG berechnen – § 95 SGB III
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>KuG-Hoehe:</strong> <strong>60%</strong> des Netto-Entgeltausfalls (67% mit Kind).</p>
              <p><strong>Dauer:</strong> Max. 12 Monate (Regelfall). Bei Sonderregelungen bis 24 Monate.</p>
              <p><strong>Steuer:</strong> KuG ist <strong>steuerfrei</strong>, unterliegt aber dem <strong>Progressionsvorbehalt</strong> (§ 32b EStG). Steuererklaerungspflicht!</p>
              <p><strong>SV:</strong> Arbeitgeber traegt SV-Beitraege auf 80% des Ausfalls.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Volles Bruttogehalt: {bruttoVoll.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1500} max={10000} step={100} value={bruttoVoll} onChange={e => setBruttoVoll(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Reduziertes Brutto (Kurzarbeit): {bruttoReduziert.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={bruttoVoll} step={100} value={bruttoReduziert} onChange={e => setBruttoReduziert(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Arbeitszeitreduzierung: {Math.round((1 - bruttoReduziert / bruttoVoll) * 100)}%</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Steuerklasse</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map(k => (
                  <button key={k} onClick={() => setSteuerklasse(k)} className={`rounded-md px-4 py-2 text-sm ${steuerklasse === k ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kinder} onChange={e => setKinder(e.target.checked)} className="accent-primary" />
              Mindestens 1 Kind (67% statt 60%)
            </label>

            <div>
              <label className="text-sm font-medium">Kurzarbeit-Dauer: {monate} Monate</label>
              <input type="range" min={1} max={24} value={monate} onChange={e => setMonate(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.kugMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">KuG/Monat ({ergebnis.kugSatz}%)</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamt netto/Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Volles Netto</span>
                <span className="font-medium">{ergebnis.nettoVoll.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Netto aus reduzierter Arbeit</span>
                <span className="font-medium">{ergebnis.nettoReduziert.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Netto-Differenz</span>
                <span className="font-medium">{ergebnis.nettoDifferenz.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KuG ({ergebnis.kugSatz}% der Differenz)</span>
                <span className="font-medium text-primary">{ergebnis.kugMonat.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verlust gegenueber Vollgehalt</span>
                <span className="font-medium text-red-600">-{ergebnis.verlustMonat.toLocaleString('de-DE')} EUR ({ergebnis.verlustProzent}%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KuG gesamt ({monate} Monate)</span>
                <span className="font-medium">{ergebnis.kugJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span>Progressionsvorbehalt (geschaetzt)</span>
                <span className="text-orange-600">ca. {ergebnis.progressionsEffekt.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Einkommensverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monat" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Area type="monotone" dataKey="netto" name="Netto (Arbeit)" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} stackId="1" />
                <Area type="monotone" dataKey="kug" name="Kurzarbeitergeld" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} stackId="1" />
                <Area type="monotone" dataKey="vollesNetto" name="Volles Netto" stroke="#94a3b8" fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
