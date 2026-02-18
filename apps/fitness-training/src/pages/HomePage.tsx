import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Dumbbell, Zap, Apple, TrendingUp, Target, Users,
  ChevronRight, Star, Shield, Flame, Heart, Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

const features = [
  {
    icon: Brain,
    title: 'KI-Trainingsplan',
    description: 'Individueller Plan basierend auf deinen Zielen, deinem Level und deiner Ausrüstung.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Dumbbell,
    title: '500+ Übungen',
    description: 'Kraft, Cardio, Mobility – mit detaillierten Anleitungen und Animationen.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Apple,
    title: 'Ernährungstracking',
    description: 'Kalorien, Makros und Mahlzeiten tracken. Personalisierte Kalorienberechnung.',
    gradient: 'from-green-400 to-lime-500',
  },
  {
    icon: TrendingUp,
    title: 'Fortschritt & Streaks',
    description: 'Statistiken, persönliche Rekorde und motivierende Streaks für dranbleiben.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Mobility & Stretching',
    description: '300+ Mobility-Übungen für Verletzungsprävention und bessere Beweglichkeit.',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: Users,
    title: 'Fintutto-Ökosystem',
    description: 'Nahtlos verbunden mit allen Fintutto-Apps. Ein Login, alles drin.',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const pillars = [
  { icon: Dumbbell, label: 'Kraft', count: '200+', color: 'text-red-500 bg-red-500/10' },
  { icon: Zap, label: 'Cardio', count: '50+', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Apple, label: 'Ernährung', count: '2.3M+', color: 'text-green-500 bg-green-500/10' },
  { icon: Heart, label: 'Mobility', count: '300+', color: 'text-purple-500 bg-purple-500/10' },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-fitness text-white">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>Neu im Fintutto-Universum</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Dein KI-
              <span className="text-green-300">Personal Trainer</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Individuelle Trainingspläne, 500+ Übungen, Ernährungstracking und
              intelligente Fortschrittsanalyse – alles in einer App.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="xl" className="bg-white text-green-700 hover:bg-white/90 font-bold">
                    Zum Dashboard
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/onboarding">
                    <Button size="xl" className="bg-white text-green-700 hover:bg-white/90 font-bold">
                      Kostenlos starten
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Anmelden
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {pillars.map(({ icon: Icon, label, count, color }) => (
            <Card key={label} className="text-center">
              <CardContent className="pt-6 pb-4">
                <div className={`inline-flex p-3 rounded-xl ${color} mb-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Alles für dein Training</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Von Sportwissenschaftlern entwickelt. Für Anfänger bis Profis. Zuhause oder im Gym.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, gradient }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Faire Preise</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Starte kostenlos und upgrade wenn du bereit bist. Keine versteckten Kosten.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Kostenlos', price: '0', desc: 'Trainingsplan erstellen' },
              { name: 'Speichern', price: '2,99', desc: 'Pläne speichern & laden' },
              { name: 'Basic', price: '4,99', desc: 'Ernährung + Statistiken', highlight: true },
              { name: 'Premium', price: '9,99', desc: 'Alle Features' },
            ].map(({ name, price, desc, highlight }) => (
              <Card key={name} className={highlight ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}>
                <CardContent className="pt-6">
                  {highlight && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                      <Star className="h-3 w-3" /> Beliebt
                    </span>
                  )}
                  <p className="font-semibold">{name}</p>
                  <p className="text-3xl font-bold my-2">{price}<span className="text-sm font-normal text-muted-foreground"> €/Monat</span></p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link to="/pricing" className="inline-block mt-8">
            <Button variant="outline" size="lg">
              Alle Pläne vergleichen
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Fintutto Ecosystem */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Shield className="h-4 w-4" />
          Teil des Fintutto-Ökosystems
        </div>
        <h2 className="text-3xl font-bold mb-3">Ein Konto. Alle Apps.</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          FitTutto ist Teil des Fintutto-Universums. Melde dich einmal an und nutze alle Apps
          mit einem Konto – Vermietify, Fintutto Portal, BescheidBoxer und mehr.
        </p>
        <Link to="/onboarding">
          <Button variant="fitness" size="xl">
            Jetzt kostenlos starten
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span>FitTutto – Ein Fintutto-Produkt</span>
          </div>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-foreground">Preise</Link>
            <a href="https://portal.fintutto.cloud" className="hover:text-foreground">Fintutto Portal</a>
            <Link to="/auth" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
