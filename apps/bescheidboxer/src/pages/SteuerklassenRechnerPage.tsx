import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { UsersRound, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function calcLohnsteuerMonat(brutto: number, klasse: number, kirchensteuer: boolean, kistSatz: number): number {
  const jahresBrutto = brutto * 12

  // Vereinfachte Lohnsteuer-Berechnung
  let zvE = jahresBrutto

  // Werbungskosten-Pauschbetrag
  zvE -= 1230

  // Sonderausgaben-Pauschbetrag
  zvE -= klasse === 3 ? 72 : 36

  // Vorsorgepauschale (vereinfacht)
  zvE -= Math.round(jahresBrutto * 0.11)

  // Kinderfreibetrag (bei Klasse 1,2,3)
  // Klasse 2: Entlastungsbetrag Alleinerziehende
  if (klasse === 2) zvE -= 4260

  // Splitting bei Klasse 3
  if (klasse === 3) zvE = Math.round(zvE / 2)

  zvE = Math.max(zvE, 0)

  // EST Tarif 2025
  let est: number
  if (zvE <= 12084) est = 0
  else if (zvE <= 17005) {
    const y = (zvE - 12084) / 10000
    est = Math.round((922.98 * y + 1400) * y)
  } else if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    est = Math.round((181.19 * z + 2397) * z + 1025.38)
  } else if (zvE <= 277825) {
    est = Math.round(0.42 * zvE - 10394.14)
  } else {
    est = Math.round(0.45 * zvE - 18730.89)
  }

  // Splitting verdoppeln
  if (klasse === 3) est *= 2

  // Soli
  const soliFrei = klasse === 3 ? 36260 : 18130
  let soli = 0
  if (est > soliFrei) {
    soli = Math.round(est * 0.055)
  }

  // Kirchensteuer
  let kist = 0
  if (kirchensteuer) {
    kist = Math.round(est * kistSatz / 100)
  }

  return Math.round((est + soli + kist) / 12)
}

interface KlasseInfo {
  klasse: number
  label: string
  beschreibung: string
}

const KLASSEN: KlasseInfo[] = [
  { klasse: 1, label: 'Steuerklasse I', beschreibung: 'Ledig, geschieden, verwitwet' },
  { klasse: 2, label: 'Steuerklasse II', beschreibung: 'Alleinerziehend mit Kind' },
  { klasse: 3, label: 'Steuerklasse III', beschreibung: 'Verheiratet (Alleinverdiener)' },
  { klasse: 4, label: 'Steuerklasse IV', beschreibung: 'Verheiratet (beide aehnlich)' },
  { klasse: 5, label: 'Steuerklasse V', beschreibung: 'Verheiratet (Kombi mit III)' },
  { klasse: 6, label: 'Steuerklasse VI', beschreibung: 'Zweitjob / Nebenjob' },
]

export default function SteuerklassenRechnerPage() {
  const [bruttoMonat, setBruttoMonat] = useState(4500)
  const [bruttoPartner, setBruttoPartner] = useState(3000)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(9)
  const [verheiratet, setVerheiratet] = useState(true)

  const ergebnis = useMemo(() => {
    const kist = kirchensteuersatz

    // Alle Klassen durchrechnen
    const alleKlassen = [1, 2, 3, 4, 5, 6].map(kl => {
      const lst = calcLohnsteuerMonat(bruttoMonat, kl, kirchensteuer, kist)
      const netto = bruttoMonat - lst - Math.round(bruttoMonat * 0.2) // ca. 20% SV
      return { klasse: kl, lst, netto }
    })

    // Ehepaar-Kombinationen
    const kombination34 = {
      label: 'III/V',
      lst3: calcLohnsteuerMonat(bruttoMonat, 3, kirchensteuer, kist),
      lst5: calcLohnsteuerMonat(bruttoPartner, 5, kirchensteuer, kist),
      lstGesamt: 0,
    }
    kombination34.lstGesamt = kombination34.lst3 + kombination34.lst5

    const kombination44 = {
      label: 'IV/IV',
      lst1: calcLohnsteuerMonat(bruttoMonat, 4, kirchensteuer, kist),
      lst2: calcLohnsteuerMonat(bruttoPartner, 4, kirchensteuer, kist),
      lstGesamt: 0,
    }
    kombination44.lstGesamt = kombination44.lst1 + kombination44.lst2

    const kombination53 = {
      label: 'V/III',
      lst5: calcLohnsteuerMonat(bruttoMonat, 5, kirchensteuer, kist),
      lst3: calcLohnsteuerMonat(bruttoPartner, 3, kirchensteuer, kist),
      lstGesamt: 0,
    }
    kombination53.lstGesamt = kombination53.lst5 + kombination53.lst3

    // Optimale Kombination
    const kombinationen = [
      { label: 'III / V', gesamt: kombination34.lstGesamt, p1: kombination34.lst3, p2: kombination34.lst5 },
      { label: 'IV / IV', gesamt: kombination44.lstGesamt, p1: kombination44.lst1, p2: kombination44.lst2 },
      { label: 'V / III', gesamt: kombination53.lstGesamt, p1: kombination53.lst5, p2: kombination53.lst3 },
    ]
    const optimal = kombinationen.reduce((best, k) => k.gesamt < best.gesamt ? k : best)

    // Chart
    const chartData = kombinationen.map(k => ({
      name: k.label,
      partner1: k.p1,
      partner2: k.p2,
    }))

    return { alleKlassen, kombinationen, optimal, chartData }
  }, [bruttoMonat, bruttoPartner, kirchensteuer, kirchensteuersatz, verheiratet])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          Steuerklassen-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Lohnsteuer pro Steuerklasse berechnen – optimale Kombination finden
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Steuerklassen I-VI:</strong> Bestimmen die monatliche Lohnsteuer-Hoehe (Vorauszahlung). Endabrechnung ueber die Steuererklaerung.</p>
              <p><strong>Ehepaare:</strong> Kombination <strong>III/V</strong> bei grossem Gehaltsunterschied, <strong>IV/IV</strong> bei aehnlichem Gehalt.</p>
              <p><strong>IV mit Faktor:</strong> Seit 2010 moeglich – genauere Verteilung, weniger Nachzahlung.</p>
              <p><strong>Tipp:</strong> Die Steuerklasse aendert nur die <strong>monatliche Vorauszahlung</strong>, nicht die Jahressteuerlast!</p>
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
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={verheiratet} onChange={e => setVerheiratet(e.target.checked)} className="accent-primary" />
              <label className="text-sm font-medium">Verheiratet / eingetragene Lebenspartnerschaft</label>
            </div>

            <div>
              <label className="text-sm font-medium">Brutto/Monat (Person 1): {bruttoMonat.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1500} max={15000} step={100} value={bruttoMonat} onChange={e => setBruttoMonat(+e.target.value)} className="w-full accent-primary" />
            </div>

            {verheiratet && (
              <div>
                <label className="text-sm font-medium">Brutto/Monat (Person 2): {bruttoPartner.toLocaleString('de-DE')} EUR</label>
                <input type="range" min={0} max={15000} step={100} value={bruttoPartner} onChange={e => setBruttoPartner(+e.target.value)} className="w-full accent-primary" />
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
                Kirchensteuer
              </label>
              {kirchensteuer && (
                <div className="flex gap-2">
                  {([8, 9] as const).map(v => (
                    <button key={v} onClick={() => setKirchensteuersatz(v)} className={`rounded-md px-3 py-1 text-sm ${kirchensteuersatz === v ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {v}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {verheiratet ? (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Optimale Kombination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center mb-4">
                <p className="text-xs text-muted-foreground mb-1">Empfohlen</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.optimal.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Lohnsteuer gesamt: {ergebnis.optimal.gesamt.toLocaleString('de-DE')} EUR/M
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {ergebnis.kombinationen.map(k => (
                  <div key={k.label} className={`flex justify-between py-2 px-3 rounded-lg ${k.label === ergebnis.optimal.label ? 'bg-primary/10 ring-1 ring-primary' : 'border'}`}>
                    <span className="font-medium">{k.label}</span>
                    <div className="text-right">
                      <span className="font-bold">{k.gesamt.toLocaleString('de-DE')} EUR</span>
                      <span className="text-xs text-muted-foreground ml-2">({k.p1.toLocaleString('de-DE')} + {k.p2.toLocaleString('de-DE')})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Lohnsteuer pro Klasse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {ergebnis.alleKlassen.filter(k => [1, 2, 6].includes(k.klasse)).map(k => (
                  <div key={k.klasse} className="flex justify-between py-2 px-3 rounded-lg border">
                    <span className="font-medium">Klasse {k.klasse}</span>
                    <div className="text-right">
                      <span className="font-bold">{k.lst.toLocaleString('de-DE')} EUR</span>
                      <span className="text-xs text-muted-foreground ml-2">(netto ca. {k.netto.toLocaleString('de-DE')})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {verheiratet && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vergleich Steuerklassen-Kombinationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ergebnis.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR/Monat`} />
                  <Legend />
                  <Bar dataKey="partner1" name="Person 1" fill="#7c3aed" />
                  <Bar dataKey="partner2" name="Person 2" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Steuerklassen im Ueberblick</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            {KLASSEN.map(k => (
              <div key={k.klasse} className="rounded-lg bg-muted p-3">
                <p className="font-medium">{k.label}</p>
                <p className="text-xs text-muted-foreground">{k.beschreibung}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
