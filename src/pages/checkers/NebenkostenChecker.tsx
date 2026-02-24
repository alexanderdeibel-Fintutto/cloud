import { Receipt } from 'lucide-react'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
 claude/review-repo-setup-0rnoo
import { getFormulareAppUrl } from '@/lib/checker-utils'
import { formatCurrency } from '@/lib/utils'
import { useCheckerForm } from '@/hooks/useCheckerForm'

import { getFormulareAppUrl, getRechnerAppUrl, formatCurrency } from '@/lib/utils'
 main
import { toast } from 'sonner'

interface FormData {
  abrechnungsjahr: string
  abrechnungErhaltAm: string
  wohnflaeche: number
  gesamtNebenkosten: number
  vorauszahlungen: number
  nachzahlung: number
  heizkosten: number
  wasserkosten: number
  muellkosten: number
  hausmeisterkosten: number
  verwaltungskosten: number
  sonstigeKosten: number
}

const initialFormData: FormData = {
  abrechnungsjahr: '',
  abrechnungErhaltAm: '',
  wohnflaeche: 0,
  gesamtNebenkosten: 0,
  vorauszahlungen: 0,
  nachzahlung: 0,
  heizkosten: 0,
  wasserkosten: 0,
  muellkosten: 0,
  hausmeisterkosten: 0,
  verwaltungskosten: 0,
  sonstigeKosten: 0,
}

export default function NebenkostenChecker() {
  const {
    step, setStep, isLoading, setIsLoading,
    result, formData, updateField, submitResult,
    handleGoToForm, handleStartNew,
  } = useCheckerForm<FormData>({ checkerType: 'nebenkosten', totalSteps: 3, initialFormData })

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []
      let potentialSavings = 0

      // Frist pruefen (12 Monate nach Ende des Abrechnungszeitraums)
      const abrechnungErhalt = new Date(formData.abrechnungErhaltAm)
      const abrechnungsjahrEnde = new Date(`${formData.abrechnungsjahr}-12-31`)
      const fristEnde = new Date(abrechnungsjahrEnde)
      fristEnde.setMonth(fristEnde.getMonth() + 12)

      if (abrechnungErhalt > fristEnde) {
        violations.push(`Die Abrechnung wurde nach Ablauf der 12-Monats-Frist zugestellt. Eine Nachzahlung kann nicht mehr verlangt werden.`)
        potentialSavings += formData.nachzahlung
      }

      // Durchschnittswerte pruefen (grobe Richtwerte)
      const nebenkostenProQm = formData.gesamtNebenkosten / 12 / formData.wohnflaeche
      if (nebenkostenProQm > 4.5) {
        violations.push(`Ihre Nebenkosten von ${nebenkostenProQm.toFixed(2)} EUR/m2 pro Monat liegen deutlich ueber dem Durchschnitt von ca. 2,50-3,50 EUR/m2.`)
        potentialSavings += (nebenkostenProQm - 3.5) * formData.wohnflaeche * 12
      }

      // Verwaltungskosten pruefen (nicht umlegbar)
      if (formData.verwaltungskosten > 0) {
        violations.push(`Verwaltungskosten von ${formatCurrency(formData.verwaltungskosten)} sind in der Regel nicht auf Mieter umlegbar.`)
        potentialSavings += formData.verwaltungskosten
      }

      // Hausmeisterkosten pruefen
      const hausmeisterProQm = formData.hausmeisterkosten / formData.wohnflaeche
      if (hausmeisterProQm > 15) {
        violations.push(`Die Hausmeisterkosten von ${hausmeisterProQm.toFixed(2)} EUR/m2 pro Jahr erscheinen ungewoehnlich hoch.`)
      }

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Moegliche Fehler in der Nebenkostenabrechnung!',
          summary: `Wir haben ${violations.length} moegliche Probleme in Ihrer Nebenkostenabrechnung gefunden.`,
          details: violations,
          potentialSavings: Math.max(potentialSavings, 0),
          recommendation: 'Wir empfehlen Ihnen, innerhalb von 12 Monaten nach Erhalt der Abrechnung Widerspruch einzulegen. Fordern Sie zudem Belegeinsicht beim Vermieter an.',
          formType: 'nebenkostenabrechnung-widerspruch',
          formRedirectUrl: getFormulareAppUrl('nebenkostenabrechnung-widerspruch', {
            abrechnungsjahr: formData.abrechnungsjahr,
            nachzahlung: String(formData.nachzahlung),
          }),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Keine offensichtlichen Fehler gefunden',
          summary: 'Die Nebenkostenabrechnung scheint formal korrekt zu sein.',
          details: [
            `Nebenkosten pro m2/Monat: ${nebenkostenProQm.toFixed(2)} EUR (im normalen Bereich)`,
            'Abrechnungsfrist wurde eingehalten',
            'Keine unzulaessigen Kostenpositionen erkannt',
          ],
          recommendation: 'Auch wenn keine offensichtlichen Fehler vorliegen, haben Sie das Recht auf Belegeinsicht. Nutzen Sie dieses Recht, um die Abrechnung im Detail zu pruefen.',
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
      <CheckerLayout
        title="Nebenkosten-Checker"
        description="Ihr Ergebnis"
        icon={<Receipt className="w-8 h-8" />}
      >
        <CheckerResult
          result={result}
          checkerType="nebenkosten"
          onGoToForm={handleGoToForm}
          onStartNew={handleStartNew}
          rechnerUrl={getRechnerAppUrl('nebenkosten')}
        />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Nebenkosten-Checker"
      description="Pruefen Sie Ihre Nebenkostenabrechnung auf Fehler und zu hohe Kosten."
      icon={<Receipt className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep
          onNext={() => setStep(2)}
          canProceed={!!formData.abrechnungsjahr && !!formData.abrechnungErhaltAm && formData.wohnflaeche > 0}
          showPrevious={false}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Allgemeine Angaben</h2>

          <div className="space-y-4">
            <CheckerField
              name="abrechnungsjahr"
              label="Abrechnungsjahr"
              type="select"
              value={formData.abrechnungsjahr}
              onChange={(v) => updateField('abrechnungsjahr', v)}
              required
              options={[
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
                { value: '2022', label: '2022' },
              ]}
            />

            <CheckerField
              name="abrechnungErhaltAm"
              label="Abrechnung erhalten am"
              type="date"
              value={formData.abrechnungErhaltAm}
              onChange={(v) => updateField('abrechnungErhaltAm', v)}
              required
            />

            <CheckerField
              name="wohnflaeche"
              label="Wohnflaeche"
              type="area"
              value={formData.wohnflaeche}
              onChange={(v) => updateField('wohnflaeche', v)}
              required
            />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onNext={() => setStep(3)} onPrevious={() => setStep(1)} canProceed={formData.gesamtNebenkosten > 0}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kosten</h2>

          <div className="space-y-4">
            <CheckerField
              name="gesamtNebenkosten"
              label="Gesamte Nebenkosten (laut Abrechnung)"
              type="currency"
              value={formData.gesamtNebenkosten}
              onChange={(v) => updateField('gesamtNebenkosten', v)}
              required
            />

            <CheckerField
              name="vorauszahlungen"
              label="Ihre Vorauszahlungen (Summe des Jahres)"
              type="currency"
              value={formData.vorauszahlungen}
              onChange={(v) => updateField('vorauszahlungen', v)}
            />

            <CheckerField
              name="nachzahlung"
              label="Nachzahlung / Guthaben"
              type="currency"
              value={formData.nachzahlung}
              onChange={(v) => updateField('nachzahlung', v)}
              helpText="Bei Guthaben bitte negativen Wert eingeben"
            />
          </div>
        </CheckerStep>
      )}

      {step === 3 && (
        <CheckerStep onPrevious={() => setStep(2)} onNext={analyzeResult} nextLabel="Jetzt pruefen" isLoading={isLoading}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Einzelne Kostenpositionen</h2>
          <p className="text-gray-600 mb-6">Optional: Geben Sie die einzelnen Positionen ein fuer eine detailliertere Analyse.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckerField
              name="heizkosten"
              label="Heizkosten"
              type="currency"
              value={formData.heizkosten}
              onChange={(v) => updateField('heizkosten', v)}
            />

            <CheckerField
              name="wasserkosten"
              label="Wasserkosten"
              type="currency"
              value={formData.wasserkosten}
              onChange={(v) => updateField('wasserkosten', v)}
            />

            <CheckerField
              name="muellkosten"
              label="Muellabfuhr"
              type="currency"
              value={formData.muellkosten}
              onChange={(v) => updateField('muellkosten', v)}
            />

            <CheckerField
              name="hausmeisterkosten"
              label="Hausmeister"
              type="currency"
              value={formData.hausmeisterkosten}
              onChange={(v) => updateField('hausmeisterkosten', v)}
            />

            <CheckerField
              name="verwaltungskosten"
              label="Verwaltungskosten"
              type="currency"
              value={formData.verwaltungskosten}
              onChange={(v) => updateField('verwaltungskosten', v)}
            />

            <CheckerField
              name="sonstigeKosten"
              label="Sonstige Kosten"
              type="currency"
              value={formData.sonstigeKosten}
              onChange={(v) => updateField('sonstigeKosten', v)}
            />
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
