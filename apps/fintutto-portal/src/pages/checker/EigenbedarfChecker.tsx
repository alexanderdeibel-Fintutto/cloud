import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useChecker, CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { useDocumentTitle, useMetaTags, useJsonLd } from '@fintutto/shared'

interface FormData {
  personAngegeben: string
  begruendungKonkret: boolean
  alternativeWohnung: boolean
  vermieterMehrereWohnungen: boolean
  kuendigungsfrist: string
  haertegruende: string[]
}

export default function EigenbedarfChecker() {
  const navigate = useNavigate()
  const { startSession, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  useDocumentTitle('Eigenbedarf-Checker', 'Fintutto Portal')
  useMetaTags({
    title: 'Eigenbedarf-Checker – Ist die Kündigung rechtmäßig?',
    description: 'Eigenbedarfskündigung erhalten? Prüfe Begründung und Härtefallregelung nach §573 Abs. 2 BGB.',
    path: '/checker/eigenbedarf',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Eigenbedarf-Checker',
    description: 'Prüfe die Rechtmäßigkeit einer Eigenbedarfskündigung nach §573 Abs. 2 BGB',
    url: 'https://portal.fintutto.cloud/checker/eigenbedarf',
    offers: { price: '0', priceCurrency: 'EUR' },
  })

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    personAngegeben: '',
    begruendungKonkret: true,
    alternativeWohnung: false,
    vermieterMehrereWohnungen: false,
    kuendigungsfrist: '',
    haertegruende: [],
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
    await startSession('eigenbedarf', 2)
  }

  const updateField = (field: keyof FormData, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []

      if (formData.personAngegeben === 'keine') {
        violations.push('Die Eigenbedarfskuendigung muss die berechtigte Person namentlich nennen.')
      }

      if (formData.personAngegeben === 'freund' || formData.personAngegeben === 'bekannter') {
        violations.push('Eigenbedarf fuer Freunde oder Bekannte ist nicht zulaessig. Nur Familienangehoerige und Haushaltsangehoerige sind berechtigt.')
      }

      if (!formData.begruendungKonkret) {
        violations.push('Die Begruendung fuer den Eigenbedarf ist zu pauschal. Der konkrete Wohnbedarf muss dargelegt werden.')
      }

      if (formData.vermieterMehrereWohnungen && formData.alternativeWohnung) {
        violations.push('Der Vermieter hat moeglicherweise andere freie Wohnungen. Ein Eigenbedarf koennte vorgeschoben sein.')
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0 || formData.haertegruende.length > 0) {
        const details = [...violations]
        if (formData.haertegruende.length > 0) {
          details.push('Moegliche Haertegruende fuer Widerspruch: ' + formData.haertegruende.join(', '))
        }

        checkerResult = {
          status: 'positive',
          title: 'Widerspruch moeglicherweise erfolgreich!',
          summary: violations.length > 0
            ? `Die Eigenbedarfskuendigung weist ${violations.length} moegliche Maengel auf.`
            : 'Es liegen Haertegruende vor, die einen Widerspruch rechtfertigen koennten.',
          details,
          recommendation: 'Legen Sie innerhalb von 2 Monaten nach Zugang der Kuendigung Widerspruch ein.',
          formRedirectUrl: getFormulareAppUrl('eigenbedarf-widerspruch'),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Eigenbedarfskuendigung erscheint formal korrekt',
          summary: 'Die Kuendigung scheint die formalen Voraussetzungen zu erfuellen.',
          details: [
            'Berechtigte Person wurde genannt',
            'Begruendung ist ausreichend konkret',
            'Keine offensichtlichen Maengel erkannt',
          ],
          recommendation: 'Pruefen Sie dennoch, ob der angegebene Eigenbedarf tatsaechlich besteht. Sprechen Sie ggf. mit einem Fachanwalt.',
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
      personAngegeben: '', begruendungKonkret: true, alternativeWohnung: false,
      vermieterMehrereWohnungen: false, kuendigungsfrist: '', haertegruende: [],
    })
    initSession()
  }

  if (result) {
    return (
      <CheckerLayout title="Eigenbedarf-Checker" description="Ihr Ergebnis" icon={<AlertTriangle className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="eigenbedarf" onGoToForm={handleGoToForm} onStartNew={handleStartNew} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Eigenbedarf-Checker"
      description="Pruefen Sie, ob die Eigenbedarfskuendigung wirksam ist."
      icon={<AlertTriangle className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={!!formData.personAngegeben} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Angaben im Kuendigungsschreiben</h2>
          <div className="space-y-4">
            <CheckerField
              name="personAngegeben"
              label="Fuer wen wird Eigenbedarf geltend gemacht?"
              type="select"
              value={formData.personAngegeben}
              onChange={(v) => updateField('personAngegeben', v)}
              required
              options={[
                { value: 'vermieter', label: 'Vermieter selbst' },
                { value: 'ehepartner', label: 'Ehepartner/Lebenspartner' },
                { value: 'kind', label: 'Kind des Vermieters' },
                { value: 'eltern', label: 'Eltern des Vermieters' },
                { value: 'geschwister', label: 'Geschwister' },
                { value: 'haushalt', label: 'Haushaltsangehoerige (z.B. Pflegekraft)' },
                { value: 'freund', label: 'Freund/Bekannter' },
                { value: 'keine', label: 'Keine Person genannt' },
              ]}
            />
            <CheckerField
              name="begruendungKonkret"
              label="Ist die Begruendung konkret (z.B. Gruendung eines Hausstands, beruflicher Wechsel)?"
              type="select"
              value={formData.begruendungKonkret ? 'ja' : 'nein'}
              onChange={(v) => updateField('begruendungKonkret', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja, konkrete Gruende genannt' },
                { value: 'nein', label: 'Nein, nur pauschal' },
              ]}
            />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onPrevious={() => setStep(1)} onNext={analyzeResult} nextLabel="Jetzt pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Haertegruende & Umstaende</h2>
          <div className="space-y-4">
            <CheckerField
              name="vermieterMehrereWohnungen"
              label="Besitzt der Vermieter mehrere Wohnungen?"
              type="select"
              value={formData.vermieterMehrereWohnungen ? 'ja' : 'nein'}
              onChange={(v) => updateField('vermieterMehrereWohnungen', v === 'ja')}
              options={[
                { value: 'nein', label: 'Nein / Weiss nicht' },
                { value: 'ja', label: 'Ja' },
              ]}
            />
            {formData.vermieterMehrereWohnungen && (
              <CheckerField
                name="alternativeWohnung"
                label="Steht eine andere Wohnung leer?"
                type="select"
                value={formData.alternativeWohnung ? 'ja' : 'nein'}
                onChange={(v) => updateField('alternativeWohnung', v === 'ja')}
                options={[
                  { value: 'nein', label: 'Nein / Weiss nicht' },
                  { value: 'ja', label: 'Ja' },
                ]}
              />
            )}

            <div>
              <p className="text-sm font-medium mb-2">Liegen bei Ihnen Haertegruende vor?</p>
              <div className="space-y-2">
                {[
                  { value: 'alter', label: 'Hohes Alter (ueber 70 Jahre)' },
                  { value: 'krankheit', label: 'Schwere Krankheit' },
                  { value: 'schwangerschaft', label: 'Schwangerschaft' },
                  { value: 'lange_mietdauer', label: 'Sehr lange Mietdauer (ueber 20 Jahre)' },
                  { value: 'keine_alternative', label: 'Keine vergleichbare Wohnung findbar' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.haertegruende.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('haertegruende', [...formData.haertegruende, option.value])
                        } else {
                          updateField('haertegruende', formData.haertegruende.filter((v) => v !== option.value))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
