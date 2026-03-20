import { Key } from 'lucide-react'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl, getRechnerAppUrl, formatCurrency } from '@/lib/utils'
import { useCheckerForm } from '@/hooks/useCheckerForm'
import { toast } from 'sonner'

interface FormData {
  kautionHoehe: number
  kaltmiete: number
  mietende: string
  kautionZurueck: boolean
  teilbetragZurueck: number
  abzuege: string
  abzugHoehe: number
  wohnungUebergeben: string
  protokollVorhanden: boolean
}

const initialFormData: FormData = {
  kautionHoehe: 0, kaltmiete: 0, mietende: '', kautionZurueck: false,
  teilbetragZurueck: 0, abzuege: '', abzugHoehe: 0, wohnungUebergeben: '', protokollVorhanden: true,
}

export default function KautionChecker() {
  const {
    step, setStep, isLoading, setIsLoading,
    result, formData, updateField, submitResult,
    handleGoToForm, handleStartNew,
  } = useCheckerForm<FormData>({ checkerType: 'kaution', totalSteps: 3, initialFormData })

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []
      let potentialSavings = 0

      const maxKaution = formData.kaltmiete * 3
      if (formData.kautionHoehe > maxKaution) {
        violations.push(`Die Kaution von ${formatCurrency(formData.kautionHoehe)} ueberschreitet das Maximum von 3 Kaltmieten (${formatCurrency(maxKaution)}).`)
        potentialSavings += formData.kautionHoehe - maxKaution
      }

      const mietende = new Date(formData.mietende)
      const heute = new Date()
      const monateVerstrichen = Math.floor((heute.getTime() - mietende.getTime()) / (1000 * 60 * 60 * 24 * 30))

      if (!formData.kautionZurueck && monateVerstrichen > 6) {
        violations.push(`Die Kaution wurde nach ${monateVerstrichen} Monaten noch nicht zurueckgezahlt. Die uebliche Frist betraegt 3-6 Monate.`)
        potentialSavings += formData.kautionHoehe - formData.teilbetragZurueck
      }

      if (formData.abzuege === 'schoenheitsreparaturen') {
        violations.push('Abzuege fuer Schoenheitsreparaturen sind oft unwirksam, wenn die Klauseln im Mietvertrag unwirksam sind.')
        potentialSavings += formData.abzugHoehe
      }

      if (formData.abzuege === 'reinigung' && formData.abzugHoehe > 200) {
        violations.push(`Reinigungskosten von ${formatCurrency(formData.abzugHoehe)} erscheinen ungewoehnlich hoch.`)
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Anspruch auf Kautionsrueckzahlung moeglich!',
          summary: `Wir haben ${violations.length} moegliche Gruende fuer eine Rueckforderung gefunden.`,
          details: violations,
          potentialSavings,
          recommendation: 'Fordern Sie Ihren Vermieter schriftlich zur Rueckzahlung auf.',
          formRedirectUrl: getFormulareAppUrl('kaution-rueckforderung'),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Keine offensichtlichen Maengel gefunden',
          summary: 'Die Kautionsabrechnung scheint korrekt zu sein.',
          details: [
            `Kaution innerhalb des Limits (max. ${formatCurrency(maxKaution)})`,
            'Rueckgabefrist beachtet',
          ],
          recommendation: 'Pruefen Sie dennoch die einzelnen Abzugspositionen im Detail.',
        }
      }

      await submitResult(checkerResult)

    } catch {
      toast.error('Fehler bei der Analyse.')
    } finally {
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <CheckerLayout title="Kautions-Checker" description="Ihr Ergebnis" icon={<Key className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="kaution" onGoToForm={handleGoToForm} onStartNew={handleStartNew} rechnerUrl={getRechnerAppUrl('kaution', { rent: String(formData.kaltmiete) })} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Kautions-Checker"
      description="Pruefen Sie, ob Sie Anspruch auf Rueckzahlung der Kaution haben."
      icon={<Key className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={formData.kautionHoehe > 0 && formData.kaltmiete > 0} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Kautionsdaten</h2>
          <div className="space-y-4">
            <CheckerField name="kautionHoehe" label="Gezahlte Kaution" type="currency" value={formData.kautionHoehe} onChange={(v) => updateField('kautionHoehe', v)} required />
            <CheckerField name="kaltmiete" label="Kaltmiete (zum Zeitpunkt der Zahlung)" type="currency" value={formData.kaltmiete} onChange={(v) => updateField('kaltmiete', v)} required />
            {formData.kautionHoehe > formData.kaltmiete * 3 && formData.kaltmiete > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Hinweis:</strong> Die Kaution uebersteigt das gesetzliche Maximum von 3 Kaltmieten!
                </p>
              </div>
            )}
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onNext={() => setStep(3)} onPrevious={() => setStep(1)} canProceed={!!formData.mietende}>
          <h2 className="text-xl font-semibold mb-4">Mietende & Rueckgabe</h2>
          <div className="space-y-4">
            <CheckerField name="mietende" label="Mietverhaeltnis beendet am" type="date" value={formData.mietende} onChange={(v) => updateField('mietende', v)} required />
            <CheckerField
              name="kautionZurueck"
              label="Kaution zurueckerhalten?"
              type="select"
              value={formData.kautionZurueck ? 'ja' : 'nein'}
              onChange={(v) => updateField('kautionZurueck', v === 'ja')}
              options={[
                { value: 'nein', label: 'Nein' },
                { value: 'teilweise', label: 'Teilweise' },
                { value: 'ja', label: 'Ja, vollstaendig' },
              ]}
            />
            {!formData.kautionZurueck && (
              <CheckerField name="teilbetragZurueck" label="Zurueckerhaltener Teilbetrag" type="currency" value={formData.teilbetragZurueck} onChange={(v) => updateField('teilbetragZurueck', v)} />
            )}
          </div>
        </CheckerStep>
      )}

      {step === 3 && (
        <CheckerStep onPrevious={() => setStep(2)} onNext={analyzeResult} nextLabel="Jetzt pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Abzuege</h2>
          <div className="space-y-4">
            <CheckerField
              name="abzuege"
              label="Art der Abzuege (falls vorhanden)"
              type="select"
              value={formData.abzuege}
              onChange={(v) => updateField('abzuege', v)}
              options={[
                { value: '', label: 'Keine Abzuege' },
                { value: 'schoenheitsreparaturen', label: 'Schoenheitsreparaturen' },
                { value: 'reinigung', label: 'Reinigung' },
                { value: 'schaeden', label: 'Schaeden' },
                { value: 'nebenkosten', label: 'Offene Nebenkosten' },
                { value: 'sonstige', label: 'Sonstige' },
              ]}
            />
            {formData.abzuege && (
              <CheckerField name="abzugHoehe" label="Hoehe der Abzuege" type="currency" value={formData.abzugHoehe} onChange={(v) => updateField('abzugHoehe', v)} />
            )}
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
