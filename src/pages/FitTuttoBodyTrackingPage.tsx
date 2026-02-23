import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Scale, Plus, TrendingDown, TrendingUp, Minus,
  Ruler, X, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useFitness } from '@/contexts/FitnessContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BodyMeasurement } from '@/lib/fitness-types'

function generateId() { return crypto.randomUUID() }

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Simple SVG chart component
function MiniChart({ data, height = 120, color = '#f97316' }: { data: { date: string; value: number }[]; height?: number; color?: string }) {
  if (data.length < 2) {
    return <div className="text-center text-gray-400 text-sm py-8">Mindestens 2 Eintraege fuer ein Diagramm</div>
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values) * 0.98
  const max = Math.max(...values) * 1.02
  const range = max - min || 1
  const width = 400
  const padding = 30

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - 2 * padding),
    y: height - padding - ((d.value - min) / range) * (height - 2 * padding),
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = height - padding - pct * (height - 2 * padding)
        const val = min + pct * range
        return (
          <g key={pct}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={padding - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af">
              {val.toFixed(1)}
            </text>
          </g>
        )
      })}
      {/* Area fill */}
      <path d={areaPath} fill={color} fillOpacity="0.1" />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
          {/* Date label for first, mid, last */}
          {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
            <text x={p.x} y={height - 5} textAnchor="middle" fontSize="7" fill="#9ca3af">
              {data[i].date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

const MEASUREMENT_FIELDS = [
  { key: 'weightKg', label: 'Gewicht', unit: 'kg', icon: Scale },
  { key: 'bodyFatPercent', label: 'Koerperfett', unit: '%', icon: TrendingDown },
  { key: 'chestCm', label: 'Brust', unit: 'cm', icon: Ruler },
  { key: 'waistCm', label: 'Taille', unit: 'cm', icon: Ruler },
  { key: 'hipsCm', label: 'Huefte', unit: 'cm', icon: Ruler },
  { key: 'bicepsCm', label: 'Bizeps', unit: 'cm', icon: Ruler },
  { key: 'thighCm', label: 'Oberschenkel', unit: 'cm', icon: Ruler },
  { key: 'calfCm', label: 'Wade', unit: 'cm', icon: Ruler },
] as const

type MeasurementKey = typeof MEASUREMENT_FIELDS[number]['key']

export default function FitTuttoBodyTrackingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { bodyMeasurements, saveBodyMeasurement, loadBodyMeasurements } = useFitness()

  const [showAddForm, setShowAddForm] = useState(false)
  const [activeChart, setActiveChart] = useState<MeasurementKey>('weightKg')
  const [formDate, setFormDate] = useState(toDateStr(new Date()))
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) loadBodyMeasurements()
  }, [user, loadBodyMeasurements])

  // Pre-fill form with latest measurement
  useEffect(() => {
    if (bodyMeasurements.length > 0) {
      const latest = bodyMeasurements[bodyMeasurements.length - 1]
      const vals: Record<string, string> = {}
      MEASUREMENT_FIELDS.forEach(f => {
        const v = latest[f.key]
        if (v !== null && v !== undefined) vals[f.key] = String(v)
      })
      setFormValues(vals)
    }
  }, [bodyMeasurements])

  const handleSave = async () => {
    const m: BodyMeasurement = {
      id: generateId(),
      userId: user?.id || '',
      date: formDate,
      weightKg: formValues.weightKg ? parseFloat(formValues.weightKg) : null,
      bodyFatPercent: formValues.bodyFatPercent ? parseFloat(formValues.bodyFatPercent) : null,
      chestCm: formValues.chestCm ? parseFloat(formValues.chestCm) : null,
      waistCm: formValues.waistCm ? parseFloat(formValues.waistCm) : null,
      hipsCm: formValues.hipsCm ? parseFloat(formValues.hipsCm) : null,
      bicepsCm: formValues.bicepsCm ? parseFloat(formValues.bicepsCm) : null,
      thighCm: formValues.thighCm ? parseFloat(formValues.thighCm) : null,
      calfCm: formValues.calfCm ? parseFloat(formValues.calfCm) : null,
      notes: null,
      createdAt: new Date().toISOString(),
    }
    await saveBodyMeasurement(m)
    toast.success('Messung gespeichert!')
    setShowAddForm(false)
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <Scale className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-4">Melde dich an, um deine Koerperwerte zu tracken.</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/login')}>
              Jetzt anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Build chart data
  const chartData = bodyMeasurements
    .filter(m => m[activeChart] !== null && m[activeChart] !== undefined)
    .map(m => ({ date: m.date, value: Number(m[activeChart]) }))

  // Latest and previous values for comparison
  const latest = bodyMeasurements[bodyMeasurements.length - 1]
  const previous = bodyMeasurements.length >= 2 ? bodyMeasurements[bodyMeasurements.length - 2] : null

  const getDiff = (key: MeasurementKey): { diff: number; trend: 'up' | 'down' | 'same' } | null => {
    if (!latest || !previous) return null
    const cur = latest[key]
    const prev = previous[key]
    if (cur === null || prev === null) return null
    const diff = Number(cur) - Number(prev)
    return { diff, trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' }
  }

  const activeField = MEASUREMENT_FIELDS.find(f => f.key === activeChart)!
  const chartColor = activeChart === 'weightKg' ? '#f97316' : activeChart === 'bodyFatPercent' ? '#ef4444' : '#3b82f6'

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Koerper-Tracking</h1>
              <p className="text-gray-500">{bodyMeasurements.length} Messungen</p>
            </div>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Neue Messung
          </Button>
        </div>

        {/* Current Stats */}
        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {MEASUREMENT_FIELDS.slice(0, 4).map(field => {
              const val = latest[field.key]
              const diff = getDiff(field.key)
              if (val === null) return null
              return (
                <Card key={field.key}>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                    <div className="text-xl font-bold">
                      {Number(val).toFixed(1)}<span className="text-sm text-gray-400 font-normal"> {field.unit}</span>
                    </div>
                    {diff && (
                      <div className={cn('text-xs flex items-center gap-0.5 mt-0.5',
                        diff.trend === 'down' ? 'text-green-600' : diff.trend === 'up' ? 'text-red-500' : 'text-gray-400'
                      )}>
                        {diff.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                         diff.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {diff.diff > 0 ? '+' : ''}{diff.diff.toFixed(1)} {field.unit}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Chart */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Verlauf: {activeField.label}</h3>
            </div>

            {/* Chart selector */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {MEASUREMENT_FIELDS.map(f => {
                const hasData = bodyMeasurements.some(m => m[f.key] !== null)
                if (!hasData && f.key !== 'weightKg') return null
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveChart(f.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                      activeChart === f.key
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                    )}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            <MiniChart data={chartData} color={chartColor} />
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Letzte Messungen</h3>
            {bodyMeasurements.length > 0 ? (
              <div className="space-y-2">
                {[...bodyMeasurements].reverse().slice(0, 10).map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{m.date}</div>
                      <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                        {m.weightKg && <span>{m.weightKg} kg</span>}
                        {m.bodyFatPercent && <span>{m.bodyFatPercent}% KFA</span>}
                        {m.chestCm && <span>Brust {m.chestCm}cm</span>}
                        {m.waistCm && <span>Taille {m.waistCm}cm</span>}
                        {m.bicepsCm && <span>Bizeps {m.bicepsCm}cm</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">Noch keine Messungen. Starte mit deiner ersten!</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Form Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setShowAddForm(false)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Neue Messung</h3>
              <button onClick={() => setShowAddForm(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Datum</Label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>

              {MEASUREMENT_FIELDS.map(field => (
                <div key={field.key}>
                  <Label>{field.label} ({field.unit})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formValues[field.key] || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={`z.B. ${field.key === 'weightKg' ? '80.0' : field.key === 'bodyFatPercent' ? '15.0' : '100.0'}`}
                  />
                </div>
              ))}

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4" onClick={handleSave}>
                Messung speichern
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
