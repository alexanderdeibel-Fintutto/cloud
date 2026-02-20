import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  TrendingUp,
  Receipt,
  FileWarning,
  Key,
  Wrench,
  AlertTriangle,
  Paintbrush,
  Building,
  Banknote,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
} from 'lucide-react'
import { useDocumentTitle } from '@fintutto/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOtherApps } from '@fintutto/shared'

const ecosystemApps = getOtherApps('mieter-checker')

const checkers = [
  {
    id: 'mietpreisbremse',
    title: 'Mietpreisbremse',
    description: 'Pruefen Sie, ob Ihre Miete zu hoch ist und Sie Geld zurueckfordern koennen.',
    icon: Home,
    color: 'bg-blue-500',
    popular: true,
  },
  {
    id: 'mieterhoehung',
    title: 'Mieterhoehung',
    description: 'Ist die Mieterhoehung Ihres Vermieters rechtmaessig? Wir pruefen das fuer Sie.',
    icon: TrendingUp,
    color: 'bg-orange-500',
    popular: true,
  },
  {
    id: 'nebenkosten',
    title: 'Nebenkosten',
    description: 'Stimmt Ihre Nebenkostenabrechnung? Finden Sie versteckte Fehler.',
    icon: Receipt,
    color: 'bg-green-500',
    popular: true,
  },
  {
    id: 'betriebskosten',
    title: 'Betriebskosten',
    description: 'Detaillierte Pruefung aller Betriebskostenpositionen.',
    icon: Banknote,
    color: 'bg-emerald-500',
  },
  {
    id: 'kuendigung',
    title: 'Kuendigung',
    description: 'Wurde Ihnen gekuendigt? Pruefen Sie die Rechtmaessigkeit.',
    icon: FileWarning,
    color: 'bg-red-500',
    popular: true,
  },
  {
    id: 'kaution',
    title: 'Kaution',
    description: 'Kaution nicht zurueckerhalten? Pruefen Sie Ihre Ansprueche.',
    icon: Key,
    color: 'bg-purple-500',
  },
  {
    id: 'mietminderung',
    title: 'Mietminderung',
    description: 'Maengel in der Wohnung? Berechnen Sie Ihre Minderungsquote.',
    icon: Wrench,
    color: 'bg-amber-500',
  },
  {
    id: 'eigenbedarf',
    title: 'Eigenbedarf',
    description: 'Eigenbedarfskuendigung erhalten? Wir pruefen die Wirksamkeit.',
    icon: AlertTriangle,
    color: 'bg-rose-500',
  },
  {
    id: 'modernisierung',
    title: 'Modernisierung',
    description: 'Modernisierungsumlage zu hoch? Pruefen Sie die Berechnung.',
    icon: Building,
    color: 'bg-cyan-500',
  },
  {
    id: 'schoenheitsreparaturen',
    title: 'Schoenheitsreparaturen',
    description: 'Muessen Sie wirklich renovieren? Pruefen Sie die Klauseln.',
    icon: Paintbrush,
    color: 'bg-pink-500',
  },
]

const features = [
  {
    icon: Zap,
    title: 'Sofortige Analyse',
    description: 'Erhalten Sie innerhalb von Minuten eine fundierte Einschaetzung.',
  },
  {
    icon: Shield,
    title: 'KI-unterstuetzt',
    description: 'Unsere KI beraet Sie bei jedem Eingabefeld.',
  },
  {
    icon: CheckCircle,
    title: 'Kostenlos starten',
    description: 'Der erste Check ist immer kostenlos.',
  },
]

export default function HomePage() {
  useDocumentTitle('Mietrechts-Checker', 'Fintutto')
  const popularCheckers = checkers.filter((c) => c.popular)
  const otherCheckers = checkers.filter((c) => !c.popular)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-fintutto-primary via-fintutto-secondary to-fintutto-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Pruefen Sie Ihre Mietrechte mit KI-Unterstuetzung
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Kostenlose Checks fuer Mieter. Sofortige Ergebnisse. Direkte Weiterleitung zu den
              passenden Formularen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="bg-white text-fintutto-primary hover:bg-blue-50" asChild>
                <Link to="/checker/mietpreisbremse">
                  Ersten Check starten
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <a href="#alle-checker">Alle Checker ansehen</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-fintutto-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-fintutto-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Checkers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Beliebte Checker</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diese Checks werden am haeufigsten genutzt. Starten Sie mit einem Klick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCheckers.map((checker, index) => (
              <motion.div
                key={checker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/checker/${checker.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-fintutto-primary/50 cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 ${checker.color} rounded-lg flex items-center justify-center mb-2`}
                      >
                        <checker.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="group-hover:text-fintutto-primary transition-colors">
                        {checker.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{checker.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Checkers */}
      <section id="alle-checker" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Alle Checker</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Waehlen Sie den passenden Check fuer Ihre Situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCheckers.map((checker, index) => (
              <motion.div
                key={checker.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link to={`/checker/${checker.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:border-fintutto-primary/50 cursor-pointer group">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div
                        className={`w-10 h-10 ${checker.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <checker.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-fintutto-primary transition-colors">
                          {checker.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {checker.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Teaser */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Das Fintutto Oekosystem
            </h2>
            <p className="text-gray-600">
              Noch mehr Tools fuer Mieter und Vermieter – alle verbunden.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {ecosystemApps.map((app) => (
              <a
                key={app.key}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-xl border bg-white hover:shadow-lg hover:border-fintutto-primary/30 transition-all"
              >
                <span className="text-3xl mb-2">{app.icon}</span>
                <span className="font-semibold text-sm text-gray-900">{app.name}</span>
                <span className="text-xs text-gray-500 text-center">{app.description}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-fintutto-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bereit, Ihre Mietrechte zu pruefen?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Starten Sie jetzt kostenlos und erhalten Sie sofort eine fundierte Einschaetzung.
          </p>
          <Button size="xl" className="bg-white text-fintutto-primary hover:bg-blue-50" asChild>
            <Link to="/checker/mietpreisbremse">
              Jetzt kostenlos pruefen
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
