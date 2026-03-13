import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function NachzahlungenRechnerPage() {
  const [nachzahlung, setNachzahlung] = useState(5000)
  const [monateSpaet, setMonateSpaet] = useState(6)
  const [zinsMonate, setZinsMonate] = useState(12)
  const [hatVerspaetung, setHatVerspaetung] = useState(false)
  const [verspMonate, setVerspMonate] = useState(4)

  const ergebnis = useMemo(() => {
    // Säumniszuschlag § 240 AO: 1% pro angefangener Monat (ab Fälligkeit)
    const saeumnisProMonat = Math.ceil(nachzahlung * 0.01)
    const saeumnisGesamt = saeumnisProMonat * monateSpaet

    // Nachzahlungszinsen § 233a AO: 0,15% pro Monat (1,8% p.a.) ab 15 Monate nach Steuerentstehung
    const zinsSatz = 0.0015 // 0,15% pro Monat (seit 2022)
    const zinsen = Math.round(nachzahlung * zinsSatz * zinsMonate * 100) / 100

    // Verspätungszuschlag § 152 AO: mind. 0,25% der festgesetzten Steuer pro Monat, min. 25 EUR/Monat
    let verspaetungszuschlag = 0
    if (hatVerspaetung) {
      const proMonat = Math.max(Math.round(nachzahlung * 0.0025), 25)
      verspaetungszuschlag = proMonat * verspMonate
      // Max 10% der Steuer, min 25 EUR je Monat
      verspaetungszuschlag = Math.min(verspaetungszuschlag, Math.round(nachzahlung * 0.10))
    }

    const gesamtBelastung = nachzahlung + saeumnisGesamt + zinsen + verspaetungszuschlag

    // Chart: Aufbau nach Monaten
    const chartData = Array.from({ length: Math.max(monateSpaet, 1) }, (_, i) => {
      const m = i + 1
      return {
        monat: `${m} Mon.`,
        saeunis: saeumnisProMonat * m,
        zinsen: Math.round(nachzahlung * zinsSatz * Math.min(m, zinsMonate)),
        nachzahlung,
      }
    })

    return {
      saeumnisProMonat, saeumnisGesamt, zinsSatz,
      zinsen, verspaetungszuschlag, gesamtBelastung, chartData,
    }
  }, [nachzahlung, monateSpaet, zinsMonate, hatVerspaetung, verspMonate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Nachzahlungen & Strafzinsen
        </h1>
        <p className="text-muted-foreground mt-1">
          §§ 233a, 240, 152 AO – Säumniszuschläge, Nachzahlungszinsen & Verspätungszuschläge
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Säumniszuschlag:</strong> 1% pro angefangenem Monat auf den abgerundeten Steuerbetrag (§ 240 AO).</p>
              <p><strong>Nachzahlungszinsen:</strong> 0,15% pro Monat (1,8% p.a.) ab 15 Monate nach Steuerentstehung (§ 233a AO, seit 2022).</p>
              <p><strong>Verspätungszuschlag:</strong> Mind. 0,25% der Steuer pro Monat, min. 25 EUR, max. 10% (§ 152 AO).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Steuernachzahlung: {nachzahlung.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={500} max={100000} step={500} value={nachzahlung} onChange={e => setNachzahlung(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Säumnis-Monate: {monateSpaet}</label>
              <input type="range" min={1} max={24} step={1} value={monateSpaet} onChange={e => setMonateSpaet(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Zinslauf-Monate (§ 233a): {zinsMonate}</label>
              <input type="range" min={0} max={48} step={1} value={zinsMonate} onChange={e => setZinsMonate(+e.target.value)} className="w-full accent-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hatVerspaetung} onChange={e => setHatVerspaetung(e.target.checked)} className="accent-primary" />
              Verspätungszuschlag (§ 152 AO)
            </label>
            {hatVerspaetung && (
              <div>
                <label className="text-sm font-medium">Verspätung-Monate: {verspMonate}</label>
                <input type="range" min={1} max={14} step={1} value={verspMonate} onChange={e => setVerspMonate(+e.target.value)} className="w-full accent-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.gesamtBelastung.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamtbelastung</p>
              </div>
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{(ergebnis.saeumnisGesamt + ergebnis.zinsen + ergebnis.verspaetungszuschlag).toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Zusatzkosten</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuernachzahlung</span>
                <span className="font-medium">{nachzahlung.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Säumniszuschlag ({monateSpaet} Mon. × {ergebnis.saeumnisProMonat.toLocaleString('de-DE')})</span>
                <span className="font-medium text-red-600">+{ergebnis.saeumnisGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Nachzahlungszinsen ({zinsMonate} Mon. × 0,15%)</span>
                <span className="font-medium text-red-600">+{ergebnis.zinsen.toLocaleString('de-DE')} EUR</span>
              </div>
              {hatVerspaetung && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Verspätungszuschlag ({verspMonate} Mon.)</span>
                  <span className="font-medium text-red-600">+{ergebnis.verspaetungszuschlag.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-semibold">
                <span>Gesamt</span>
                <span className="text-red-700 dark:text-red-400">{ergebnis.gesamtBelastung.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Kostenentwicklung nach Monaten</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monat" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="saeunis" name="Säumniszuschlag" fill="#ef4444" stackId="a" />
                <Bar dataKey="zinsen" name="Nachzahlungszinsen" fill="#f97316" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
