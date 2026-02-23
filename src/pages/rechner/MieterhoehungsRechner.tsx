import { useState } from 'react'
import { TrendingUp, Calculator, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import RechnerLayout from '@/components/rechner/RechnerLayout'

interface MieterhoehungResult {
  neueMonatsmiete: number
  neueJahresmiete: number
  erhoehungAbsolut: number
  erhoehungProzent: number
  maxErhoehung: number
  kappungsgrenze: number
  isZulaessig: boolean
  hinweise: string[]
}

const bundeslaender = [
  { name: 'Baden-Württemberg', kappung: 15 },
  { name: 'Bayern', kappung: 15 },
  { name: 'Berlin', kappung: 15 },
  { name: 'Brandenburg', kappung: 15 },
  { name: 'Bremen', kappung: 20 },
  { name: 'Hamburg', kappung: 15 },
  { name: 'Hessen', kappung: 15 },
  { name: 'Mecklenburg-Vorpommern', kappung: 20 },
  { name: 'Niedersachsen', kappung: 20 },
  { name: 'Nordrhein-Westfalen', kappung: 15 },
  { name: 'Rheinland-Pfalz', kappung: 20 },
  { name: 'Saarland', kappung: 20 },
  { name: 'Sachsen', kappung: 20 },
  { name: 'Sachsen-Anhalt', kappung: 20 },
  { name: 'Schleswig-Holstein', kappung: 15 },
  { name: 'Thüringen', kappung: 20 },
]

export default function MieterhoehungsRechner() {
  const [aktuelleKaltmiete, setAktuelleKaltmiete] = useState<string>('')
  const [gewuenschteKaltmiete, setGewuenschteKaltmiete] = useState<string>('')
  const [vergleichsmiete, setVergleichsmiete] = useState<string>('')
  const [bundesland, setBundesland] = useState<string>('Bayern')
  const [angespannterMarkt, setAngespannterMarkt] = useState<boolean>(true)
  const [result, setResult] = useState<MieterhoehungResult | null>(null)

  const berechnen = () => {
    const aktuell = parseFloat(aktuelleKaltmiete) || 0
    const gewuenscht = parseFloat(gewuenschteKaltmiete) || 0
    const vergleich = parseFloat(vergleichsmiete) || gewuenscht

    const land = bundeslaender.find(b => b.name === bundesland)
    const kappungsgrenze = angespannterMarkt ? 15 : (land?.kappung || 20)

    const maxErhoehungProzent = kappungsgrenze / 100
    const maxErhoehung = aktuell * maxErhoehungProzent
    const maxNeueMiete = Math.min(aktuell + maxErhoehung, vergleich)

    const erhoehungAbsolut = gewuenscht - aktuell
    const erhoehungProzent = (erhoehungAbsolut / aktuell) * 100

    const hinweise: string[] = []
    let isZulaessig = true

    if (gewuenscht > vergleich && vergleich > 0) {
      isZulaessig = false
      hinweise.push('Die gewünschte Miete übersteigt die ortsübliche Vergleichsmiete.')
    }

    if (erhoehungProzent > kappungsgrenze) {
      isZulaessig = false
      hinweise.push('Die Erhöhung überschreitet die Kappungsgrenze von ' + kappungsgrenze + '% in 3 Jahren.')
    }

    if (isZulaessig) {
      hinweise.push('Die Mieterhöhung ist zulässig nach §558 BGB.')
      hinweise.push('Der Mieter hat eine Überlegungsfrist bis zum Ende des übernächsten Monats.')
    }

    hinweise.push('Maximale Erhöhung: ' + formatCurrency(maxNeueMiete) + ' (Kappungsgrenze ' + kappungsgrenze + '%)')

    setResult({
      neueMonatsmiete: gewuenscht,
      neueJahresmiete: gewuenscht * 12,
      erhoehungAbsolut,
      erhoehungProzent,
      maxErhoehung,
      kappungsgrenze,
      isZulaessig,
      hinweise,
    })
  }

  const reset = () => {
    setAktuelleKaltmiete('')
    setGewuenschteKaltmiete('')
    setVergleichsmiete('')
    setResult(null)
  }

  return (
    <RechnerLayout
      title="Mieterhöhungs-Rechner"
      description="Berechne zulässige Mieterhöhungen nach §558 BGB"
      icon={<TrendingUp className="h-8 w-8 text-white" />}
    >
      <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Eingaben
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Aktuelle Kaltmiete *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={aktuelleKaltmiete}
                          onChange={(e) => setAktuelleKaltmiete(e.target.value)}
                          placeholder="z.B. 800"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gewünschte Kaltmiete *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={gewuenschteKaltmiete}
                          onChange={(e) => setGewuenschteKaltmiete(e.target.value)}
                          placeholder="z.B. 900"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ortsübliche Vergleichsmiete</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vergleichsmiete}
                        onChange={(e) => setVergleichsmiete(e.target.value)}
                        placeholder="z.B. 950"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Aus dem Mietspiegel deiner Stadt</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bundesland</label>
                      <select
                        value={bundesland}
                        onChange={(e) => setBundesland(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {bundeslaender.map((land) => (
                          <option key={land.name} value={land.name}>{land.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Angespannter Markt?</label>
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={angespannterMarkt}
                            onChange={() => setAngespannterMarkt(true)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Ja (15%)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!angespannterMarkt}
                            onChange={() => setAngespannterMarkt(false)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Nein (20%)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={berechnen}
                      disabled={!aktuelleKaltmiete || !gewuenschteKaltmiete}
                      className="flex-1 gradient-vermieter text-white"
                    >
                      Berechnen
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      Zurücksetzen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">§558 BGB - Mieterhöhung</h3>
                      <p className="text-sm text-muted-foreground">
                        Die Miete darf innerhalb von 3 Jahren nicht um mehr als 15-20% erhöht werden (Kappungsgrenze).
                        In Gebieten mit angespanntem Wohnungsmarkt gilt 15%.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {result ? (
                <>
                  <Card className={result.isZulaessig ? 'border-success/30' : 'border-destructive/30'}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {result.isZulaessig ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                        {result.isZulaessig ? 'Zulässig' : 'Problematisch'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-1">Erhöhung</p>
                        <p className={'text-4xl font-bold ' + (result.isZulaessig ? 'text-success' : 'text-destructive')}>
                          +{formatCurrency(result.erhoehungAbsolut)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          = +{result.erhoehungProzent.toFixed(1)}%
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Neue Monatsmiete</p>
                          <p className="text-xl font-semibold">{formatCurrency(result.neueMonatsmiete)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Neue Jahresmiete</p>
                          <p className="text-xl font-semibold">{formatCurrency(result.neueJahresmiete)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Hinweise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.hinweise.map((hinweis, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {hinweis}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gib die Mieten ein</p>
                  </CardContent>
                </Card>
              )}
      </div>
    </RechnerLayout>
  )
}
