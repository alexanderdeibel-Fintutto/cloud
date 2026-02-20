import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap,
  FileText,
  Building2,
  Euro,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../hooks/use-toast'
import { useBescheidContext } from '../contexts/BescheidContext'
import { useConfetti } from '../hooks/use-confetti'
import { formatCurrency } from '../lib/utils'
import type { Bescheid } from '../types/bescheid'

type WizardStep = 1 | 2 | 3 | 4

interface FormData {
  // Step 1: Grunddaten
  typ: string
  steuerjahr: string
  // Step 2: Finanzamt
  finanzamt: string
  aktenzeichen: string
  // Step 3: Betraege
  festgesetzteSteuer: string
  erwarteteSteuer: string
  einspruchsfrist: string
  // Step 4: Notizen
  notizen: string
}

const STEUERARTEN = [
  { value: 'einkommensteuer', label: 'Einkommensteuer', icon: '💰' },
  { value: 'gewerbesteuer', label: 'Gewerbesteuer', icon: '🏢' },
  { value: 'umsatzsteuer', label: 'Umsatzsteuer', icon: '📊' },
  { value: 'koerperschaftsteuer', label: 'Koerperschaftsteuer', icon: '🏛' },
  { value: 'grundsteuer', label: 'Grundsteuer', icon: '🏠' },
  { value: 'sonstige', label: 'Sonstige', icon: '📋' },
]

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020]

const STEP_CONFIG = [
  { step: 1, title: 'Steuerart & Jahr', icon: FileText },
  { step: 2, title: 'Finanzamt', icon: Building2 },
  { step: 3, title: 'Betraege', icon: Euro },
  { step: 4, title: 'Zusammenfassung', icon: CheckCircle2 },
]

export default function SchnellerfassungPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    typ: '',
    steuerjahr: '',
    finanzamt: '',
    aktenzeichen: '',
    festgesetzteSteuer: '',
    erwarteteSteuer: '',
    einspruchsfrist: '',
    notizen: '',
  })

  const navigate = useNavigate()
  const { toast } = useToast()
  const { createBescheid } = useBescheidContext()
  const fireConfetti = useConfetti()

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.typ !== '' && formData.steuerjahr !== ''
      case 2:
        return formData.finanzamt.trim().length > 0
      case 3:
        return formData.festgesetzteSteuer.trim().length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as WizardStep)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const typLabel = formData.typ.charAt(0).toUpperCase() + formData.typ.slice(1)
    const festgesetzt = parseFloat(formData.festgesetzteSteuer.replace(',', '.')) || 0
    const erwartet = formData.erwarteteSteuer
      ? parseFloat(formData.erwarteteSteuer.replace(',', '.'))
      : undefined

    const bescheid = await createBescheid({
      titel: `${typLabel} ${formData.steuerjahr}`,
      typ: formData.typ as Bescheid['typ'],
      steuerjahr: parseInt(formData.steuerjahr),
      finanzamt: formData.finanzamt,
      aktenzeichen: formData.aktenzeichen || undefined,
      festgesetzteSteuer: festgesetzt,
      erwarteteSteuer: erwartet,
      einspruchsfrist: formData.einspruchsfrist || undefined,
      notizen: formData.notizen || undefined,
    })

    setIsSubmitting(false)

    if (bescheid) {
      fireConfetti()
      toast({
        title: 'Bescheid erfasst!',
        description: 'Der Bescheid wurde erfolgreich angelegt.',
      })
      navigate(`/bescheide/${bescheid.id}`)
    } else {
      toast({
        title: 'Fehler',
        description: 'Bescheid konnte nicht angelegt werden.',
        variant: 'destructive',
      })
    }
  }

  const abweichung = (() => {
    const f = parseFloat(formData.festgesetzteSteuer.replace(',', '.')) || 0
    const e = parseFloat(formData.erwarteteSteuer.replace(',', '.')) || 0
    if (f && e) return f - e
    return null
  })()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Zap className="h-8 w-8 text-amber-500" />
          Schnellerfassung
        </h1>
        <p className="text-muted-foreground mt-1">
          Neuen Steuerbescheid in wenigen Schritten erfassen
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEP_CONFIG.map((cfg, i) => {
          const isActive = currentStep === cfg.step
          const isDone = currentStep > cfg.step
          const Icon = cfg.icon

          return (
            <div key={cfg.step} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => {
                  if (isDone) setCurrentStep(cfg.step as WizardStep)
                }}
                disabled={!isDone && !isActive}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors w-full ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isDone
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/60'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline truncate">{cfg.title}</span>
                <span className="sm:hidden">{cfg.step}</span>
              </button>
              {i < STEP_CONFIG.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Steuerart & Jahr */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Steuerart & Steuerjahr</CardTitle>
            <CardDescription>Waehlen Sie die Art des Bescheids und das Steuerjahr</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Steuerart *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STEUERARTEN.map(art => (
                  <button
                    key={art.value}
                    onClick={() => updateField('typ', art.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                      formData.typ === art.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent/30'
                    }`}
                  >
                    <span className="text-lg">{art.icon}</span>
                    {art.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Steuerjahr *</Label>
              <div className="flex flex-wrap gap-2">
                {YEARS.map(year => (
                  <button
                    key={year}
                    onClick={() => updateField('steuerjahr', year.toString())}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      formData.steuerjahr === year.toString()
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent/30'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Finanzamt */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Finanzamt & Aktenzeichen
            </CardTitle>
            <CardDescription>Angaben zum zustaendigen Finanzamt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Finanzamt *</Label>
              <Input
                value={formData.finanzamt}
                onChange={e => updateField('finanzamt', e.target.value)}
                placeholder="z.B. Finanzamt Muenchen I"
              />
              <p className="text-xs text-muted-foreground">
                Tipp: Das Finanzamt finden Sie oben rechts auf Ihrem Steuerbescheid.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Aktenzeichen</Label>
              <Input
                value={formData.aktenzeichen}
                onChange={e => updateField('aktenzeichen', e.target.value)}
                placeholder="z.B. 123/456/78901"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Hilft bei der eindeutigen Zuordnung.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Betraege */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Steuerbetraege
            </CardTitle>
            <CardDescription>Tragen Sie die relevanten Betraege ein</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Festgesetzte Steuer *</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.festgesetzteSteuer}
                  onChange={e => updateField('festgesetzteSteuer', e.target.value)}
                  placeholder="0,00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EUR</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Der Betrag, den das Finanzamt festgesetzt hat.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Erwartete Steuer</Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.erwarteteSteuer}
                  onChange={e => updateField('erwarteteSteuer', e.target.value)}
                  placeholder="0,00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">EUR</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Optional. Der Betrag, den Sie laut eigener Berechnung erwartet haben.
              </p>
            </div>

            {abweichung !== null && abweichung !== 0 && (
              <div className={`rounded-lg p-3 flex items-center gap-2 ${
                abweichung > 0
                  ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
              }`}>
                {abweichung > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  abweichung > 0
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  Abweichung: {formatCurrency(Math.abs(abweichung))}
                  {abweichung > 0 ? ' mehr als erwartet' : ' weniger als erwartet'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Einspruchsfrist</Label>
              <Input
                type="date"
                value={formData.einspruchsfrist}
                onChange={e => updateField('einspruchsfrist', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                In der Regel 4 Wochen nach Zugang des Bescheids.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notizen</Label>
              <textarea
                value={formData.notizen}
                onChange={e => updateField('notizen', e.target.value)}
                placeholder="Optionale Anmerkungen zum Bescheid..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Zusammenfassung */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Zusammenfassung
            </CardTitle>
            <CardDescription>Ueberpruefen Sie Ihre Angaben</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-border divide-y divide-border">
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Steuerart</span>
                  <span className="text-sm font-medium capitalize">{formData.typ}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Steuerjahr</span>
                  <span className="text-sm font-medium">{formData.steuerjahr}</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Finanzamt</span>
                  <span className="text-sm font-medium">{formData.finanzamt}</span>
                </div>
                {formData.aktenzeichen && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-muted-foreground">Aktenzeichen</span>
                    <span className="text-sm font-mono">{formData.aktenzeichen}</span>
                  </div>
                )}
                <div className="flex justify-between p-3">
                  <span className="text-sm text-muted-foreground">Festgesetzte Steuer</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(parseFloat(formData.festgesetzteSteuer.replace(',', '.')) || 0)}
                  </span>
                </div>
                {formData.erwarteteSteuer && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-muted-foreground">Erwartete Steuer</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(parseFloat(formData.erwarteteSteuer.replace(',', '.')) || 0)}
                    </span>
                  </div>
                )}
                {abweichung !== null && abweichung !== 0 && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-muted-foreground">Abweichung</span>
                    <span className={`text-sm font-bold ${
                      abweichung > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {abweichung > 0 ? '+' : ''}{formatCurrency(abweichung)}
                    </span>
                  </div>
                )}
                {formData.einspruchsfrist && (
                  <div className="flex justify-between p-3">
                    <span className="text-sm text-muted-foreground">Einspruchsfrist</span>
                    <span className="text-sm">{formData.einspruchsfrist}</span>
                  </div>
                )}
                {formData.notizen && (
                  <div className="p-3">
                    <span className="text-sm text-muted-foreground block mb-1">Notizen</span>
                    <p className="text-sm">{formData.notizen}</p>
                  </div>
                )}
              </div>

              {abweichung !== null && abweichung > 100 && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Deutliche Abweichung erkannt
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                      Wir empfehlen, den Bescheid mit der KI-Analyse pruefen zu lassen und
                      ggf. einen Einspruch einzulegen.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck
        </Button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gap-2"
            >
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isSubmitting ? 'Wird gespeichert...' : 'Bescheid anlegen'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
