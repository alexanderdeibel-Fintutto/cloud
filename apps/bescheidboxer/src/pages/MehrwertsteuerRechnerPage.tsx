import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Receipt, Info } from 'lucide-react'

export default function MehrwertsteuerRechnerPage() {
  const [betrag, setBetrag] = useState(1000)
  const [richtung, setRichtung] = useState<'brutto-netto' | 'netto-brutto'>('brutto-netto')
  const [satz, setSatz] = useState(19)
  const [menge, setMenge] = useState(1)

  const ergebnis = useMemo(() => {
    const einzelBetrag = betrag * menge

    let brutto: number, netto: number, mwst: number
    if (richtung === 'brutto-netto') {
      brutto = einzelBetrag
      mwst = Math.round(einzelBetrag * satz / (100 + satz) * 100) / 100
      netto = Math.round((einzelBetrag - mwst) * 100) / 100
    } else {
      netto = einzelBetrag
      mwst = Math.round(einzelBetrag * satz / 100 * 100) / 100
      brutto = Math.round((einzelBetrag + mwst) * 100) / 100
    }

    const mwstAnteil = brutto > 0 ? Math.round(mwst / brutto * 10000) / 100 : 0

    // Vergleich alle Saetze
    const saetze = [
      { satz: 19, label: 'Regelsteuersatz (19%)' },
      { satz: 7, label: 'Ermaessigt (7%)' },
      { satz: 0, label: 'Steuerbefreit (0%)' },
    ]

    const vergleich = saetze.map(s => {
      const basisBetrag = richtung === 'brutto-netto' ? einzelBetrag : einzelBetrag
      let b: number, n: number, m: number
      if (richtung === 'brutto-netto') {
        b = basisBetrag
        m = Math.round(basisBetrag * s.satz / (100 + s.satz) * 100) / 100
        n = Math.round((basisBetrag - m) * 100) / 100
      } else {
        n = basisBetrag
        m = Math.round(basisBetrag * s.satz / 100 * 100) / 100
        b = Math.round((basisBetrag + m) * 100) / 100
      }
      return { ...s, brutto: b, netto: n, mwst: m }
    })

    return { brutto, netto, mwst, mwstAnteil, vergleich }
  }, [betrag, richtung, satz, menge])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          Mehrwertsteuer-Rechner
        </h1>
        <p className="text-muted-foreground mt-1">
          Brutto ↔ Netto Umrechnung – § 12 UStG
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Regelsteuersatz:</strong> <strong>19%</strong> auf die meisten Waren und Dienstleistungen.</p>
              <p><strong>Ermaessigter Satz:</strong> <strong>7%</strong> auf Grundnahrungsmittel, Buecher, Zeitungen, OEPNV, Kultur, Hotel.</p>
              <p><strong>Steuerbefreit (§ 4 UStG):</strong> Aerzte, Versicherungen, Grundstuecksverkaeufe, Exporte.</p>
              <p><strong>Kleinunternehmer (§ 19):</strong> Bis 22.000 EUR Vorjahresumsatz keine USt-Pflicht.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingabe</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Berechnungsrichtung</p>
              <div className="flex gap-2">
                <button onClick={() => setRichtung('brutto-netto')} className={`rounded-md px-4 py-2 text-sm ${richtung === 'brutto-netto' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Brutto → Netto
                </button>
                <button onClick={() => setRichtung('netto-brutto')} className={`rounded-md px-4 py-2 text-sm ${richtung === 'netto-brutto' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Netto → Brutto
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{richtung === 'brutto-netto' ? 'Bruttobetrag' : 'Nettobetrag'}: {betrag.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={1} max={50000} step={10} value={betrag} onChange={e => setBetrag(+e.target.value)} className="w-full accent-primary" />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">MwSt-Satz</p>
              <div className="flex gap-2 flex-wrap">
                {[19, 7, 0].map(s => (
                  <button key={s} onClick={() => setSatz(s)} className={`rounded-md px-4 py-2 text-sm ${satz === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Menge: {menge}</label>
              <input type="range" min={1} max={100} value={menge} onChange={e => setMenge(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{ergebnis.brutto.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">Brutto</p>
                </div>
                <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{ergebnis.mwst.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">MwSt ({satz}%)</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{ergebnis.netto.toLocaleString('de-DE')} EUR</p>
                  <p className="text-xs text-muted-foreground mt-1">Netto</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Bruttobetrag</span>
                  <span className="font-medium">{ergebnis.brutto.toLocaleString('de-DE')} EUR</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Mehrwertsteuer ({satz}%)</span>
                  <span className="font-medium text-red-600">{ergebnis.mwst.toLocaleString('de-DE')} EUR</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Nettobetrag</span>
                  <span className="font-medium text-primary">{ergebnis.netto.toLocaleString('de-DE')} EUR</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">MwSt-Anteil am Brutto</span>
                  <span className="font-medium">{ergebnis.mwstAnteil.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vergleich */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Satz-Vergleich</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Steuersatz</th>
                  <th className="py-2 pr-4 text-right">Netto</th>
                  <th className="py-2 pr-4 text-right">MwSt</th>
                  <th className="py-2 text-right">Brutto</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.vergleich.map((v, i) => (
                  <tr key={i} className={`border-b ${v.satz === satz ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="py-1.5 pr-4">{v.label}</td>
                    <td className="py-1.5 pr-4 text-right">{v.netto.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 pr-4 text-right text-red-600">{v.mwst.toLocaleString('de-DE')} EUR</td>
                    <td className="py-1.5 text-right">{v.brutto.toLocaleString('de-DE')} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">MwSt-Saetze Beispiele</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">19% Regelsteuersatz</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Elektronik, Kleidung</li>
                <li>- Dienstleistungen</li>
                <li>- Kraftstoffe</li>
                <li>- Restaurant (Getraenke)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">7% Ermaessigt</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Lebensmittel</li>
                <li>- Buecher, Zeitungen</li>
                <li>- OEPNV, Fernverkehr</li>
                <li>- Hotel (Uebernachtung)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="font-medium">0% Steuerbefreit</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>- Aerztliche Leistungen</li>
                <li>- Versicherungen</li>
                <li>- Grundstuecksverkaeufe</li>
                <li>- Exporte (Drittland)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
