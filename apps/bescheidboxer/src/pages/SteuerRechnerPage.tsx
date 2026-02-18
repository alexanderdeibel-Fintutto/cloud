import { useState, useMemo } from 'react'
import {
  Calculator,
  Euro,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import { formatCurrency } from '../lib/utils'

// German income tax brackets 2024
function berechneEinkommensteuer(zvE: number): number {
  if (zvE <= 11604) return 0
  if (zvE <= 17005) {
    const y = (zvE - 11604) / 10000
    return Math.floor((922.98 * y + 1400) * y)
  }
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000
    return Math.floor((181.19 * z + 2397) * z + 1025.38)
  }
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10602.13)
  }
  return Math.floor(0.45 * zvE - 18936.88)
}

function berechneSolidaritaetszuschlag(steuer: number): number {
  if (steuer <= 18130) return 0
  const soli = steuer * 0.055
  const freigrenzeAbgabe = (steuer - 18130) * 0.119
  return Math.min(soli, freigrenzeAbgabe)
}

type Steuerklasse = '1' | '2' | '3' | '4' | '5' | '6'
type Kirchensteuer = 'keine' | 'bayern' | 'standard'

interface BerechnungErgebnis {
  bruttoEinkommen: number
  werbungskosten: number
  sonderausgaben: number
  vorsorgeaufwendungen: number
  zvE: number
  einkommensteuer: number
  solidaritaetszuschlag: number
  kirchensteuer: number
  gesamtAbgaben: number
  nettoEinkommen: number
  steuersatz: number
  grenzsteuersatz: number
}

const STEUERKLASSE_INFO: Record<Steuerklasse, string> = {
  '1': 'Ledig / geschieden / verwitwet',
  '2': 'Alleinerziehend',
  '3': 'Verheiratet (hoeher verdienend)',
  '4': 'Verheiratet (beide aehnlich)',
  '5': 'Verheiratet (geringer verdienend)',
  '6': 'Zweitjob / Nebenjob',
}

export default function SteuerRechnerPage() {
  const [brutto, setBrutto] = useState<string>('45000')
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>('1')
  const [kirchensteuer, setKirchensteuer] = useState<Kirchensteuer>('keine')
  const [werbungskosten, setWerbungskosten] = useState<string>('1230')
  const [sonderausgaben, setSonderausgaben] = useState<string>('36')
  const [vorsorge, setVorsorge] = useState<string>('0')
  const [showDetails, setShowDetails] = useState(false)
  const [kinder, setKinder] = useState<string>('0')

  const ergebnis = useMemo((): BerechnungErgebnis | null => {
    const bruttoNum = parseFloat(brutto) || 0
    if (bruttoNum <= 0) return null

    const wk = Math.max(parseFloat(werbungskosten) || 0, 1230) // Min. Pauschbetrag
    const sa = Math.max(parseFloat(sonderausgaben) || 0, 36) // Min. Pauschbetrag
    const vs = parseFloat(vorsorge) || 0
    const kinderNum = parseInt(kinder) || 0

    // Kinderfreibetrag pro Kind: 6384 EUR (2024)
    const kinderfreibetrag = kinderNum * 6384

    let zvE = bruttoNum - wk - sa - vs

    // Steuerklasse Anpassungen (vereinfacht)
    if (steuerklasse === '2') {
      zvE -= 4260 // Entlastungsbetrag Alleinerziehende
    } else if (steuerklasse === '3') {
      // Splitting-Verfahren: zvE halbieren, Steuer verdoppeln
      zvE = Math.max(zvE - kinderfreibetrag, 0)
      const halbe = zvE / 2
      const steuerHalb = berechneEinkommensteuer(halbe)
      const steuerGesamt = steuerHalb * 2

      const soli = berechneSolidaritaetszuschlag(steuerGesamt)
      const ks = kirchensteuer === 'keine' ? 0 :
                 kirchensteuer === 'bayern' ? steuerGesamt * 0.08 :
                 steuerGesamt * 0.09
      const gesamt = steuerGesamt + soli + ks

      return {
        bruttoEinkommen: bruttoNum,
        werbungskosten: wk,
        sonderausgaben: sa,
        vorsorgeaufwendungen: vs,
        zvE,
        einkommensteuer: steuerGesamt,
        solidaritaetszuschlag: Math.round(soli * 100) / 100,
        kirchensteuer: Math.round(ks * 100) / 100,
        gesamtAbgaben: Math.round(gesamt * 100) / 100,
        nettoEinkommen: Math.round((bruttoNum - gesamt) * 100) / 100,
        steuersatz: bruttoNum > 0 ? Math.round((gesamt / bruttoNum) * 10000) / 100 : 0,
        grenzsteuersatz: halbe > 277825 ? 45 : halbe > 66760 ? 42 : halbe > 17005 ? 30 : halbe > 11604 ? 14 : 0,
      }
    }

    zvE = Math.max(zvE - kinderfreibetrag, 0)
    const est = berechneEinkommensteuer(zvE)
    const soli = berechneSolidaritaetszuschlag(est)
    const ks = kirchensteuer === 'keine' ? 0 :
               kirchensteuer === 'bayern' ? est * 0.08 :
               est * 0.09
    const gesamt = est + soli + ks

    return {
      bruttoEinkommen: bruttoNum,
      werbungskosten: wk,
      sonderausgaben: sa,
      vorsorgeaufwendungen: vs,
      zvE,
      einkommensteuer: est,
      solidaritaetszuschlag: Math.round(soli * 100) / 100,
      kirchensteuer: Math.round(ks * 100) / 100,
      gesamtAbgaben: Math.round(gesamt * 100) / 100,
      nettoEinkommen: Math.round((bruttoNum - gesamt) * 100) / 100,
      steuersatz: bruttoNum > 0 ? Math.round((gesamt / bruttoNum) * 10000) / 100 : 0,
      grenzsteuersatz: zvE > 277825 ? 45 : zvE > 66760 ? 42 : zvE > 17005 ? 30 : zvE > 11604 ? 14 : 0,
    }
  }, [brutto, steuerklasse, kirchensteuer, werbungskosten, sonderausgaben, vorsorge, kinder])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Steuer-Rechner</h1>
        <p className="text-muted-foreground mt-1">
          Berechnen Sie Ihre voraussichtliche Einkommensteuer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eingabe */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Eingaben
              </CardTitle>
              <CardDescription>
                Geben Sie Ihre Daten ein fuer eine Steuerberechnung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Haupteingaben */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brutto">Brutto-Jahreseinkommen</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="brutto"
                      type="number"
                      value={brutto}
                      onChange={e => setBrutto(e.target.value)}
                      className="pl-9"
                      placeholder="z.B. 45000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Steuerklasse</Label>
                  <Select value={steuerklasse} onValueChange={(v) => setSteuerklasse(v as Steuerklasse)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STEUERKLASSE_INFO).map(([key, desc]) => (
                        <SelectItem key={key} value={key}>
                          Klasse {key} - {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kirchensteuer</Label>
                  <Select value={kirchensteuer} onValueChange={(v) => setKirchensteuer(v as Kirchensteuer)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keine">Keine</SelectItem>
                      <SelectItem value="standard">9% (alle Bundeslaender ausser BY/BW)</SelectItem>
                      <SelectItem value="bayern">8% (Bayern / Baden-Wuerttemberg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kinder">Anzahl Kinder</Label>
                  <Input
                    id="kinder"
                    type="number"
                    min="0"
                    max="10"
                    value={kinder}
                    onChange={e => setKinder(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Erweiterte Eingaben */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="gap-2 text-muted-foreground"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Erweiterte Eingaben
                </Button>

                {showDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="wk">Werbungskosten</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="wk"
                          type="number"
                          value={werbungskosten}
                          onChange={e => setWerbungskosten(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Min. 1.230 EUR Pauschale</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sa">Sonderausgaben</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="sa"
                          type="number"
                          value={sonderausgaben}
                          onChange={e => setSonderausgaben(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Min. 36 EUR Pauschale</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vs">Vorsorgeaufwendungen</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="vs"
                          type="number"
                          value={vorsorge}
                          onChange={e => setVorsorge(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">z.B. Rentenversicherung</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steuertarif Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Steuertarif 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { range: '0 - 11.604 EUR', rate: '0%', label: 'Grundfreibetrag' },
                  { range: '11.605 - 17.005 EUR', rate: '14% - 24%', label: 'Progressionszone I' },
                  { range: '17.006 - 66.760 EUR', rate: '24% - 42%', label: 'Progressionszone II' },
                  { range: '66.761 - 277.825 EUR', rate: '42%', label: 'Proportionalzone' },
                  { range: 'ab 277.826 EUR', rate: '45%', label: 'Reichensteuer' },
                ].map((bracket) => (
                  <div key={bracket.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{bracket.label}</p>
                      <p className="text-xs text-muted-foreground">{bracket.range}</p>
                    </div>
                    <Badge variant="secondary">{bracket.rate}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ergebnis */}
        <div className="space-y-6">
          {ergebnis ? (
            <>
              {/* Hauptergebnis */}
              <Card className="border-fintutto-blue-200 dark:border-fintutto-blue-800 bg-fintutto-blue-50/50 dark:bg-fintutto-blue-950/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-sm text-fintutto-blue-700 dark:text-fintutto-blue-300 mb-1">Geschaetzte Einkommensteuer</p>
                      <p className="text-4xl font-bold text-fintutto-blue-700 dark:text-fintutto-blue-300">
                        {formatCurrency(ergebnis.einkommensteuer)}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Gesamte Steuerbelastung</p>
                      <p className="text-2xl font-bold">{formatCurrency(ergebnis.gesamtAbgaben)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        inkl. Soli + Kirchensteuer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Steuersaetze */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Durchschnittssteuersatz</span>
                    <span className="font-bold text-lg">{ergebnis.steuersatz}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-fintutto-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(ergebnis.steuersatz, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Grenzsteuersatz</span>
                    <span className="font-bold text-lg">{ergebnis.grenzsteuersatz}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(ergebnis.grenzsteuersatz, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Aufschluesselung */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aufschluesselung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bruttoeinkommen</span>
                      <span className="font-medium">{formatCurrency(ergebnis.bruttoEinkommen)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>- Werbungskosten</span>
                      <span>{formatCurrency(ergebnis.werbungskosten)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>- Sonderausgaben</span>
                      <span>{formatCurrency(ergebnis.sonderausgaben)}</span>
                    </div>
                    {ergebnis.vorsorgeaufwendungen > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>- Vorsorgeaufwendungen</span>
                        <span>{formatCurrency(ergebnis.vorsorgeaufwendungen)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Zu verst. Einkommen</span>
                      <span>{formatCurrency(ergebnis.zvE)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Einkommensteuer</span>
                      <span className="font-medium">{formatCurrency(ergebnis.einkommensteuer)}</span>
                    </div>
                    {ergebnis.solidaritaetszuschlag > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>+ Solidaritaetszuschlag</span>
                        <span>{formatCurrency(ergebnis.solidaritaetszuschlag)}</span>
                      </div>
                    )}
                    {ergebnis.kirchensteuer > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>+ Kirchensteuer</span>
                        <span>{formatCurrency(ergebnis.kirchensteuer)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Gesamtbelastung</span>
                      <span className="text-destructive">{formatCurrency(ergebnis.gesamtAbgaben)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Netto */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-300">Verbleibendes Netto</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(ergebnis.nettoEinkommen)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ca. {formatCurrency(ergebnis.nettoEinkommen / 12)} / Monat
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">Ergebnis</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Geben Sie Ihr Bruttoeinkommen ein, um die Steuerberechnung zu sehen.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Hinweis */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200">
            <strong>Hinweis:</strong> Diese Berechnung dient nur zur Orientierung und
            ersetzt keine professionelle Steuerberatung. Die tatsaechliche Steuerlast
            kann aufgrund individueller Umstaende abweichen.
          </div>
        </div>
      </div>
    </div>
  )
}
