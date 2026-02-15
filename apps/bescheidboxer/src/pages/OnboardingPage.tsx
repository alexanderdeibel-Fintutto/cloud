import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Upload,
  Search,
  ShieldAlert,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  TrendingDown,
  Rocket,
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'

type OnboardingStep = 0 | 1 | 2 | 3 | 4

const STORAGE_KEY = 'bescheidboxer-onboarding-done'

const STEPS = [
  {
    icon: Sparkles,
    title: 'Willkommen bei Bescheidboxer!',
    subtitle: 'Ihre KI-gestuetzte Steuerbescheid-Pruefung',
    description: 'Bescheidboxer prueft Ihre Steuerbescheide automatisch auf Fehler und findet Einsparpotenziale. In wenigen Schritten zeigen wir Ihnen, wie es funktioniert.',
    features: [
      { icon: FileText, text: 'Steuerbescheide hochladen und pruefen' },
      { icon: TrendingDown, text: 'Einsparpotenziale automatisch erkennen' },
      { icon: ShieldAlert, text: 'Einsprueche mit einem Klick erstellen' },
      { icon: Clock, text: 'Fristen nie wieder verpassen' },
    ],
  },
  {
    icon: Upload,
    title: 'Bescheid hochladen',
    subtitle: 'Schritt 1: Dokument bereitstellen',
    description: 'Laden Sie Ihren Steuerbescheid als PDF oder Foto hoch. Unsere OCR-Technologie erkennt automatisch alle wichtigen Daten - Steuerart, Betraege, Finanzamt und mehr.',
    tips: [
      'PDF-Dateien liefern die beste Qualitaet',
      'Fotos sollten gut belichtet und scharf sein',
      'Bis zu 20 Bescheide gleichzeitig hochladen',
      'Max. 20 MB pro Datei',
    ],
  },
  {
    icon: Search,
    title: 'KI-Analyse starten',
    subtitle: 'Schritt 2: Automatische Pruefung',
    description: 'Unsere KI vergleicht Ihren Bescheid mit den aktuellen Steuergesetzen und findet Abweichungen. Jede Position wird einzeln geprueft und mit Empfehlungen versehen.',
    tips: [
      'Pruefung dauert nur wenige Sekunden',
      'Jede Position wird einzeln analysiert',
      'Empfehlungen basieren auf aktuellem Steuerrecht',
      'Abweichungen werden farblich hervorgehoben',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Einspruch einlegen',
    subtitle: 'Schritt 3: Bei Bedarf handeln',
    description: 'Wenn Fehler gefunden werden, hilft Ihnen Bescheidboxer beim Einspruch. Waehlen Sie aus professionellen Vorlagen oder erstellen Sie Ihren eigenen Text. Fristen werden automatisch ueberwacht.',
    tips: [
      'Professionelle Einspruch-Vorlagen verfuegbar',
      'Automatische Fristenueberwachung',
      'Vorlagen fuer die haeufigsten Faelle',
      'Einspruch direkt aus der Analyse heraus',
    ],
  },
  {
    icon: BarChart3,
    title: 'Alles im Blick',
    subtitle: 'Schritt 4: Fortlaufende Uebersicht',
    description: 'Behalten Sie den Ueberblick ueber alle Bescheide, Fristen und Einsprueche. Mit Statistiken, Kalender und Jahresberichten haben Sie Ihre Steuersituation im Griff.',
    tips: [
      'Dashboard mit allen wichtigen Kennzahlen',
      'Kalender fuer Fristen und Termine',
      'Jahresbericht als PDF exportieren',
      'Archiv fuer abgeschlossene Vorgaenge',
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(0)
  const navigate = useNavigate()

  const progress = ((step + 1) / STEPS.length) * 100
  const currentStep = STEPS[step]
  const StepIcon = currentStep.icon

  const next = () => {
    if (step < 4) {
      setStep((step + 1) as OnboardingStep)
    } else {
      // Mark onboarding as done
      localStorage.setItem(STORAGE_KEY, 'true')
      navigate('/')
    }
  }

  const prev = () => {
    if (step > 0) setStep((step - 1) as OnboardingStep)
  }

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    navigate('/')
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{step + 1} von {STEPS.length}</span>
            <button onClick={skip} className="hover:text-foreground transition-colors">
              Ueberspringen
            </button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step Card */}
        <Card className="overflow-hidden">
          {/* Icon Header */}
          <div className="bg-gradient-to-br from-fintutto-blue-600 to-fintutto-blue-800 p-8 text-center text-white">
            <div className="inline-flex rounded-2xl bg-white/20 p-4 mb-4">
              <StepIcon className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold">{currentStep.title}</h1>
            <p className="text-fintutto-blue-100 mt-1">{currentStep.subtitle}</p>
          </div>

          <CardContent className="pt-6 pb-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Step 0: Feature highlights */}
            {step === 0 && currentStep.features && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStep.features.map((feature, i) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2 shrink-0">
                        <Icon className="h-4 w-4 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                      </div>
                      <p className="text-sm font-medium">{feature.text}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Steps 1-4: Tips */}
            {step > 0 && currentStep.tips && (
              <div className="space-y-2">
                {currentStep.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick action on last step */}
            {step === 4 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Bereit loszulegen?
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Laden Sie Ihren ersten Bescheid hoch und lassen Sie die KI arbeiten!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurueck
          </Button>

          {/* Step dots */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i as OnboardingStep)}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-primary'
                    : i < step
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <Button onClick={next} className="gap-2">
            {step === 4 ? (
              <>
                <Rocket className="h-4 w-4" />
                Los geht&apos;s!
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
