import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Landmark, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

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

// Besteuerungsanteil nach Renteneintritt (§ 22 Nr. 1a EStG)
const BESTEUERUNGSANTEIL: Record<number, number> = {
  2005: 50, 2006: 52, 2007: 54, 2008: 56, 2009: 58,
  2010: 60, 2011: 62, 2012: 64, 2013: 66, 2014: 68,
  2015: 70, 2016: 72, 2017: 74, 2018: 76, 2019: 78,
  2020: 80, 2021: 81, 2022: 82, 2023: 83, 2024: 84,
  2025: 83.5, 2026: 84, 2027: 84.5, 2028: 85, 2029: 85.5,
  2030: 86, 2031: 86.5, 2032: 87, 2033: 87.5, 2034: 88,
  2035: 88.5, 2036: 89, 2037: 89.5, 2038: 90, 2039: 90.5,
  2040: 91, 2041: 91.5, 2042: 92, 2043: 92.5, 2044: 93,
  2045: 93.5, 2046: 94, 2047: 94.5, 2048: 95, 2049: 95.5,
  2050: 96, 2051: 96.5, 2052: 97, 2053: 97.5, 2054: 98,
  2055: 98.5, 2056: 99, 2057: 99.5, 2058: 100,
}

export default function RentenbesteuerungPage() {
  const [renteMonat, setRenteMonat] = useState(1500)
  const [rentenbeginn, setRentenbeginn] = useState(2025)
  const [weitereEinkuenfte, setWeitereEinkuenfte] = useState(0)
  const [splitting, setSplitting] = useState(false)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kvBeitrag, setKvBeitrag] = useState(true)

  const ergebnis = useMemo(() => {
    const renteJahr = renteMonat * 12
    const besteuerungsanteil = BESTEUERUNGSANTEIL[rentenbeginn] || (rentenbeginn >= 2058 ? 100 : 50)
    const steuerpflichtigerAnteil = Math.round(renteJahr * besteuerungsanteil / 100)
    const steuerfreierAnteil = renteJahr - steuerpflichtigerAnteil

    // Werbungskosten-Pauschbetrag für Rentner
    const wkPauschale = 102

    // KV/PV-Beiträge auf Rente (Eigenanteil)
    const kvPvBeitrag = kvBeitrag ? Math.round(renteJahr * 0.081) : 0 // 7.3% KV + 0.8% PV (ca.)

    // zvE
    const einkuenfteGesamt = steuerpflichtigerAnteil + weitereEinkuenfte
    const sonderausgaben = 36
    const zvE = Math.max(einkuenfteGesamt - wkPauschale - sonderausgaben - kvPvBeitrag, 0)

    const zvESplit = splitting ? Math.round(zvE / 2) : zvE
    let est = calcESt(zvESplit)
    if (splitting) est *= 2

    const soliFrei = splitting ? 36260 : 18130
    const soli = est > soliFrei ? Math.round(est * 0.055) : 0
    const kist = kirchensteuer ? Math.round(est * 0.09) : 0
    const steuerGesamt = est + soli + kist

    const steuerMonat = Math.round(steuerGesamt / 12)
    const nettoMonat = renteMonat - steuerMonat - Math.round(kvPvBeitrag / 12)
    const effektiverSteuersatz = renteJahr > 0 ? Math.round(steuerGesamt / renteJahr * 10000) / 100 : 0

    // Chart: Besteuerungsanteil über die Jahre
    const chartData = Object.entries(BESTEUERUNGSANTEIL)
      .filter(([, v]) => v !== undefined)
      .map(([jahr, anteil]) => {
        const j = Number(jahr)
        const sp = Math.round(renteJahr * anteil / 100)
        const sf = renteJahr - sp
        return {
          jahr: j,
          steuerpflichtig: sp,
          steuerfrei: sf,
          anteil,
        }
      })
      .sort((a, b) => a.jahr - b.jahr)

    // Grundfreibetrag-Vergleich
    const grundfreibetrag = 12084
    const steuerpflichtigJahr = steuerpflichtigerAnteil - wkPauschale
    const steuerpflichtigNetto = steuerpflichtigJahr - kvPvBeitrag - sonderausgaben
    const unterGrundfreibetrag = steuerpflichtigNetto <= grundfreibetrag

    return {
      renteJahr,
      besteuerungsanteil,
      steuerpflichtigerAnteil,
      steuerfreierAnteil,
      wkPauschale,
      kvPvBeitrag,
      zvE,
      est,
      soli,
      kist,
      steuerGesamt,
      steuerMonat,
      nettoMonat,
      effektiverSteuersatz,
      chartData,
      grundfreibetrag,
      unterGrundfreibetrag,
    }
  }, [renteMonat, rentenbeginn, weitereEinkuenfte, splitting, kirchensteuer, kvBeitrag])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          Rentenbesteuerung
        </h1>
        <p className="text-muted-foreground mt-1">
          Nachgelagerte Besteuerung – § 22 Nr. 1a EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Nachgelagerte Besteuerung:</strong> Seit 2005 schrittweiser Uebergang zur vollen Besteuerung (ab 2058: 100%).</p>
              <p><strong>Besteuerungsanteil:</strong> Abhaengig vom <strong>Jahr des Rentenbeginns</strong>. Der steuerfreie Anteil wird als fester Eurobetrag festgeschrieben.</p>
              <p><strong>Grundfreibetrag 2025:</strong> 12.084 EUR – Renten darunter bleiben steuerfrei.</p>
              <p><strong>KV/PV:</strong> Rentner zahlen eigene Beitraege (ca. 8,1% Eigenanteil inkl. Zusatzbeitrag + PV).</p>
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
              <label className="text-sm font-medium">Monatliche Bruttorente: {renteMonat.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={500} max={4000} step={50} value={renteMonat} onChange={e => setRenteMonat(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-sm font-medium">Rentenbeginn: {rentenbeginn}</label>
              <input type="range" min={2005} max={2058} step={1} value={rentenbeginn} onChange={e => setRentenbeginn(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground mt-1">Besteuerungsanteil: {ergebnis.besteuerungsanteil}%</p>
            </div>

            <div>
              <label className="text-sm font-medium">Weitere Einkuenfte: {weitereEinkuenfte.toLocaleString('de-DE')} EUR/Jahr</label>
              <input type="range" min={0} max={30000} step={500} value={weitereEinkuenfte} onChange={e => setWeitereEinkuenfte(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">z.B. Betriebsrente, Mieteinnahmen, Kapitalertraege</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitting} onChange={e => setSplitting(e.target.checked)} className="accent-primary" />
                Zusammenveranlagung (Splitting)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kvBeitrag} onChange={e => setKvBeitrag(e.target.checked)} className="accent-primary" />
                GKV-Pflichtversicherung (KVdR)
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Grundfreibetrag-Hinweis */}
            {ergebnis.unterGrundfreibetrag && (
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 mb-4 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Rente bleibt unter dem Grundfreibetrag – keine Steuer!</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto-Rente/Monat</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.steuerMonat.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Steuer/Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Jahresrente (brutto)</span>
                <span className="font-medium">{ergebnis.renteJahr.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Besteuerungsanteil ({ergebnis.besteuerungsanteil}%)</span>
                <span className="font-medium">{ergebnis.steuerpflichtigerAnteil.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerfreier Anteil</span>
                <span className="font-medium text-green-600">{ergebnis.steuerfreierAnteil.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Werbungskosten-Pauschale</span>
                <span className="font-medium">-{ergebnis.wkPauschale.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.kvPvBeitrag > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">KV/PV-Eigenanteil</span>
                  <span className="font-medium">-{ergebnis.kvPvBeitrag.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zu versteuerndes Einkommen</span>
                <span className="font-medium">{ergebnis.zvE.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Einkommensteuer</span>
                <span className="font-medium">{ergebnis.est.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Solidaritaetszuschlag</span>
                  <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              {ergebnis.kist > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Kirchensteuer</span>
                  <span className="font-medium">{ergebnis.kist.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b font-bold">
                <span>Steuer gesamt/Jahr</span>
                <span className="text-red-600">{ergebnis.steuerGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Effektiver Steuersatz</span>
                <span className="font-medium">{ergebnis.effektiverSteuersatz.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Besteuerungsanteil nach Rentenbeginn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jahr" tick={{ fontSize: 10 }} tickFormatter={v => `${v}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v.toLocaleString('de-DE')} EUR`} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toLocaleString('de-DE')} EUR`, name === 'steuerpflichtig' ? 'Steuerpflichtig' : 'Steuerfrei']}
                  labelFormatter={v => `Rentenbeginn: ${v}`}
                />
                <Legend />
                <Area type="monotone" dataKey="steuerpflichtig" name="Steuerpflichtig" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} stackId="1" />
                <Area type="monotone" dataKey="steuerfrei" name="Steuerfrei" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Bei gleichbleibender Bruttorente von {renteMonat.toLocaleString('de-DE')} EUR/Monat
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rentenarten & Besteuerung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Gesetzliche Rente (§ 22 Nr. 1a)</p>
              <p className="text-xs text-muted-foreground mt-1">Nachgelagerte Besteuerung mit Besteuerungsanteil. Beitraege in Ansparphase abzugsfaehig.</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Betriebsrente (§ 22 Nr. 5)</p>
              <p className="text-xs text-muted-foreground mt-1">Voll steuerpflichtig als sonstige Einkuenfte. Ermaessigung nur bei Kapitalauszahlung (Fuenftelregelung).</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Riester-Rente (§ 22 Nr. 5)</p>
              <p className="text-xs text-muted-foreground mt-1">Voll steuerpflichtig (nachgelagert). Zulagen + Sonderausgabenabzug in Ansparphase.</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Private Rente (§ 22 Nr. 1b)</p>
              <p className="text-xs text-muted-foreground mt-1">Nur Ertragsanteil steuerpflichtig (z.B. 18% bei Beginn mit 65). Vorgelagerte Besteuerung.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
