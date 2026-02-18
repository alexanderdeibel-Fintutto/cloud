import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Dumbbell, TrendingUp, Heart, Zap, Activity,
  User, Ruler, Weight, Calendar, MapPin, ChevronRight, ChevronLeft, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type {
  FitnessGoal, FitnessLevel, Gender, TrainingLocation, Equipment
} from '@/lib/types'

interface OnboardingData {
  goal: FitnessGoal | null
  level: FitnessLevel | null
  gender: Gender | null
  age: number
  heightCm: number
  weightKg: number
  targetWeightKg: number
  location: TrainingLocation | null
  equipment: Equipment[]
  daysPerWeek: number
  minutesPerSession: number
}

const GOALS: { id: FitnessGoal; icon: typeof Target; label: string; desc: string }[] = [
  { id: 'lose_weight', icon: TrendingUp, label: 'Abnehmen', desc: 'Fett verlieren und definierter werden' },
  { id: 'build_muscle', icon: Dumbbell, label: 'Muskelaufbau', desc: 'Muskelmasse aufbauen und stärker werden' },
  { id: 'stay_fit', icon: Activity, label: 'Fit bleiben', desc: 'Allgemeine Fitness und Gesundheit' },
  { id: 'improve_endurance', icon: Zap, label: 'Ausdauer', desc: 'Kondition und Durchhaltevermögen steigern' },
  { id: 'increase_flexibility', icon: Heart, label: 'Beweglichkeit', desc: 'Flexibilität und Mobilität verbessern' },
  { id: 'gain_strength', icon: Target, label: 'Maximalkraft', desc: 'Maximale Kraft in Grundübungen steigern' },
]

const LEVELS: { id: FitnessLevel; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Anfänger', desc: 'Wenig bis keine Trainingserfahrung' },
  { id: 'intermediate', label: 'Fortgeschritten', desc: '6-24 Monate Trainingserfahrung' },
  { id: 'advanced', label: 'Erfahren', desc: '2+ Jahre regelmäßiges Training' },
  { id: 'professional', label: 'Profi', desc: '5+ Jahre, wettkampforientiert' },
]

const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: 'none', label: 'Kein Equipment' },
  { id: 'dumbbells', label: 'Kurzhanteln' },
  { id: 'barbell', label: 'Langhantel' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'resistance_band', label: 'Widerstandsband' },
  { id: 'pull_up_bar', label: 'Klimmzugstange' },
  { id: 'bench', label: 'Hantelbank' },
  { id: 'cable_machine', label: 'Kabelzug' },
  { id: 'mat', label: 'Gymnastikmatte' },
  { id: 'foam_roller', label: 'Faszienrolle' },
]

const STEPS = ['Ziel', 'Level', 'Körperdaten', 'Ort & Equipment', 'Zeitplan']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    level: null,
    gender: null,
    age: 30,
    heightCm: 175,
    weightKg: 75,
    targetWeightKg: 70,
    location: null,
    equipment: [],
    daysPerWeek: 3,
    minutesPerSession: 45,
  })

  const progress = ((step + 1) / STEPS.length) * 100

  const canProceed = () => {
    switch (step) {
      case 0: return data.goal !== null
      case 1: return data.level !== null
      case 2: return data.gender !== null && data.age > 0 && data.heightCm > 0 && data.weightKg > 0
      case 3: return data.location !== null
      case 4: return data.daysPerWeek >= 2 && data.minutesPerSession >= 15
      default: return true
    }
  }

  const handleFinish = () => {
    // Store onboarding data in localStorage for now (will sync with Supabase when logged in)
    localStorage.setItem('fittutto_onboarding', JSON.stringify(data))
    navigate('/training/new')
  }

  const toggleEquipment = (eq: Equipment) => {
    setData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter(e => e !== eq)
        : [...prev.equipment, eq],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Schritt {step + 1} von {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{STEPS[step]}</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Goal */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Was ist dein Ziel?</h1>
                  <p className="text-muted-foreground">Wähle dein Hauptziel – wir passen deinen Plan darauf an.</p>
                </div>
                <div className="grid gap-3">
                  {GOALS.map(({ id, icon: Icon, label, desc }) => (
                    <Card
                      key={id}
                      className={cn(
                        'cursor-pointer transition-all',
                        data.goal === id ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'hover:border-primary/30'
                      )}
                      onClick={() => setData(prev => ({ ...prev, goal: id }))}
                    >
                      <CardContent className="flex items-center gap-4 py-4 px-5">
                        <div className={cn(
                          'p-2.5 rounded-xl',
                          data.goal === id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        {data.goal === id && <Check className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Level */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Dein Fitness-Level</h1>
                  <p className="text-muted-foreground">Wie erfahren bist du im Training?</p>
                </div>
                <div className="grid gap-3">
                  {LEVELS.map(({ id, label, desc }) => (
                    <Card
                      key={id}
                      className={cn(
                        'cursor-pointer transition-all',
                        data.level === id ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'hover:border-primary/30'
                      )}
                      onClick={() => setData(prev => ({ ...prev, level: id }))}
                    >
                      <CardContent className="flex items-center gap-4 py-4 px-5">
                        <div className="flex-1">
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-muted-foreground">{desc}</p>
                        </div>
                        {data.level === id && <Check className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Body metrics */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Körperdaten</h1>
                  <p className="text-muted-foreground">Für deinen personalisierten Trainings- und Ernährungsplan.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Geschlecht</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([['male', 'Männlich'], ['female', 'Weiblich'], ['diverse', 'Divers']] as const).map(([id, label]) => (
                        <Button
                          key={id}
                          variant={data.gender === id ? 'default' : 'outline'}
                          onClick={() => setData(prev => ({ ...prev, gender: id }))}
                          className="w-full"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Alter</Label>
                      <Input
                        id="age"
                        type="number"
                        value={data.age}
                        onChange={e => setData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        min={14}
                        max={99}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Größe (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={data.heightCm}
                        onChange={e => setData(prev => ({ ...prev, heightCm: parseInt(e.target.value) || 0 }))}
                        min={100}
                        max={250}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Gewicht (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={data.weightKg}
                        onChange={e => setData(prev => ({ ...prev, weightKg: parseInt(e.target.value) || 0 }))}
                        min={30}
                        max={300}
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetWeight">Zielgewicht (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        value={data.targetWeightKg}
                        onChange={e => setData(prev => ({ ...prev, targetWeightKg: parseInt(e.target.value) || 0 }))}
                        min={30}
                        max={300}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Equipment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Wo trainierst du?</h1>
                  <p className="text-muted-foreground">Wir passen die Übungen an deinen Trainingsort an.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {([
                    ['gym', 'Fitnessstudio', Dumbbell],
                    ['home', 'Zuhause', User],
                    ['outdoor', 'Draußen', MapPin],
                  ] as const).map(([id, label, Icon]) => (
                    <Card
                      key={id}
                      className={cn(
                        'cursor-pointer transition-all text-center',
                        data.location === id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30'
                      )}
                      onClick={() => setData(prev => ({ ...prev, location: id }))}
                    >
                      <CardContent className="pt-6 pb-4">
                        <Icon className={cn('h-8 w-8 mx-auto mb-2', data.location === id ? 'text-primary' : 'text-muted-foreground')} />
                        <p className="text-sm font-medium">{label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {data.location && (
                  <div>
                    <Label className="mb-3 block">Verfügbares Equipment</Label>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_OPTIONS.map(({ id, label }) => (
                        <Button
                          key={id}
                          variant={data.equipment.includes(id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleEquipment(id)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Dein Zeitplan</h1>
                  <p className="text-muted-foreground">Wie oft und wie lange möchtest du trainieren?</p>
                </div>

                <div>
                  <Label className="mb-3 block">Trainingstage pro Woche</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 6].map(d => (
                      <Button
                        key={d}
                        variant={data.daysPerWeek === d ? 'default' : 'outline'}
                        onClick={() => setData(prev => ({ ...prev, daysPerWeek: d }))}
                        className="text-lg font-bold"
                      >
                        {d}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Dauer pro Training</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 45, 60, 90].map(m => (
                      <Button
                        key={m}
                        variant={data.minutesPerSession === m ? 'default' : 'outline'}
                        onClick={() => setData(prev => ({ ...prev, minutesPerSession: m }))}
                      >
                        {m} min
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Dein Plan wird erstellt mit:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Ziel: <span className="text-foreground font-medium">{GOALS.find(g => g.id === data.goal)?.label}</span></li>
                      <li>Level: <span className="text-foreground font-medium">{LEVELS.find(l => l.id === data.level)?.label}</span></li>
                      <li>Ort: <span className="text-foreground font-medium">{data.location === 'gym' ? 'Fitnessstudio' : data.location === 'home' ? 'Zuhause' : 'Draußen'}</span></li>
                      <li>Zeitplan: <span className="text-foreground font-medium">{data.daysPerWeek}x {data.minutesPerSession} min/Woche</span></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Zurück
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Weiter
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="fitness"
              onClick={handleFinish}
              disabled={!canProceed()}
            >
              Plan erstellen
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
