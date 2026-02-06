import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileWarning } from 'lucide-react'
import { useChecker, CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl } from '@/lib/utils'
import { toast } from 'sonner'

interface FormData {
  kuendigungsgrund: string
  kuendigungErhalten: string
  mietdauer: string
  schriftform: boolean
  unterschriftVermieter: boolean
  kuendigungsfrist: string
  befristetesArbeitsverhaeltnis: boolean
  sozialhaertefall: boolean
}

export default function KuendigungChecker() {
  const navigate = useNavigate()
  const { startSession, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    kuendigungsgrund: '',
    kuendigungErhalten: '',
    mietdauer: '',
    schriftform: true,
    unterschriftVermieter: true,
    kuendigungsfrist: '',
    befristetesArbeitsverhaeltnis: false,
    sozialhaertefall: false,
  })

  useEffect(() => {
    initSession()
  }, [])

  const initSession = async () => {
    if (!canUseChecker()) {
      toast.error('Sie haben Ihr monatliches Limit erreicht. Upgraden Sie fuer mehr Checks!')
      navigate('/preise')
      return
    }
    await startSession('kuendigung', 3)
  }

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []

      // Formvorschriften pruefen
      if (!formData.schriftform) {
        violations.push('Die Kuendigung muss schriftlich erfolgen (nicht per E-Mail oder SMS).')
      }

      if (!formData.unterschriftVermieter) {
        violations.push('Die Kuendigung muss vom Vermieter oder seinem Bevollmaechtigten unterschrieben sein.')
      }

      // Kuendigungsgrund pruefen
      if (formData.kuendigungsgrund === 'ohne_grund') {
        violations.push('Eine ordentliche Kuendigung ohne berechtigtes Interesse ist unzulaessig.')
      }

      // Kuendigungsfrist pruefen
      const mietdauerJahre = parseInt(formData.mietdauer) || 0
      let erforderlicheFrist = 3
      if (mietdauerJahre >= 5) erforderlicheFrist = 6
      if (mietdauerJahre >= 8) erforderlicheFrist = 9

      const angegebeneFrist = parseInt(formData.kuendigungsfrist) || 0
      if (angegebeneFrist < erforderlicheFrist) {
        violations.push(`Bei ${mietdauerJahre} Jahren Mietdauer betraegt die Kuendigungsfrist mindestens ${erforderlicheFrist} Monate. Angegeben: ${angegebeneFrist} Monate.`)
      }

      // Haertefall
      if (formData.sozialhaertefall) {
        violations.push('Ein Haertefall koennte vorliegen - Sie haben das Recht auf Widerspruch.')
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Kuendigung moeglicherweise unwirksam!',
          summary: `Wir haben ${violations.length} moegliche Maengel gefunden.`,
          details: violations,
          recommendation: 'Legen Sie innerhalb von 2 Monaten nach Zugang der Kuendigung Widerspruch ein.',
          formRedirectUrl: getFormulareAppUrl('kuendigung-widerspruch'),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Kuendigung erscheint formal korrekt',
          summary: 'Die Kuendigung scheint die formalen Anforderungen zu erfuellen.',
          details: [
            'Schriftform eingehalten',
            'Unterschrift vorhanden',
            'Kuendigungsfrist korrekt',
          ],
          recommendation: 'Pruefen Sie dennoch, ob das angegebene Kuendigungsinteresse (z.B. Eigenbedarf) tatsaechlich besteht.',
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
      kuendigungsgrund: '', kuendigungErhalten: '', mietdauer: '', schriftform: true,
      unterschriftVermieter: true, kuendigungsfrist: '', befristetesArbeitsverhaeltnis: false, sozialhaertefall: false,
    })
    initSession()
  }

  if (result) {
    return (
      <CheckerLayout title="Kuendigungs-Checker" description="Ihr Ergebnis" icon={<FileWarning className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="kuendigung" onGoToForm={handleGoToForm} onStartNew={handleStartNew} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Kuendigungs-Checker"
      description="Pruefen Sie, ob die Kuendigung Ihres Vermieters wirksam ist."
      icon={<FileWarning className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={!!formData.kuendigungsgrund && !!formData.kuendigungErhalten} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Kuendigungsgrund</h2>
          <div className="space-y-4">
            <CheckerField
              name="kuendigungsgrund"
              label="Grund der Kuendigung"
              type="select"
              value={formData.kuendigungsgrund}
              onChange={(v) => updateField('kuendigungsgrund', v)}
              required
              options={[
                { value: 'eigenbedarf', label: 'Eigenbedarf' },
                { value: 'verwertung', label: 'Wirtschaftliche Verwertung' },
                { value: 'pflichtverletzung', label: 'Pflichtverletzung (z.B. Zahlungsrueckstand)' },
                { value: 'ohne_grund', label: 'Kein Grund angegeben' },
              ]}
            />
            <CheckerField name="kuendigungErhalten" label="Kuendigung erhalten am" type="date" value={formData.kuendigungErhalten} onChange={(v) => updateField('kuendigungErhalten', v)} required />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onNext={() => setStep(3)} onPrevious={() => setStep(1)} canProceed={!!formData.mietdauer}>
          <h2 className="text-xl font-semibold mb-4">Mietdauer & Frist</h2>
          <div className="space-y-4">
            <CheckerField
              name="mietdauer"
              label="Wie lange wohnen Sie bereits in der Wohnung?"
              type="select"
              value={formData.mietdauer}
              onChange={(v) => updateField('mietdauer', v)}
              required
              options={[
                { value: '0', label: 'Unter 5 Jahre' },
                { value: '5', label: '5-8 Jahre' },
                { value: '8', label: 'Ueber 8 Jahre' },
              ]}
            />
            <CheckerField
              name="kuendigungsfrist"
              label="Im Schreiben angegebene Kuendigungsfrist (Monate)"
              type="select"
              value={formData.kuendigungsfrist}
              onChange={(v) => updateField('kuendigungsfrist', v)}
              options={[
                { value: '3', label: '3 Monate' },
                { value: '6', label: '6 Monate' },
                { value: '9', label: '9 Monate' },
                { value: '12', label: '12 Monate oder mehr' },
              ]}
            />
          </div>
        </CheckerStep>
      )}

      {step === 3 && (
        <CheckerStep onPrevious={() => setStep(2)} onNext={analyzeResult} nextLabel="Jetzt pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Formale Pruefung</h2>
          <div className="space-y-4">
            <CheckerField
              name="schriftform"
              label="Kuendigung in Schriftform erhalten?"
              type="select"
              value={formData.schriftform ? 'ja' : 'nein'}
              onChange={(v) => updateField('schriftform', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja, als Brief' },
                { value: 'nein', label: 'Nein, per E-Mail/SMS' },
              ]}
            />
            <CheckerField
              name="unterschriftVermieter"
              label="Vom Vermieter unterschrieben?"
              type="select"
              value={formData.unterschriftVermieter ? 'ja' : 'nein'}
              onChange={(v) => updateField('unterschriftVermieter', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja' },
                { value: 'nein', label: 'Nein / Unklar' },
              ]}
            />
            <CheckerField
              name="sozialhaertefall"
              label="Liegt ein Haertefall vor? (z.B. Alter, Krankheit, Schwangerschaft)"
              type="select"
              value={formData.sozialhaertefall ? 'ja' : 'nein'}
              onChange={(v) => updateField('sozialhaertefall', v === 'ja')}
              options={[
                { value: 'nein', label: 'Nein' },
                { value: 'ja', label: 'Ja, moeglicherweise' },
              ]}
            />
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
