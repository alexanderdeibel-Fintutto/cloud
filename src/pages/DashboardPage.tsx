import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dumbbell, Flame, TrendingUp, Calendar, ChevronRight,
  Zap, Target, Clock, Trophy, ArrowRight, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface QuickStat {
  label: string
  value: string
  icon: typeof Flame
  color: string
  change?: string
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [todayCalories, setTodayCalories] = useState(0)
  const [targetCalories] = useState(2200)
  const [streak, setStreak] = useState(0)
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0)
  const [weeklyTarget] = useState(4)

  // Load mock data / stored data
  useEffect(() => {
    const stored = localStorage.getItem('fittutto_stats')
    if (stored) {
      const stats = JSON.parse(stored)
      setStreak(stats.streak || 0)
      setWeeklyWorkouts(stats.weeklyWorkouts || 0)
      setTodayCalories(stats.todayCalories || 0)
    } else {
      setStreak(5)
      setWeeklyWorkouts(2)
      setTodayCalories(1450)
    }
  }, [])

  const stats: QuickStat[] = [
    { label: 'Streak', value: `${streak} Tage`, icon: Flame, color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Diese Woche', value: `${weeklyWorkouts}/${weeklyTarget}`, icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Kalorien heute', value: `${todayCalories}`, icon: Zap, color: 'text-green-500 bg-green-500/10' },
    { label: 'Fortschritt', value: '78%', icon: TrendingUp, color: 'text-purple-500 bg-purple-500/10' },
  ]

  const todaysWorkout = {
    name: 'Push Day – Brust & Schultern',
    exercises: 6,
    duration: 45,
    muscleGroups: ['Brust', 'Schultern', 'Trizeps'],
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Hallo{profile?.displayName ? `, ${profile.displayName}` : ''}!
        </h1>
        <p className="text-muted-foreground">Bereit für dein Training heute?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn('p-1.5 rounded-lg', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Workout */}
      <Card className="overflow-hidden">
        <div className="gradient-fitness p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm font-medium opacity-80">Heutiges Training</span>
          </div>
          <h2 className="text-xl font-bold mb-2">{todaysWorkout.name}</h2>
          <div className="flex flex-wrap gap-3 text-sm opacity-90 mb-4">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {todaysWorkout.exercises} Übungen
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{todaysWorkout.duration} min
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {todaysWorkout.muscleGroups.map(mg => (
              <span key={mg} className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {mg}
              </span>
            ))}
          </div>
          <Link to="/workout">
            <Button className="bg-white text-green-700 hover:bg-white/90 font-semibold">
              Training starten
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Wochenfortschritt</CardTitle>
            <Link to="/progress" className="text-sm text-primary hover:underline flex items-center gap-1">
              Details <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Trainings</span>
                <span className="font-medium">{weeklyWorkouts}/{weeklyTarget}</span>
              </div>
              <Progress value={(weeklyWorkouts / weeklyTarget) * 100} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Kalorien heute</span>
                <span className="font-medium">{todayCalories}/{targetCalories} kcal</span>
              </div>
              <Progress value={(todayCalories / targetCalories) * 100} />
            </div>
          </div>

          {/* Week days */}
          <div className="flex justify-between mt-4 pt-4 border-t">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, i) => {
              const isCompleted = i < weeklyWorkouts
              const isToday = i === new Date().getDay() - 1
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                    isCompleted ? 'bg-primary text-white' : isToday ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? <Flame className="h-4 w-4" /> : (i + 1)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/training/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5 pb-4 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Neuer Plan</p>
              <p className="text-xs text-muted-foreground">KI-Trainingsplan erstellen</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/exercises">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-5 pb-4 text-center">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="font-semibold text-sm">Übungen</p>
              <p className="text-xs text-muted-foreground">500+ Übungen durchsuchen</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Heute', name: 'Push Day – Brust', duration: '48 min', volume: '3.240 kg', icon: Dumbbell },
              { date: 'Gestern', name: 'Pull Day – Rücken', duration: '52 min', volume: '4.120 kg', icon: Dumbbell },
              { date: 'Vorgestern', name: 'Leg Day', duration: '55 min', volume: '5.680 kg', icon: Dumbbell },
            ].map(({ date, name, duration, volume, icon: Icon }) => (
              <div key={date} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">{date} &middot; {duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{volume}</p>
                  <p className="text-xs text-muted-foreground">Volumen</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Achievement */}
      {streak >= 3 && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-lg">{streak} Tage Streak!</p>
              <p className="text-sm text-muted-foreground">
                Weiter so! Noch {7 - streak} Tage bis zum nächsten Meilenstein.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
