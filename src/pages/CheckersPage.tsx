import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, TrendingUp, Receipt, FileText,
  Key, Wrench, AlertTriangle, UserX,
  Building, Paintbrush, ArrowRight, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CheckerItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  popular?: boolean
}

const CHECKERS: CheckerItem[] = [
  {
    id: 'mietpreisbremse',
    name: 'Mietpreisbremse',
    description: 'Pruefen Sie, ob Ihre Miete die gesetzliche Grenze ueberschreitet',
    icon: Home,
    href: '/checker/mietpreisbremse',
    color: 'bg-blue-500',
    popular: true,
  },
  {
    id: 'mieterhoehung',
    name: 'Mieterhoehung',
    description: 'Ist die Mieterhoehung Ihres Vermieters rechtmaessig?',
    icon: TrendingUp,
    href: '/checker/mieterhoehung',
    color: 'bg-green-500',
    popular: true,
  },
  {
    id: 'nebenkosten',
    name: 'Nebenkostenabrechnung',
    description: 'Finden Sie Fehler in Ihrer Nebenkostenabrechnung',
    icon: Receipt,
    href: '/checker/nebenkosten',
    color: 'bg-yellow-500',
    popular: true,
  },
  {
    id: 'betriebskosten',
    name: 'Betriebskosten',
    description: 'Detaillierte Pruefung aller Betriebskostenpositionen',
    icon: FileText,
    href: '/checker/betriebskosten',
    color: 'bg-orange-500',
  },
  {
    id: 'kuendigung',
    name: 'Kuendigung',
    description: 'Ist die Kuendigung Ihres Vermieters wirksam?',
    icon: AlertTriangle,
    href: '/checker/kuendigung',
    color: 'bg-red-500',
    popular: true,
  },
  {
    id: 'kaution',
    name: 'Kaution',
    description: 'Fordern Sie Ihre Kaution zurueck',
    icon: Key,
    href: '/checker/kaution',
    color: 'bg-purple-500',
  },
  {
    id: 'mietminderung',
    name: 'Mietminderung',
    description: 'Berechnen Sie Ihre Mietminderung bei Maengeln',
    icon: Wrench,
    href: '/checker/mietminderung',
    color: 'bg-indigo-500',
  },
  {
    id: 'eigenbedarf',
    name: 'Eigenbedarf',
    description: 'Pruefen Sie die Eigenbedarfskuendigung',
    icon: UserX,
    href: '/checker/eigenbedarf',
    color: 'bg-pink-500',
  },
  {
    id: 'modernisierung',
    name: 'Modernisierung',
    description: 'Sind die Modernisierungskosten rechtmaessig?',
    icon: Building,
    href: '/checker/modernisierung',
    color: 'bg-teal-500',
  },
  {
    id: 'schoenheitsreparaturen',
    name: 'Schoenheitsreparaturen',
    description: 'Muessen Sie bei Auszug renovieren?',
    icon: Paintbrush,
    href: '/checker/schoenheitsreparaturen',
    color: 'bg-cyan-500',
  },
]

export default function CheckersPage() {
  const popularCheckers = CHECKERS.filter(c => c.popular)
  const allCheckers = CHECKERS

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Alle Mieter-Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pruefen Sie Ihre Rechte als Mieter mit unseren kostenlosen Checkern.
            Erhalten Sie sofort eine rechtliche Einschaetzung und passende Handlungsempfehlungen.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-fintutto-light rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-fintutto-primary">10</div>
            <div className="text-sm text-gray-600">Checker verfuegbar</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Kostenlos testen</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">2 Min</div>
            <div className="text-sm text-gray-600">Durchschnittliche Dauer</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">Sofort</div>
            <div className="text-sm text-gray-600">Ergebnis erhalten</div>
          </div>
        </motion.div>

        {/* Popular Checkers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beliebte Checker</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCheckers.map((checker, index) => (
              <motion.div
                key={checker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link to={checker.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-fintutto-primary">
                    <CardHeader className="pb-2">
                      <div className={`w-12 h-12 ${checker.color} rounded-lg flex items-center justify-center mb-3`}>
                        <checker.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{checker.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{checker.description}</CardDescription>
                      <div className="flex items-center text-fintutto-primary font-medium text-sm">
                        Jetzt pruefen <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Checkers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alle Checker</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCheckers.map((checker, index) => (
              <motion.div
                key={checker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <Link to={checker.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${checker.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <checker.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-fintutto-primary transition-colors">
                            {checker.name}
                            {checker.popular && (
                              <span className="ml-2 text-xs bg-fintutto-light text-fintutto-primary px-2 py-0.5 rounded-full">
                                Beliebt
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{checker.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-fintutto-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center bg-gradient-to-r from-fintutto-primary to-blue-600 rounded-2xl p-8 text-white"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Nicht sicher, welcher Checker passt?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Starten Sie einfach mit dem Mietpreisbremse-Checker - er ist der beliebteste und hilft Ihnen,
            schnell zu erkennen, ob Sie zu viel Miete zahlen.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/checker/mietpreisbremse">
              Mietpreisbremse-Checker starten
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
