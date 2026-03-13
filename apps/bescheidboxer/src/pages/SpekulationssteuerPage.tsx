import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { TrendingUp, Info } from 'lucide-react'

function calcESt(zvE: number): number {
  if (zvE <= 12084) return 0
  if (zvE <= 17005) { const y = (zvE - 12084) / 10000; return Math.round((922.98 * y + 1400) * y) }
  if (zvE <= 66760) { const z = (zvE - 17005) / 10000; return Math.round((181.19 * z + 2397) * z + 1025.38) }
  if (zvE <= 277825) return Math.round(0.42 * zvE - 10394.14)
  return Math.round(0.45 * zvE - 18730.89)
}

export default function SpekulationssteuerPage() {
  const [kaufpreis, setKaufpreis] = useState(250000)
  const [verkaufspreis, setVerkaufspreis] = useState(320000)
  const [haltedauerJahre, setHaltedauerJahre] = useState(5)
  const [werbungskosten, setWerbungskosten] = useState(15000)
  const [zvEOhne, setZvEOhne] = useState(55000)
  const [objektTyp, setObjektTyp] = useState<'immobilie' | 'sonstige'>('immobilie')

  const ergebnis = useMemo(() => {
    const spekulationsfrist = objektTyp === 'immobilie' ? 10 : 1
    const steuerpflichtig = haltedauerJahre < spekulationsfrist

    const gewinn = verkaufspreis - kaufpreis - werbungskosten
    const freigrenze = 600 // § 23 Abs. 3 S. 5 EStG
    const steuerpflichtigerGewinn = steuerpflichtig && gewinn > freigrenze ? gewinn : 0

    // ESt mit und ohne Spekulationsgewinn
    const estOhne = calcESt(zvEOhne)
    const estMit = calcESt(zvEOhne + steuerpflichtigerGewinn)
    const mehrsteuer = estMit - estOhne
    const soli = Math.round(mehrsteuer * 0.055)
    const gesamtSteuer = mehrsteuer + soli

    const grenzsteuersatz = steuerpflichtigerGewinn > 0
      ? Math.round(gesamtSteuer / steuerpflichtigerGewinn * 1000) / 10
      : 0

    const nettoGewinn = gewinn - gesamtSteuer
    const resteJahre = Math.max(spekulationsfrist - haltedauerJahre, 0)

    return {
      spekulationsfrist,
      steuerpflichtig,
      gewinn,
      steuerpflichtigerGewinn,
      mehrsteuer,
      soli,
      gesamtSteuer,
      grenzsteuersatz,
      nettoGewinn,
      resteJahre,
    }
  }, [kaufpreis, verkaufspreis, haltedauerJahre, werbungskosten, zvEOhne, objektTyp])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Spekulationssteuer-Rechner (§ 23 EStG)
        </h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie die Steuer auf private Veräußerungsgeschäfte
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Immobilien:</strong> Spekulationsfrist 10 Jahre. Eigennutzung im Jahr des Verkaufs und den 2 Vorjahren befreit.</p>
              <p><strong>Sonstige Wirtschaftsgüter:</strong> Spekulationsfrist 1 Jahr (z.B. Gold, Kunst, Kryptowährungen bis 2023).</p>
              <p><strong>Freigrenze:</strong> Gewinne bis 600 EUR/Jahr sind steuerfrei (nicht Freibetrag!).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Objekttyp</label>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={objektTyp === 'immobilie'} onChange={() => setObjektTyp('immobilie')} className="accent-primary" />
                  Immobilie (10 J.)
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={objektTyp === 'sonstige'} onChange={() => setObjektTyp('sonstige')} className="accent-primary" />
                  Sonstige (1 J.)
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Kaufpreis: {kaufpreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={1000000} step={5000} value={kaufpreis} onChange={e => setKaufpreis(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Verkaufspreis: {verkaufspreis.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={10000} max={1500000} step={5000} value={verkaufspreis} onChange={e => setVerkaufspreis(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Haltedauer: {haltedauerJahre} {haltedauerJahre === 1 ? 'Jahr' : 'Jahre'}</label>
              <input type="range" min={0} max={15} step={1} value={haltedauerJahre} onChange={e => setHaltedauerJahre(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Veräußerungskosten (Makler, Notar etc.): {werbungskosten.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={werbungskosten} onChange={e => setWerbungskosten(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Übriges zvE (ohne Spekulationsgewinn): {zvEOhne.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={200000} step={1000} value={zvEOhne} onChange={e => setZvEOhne(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-3 rounded-lg text-center ${ergebnis.steuerpflichtig ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              {ergebnis.steuerpflichtig ? (
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Steuerpflichtig</p>
                  <p className="text-xs text-muted-foreground">Spekulationsfrist ({ergebnis.spekulationsfrist} J.) nicht abgelaufen – noch {ergebnis.resteJahre} {ergebnis.resteJahre === 1 ? 'Jahr' : 'Jahre'}</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Steuerfrei</p>
                  <p className="text-xs text-muted-foreground">Spekulationsfrist ({ergebnis.spekulationsfrist} J.) abgelaufen</p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold">{ergebnis.gewinn.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground">Veräußerungsgewinn</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-lg font-bold text-red-600">{ergebnis.gesamtSteuer.toLocaleString('de-DE')} EUR</p>
                <p className="text-xs text-muted-foreground">Steuerbelastung</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Steuerpflichtiger Gewinn</span>
                <span className="font-medium">{ergebnis.steuerpflichtigerGewinn.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Zusätzliche ESt</span>
                <span className="font-medium">{ergebnis.mehrsteuer.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Solidaritätszuschlag</span>
                <span className="font-medium">{ergebnis.soli.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Grenzsteuersatz</span>
                <span className="font-medium">{ergebnis.grenzsteuersatz}%</span>
              </div>
              <div className="flex justify-between py-2 font-semibold bg-green-100 dark:bg-green-900/30 rounded px-2">
                <span>Netto-Gewinn nach Steuer</span>
                <span className="text-green-700 dark:text-green-400">{ergebnis.nettoGewinn.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
