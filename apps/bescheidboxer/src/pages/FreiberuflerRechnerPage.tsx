import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Briefcase, Info } from 'lucide-react'
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

export default function FreiberuflerRechnerPage() {
  const [umsatz, setUmsatz] = useState(80000)
  const [betriebsausgaben, setBetriebsausgaben] = useState(15000)
  const [vorsorge, setVorsorge] = useState(8000)
  const [sonderausgaben, setSonderausgaben] = useState(1000)
  const [istGewerbe, setIstGewerbe] = useState(false)
  const [gewerbeHebesatz, setGewerbeHebesatz] = useState(400)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [umsatzsteuerpflichtig, setUmsatzsteuerpflichtig] = useState(true)
  const [kleinunternehmer, setKleinunternehmer] = useState(false)

  const ergebnis = useMemo(() => {
    const gewinn = umsatz - betriebsausgaben
    const zvE = Math.max(gewinn - vorsorge - sonderausgaben, 0)

    // ESt
    const est = calcESt(zvE)

    // Soli
    const soli = est > 18130 ? Math.round(est * 0.055) : 0

    // KiSt
    const kist = kirchensteuer ? Math.round(est * 0.09) : 0

    // Gewerbesteuer
    let gewst = 0
    let gewstAnrechnung = 0
    if (istGewerbe) {
      const gewstMessbetrag = Math.max(gewinn - 24500, 0) * 0.035 // Freibetrag 24.500
      gewst = Math.round(gewstMessbetrag * gewerbeHebesatz / 100)
      // GewSt-Anrechnung: max. 4,0 × Messbetrag auf ESt
      gewstAnrechnung = Math.min(Math.round(gewstMessbetrag * 4.0), est)
    }

    const estNachAnrechnung = est - gewstAnrechnung
    const steuerGesamt = estNachAnrechnung + soli + kist + gewst

    // SV-Beiträge (Freiberufler: KV + PV selbst)
    const kvBeitrag = Math.round(Math.min(gewinn, 66150) * 0.146 / 2 + Math.min(gewinn, 66150) * 0.017 / 2) // Halber Satz + Zusatzbeitrag
    const pvBeitrag = Math.round(Math.min(gewinn, 66150) * 0.034 / 2)
    const rvFreiwillig = Math.round(Math.min(gewinn, 96600) * 0.186 / 2) // Optional

    const svGesamt = kvBeitrag + pvBeitrag
    const nettoVorSV = gewinn - steuerGesamt
    const nettoNachSV = nettoVorSV - svGesamt

    // USt
    const ustSatz = 19
    const ustBetrag = umsatzsteuerpflichtig && !kleinunternehmer ? Math.round(umsatz * ustSatz / (100 + ustSatz)) : 0
    const vorsteuer = umsatzsteuerpflichtig && !kleinunternehmer ? Math.round(betriebsausgaben * ustSatz / (100 + ustSatz)) : 0
    const ustZahllast = ustBetrag - vorsteuer

    // Effektiver Steuersatz
    const effSteuersatz = gewinn > 0 ? Math.round(steuerGesamt / gewinn * 10000) / 100 : 0

    // Chart
    const chartData = [
      { name: 'Umsatz', betrag: umsatz },
      { name: 'Ausgaben', betrag: -betriebsausgaben },
      { name: 'Gewinn', betrag: gewinn },
      { name: 'ESt', betrag: -estNachAnrechnung },
      { name: 'GewSt', betrag: -gewst },
      { name: 'SV', betrag: -svGesamt },
      { name: 'Netto', betrag: nettoNachSV },
    ]

    return {
      gewinn,
      zvE,
      est,
      estNachAnrechnung,
      soli,
      kist,
      gewst,
      gewstAnrechnung,
      steuerGesamt,
      kvBeitrag,
      pvBeitrag,
      rvFreiwillig,
      svGesamt,
      nettoVorSV,
      nettoNachSV,
      ustBetrag,
      vorsteuer,
      ustZahllast,
      effSteuersatz,
      chartData,
    }
  }, [umsatz, betriebsausgaben, vorsorge, sonderausgaben, istGewerbe, gewerbeHebesatz, kirchensteuer, umsatzsteuerpflichtig, kleinunternehmer])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Freiberufler-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Steuer- und Abgabenlast fuer Selbstaendige
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Freiberufler (§ 18 EStG):</strong> Keine Gewerbesteuer, keine IHK-Pflicht. Katalogberufe: Aerzte, Anwaelte, Architekten, Ingenieure, Kuenstler etc.</p>
              <p><strong>Gewerbetreibende (§ 15 EStG):</strong> Gewerbesteuer ab 24.500 EUR Freibetrag. Anrechnung auf ESt (Faktor 4,0).</p>
              <p><strong>Kleinunternehmer (§ 19 UStG):</strong> Bis 22.000 EUR Vorjahresumsatz keine USt, aber auch kein Vorsteuerabzug.</p>
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
              <label className="text-sm font-medium">Jahresumsatz (brutto): {umsatz.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={300000} step={5000} value={umsatz} onChange={e => setUmsatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Betriebsausgaben: {betriebsausgaben.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={100000} step={1000} value={betriebsausgaben} onChange={e => setBetriebsausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Vorsorgeaufwendungen: {vorsorge.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={27566} step={500} value={vorsorge} onChange={e => setVorsorge(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Sonderausgaben: {sonderausgaben.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={10000} step={100} value={sonderausgaben} onChange={e => setSonderausgaben(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={istGewerbe} onChange={e => setIstGewerbe(e.target.checked)} className="accent-primary" />
                Gewerbetreibend (nicht Freiberufler)
              </label>
              {istGewerbe && (
                <div>
                  <label className="text-sm font-medium">Hebesatz: {gewerbeHebesatz}%</label>
                  <input type="range" min={200} max={900} step={10} value={gewerbeHebesatz} onChange={e => setGewerbeHebesatz(+e.target.value)} className="w-full accent-primary" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kleinunternehmer} onChange={e => { setKleinunternehmer(e.target.checked); if (e.target.checked) setUmsatzsteuerpflichtig(false) }} className="accent-primary" />
                Kleinunternehmerregelung (§ 19 UStG)
              </label>
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
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoNachSV.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto nach Steuer + SV</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-2xl font-bold">{ergebnis.effSteuersatz.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Effektiver Steuersatz</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Umsatz</span>
                <span className="font-medium">{umsatz.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Betriebsausgaben</span>
                <span className="font-medium text-red-600">-{betriebsausgaben.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span>Gewinn</span>
                <span>{ergebnis.gewinn.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Einkommensteuer</span>
                <span className="font-medium">-{ergebnis.estNachAnrechnung.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Solidaritaetszuschlag</span>
                  <span className="font-medium">-{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.kist > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Kirchensteuer</span>
                  <span className="font-medium">-{ergebnis.kist.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {istGewerbe && (
                <>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Gewerbesteuer</span>
                    <span className="font-medium">-{ergebnis.gewst.toLocaleString('de-DE')} EUR</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">GewSt-Anrechnung</span>
                    <span className="font-medium text-green-600">+{ergebnis.gewstAnrechnung.toLocaleString('de-DE')} EUR</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span>Steuer gesamt</span>
                <span className="text-red-600">-{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KV-Beitrag (Eigenanteil)</span>
                <span className="font-medium">-{ergebnis.kvBeitrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">PV-Beitrag</span>
                <span className="font-medium">-{ergebnis.pvBeitrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-lg">
                <span>Netto</span>
                <span className="text-primary">{ergebnis.nettoNachSV.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 text-muted-foreground text-xs">
                <span>= monatlich</span>
                <span>{Math.round(ergebnis.nettoNachSV / 12).toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abgabenstruktur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="betrag" name="Betrag" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
