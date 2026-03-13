import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Landmark, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BetrieblicheAltersvorsorgePage() {
  const [bruttogehalt, setBruttogehalt] = useState(4000)
  const [beitragBAV, setBeitragBAV] = useState(300)
  const [agZuschuss, setAgZuschuss] = useState(45)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [kirchensteuer, setKirchensteuer] = useState(false)
  const [durchfuehrungsweg, setDurchfuehrungsweg] = useState<'direktversicherung' | 'pensionskasse' | 'pensionsfonds' | 'unterstuetzungskasse' | 'direktzusage'>('direktversicherung')

  const ergebnis = useMemo(() => {
    // BBG KV/PV 2025: 5.512,50 EUR/Monat
    // BBG RV/AV 2025: 8.050 EUR/Monat (West)
    const bbgKVPV = 5512.50
    const bbgRVAV = 8050

    // Steuerfreier Höchstbetrag § 3 Nr. 63 EStG: 8% BBG RV
    const maxSteuerfrei = Math.round(bbgRVAV * 0.08) // 644 EUR/Monat
    const maxSVFrei = Math.round(bbgRVAV * 0.04) // 322 EUR/Monat

    const gesamtBeitrag = beitragBAV + agZuschuss
    const steuerfreierAnteil = Math.min(gesamtBeitrag, maxSteuerfrei)
    const svFreierAnteil = Math.min(gesamtBeitrag, maxSVFrei)

    // Steuerersparnis
    const estSatz = grenzsteuersatz / 100
    const soliSatz = estSatz > 0 ? 0.055 : 0
    const kistSatz = kirchensteuer ? 0.09 : 0
    const gesamtSatz = estSatz * (1 + soliSatz + kistSatz)

    const steuerersparnis = Math.round(Math.min(beitragBAV, steuerfreierAnteil) * gesamtSatz)

    // SV-Ersparnis (AN-Anteil ca. 20.425%)
    const svSatzAN = 0.20425 // RV 9.3 + AV 1.3 + KV 8.15 + PV 1.675
    const svErsparnis = bruttogehalt <= bbgKVPV
      ? Math.round(Math.min(beitragBAV, svFreierAnteil) * svSatzAN)
      : Math.round(Math.min(beitragBAV, svFreierAnteil) * 0.106) // nur RV+AV wenn über BBG KV

    // AG-Ersparnis (SV ca. 20.725%)
    const svSatzAG = 0.20725
    const agSVErsparnis = bruttogehalt <= bbgKVPV
      ? Math.round(Math.min(beitragBAV, svFreierAnteil) * svSatzAG)
      : Math.round(Math.min(beitragBAV, svFreierAnteil) * 0.109)

    // Netto-Aufwand
    const nettoAufwand = beitragBAV - steuerersparnis - svErsparnis
    const nettoQuote = beitragBAV > 0 ? Math.round(nettoAufwand / beitragBAV * 100) : 0

    // AG-Pflicht-Zuschuss: 15% seit 2022
    const pflichtZuschuss = Math.round(beitragBAV * 0.15)
    const zuschussOk = agZuschuss >= pflichtZuschuss

    // Jahreswerte
    const jahresBeitrag = gesamtBeitrag * 12
    const jahresSteuerersparnis = steuerersparnis * 12
    const jahresSVErsparnis = svErsparnis * 12

    // Chart: Beitragsaufteilung
    const chartData = [
      { name: 'Brutto-Beitrag', anBeitrag: beitragBAV, agZuschuss, steuerErsparnis: 0, svErsparnis: 0, nettoAufwand: 0 },
      { name: 'Förderung', anBeitrag: 0, agZuschuss: 0, steuerErsparnis: steuerersparnis, svErsparnis, nettoAufwand: 0 },
      { name: 'Netto-Aufwand', anBeitrag: 0, agZuschuss: 0, steuerErsparnis: 0, svErsparnis: 0, nettoAufwand: Math.max(nettoAufwand, 0) },
    ]

    return {
      maxSteuerfrei, maxSVFrei, steuerfreierAnteil, svFreierAnteil,
      steuerersparnis, svErsparnis, agSVErsparnis,
      nettoAufwand, nettoQuote,
      pflichtZuschuss, zuschussOk,
      jahresBeitrag, jahresSteuerersparnis, jahresSVErsparnis,
      chartData,
    }
  }, [bruttogehalt, beitragBAV, agZuschuss, grenzsteuersatz, kirchensteuer, durchfuehrungsweg])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          Betriebliche Altersvorsorge (bAV)
        </h1>
        <p className="text-muted-foreground mt-1">
          Entgeltumwandlung – § 3 Nr. 63 EStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Steuerfrei (§ 3 Nr. 63):</strong> Bis <strong>8% der BBG RV</strong> = {ergebnis.maxSteuerfrei} EUR/Monat (2025).</p>
              <p><strong>SV-frei:</strong> Bis <strong>4% der BBG RV</strong> = {ergebnis.maxSVFrei} EUR/Monat.</p>
              <p><strong>AG-Zuschuss:</strong> Pflicht min. 15% seit 01.01.2022 bei Entgeltumwandlung (§ 1a Abs. 1a BetrAVG).</p>
              <p><strong>Nachgelagerte Besteuerung:</strong> Auszahlung im Alter voll steuerpflichtig (+ KV/PV).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bruttogehalt/Monat: {bruttogehalt.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1500} max={10000} step={100} value={bruttogehalt} onChange={e => setBruttogehalt(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">AN-Beitrag/Monat: {beitragBAV.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={ergebnis.maxSteuerfrei} step={10} value={beitragBAV} onChange={e => setBeitragBAV(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">AG-Zuschuss/Monat: {agZuschuss.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={300} step={5} value={agZuschuss} onChange={e => setAgZuschuss(+e.target.value)} className="w-full accent-primary" />
              {!ergebnis.zuschussOk && (
                <p className="text-xs text-orange-600 mt-1">Min. 15% Pflicht = {ergebnis.pflichtZuschuss} EUR</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz: {grenzsteuersatz}%</label>
              <input type="range" min={0} max={45} step={1} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Durchführungsweg</p>
              <div className="flex gap-2 flex-wrap">
                {(['direktversicherung', 'pensionskasse', 'pensionsfonds'] as const).map(d => (
                  <button key={d} onClick={() => setDurchfuehrungsweg(d)} className={`rounded-md px-3 py-1.5 text-xs ${durchfuehrungsweg === d ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {d === 'direktversicherung' ? 'Direktversicherung' : d === 'pensionskasse' ? 'Pensionskasse' : 'Pensionsfonds'}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={kirchensteuer} onChange={e => setKirchensteuer(e.target.checked)} className="accent-primary" />
              Kirchensteuer (9%)
            </label>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis (monatlich)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">{ergebnis.nettoAufwand.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Netto-Aufwand/Monat</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{(ergebnis.steuerersparnis + ergebnis.svErsparnis).toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground mt-1">Gesamte Förderung/Monat</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">AN-Beitrag (Entgeltumwandlung)</span>
                <span className="font-medium">{beitragBAV.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">AG-Zuschuss</span>
                <span className="font-medium text-green-600">+{agZuschuss.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerersparnis</span>
                <span className="font-medium text-green-600">-{ergebnis.steuerersparnis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">SV-Ersparnis (AN)</span>
                <span className="font-medium text-green-600">-{ergebnis.svErsparnis.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Netto-Aufwand</span>
                <span className="font-medium text-primary">{ergebnis.nettoAufwand.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Netto-Quote</span>
                <span className="font-medium">{ergebnis.nettoQuote}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Gesamtbeitrag/Jahr</span>
                <span className="font-medium">{ergebnis.jahresBeitrag.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">AG SV-Ersparnis/Monat</span>
                <span className="font-medium">{ergebnis.agSVErsparnis.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Förderungsübersicht</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v} €`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="anBeitrag" name="AN-Beitrag" fill="#7c3aed" stackId="a" />
                <Bar dataKey="agZuschuss" name="AG-Zuschuss" fill="#22c55e" stackId="a" />
                <Bar dataKey="steuerErsparnis" name="Steuer-Ersparnis" fill="#3b82f6" stackId="b" />
                <Bar dataKey="svErsparnis" name="SV-Ersparnis" fill="#06b6d4" stackId="b" />
                <Bar dataKey="nettoAufwand" name="Netto-Aufwand" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Durchführungswege</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className={`rounded-lg p-3 ${durchfuehrungsweg === 'direktversicherung' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
              <p className="font-medium">Direktversicherung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Häufigster Weg</li>
                <li>- Lebensversicherung</li>
                <li>- Insolvenzgeschützt</li>
                <li>- Portabel bei AG-Wechsel</li>
              </ul>
            </div>
            <div className={`rounded-lg p-3 ${durchfuehrungsweg === 'pensionskasse' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
              <p className="font-medium">Pensionskasse</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Ähnlich Direktversicherung</li>
                <li>- Versicherungsförmig</li>
                <li>- Oft branchen­spezifisch</li>
                <li>- BaFin-reguliert</li>
              </ul>
            </div>
            <div className={`rounded-lg p-3 ${durchfuehrungsweg === 'pensionsfonds' ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
              <p className="font-medium">Pensionsfonds</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Höhere Aktienquote möglich</li>
                <li>- Mehr Renditechancen</li>
                <li>- PSV-geschützt</li>
                <li>- Flexibler als DV/PK</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
