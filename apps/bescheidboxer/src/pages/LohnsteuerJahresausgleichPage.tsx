import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { RefreshCcw, Info } from 'lucide-react'
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

interface Monat {
  name: string
  brutto: number
}

export default function LohnsteuerJahresausgleichPage() {
  const [steuerklasse, setSteuerklasse] = useState(1)
  const [kirchensteuer, setKirchensteuer] = useState(true)
  const [kirchensteuersatz] = useState(9)
  const [werbungskosten, setWerbungskosten] = useState(1230)
  const [sonderausgaben, setSonderausgaben] = useState(0)
  const [monate, setMonate] = useState<Monat[]>([
    { name: 'Jan', brutto: 4200 }, { name: 'Feb', brutto: 4200 },
    { name: 'Mär', brutto: 4200 }, { name: 'Apr', brutto: 4200 },
    { name: 'Mai', brutto: 4200 }, { name: 'Jun', brutto: 4700 },
    { name: 'Jul', brutto: 4700 }, { name: 'Aug', brutto: 4700 },
    { name: 'Sep', brutto: 4700 }, { name: 'Okt', brutto: 4700 },
    { name: 'Nov', brutto: 4700 }, { name: 'Dez', brutto: 5500 },
  ])

  const ergebnis = useMemo(() => {
    // Jahresbrutto
    const jahresBrutto = monate.reduce((s, m) => s + m.brutto, 0)

    // Tatsächlich einbehaltene LohnSt (vereinfacht: pro Monat ESt auf hochgerechnetes Jahresgehalt / 12)
    let lohnsteuerEinbehalten = 0
    monate.forEach(m => {
      const hochgerechnet = m.brutto * 12
      const zvE = Math.max(0, hochgerechnet - Math.max(werbungskosten, 1230) - 36) // Pauschale Sonderausgaben
      let est: number
      if (steuerklasse === 3) {
        est = 2 * calcESt(Math.floor(zvE / 2))
      } else {
        est = calcESt(zvE)
      }
      lohnsteuerEinbehalten += Math.round(est / 12)
    })

    // Tatsächliche ESt auf Jahreseinkommen
    const zvEJahr = Math.max(0, jahresBrutto - Math.max(werbungskosten, 1230) - Math.max(sonderausgaben, 36))
    let estJahr: number
    if (steuerklasse === 3) {
      estJahr = 2 * calcESt(Math.floor(zvEJahr / 2))
    } else {
      estJahr = calcESt(zvEJahr)
    }

    // Soli
    const soliEinbehalten = lohnsteuerEinbehalten > 17543 ? Math.round(lohnsteuerEinbehalten * 0.055) : 0
    const soliJahr = estJahr > 17543 ? Math.round(estJahr * 0.055) : 0

    // KiSt
    const kistEinbehalten = kirchensteuer ? Math.round(lohnsteuerEinbehalten * kirchensteuersatz / 100) : 0
    const kistJahr = kirchensteuer ? Math.round(estJahr * kirchensteuersatz / 100) : 0

    const gesamtEinbehalten = lohnsteuerEinbehalten + soliEinbehalten + kistEinbehalten
    const gesamtJahr = estJahr + soliJahr + kistJahr

    const erstattung = gesamtEinbehalten - gesamtJahr

    return {
      jahresBrutto,
      zvEJahr,
      lohnsteuerEinbehalten,
      estJahr,
      soliEinbehalten,
      soliJahr,
      kistEinbehalten,
      kistJahr,
      gesamtEinbehalten,
      gesamtJahr,
      erstattung,
    }
  }, [monate, steuerklasse, kirchensteuer, kirchensteuersatz, werbungskosten, sonderausgaben])

  const chartData = monate.map(m => {
    const hochgerechnet = m.brutto * 12
    const zvE = Math.max(0, hochgerechnet - Math.max(werbungskosten, 1230) - 36)
    const est = steuerklasse === 3 ? 2 * calcESt(Math.floor(zvE / 2)) : calcESt(zvE)
    return { name: m.name, brutto: m.brutto, lstMonat: Math.round(est / 12) }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RefreshCcw className="h-6 w-6 text-primary" />
          Lohnsteuer-Jahresausgleich
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuererstattung bei schwankendem Gehalt – Pflichtveranlagung prüfen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Lohnsteuer-Jahresausgleich:</strong> Bei schwankendem Gehalt (Gehaltserhöhung, Bonus, Kurzarbeit) wird monatlich zu viel oder zu wenig LohnSt einbehalten.</p>
              <p><strong>Erstattung:</strong> Die Einkommensteuererklärung vergleicht die tatsächliche Jahressteuer mit der summierten Lohnsteuer. Differenz = Erstattung/Nachzahlung.</p>
              <p><strong>Tipp:</strong> Werbungskosten über 1.230 € senken die tatsächliche ESt zusätzlich.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monatliche Bruttoeingaben */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monatliches Bruttogehalt</CardTitle>
            <CardDescription>Tragen Sie die monatlichen Bruttogehälter ein</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {monate.map((m, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{m.name}</label>
                  <input
                    type="number"
                    value={m.brutto}
                    onChange={e => setMonate(prev => prev.map((x, j) => j === i ? { ...x, brutto: +e.target.value } : x))}
                    className="w-full rounded border px-2 py-1.5 text-sm text-right"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setMonate(prev => prev.map(m => ({ ...m, brutto: prev[0].brutto })))} className="text-xs text-primary hover:underline">
                Alle = Jan
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Einstellungen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Steuerklasse</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5, 6].map(sk => (
                  <button key={sk} onClick={() => setSteuerklasse(sk)} className={`rounded px-3 py-1.5 text-xs ${steuerklasse === sk ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {sk}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="rounded" />
              <label className="text-sm">Kirchensteuer ({kirchensteuersatz}%)</label>
            </div>
            <div>
              <label className="text-sm font-medium">Werbungskosten: {werbungskosten.toLocaleString('de-DE')} €</label>
              <input type="range" min={0} max={10000} step={100} value={werbungskosten} onChange={e => setWerbungskosten(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Pauschale: 1.230 €</p>
            </div>
            <div>
              <label className="text-sm font-medium">Sonderausgaben: {sonderausgaben.toLocaleString('de-DE')} €</label>
              <input type="range" min={0} max={10000} step={100} value={sonderausgaben} onChange={e => setSonderausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      <Card className={`border-2 ${ergebnis.erstattung > 0 ? 'border-green-500/50' : ergebnis.erstattung < 0 ? 'border-red-500/50' : 'border-border'}`}>
        <CardHeader>
          <CardTitle className="text-lg">
            {ergebnis.erstattung > 0 ? '✓ Steuererstattung erwartet' : ergebnis.erstattung < 0 ? '⚠ Nachzahlung erwartet' : 'Ausgeglichen'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 text-center">
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{ergebnis.gesamtEinbehalten.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Einbehalten (LohnSt+Soli+KiSt)</p>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 text-center">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{ergebnis.gesamtJahr.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground">Tatsächliche Jahressteuer</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${ergebnis.erstattung > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-2xl font-bold ${ergebnis.erstattung > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {ergebnis.erstattung > 0 ? '+' : ''}{ergebnis.erstattung.toLocaleString('de-DE')} €
              </p>
              <p className="text-xs text-muted-foreground">{ergebnis.erstattung > 0 ? 'Erstattung' : 'Nachzahlung'}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Jahresbrutto</span><span>{ergebnis.jahresBrutto.toLocaleString('de-DE')} €</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">zu versteuerndes Einkommen</span><span>{ergebnis.zvEJahr.toLocaleString('de-DE')} €</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">LohnSt einbehalten</span><span>{ergebnis.lohnsteuerEinbehalten.toLocaleString('de-DE')} €</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Tatsächliche ESt</span><span>{ergebnis.estJahr.toLocaleString('de-DE')} €</span></div>
            <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Soli (einbeh. / tatsächl.)</span><span>{ergebnis.soliEinbehalten.toLocaleString('de-DE')} / {ergebnis.soliJahr.toLocaleString('de-DE')} €</span></div>
            {kirchensteuer && (
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">KiSt (einbeh. / tatsächl.)</span><span>{ergebnis.kistEinbehalten.toLocaleString('de-DE')} / {ergebnis.kistJahr.toLocaleString('de-DE')} €</span></div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monatlicher Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} €`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} €`} />
                <Legend />
                <Bar dataKey="brutto" name="Brutto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lstMonat" name="LohnSt/Monat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
