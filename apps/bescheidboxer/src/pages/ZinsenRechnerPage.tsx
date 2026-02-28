import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Percent, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function ZinsenRechnerPage() {
  const [nachzahlung, setNachzahlung] = useState(5000)
  const [erstattung, setErstattung] = useState(0)
  const [monate, setMonate] = useState(18)
  const [zinssatz, setZinssatz] = useState(0.15)
  const [richtung, setRichtung] = useState<'nachzahlung' | 'erstattung'>('nachzahlung')

  const ergebnis = useMemo(() => {
    const betrag = richtung === 'nachzahlung' ? nachzahlung : erstattung

    // § 233a AO: Zinslauf beginnt 15 Monate nach Ablauf des Steuer-Kalenderjahres
    // Seit 2019: 0,15% pro Monat (§ 238 Abs. 1a AO)
    const karenzMonate = 15
    const zinsMonate = Math.max(monate - karenzMonate, 0)
    const volleMonate = Math.floor(zinsMonate)

    const zinsProMonat = betrag * zinssatz / 100
    const zinsenGesamt = Math.round(volleMonate * zinsProMonat)
    const zinsenJahr = Math.round(12 * zinsProMonat)

    // § 233a AO: Erstattungszinsen sind steuerpflichtig (§ 20 Abs. 1 Nr. 7 EStG)
    // Nachzahlungszinsen sind NICHT als Sonderausgabe absetzbar
    const steuerpflichtig = richtung === 'erstattung'
    const steuerAufZinsen = steuerpflichtig ? Math.round(zinsenGesamt * 0.26375) : 0

    // Chart: Zinsverlauf
    const chartData = Array.from({ length: Math.max(monate + 1, 25) }, (_, i) => {
      const m = i
      const zm = Math.max(m - karenzMonate, 0)
      const vm = Math.floor(zm)
      return {
        monat: m,
        zinsen: Math.round(vm * zinsProMonat),
        betrag,
      }
    })

    return {
      betrag,
      zinsMonate: volleMonate,
      zinsProMonat: Math.round(zinsProMonat * 100) / 100,
      zinsenGesamt,
      zinsenJahr,
      steuerpflichtig,
      steuerAufZinsen,
      nettoZinsen: zinsenGesamt - steuerAufZinsen,
      chartData,
    }
  }, [nachzahlung, erstattung, monate, zinssatz, richtung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Percent className="h-6 w-6 text-primary" />
          Steuerzinsen-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Nachzahlungs- & Erstattungszinsen – § 233a AO
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Zinssatz:</strong> Seit 2019: <strong>0,15%/Monat</strong> (1,8%/Jahr) – § 238 Abs. 1a AO (BVerfG-Urteil 2021).</p>
              <p><strong>Karenzzeit:</strong> Zinslauf beginnt <strong>15 Monate</strong> nach Ablauf des Steuerjahres (bei Steuerberatung: 23 Monate).</p>
              <p><strong>Erstattungszinsen:</strong> Steuerpflichtig als Einkuenfte aus Kapitalvermoegen (§ 20 Abs. 1 Nr. 7 EStG).</p>
              <p><strong>Nachzahlungszinsen:</strong> <strong>Nicht</strong> als Sonderausgabe absetzbar.</p>
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
              <p className="text-sm font-medium mb-1">Art</p>
              <div className="flex gap-2">
                {([['nachzahlung', 'Nachzahlung'], ['erstattung', 'Erstattung']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setRichtung(key)} className={`rounded-md px-4 py-2 text-sm ${richtung === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                {richtung === 'nachzahlung' ? 'Nachzahlungsbetrag' : 'Erstattungsbetrag'}: {(richtung === 'nachzahlung' ? nachzahlung : erstattung).toLocaleString('de-DE')} EUR
              </label>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={richtung === 'nachzahlung' ? nachzahlung : erstattung}
                onChange={e => richtung === 'nachzahlung' ? setNachzahlung(+e.target.value) : setErstattung(+e.target.value)}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Monate seit Steuer-Jahresende: {monate}</label>
              <input type="range" min={0} max={60} value={monate} onChange={e => setMonate(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">
                Karenzzeit: 15 Monate. Verzinsung ab Monat 16. Aktuell: {ergebnis.zinsMonate} Zinsmonate.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Zinssatz: {zinssatz}% / Monat</label>
              <input type="range" min={0.05} max={0.5} step={0.01} value={zinssatz} onChange={e => setZinssatz(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Gesetzlich seit 2019: 0,15%/Monat = 1,8%/Jahr</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className={`rounded-lg p-4 text-center ${richtung === 'nachzahlung' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <p className={`text-2xl font-bold ${richtung === 'nachzahlung' ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                  {ergebnis.zinsenGesamt.toLocaleString('de-DE')} EUR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {richtung === 'nachzahlung' ? 'Nachzahlungszinsen' : 'Erstattungszinsen'}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.zinsMonate}</p>
                <p className="text-xs text-muted-foreground mt-1">Zinsmonate</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Ausgangsbetrag</span>
                <span className="font-medium">{ergebnis.betrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zinssatz</span>
                <span className="font-medium">{zinssatz}%/Monat ({(zinssatz * 12).toFixed(2)}%/Jahr)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zinsen/Monat</span>
                <span className="font-medium">{ergebnis.zinsProMonat.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zinsmonate (nach Karenz)</span>
                <span className="font-medium">{ergebnis.zinsMonate} Monate</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-bold">
                <span>Zinsen gesamt</span>
                <span className={richtung === 'nachzahlung' ? 'text-red-600' : 'text-green-600'}>
                  {ergebnis.zinsenGesamt.toLocaleString('de-DE')} EUR
                </span>
              </div>
              {ergebnis.steuerpflichtig && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Steuer auf Erstattungszinsen (26,375%)</span>
                    <span className="font-medium text-red-600">-{ergebnis.steuerAufZinsen.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold">
                    <span>Netto-Erstattungszinsen</span>
                    <span className="text-primary">{ergebnis.nettoZinsen.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zinsverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monat" tick={{ fontSize: 11 }} tickFormatter={v => `${v} M`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} labelFormatter={v => `Monat ${v}`} />
                <Legend />
                <Area type="monotone" dataKey="zinsen" name="Kumulierte Zinsen" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Verzinsung beginnt nach 15 Monaten Karenzzeit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerliche Behandlung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
              <p className="font-medium text-red-700 dark:text-red-400 mb-1">Nachzahlungszinsen</p>
              <p className="text-muted-foreground">Nicht absetzbar. Weder als Sonderausgabe noch als Werbungskosten.</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="font-medium text-green-700 dark:text-green-400 mb-1">Erstattungszinsen</p>
              <p className="text-muted-foreground">Steuerpflichtig als Kapitaleinkuenfte (§ 20 Abs. 1 Nr. 7 EStG). Abgeltungsteuer 26,375%.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
