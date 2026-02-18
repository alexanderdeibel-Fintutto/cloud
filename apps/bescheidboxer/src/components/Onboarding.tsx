import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileSearch,
  Upload,
  Search,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

const STEPS = [
  {
    icon: FileSearch,
    title: 'Willkommen beim Bescheidboxer!',
    description: 'Ihr persoenlicher Assistent fuer Steuerbescheide. In wenigen Schritten zeigen wir Ihnen, wie einfach es geht.',
    color: 'from-fintutto-blue-700 to-fintutto-blue-500',
  },
  {
    icon: Upload,
    title: 'Bescheid hochladen',
    description: 'Laden Sie Ihren Steuerbescheid als PDF hoch oder fotografieren Sie ihn einfach mit Ihrem Handy. Die KI erkennt alle wichtigen Daten automatisch.',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    icon: Search,
    title: 'Automatische Pruefung',
    description: 'Unser System vergleicht den Bescheid mit Ihrer Steuererklaerung und findet Abweichungen - in Sekunden statt Stunden.',
    color: 'from-purple-600 to-pink-500',
  },
  {
    icon: ShieldAlert,
    title: 'Einspruch mit einem Klick',
    description: 'Bei Unstimmigkeiten erstellt die KI automatisch einen Einspruch-Entwurf. Sie muessen ihn nur noch pruefen und absenden.',
    color: 'from-red-600 to-orange-500',
  },
  {
    icon: Clock,
    title: 'Keine Frist verpassen',
    description: 'Der Bescheidboxer erinnert Sie rechtzeitig an alle wichtigen Fristen. So geht Ihnen nie wieder eine Frist verloren.',
    color: 'from-amber-600 to-yellow-500',
  },
]

export default function Onboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const dismissed = localStorage.getItem('bescheidboxer-onboarding-done')
    if (!dismissed) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('bescheidboxer-onboarding-done', 'true')
    setShow(false)
  }

  const finish = () => {
    dismiss()
    navigate('/upload')
  }

  if (!show) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in-0">
      <Card className="max-w-lg w-full overflow-hidden">
        <CardContent className="p-0">
          {/* Hero section */}
          <div className={`bg-gradient-to-br ${current.color} p-8 text-white text-center relative`}>
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              aria-label="Ueberspringen"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Icon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
            <p className="text-white/90 text-base leading-relaxed">{current.description}</p>
          </div>

          {/* Bottom section */}
          <div className="p-6">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === step ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Schritt ${i + 1}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={dismiss}
                className="text-muted-foreground"
              >
                Ueberspringen
              </Button>

              {isLast ? (
                <Button onClick={finish} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Los geht's!
                </Button>
              ) : (
                <Button onClick={() => setStep(step + 1)} className="gap-2">
                  Weiter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
