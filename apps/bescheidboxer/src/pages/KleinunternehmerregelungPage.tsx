import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ShieldCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react'

export default function KleinunternehmerregelungPage() {
  const [umsatzVorjahr, setUmsatzVorjahr] = useState(18000)
  const [umsatzLaufend, setUmsatzLaufend] = useState(20000)
  const [vorsteuerAnteil, setVorsteuerAnteil] = useState(15)
  const [ust19Anteil, setUst19Anteil] = useState(80)

  const ergebnis = useMemo(() => {
    const grenze22000 = 22000
    const grenze50000 = 50000

    const berechtigt = umsatzVorjahr <= grenze22000 && umsatzLaufend <= grenze50000

    // Kleinunternehmer: kein USt, aber auch kein Vorsteuerabzug
    // Regelbesteuerung
    const anteil19 = umsatzLaufend * (ust19Anteil / 100)
    const anteil7 = umsatzLaufend * ((100 - ust19Anteil) / 100)
    const ustSchuld = Math.round(anteil19 * 0.19 + anteil7 * 0.07)
    const bruttoRegel = umsatzLaufend + ustSchuld

    // Vorsteuer die man abziehen könnte
    const vorsteuer = Math.round(umsatzLaufend * (vorsteuerAnteil / 100) * 0.19)
    const ustZahllast = Math.max(ustSchuld - vorsteuer, 0)

    // Effektiver Vorteil Kleinunternehmer
    // Vorteil: keine USt abführen
    // Nachteil: kein Vorsteuerabzug
    const vorteilKlein = ustZahllast // Was man nicht zahlen muss
    const nachteilKlein = vorsteuer // Was man nicht abziehen kann
    const nettoEffekt = vorteilKlein - nachteilKlein

    return {
      berechtigt,
      ustSchuld,
      vorsteuer,
      ustZahllast,
      vorteilKlein,
      nachteilKlein,
      nettoEffekt,
      bruttoRegel,
      empfehlung: nettoEffekt > 0 ? 'kleinunternehmer' : 'regelbesteuerung',
    }
  }, [umsatzVorjahr, umsatzLaufend, vorsteuerAnteil, ust19Anteil])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Kleinunternehmerregelung (§ 19 UStG)
        </h1>
        <p className="text-muted-foreground mt-1">
          Prüfen Sie, ob die Kleinunternehmerregelung für Sie vorteilhaft ist
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Voraussetzungen:</strong> Umsatz im Vorjahr max. 22.000 EUR und im laufenden Jahr voraussichtlich max. 50.000 EUR.</p>
              <p><strong>Vorteil:</strong> Keine Umsatzsteuer auf Rechnungen, vereinfachte Buchhaltung.</p>
              <p><strong>Nachteil:</strong> Kein Vorsteuerabzug auf Eingangsrechnungen möglich.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Eingaben</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Umsatz Vorjahr: {umsatzVorjahr.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={50000} step={500} value={umsatzVorjahr} onChange={e => setUmsatzVorjahr(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Erwarteter Umsatz laufendes Jahr: {umsatzLaufend.toLocaleString('de-DE')} EUR</label>
              <input type="range" min={0} max={80000} step={500} value={umsatzLaufend} onChange={e => setUmsatzLaufend(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Anteil 19% USt (Rest 7%): {ust19Anteil}%</label>
              <input type="range" min={0} max={100} step={5} value={ust19Anteil} onChange={e => setUst19Anteil(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Vorsteuer-relevante Ausgaben (% vom Umsatz): {vorsteuerAnteil}%</label>
              <input type="range" min={0} max={80} step={1} value={vorsteuerAnteil} onChange={e => setVorsteuerAnteil(+e.target.value)} className="w-full accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-lg">Ergebnis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-3 rounded-lg text-center ${ergebnis.berechtigt ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {ergebnis.berechtigt ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Kleinunternehmerregelung anwendbar</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-700 dark:text-red-400">Umsatzgrenzen überschritten</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide">Vergleich</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">USt-Schuld (Regelbesteuerung)</span>
                <span className="font-medium text-red-600">{ergebnis.ustSchuld.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Abziehbare Vorsteuer</span>
                <span className="font-medium text-green-600">-{ergebnis.vorsteuer.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">USt-Zahllast (an Finanzamt)</span>
                <span className="font-medium">{ergebnis.ustZahllast.toLocaleString('de-DE')} EUR</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-muted-foreground uppercase text-xs tracking-wide mt-3">Kleinunternehmer-Effekt</p>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Ersparnis (keine USt-Zahllast)</span>
                <span className="font-medium text-green-600">+{ergebnis.vorteilKlein.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Verlust (kein Vorsteuerabzug)</span>
                <span className="font-medium text-red-600">-{ergebnis.nachteilKlein.toLocaleString('de-DE')} EUR</span>
              </div>
              <div className={`flex justify-between py-2 font-semibold rounded px-2 ${ergebnis.nettoEffekt >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <span>Netto-Effekt</span>
                <span className={ergebnis.nettoEffekt >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {ergebnis.nettoEffekt >= 0 ? '+' : ''}{ergebnis.nettoEffekt.toLocaleString('de-DE')} EUR
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium">
                Empfehlung: {ergebnis.empfehlung === 'kleinunternehmer'
                  ? 'Kleinunternehmerregelung ist vorteilhaft – Sie sparen USt-Verwaltungsaufwand und zahlen netto weniger.'
                  : 'Regelbesteuerung ist vorteilhaft – der Vorsteuerabzug überwiegt die USt-Pflicht.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Wichtige Hinweise</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary font-bold">1.</span>Auf Rechnungen muss der Hinweis stehen: &quot;Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.&quot;</li>
            <li className="flex gap-2"><span className="text-primary font-bold">2.</span>Die Wahl zur Regelbesteuerung bindet für 5 Jahre (§ 19 Abs. 2 UStG).</li>
            <li className="flex gap-2"><span className="text-primary font-bold">3.</span>Bei B2B-Kunden kann Regelbesteuerung attraktiver sein, da Kunden dann Vorsteuer abziehen können.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">4.</span>Seit 2025 gelten neue EU-Regelungen zur grenzüberschreitenden Kleinunternehmerregelung.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
