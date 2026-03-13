import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Banknote, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 0) return 0
  if (zvE <= 11784) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11784) / 10000
    return Math.floor((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.floor((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10602.13)
  }
  return Math.floor(0.45 * zvE - 18936.88)
}

export default function AbfindungsRechnerPage() {
  const [zvE, setZvE] = useState(50000)
  const [abfindung, setAbfindung] = useState(60000)
  const [zusammen, setZusammen] = useState(false)
  const [kirchensteuer, setKirchensteuer] = useState(true)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(9)

  const ergebnis = useMemo(() => {
    const estFn = (eink: number) => {
      if (zusammen) return 2 * calcESt(Math.floor(eink / 2))
      return calcESt(eink)
    }

    // Normale Besteuerung: zvE + Abfindung komplett
    const estNormal = estFn(zvE + abfindung)
    const estOhneAbfindung = estFn(zvE)
    const mehrsteuerNormal = estNormal - estOhneAbfindung

    // Fünftelregelung: ESt(zvE + 1/5 Abfindung) - ESt(zvE), dann × 5
    const estMitFuenftel = estFn(zvE + Math.floor(abfindung / 5))
    const mehrsteuerFuenftel = (estMitFuenftel - estOhneAbfindung) * 5
    const gesamtEstFuenftel = estOhneAbfindung + mehrsteuerFuenftel

    // KiSt + Soli (vereinfacht: Soli nur wenn über Freigrenze)
    const soliNormal = estNormal > (zusammen ? 35086 : 17543) ? Math.round(estNormal * 0.055) : 0
    const soliFuenftel = gesamtEstFuenftel > (zusammen ? 35086 : 17543) ? Math.round(gesamtEstFuenftel * 0.055) : 0

    const kistNormal = kirchensteuer ? Math.round(estNormal * kirchensteuersatz / 100) : 0
    const kistFuenftel = kirchensteuer ? Math.round(gesamtEstFuenftel * kirchensteuersatz / 100) : 0

    const gesamtNormal = estNormal + soliNormal + kistNormal
    const gesamtFuenftel = gesamtEstFuenftel + soliFuenftel + kistFuenftel

    const vorteil = gesamtNormal - gesamtFuenftel

    return {
      estOhneAbfindung,
      estNormal,
      mehrsteuerNormal,
      gesamtEstFuenftel,
      mehrsteuerFuenftel,
      soliNormal,
      soliFuenftel,
      kistNormal,
      kistFuenftel,
      gesamtNormal,
      gesamtFuenftel,
      vorteil,
      grenzsteuersatzNormal: zvE + abfindung > 0 ? Math.round(mehrsteuerNormal / abfindung * 100) : 0,
      grenzsteuersatzFuenftel: abfindung > 0 ? Math.round(mehrsteuerFuenftel / abfindung * 100) : 0,
    }
  }, [zvE, abfindung, zusammen, kirchensteuer, kirchensteuersatz])

  const chartData = [
    { name: 'Normale Besteuerung', est: ergebnis.estNormal, soli: ergebnis.soliNormal, kist: ergebnis.kistNormal },
    { name: 'Fünftelregelung', est: ergebnis.gesamtEstFuenftel, soli: ergebnis.soliFuenftel, kist: ergebnis.kistFuenftel },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Abfindungsrechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Fünftelregelung (§ 34 EStG) – Steuerersparnis bei Abfindungen berechnen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Fünftelregelung (§ 34 EStG):</strong> Außerordentliche Einkünfte (Abfindungen, Entlassungsentschädigungen) werden steuerlich auf 5 Jahre verteilt.</p>
              <p><strong>Berechnung:</strong> Mehrsteuer auf 1/5 der Abfindung wird ermittelt und dann × 5 genommen. Bei progressivem Tarif ist dies günstiger als die volle Besteuerung.</p>
              <p><strong>Hinweis:</strong> Seit 2025 wird die Fünftelregelung nicht mehr im Lohnsteuerabzugsverfahren, sondern nur noch über die Einkommensteuererklärung angewendet.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eingaben</CardTitle>
            <CardDescription>Einkommen und Abfindungshöhe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zu versteuerndes Einkommen (ohne Abfindung): {zvE.toLocaleString('de-DE')} €</label>
              <input type="range" min={0} max={200000} step={1000} value={zvE} onChange={e => setZvE(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0 €</span><span>200.000 €</span></div>
            </div>
            <div>
              <label className="text-sm font-medium">Abfindung: {abfindung.toLocaleString('de-DE')} €</label>
              <input type="range" min={5000} max={500000} step={1000} value={abfindung} onChange={e => setAbfindung(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>5.000 €</span><span>500.000 €</span></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={zusammen} onChange={e => setZusammen(e.target.checked)} className="rounded" />
                Zusammenveranlagung
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="rounded" />
                Kirchensteuer ({kirchensteuersatz}%)
              </label>
            </div>
            {kirchensteuer && (
              <div className="flex gap-2">
                {[8, 9].map(s => (
                  <button key={s} onClick={() => setKirchensteuersatz(s)} className={`rounded-md px-3 py-1 text-xs ${kirchensteuersatz === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {s} % {s === 8 ? '(Bayern/BaWü)' : '(übrige)'}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`border-2 ${ergebnis.vorteil > 0 ? 'border-green-500/50' : 'border-border'}`}>
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 text-center">
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{ergebnis.gesamtNormal.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground">Normale Besteuerung</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{ergebnis.gesamtFuenftel.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground">Fünftelregelung</p>
              </div>
            </div>

            {ergebnis.vorteil > 0 && (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center mb-4">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.vorteil.toLocaleString('de-DE')} €</p>
                <p className="text-xs text-muted-foreground">Ersparnis durch Fünftelregelung</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <p className="font-medium text-muted-foreground">Normale Besteuerung</p>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt auf zvE + Abfindung</span><span>{ergebnis.estNormal.toLocaleString('de-DE')} €</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Mehrsteuer durch Abfindung</span><span>{ergebnis.mehrsteuerNormal.toLocaleString('de-DE')} € ({ergebnis.grenzsteuersatzNormal}%)</span></div>
              <p className="font-medium text-muted-foreground mt-3">Fünftelregelung</p>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">ESt ohne Abfindung</span><span>{ergebnis.estOhneAbfindung.toLocaleString('de-DE')} €</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Mehrsteuer (5 × 1/5)</span><span>{ergebnis.mehrsteuerFuenftel.toLocaleString('de-DE')} € ({ergebnis.grenzsteuersatzFuenftel}%)</span></div>
              <div className="flex justify-between py-1 font-medium"><span>Gesamt-ESt Fünftelregelung</span><span className="text-primary">{ergebnis.gesamtEstFuenftel.toLocaleString('de-DE')} €</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerbelastung im Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                <Legend />
                <Bar dataKey="est" name="ESt" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="soli" name="Soli" stackId="a" fill="#f59e0b" />
                {kirchensteuer && <Bar dataKey="kist" name="KiSt" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
