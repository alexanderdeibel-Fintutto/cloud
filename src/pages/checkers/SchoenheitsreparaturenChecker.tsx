import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paintbrush } from 'lucide-react'
import { useChecker, CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl } from '@/lib/utils'
import { toast } from 'sonner'

interface FormData {
  mietvertragJahr: string
  klauselTyp: string
  zustandBeiEinzug: string
  mietdauer: string
  forderungHoehe: number
  renoviertBeiEinzug: boolean
  starreFreistenKlausel: boolean
}

export default function SchoenheitsreparaturenChecker() {
  const navigate = useNavigate()
  const { startSession, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    mietvertragJahr: '',
    klauselTyp: '',
    zustandBeiEinzug: '',
    mietdauer: '',
    forderungHoehe: 0,
    renoviertBeiEinzug: false,
    starreFreistenKlausel: false,
  })

  useEffect(() => {
    initSession()
  }, [])

  const initSession = async () => {
    if (!canUseChecker()) {
      toast.error('Limit erreicht.')
      navigate('/')
      return
    }
    await startSession('schoenheitsreparaturen', 2)
  }

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []
      let potentialSavings = 0

      // BGH-Urteile zu Schoenheitsreparaturen
      if (!formData.renoviertBeiEinzug) {
        violations.push('Sie haben die Wohnung unrenoviert uebernommen. Laut BGH-Urteil (VIII ZR 185/14) ist die Klausel dann unwirksam.')
        potentialSavings = formData.forderungHoehe
      }

      if (formData.starreFreistenKlausel) {
        violations.push('Starre Fristenklauseln (z.B. "alle 3 Jahre Kueche, alle 5 Jahre Wohnraeume") sind nach BGH-Rechtsprechung unwirksam.')
        potentialSavings = formData.forderungHoehe
      }

      if (formData.klauselTyp === 'endrenovierung') {
        violations.push('Klauseln zur Endrenovierung "unabhaengig vom Zustand" sind unwirksam.')
        potentialSavings = formData.forderungHoehe
      }

      if (formData.klauselTyp === 'quotenklausel') {
        violations.push('Quotenklauseln (anteilige Kostenuebernahme bei Auszug) sind nach BGH-Urteil unwirksam.')
        potentialSavings = formData.forderungHoehe
      }

      // Sehr alte Mietvertraege
      const mietvertragJahr = parseInt(formData.mietvertragJahr)
      if (mietvertragJahr < 2008) {
        violations.push('Bei aelteren Mietvertraegen (vor 2008) sind viele Klauseln zu Schoenheitsreparaturen durch BGH-Urteile unwirksam geworden.')
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Schoenheitsreparaturen moeglicherweise nicht geschuldet!',
          summary: `Es wurden ${violations.length} Gruende gefunden, warum Sie nicht renovieren muessen.`,
          details: violations,
          potentialSavings,
          recommendation: 'Weisen Sie die Forderung schriftlich zurueck und berufen Sie sich auf die BGH-Rechtsprechung.',
          formRedirectUrl: getFormulareAppUrl('schoenheitsreparaturen-widerspruch'),
        }
      } else {
        checkerResult = {
          status: 'neutral',
          title: 'Klausel moeglicherweise wirksam',
          summary: 'Die Klausel koennte wirksam sein, aber pruefen Sie den genauen Wortlaut.',
          details: [
            'Wohnung war bei Einzug renoviert',
            'Keine starren Fristenklauseln erkannt',
            'Pruefen Sie den genauen Wortlaut der Klausel',
          ],
          recommendation: 'Lassen Sie den genauen Wortlaut der Klausel von einem Experten pruefen. Viele Klauseln sind trotzdem unwirksam.',
        }
      }

      await completeSession(checkerResult)
      await incrementChecksUsed()
      setResult(checkerResult)

    } catch (error) {
      toast.error('Fehler bei der Analyse.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToForm = () => result?.formRedirectUrl && window.open(result.formRedirectUrl, '_blank')

  const handleStartNew = () => {
    clearSession()
    setResult(null)
    setStep(1)
    setFormData({
      mietvertragJahr: '', klauselTyp: '', zustandBeiEinzug: '', mietdauer: '',
      forderungHoehe: 0, renoviertBeiEinzug: false, starreFreistenKlausel: false,
    })
    initSession()
  }

  if (result) {
    return (
      <CheckerLayout title="Schoenheitsreparaturen-Checker" description="Ihr Ergebnis" icon={<Paintbrush className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="schoenheitsreparaturen" onGoToForm={handleGoToForm} onStartNew={handleStartNew} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Schoenheitsreparaturen-Checker"
      description="Pruefen Sie, ob Sie bei Auszug renovieren muessen."
      icon={<Paintbrush className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={!!formData.mietvertragJahr} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Mietvertrag</h2>
          <div className="space-y-4">
            <CheckerField
              name="mietvertragJahr"
              label="Jahr des Mietvertragsabschlusses"
              type="select"
              value={formData.mietvertragJahr}
              onChange={(v) => updateField('mietvertragJahr', v)}
              required
              options={[
                { value: '2020', label: '2020 oder neuer' },
                { value: '2015', label: '2015-2019' },
                { value: '2008', label: '2008-2014' },
                { value: '2000', label: '2000-2007' },
                { value: '1990', label: '1990-1999' },
                { value: '1980', label: 'Vor 1990' },
              ]}
            />
            <CheckerField
              name="renoviertBeiEinzug"
              label="War die Wohnung bei Einzug frisch renoviert?"
              type="select"
              value={formData.renoviertBeiEinzug ? 'ja' : 'nein'}
              onChange={(v) => updateField('renoviertBeiEinzug', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja, frisch renoviert/gestrichen' },
                { value: 'nein', label: 'Nein, unrenoviert uebernommen' },
              ]}
            />
            <CheckerField name="forderungHoehe" label="Geforderte Renovierungskosten (falls bekannt)" type="currency" value={formData.forderungHoehe} onChange={(v) => updateField('forderungHoehe', v)} />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onPrevious={() => setStep(1)} onNext={analyzeResult} nextLabel="Pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Klauseln im Mietvertrag</h2>
          <div className="space-y-4">
            <CheckerField
              name="klauselTyp"
              label="Welche Klausel steht im Mietvertrag?"
              type="select"
              value={formData.klauselTyp}
              onChange={(v) => updateField('klauselTyp', v)}
              options={[
                { value: 'keine', label: 'Keine Klausel / Weiss nicht' },
                { value: 'laufend', label: 'Laufende Schoenheitsreparaturen' },
                { value: 'endrenovierung', label: 'Endrenovierung bei Auszug' },
                { value: 'quotenklausel', label: 'Quotenklausel (anteilige Kosten)' },
              ]}
            />
            <CheckerField
              name="starreFreistenKlausel"
              label="Enthaelt der Vertrag starre Fristen (z.B. 'alle 3 Jahre Kueche')?"
              type="select"
              value={formData.starreFreistenKlausel ? 'ja' : 'nein'}
              onChange={(v) => updateField('starreFreistenKlausel', v === 'ja')}
              options={[
                { value: 'nein', label: 'Nein / Weiss nicht' },
                { value: 'ja', label: 'Ja, feste Zeitangaben' },
              ]}
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tipp:</strong> Viele Klauseln zu Schoenheitsreparaturen sind durch BGH-Urteile unwirksam. Auch wenn eine Klausel im Vertrag steht, muss sie nicht gelten.
            </p>
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
