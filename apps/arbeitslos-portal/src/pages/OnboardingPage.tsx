import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Users,
  Baby,
  Briefcase,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Swords,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingData {
  plz: string
  stadt: string
  bgGroesse: number
  kinder: { alter: number }[]
  hatKinder: boolean
  erwerbstaetig: boolean
  einkommenArt: string
  einkommen: number
  problem: string[]
}

const PROBLEM_OPTIONS = [
  { id: 'bescheid_falsch', label: 'Mein Bescheid stimmt nicht', icon: '📋' },
  { id: 'sanktion', label: 'Ich wurde sanktioniert', icon: '⚠️' },
  { id: 'miete_kdu', label: 'Meine Miete wird nicht voll gezahlt', icon: '🏠' },
  { id: 'rueckforderung', label: 'Ich soll Geld zurueckzahlen', icon: '💸' },
  { id: 'verstehe_nicht', label: 'Ich verstehe meinen Bescheid nicht', icon: '❓' },
  { id: 'widerspruch', label: 'Ich brauche einen Widerspruch', icon: '✊' },
  { id: 'mehrbedarf', label: 'Mir steht mehr zu', icon: '💰' },
  { id: 'neu_im_system', label: 'Ich bin neu im System', icon: '🆕' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    plz: '',
    stadt: '',
    bgGroesse: 1,
    kinder: [],
    hatKinder: false,
    erwerbstaetig: false,
    einkommenArt: '',
    einkommen: 0,
    problem: [],
  })

  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleComplete = () => {
    // Save profile to localStorage (in production: save to Supabase)
    localStorage.setItem('boxer_profile', JSON.stringify(data))
    localStorage.setItem('boxer_onboarded', 'true')
    // Navigate based on primary problem
    if (data.problem.includes('bescheid_falsch') || data.problem.includes('verstehe_nicht')) {
      navigate('/scan')
    } else if (data.problem.includes('widerspruch')) {
      navigate('/musterschreiben')
    } else {
      navigate('/chat')
    }
  }

  const toggleProblem = (id: string) => {
    setData(prev => ({
      ...prev,
      problem: prev.problem.includes(id)
        ? prev.problem.filter(p => p !== id)
        : [...prev.problem, id],
    }))
  }

  const addChild = () => {
    setData(prev => ({ ...prev, kinder: [...prev.kinder, { alter: 0 }] }))
  }

  const updateChildAge = (index: number, alter: number) => {
    setData(prev => ({
      ...prev,
      kinder: prev.kinder.map((k, i) => i === index ? { alter } : k),
    }))
  }

  const removeChild = (index: number) => {
    setData(prev => ({
      ...prev,
      kinder: prev.kinder.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="container max-w-2xl pt-8">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="h-6 w-6 text-primary" />
          <span className="font-bold gradient-text-boxer">BescheidBoxer</span>
          <span className="ml-auto text-sm text-muted-foreground">Schritt {step + 1} von {totalSteps}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-boxer rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container max-w-2xl py-8 flex flex-col">
        {/* Step 0: PLZ / Stadt */}
        {step === 0 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Wo wohnst du?</h2>
                <p className="text-muted-foreground">Damit wir die richtigen KdU-Grenzen fuer deine Stadt kennen.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Postleitzahl</label>
                <input
                  type="text"
                  maxLength={5}
                  value={data.plz}
                  onChange={(e) => setData(prev => ({ ...prev, plz: e.target.value.replace(/\D/g, '') }))}
                  placeholder="z.B. 10115"
                  className="chat-input text-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stadt / Gemeinde</label>
                <input
                  type="text"
                  value={data.stadt}
                  onChange={(e) => setData(prev => ({ ...prev, stadt: e.target.value }))}
                  placeholder="z.B. Berlin"
                  className="chat-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Bedarfsgemeinschaft */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Deine Bedarfsgemeinschaft</h2>
                <p className="text-muted-foreground">Wie viele Personen leben in deinem Haushalt?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setData(prev => ({ ...prev, bgGroesse: n }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    data.bgGroesse === n
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="text-2xl font-bold">{n}{n === 5 ? '+' : ''}</div>
                  <div className="text-xs text-muted-foreground">
                    {n === 1 ? 'Person' : 'Personen'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Kinder */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Baby className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hast du Kinder?</h2>
                <p className="text-muted-foreground">Wichtig fuer Mehrbedarf und Kindersofortzuschlag.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setData(prev => ({ ...prev, hatKinder: true }))}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                    data.hatKinder ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  Ja
                </button>
                <button
                  onClick={() => setData(prev => ({ ...prev, hatKinder: false, kinder: [] }))}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                    !data.hatKinder ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  Nein
                </button>
              </div>
              {data.hatKinder && (
                <div className="space-y-3">
                  {data.kinder.map((kind, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">Kind {i + 1}:</span>
                      <input
                        type="number"
                        min={0}
                        max={25}
                        value={kind.alter}
                        onChange={(e) => updateChildAge(i, parseInt(e.target.value) || 0)}
                        className="chat-input w-24"
                        placeholder="Alter"
                      />
                      <span className="text-sm text-muted-foreground">Jahre</span>
                      <button onClick={() => removeChild(i)} className="text-destructive text-sm hover:underline">
                        Entfernen
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addChild}>
                    + Kind hinzufuegen
                  </Button>
                  {data.kinder.length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-3">
                        <p className="text-sm text-primary flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {data.kinder.length === 1 && data.kinder[0].alter < 7
                            ? 'Als Alleinerziehende/r steht dir Mehrbedarf von 36% zu!'
                            : `Kindersofortzuschlag: ${data.kinder.length * 25} EUR/Monat moeglich`}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Erwerbstaetigkeit */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Arbeitest du nebenher?</h2>
                <p className="text-muted-foreground">Wichtig fuer die korrekte Einkommensanrechnung.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'nein', label: 'Nein' },
                  { id: 'minijob', label: 'Minijob (bis 538 EUR)' },
                  { id: 'teilzeit', label: 'Teilzeit' },
                  { id: 'selbstaendig', label: 'Selbstaendig' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setData(prev => ({
                      ...prev,
                      erwerbstaetig: option.id !== 'nein',
                      einkommenArt: option.id,
                    }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.einkommenArt === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
              {data.erwerbstaetig && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Monatliches Bruttoeinkommen</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={data.einkommen || ''}
                      onChange={(e) => setData(prev => ({ ...prev, einkommen: parseInt(e.target.value) || 0 }))}
                      placeholder="z.B. 450"
                      className="chat-input w-40"
                    />
                    <span className="text-muted-foreground">EUR / Monat</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Problem */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Was beschaeftigt dich gerade?</h2>
                <p className="text-muted-foreground">Waehle alles was zutrifft (Mehrfachauswahl).</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROBLEM_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleProblem(option.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    data.problem.includes(option.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                  {data.problem.includes(option.id) && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurueck
          </Button>
          <Button variant="amt" onClick={handleNext}>
            {step === totalSteps - 1 ? (
              <>
                Los geht's!
                <Swords className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
