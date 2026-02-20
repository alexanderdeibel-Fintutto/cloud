import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@fintutto/shared'
import { useTrackTool } from '@/hooks/useTrackTool'

type MahnStufe = 'zahlungserinnerung' | 'erste_mahnung' | 'zweite_mahnung' | 'letzte_mahnung'

interface FormData {
  glaeubigerName: string
  glaeubigerStrasse: string
  glaeubigerPlzOrt: string
  schuldnerName: string
  schuldnerStrasse: string
  schuldnerPlzOrt: string
  mietobjekt: string
  stufe: MahnStufe
  forderungen: { bezeichnung: string; betrag: string; faelligDatum: string }[]
  mahngebuehr: string
  verzugszinsen: string
  fristTage: number
  datum: string
  bankName: string
  iban: string
  verwendungszweck: string
}

const STUFEN: { key: MahnStufe; label: string; ton: string }[] = [
  { key: 'zahlungserinnerung', label: 'Zahlungserinnerung', ton: 'freundlich' },
  { key: 'erste_mahnung', label: '1. Mahnung', ton: 'sachlich' },
  { key: 'zweite_mahnung', label: '2. Mahnung', ton: 'bestimmt' },
  { key: 'letzte_mahnung', label: 'Letzte Mahnung', ton: 'mit Androhung rechtl. Schritte' },
]

const initial: FormData = {
  glaeubigerName: '', glaeubigerStrasse: '', glaeubigerPlzOrt: '',
  schuldnerName: '', schuldnerStrasse: '', schuldnerPlzOrt: '',
  mietobjekt: '', stufe: 'zahlungserinnerung',
  forderungen: [{ bezeichnung: 'Miete', betrag: '', faelligDatum: '' }],
  mahngebuehr: '5,00', verzugszinsen: '0', fristTage: 14,
  datum: new Date().toISOString().split('T')[0],
  bankName: '', iban: '', verwendungszweck: '',
}

export default function MahnungFormular() {
  useDocumentTitle('Mahnung', 'Fintutto Portal')
  useTrackTool('Mahnung')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initial)

  const update = (fields: Partial<FormData>) => setData((d) => ({ ...d, ...fields }))

  const addForderung = () => {
    setData((d) => ({ ...d, forderungen: [...d.forderungen, { bezeichnung: '', betrag: '', faelligDatum: '' }] }))
  }

  const updateForderung = (i: number, fields: Partial<FormData['forderungen'][0]>) => {
    setData((d) => ({
      ...d,
      forderungen: d.forderungen.map((f, idx) => idx === i ? { ...f, ...fields } : f),
    }))
  }

  const gesamtForderung = data.forderungen.reduce((sum, f) => sum + (parseFloat(f.betrag.replace(',', '.')) || 0), 0)
  const mahngebuehrNum = parseFloat(data.mahngebuehr.replace(',', '.')) || 0
  const gesamt = gesamtForderung + (data.stufe !== 'zahlungserinnerung' ? mahngebuehrNum : 0)

  const stufeInfo = STUFEN.find((s) => s.key === data.stufe)!

  const steps = ['Parteien', 'Forderungen', 'Optionen', 'Schreiben']

  const getAnrede = () => {
    switch (data.stufe) {
      case 'zahlungserinnerung': return 'Sehr geehrte/r'
      case 'erste_mahnung': return 'Sehr geehrte/r'
      case 'zweite_mahnung': return 'Sehr geehrte/r'
      case 'letzte_mahnung': return 'Sehr geehrte/r'
    }
  }

  const getTextBody = () => {
    const fristDatum = new Date(Date.now() + data.fristTage * 86400000).toLocaleDateString('de-DE')

    switch (data.stufe) {
      case 'zahlungserinnerung':
        return `bei der Prüfung unserer Buchhaltung ist uns aufgefallen, dass der nachfolgend aufgeführte Betrag noch nicht auf unserem Konto eingegangen ist. Wir möchten Sie freundlich daran erinnern, die ausstehende Zahlung bis zum ${fristDatum} zu begleichen.`
      case 'erste_mahnung':
        return `trotz unserer Zahlungserinnerung ist der nachfolgend aufgeführte Betrag noch nicht bei uns eingegangen. Wir bitten Sie, die ausstehende Zahlung bis zum ${fristDatum} auf unser Konto zu überweisen.`
      case 'zweite_mahnung':
        return `leider ist trotz unserer bisherigen Mahnungen der ausstehende Betrag noch nicht beglichen worden. Wir fordern Sie hiermit nachdrücklich auf, den Gesamtbetrag bis zum ${fristDatum} zu überweisen.`
      case 'letzte_mahnung':
        return `trotz mehrfacher Aufforderung haben wir noch keinen Zahlungseingang feststellen können. Wir fordern Sie hiermit letztmalig auf, den Gesamtbetrag bis zum ${fristDatum} zu begleichen. Sollte die Zahlung nicht fristgerecht erfolgen, sehen wir uns gezwungen, die Forderung gerichtlich geltend zu machen und gegebenenfalls ein Mahnverfahren einzuleiten.`
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6">
        <Link to="/formulare" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Zurück zu Formulare
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Mahnschreiben</h1>
      <p className="text-muted-foreground mb-6">Von Zahlungserinnerung bis letzte Mahnung – rechtssicher formuliert</p>

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
              <h2 className="text-xl font-semibold">Parteien & Mahnstufe</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Mahnstufe</label>
                <div className="grid grid-cols-2 gap-2">
                  {STUFEN.map((s) => (
                    <button key={s.key} onClick={() => update({ stufe: s.key })} className={`p-3 rounded-lg border text-left ${data.stufe === s.key ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                      <div className="font-medium text-sm">{s.label}</div>
                      <div className="text-xs text-muted-foreground">Ton: {s.ton}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Gläubiger (Vermieter)</h3>
                  <input placeholder="Name" value={data.glaeubigerName} onChange={(e) => update({ glaeubigerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.glaeubigerStrasse} onChange={(e) => update({ glaeubigerStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.glaeubigerPlzOrt} onChange={(e) => update({ glaeubigerPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Schuldner (Mieter)</h3>
                  <input placeholder="Name" value={data.schuldnerName} onChange={(e) => update({ schuldnerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="Straße Nr." value={data.schuldnerStrasse} onChange={(e) => update({ schuldnerStrasse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                  <input placeholder="PLZ Ort" value={data.schuldnerPlzOrt} onChange={(e) => update({ schuldnerPlzOrt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mietobjekt</label>
                <input value={data.mietobjekt} onChange={(e) => update({ mietobjekt: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Offene Forderungen</h2>
              {data.forderungen.map((f, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
                  <input placeholder="Bezeichnung" value={f.bezeichnung} onChange={(e) => updateForderung(i, { bezeichnung: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                  <input placeholder="Betrag (€)" value={f.betrag} onChange={(e) => updateForderung(i, { betrag: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="date" value={f.faelligDatum} onChange={(e) => updateForderung(i, { faelligDatum: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addForderung}>+ Forderung hinzufügen</Button>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <strong>Gesamtforderung:</strong> {gesamtForderung.toFixed(2)} €
                {data.stufe !== 'zahlungserinnerung' && <> + {mahngebuehrNum.toFixed(2)} € Mahngebühr = <strong>{gesamt.toFixed(2)} €</strong></>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Optionen</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mahngebühr (€)</label>
                  <input value={data.mahngebuehr} onChange={(e) => update({ mahngebuehr: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zahlungsfrist (Tage)</label>
                  <input type="number" value={data.fristTage} onChange={(e) => update({ fristTage: parseInt(e.target.value) || 14 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Bankverbindung</h3>
                <input placeholder="Bank" value={data.bankName} onChange={(e) => update({ bankName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <input placeholder="IBAN" value={data.iban} onChange={(e) => update({ iban: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <input placeholder="Verwendungszweck" value={data.verwendungszweck} onChange={(e) => update({ verwendungszweck: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{stufeInfo.label}</h2>
              <div className="bg-white border rounded-lg p-8 text-sm leading-relaxed" id="mahnung-print">
                <div className="mb-6">
                  <p className="font-semibold">{data.glaeubigerName}</p>
                  <p>{data.glaeubigerStrasse}</p>
                  <p>{data.glaeubigerPlzOrt}</p>
                </div>
                <div className="mb-6">
                  <p>{data.schuldnerName}</p>
                  <p>{data.schuldnerStrasse}</p>
                  <p>{data.schuldnerPlzOrt}</p>
                </div>
                <p className="text-right mb-6">{new Date(data.datum).toLocaleDateString('de-DE')}</p>
                <p className="font-bold mb-4">{stufeInfo.label} – Mietobjekt: {data.mietobjekt}</p>
                <p className="mb-2">{getAnrede()} {data.schuldnerName},</p>
                <p className="mb-4">{getTextBody()}</p>

                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Position</th>
                      <th className="text-left py-1">Fällig am</th>
                      <th className="text-right py-1">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.forderungen.map((f, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1">{f.bezeichnung}</td>
                        <td className="py-1">{f.faelligDatum && new Date(f.faelligDatum).toLocaleDateString('de-DE')}</td>
                        <td className="text-right py-1">{f.betrag} €</td>
                      </tr>
                    ))}
                    {data.stufe !== 'zahlungserinnerung' && (
                      <tr className="border-b">
                        <td className="py-1" colSpan={2}>Mahngebühr</td>
                        <td className="text-right py-1">{data.mahngebuehr} €</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td className="py-2" colSpan={2}>Gesamtbetrag</td>
                      <td className="text-right py-2">{gesamt.toFixed(2)} €</td>
                    </tr>
                  </tbody>
                </table>

                <p className="mb-2">Bitte überweisen Sie den Betrag auf folgendes Konto:</p>
                <p>Bank: {data.bankName} | IBAN: {data.iban}</p>
                {data.verwendungszweck && <p>Verwendungszweck: {data.verwendungszweck}</p>}
                <p className="mt-6">Mit freundlichen Grüßen</p>
                <p className="mt-6">_________________________</p>
                <p className="text-xs text-muted-foreground">{data.glaeubigerName}</p>
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
