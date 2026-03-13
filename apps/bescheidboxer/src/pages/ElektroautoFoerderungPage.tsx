import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Car, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ElektroautoFoerderungPage() {
  const [listenpreis, setListenpreis] = useState(45000)
  const [fahrzeugart, setFahrzeugart] = useState<'bev' | 'phev' | 'verbrenner'>('bev')
  const [entfernung, setEntfernung] = useState(20)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [leasingRate, setLeasingRate] = useState(0)
  const [arbeitstage, setArbeitstage] = useState(220)

  const ergebnis = useMemo(() => {
    // 1%-Regelung / 0,25%-Regelung / 0,5%-Regelung
    let prozentRegel: number
    let regelBezeichnung: string

    if (fahrzeugart === 'bev' && listenpreis <= 70000) {
      prozentRegel = 0.25
      regelBezeichnung = '0,25%-Regelung (BEV bis 70.000 EUR)'
    } else if (fahrzeugart === 'bev') {
      prozentRegel = 0.5
      regelBezeichnung = '0,5%-Regelung (BEV ueber 70.000 EUR)'
    } else if (fahrzeugart === 'phev') {
      prozentRegel = 0.5
      regelBezeichnung = '0,5%-Regelung (PHEV)'
    } else {
      prozentRegel = 1.0
      regelBezeichnung = '1%-Regelung (Verbrenner)'
    }

    // Geldwerter Vorteil
    const geldwerterVorteilMonat = Math.round(listenpreis * prozentRegel / 100)
    const geldwerterVorteilJahr = geldwerterVorteilMonat * 12

    // Fahrten Wohnung-Arbeit: 0,03% × Listenpreis × km (E-Auto: halber/viertel Satz)
    const fahrtenzuschlagMonat = Math.round(listenpreis * 0.03 / 100 * entfernung * (fahrzeugart === 'bev' && listenpreis <= 70000 ? 0.25 : fahrzeugart !== 'verbrenner' ? 0.5 : 1))
    const fahrtenzuschlagJahr = fahrtenzuschlagMonat * 12

    // Gesamter geldwerter Vorteil
    const gesamtGWVJahr = geldwerterVorteilJahr + fahrtenzuschlagJahr
    const steuerAufGWV = Math.round(gesamtGWVJahr * grenzsteuersatz / 100)
    const svAufGWV = Math.round(gesamtGWVJahr * 0.20) // ca. 20% SV

    // Vergleich: Verbrenner
    const gwvVerbrennerMonat = Math.round(listenpreis * 1 / 100)
    const gwvVerbrennerJahr = gwvVerbrennerMonat * 12
    const fahrtVerbrennerMonat = Math.round(listenpreis * 0.03 / 100 * entfernung)
    const fahrtVerbrennerJahr = fahrtVerbrennerMonat * 12
    const gesamtVerbrennerJahr = gwvVerbrennerJahr + fahrtVerbrennerJahr
    const steuerVerbrenner = Math.round(gesamtVerbrennerJahr * grenzsteuersatz / 100)

    const steuerersparnis = steuerVerbrenner - steuerAufGWV

    // Dienstwagenrechner: Kosten fuer AG bei Leasing
    const leasingJahr = leasingRate * 12
    const agKosten = leasingJahr > 0 ? leasingJahr : 0

    // Pendlerpauschale (entgangene, wenn Firmenwagen)
    const pendlerPauschale = entfernung <= 20
      ? Math.round(entfernung * 0.30 * arbeitstage)
      : Math.round((20 * 0.30 + (entfernung - 20) * 0.38) * arbeitstage)

    // Chart data
    const chartData = [
      {
        name: 'BEV (≤70k)',
        gwv: Math.round(listenpreis * 0.25 / 100 * 12),
        steuer: Math.round(listenpreis * 0.25 / 100 * 12 * grenzsteuersatz / 100),
      },
      {
        name: 'BEV (>70k)',
        gwv: Math.round(listenpreis * 0.5 / 100 * 12),
        steuer: Math.round(listenpreis * 0.5 / 100 * 12 * grenzsteuersatz / 100),
      },
      {
        name: 'PHEV',
        gwv: Math.round(listenpreis * 0.5 / 100 * 12),
        steuer: Math.round(listenpreis * 0.5 / 100 * 12 * grenzsteuersatz / 100),
      },
      {
        name: 'Verbrenner',
        gwv: Math.round(listenpreis * 1.0 / 100 * 12),
        steuer: Math.round(listenpreis * 1.0 / 100 * 12 * grenzsteuersatz / 100),
      },
    ]

    return {
      prozentRegel,
      regelBezeichnung,
      geldwerterVorteilMonat,
      geldwerterVorteilJahr,
      fahrtenzuschlagMonat,
      fahrtenzuschlagJahr,
      gesamtGWVJahr,
      steuerAufGWV,
      svAufGWV,
      steuerersparnis,
      gesamtVerbrennerJahr,
      steuerVerbrenner,
      agKosten,
      pendlerPauschale,
      chartData,
    }
  }, [listenpreis, fahrzeugart, entfernung, grenzsteuersatz, leasingRate, arbeitstage])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          Elektroauto Steuervorteile
        </h1>
        <p className="text-muted-foreground mt-1">
          Dienstwagen-Besteuerung E-Auto – § 6 Abs. 1 Nr. 4 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>0,25%-Regelung:</strong> Reine E-Autos (BEV) bis <strong>70.000 EUR</strong> Listenpreis – nur 0,25% statt 1%.</p>
              <p><strong>0,5%-Regelung:</strong> BEV ueber 70.000 EUR + Plug-in-Hybride (PHEV, min. 80km elektrisch).</p>
              <p><strong>Kfz-Steuer:</strong> BEV bis 2030 <strong>befreit</strong>. PHEV regulaer besteuert.</p>
              <p><strong>Laden:</strong> Kostenloses Laden beim AG ist steuerfrei. Wallbox-Zuschuss bis 50 EUR/Monat pauschalierbar.</p>
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
              <p className="text-sm font-medium mb-2">Fahrzeugart</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { key: 'bev', label: 'E-Auto (BEV)' },
                  { key: 'phev', label: 'Plug-in-Hybrid' },
                  { key: 'verbrenner', label: 'Verbrenner' },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => setFahrzeugart(f.key)} className={`rounded-md px-4 py-2 text-sm ${fahrzeugart === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bruttolistenpreis: {listenpreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={15000} max={150000} step={1000} value={listenpreis} onChange={e => setListenpreis(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Entfernung Wohnung–Arbeit: {entfernung} km</label>
              <input type="range" min={0} max={80} value={entfernung} onChange={e => setEntfernung(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Arbeitstage/Jahr: {arbeitstage}</label>
              <input type="range" min={180} max={250} value={arbeitstage} onChange={e => setArbeitstage(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Leasing-Rate (AG): {leasingRate.toLocaleString('de-DE')} EUR/Monat</label>
              <input type="range" min={0} max={1500} step={50} value={leasingRate} onChange={e => setLeasingRate(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">Optional: Fuer AG-Kostenberechnung</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary/10 p-3 mb-4 text-center">
              <p className="text-sm font-medium text-primary">{ergebnis.regelBezeichnung}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Ersparnis vs. Verbrenner/Jahr</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{ergebnis.geldwerterVorteilMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Geldwerter Vorteil/Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Listenpreis</span>
                <span className="font-medium">{listenpreis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">GWV Privatnutzung ({ergebnis.prozentRegel}%)</span>
                <span className="font-medium">{ergebnis.geldwerterVorteilMonat.toLocaleString('de-DE')} EUR/Monat</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">GWV Fahrten Wohnung–Arbeit</span>
                <span className="font-medium">{ergebnis.fahrtenzuschlagMonat.toLocaleString('de-DE')} EUR/Monat</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gesamter GWV/Jahr</span>
                <span className="font-medium">{ergebnis.gesamtGWVJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuer auf GWV</span>
                <span className="font-medium text-red-600">{ergebnis.steuerAufGWV.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verbrenner: Steuer auf GWV</span>
                <span className="font-medium text-red-600">{ergebnis.steuerVerbrenner.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span>Ersparnis gegenueber Verbrenner</span>
                <span className="text-green-600">{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR/Jahr</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Geldwerter Vorteil nach Fahrzeugart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="gwv" name="GWV/Jahr" fill="#7c3aed" />
                <Bar dataKey="steuer" name="Steuer" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weitere E-Auto Vorteile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">0 EUR</p>
              <p className="text-xs text-muted-foreground">Kfz-Steuer (bis 2030)</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">Steuerfrei</p>
              <p className="text-xs text-muted-foreground">Laden beim Arbeitgeber</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">50 EUR</p>
              <p className="text-xs text-muted-foreground">Wallbox-Zuschuss (pauschal)</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">THG-Quote</p>
              <p className="text-xs text-muted-foreground">Praemie steuerfrei (privat)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
