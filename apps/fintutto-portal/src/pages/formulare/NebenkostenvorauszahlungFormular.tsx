import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle, useMetaTags, useJsonLd, useKeyboardNav, useUnsavedChanges } from '@fintutto/shared'
import { toast } from 'sonner'
import { useTrackTool } from '@/hooks/useTrackTool'

interface FormData {
  vermieterName: string
  vermieterStrasse: string
  vermieterPlzOrt: string
  mieterName: string
  mieterStrasse: string
  mieterPlzOrt: string
  mietobjekt: string
  aktuelleVorauszahlung: string
  neueVorauszahlung: string
  aenderungAb: string
  begruendung: 'betriebskosten_gestiegen' | 'energiekosten' | 'abrechnung_nachzahlung' | 'sonstig'
  begruendungDetails: string
  abrechnung: { kostenart: string; alt: string; neu: string }[]
  datum: string
}

const BEGRUENDUNGEN = [
  { key: 'betriebskosten_gestiegen' as const, label: 'Betriebskosten gestiegen', text: 'Die Betriebskosten für das Mietobjekt sind im Vergleich zum Vorjahr gestiegen.' },
  { key: 'energiekosten' as const, label: 'Energiekosten erhöht', text: 'Die Energiekosten (Heizung, Warmwasser) haben sich erheblich erhöht.' },
  { key: 'abrechnung_nachzahlung' as const, label: 'Nachzahlung aus Abrechnung', text: 'Die letzte Betriebskostenabrechnung hat eine erhebliche Nachzahlung ergeben, die eine Anpassung der Vorauszahlungen erforderlich macht.' },
  { key: 'sonstig' as const, label: 'Sonstiger Grund', text: '' },
]

const DEFAULT_KOSTENARTEN = [
  'Grundsteuer', 'Wasser/Abwasser', 'Müllabfuhr', 'Heizung',
  'Warmwasser', 'Aufzug', 'Straßenreinigung', 'Gebäudeversicherung',
]

const initial: FormData = {
  vermieterName: '', vermieterStrasse: '', vermieterPlzOrt: '',
  mieterName: '', mieterStrasse: '', mieterPlzOrt: '',
  mietobjekt: '',
  aktuelleVorauszahlung: '', neueVorauszahlung: '',
  aenderungAb: '',
  begruendung: 'betriebskosten_gestiegen', begruendungDetails: '',
  abrechnung: DEFAULT_KOSTENARTEN.map((k) => ({ kostenart: k, alt: '', neu: '' })),
  datum: new Date().toISOString().split('T')[0],
}

export default function NebenkostenvorauszahlungFormular() {
  useDocumentTitle('Nebenkostenvorauszahlung', 'Fintutto Portal')
  useTrackTool('Nebenkostenvorauszahlung')
  useMetaTags({
    title: 'Nebenkostenvorauszahlung anpassen – §560 BGB konform',
    description: 'Erstelle ein Anpassungsschreiben für die Nebenkostenvorauszahlung. 8 Kostenarten, Vergleichsübersicht.',
    path: '/formulare/nebenkostenvorauszahlung',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Nebenkostenvorauszahlung-Generator',
    description: 'Erstelle ein Anpassungsschreiben für die Nebenkostenvorauszahlung nach §560 BGB',
    url: 'https://portal.fintutto.cloud/formulare/nebenkostenvorauszahlung',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  const navigate = useNavigate()
  useKeyboardNav({ onEscape: () => navigate('/formulare') })
  const { setDirty } = useUnsavedChanges()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initial)

  const update = (fields: Partial<FormData>) => { setData((d) => ({ ...d, ...fields })); setDirty() }

  const updateKostenart = (i: number, fields: Partial<FormData['abrechnung'][0]>) => {
    setData((d) => ({
      ...d,
      abrechnung: d.abrechnung.map((k, idx) => idx === i ? { ...k, ...fields } : k),
    }))
  }

  const addKostenart = () => {
    setData((d) => ({ ...d, abrechnung: [...d.abrechnung, { kostenart: '', alt: '', neu: '' }] }))
  }

  const parseNum = (s: string) => parseFloat(s.replace(',', '.')) || 0
  const summeAlt = data.abrechnung.reduce((s, k) => s + parseNum(k.alt), 0)
  const summeNeu = data.abrechnung.reduce((s, k) => s + parseNum(k.neu), 0)
  const differenz = summeNeu - summeAlt

  const begruendungInfo = BEGRUENDUNGEN.find((b) => b.key === data.begruendung)!

  const steps = ['Parteien', 'Kosten', 'Begründung', 'Schreiben']

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Nebenkostenvorauszahlung anpassen</h1>
      <p className="text-muted-foreground mb-6">Schreiben zur Anpassung der Nebenkostenvorauszahlung nach §560 BGB</p>

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
              <h2 className="text-xl font-semibold">Parteien & Mietobjekt</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Vermieter</h3>
                  <input placeholder="Name" value={data.vermieterName} onChange={(e) => update({ vermieterName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.vermieterStrasse} onChange={(e) => update({ vermieterStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.vermieterPlzOrt} onChange={(e) => update({ vermieterPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Mieter</h3>
                  <input placeholder="Name" value={data.mieterName} onChange={(e) => update({ mieterName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.mieterStrasse} onChange={(e) => update({ mieterStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.mieterPlzOrt} onChange={(e) => update({ mieterPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mietobjekt</label>
                <input value={data.mietobjekt} onChange={(e) => update({ mietobjekt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Anpassung gilt ab</label>
                <input type="date" value={data.aenderungAb} onChange={(e) => update({ aenderungAb: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Kostenaufstellung</h2>
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-3">
                <div className="col-span-3">Kostenart</div>
                <div className="col-span-2 text-right">Bisher (€/Monat)</div>
                <div className="col-span-2 text-right">Neu (€/Monat)</div>
              </div>
              {data.abrechnung.map((k, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 p-2 bg-muted/50 rounded-lg">
                  <input value={k.kostenart} onChange={(e) => updateKostenart(i, { kostenart: e.target.value })} className="col-span-3 px-3 py-2 border rounded-lg text-sm" />
                  <input value={k.alt} onChange={(e) => updateKostenart(i, { alt: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg text-sm text-right" placeholder="0,00" />
                  <input value={k.neu} onChange={(e) => updateKostenart(i, { neu: e.target.value })} className="col-span-2 px-3 py-2 border rounded-lg text-sm text-right" placeholder="0,00" />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addKostenart}>+ Kostenart hinzufügen</Button>

              <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span>Summe bisher:</span><strong>{summeAlt.toFixed(2)} €/Monat</strong></div>
                <div className="flex justify-between"><span>Summe neu:</span><strong>{summeNeu.toFixed(2)} €/Monat</strong></div>
                <div className={`flex justify-between font-bold ${differenz > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>Differenz:</span><span>{differenz > 0 ? '+' : ''}{differenz.toFixed(2)} €/Monat</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Begründung</h2>
              <div className="space-y-2">
                {BEGRUENDUNGEN.map((b) => (
                  <button key={b.key} onClick={() => update({ begruendung: b.key })} className={`w-full p-3 rounded-lg border text-left text-sm ${data.begruendung === b.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                    <div className="font-medium">{b.label}</div>
                    {b.text && <div className="text-xs text-muted-foreground mt-1">{b.text}</div>}
                  </button>
                ))}
              </div>
              {data.begruendung === 'sonstig' && (
                <textarea value={data.begruendungDetails} onChange={(e) => update({ begruendungDetails: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Bitte Begründung angeben..." />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Aktuelle Vorauszahlung (€)</label>
                  <input value={data.aktuelleVorauszahlung} onChange={(e) => update({ aktuelleVorauszahlung: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="150,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Neue Vorauszahlung (€)</label>
                  <input value={data.neueVorauszahlung} onChange={(e) => update({ neueVorauszahlung: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="180,00" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Anpassungsschreiben</h2>
              <div className="bg-white border rounded-lg p-8 text-sm leading-relaxed" id="nebenkosten-print">
                <div className="mb-6">
                  <p className="font-semibold">{data.vermieterName}</p>
                  <p>{data.vermieterStrasse}</p>
                  <p>{data.vermieterPlzOrt}</p>
                </div>
                <div className="mb-6">
                  <p>{data.mieterName}</p>
                  <p>{data.mieterStrasse}</p>
                  <p>{data.mieterPlzOrt}</p>
                </div>
                <p className="text-right mb-6">{new Date(data.datum).toLocaleDateString('de-DE')}</p>
                <p className="font-bold mb-4">Anpassung der Nebenkostenvorauszahlung – Mietobjekt: {data.mietobjekt}</p>
                <p className="mb-2">Sehr geehrte/r {data.mieterName},</p>
                <p className="mb-4">
                  gemäß §560 BGB bin ich als Vermieter berechtigt, nach einer Betriebskostenabrechnung die
                  monatliche Vorauszahlung auf eine angemessene Höhe anzupassen.{' '}
                  {begruendungInfo.text || data.begruendungDetails}
                </p>

                <p className="font-semibold mb-2">Übersicht der Kostenänderungen:</p>
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Kostenart</th>
                      <th className="text-right py-1">Bisher</th>
                      <th className="text-right py-1">Neu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.abrechnung.filter((k) => k.alt || k.neu).map((k, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1">{k.kostenart}</td>
                        <td className="text-right py-1">{k.alt || '—'} €</td>
                        <td className="text-right py-1">{k.neu || '—'} €</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="py-2">Gesamt</td>
                      <td className="text-right py-2">{summeAlt.toFixed(2)} €</td>
                      <td className="text-right py-2">{summeNeu.toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p><strong>Bisherige Vorauszahlung:</strong> {data.aktuelleVorauszahlung} €/Monat</p>
                  <p><strong>Neue Vorauszahlung:</strong> {data.neueVorauszahlung} €/Monat</p>
                  <p><strong>Gültig ab:</strong> {data.aenderungAb && new Date(data.aenderungAb).toLocaleDateString('de-DE')}</p>
                </div>

                <p className="mb-4">
                  Die Anpassung erfolgt gemäß §560 Abs. 4 BGB mit der übernächsten Mietzahlung nach
                  Zugang dieses Schreibens. Ich bitte Sie, die neue Vorauszahlung von{' '}
                  <strong>{data.neueVorauszahlung} €</strong> ab dem genannten Datum zu berücksichtigen.
                </p>

                <p className="mt-6">Mit freundlichen Grüßen</p>
                <p className="mt-6">_________________________</p>
                <p className="text-xs text-muted-foreground">{data.vermieterName}</p>
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
            <Button onClick={() => { setStep(step + 1); if (step === steps.length - 2) toast.success('Dokument erstellt') }} disabled={step === steps.length - 1}>
              Weiter <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
