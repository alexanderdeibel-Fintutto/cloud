import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Banknote, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    return Math.round((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.round((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10394.14)
  }
  return Math.round(0.45 * zvE - 18730.89)
}

export default function NebentaetigkeitPage() {
  const [haupteinkommen, setHaupteinkommen] = useState(45000)
  const [nebeneinnahmen, setNebeneinnahmen] = useState(8000)
  const [nebenart, setNebenart] = useState<'gewerblich' | 'freiberuflich' | 'uebungsleiter' | 'ehrenamt' | 'vermietung'>('freiberuflich')
  const [betriebsausgaben, setBetriebsausgaben] = useState(1500)
  const [kirchensteuer, setKirchensteuer] = useState(false)

  const ergebnis = useMemo(() => {
    // Freibetraege
    const uebungsleiterpauschale = nebenart === 'uebungsleiter' ? 3000 : 0
    const ehrenamtspauschale = nebenart === 'ehrenamt' ? 840 : 0
    const freibetrag = uebungsleiterpauschale + ehrenamtspauschale

    // Gewinn aus Nebentaetigkeit
    const gewinnBrutto = nebeneinnahmen - betriebsausgaben
    const gewinnNachFreibetrag = Math.max(gewinnBrutto - freibetrag, 0)

    // Gewerbesteuer bei gewerblicher Taetigkeit
    const gewerbeStFreibetrag = 24500
    const istGewerbe = nebenart === 'gewerblich'
    const gewst = istGewerbe ? Math.round(Math.max(gewinnNachFreibetrag - gewerbeStFreibetrag, 0) * 0.035 * 400 / 100) : 0

    // ESt ohne Nebeneinkuenfte
    const estOhne = calcESt(haupteinkommen)

    // ESt mit Nebeneinkuenften
    const zvEMit = haupteinkommen + gewinnNachFreibetrag
    const estMit = calcESt(zvEMit)

    // Mehrsteuerlast
    const mehrsteuer = estMit - estOhne
    const gewstAnrechnung = istGewerbe ? Math.min(gewst, Math.round(Math.max(gewinnNachFreibetrag - gewerbeStFreibetrag, 0) * 0.035 * 4.0)) : 0
    const estEffektiv = mehrsteuer - gewstAnrechnung

    // Soli
    const soliOhne = estOhne > 18130 ? Math.round(estOhne * 0.055) : 0
    const soliMit = estMit > 18130 ? Math.round(estMit * 0.055) : 0
    const mehrSoli = soliMit - soliOhne

    // KiSt
    const mehrKist = kirchensteuer ? Math.round(mehrsteuer * 0.09) : 0

    const steuerGesamt = estEffektiv + mehrSoli + mehrKist + gewst
    const nettoNeben = gewinnBrutto - steuerGesamt
    const effektiverSteuersatz = gewinnBrutto > 0 ? Math.round(steuerGesamt / gewinnBrutto * 10000) / 100 : 0

    // Grenzsteuersatz auf Nebeneinkuenfte
    const grenzsteuersatz = gewinnNachFreibetrag > 0 ? Math.round(mehrsteuer / gewinnNachFreibetrag * 100) : 0

    // Freigrenze Hardship § 46 Abs. 2 Nr. 1 EStG
    const veranlagungspflichtig = gewinnNachFreibetrag > 410

    // Chart
    const chartData = Array.from({ length: 11 }, (_, i) => {
      const neben = i * 2000
      const gew = Math.max(neben - betriebsausgaben - freibetrag, 0)
      const estM = calcESt(haupteinkommen + gew)
      const mehr = estM - estOhne
      return {
        nebeneinkuenfte: neben,
        mehrsteuer: mehr,
        netto: Math.max(neben - betriebsausgaben - mehr, 0),
      }
    })

    return {
      gewinnBrutto,
      freibetrag,
      gewinnNachFreibetrag,
      gewst,
      gewstAnrechnung,
      estOhne,
      estMit,
      mehrsteuer,
      estEffektiv,
      mehrSoli,
      mehrKist,
      steuerGesamt,
      nettoNeben,
      effektiverSteuersatz,
      grenzsteuersatz,
      veranlagungspflichtig,
      chartData,
    }
  }, [haupteinkommen, nebeneinnahmen, nebenart, betriebsausgaben, kirchensteuer])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Nebentaetigkeit
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuerlast auf Nebeneinkuenfte berechnen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Uebungsleiterpauschale (§ 3 Nr. 26):</strong> <strong>3.000 EUR/Jahr</strong> steuerfrei fuer nebenberufliche Taetigkeit als Trainer, Dozent etc.</p>
              <p><strong>Ehrenamtspauschale (§ 3 Nr. 26a):</strong> <strong>840 EUR/Jahr</strong> steuerfrei fuer gemeinnuetzige Taetigkeit.</p>
              <p><strong>Haerteausgleich (§ 46 Abs. 3):</strong> Nebeneinkuenfte bis <strong>410 EUR</strong> steuerfrei, 410–820 EUR teilweise.</p>
              <p><strong>Gewerbesteuer:</strong> Nur bei gewerblicher Taetigkeit, Freibetrag 24.500 EUR.</p>
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
              <label className="text-sm font-medium">Haupteinkommen (zvE): {haupteinkommen.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={150000} step={1000} value={haupteinkommen} onChange={e => setHaupteinkommen(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Art der Nebentaetigkeit</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { key: 'freiberuflich', label: 'Freiberuflich' },
                  { key: 'gewerblich', label: 'Gewerblich' },
                  { key: 'uebungsleiter', label: 'Uebungsleiter' },
                  { key: 'ehrenamt', label: 'Ehrenamt' },
                ] as const).map(a => (
                  <button key={a.key} onClick={() => setNebenart(a.key)} className={`rounded-md px-3 py-1.5 text-xs ${nebenart === a.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Nebeneinnahmen: {nebeneinnahmen.toLocaleString('de-DE')} EUR/Jahr</label>
              <input type="range" min={0} max={50000} step={500} value={nebeneinnahmen} onChange={e => setNebeneinnahmen(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Betriebsausgaben: {betriebsausgaben.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={20000} step={100} value={betriebsausgaben} onChange={e => setBetriebsausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer (9%)
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoNeben.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto Nebeneinkuenfte</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Mehrsteuer gesamt</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Nebeneinnahmen</span>
                <span className="font-medium">{nebeneinnahmen.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Betriebsausgaben</span>
                <span className="font-medium text-red-600">-{betriebsausgaben.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.freibetrag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Freibetrag</span>
                  <span className="font-medium text-green-600">-{ergebnis.freibetrag.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span>Steuerpflichtiger Gewinn</span>
                <span>{ergebnis.gewinnNachFreibetrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">ESt-Mehrbelastung</span>
                <span className="font-medium">{ergebnis.estEffektiv.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.gewst > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Gewerbesteuer</span>
                  <span className="font-medium">{ergebnis.gewst.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.mehrSoli > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Mehr-Soli</span>
                  <span className="font-medium">{ergebnis.mehrSoli.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.mehrKist > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Mehr-KiSt</span>
                  <span className="font-medium">{ergebnis.mehrKist.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grenzsteuersatz</span>
                <span className="font-medium">{ergebnis.grenzsteuersatz}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Effektiver Steuersatz</span>
                <span className="font-medium">{ergebnis.effektiverSteuersatz.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Veranlagungspflicht</span>
                <span className={`font-medium ${ergebnis.veranlagungspflichtig ? 'text-orange-600' : 'text-green-600'}`}>
                  {ergebnis.veranlagungspflichtig ? 'Ja (> 410 EUR)' : 'Nein'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Netto bei steigenden Nebeneinkuenften</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nebeneinkuenfte" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="netto" name="Netto" fill="#22c55e" />
                <Bar dataKey="mehrsteuer" name="Mehrsteuer" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
