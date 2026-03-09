import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Upload, FileText, Search, ArrowRight, Building2, CalendarClock,
  Inbox, MessageSquare, BarChart3, Zap, CheckCircle, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ONBOARDING_KEY = 'sb-onboarding-complete'

interface OnboardingOverlayProps {
  onComplete: () => void
}

const steps = [
  {
    title: 'Willkommen bei SecondBrain',
    subtitle: 'Deine KI-gestutzte Dokumenten-Zentrale',
    description: 'SecondBrain hilft dir, Dokumente zu scannen, automatisch zu analysieren und intelligent an die richtigen Fintutto-Apps weiterzuleiten.',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Dokumente erfassen',
    subtitle: 'Scannen, OCR & KI-Analyse',
    description: 'Lade Dokumente hoch oder ziehe sie einfach auf das Fenster. Die KI erkennt automatisch Text (OCR), Dokumenttyp, Absender und Beträge.',
    icon: Upload,
    color: 'from-green-500 to-emerald-600',
    features: ['Drag & Drop Upload', 'Automatische OCR-Texterkennung', 'KI-Kategorisierung'],
  },
  {
    title: 'Organisieren & Verwalten',
    subtitle: 'Firmen, Fristen & Sammlungen',
    description: 'Ordne Dokumente Firmen zu, tracke Fristen und erstelle Sammlungen. Alles durchsuchbar mit Volltextsuche.',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
    features: ['Firmenzuordnung', 'Fristen-Tracking mit Erinnerungen', 'Tags & Sammlungen'],
  },
  {
    title: 'Intelligent Weiterleiten',
    subtitle: 'Cross-App Routing',
    description: 'Die KI schlagt vor, wohin dein Dokument gehort — Financial Compass, BescheidBoxer, Fintutto Biz oder Vermietify. Ein Klick genugt.',
    icon: Zap,
    color: 'from-orange-500 to-amber-600',
    features: ['Smart Routing fur 13 Dokumenttypen', 'Ein-Klick Weiterleitung', 'Automatische Regeln konfigurierbar'],
  },
]

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) {
      setShowOnboarding(true)
    }
  }, [])

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  const reset = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setShowOnboarding(true)
  }

  return { showOnboarding, complete, reset }
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleComplete = () => {
    onComplete()
    navigate('/upload')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          Uberspringen <X className="w-3.5 h-3.5" />
        </button>

        <Card className="overflow-hidden border-0 shadow-2xl">
          {/* Header gradient */}
          <div className={`bg-gradient-to-br ${current.color} p-8 text-white text-center`}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <current.icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{current.title}</h2>
            <p className="text-sm text-white/80 mt-1">{current.subtitle}</p>
          </div>

          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>

            {current.features && (
              <div className="space-y-2">
                {current.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'w-6 bg-primary' : i < step ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="text-xs"
              >
                Zuruck
              </Button>

              {isLast ? (
                <Button onClick={handleComplete} className="gap-1.5">
                  Loslegen <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={() => setStep(s => s + 1)} className="gap-1.5">
                  Weiter <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature highlights below card */}
        {step === 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { icon: Inbox, label: 'Eingang' },
              { icon: Search, label: 'Suche' },
              { icon: MessageSquare, label: 'KI-Chat' },
              { icon: BarChart3, label: 'Statistik' },
            ].map(f => (
              <div key={f.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <f.icon className="w-4 h-4 text-white/80" />
                <span className="text-[10px] text-white/60">{f.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
