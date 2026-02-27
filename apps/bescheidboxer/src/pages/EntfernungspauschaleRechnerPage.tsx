import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Car, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EntfernungspauschaleRechnerPage() {
  const [entfernungKm, setEntfernungKm] = useState(25)
  const [arbeitstageJahr, setArbeitstageJahr] = useState(220)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42)
  const [verkehrsmittel, setVerkehrsmittel] = useState<'auto' | 'oepnv' | 'fahrrad'>('auto')
  const [oepnvKosten, setOepnvKosten] = useState(49)
  const [homeoffice, setHomeoffice] = useState(50)

  const ergebnis = useMemo(() => {
    const effektiveTage = Math.round(arbeitstageJahr * (1 - homeoffice / 100))
    const homeofficeTage = Math.min(arbeitstageJahr - effektiveTage, 210)

    // Entfernungspauschale: 0,30 EUR/km (1-20 km) + 0,38 EUR/km (ab 21. km)
    const bisKm20 = Math.min(entfernungKm, 20)
    const abKm21 = Math.max(entfernungKm - 20, 0)
    const pauschaleProTag = bisKm20 * 0.30 + abKm21 * 0.38
    const pauschaleJahr = Math.round(pauschaleProTag * effektiveTage)

    // OEPNV: Hoechster Wert von Pauschale oder tatsaechlichen Kosten
    const oepnvJahr = oepnvKosten * 12
    const oepnvAbzug = verkehrsmittel === 'oepnv' ? Math.max(pauschaleJahr, oepnvJahr) : 0

    // Homeoffice-Pauschale: 6 EUR/Tag, max 1.260 EUR
    const homeofficePauschale = Math.min(homeofficeTage * 6, 1260)

    // Fahrrad: seit 2022 auch Entfernungspauschale moeglich
    const abzugFahrt = verkehrsmittel === 'oepnv' ? oepnvAbzug : pauschaleJahr
    const gesamtAbzug = abzugFahrt + homeofficePauschale

    // Abzueglich Arbeitnehmer-Pauschbetrag (1.230 EUR, schon enthalten)
    const ersparnis = Math.round(gesamtAbzug * grenzsteuersatz / 100)
    const ersparnisMonat = Math.round(ersparnis / 12)

    return {
      effektiveTage,
      homeofficeTage,
      pauschaleProTag: Math.round(pauschaleProTag * 100) / 100,
      pauschaleJahr,
      oepnvJahr,
      oepnvAbzug,
      homeofficePauschale,
      abzugFahrt,
      gesamtAbzug,
      ersparnis,
      ersparnisMonat,
    }
  }, [entfernungKm, arbeitstageJahr, grenzsteuersatz, verkehrsmittel, oepnvKosten, homeoffice])

  const chartData = Array.from({ length: 61 }, (_, i) => {
    const km = i + 5
    const bis20 = Math.min(km, 20) * 0.30
    const ab21 = Math.max(km - 20, 0) * 0.38
    const tagesP = bis20 + ab21
    const jahresP = Math.round(tagesP * ergebnis.effektiveTage)
    return { km, pauschale: jahresP, ersparnis: Math.round(jahresP * grenzsteuersatz / 100) }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          Entfernungspauschale
        </h1>
        <p className="text-muted-foreground mt-1">
          Pendlerpauschale berechnen – § 9 Abs. 1 Nr. 4 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Entfernungspauschale:</strong> 0,30 EUR/km fuer die ersten 20 km, <strong>0,38 EUR/km ab dem 21. km</strong> (befristet bis 2026).</p>
              <p><strong>Verkehrsmittel:</strong> Gilt fuer alle Verkehrsmittel (auch Fahrrad!). Bei OEPNV: Hoechstbetrag von Pauschale oder tatsaechlichen Kosten.</p>
              <p><strong>Homeoffice:</strong> An Homeoffice-Tagen keine Entfernungspauschale, dafuer 6 EUR/Tag Homeoffice-Pauschale (max. 1.260 EUR/Jahr).</p>
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
              <label className="text-sm font-medium">Einfache Entfernung: {entfernungKm} km</label>
              <input type="range" min={1} max={100} value={entfernungKm} onChange={e => setEntfernungKm(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground"><span>1 km</span><span>100 km</span></div>
            </div>

            <div>
              <label className="text-sm font-medium">Arbeitstage/Jahr: {arbeitstageJahr}</label>
              <input type="range" min={100} max={250} value={arbeitstageJahr} onChange={e => setArbeitstageJahr(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Finanzamt akzeptiert i.d.R. 220-230 Tage (5 Tage/Woche)</p>
            </div>

            <div>
              <label className="text-sm font-medium">Homeoffice-Anteil: {homeoffice}%</label>
              <input type="range" min={0} max={100} value={homeoffice} onChange={e => setHomeoffice(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Effektive Fahrttage: {ergebnis.effektiveTage} | Homeoffice-Tage: {ergebnis.homeofficeTage}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Verkehrsmittel</p>
              <div className="flex gap-2">
                {([['auto', 'Auto/Motorrad'], ['oepnv', 'OEPNV'], ['fahrrad', 'Fahrrad']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setVerkehrsmittel(key)} className={`rounded-md px-4 py-2 text-sm ${verkehrsmittel === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {verkehrsmittel === 'oepnv' && (
              <div>
                <label className="text-sm font-medium">OEPNV-Kosten/Monat: {oepnvKosten} EUR</label>
                <input type="range" min={0} max={300} value={oepnvKosten} onChange={e => setOepnvKosten(+e.target.value)} className="w-full accent-primary" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
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
                <p className="text-2xl font-bold text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamter Steuerabzug/Jahr</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.ersparnis.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuerersparnis ({ergebnis.ersparnisMonat} EUR/M)</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pauschale/Tag ({entfernungKm} km)</span>
                <span className="font-medium">{ergebnis.pauschaleProTag.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Entfernungspauschale ({ergebnis.effektiveTage} Tage)</span>
                <span className="font-medium">{ergebnis.pauschaleJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              {verkehrsmittel === 'oepnv' && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">OEPNV-Kosten/Jahr</span>
                    <span className="font-medium">{ergebnis.oepnvJahr.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Abzug Fahrt (Hoechstbetrag)</span>
                    <span className="font-medium">{ergebnis.oepnvAbzug.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
              {ergebnis.homeofficePauschale > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Homeoffice-Pauschale ({ergebnis.homeofficeTage} Tage)</span>
                  <span className="font-medium">{ergebnis.homeofficePauschale.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold">
                <span>Steuerabzug gesamt</span>
                <span className="text-primary">{ergebnis.gesamtAbzug.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pauschale nach Entfernung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="km" tick={{ fontSize: 11 }} tickFormatter={v => `${v} km`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} labelFormatter={v => `${v} km einfach`} />
                <Area type="monotone" dataKey="pauschale" name="Pauschale/Jahr" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
                <Area type="monotone" dataKey="ersparnis" name="Steuerersparnis" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Ab dem 21. km steigt die Pauschale auf 0,38 EUR/km (Knick im Verlauf)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Berechnung im Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium mb-1">Erste 20 km:</p>
              <p className="text-muted-foreground">{Math.min(entfernungKm, 20)} km x 0,30 EUR x {ergebnis.effektiveTage} Tage = <strong>{(Math.min(entfernungKm, 20) * 0.30 * ergebnis.effektiveTage).toLocaleString('de-DE')} EUR</strong></p>
            </div>
            {entfernungKm > 20 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium mb-1">Ab 21. km (erhoehte Pauschale):</p>
                <p className="text-muted-foreground">{entfernungKm - 20} km x 0,38 EUR x {ergebnis.effektiveTage} Tage = <strong>{((entfernungKm - 20) * 0.38 * ergebnis.effektiveTage).toLocaleString('de-DE')} EUR</strong></p>
              </div>
            )}
            {ergebnis.homeofficePauschale > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="font-medium mb-1">Homeoffice-Pauschale:</p>
                <p className="text-muted-foreground">{ergebnis.homeofficeTage} Tage x 6 EUR = {ergebnis.homeofficeTage * 6} EUR (max. 1.260 EUR) = <strong>{ergebnis.homeofficePauschale.toLocaleString('de-DE')} EUR</strong></p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
