import { Wrench } from 'lucide-react'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl } from '@/lib/checker-utils'
import { formatCurrency } from '@/lib/utils'
import { useCheckerForm } from '@/hooks/useCheckerForm'
import { toast } from 'sonner'

interface FormData {
  mangelart: string
  kaltmiete: number
  mangelBekannt: string
  vermieterInformiert: boolean
  informiertAm: string
  beeintraechtigung: string
}

const MINDERUNGSQUOTEN: Record<string, { min: number; max: number; label: string }> = {
  heizungsausfall_winter: { min: 50, max: 100, label: 'Heizungsausfall im Winter' },
  heizungsausfall_sommer: { min: 0, max: 10, label: 'Heizungsausfall im Sommer' },
  warmwasser: { min: 10, max: 30, label: 'Kein Warmwasser' },
  schimmel_wohnraum: { min: 10, max: 50, label: 'Schimmel im Wohnraum' },
  schimmel_bad: { min: 5, max: 20, label: 'Schimmel im Bad' },
  laerm_baustelle: { min: 10, max: 25, label: 'Baulaerm' },
  laerm_nachbarn: { min: 5, max: 20, label: 'Laerm durch Nachbarn' },
  ungeziefer: { min: 10, max: 50, label: 'Ungeziefer (Kakerlaken, Maeuse)' },
  fenster_defekt: { min: 5, max: 15, label: 'Defekte Fenster' },
  aufzug_defekt: { min: 3, max: 10, label: 'Defekter Aufzug' },
  wassereinbruch: { min: 20, max: 80, label: 'Wassereinbruch' },
  toilette_defekt: { min: 20, max: 50, label: 'Toilette defekt' },
  elektrik_defekt: { min: 10, max: 30, label: 'Elektrik defekt' },
}

const initialFormData: FormData = {
  mangelart: '', kaltmiete: 0, mangelBekannt: '', vermieterInformiert: false, informiertAm: '', beeintraechtigung: 'mittel',
}

export default function MietminderungChecker() {
  const {
    step, setStep, isLoading, setIsLoading,
    result, formData, updateField, submitResult,
    handleGoToForm, handleStartNew,
  } = useCheckerForm<FormData>({ checkerType: 'mietminderung', totalSteps: 2, initialFormData })

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const mangel = MINDERUNGSQUOTEN[formData.mangelart]
      if (!mangel) {
        toast.error('Bitte waehlen Sie einen Mangel aus.')
        setIsLoading(false)
        return
      }

      let minderungsquote = mangel.min
      if (formData.beeintraechtigung === 'stark') {
        minderungsquote = mangel.max
      } else if (formData.beeintraechtigung === 'mittel') {
        minderungsquote = Math.round((mangel.min + mangel.max) / 2)
      }

      const minderungsbetrag = (formData.kaltmiete * minderungsquote) / 100
      const mangelBekannt = new Date(formData.mangelBekannt)
      const heute = new Date()
      const monate = Math.floor((heute.getTime() - mangelBekannt.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const potentialSavings = minderungsbetrag * Math.min(monate, 6)

      const details: string[] = [
        `Mangel: ${mangel.label}`,
        `Empfohlene Minderungsquote: ${minderungsquote}%`,
        `Monatlicher Minderungsbetrag: ${formatCurrency(minderungsbetrag)}`,
        `Mangel besteht seit: ${monate} Monaten`,
      ]

      if (!formData.vermieterInformiert) {
        details.push('Wichtig: Der Vermieter muss zunaechst ueber den Mangel informiert werden!')
      }

      let checkerResult: CheckerResultType

      if (minderungsquote > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Mietminderung moeglich!',
          summary: `Bei "${mangel.label}" ist eine Mietminderung von ca. ${minderungsquote}% moeglich.`,
          details,
          potentialSavings,
          recommendation: formData.vermieterInformiert
            ? 'Teilen Sie Ihrem Vermieter schriftlich mit, dass Sie die Miete mindern. Nutzen Sie unser Formular.'
            : 'Informieren Sie zunaechst Ihren Vermieter schriftlich ueber den Mangel und setzen Sie eine Frist zur Behebung.',
          formRedirectUrl: getFormulareAppUrl('mietminderung-anzeige'),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Keine Mietminderung moeglich',
          summary: 'Bei diesem Mangel ist in der Regel keine Mietminderung moeglich.',
          details,
          recommendation: 'Informieren Sie dennoch Ihren Vermieter ueber den Mangel.',
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
      <CheckerLayout title="Mietminderungs-Checker" description="Ihr Ergebnis" icon={<Wrench className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="mietminderung" onGoToForm={handleGoToForm} onStartNew={handleStartNew} rechnerUrl={getRechnerAppUrl('kaution', { rent: String(formData.kaltmiete) })} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Mietminderungs-Checker"
      description="Berechnen Sie, wie viel Miete Sie bei Maengeln mindern koennen."
      icon={<Wrench className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={!!formData.mangelart && formData.kaltmiete > 0} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Art des Mangels</h2>
          <div className="space-y-4">
            <CheckerField
              name="mangelart"
              label="Welcher Mangel liegt vor?"
              type="select"
              value={formData.mangelart}
              onChange={(v) => updateField('mangelart', v)}
              required
              options={Object.entries(MINDERUNGSQUOTEN).map(([key, value]) => ({
                value: key,
                label: `${value.label} (${value.min}-${value.max}%)`,
              }))}
            />
            <CheckerField name="kaltmiete" label="Ihre Kaltmiete" type="currency" value={formData.kaltmiete} onChange={(v) => updateField('kaltmiete', v)} required />
            <CheckerField
              name="beeintraechtigung"
              label="Wie stark ist die Beeintraechtigung?"
              type="select"
              value={formData.beeintraechtigung}
              onChange={(v) => updateField('beeintraechtigung', v)}
              options={[
                { value: 'gering', label: 'Gering (nur leichte Beeintraechtigung)' },
                { value: 'mittel', label: 'Mittel (deutliche Beeintraechtigung)' },
                { value: 'stark', label: 'Stark (erhebliche Beeintraechtigung)' },
              ]}
            />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onPrevious={() => setStep(1)} onNext={analyzeResult} nextLabel="Berechnen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Weitere Details</h2>
          <div className="space-y-4">
            <CheckerField name="mangelBekannt" label="Seit wann besteht der Mangel?" type="date" value={formData.mangelBekannt} onChange={(v) => updateField('mangelBekannt', v)} required />
            <CheckerField
              name="vermieterInformiert"
              label="Vermieter ueber Mangel informiert?"
              type="select"
              value={formData.vermieterInformiert ? 'ja' : 'nein'}
              onChange={(v) => updateField('vermieterInformiert', v === 'ja')}
              options={[
                { value: 'ja', label: 'Ja' },
                { value: 'nein', label: 'Nein' },
              ]}
            />
            {formData.vermieterInformiert && (
              <CheckerField name="informiertAm" label="Wann informiert?" type="date" value={formData.informiertAm} onChange={(v) => updateField('informiertAm', v)} />
            )}
          </div>

          {!formData.vermieterInformiert && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Wichtig:</strong> Eine Mietminderung ist erst ab dem Zeitpunkt moeglich, ab dem der Vermieter ueber den Mangel informiert wurde.
              </p>
            </div>
          )}
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
