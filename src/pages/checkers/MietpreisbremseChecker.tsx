import { Home } from 'lucide-react'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { calculateMietpreisbremse, getFormulareAppUrl } from '@/lib/checker-utils'
import { useCheckerForm } from '@/hooks/useCheckerForm'
import { toast } from 'sonner'

interface FormData {
  plz: string
  stadt: string
  mietbeginn: string
  kaltmiete: number
  wohnflaeche: number
  baujahr: string
  ausstattung: string
  vormiete: number
  vormieteUnbekannt: boolean
}

const ORTSUEBLICHE_MIETEN: Record<string, number> = {
  '10115': 12.5, // Berlin Mitte
  '10178': 13.0,
  '10179': 12.8,
  '80331': 18.5, // Muenchen
  '80333': 19.0,
  '80335': 18.0,
  '20095': 14.5, // Hamburg
  '20099': 14.0,
  '60311': 15.5, // Frankfurt
  '60313': 16.0,
  '50667': 12.0, // Koeln
  '50668': 11.5,
  default: 10.0,
}

const initialFormData: FormData = {
  plz: '',
  stadt: '',
  mietbeginn: '',
  kaltmiete: 0,
  wohnflaeche: 0,
  baujahr: '',
  ausstattung: 'normal',
  vormiete: 0,
  vormieteUnbekannt: false,
}

export default function MietpreisbremseChecker() {
  const {
    step, setStep, isLoading, setIsLoading,
    result, formData, updateField, submitResult,
    handleGoToForm, handleStartNew,
  } = useCheckerForm<FormData>({ checkerType: 'mietpreisbremse', totalSteps: 4, initialFormData })

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const ortsueblicheMiete = ORTSUEBLICHE_MIETEN[formData.plz] || ORTSUEBLICHE_MIETEN.default
      const mietbeginnDate = new Date(formData.mietbeginn)

      const analysis = calculateMietpreisbremse(
        formData.kaltmiete,
        formData.wohnflaeche,
        ortsueblicheMiete,
        mietbeginnDate
      )

      let checkerResult: CheckerResultType

      if (analysis.isViolation) {
        checkerResult = {
          status: 'positive',
          title: 'Verstoss gegen Mietpreisbremse erkannt!',
          summary: `Ihre Miete liegt ${((analysis.currentMietePerQm / analysis.maxAllowedMiete - 1) * 100).toFixed(1)}% ueber der zulaessigen Grenze. Sie koennten zu viel gezahlte Miete zurueckfordern.`,
          details: [
            `Ihre aktuelle Miete: ${analysis.currentMietePerQm.toFixed(2)} EUR/m2`,
            `Maximal zulaessige Miete: ${analysis.maxAllowedMiete.toFixed(2)} EUR/m2 (ortsueblich + 10%)`,
            `Ortsuebliche Vergleichsmiete fuer PLZ ${formData.plz}: ${ortsueblicheMiete.toFixed(2)} EUR/m2`,
            `Mietvertrag laeuft seit ${analysis.monthsSinceMietbeginn} Monaten`,
            `Moegliche Rueckforderung der letzten 30 Monate (max. Verjaehrungsfrist)`,
          ],
          potentialSavings: analysis.potentialSavings,
          recommendation:
            'Wir empfehlen Ihnen, eine qualifizierte Ruege an Ihren Vermieter zu senden. Nutzen Sie dafuer unser Formular, das alle rechtlichen Anforderungen erfuellt.',
          formType: 'mietpreisbremse-ruege',
          formRedirectUrl: getFormulareAppUrl('mietpreisbremse-ruege', {
            plz: formData.plz,
            kaltmiete: String(formData.kaltmiete),
            wohnflaeche: String(formData.wohnflaeche),
            mietbeginn: formData.mietbeginn,
          }),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Kein Verstoss gegen Mietpreisbremse',
          summary: `Ihre Miete liegt im zulaessigen Bereich. Die Mietpreisbremse wurde eingehalten.`,
          details: [
            `Ihre aktuelle Miete: ${analysis.currentMietePerQm.toFixed(2)} EUR/m2`,
            `Maximal zulaessige Miete: ${analysis.maxAllowedMiete.toFixed(2)} EUR/m2`,
            `Ihre Miete liegt ${((1 - analysis.currentMietePerQm / analysis.maxAllowedMiete) * 100).toFixed(1)}% unter der Grenze`,
          ],
          recommendation:
            'Ihre Miete ist im Rahmen der Mietpreisbremse. Pruefen Sie bei Gelegenheit andere Aspekte Ihres Mietverhaeltnisses, z.B. die Nebenkostenabrechnung.',
        }
      }

      await submitResult(checkerResult)

    } catch {
      toast.error('Fehler bei der Analyse. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedStep1 = formData.plz.length === 5 && !!formData.mietbeginn
  const canProceedStep2 = formData.kaltmiete > 0 && formData.wohnflaeche > 0
  const canProceedStep3 = !!formData.baujahr && !!formData.ausstattung

  if (result) {
    return (
      <CheckerLayout
        title="Mietpreisbremse-Checker"
        description="Ihr Ergebnis"
        icon={<Home className="w-8 h-8" />}
      >
        <CheckerResult
          result={result}
          checkerType="mietpreisbremse"
          onGoToForm={handleGoToForm}
          onStartNew={handleStartNew}
        />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Mietpreisbremse-Checker"
      description="Pruefen Sie, ob Ihre Miete zu hoch ist und Sie Geld zurueckfordern koennen."
      icon={<Home className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={canProceedStep1} showPrevious={false}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Standort & Mietbeginn</h2>
          <p className="text-gray-600 mb-6">
            Die Mietpreisbremse gilt in bestimmten Gebieten mit angespanntem Wohnungsmarkt.
          </p>

          <div className="space-y-4">
            <CheckerField
              name="plz"
              label="Postleitzahl der Wohnung"
              type="text"
              placeholder="z.B. 10115"
              value={formData.plz}
              onChange={(v) => updateField('plz', v)}
              required
              context={{ step: 1 }}
            />

            <CheckerField
              name="stadt"
              label="Stadt"
              type="text"
              placeholder="z.B. Berlin"
              value={formData.stadt}
              onChange={(v) => updateField('stadt', v)}
              context={{ step: 1 }}
            />

            <CheckerField
              name="mietbeginn"
              label="Mietbeginn (Datum des Mietvertrags)"
              type="date"
              value={formData.mietbeginn}
              onChange={(v) => updateField('mietbeginn', v)}
              required
              context={{ step: 1 }}
            />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onNext={() => setStep(3)} onPrevious={() => setStep(1)} canProceed={canProceedStep2}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mietkosten & Wohnflaeche</h2>
          <p className="text-gray-600 mb-6">
            Diese Angaben benoetigen wir, um Ihre Miete mit der ortsueblichen Vergleichsmiete zu vergleichen.
          </p>

          <div className="space-y-4">
            <CheckerField
              name="kaltmiete"
              label="Aktuelle Kaltmiete (monatlich)"
              type="currency"
              placeholder="z.B. 850"
              value={formData.kaltmiete}
              onChange={(v) => updateField('kaltmiete', v)}
              required
              context={{ step: 2, plz: formData.plz }}
            />

            <CheckerField
              name="wohnflaeche"
              label="Wohnflaeche"
              type="area"
              placeholder="z.B. 65"
              value={formData.wohnflaeche}
              onChange={(v) => updateField('wohnflaeche', v)}
              required
              context={{ step: 2 }}
            />

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Berechnung:</strong> Ihre Miete pro m2:{' '}
                {formData.wohnflaeche > 0
                  ? `${(formData.kaltmiete / formData.wohnflaeche).toFixed(2)} EUR/m2`
                  : '-'}
              </p>
            </div>
          </div>
        </CheckerStep>
      )}

      {step === 3 && (
        <CheckerStep onNext={() => setStep(4)} onPrevious={() => setStep(2)} canProceed={canProceedStep3}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wohnungsdetails</h2>
          <p className="text-gray-600 mb-6">
            Diese Informationen helfen uns, die korrekte Vergleichsmiete zu ermitteln.
          </p>

          <div className="space-y-4">
            <CheckerField
              name="baujahr"
              label="Baujahr des Gebaeudes"
              type="select"
              value={formData.baujahr}
              onChange={(v) => updateField('baujahr', v)}
              required
              options={[
                { value: 'vor1918', label: 'Vor 1918 (Altbau)' },
                { value: '1918-1949', label: '1918 - 1949' },
                { value: '1950-1964', label: '1950 - 1964' },
                { value: '1965-1972', label: '1965 - 1972' },
                { value: '1973-1990', label: '1973 - 1990' },
                { value: '1991-2002', label: '1991 - 2002' },
                { value: '2003-2013', label: '2003 - 2013' },
                { value: 'nach2014', label: 'Nach 2014 (Neubau)' },
              ]}
              context={{ step: 3 }}
            />

            <CheckerField
              name="ausstattung"
              label="Ausstattungsklasse"
              type="select"
              value={formData.ausstattung}
              onChange={(v) => updateField('ausstattung', v)}
              required
              options={[
                { value: 'einfach', label: 'Einfach (z.B. Ofenheizung, kein Bad)' },
                { value: 'normal', label: 'Normal (Standardausstattung)' },
                { value: 'gehoben', label: 'Gehoben (z.B. Parkett, moderne Kueche)' },
                { value: 'hochwertig', label: 'Hochwertig (Luxusausstattung)' },
              ]}
              context={{ step: 3 }}
            />
          </div>

          {formData.baujahr === 'nach2014' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Hinweis:</strong> Bei Neubauten (Erstbezug nach 01.10.2014) gilt die
                Mietpreisbremse nicht. Pruefen Sie, ob Ihre Wohnung tatsaechlich ein Neubau ist.
              </p>
            </div>
          )}
        </CheckerStep>
      )}

      {step === 4 && (
        <CheckerStep
          onPrevious={() => setStep(3)}
          onNext={analyzeResult}
          nextLabel="Jetzt pruefen"
          isLoading={isLoading}
          canProceed={true}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zusammenfassung</h2>
          <p className="text-gray-600 mb-6">
            Bitte ueberpruefen Sie Ihre Angaben bevor wir die Analyse starten.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">PLZ / Stadt:</span>
              <span className="font-medium">{formData.plz} {formData.stadt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mietbeginn:</span>
              <span className="font-medium">{new Date(formData.mietbeginn).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kaltmiete:</span>
              <span className="font-medium">{formData.kaltmiete.toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wohnflaeche:</span>
              <span className="font-medium">{formData.wohnflaeche} m2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Miete pro m2:</span>
              <span className="font-medium">{(formData.kaltmiete / formData.wohnflaeche).toFixed(2)} EUR/m2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Baujahr:</span>
              <span className="font-medium">{formData.baujahr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ausstattung:</span>
              <span className="font-medium capitalize">{formData.ausstattung}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Mit Klick auf "Jetzt pruefen" analysieren wir Ihre Angaben und vergleichen Ihre
              Miete mit der ortsueblichen Vergleichsmiete.
            </p>
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
