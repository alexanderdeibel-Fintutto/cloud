import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@fintutto/shared'
import { useTrackTool } from '@/hooks/useTrackTool'

interface FormData {
  vermieterName: string
  vermieterStrasse: string
  vermieterPlzOrt: string
  mieterName: string
  mieterGeburtsdatum: string
  mietobjekt: string
  wohnflaeche: string
  zimmer: string
  mietbeginn: string
  mietende: string
  nettokaltmiete: string
  nebenkosten: string
  warmmiete: string
  zahlungsverhalten: 'immer_puenktlich' | 'meist_puenktlich' | 'gelegentlich_verspaetet'
  mietrueckstaende: boolean
  mietrueckstandBetrag: string
  zweck: 'behoerde' | 'neuer_vermieter' | 'bank' | 'sonstiges'
  datum: string
}

const initial: FormData = {
  vermieterName: '', vermieterStrasse: '', vermieterPlzOrt: '',
  mieterName: '', mieterGeburtsdatum: '',
  mietobjekt: '', wohnflaeche: '', zimmer: '',
  mietbeginn: '', mietende: '',
  nettokaltmiete: '', nebenkosten: '', warmmiete: '',
  zahlungsverhalten: 'immer_puenktlich',
  mietrueckstaende: false, mietrueckstandBetrag: '',
  zweck: 'behoerde',
  datum: new Date().toISOString().split('T')[0],
}

const ZWECKE = [
  { key: 'behoerde' as const, label: 'Behörde / Amt' },
  { key: 'neuer_vermieter' as const, label: 'Neuer Vermieter' },
  { key: 'bank' as const, label: 'Bank / Kreditinstitut' },
  { key: 'sonstiges' as const, label: 'Sonstiges' },
]

const ZAHLUNGSVERHALTEN = [
  { key: 'immer_puenktlich' as const, label: 'Immer pünktlich' },
  { key: 'meist_puenktlich' as const, label: 'Meist pünktlich' },
  { key: 'gelegentlich_verspaetet' as const, label: 'Gelegentlich verspätet' },
]

export default function MietbescheinigungFormular() {
  useDocumentTitle('Mietbescheinigung', 'Fintutto Portal')
  useTrackTool('Mietbescheinigung')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initial)

  const update = (fields: Partial<FormData>) => setData((d) => ({ ...d, ...fields }))

  const steps = ['Parteien', 'Mietobjekt', 'Zahlungen', 'Bescheinigung']

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Mietbescheinigung</h1>
      <p className="text-muted-foreground mb-6">Offizielle Bestätigung des Mietverhältnisses für Behörden, Banken oder neue Vermieter</p>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 text-center text-xs py-2 rounded-full ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Vermieter & Mieter</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Vermieter / Hausverwaltung</h3>
                  <input placeholder="Name / Firma" value={data.vermieterName} onChange={(e) => update({ vermieterName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.vermieterStrasse} onChange={(e) => update({ vermieterStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.vermieterPlzOrt} onChange={(e) => update({ vermieterPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Mieter</h3>
                  <input placeholder="Name" value={data.mieterName} onChange={(e) => update({ mieterName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Geburtsdatum</label>
                    <input type="date" value={data.mieterGeburtsdatum} onChange={(e) => update({ mieterGeburtsdatum: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Verwendungszweck</label>
                <div className="grid grid-cols-2 gap-2">
                  {ZWECKE.map((z) => (
                    <button key={z.key} onClick={() => update({ zweck: z.key })} className={`p-3 rounded-lg border text-sm text-left ${data.zweck === z.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mietobjekt</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Adresse des Mietobjekts</label>
                <input value={data.mietobjekt} onChange={(e) => update({ mietobjekt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wohnfläche (m²)</label>
                  <input value={data.wohnflaeche} onChange={(e) => update({ wohnflaeche: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="65" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zimmer</label>
                  <input value={data.zimmer} onChange={(e) => update({ zimmer: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mietbeginn</label>
                  <input type="date" value={data.mietbeginn} onChange={(e) => update({ mietbeginn: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mietende (leer = laufend)</label>
                  <input type="date" value={data.mietende} onChange={(e) => update({ mietende: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mietkosten & Zahlungsverhalten</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nettokaltmiete (€)</label>
                  <input value={data.nettokaltmiete} onChange={(e) => update({ nettokaltmiete: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="500,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nebenkosten (€)</label>
                  <input value={data.nebenkosten} onChange={(e) => update({ nebenkosten: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="150,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warmmiete (€)</label>
                  <input value={data.warmmiete} onChange={(e) => update({ warmmiete: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="650,00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Zahlungsverhalten</label>
                <div className="space-y-2">
                  {ZAHLUNGSVERHALTEN.map((z) => (
                    <label key={z.key} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="zahlungsverhalten" checked={data.zahlungsverhalten === z.key} onChange={() => update({ zahlungsverhalten: z.key })} />
                      {z.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={data.mietrueckstaende} onChange={(e) => update({ mietrueckstaende: e.target.checked })} />
                  Es bestehen Mietrückstände
                </label>
                {data.mietrueckstaende && (
                  <input value={data.mietrueckstandBetrag} onChange={(e) => update({ mietrueckstandBetrag: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-2" placeholder="Rückstandsbetrag in €" />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mietbescheinigung</h2>
              <div className="bg-white border rounded-lg p-8 text-sm leading-relaxed" id="mietbescheinigung-print">
                <div className="mb-6">
                  <p className="font-semibold">{data.vermieterName}</p>
                  <p>{data.vermieterStrasse}</p>
                  <p>{data.vermieterPlzOrt}</p>
                </div>
                <p className="text-right mb-6">{new Date(data.datum).toLocaleDateString('de-DE')}</p>
                <p className="font-bold text-lg mb-6 text-center">Mietbescheinigung</p>

                <p className="mb-4">
                  Hiermit bestätige ich als Vermieter, dass folgendes Mietverhältnis besteht
                  {data.mietende ? ' bzw. bestanden hat' : ''}:
                </p>

                <table className="w-full mb-6">
                  <tbody className="text-sm">
                    <tr className="border-b"><td className="py-2 font-medium w-1/3">Mieter:</td><td className="py-2">{data.mieterName}</td></tr>
                    {data.mieterGeburtsdatum && <tr className="border-b"><td className="py-2 font-medium">Geb. am:</td><td className="py-2">{new Date(data.mieterGeburtsdatum).toLocaleDateString('de-DE')}</td></tr>}
                    <tr className="border-b"><td className="py-2 font-medium">Mietobjekt:</td><td className="py-2">{data.mietobjekt}</td></tr>
                    {data.wohnflaeche && <tr className="border-b"><td className="py-2 font-medium">Wohnfläche:</td><td className="py-2">{data.wohnflaeche} m²</td></tr>}
                    {data.zimmer && <tr className="border-b"><td className="py-2 font-medium">Zimmer:</td><td className="py-2">{data.zimmer}</td></tr>}
                    <tr className="border-b"><td className="py-2 font-medium">Mietbeginn:</td><td className="py-2">{data.mietbeginn && new Date(data.mietbeginn).toLocaleDateString('de-DE')}</td></tr>
                    {data.mietende && <tr className="border-b"><td className="py-2 font-medium">Mietende:</td><td className="py-2">{new Date(data.mietende).toLocaleDateString('de-DE')}</td></tr>}
                    {!data.mietende && <tr className="border-b"><td className="py-2 font-medium">Status:</td><td className="py-2">Mietverhältnis besteht fort</td></tr>}
                  </tbody>
                </table>

                <p className="font-semibold mb-2">Monatliche Miete:</p>
                <table className="w-full mb-6">
                  <tbody className="text-sm">
                    <tr className="border-b"><td className="py-1 w-1/3">Nettokaltmiete:</td><td className="py-1 text-right">{data.nettokaltmiete} €</td></tr>
                    <tr className="border-b"><td className="py-1">Nebenkosten:</td><td className="py-1 text-right">{data.nebenkosten} €</td></tr>
                    <tr className="border-b font-bold"><td className="py-1">Warmmiete (gesamt):</td><td className="py-1 text-right">{data.warmmiete} €</td></tr>
                  </tbody>
                </table>

                <p className="mb-2">
                  <strong>Zahlungsverhalten:</strong>{' '}
                  {data.zahlungsverhalten === 'immer_puenktlich' && 'Die Miete wurde stets pünktlich und vollständig gezahlt.'}
                  {data.zahlungsverhalten === 'meist_puenktlich' && 'Die Miete wurde in der Regel pünktlich gezahlt.'}
                  {data.zahlungsverhalten === 'gelegentlich_verspaetet' && 'Die Mietzahlung erfolgte gelegentlich verspätet.'}
                </p>

                {data.mietrueckstaende ? (
                  <p className="mb-4 text-red-600">
                    Es bestehen Mietrückstände in Höhe von {data.mietrueckstandBetrag} €.
                  </p>
                ) : (
                  <p className="mb-4">Es bestehen keine Mietrückstände.</p>
                )}

                <p className="mb-2">
                  Diese Bescheinigung wird auf Wunsch des Mieters ausgestellt und dient zur Vorlage bei{' '}
                  {data.zweck === 'behoerde' && 'der zuständigen Behörde.'}
                  {data.zweck === 'neuer_vermieter' && 'einem neuen Vermieter.'}
                  {data.zweck === 'bank' && 'einem Kreditinstitut.'}
                  {data.zweck === 'sonstiges' && 'dem jeweiligen Empfänger.'}
                </p>

                <p className="mt-8">Mit freundlichen Grüßen</p>
                <p className="mt-8">_________________________</p>
                <p className="text-xs text-muted-foreground">{data.vermieterName}</p>
                <p className="text-xs text-muted-foreground">Ort, Datum, Unterschrift</p>
              </div>
              <Button onClick={() => window.print()} className="w-full">
                <Printer className="h-4 w-4 mr-2" /> Drucken / PDF speichern
              </Button>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
            </Button>
            <Button onClick={() => setStep(step + 1)} disabled={step === steps.length - 1}>
              Weiter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
