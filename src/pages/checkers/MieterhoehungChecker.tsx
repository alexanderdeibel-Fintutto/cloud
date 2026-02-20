import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useChecker, CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl, getRechnerAppUrl, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface FormData {
  plz: string
  aktuelleKaltmiete: number
  neueKaltmiete: number
  wohnflaeche: number
  letzteMieterhoehung: string
  mieterhoehungsDatum: string
  begruendung: string
  mietspiegelVorhanden: boolean
}

export default function MieterhoehungChecker() {
  const navigate = useNavigate()
  const { startSession, updateSessionData, setCurrentStep, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    plz: '',
    aktuelleKaltmiete: 0,
    neueKaltmiete: 0,
    wohnflaeche: 0,
    letzteMieterhoehung: '',
    mieterhoehungsDatum: '',
    begruendung: 'mietspiegel',
    mietspiegelVorhanden: true,
  })

  const totalSteps = 3

  useEffect(() => {
    initSession()
  }, [])

  const initSession = async () => {
    if (!canUseChecker()) {
      toast.error('Sie haben Ihr Limit erreicht. Bitte upgraden Sie Ihren Plan.')
      navigate('/')
      return
    }
    await startSession('mieterhoehung', totalSteps)
  }

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    updateSessionData({ [field]: value })
  }

  const handleNext = () => {
    const newStep = step + 1
    setStep(newStep)
    setCurrentStep(newStep)
  }

  const handlePrevious = () => {
    const newStep = step - 1
    setStep(newStep)
    setCurrentStep(newStep)
  }

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const erhoehungProzent = ((formData.neueKaltmiete - formData.aktuelleKaltmiete) / formData.aktuelleKaltmiete) * 100
      const erhoehungBetrag = formData.neueKaltmiete - formData.aktuelleKaltmiete

      const letzteMieterhoehungDate = formData.letzteMieterhoehung ? new Date(formData.letzteMieterhoehung) : null
      const mieterhoehungDate = new Date(formData.mieterhoehungsDatum)

      let monthsSinceLastIncrease = 0
      if (letzteMieterhoehungDate) {
        monthsSinceLastIncrease = Math.floor(
          (mieterhoehungDate.getTime() - letzteMieterhoehungDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      }

      const violations: string[] = []
      let isValid = true

      // Kappungsgrenze pruefen (max 20% in 3 Jahren)
      if (erhoehungProzent > 20) {
        violations.push(`Die Erhoehung von ${erhoehungProzent.toFixed(1)}% ueberschreitet die Kappungsgrenze von 20% in 3 Jahren.`)
        isValid = false
      }

      // Sperrfrist pruefen (min 15 Monate seit letzter Erhoehung)
      if (letzteMieterhoehungDate && monthsSinceLastIncrease < 15) {
        violations.push(`Die Sperrfrist von 15 Monaten seit der letzten Mieterhoehung wurde nicht eingehalten (nur ${monthsSinceLastIncrease} Monate).`)
        isValid = false
      }

      // Begruendung pruefen
      if (formData.begruendung === 'keine') {
        violations.push('Eine Mieterhoehung muss begruendet werden (z.B. durch Mietspiegel, Gutachten oder Vergleichswohnungen).')
        isValid = false
      }

      let checkerResult: CheckerResultType

      if (!isValid) {
        const potentialSavings = erhoehungBetrag * 12 // Ersparnis pro Jahr

        checkerResult = {
          status: 'positive',
          title: 'Mieterhoehung moeglicherweise unwirksam!',
          summary: `Wir haben ${violations.length} moegliche Maengel bei der Mieterhoehung gefunden. Sie sollten der Erhoehung widersprechen.`,
          details: violations,
          potentialSavings,
          recommendation: 'Wir empfehlen Ihnen, innerhalb der Zustimmungsfrist von 2 Monaten einen Widerspruch einzulegen. Nutzen Sie dafuer unser vorbereitetes Formular.',
          formType: 'mieterhoehung-widerspruch',
          formRedirectUrl: getFormulareAppUrl('mieterhoehung-widerspruch', {
            aktuelleKaltmiete: String(formData.aktuelleKaltmiete),
            neueKaltmiete: String(formData.neueKaltmiete),
          }),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Mieterhoehung erscheint formal korrekt',
          summary: 'Die Mieterhoehung scheint die gesetzlichen Voraussetzungen zu erfuellen.',
          details: [
            `Erhoehung: ${erhoehungProzent.toFixed(1)}% (unter der Kappungsgrenze von 20%)`,
            letzteMieterhoehungDate ? `${monthsSinceLastIncrease} Monate seit letzter Erhoehung (Sperrfrist eingehalten)` : 'Erste Mieterhoehung',
            `Begruendung: ${formData.begruendung === 'mietspiegel' ? 'Mietspiegel' : formData.begruendung === 'gutachten' ? 'Sachverstaendigengutachten' : 'Vergleichswohnungen'}`,
          ],
          recommendation: 'Auch wenn die Mieterhoehung formal korrekt erscheint, pruefen Sie dennoch, ob die angegebene Vergleichsmiete realistisch ist. Sie haben 2 Monate Zeit zur Pruefung.',
        }
      }

      await completeSession(checkerResult)
      await incrementChecksUsed()
      setResult(checkerResult)

    } catch (error) {
      console.error('Error analyzing result:', error)
      toast.error('Fehler bei der Analyse. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToForm = () => {
    if (result?.formRedirectUrl) {
      window.open(result.formRedirectUrl, '_blank')
    }
  }

  const handleStartNew = () => {
    clearSession()
    setResult(null)
    setStep(1)
    setFormData({
      plz: '',
      aktuelleKaltmiete: 0,
      neueKaltmiete: 0,
      wohnflaeche: 0,
      letzteMieterhoehung: '',
      mieterhoehungsDatum: '',
      begruendung: 'mietspiegel',
      mietspiegelVorhanden: true,
    })
    initSession()
  }

  if (result) {
    return (
      <CheckerLayout
        title="Mieterhoehung-Checker"
        description="Ihr Ergebnis"
        icon={<TrendingUp className="w-8 h-8" />}
      >
        <CheckerResult
          result={result}
          checkerType="mieterhoehung"
          onGoToForm={handleGoToForm}
          onStartNew={handleStartNew}
          rechnerUrl={getRechnerAppUrl('mieterhoehung', { rent: String(formData.aktuelleKaltmiete) })}
        />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Mieterhoehung-Checker"
      description="Pruefen Sie, ob die Mieterhoehung Ihres Vermieters rechtmaessig ist."
      icon={<TrendingUp className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep
          onNext={handleNext}
          canProceed={formData.aktuelleKaltmiete > 0 && formData.neueKaltmiete > 0}
          showPrevious={false}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mietbetraege</h2>
          <p className="text-gray-600 mb-6">
            Geben Sie Ihre aktuelle Miete und die geforderte neue Miete ein.
          </p>

          <div className="space-y-4">
            <CheckerField
              name="aktuelleKaltmiete"
              label="Aktuelle Kaltmiete (monatlich)"
              type="currency"
              placeholder="z.B. 800"
              value={formData.aktuelleKaltmiete}
              onChange={(v) => updateField('aktuelleKaltmiete', v)}
              required
            />

            <CheckerField
              name="neueKaltmiete"
              label="Geforderte neue Kaltmiete"
              type="currency"
              placeholder="z.B. 900"
              value={formData.neueKaltmiete}
              onChange={(v) => updateField('neueKaltmiete', v)}
              required
            />

            {formData.aktuelleKaltmiete > 0 && formData.neueKaltmiete > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Erhoehung:</strong>{' '}
                  {formatCurrency(formData.neueKaltmiete - formData.aktuelleKaltmiete)} (
                  {(((formData.neueKaltmiete - formData.aktuelleKaltmiete) / formData.aktuelleKaltmiete) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onNext={handleNext} onPrevious={handlePrevious} canProceed={!!formData.mieterhoehungsDatum}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zeitliche Angaben</h2>
          <p className="text-gray-600 mb-6">
            Diese Informationen benoetigen wir zur Pruefung der Sperrfristen.
          </p>

          <div className="space-y-4">
            <CheckerField
              name="mieterhoehungsDatum"
              label="Datum des Mieterhoehungsschreibens"
              type="date"
              value={formData.mieterhoehungsDatum}
              onChange={(v) => updateField('mieterhoehungsDatum', v)}
              required
            />

            <CheckerField
              name="letzteMieterhoehung"
              label="Letzte Mieterhoehung (falls bekannt)"
              type="date"
              value={formData.letzteMieterhoehung}
              onChange={(v) => updateField('letzteMieterhoehung', v)}
              helpText="Lassen Sie das Feld leer, wenn dies die erste Mieterhoehung ist."
            />
          </div>
        </CheckerStep>
      )}

      {step === 3 && (
        <CheckerStep
          onPrevious={handlePrevious}
          onNext={analyzeResult}
          nextLabel="Jetzt pruefen"
          isLoading={isLoading}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Begruendung der Erhoehung</h2>
          <p className="text-gray-600 mb-6">
            Wie begruendet der Vermieter die Mieterhoehung?
          </p>

          <div className="space-y-4">
            <CheckerField
              name="begruendung"
              label="Art der Begruendung"
              type="select"
              value={formData.begruendung}
              onChange={(v) => updateField('begruendung', v)}
              required
              options={[
                { value: 'mietspiegel', label: 'Mietspiegel' },
                { value: 'gutachten', label: 'Sachverstaendigengutachten' },
                { value: 'vergleichswohnungen', label: 'Vergleichswohnungen' },
                { value: 'keine', label: 'Keine / unklar' },
              ]}
            />
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-6 space-y-3">
            <h3 className="font-medium text-gray-900">Zusammenfassung</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Aktuelle Miete:</span>
              <span className="font-medium">{formatCurrency(formData.aktuelleKaltmiete)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Neue Miete:</span>
              <span className="font-medium">{formatCurrency(formData.neueKaltmiete)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Erhoehung:</span>
              <span className="font-medium text-orange-600">
                +{(((formData.neueKaltmiete - formData.aktuelleKaltmiete) / formData.aktuelleKaltmiete) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
