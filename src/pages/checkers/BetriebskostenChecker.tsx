import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import { useChecker, CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { useAuth } from '@/contexts/AuthContext'
import { CheckerLayout, CheckerField, CheckerStep, CheckerResult } from '@/components/checker'
import { getFormulareAppUrl, getRechnerAppUrl, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface FormData {
  wohnflaeche: number
  gesamtkosten: number
  heizkosten: number
  warmwasser: number
  kaltwasser: number
  abwasser: number
  muell: number
  strassenreinigung: number
  hausmeister: number
  gartenpflege: number
  aufzug: number
  beleuchtung: number
  versicherung: number
  grundsteuer: number
  kabelanschluss: number
  schornsteinfeger: number
}

export default function BetriebskostenChecker() {
  const navigate = useNavigate()
  const { startSession, completeSession, clearSession } = useChecker()
  const { canUseChecker, incrementChecksUsed } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckerResultType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    wohnflaeche: 0,
    gesamtkosten: 0,
    heizkosten: 0,
    warmwasser: 0,
    kaltwasser: 0,
    abwasser: 0,
    muell: 0,
    strassenreinigung: 0,
    hausmeister: 0,
    gartenpflege: 0,
    aufzug: 0,
    beleuchtung: 0,
    versicherung: 0,
    grundsteuer: 0,
    kabelanschluss: 0,
    schornsteinfeger: 0,
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
    await startSession('betriebskosten', 2)
  }

  const updateField = (field: keyof FormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeResult = async () => {
    setIsLoading(true)

    try {
      const violations: string[] = []
      let potentialSavings = 0

      // Durchschnittswerte pro m2 pro Jahr (Richtwerte)
      const benchmarks: Record<string, number> = {
        heizkosten: 12.0,
        warmwasser: 2.5,
        kaltwasser: 2.0,
        abwasser: 1.5,
        muell: 2.0,
        strassenreinigung: 0.5,
        hausmeister: 1.5,
        gartenpflege: 0.5,
        aufzug: 1.0,
        beleuchtung: 0.3,
        versicherung: 1.5,
        grundsteuer: 1.5,
        schornsteinfeger: 0.2,
      }

      const labels: Record<string, string> = {
        heizkosten: 'Heizkosten',
        warmwasser: 'Warmwasser',
        kaltwasser: 'Kaltwasser',
        abwasser: 'Abwasser',
        muell: 'Muellabfuhr',
        hausmeister: 'Hausmeister',
        aufzug: 'Aufzug',
        versicherung: 'Versicherung',
        grundsteuer: 'Grundsteuer',
      }

      Object.entries(benchmarks).forEach(([key, benchmark]) => {
        const value = formData[key as keyof FormData] as number
        if (value > 0 && formData.wohnflaeche > 0) {
          const perQm = value / formData.wohnflaeche
          if (perQm > benchmark * 1.5) {
            const label = labels[key] || key
            violations.push(`${label}: ${perQm.toFixed(2)} EUR/m2 (Durchschnitt: ca. ${benchmark} EUR/m2)`)
            potentialSavings += (perQm - benchmark) * formData.wohnflaeche
          }
        }
      })

      let checkerResult: CheckerResultType

      if (violations.length > 0) {
        checkerResult = {
          status: 'positive',
          title: 'Ungewoehnlich hohe Betriebskosten erkannt!',
          summary: `${violations.length} Kostenpositionen liegen deutlich ueber dem Durchschnitt.`,
          details: violations,
          potentialSavings,
          recommendation: 'Fordern Sie Belegeinsicht beim Vermieter an und pruefen Sie die einzelnen Positionen im Detail.',
          formRedirectUrl: getFormulareAppUrl('betriebskosten-pruefung'),
        }
      } else {
        checkerResult = {
          status: 'negative',
          title: 'Betriebskosten im normalen Bereich',
          summary: 'Ihre Betriebskosten liegen im ueblichen Rahmen.',
          details: [
            `Gesamtkosten: ${formatCurrency(formData.gesamtkosten)}`,
            `Pro m2/Jahr: ${(formData.gesamtkosten / formData.wohnflaeche).toFixed(2)} EUR`,
          ],
          recommendation: 'Auch wenn die Kosten normal erscheinen, pruefen Sie regelmaessig Ihre Abrechnungen.',
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
      wohnflaeche: 0, gesamtkosten: 0, heizkosten: 0, warmwasser: 0, kaltwasser: 0,
      abwasser: 0, muell: 0, strassenreinigung: 0, hausmeister: 0, gartenpflege: 0,
      aufzug: 0, beleuchtung: 0, versicherung: 0, grundsteuer: 0, kabelanschluss: 0, schornsteinfeger: 0,
    })
    initSession()
  }

  if (result) {
    return (
      <CheckerLayout title="Betriebskosten-Checker" description="Ihr Ergebnis" icon={<Banknote className="w-8 h-8" />}>
        <CheckerResult result={result} checkerType="betriebskosten" onGoToForm={handleGoToForm} onStartNew={handleStartNew} rechnerUrl={getRechnerAppUrl('nebenkosten')} />
      </CheckerLayout>
    )
  }

  return (
    <CheckerLayout
      title="Betriebskosten-Checker"
      description="Detaillierte Analyse aller Betriebskostenpositionen"
      icon={<Banknote className="w-8 h-8" />}
    >
      {step === 1 && (
        <CheckerStep onNext={() => setStep(2)} canProceed={formData.wohnflaeche > 0} showPrevious={false}>
          <h2 className="text-xl font-semibold mb-4">Grunddaten</h2>
          <div className="space-y-4">
            <CheckerField name="wohnflaeche" label="Wohnflaeche" type="area" value={formData.wohnflaeche} onChange={(v) => updateField('wohnflaeche', v as number)} required />
            <CheckerField name="gesamtkosten" label="Gesamte Betriebskosten (Jahr)" type="currency" value={formData.gesamtkosten} onChange={(v) => updateField('gesamtkosten', v as number)} />
          </div>
        </CheckerStep>
      )}

      {step === 2 && (
        <CheckerStep onPrevious={() => setStep(1)} onNext={analyzeResult} nextLabel="Analysieren" isLoading={isLoading}>
          <h2 className="text-xl font-semibold mb-4">Einzelpositionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckerField name="heizkosten" label="Heizkosten" type="currency" value={formData.heizkosten} onChange={(v) => updateField('heizkosten', v as number)} />
            <CheckerField name="warmwasser" label="Warmwasser" type="currency" value={formData.warmwasser} onChange={(v) => updateField('warmwasser', v as number)} />
            <CheckerField name="kaltwasser" label="Kaltwasser" type="currency" value={formData.kaltwasser} onChange={(v) => updateField('kaltwasser', v as number)} />
            <CheckerField name="muell" label="Muellabfuhr" type="currency" value={formData.muell} onChange={(v) => updateField('muell', v as number)} />
            <CheckerField name="hausmeister" label="Hausmeister" type="currency" value={formData.hausmeister} onChange={(v) => updateField('hausmeister', v as number)} />
            <CheckerField name="aufzug" label="Aufzug" type="currency" value={formData.aufzug} onChange={(v) => updateField('aufzug', v as number)} />
            <CheckerField name="versicherung" label="Versicherung" type="currency" value={formData.versicherung} onChange={(v) => updateField('versicherung', v as number)} />
            <CheckerField name="grundsteuer" label="Grundsteuer" type="currency" value={formData.grundsteuer} onChange={(v) => updateField('grundsteuer', v as number)} />
          </div>
        </CheckerStep>
      )}
    </CheckerLayout>
  )
}
