import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { HeartPulse, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PflegegradConfig {
  grad: number
  label: string
  pflegegeld: number
  sachleistung: number
  tages_nacht: number
  kurzzeitpflege: number
  verhinderungspflege: number
  entlastung: number
  pflegehilfsmittel: number
}

const PFLEGEGRADE: PflegegradConfig[] = [
  { grad: 1, label: 'Pflegegrad 1', pflegegeld: 0, sachleistung: 0, tages_nacht: 0, kurzzeitpflege: 0, verhinderungspflege: 0, entlastung: 125, pflegehilfsmittel: 40 },
  { grad: 2, label: 'Pflegegrad 2', pflegegeld: 332, sachleistung: 761, tages_nacht: 689, kurzzeitpflege: 1774, verhinderungspflege: 1612, entlastung: 125, pflegehilfsmittel: 40 },
  { grad: 3, label: 'Pflegegrad 3', pflegegeld: 573, sachleistung: 1432, tages_nacht: 1298, kurzzeitpflege: 1774, verhinderungspflege: 1612, entlastung: 125, pflegehilfsmittel: 40 },
  { grad: 4, label: 'Pflegegrad 4', pflegegeld: 765, sachleistung: 1778, tages_nacht: 1612, kurzzeitpflege: 1774, verhinderungspflege: 1612, entlastung: 125, pflegehilfsmittel: 40 },
  { grad: 5, label: 'Pflegegrad 5', pflegegeld: 947, sachleistung: 2200, tages_nacht: 1995, kurzzeitpflege: 1774, verhinderungspflege: 1612, entlastung: 125, pflegehilfsmittel: 40 },
]

export default function HaeuslichesPflegegeldPage() {
  const [pflegegrad, setPflegegrad] = useState(3)
  const [kombinationsleistung, setKombinationsleistung] = useState(0)
  const [kurzzeitpflegeTage, setKurzzeitpflegeTage] = useState(0)
  const [verhinderungspflegeTage, setVerhinderungspflegeTage] = useState(0)
  const [tagesNachtpflege, setTagesNachtpflege] = useState(false)

  const ergebnis = useMemo(() => {
    const config = PFLEGEGRADE[pflegegrad - 1]

    // Kombinationsleistung: anteiliges Pflegegeld
    const sachleistungsAnteil = kombinationsleistung / 100
    const pflegegeldAnteil = 1 - sachleistungsAnteil
    const sachleistungBetrag = Math.round(config.sachleistung * sachleistungsAnteil)
    const pflegegeldBetrag = Math.round(config.pflegegeld * pflegegeldAnteil)
    const kombinationSumme = sachleistungBetrag + pflegegeldBetrag

    // Kurzzeitpflege (max 8 Wochen = 56 Tage)
    const kurzzeitpflegeBetrag = kurzzeitpflegeTage > 0
      ? Math.min(Math.round(config.kurzzeitpflege * kurzzeitpflegeTage / 56), config.kurzzeitpflege)
      : 0

    // Verhinderungspflege (max 6 Wochen = 42 Tage)
    const verhinderungspflegeBetrag = verhinderungspflegeTage > 0
      ? Math.min(Math.round(config.verhinderungspflege * verhinderungspflegeTage / 42), config.verhinderungspflege)
      : 0

    // Tages-/Nachtpflege (zusaetzlich!)
    const tagesNachtBetrag = tagesNachtpflege ? config.tages_nacht : 0

    // Jaehrliche Zusammenfassung
    const jaehrlichPflegegeld = kombinationSumme * 12
    const jaehrlichTagesNacht = tagesNachtBetrag * 12
    const jaehrlichEntlastung = config.entlastung * 12
    const jaehrlichHilfsmittel = config.pflegehilfsmittel * 12
    const jaehrlichGesamt = jaehrlichPflegegeld + jaehrlichTagesNacht + jaehrlichEntlastung + jaehrlichHilfsmittel + kurzzeitpflegeBetrag + verhinderungspflegeBetrag

    return {
      config,
      sachleistungBetrag,
      pflegegeldBetrag,
      kombinationSumme,
      kurzzeitpflegeBetrag,
      verhinderungspflegeBetrag,
      tagesNachtBetrag,
      jaehrlichPflegegeld,
      jaehrlichTagesNacht,
      jaehrlichEntlastung,
      jaehrlichHilfsmittel,
      jaehrlichGesamt,
    }
  }, [pflegegrad, kombinationsleistung, kurzzeitpflegeTage, verhinderungspflegeTage, tagesNachtpflege])

  const chartData = PFLEGEGRADE.filter(p => p.grad >= 2).map(p => ({
    name: `PG ${p.grad}`,
    pflegegeld: p.pflegegeld,
    sachleistung: p.sachleistung,
    tagesNacht: p.tages_nacht,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-primary" />
          Pflegegeld & Pflegeleistungen
        </h1>
        <p className="text-muted-foreground mt-1">
          Leistungen der Pflegeversicherung – SGB XI
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Pflegegeld:</strong> Fuer selbst beschaffte Pflege (§ 37 SGB XI). Nicht steuerpflichtig.</p>
              <p><strong>Kombinationsleistung:</strong> Anteilig Sachleistung + Pflegegeld (§ 38 SGB XI).</p>
              <p><strong>Tages-/Nachtpflege:</strong> <strong>Zusaetzlich</strong> zum Pflegegeld (keine Anrechnung seit 2015).</p>
              <p><strong>Pflege-Pauschbetrag:</strong> 1.800 EUR (PG 4+5), 1.100 EUR (PG 3), 600 EUR (PG 2) steuerlich absetzbar.</p>
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
              <p className="text-sm font-medium mb-2">Pflegegrad</p>
              <div className="flex gap-2 flex-wrap">
                {PFLEGEGRADE.map(p => (
                  <button key={p.grad} onClick={() => setPflegegrad(p.grad)} className={`rounded-md px-4 py-2 text-sm ${pflegegrad === p.grad ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    PG {p.grad}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Sachleistungsanteil: {kombinationsleistung}%</label>
              <input type="range" min={0} max={100} value={kombinationsleistung} onChange={e => setKombinationsleistung(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">0% = nur Pflegegeld, 100% = nur Sachleistung</p>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={tagesNachtpflege} onChange={e => setTagesNachtpflege(e.target.checked)} className="accent-primary" />
              <label className="text-sm font-medium">Tages-/Nachtpflege nutzen</label>
            </div>

            <div>
              <label className="text-sm font-medium">Kurzzeitpflege: {kurzzeitpflegeTage} Tage</label>
              <input type="range" min={0} max={56} value={kurzzeitpflegeTage} onChange={e => setKurzzeitpflegeTage(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Max. 8 Wochen/Jahr, Budget: {ergebnis.config.kurzzeitpflege.toLocaleString('de-DE')} EUR</p>
            </div>

            <div>
              <label className="text-sm font-medium">Verhinderungspflege: {verhinderungspflegeTage} Tage</label>
              <input type="range" min={0} max={42} value={verhinderungspflegeTage} onChange={e => setVerhinderungspflegeTage(+e.target.value)} className="w-full accent-primary" />
              <p className="text-xs text-muted-foreground">Max. 6 Wochen/Jahr, Budget: {ergebnis.config.verhinderungspflege.toLocaleString('de-DE')} EUR</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Ergebnis – PG {pflegegrad}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.kombinationSumme.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Monatlich (Kombi)</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{ergebnis.jaehrlichGesamt.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Jaehrlich gesamt</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pflegegeld ({100 - kombinationsleistung}%)</span>
                <span className="font-medium">{ergebnis.pflegegeldBetrag.toLocaleString('de-DE')} EUR/M</span>
              </div>
              {kombinationsleistung > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Sachleistung ({kombinationsleistung}%)</span>
                  <span className="font-medium">{ergebnis.sachleistungBetrag.toLocaleString('de-DE')} EUR/M</span>
                </div>
              )}
              {tagesNachtpflege && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Tages-/Nachtpflege</span>
                  <span className="font-medium">{ergebnis.tagesNachtBetrag.toLocaleString('de-DE')} EUR/M</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Entlastungsbetrag</span>
                <span className="font-medium">{ergebnis.config.entlastung.toLocaleString('de-DE')} EUR/M</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Pflegehilfsmittel</span>
                <span className="font-medium">{ergebnis.config.pflegehilfsmittel.toLocaleString('de-DE')} EUR/M</span>
              </div>
              {kurzzeitpflegeTage > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Kurzzeitpflege ({kurzzeitpflegeTage} Tage)</span>
                  <span className="font-medium">{ergebnis.kurzzeitpflegeBetrag.toLocaleString('de-DE')} EUR/Jahr</span>
                </div>
              )}
              {verhinderungspflegeTage > 0 && (
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Verhinderungspflege ({verhinderungspflegeTage} Tage)</span>
                  <span className="font-medium">{ergebnis.verhinderungspflegeBetrag.toLocaleString('de-DE')} EUR/Jahr</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold">
                <span>Jaehrlich gesamt</span>
                <span className="text-primary">{ergebnis.jaehrlichGesamt.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leistungen nach Pflegegrad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v} EUR`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="pflegegeld" name="Pflegegeld" fill="#7c3aed" />
                <Bar dataKey="sachleistung" name="Sachleistung" fill="#22c55e" />
                <Bar dataKey="tagesNacht" name="Tages-/Nachtpflege" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pflege-Pauschbetrag (steuerlich)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className={`rounded-lg p-3 text-center ${pflegegrad === 2 ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
              <p className="text-lg font-bold">600 EUR</p>
              <p className="text-xs text-muted-foreground">Pflegegrad 2</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${pflegegrad === 3 ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
              <p className="text-lg font-bold">1.100 EUR</p>
              <p className="text-xs text-muted-foreground">Pflegegrad 3</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${pflegegrad >= 4 ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
              <p className="text-lg font-bold">1.800 EUR</p>
              <p className="text-xs text-muted-foreground">Pflegegrad 4 + 5</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
