import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Flame, Dumbbell, Trophy, Calendar, Star,
  Target, Zap, ChevronRight, Award, Crown, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { canViewDetailedStats } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const ACHIEVEMENTS = [
  { id: 'first_workout', name: 'Erster Schritt', desc: 'Erstes Training abgeschlossen', icon: '🎯', unlocked: true },
  { id: 'streak_3', name: '3-Tage-Streak', desc: '3 Tage hintereinander trainiert', icon: '🔥', unlocked: true },
  { id: 'streak_7', name: 'Wochenkrieger', desc: '7-Tage-Streak', icon: '⚡', unlocked: true },
  { id: 'streak_30', name: 'Monatsmeister', desc: '30-Tage-Streak', icon: '👑', unlocked: false },
  { id: 'volume_1000', name: 'Tonnenweise', desc: '1.000 kg Gesamtvolumen', icon: '💪', unlocked: true },
  { id: 'volume_10000', name: 'Stärke-Titan', desc: '10.000 kg Gesamtvolumen', icon: '🏋️', unlocked: false },
  { id: 'workouts_10', name: 'Routine', desc: '10 Trainings abgeschlossen', icon: '📊', unlocked: true },
  { id: 'workouts_50', name: 'Dedication', desc: '50 Trainings abgeschlossen', icon: '🏆', unlocked: false },
  { id: 'workouts_100', name: 'Legende', desc: '100 Trainings abgeschlossen', icon: '⭐', unlocked: false },
  { id: 'nutrition_7', name: 'Ernährungsprofi', desc: '7 Tage Ernährung getrackt', icon: '🥗', unlocked: false },
  { id: 'pr_bench', name: 'Bankdrück-PR', desc: 'Persönlicher Rekord beim Bankdrücken', icon: '🎖️', unlocked: true },
  { id: 'pr_squat', name: 'Kniebeugen-PR', desc: 'Persönlicher Rekord bei Kniebeugen', icon: '🎖️', unlocked: false },
]

export default function ProgressPage() {
  const { subscriptionTier } = useAuth()
  const canViewStats = canViewDetailedStats(subscriptionTier)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

  const stats = useMemo(() => {
    const stored = localStorage.getItem('fittutto_stats')
    const s = stored ? JSON.parse(stored) : {}
    return {
      streak: s.streak || 5,
      longestStreak: s.longestStreak || 14,
      totalWorkouts: s.totalWorkouts || 28,
      totalDuration: s.totalDuration || 1260,
      totalVolume: s.totalVolume || 42500,
      totalCalories: s.totalCalories || 8400,
      weeklyWorkouts: s.weeklyWorkouts || 3,
    }
  }, [])

  const history = useMemo(() => {
    const stored = localStorage.getItem('fittutto_history')
    return stored ? JSON.parse(stored) : []
  }, [])

  // Weekly data for chart
  const weekData = [
    { day: 'Mo', workouts: 1, volume: 2400 },
    { day: 'Di', workouts: 0, volume: 0 },
    { day: 'Mi', workouts: 1, volume: 3100 },
    { day: 'Do', workouts: 1, volume: 2800 },
    { day: 'Fr', workouts: 0, volume: 0 },
    { day: 'Sa', workouts: 1, volume: 3500 },
    { day: 'So', workouts: 0, volume: 0 },
  ]

  const maxVolume = Math.max(...weekData.map(d => d.volume), 1)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fortschritt</h1>
        <p className="text-muted-foreground">Deine Entwicklung im Überblick</p>
      </div>

      {/* Streak */}
      <Card className="overflow-hidden">
        <div className="gradient-fitness p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Aktuelle Streak</p>
              <p className="text-4xl font-extrabold">{stats.streak} Tage</p>
              <p className="text-sm opacity-70 mt-1">Längste: {stats.longestStreak} Tage</p>
            </div>
            <div className="text-6xl">🔥</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Trainings', value: stats.totalWorkouts, icon: Dumbbell, color: 'text-primary bg-primary/10' },
          { label: 'Minuten', value: stats.totalDuration, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Volumen (kg)', value: stats.totalVolume.toLocaleString('de-DE'), icon: TrendingUp, color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Kalorien', value: stats.totalCalories.toLocaleString('de-DE'), icon: Flame, color: 'text-red-500 bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className={cn('inline-flex p-1.5 rounded-lg mb-2', color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Volume Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Wochenübersicht</CardTitle>
            <Tabs value={period} onValueChange={v => setPeriod(v as typeof period)}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs px-2 h-6">Woche</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-2 h-6">Monat</TabsTrigger>
                <TabsTrigger value="year" className="text-xs px-2 h-6">Jahr</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {canViewStats ? (
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map(({ day, volume, workouts }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className={cn(
                        'w-full max-w-8 rounded-t-md transition-all',
                        volume > 0 ? 'bg-primary' : 'bg-muted'
                      )}
                      style={{ height: `${Math.max((volume / maxVolume) * 100, volume > 0 ? 8 : 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Detaillierte Statistiken ab Basic-Abo</p>
                <Link to="/pricing">
                  <Button variant="link" size="sm" className="mt-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Erfolge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map(({ id, name, desc, icon, unlocked }) => (
              <div
                key={id}
                className={cn(
                  'text-center p-3 rounded-xl transition-colors',
                  unlocked ? 'bg-amber-500/5' : 'bg-muted/50 opacity-50'
                )}
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-[10px] font-semibold mt-1 leading-tight">{name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} freigeschaltet
          </p>
        </CardContent>
      </Card>

      {/* Personal Records */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Persönliche Rekorde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { exercise: 'Bankdrücken', weight: '85 kg', reps: '1 RM', date: 'Vor 3 Tagen' },
              { exercise: 'Kniebeugen', weight: '120 kg', reps: '1 RM', date: 'Vor 1 Woche' },
              { exercise: 'Kreuzheben', weight: '140 kg', reps: '1 RM', date: 'Vor 2 Wochen' },
              { exercise: 'Klimmzüge', weight: '+20 kg', reps: '8 Wdh.', date: 'Vor 5 Tagen' },
            ].map(({ exercise, weight, reps, date }) => (
              <div key={exercise} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{exercise}</p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{weight}</p>
                  <p className="text-[10px] text-muted-foreground">{reps}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workout History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trainingshistorie</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.slice(0, 5).map((w: { id: string; name: string; date: string; duration: number; volume: number; rating: number }) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.date).toLocaleDateString('de-DE')} &middot; {w.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{w.volume?.toLocaleString('de-DE')} kg</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-2.5 w-2.5', i < w.rating ? 'text-amber-400 fill-amber-400' : 'text-muted')} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Trainings abgeschlossen. Starte dein erstes Training!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
