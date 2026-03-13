import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Car, Info, Zap } from 'lucide-react'

export default function FirmenwagenRechnerPage() {
  const [bruttolistenpreis, setBruttolistenpreis] = useState(45000)
  const [antrieb, setAntrieb] = useState<'verbrenner' | 'hybrid' | 'elektro'>('verbrenner')
  const [entfernungKm, setEntfernungKm] = useState(25)

  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [arbeitstage, setArbeitstage] = useState(220)

  const ergebnis = useMemo(() => {
    // 1%-Regelung: Bemessungsgrundlage
    let bemessungsgrundlage = bruttolistenpreis
    if (antrieb === 'elektro' && bruttolistenpreis <= 70000) {
      bemessungsgrundlage = bruttolistenpreis * 0.25 // 0,25% statt 1%
    } else if (antrieb === 'elektro') {
      bemessungsgrundlage = bruttolistenpreis * 0.5
    } else if (antrieb === 'hybrid') {
      bemessungsgrundlage = bruttolistenpreis * 0.5 // 0,5% für Hybride
    }

    // Auf volle 100 € abrunden
    bemessungsgrundlage = Math.floor(bemessungsgrundlage / 100) * 100

    // Monatlicher geldwerter Vorteil (Privatnutzung)
    let faktorProzent = 1.0
    if (antrieb === 'elektro' && bruttolistenpreis <= 70000) {
      faktorProzent = 0.25
    } else if (antrieb === 'elektro' || antrieb === 'hybrid') {
      faktorProzent = 0.5
    }

    const privatMonat = Math.round(bruttolistenpreis * (faktorProzent / 100))

    // Fahrten Wohnung-Arbeitsstätte: 0,03% × BLP × km (bzw. reduziert für E/Hybrid)
    const fahrtenMonat = Math.round(bruttolistenpreis * (faktorProzent * 0.03 / 100) * entfernungKm)

    // Gesamter geldwerter Vorteil pro Monat
    const geldwerterVorteilMonat = privatMonat + fahrtenMonat
    const geldwerterVorteilJahr = geldwerterVorteilMonat * 12

    // Steuerbelastung
    const steuerMonat = Math.round(geldwerterVorteilMonat * (grenzsteuersatz / 100))
    const steuerJahr = steuerMonat * 12

    // Entfernungspauschale als Gegenrechnung
    const entfernungspauschale = entfernungKm <= 20
      ? entfernungKm * 0.30 * arbeitstage
      : (20 * 0.30 + (entfernungKm - 20) * 0.38) * arbeitstage
    const entfernungErsparnis = Math.round(entfernungspauschale * (grenzsteuersatz / 100))

    // Netto-Belastung
    const nettoBelastung = steuerJahr - entfernungErsparnis

    return {
      bemessungsgrundlage, faktorProzent, privatMonat, fahrtenMonat,
      geldwerterVorteilMonat, geldwerterVorteilJahr,
      steuerMonat, steuerJahr,
      entfernungspauschale: Math.round(entfernungspauschale),
      entfernungErsparnis,
      nettoBelastung,
    }
  }, [bruttolistenpreis, antrieb, entfernungKm, grenzsteuersatz, arbeitstage])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Car className="h-6 w-6 text-blue-500" />
          Firmenwagen-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          1%-Regelung, geldwerter Vorteil und Steuerbelastung berechnen
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fahrzeugdaten</CardTitle>
              <CardDescription>Bruttolistenpreis und Antriebsart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bruttolistenpreis (€)</label>
                <input type="number" value={bruttolistenpreis} onChange={e => setBruttolistenpreis(Number(e.target.value))} min={0} step={5000} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                <input type="range" min={10000} max={150000} step={5000} value={bruttolistenpreis} onChange={e => setBruttolistenpreis(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>

              <div>
                <label className="text-sm font-medium">Antriebsart</label>
                <div className="flex gap-2 mt-1.5">
                  {([
                    { value: 'verbrenner', label: 'Verbrenner', icon: '⛽' },
                    { value: 'hybrid', label: 'Hybrid', icon: '🔋' },
                    { value: 'elektro', label: 'Elektro', icon: '⚡' },
                  ] as const).map(a => (
                    <button
                      key={a.value}
                      onClick={() => setAntrieb(a.value)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${
                        antrieb === a.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Entfernung Wohnung – Arbeitsstätte (km)</label>
                <input type="number" value={entfernungKm} onChange={e => setEntfernungKm(Number(e.target.value))} min={0} max={200} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Grenzsteuersatz (%)</label>
                  <input type="number" value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(Number(e.target.value))} min={0} max={45} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium">Arbeitstage/Jahr</label>
                  <input type="number" value={arbeitstage} onChange={e => setArbeitstage(Number(e.target.value))} min={100} max={260} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                </div>
              </div>

              {antrieb !== 'verbrenner' && (
                <div className={`rounded-lg p-3 flex items-center gap-2 ${
                  antrieb === 'elektro' ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900'
                }`}>
                  <Zap className={`h-4 w-4 ${antrieb === 'elektro' ? 'text-green-500' : 'text-blue-500'}`} />
                  <p className="text-xs">
                    {antrieb === 'elektro'
                      ? bruttolistenpreis <= 70000 ? 'E-Auto ≤ 70.000 €: nur 0,25% statt 1%' : 'E-Auto > 70.000 €: 0,5% statt 1%'
                      : 'Plug-in-Hybrid: 0,5% statt 1% (bei mind. 80 km elektr. Reichweite)'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>1%-Regelung Berechnung</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Bruttolistenpreis</span>
                <span className="font-medium">{bruttolistenpreis.toLocaleString('de-DE')} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Faktor ({ergebnis.faktorProzent}%)</span>
                <span className="font-medium text-muted-foreground">{ergebnis.faktorProzent}%</span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Geldwerter Vorteil / Monat</h3>
                <div className="flex justify-between text-sm">
                  <span>Privatnutzung ({ergebnis.faktorProzent}%)</span>
                  <span className="font-medium">{ergebnis.privatMonat.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fahrten Whg-Arbeit ({entfernungKm} km)</span>
                  <span className="font-medium">{ergebnis.fahrtenMonat.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-1 font-bold">
                  <span>Gesamt/Monat</span>
                  <span>{ergebnis.geldwerterVorteilMonat.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Gesamt/Jahr</span>
                  <span>{ergebnis.geldwerterVorteilJahr.toLocaleString('de-DE')} €</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Steuerbelastung</h3>
                <div className="flex justify-between text-sm">
                  <span>Steuer auf GWV ({grenzsteuersatz}%)</span>
                  <span className="font-medium text-red-600">{ergebnis.steuerJahr.toLocaleString('de-DE')} €/Jahr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entfernungspauschale (Gegenrechnung)</span>
                  <span className="font-medium text-green-600">-{ergebnis.entfernungErsparnis.toLocaleString('de-DE')} €</span>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">Netto-Steuerbelastung pro Jahr</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{ergebnis.nettoBelastung.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-blue-500 mt-1">{Math.round(ergebnis.nettoBelastung / 12).toLocaleString('de-DE')} €/Monat</p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Fahrtenbuch:</strong> Bei wenig Privatnutzung kann ein Fahrtenbuch günstiger sein als die 1%-Regelung.</p>
                <p><strong>E-Auto-Vorteil:</strong> Bei Elektro ≤ 70.000 € BLP zahlen Sie nur 0,25% → deutlich weniger Steuern.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
