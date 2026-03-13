import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Briefcase, Info } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

export default function MidijobRechnerPage() {
  const [brutto, setBrutto] = useState(1200)
  const [steuerklasse, setSteuerklasse] = useState(1)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kinderlos, setKinderlos] = useState(true)
  const [bundeslandOst, setBundeslandOst] = useState(false)

  const ergebnis = useMemo(() => {
    // Übergangsbereich (Midijob): 538,01 - 2.000 EUR
    const untergrenze = 538.01
    const obergrenze = 2000

    const imUebergangsbereich = brutto >= untergrenze && brutto <= obergrenze

    // Faktor F 2025: 0,6846
    const F = 0.6846

    // Beitragsbemessungsgrundlage im Übergangsbereich
    // Formel: F × 538 + (obergrenze / (obergrenze - 538)) × (AE - 538)
    // Vereinfachte Formel für beitragspflichtiges Entgelt
    let beitragsEntgelt: number
    if (imUebergangsbereich) {
      beitragsEntgelt = F * 538 + ((obergrenze - 538 * F) / (obergrenze - 538)) * (brutto - 538)
      beitragsEntgelt = Math.round(beitragsEntgelt * 100) / 100
    } else {
      beitragsEntgelt = brutto
    }

    // SV-Beitragssätze 2025
    const kvSatz = 14.6 // + Zusatzbeitrag
    const kvZusatz = 1.7
    const rvSatz = 18.6
    const avSatz = 2.6
    const pvSatz = kinderlos ? 4.0 : 3.4

    const svGesamtSatz = kvSatz + kvZusatz + rvSatz + avSatz + pvSatz

    // Arbeitnehmer-Anteil im Übergangsbereich
    let anSV: number
    if (imUebergangsbereich) {
      // AN zahlt: Gesamtbeitrag auf beitragspflichtiges Entgelt - AG-Anteil auf tatsächliches Brutto
      const gesamtBeitrag = Math.round(beitragsEntgelt * svGesamtSatz / 100 * 100) / 100
      const agAnteil = Math.round(brutto * svGesamtSatz / 2 / 100 * 100) / 100
      anSV = Math.round((gesamtBeitrag - agAnteil) * 100) / 100
    } else if (brutto <= 538) {
      // Minijob: AN zahlt keine SV
      anSV = 0
    } else {
      // Regulär: 50/50
      anSV = Math.round(brutto * svGesamtSatz / 2 / 100 * 100) / 100
    }

    // Lohnsteuer (vereinfacht)
    const jahresBrutto = brutto * 12
    const wk = 1230
    const sonderausgaben = 36
    const vorsorge = Math.round(anSV * 12)
    const zvE = Math.max(jahresBrutto - wk - sonderausgaben - vorsorge, 0)

    let lst = 0
    if (zvE > 12084) {
      if (zvE <= 17005) {
        const y = (zvE - 12084) / 10000
        lst = Math.round((922.98 * y + 1400) * y)
      } else if (zvE <= 66760) {
        const z = (zvE - 17005) / 10000
        lst = Math.round((181.19 * z + 2397) * z + 1025.38)
      } else if (zvE <= 277825) {
        lst = Math.round(0.42 * zvE - 10394.14)
      } else {
        lst = Math.round(0.45 * zvE - 18730.89)
      }
    }

    // Steuerklasse-Faktor (vereinfacht)
    const stklFaktor = steuerklasse === 3 ? 0.6 : steuerklasse === 5 ? 1.5 : steuerklasse === 6 ? 1.6 : 1
    lst = Math.round(lst * stklFaktor)
    const lstMonat = Math.round(lst / 12)

    const soli = lst > 18130 ? Math.round(lst * 0.055 / 12) : 0
    const kist = kirchensteuer ? Math.round(lstMonat * 0.09) : 0

    const abzuege = anSV + lstMonat + soli + kist
    const netto = Math.round((brutto - abzuege) * 100) / 100

    // SV-Ersparnis gegenüber regulärer Beschäftigung
    const regulaerSV = Math.round(brutto * svGesamtSatz / 2 / 100 * 100) / 100
    const svErsparnis = imUebergangsbereich ? Math.round((regulaerSV - anSV) * 100) / 100 : 0

    // Einzelne SV-Beiträge AN
    const kvAN = imUebergangsbereich
      ? Math.round(anSV * (kvSatz + kvZusatz) / svGesamtSatz * 100) / 100
      : Math.round(brutto * (kvSatz + kvZusatz) / 2 / 100 * 100) / 100
    const rvAN = imUebergangsbereich
      ? Math.round(anSV * rvSatz / svGesamtSatz * 100) / 100
      : Math.round(brutto * rvSatz / 2 / 100 * 100) / 100
    const avAN = imUebergangsbereich
      ? Math.round(anSV * avSatz / svGesamtSatz * 100) / 100
      : Math.round(brutto * avSatz / 2 / 100 * 100) / 100
    const pvAN = imUebergangsbereich
      ? Math.round(anSV * pvSatz / svGesamtSatz * 100) / 100
      : Math.round(brutto * pvSatz / 2 / 100 * 100) / 100

    // Chart: Netto-Verlauf von 538 bis 2500
    const chartData = Array.from({ length: 40 }, (_, i) => {
      const b = 538 + i * 50
      const im = b >= untergrenze && b <= obergrenze
      let be: number
      if (im) {
        be = F * 538 + ((obergrenze - 538 * F) / (obergrenze - 538)) * (b - 538)
      } else {
        be = b
      }
      const sv = im
        ? Math.round((be * svGesamtSatz / 100 - b * svGesamtSatz / 2 / 100) * 100) / 100
        : Math.round(b * svGesamtSatz / 2 / 100 * 100) / 100
      const n = Math.round((b - sv) * 100) / 100
      return {
        brutto: b,
        netto: n,
        svAN: sv,
      }
    })

    return {
      imUebergangsbereich,
      beitragsEntgelt,
      anSV,
      regulaerSV,
      svErsparnis,
      kvAN,
      rvAN,
      avAN,
      pvAN,
      lstMonat,
      soli,
      kist,
      abzuege,
      netto,
      svGesamtSatz,
      chartData,
    }
  }, [brutto, steuerklasse, kirchensteuer, kinderlos, bundeslandOst])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Midijob-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Übergangsbereich 538,01–2.000 EUR – § 20 Abs. 2 SGB IV
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Übergangsbereich:</strong> Brutto zwischen <strong>538,01 EUR</strong> und <strong>2.000 EUR</strong> (seit 01.01.2024).</p>
              <p><strong>Vorteil:</strong> Reduzierte AN-Sozialversicherungsbeitraege bei <strong>vollen Leistungsanspruechen</strong> (RV, KV, PV, AV).</p>
              <p><strong>Faktor F 2025:</strong> 0,6846 – bestimmt das beitragspflichtige Entgelt.</p>
              <p><strong>Abgrenzung:</strong> Minijob bis 538 EUR (pauschal, keine eigenen SV) | Midijob 538,01–2.000 EUR | Regulaer ab 2.000,01 EUR.</p>
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
              <label className="text-sm font-medium">Bruttogehalt: {brutto.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={400} max={2500} step={10} value={brutto} onChange={e => setBrutto(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Minijob</span>
                <span className="text-primary font-medium">Übergangsbereich</span>
                <span>Regulaer</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Steuerklasse</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map(k => (
                  <button key={k} onClick={() => setSteuerklasse(k)} className={`rounded-md px-4 py-2 text-sm ${steuerklasse === k ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer (9%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kinderlos} onChange={e => setKinderlos(e.target.checked)} className="accent-primary" />
                Kinderlos ueber 23 (PV-Zuschlag +0,6%)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={bundeslandOst} onChange={e => setBundeslandOst(e.target.checked)} className="accent-primary" />
                Neue Bundeslaender
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Badge */}
            <div className="mb-4 text-center">
              <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium ${
                brutto <= 538
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : ergebnis.imUebergangsbereich
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {brutto <= 538 ? 'Minijob (bis 538 EUR)' : ergebnis.imUebergangsbereich ? 'Übergangsbereich (Midijob)' : 'Regulaere Beschaeftigung'}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.netto.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto/Monat</p>
              </div>
              {ergebnis.imUebergangsbereich && (
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.svErsparnis.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">SV-Ersparnis/Monat</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Brutto</span>
                <span className="font-medium">{brutto.toLocaleString('de-DE')} EUR</span>
              </div>
              {ergebnis.imUebergangsbereich && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Beitragspflichtiges Entgelt</span>
                  <span className="font-medium">{ergebnis.beitragsEntgelt.toLocaleString('de-DE')} EUR</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">KV + Zusatzbeitrag</span>
                <span className="font-medium">-{ergebnis.kvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Rentenversicherung</span>
                <span className="font-medium">-{ergebnis.rvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Arbeitslosenversicherung</span>
                <span className="font-medium">-{ergebnis.avAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pflegeversicherung</span>
                <span className="font-medium">-{ergebnis.pvAN.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b font-medium">
                <span className="text-muted-foreground">SV gesamt (AN)</span>
                <span className="text-red-600">-{ergebnis.anSV.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Lohnsteuer</span>
                <span className="font-medium">-{ergebnis.lstMonat.toLocaleString('de-DE')} EUR</span>
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
              <div className="flex justify-between py-1.5 font-bold text-lg">
                <span>Netto</span>
                <span className="text-primary">{ergebnis.netto.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Netto-Verlauf im Übergangsbereich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brutto" tick={{ fontSize: 10 }} tickFormatter={v => `${v}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} labelFormatter={v => `Brutto: ${Number(v).toLocaleString('de-DE')} EUR`} />
                <Legend />
                <ReferenceLine x={538} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '538', fontSize: 10 }} />
                <ReferenceLine x={2000} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '2.000', fontSize: 10 }} />
                <Area type="monotone" dataKey="netto" name="Netto" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                <Area type="monotone" dataKey="svAN" name="SV (AN)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleich: Minijob vs. Midijob vs. Regulaer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-3 text-center">
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">Minijob</p>
              <p className="text-xs text-muted-foreground">Bis 538 EUR</p>
              <p className="text-xs mt-1">Pauschal-SV durch AG</p>
              <p className="text-xs">Keine LSt (pauschal 2%)</p>
              <p className="text-xs">RV optional (Aufstockung)</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">Midijob</p>
              <p className="text-xs text-muted-foreground">538,01–2.000 EUR</p>
              <p className="text-xs mt-1">Reduzierte AN-SV</p>
              <p className="text-xs">Volle Leistungsansprueche</p>
              <p className="text-xs">Gleitender Uebergang</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">Regulaer</p>
              <p className="text-xs text-muted-foreground">Ab 2.000,01 EUR</p>
              <p className="text-xs mt-1">Volle SV-Beitraege 50/50</p>
              <p className="text-xs">Volle Leistungsansprueche</p>
              <p className="text-xs">Regulaere Besteuerung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
