import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Calculator, Info, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { differenceInMonths, differenceInYears, addMonths, setDate, format, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

export default function KuendigungsfristRechnerPage() {
  const [mietbeginn, setMietbeginn] = React.useState<string>('')
  const [kuendigender, setKuendigender] = React.useState<'mieter' | 'vermieter'>('mieter')
  const [kuendigungsDatum, setKuendigungsDatum] = React.useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  )

  // Berechnung
  const berechneErgebnis = () => {
    if (!mietbeginn) return null

    const start = new Date(mietbeginn)
    const kuendigung = new Date(kuendigungsDatum)

    // Wohndauer berechnen
    const wohndauerJahre = differenceInYears(kuendigung, start)
    const wohndauerMonate = differenceInMonths(kuendigung, start)

    // Kündigungsfrist bestimmen
    let fristMonate: number
    let fristBegruendung: string

    if (kuendigender === 'mieter') {
      fristMonate = 3
      fristBegruendung = 'Gesetzliche Kündigungsfrist für Mieter: immer 3 Monate (§ 573c BGB)'
    } else {
      // Vermieter: gestaffelt nach Wohndauer
      if (wohndauerJahre < 5) {
        fristMonate = 3
        fristBegruendung = 'Wohndauer unter 5 Jahren: 3 Monate Kündigungsfrist'
      } else if (wohndauerJahre < 8) {
        fristMonate = 6
        fristBegruendung = 'Wohndauer 5-8 Jahre: 6 Monate Kündigungsfrist'
      } else {
        fristMonate = 9
        fristBegruendung = 'Wohndauer über 8 Jahre: 9 Monate Kündigungsfrist'
      }
    }

    // Nächstmöglicher Kündigungstermin (zum Monatsende, Zugang bis 3. Werktag)
    let wirksamerMonat: Date

    if (kuendigung.getDate() <= 3) {
      // Kündigung wird in diesem Monat wirksam
      wirksamerMonat = startOfMonth(kuendigung)
    } else {
      // Erst nächsten Monat wirksam
      wirksamerMonat = startOfMonth(addMonths(kuendigung, 1))
    }

    // Auszugsdatum = Ende des Monats nach Ablauf der Kündigungsfrist
    const auszugsDatum = endOfMonth(addMonths(wirksamerMonat, fristMonate))

    // Letztmöglicher Zugang für diesen Termin
    const letzterZugang = setDate(wirksamerMonat, 3)

    return {
      wohndauerJahre,
      wohndauerMonate,
      fristMonate,
      fristBegruendung,
      auszugsDatum,
      letzterZugang,
      wirksamerMonat
    }
  }

  const ergebnis = berechneErgebnis()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kündigungsfrist-Rechner</h1>
              <p className="text-muted-foreground">
                Berechnen Sie die gesetzliche Kündigungsfrist für Mietverhältnisse
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eingabe */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eingaben</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="mietbeginn">Mietbeginn</Label>
                  <Input
                    id="mietbeginn"
                    type="date"
                    value={mietbeginn}
                    onChange={(e) => setMietbeginn(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wann hat das Mietverhältnis begonnen?
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Wer kündigt?</Label>
                  <RadioGroup
                    value={kuendigender}
                    onValueChange={(v) => setKuendigender(v as 'mieter' | 'vermieter')}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mieter" id="mieter" />
                      <Label htmlFor="mieter" className="cursor-pointer">Mieter kündigt</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vermieter" id="vermieter" />
                      <Label htmlFor="vermieter" className="cursor-pointer">Vermieter kündigt</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="kuendigungsDatum">Geplantes Kündigungsdatum</Label>
                  <Input
                    id="kuendigungsDatum"
                    type="date"
                    value={kuendigungsDatum}
                    onChange={(e) => setKuendigungsDatum(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Wann soll die Kündigung zugestellt werden?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info-Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Wichtige Hinweise</p>
                    <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
                      <li>Kündigung muss schriftlich erfolgen (§ 568 BGB)</li>
                      <li>Zugang spätestens am 3. Werktag des Monats</li>
                      <li>Per Einschreiben/Rückschein empfohlen</li>
                      <li>Vermieter benötigt einen Kündigungsgrund</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ergebnis */}
          <div>
            {ergebnis ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Ergebnis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wohndauer */}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Bisherige Wohndauer</p>
                    <p className="text-2xl font-bold">
                      {ergebnis.wohndauerJahre} Jahre, {ergebnis.wohndauerMonate % 12} Monate
                    </p>
                  </div>

                  {/* Kündigungsfrist */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">Kündigungsfrist</p>
                    <p className="text-3xl font-bold text-primary">
                      {ergebnis.fristMonate} Monate
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ergebnis.fristBegruendung}
                    </p>
                  </div>

                  <Separator />

                  {/* Termine */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Kündigung wirksam ab:</span>
                      <Badge variant="secondary">
                        {format(ergebnis.wirksamerMonat, 'MMMM yyyy', { locale: de })}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Letzter Zugang für diesen Termin:</span>
                      <span className="font-medium">
                        {format(ergebnis.letzterZugang, 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">Frühestmögliches Auszugsdatum</p>
                      <p className="text-2xl font-bold text-green-700">
                        {format(ergebnis.auszugsDatum, 'dd.MM.yyyy', { locale: de })}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        (Ende des Monats {format(ergebnis.auszugsDatum, 'MMMM yyyy', { locale: de })})
                      </p>
                    </div>
                  </div>

                  {/* Warnung bei Vermieter */}
                  {kuendigender === 'vermieter' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Kündigungsgrund erforderlich</p>
                          <p className="text-yellow-600">
                            Als Vermieter benötigen Sie einen gesetzlich anerkannten
                            Kündigungsgrund (z.B. Eigenbedarf, schwere Vertragsverletzung).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aktion */}
                  <Link to="/formulare/kuendigung">
                    <Button className="w-full">
                      Kündigung erstellen
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Bitte geben Sie den Mietbeginn ein,</p>
                    <p>um die Kündigungsfrist zu berechnen.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Gesetzliche Grundlage */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Gesetzliche Grundlage (§ 573c BGB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Wohndauer</th>
                    <th className="text-center py-2 font-medium">Mieter</th>
                    <th className="text-center py-2 font-medium">Vermieter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Bis 5 Jahre</td>
                    <td className="text-center py-2">3 Monate</td>
                    <td className="text-center py-2">3 Monate</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">5 bis 8 Jahre</td>
                    <td className="text-center py-2">3 Monate</td>
                    <td className="text-center py-2">6 Monate</td>
                  </tr>
                  <tr>
                    <td className="py-2">Über 8 Jahre</td>
                    <td className="text-center py-2">3 Monate</td>
                    <td className="text-center py-2">9 Monate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
