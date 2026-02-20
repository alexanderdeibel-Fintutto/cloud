import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Dumbbell, ArrowRight, User, Target, MapPin, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  FitnessGoal, FitnessLevel, TrainingLocation, Equipment, Gender,
  FITNESS_GOAL_LABELS, FITNESS_GOAL_ICONS, FITNESS_LEVEL_LABELS,
  LOCATION_LABELS, EQUIPMENT_LABELS, GENDER_LABELS,
} from '@/lib/fitness-types'

const ALL_EQUIPMENT: Equipment[] = [
  'barbell', 'dumbbell', 'cable', 'machine', 'kettlebell',
  'resistance_band', 'pull_up_bar', 'bench', 'ez_bar', 'smith_machine', 'trx',
]

export default function FitTuttoProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, saveProfile, loading } = useFitness()
  const [saving, setSaving] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [targetWeightKg, setTargetWeightKg] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>('')
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('')
  const [trainingLocation, setTrainingLocation] = useState<TrainingLocation | ''>('')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [daysPerWeek, setDaysPerWeek] = useState('3')
  const [minutesPerSession, setMinutesPerSession] = useState('45')

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '')
      setGender(profile.gender || '')
      setAge(profile.age?.toString() || '')
      setHeightCm(profile.heightCm?.toString() || '')
      setWeightKg(profile.weightKg?.toString() || '')
      setTargetWeightKg(profile.targetWeightKg?.toString() || '')
      setFitnessGoal(profile.fitnessGoal || '')
      setFitnessLevel(profile.fitnessLevel || '')
      setTrainingLocation(profile.trainingLocation || '')
      setEquipment(profile.availableEquipment || [])
      setDaysPerWeek(profile.trainingDaysPerWeek?.toString() || '3')
      setMinutesPerSession(profile.trainingMinutesPerSession?.toString() || '45')
    }
  }, [profile])

  const toggleEquipment = (eq: Equipment) => {
    setEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    )
  }

  const handleSave = async () => {
    if (!user) {
      toast.error('Bitte melde dich zuerst an.')
      return
    }

    setSaving(true)
    try {
      await saveProfile({
        displayName: displayName || null,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        heightCm: heightCm ? parseInt(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : null,
        fitnessGoal: fitnessGoal || null,
        fitnessLevel: fitnessLevel || null,
        trainingLocation: trainingLocation || null,
        availableEquipment: equipment,
        trainingDaysPerWeek: parseInt(daysPerWeek),
        trainingMinutesPerSession: parseInt(minutesPerSession),
        onboardingCompleted: true,
      })
      toast.success('Profil gespeichert!')
    } catch {
      toast.error('Fehler beim Speichern.')
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Erstelle ein Konto, um dein Fitness-Profil anzulegen.</p>
            <Button variant="fintutto" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Fitness-Profil</h1>
            <p className="text-gray-500">Deine Ziele und Einstellungen - jederzeit aenderbar</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Section 1: Personal Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Persoenliche Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Dein Name" />
              </div>
              <div>
                <Label>Geschlecht</Label>
                <Select value={gender} onValueChange={v => setGender(v as Gender)}>
                  <SelectTrigger><SelectValue placeholder="Waehlen..." /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Alter</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="z.B. 30" />
              </div>
              <div>
                <Label>Groesse (cm)</Label>
                <Input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="z.B. 180" />
              </div>
              <div>
                <Label>Gewicht (kg)</Label>
                <Input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="z.B. 80" />
              </div>
              <div>
                <Label>Zielgewicht (kg)</Label>
                <Input type="number" step="0.1" value={targetWeightKg} onChange={e => setTargetWeightKg(e.target.value)} placeholder="z.B. 75" />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Fitness Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Dein Ziel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.entries(FITNESS_GOAL_LABELS) as [FitnessGoal, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFitnessGoal(key)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      fitnessGoal === key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl block mb-1">{FITNESS_GOAL_ICONS[key]}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <Label>Fitness-Level</Label>
                  <Select value={fitnessLevel} onValueChange={v => setFitnessLevel(v as FitnessLevel)}>
                    <SelectTrigger><SelectValue placeholder="Waehlen..." /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(FITNESS_LEVEL_LABELS) as [FitnessLevel, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Training Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label className="mb-2 block">Trainingsort</Label>
                <div className="flex gap-3">
                  {(Object.entries(LOCATION_LABELS) as [TrainingLocation, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTrainingLocation(key)}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all',
                        trainingLocation === key
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Trainingstage pro Woche</Label>
                  <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}x pro Woche</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dauer pro Einheit</Label>
                  <Select value={minutesPerSession} onValueChange={setMinutesPerSession}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[30, 45, 60, 75, 90].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} Minuten</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Verfuegbares Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALL_EQUIPMENT.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                      equipment.includes(eq)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                    )}
                  >
                    {EQUIPMENT_LABELS[eq]}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Wird gespeichert...' : 'Profil speichern'}
            </Button>
            {profile?.onboardingCompleted && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/fittutto/plan')}
              >
                Zum Trainingsplan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
