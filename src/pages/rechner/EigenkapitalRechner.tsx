import { useState } from 'react'
import { Home, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import RechnerLayout from '@/components/rechner/RechnerLayout'

interface EigenkapitalResult {
  gesamtkosten: number
  fremdkapital: number
  eigenkapitalQuote: number
  beleihungsauslauf: number
  mindestEK: number
  empfohlenEK: number
  optimalEK: number
  bewertung: string
}

export default function EigenkapitalRechner() {
  const [kaufpreis, setKaufpreis] = useState<string>('')
  const [nebenkosten, setNebenkosten] = useState<string>('10')
  const [eigenkapital, setEigenkapital] = useState<string>('')
  const [result, setResult] = useState<EigenkapitalResult | null>(null)

  const berechnen = () => {
    const kp = parseFloat(kaufpreis) || 0
    const nk = parseFloat(nebenkosten) || 0
    const ek = parseFloat(eigenkapital) || 0

    const nebenkostenBetrag = kp * (nk / 100)
    const gesamtkosten = kp + nebenkostenBetrag
    const fremdkapital = gesamtkosten - ek
    const eigenkapitalQuote = (ek / gesamtkosten) * 100
    const beleihungsauslauf = (fremdkapital / kp) * 100

    const mindestEK = nebenkostenBetrag
    const empfohlenEK = gesamtkosten * 0.2
    const optimalEK = gesamtkosten * 0.3

    let bewertung = 'gut'
    if (ek < mindestEK) bewertung = 'kritisch'
    else if (ek < empfohlenEK) bewertung = 'akzeptabel'
    else if (ek >= optimalEK) bewertung = 'optimal'

    setResult({
      gesamtkosten,
      fremdkapital,
      eigenkapitalQuote,
      beleihungsauslauf,
      mindestEK,
      empfohlenEK,
      optimalEK,
      bewertung,
    })
  }

  return (
    <RechnerLayout
      title="Eigenkapital-Rechner"
      description="Wie viel Eigenkapital brauchst du?"
      icon={<Home className="h-8 w-8 text-white" />}
    >
      <Card>
              <CardHeader><CardTitle>Eingaben</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kaufpreis *</label>
                    <div className="relative">
                      <input type="number" value={kaufpreis} onChange={(e) => setKaufpreis(e.target.value)} placeholder="400000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kaufnebenkosten</label>
                    <div className="relative">
                      <input type="number" value={nebenkosten} onChange={(e) => setNebenkosten(e.target.value)} placeholder="10" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Dein Eigenkapital *</label>
                  <div className="relative">
                    <input type="number" value={eigenkapital} onChange={(e) => setEigenkapital(e.target.value)} placeholder="80000" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={berechnen} disabled={!kaufpreis || !eigenkapital} className="flex-1 gradient-vermieter text-white">Berechnen</Button>
                  <Button variant="outline" onClick={() => { setKaufpreis(''); setEigenkapital(''); setResult(null) }}>Zurücksetzen</Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {result ? (
                <>
                  <Card className={result.bewertung === 'kritisch' ? 'border-destructive/30' : result.bewertung === 'optimal' ? 'border-success/30' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {result.bewertung === 'kritisch' ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <CheckCircle2 className="h-5 w-5 text-success" />}
                        Bewertung: {result.bewertung.charAt(0).toUpperCase() + result.bewertung.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-1">EK-Quote</p>
                        <p className="text-4xl font-bold gradient-text-vermieter">{result.eigenkapitalQuote.toFixed(1)}%</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Fremdkapital</p>
                          <p className="font-semibold">{formatCurrency(result.fremdkapital)}</p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Beleihung</p>
                          <p className="font-semibold">{result.beleihungsauslauf.toFixed(0)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base">Empfehlungen</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Minimum (Nebenkosten)</span><span className="font-medium">{formatCurrency(result.mindestEK)}</span></div>
                      <div className="flex justify-between"><span>Empfohlen (20%)</span><span className="font-medium">{formatCurrency(result.empfohlenEK)}</span></div>
                      <div className="flex justify-between"><span>Optimal (30%)</span><span className="font-medium">{formatCurrency(result.optimalEK)}</span></div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Home className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Gib Kaufpreis und Eigenkapital ein</p>
                  </CardContent>
                </Card>
              )}
      </div>
    </RechnerLayout>
  )
}
