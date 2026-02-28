import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { PiggyBank, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Produkt {
  name: string
  monatsbeitrag: number
  laufzeit: number
  rendite: number
  foerderung: number
  besteuerung: 'nachgelagert' | 'ertragsanteil' | 'abgeltung'
  steuervorteilAnspar: number
  steuerInAuszahlung: number
}

export default function AltersvorsorgeVergleichPage() {
  const [beitrag, setBeitrag] = useState(200)
  const [laufzeit, setLaufzeit] = useState(30)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35)
  const [rentenSteuersatz, setRentenSteuersatz] = useState(20)
  const [renditeAnnahme, setRenditeAnnahme] = useState(5)

  const ergebnis = useMemo(() => {
    const jahresBeitrag = beitrag * 12

    // Endkapital berechnen (Zinseszins)
    const endkapital = (monat: number, rendite: number, jahre: number) => {
      const r = rendite / 100 / 12
      return Math.round(monat * ((Math.pow(1 + r, jahre * 12) - 1) / r))
    }

    const bruttoKapital = endkapital(beitrag, renditeAnnahme, laufzeit)
    const eingezahlt = jahresBeitrag * laufzeit

    // Produkte definieren
    const produkte: Produkt[] = [
      {
        name: 'Riester-Rente',
        monatsbeitrag: beitrag,
        laufzeit,
        rendite: renditeAnnahme - 1, // Etwas niedrigere Rendite wg. Kosten
        foerderung: 175 * laufzeit, // Grundzulage 175 EUR/Jahr
        besteuerung: 'nachgelagert',
        steuervorteilAnspar: Math.round(Math.min(jahresBeitrag, 2100) * grenzsteuersatz / 100) * laufzeit,
        steuerInAuszahlung: 0, // Wird in Auszahlung besteuert
      },
      {
        name: 'Rürup (Basisrente)',
        monatsbeitrag: beitrag,
        laufzeit,
        rendite: renditeAnnahme - 0.5,
        foerderung: 0,
        besteuerung: 'nachgelagert',
        steuervorteilAnspar: Math.round(jahresBeitrag * grenzsteuersatz / 100) * laufzeit,
        steuerInAuszahlung: 0,
      },
      {
        name: 'Betriebl. AV (bAV)',
        monatsbeitrag: beitrag,
        laufzeit,
        rendite: renditeAnnahme - 0.5,
        foerderung: Math.round(beitrag * 0.20) * 12 * laufzeit, // SV-Ersparnis
        besteuerung: 'nachgelagert',
        steuervorteilAnspar: Math.round(jahresBeitrag * (grenzsteuersatz + 20) / 100) * laufzeit, // +SV
        steuerInAuszahlung: 0,
      },
      {
        name: 'Private RV (Schicht 3)',
        monatsbeitrag: beitrag,
        laufzeit,
        rendite: renditeAnnahme - 1,
        foerderung: 0,
        besteuerung: 'ertragsanteil',
        steuervorteilAnspar: 0,
        steuerInAuszahlung: 0,
      },
      {
        name: 'ETF-Sparplan',
        monatsbeitrag: beitrag,
        laufzeit,
        rendite: renditeAnnahme,
        foerderung: 0,
        besteuerung: 'abgeltung',
        steuervorteilAnspar: 0,
        steuerInAuszahlung: 0,
      },
    ]

    // Berechnungen pro Produkt
    const ergebnisse = produkte.map(p => {
      const kapital = endkapital(p.monatsbeitrag, p.rendite, p.laufzeit)
      const gewinn = kapital - eingezahlt
      const kapitalMitFoerderung = kapital + p.foerderung

      // Besteuerung in Auszahlungsphase (20 Jahre Rente angenommen)
      let steuerAuszahlung: number
      if (p.besteuerung === 'nachgelagert') {
        // Rente wird voll besteuert
        steuerAuszahlung = Math.round(kapitalMitFoerderung * rentenSteuersatz / 100)
      } else if (p.besteuerung === 'ertragsanteil') {
        // Nur Ertragsanteil besteuert (ca. 18% bei Beginn mit 67)
        steuerAuszahlung = Math.round(gewinn * 0.18 * rentenSteuersatz / 100)
      } else {
        // Abgeltungsteuer auf Gewinne
        steuerAuszahlung = Math.round(Math.max(gewinn - 1000, 0) * 0.26375)
      }

      const nettoErgebnis = kapitalMitFoerderung - steuerAuszahlung + p.steuervorteilAnspar

      return {
        ...p,
        kapital,
        gewinn,
        kapitalMitFoerderung,
        steuerAuszahlung,
        nettoErgebnis,
      }
    })

    // Chart data
    const chartData = ergebnisse.map(e => ({
      name: e.name,
      eingezahlt,
      foerderung: e.foerderung,
      rendite: e.kapital - eingezahlt,
      steuervorteil: e.steuervorteilAnspar,
      steuerAuszahlung: -e.steuerAuszahlung,
    }))

    return { ergebnisse, chartData, eingezahlt, bruttoKapital }
  }, [beitrag, laufzeit, grenzsteuersatz, rentenSteuersatz, renditeAnnahme])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          Altersvorsorge-Vergleich
        </h1>
        <p className="text-muted-foreground mt-1">
          Riester, Rürup, bAV, Private RV & ETF im Vergleich
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>3-Schichten-Modell:</strong> Schicht 1 (Basis: GRV, Ruerup) | Schicht 2 (Zusatz: Riester, bAV) | Schicht 3 (Privat: RV, ETF).</p>
              <p><strong>Nachgelagerte Besteuerung:</strong> Beitraege steuerfrei → Rente steuerpflichtig (Schicht 1+2).</p>
              <p><strong>Ertragsanteil:</strong> Nur Gewinne teilweise besteuert (Schicht 3 Rente).</p>
              <p><strong>Hinweis:</strong> Vereinfachte Darstellung. Tatsaechliche Ergebnisse abhaengig von Produktkosten, Marktentwicklung und persoenlicher Situation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parameter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Monatsbeitrag: {beitrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={50} max={1000} step={25} value={beitrag} onChange={e => setBeitrag(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Laufzeit: {laufzeit} Jahre</label>
              <input type="range" min={5} max={45} value={laufzeit} onChange={e => setLaufzeit(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Rendite-Annahme: {renditeAnnahme}%</label>
              <input type="range" min={1} max={10} step={0.5} value={renditeAnnahme} onChange={e => setRenditeAnnahme(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Grenzsteuersatz (Anspar): {grenzsteuersatz}%</label>
              <input type="range" min={14} max={45} value={grenzsteuersatz} onChange={e => setGrenzsteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Steuersatz Rente: {rentenSteuersatz}%</label>
              <input type="range" min={0} max={35} value={rentenSteuersatz} onChange={e => setRentenSteuersatz(+e.target.value)} className="w-full accent-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Eingezahlt gesamt: {ergebnis.eingezahlt.toLocaleString('de-DE')} EUR ({beitrag} EUR × 12 × {laufzeit} Jahre)</p>
        </CardContent>
      </Card>

      {/* Vergleichstabelle */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Produkt</th>
                  <th className="py-2 pr-4 text-right">Kapital</th>
                  <th className="py-2 pr-4 text-right">Foerderung</th>
                  <th className="py-2 pr-4 text-right">Steuervorteil</th>
                  <th className="py-2 pr-4 text-right">Steuer Ausz.</th>
                  <th className="py-2 text-right">Netto-Ergebnis</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.ergebnisse.map((e, i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    <td className="py-1.5 pr-4">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.besteuerung === 'nachgelagert' ? 'Nachgelagert' : e.besteuerung === 'ertragsanteil' ? 'Ertragsanteil' : 'Abgeltungsteuer'}</p>
                    </td>
                    <td className="py-1.5 pr-4 text-right">{e.kapital.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right text-green-600">{e.foerderung > 0 ? `+${e.foerderung.toLocaleString('de-DE')}` : '–'} {e.foerderung > 0 ? 'EUR' : ''}</td>
                    <td className="py-1.5 pr-4 text-right text-green-600">{e.steuervorteilAnspar > 0 ? `+${e.steuervorteilAnspar.toLocaleString('de-DE')}` : '–'} {e.steuervorteilAnspar > 0 ? 'EUR' : ''}</td>
                    <td className="py-1.5 pr-4 text-right text-red-600">-{e.steuerAuszahlung.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right font-bold">{e.nettoErgebnis.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kapitalaufbau im Vergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ergebnis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('de-DE')} EUR`} />
                <Legend />
                <Bar dataKey="eingezahlt" name="Eingezahlt" fill="#94a3b8" stackId="a" />
                <Bar dataKey="rendite" name="Rendite" fill="#22c55e" stackId="a" />
                <Bar dataKey="foerderung" name="Foerderung" fill="#3b82f6" stackId="a" />
                <Bar dataKey="steuervorteil" name="Steuervorteil Anspar" fill="#7c3aed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produkt-Steckbriefe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Riester-Rente</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Grundzulage 175 EUR/Jahr</li>
                <li>+ Kinderzulage 300 EUR/Kind</li>
                <li>+ Sonderausgabenabzug max. 2.100 EUR</li>
                <li>- Nachgelagerte Besteuerung</li>
                <li>- Oft hohe Kosten</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Rürup (Basisrente)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Hoher Sonderausgabenabzug (27.566 EUR)</li>
                <li>+ Ideal fuer Selbstaendige</li>
                <li>+ Insolvenzgeschuetzt</li>
                <li>- Nicht vererbbar, nicht kapitalisierbar</li>
                <li>- Nachgelagerte Besteuerung</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Betriebliche AV (bAV)</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Entgeltumwandlung steuer-/SV-frei</li>
                <li>+ Oft AG-Zuschuss (15%+)</li>
                <li>- KV/PV-Beitraege auf Betriebsrente</li>
                <li>- Nachgelagerte Besteuerung</li>
                <li>- Arbeitgeberbindung</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">Private Rentenversicherung</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Nur Ertragsanteil besteuert</li>
                <li>+ Flexibel (Kapitaloption)</li>
                <li>+ Frei vererbbar</li>
                <li>- Keine Steuerfoerderung</li>
                <li>- Oft hohe Kosten</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">ETF-Sparplan</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>+ Niedrige Kosten (0,1-0,5%)</li>
                <li>+ Maximale Flexibilitaet</li>
                <li>+ Teilfreistellung 30% (Aktien-ETF)</li>
                <li>- Keine Steuerfoerderung</li>
                <li>- Abgeltungsteuer auf Gewinne</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
