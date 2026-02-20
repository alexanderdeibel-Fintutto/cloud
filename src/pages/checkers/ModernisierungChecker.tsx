import { Building } from 'lucide-react'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl, formatCurrency } from '@/lib/utils'
import { useCheckerForm } from '@/hooks/useCheckerForm'
import { toast } from 'sonner'

interface FormData {
  aktuelleKaltmiete: number
  wohnflaeche: number
  modernisierungskosten: number
  modernisierungsart: string
  ankuendigungErhalten: string
  ankuendigungsfrist: boolean
  massnahmenBeschrieben: boolean
}

const initialFormData: FormData = {
  aktuelleKaltmiete: 0,
  wohnflaeche: 0,
  modernisierungskosten: 0,
  modernisierungsart: '',
  ankuendigungErhalten: '',
  ankuendigungsfrist: true,
  massnahmenBeschrieben: true,
}

export default function ModernisierungChecker() {
  const {
    step, setStep, isLoading, setIsLoading,
    result, formData, updateField, submitResult,
    handleGoToForm, handleStartNew,
  } = useCheckerForm<FormData>({ checkerType: 'modernisierung', totalSteps: 2, initialFormData })

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []

      // Seit 2019: max. 8% der Modernisierungskosten pro Jahr umlegbar
      const maxUmlage = formData.modernisierungskosten * 0.08 / 12
      const maxMieterhoehung = Math.min(maxUmlage, 3 * formData.wohnflaeche / 12) // Kappung bei 3 EUR/m2 in 6 Jahren

      // Ankuendigungsfrist pruefen
      if (!formData.ankuendigungsfrist) {
        violations.push('Die Ankuendigungsfrist von 3 Monaten vor Beginn der Massnahmen wurde nicht eingehalten.')
      }

      if (!formData.massnahmenBeschrieben) {
        violations.push('Die Modernisierungsmassnahmen wurden nicht ausreichend beschrieben.')
      }

      // Pruefen ob Instandhaltung statt Modernisierung
      if (formData.modernisierungsart === 'instandhaltung') {
        violations.push('Reine Instandhaltungsmassnahmen berechtigen nicht zur Mieterhoehung. Diese Kosten traegt der Vermieter.')
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Modernisierungsumlage moeglicherweise unzulaessig!',
          summary: `Es wurden ${violations.length} moegliche Maengel gefunden.`,
          details: [
            ...violations,
            `Maximale Umlage laut Gesetz: ${formatCurrency(maxMieterhoehung)}/Monat`,
          ],
          potentialSavings: maxMieterhoehung * 12,
          recommendation: 'Widersprechen Sie der Modernisierungsankuendigung bzw. der Mieterhoehung schriftlich.',
          formRedirectUrl: getFormulareAppUrl('modernisierung-widerspruch'),
        }
      } else {
        checkerResult = {
          status: 'neutral',
          title: 'Modernisierung formal korrekt angekuendigt',
          summary: 'Die Ankuendigung scheint formal korrekt zu sein.',
          details: [
            'Ankuendigungsfrist eingehalten',
            'Massnahmen beschrieben',
            `Maximale monatliche Umlage: ${formatCurrency(maxMieterhoehung)}`,
          ],
          recommendation: 'Pruefen Sie, ob die Kosten angemessen sind und ob es sich tatsaechlich um Modernisierung (nicht Instandhaltung) handelt.',
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
      <CheckerLayout title="Modernisierungs-Checker" description="Ihr Ergebnis" icon={<Building className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="modernisierung" onGoToForm={handleGoToForm} onStartNew={handleStartNew} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Modernisierungs-Checker"
      description="Pruefen Sie die Modernisierungsankuendigung und Mieterhoehung."
      icon={<Building className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={formData.wohnflaeche > 0} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Grunddaten</h2>
          <div className="space-y-4">
            <CheckerField name="wohnflaeche" label="Wohnflaeche" type="area" value={formData.wohnflaeche} onChange={(v) => updateField('wohnflaeche', v)} required />
            <CheckerField name="aktuelleKaltmiete" label="Aktuelle Kaltmiete" type="currency" value={formData.aktuelleKaltmiete} onChange={(v) => updateField('aktuelleKaltmiete', v)} />
            <CheckerField name="modernisierungskosten" label="Angegebene Modernisierungskosten (fuer Ihre Wohnung)" type="currency" value={formData.modernisierungskosten} onChange={(v) => updateField('modernisierungskosten', v)} />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onPrevious={() => setStep(1)} onNext={analyzeResult} nextLabel="Pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Art der Massnahmen</h2>
          <div className="space-y-4">
            <CheckerField
              name="modernisierungsart"
              label="Art der Massnahmen"
              type="select"
              value={formData.modernisierungsart}
              onChange={(v) => updateField('modernisierungsart', v)}
              options={[
                { value: 'energetisch', label: 'Energetische Modernisierung (Daemmung, Heizung)' },
                { value: 'wohnwert', label: 'Wohnwertverbesserung (Bad, Kueche)' },
                { value: 'instandhaltung', label: 'Reparaturen / Instandhaltung' },
                { value: 'gemischt', label: 'Gemischte Massnahmen' },
              ]}
            />
            <CheckerField
              name="ankuendigungsfrist"
              label="Wurde die Ankuendigung mind. 3 Monate vor Baubeginn zugestellt?"
              type="select"
              value={formData.ankuendigungsfrist ? 'ja' : 'nein'}
              onChange={(v) => updateField('ankuendigungsfrist', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja' },
                { value: 'nein', label: 'Nein' },
              ]}
            />
            <CheckerField
              name="massnahmenBeschrieben"
              label="Sind die Massnahmen konkret beschrieben?"
              type="select"
              value={formData.massnahmenBeschrieben ? 'ja' : 'nein'}
              onChange={(v) => updateField('massnahmenBeschrieben', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja, detailliert' },
                { value: 'nein', label: 'Nein, nur pauschal' },
              ]}
            />
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
