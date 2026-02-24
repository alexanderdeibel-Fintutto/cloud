import { useState } from 'react'
import { Receipt, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import RechnerLayout from '@/components/rechner/RechnerLayout'

const kostenarten = [
  'Grundsteuer', 'Wasserversorgung', 'Entwässerung', 'Heizung', 'Warmwasser',
  'Aufzug', 'Straßenreinigung', 'Müllabfuhr', 'Hausreinigung', 'Gartenpflege',
  'Beleuchtung', 'Schornsteinfeger', 'Versicherungen', 'Hauswart', 'Antenne/Kabel', 'Sonstiges'
]

interface NebenkostenEinzelkosten {
  art: string
  betrag: number
}

interface NebenkostenResult {
  gesamtKosten: number
  vorauszahlungGesamt: number
  differenz: number
  kostenProQm: number
  monate: number
  einzelkosten: NebenkostenEinzelkosten[]
}

export default function NebenkostenRechner() {
  const [wohnflaeche, setWohnflaeche] = useState<string>('')
  const [vorauszahlung, setVorauszahlung] = useState<string>('')
  const [zeitraum, setZeitraum] = useState<string>('12')
  const [kosten, setKosten] = useState<{art: string, betrag: string}[]>([{ art: 'Grundsteuer', betrag: '' }])
  const [result, setResult] = useState<NebenkostenResult | null>(null)

  const addKosten = () => setKosten([...kosten, { art: 'Sonstiges', betrag: '' }])
  const removeKosten = (i: number) => setKosten(kosten.filter((_, idx) => idx !== i))
  const updateKosten = (i: number, field: string, value: string) => {
    const neu = [...kosten]
    neu[i] = { ...neu[i], [field]: value }
    setKosten(neu)
  }

  const berechnen = () => {
    const wf = parseFloat(wohnflaeche) || 1
    const vz = parseFloat(vorauszahlung) || 0
    const monate = parseFloat(zeitraum) || 12

    const gesamtKosten = kosten.reduce((sum, k) => sum + (parseFloat(k.betrag) || 0), 0)
    const vorauszahlungGesamt = vz * monate
    const differenz = vorauszahlungGesamt - gesamtKosten
    const kostenProQm = gesamtKosten / wf

    setResult({
      gesamtKosten,
      vorauszahlungGesamt,
      differenz,
      kostenProQm,
      monate,
      einzelkosten: kosten.map(k => ({ ...k, betrag: parseFloat(k.betrag) || 0 })),
    })
  }

  return (
    <RechnerLayout
      title="Nebenkosten-Rechner"
      description="Nebenkostenabrechnung berechnen"
      icon={<Receipt className="h-8 w-8 text-white" />}
    >
      <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Grunddaten</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Wohnfläche</label>
                      <div className="relative">
                        <input type="number" value={wohnflaeche} onChange={(e) => setWohnflaeche(e.target.value)} placeholder="80" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vorauszahlung/Monat</label>
                      <div className="relative">
                        <input type="number" value={vorauszahlung} onChange={(e) => setVorauszahlung(e.target.value)} placeholder="200" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zeitraum</label>
                      <div className="relative">
                        <input type="number" value={zeitraum} onChange={(e) => setZeitraum(e.target.value)} placeholder="12" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">Monate</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Kostenarten</CardTitle>
                  <Button variant="outline" size="sm" onClick={addKosten}><Plus className="h-4 w-4 mr-1" />Hinzufügen</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kosten.map((k, i) => (
                    <div key={i} className="flex gap-2">
                      <select value={k.art} onChange={(e) => updateKosten(i, 'art', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm">
                        {kostenarten.map(art => <option key={art} value={art}>{art}</option>)}
                      </select>
                      <div className="relative w-32">
                        <input type="number" value={k.betrag} onChange={(e) => updateKosten(i, 'betrag', e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                      </div>
                      {kosten.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeKosten(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={berechnen} className="flex-1 gradient-vermieter text-white">Berechnen</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {result ? (
                <Card>
                  <CardHeader><CardTitle>Abrechnung</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {result.einzelkosten.filter((k: NebenkostenEinzelkosten) => k.betrag > 0).map((k: NebenkostenEinzelkosten, i: number) => (
                        <div key={i} className="flex justify-between"><span>{k.art}</span><span>{formatCurrency(k.betrag)}</span></div>
                      ))}
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between font-medium"><span>Gesamtkosten</span><span>{formatCurrency(result.gesamtKosten)}</span></div>
                      <div className="flex justify-between text-sm text-muted-foreground"><span>Vorauszahlungen ({result.monate} Mon.)</span><span>{formatCurrency(result.vorauszahlungGesamt)}</span></div>
                    </div>
                    <div className={'text-center py-4 rounded-lg ' + (result.differenz >= 0 ? 'bg-success/10' : 'bg-destructive/10')}>
                      <p className="text-sm text-muted-foreground">{result.differenz >= 0 ? 'Guthaben für Mieter' : 'Nachzahlung durch Mieter'}</p>
                      <p className={'text-3xl font-bold ' + (result.differenz >= 0 ? 'text-success' : 'text-destructive')}>
                        {formatCurrency(Math.abs(result.differenz))}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Kosten pro m²: {formatCurrency(result.kostenProQm)}/Jahr
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Füge Kosten hinzu</p>
                  </CardContent>
                </Card>
              )}
      </div>
    </RechnerLayout>
  )
}
