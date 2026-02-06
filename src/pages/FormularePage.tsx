import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Home, TrendingUp, Receipt,
  Key, Wrench, AlertTriangle, UserX,
  Building, Paintbrush, ArrowRight, Download,
  FileSignature, Mail, Scale
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FormularItem {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  category: 'miete' | 'kuendigung' | 'maengel' | 'auszug' | 'sonstige'
  popular?: boolean
  checkerLink?: string
}

const FORMULARE: FormularItem[] = [
  // Miete & Kosten
  {
    id: 'mietpreisbremse-ruege',
    name: 'Mietpreisbremse-Ruege',
    description: 'Ruegen Sie die ueberhöhte Miete und fordern Sie Geld zurueck',
    icon: Home,
    color: 'bg-blue-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/mietpreisbremse',
  },
  {
    id: 'mieterhoehung-widerspruch',
    name: 'Mieterhoehung-Widerspruch',
    description: 'Widersprechen Sie einer unzulaessigen Mieterhoehung',
    icon: TrendingUp,
    color: 'bg-green-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/mieterhoehung',
  },
  {
    id: 'nebenkostenabrechnung-widerspruch',
    name: 'Nebenkosten-Widerspruch',
    description: 'Widersprechen Sie fehlerhaften Nebenkostenabrechnungen',
    icon: Receipt,
    color: 'bg-yellow-500',
    category: 'miete',
    popular: true,
    checkerLink: '/checker/nebenkosten',
  },
  {
    id: 'betriebskosten-pruefung',
    name: 'Betriebskosten-Pruefung',
    description: 'Anfrage zur Belegeinsicht bei Betriebskosten',
    icon: FileText,
    color: 'bg-orange-500',
    category: 'miete',
    checkerLink: '/checker/betriebskosten',
  },

  // Kuendigung
  {
    id: 'kuendigung-widerspruch',
    name: 'Kuendigungs-Widerspruch',
    description: 'Widersprechen Sie der Kuendigung durch den Vermieter',
    icon: AlertTriangle,
    color: 'bg-red-500',
    category: 'kuendigung',
    popular: true,
    checkerLink: '/checker/kuendigung',
  },
  {
    id: 'eigenbedarf-widerspruch',
    name: 'Eigenbedarf-Widerspruch',
    description: 'Widersprechen Sie einer Eigenbedarfskuendigung',
    icon: UserX,
    color: 'bg-pink-500',
    category: 'kuendigung',
    checkerLink: '/checker/eigenbedarf',
  },
  {
    id: 'haertefall-einwand',
    name: 'Haertefall-Einwand',
    description: 'Machen Sie soziale Haerte gegen Kuendigung geltend',
    icon: Scale,
    color: 'bg-rose-500',
    category: 'kuendigung',
  },

  // Maengel
  {
    id: 'mietminderung-anzeige',
    name: 'Mietminderung-Anzeige',
    description: 'Zeigen Sie Maengel an und mindern Sie die Miete',
    icon: Wrench,
    color: 'bg-indigo-500',
    category: 'maengel',
    popular: true,
    checkerLink: '/checker/mietminderung',
  },
  {
    id: 'maengelanzeige',
    name: 'Maengelanzeige',
    description: 'Melden Sie Maengel an Ihren Vermieter',
    icon: AlertTriangle,
    color: 'bg-amber-500',
    category: 'maengel',
  },
  {
    id: 'instandsetzung-aufforderung',
    name: 'Instandsetzungs-Aufforderung',
    description: 'Fordern Sie den Vermieter zur Reparatur auf',
    icon: Wrench,
    color: 'bg-violet-500',
    category: 'maengel',
  },
  {
    id: 'modernisierung-widerspruch',
    name: 'Modernisierung-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Modernisierungskosten',
    icon: Building,
    color: 'bg-teal-500',
    category: 'maengel',
    checkerLink: '/checker/modernisierung',
  },

  // Auszug
  {
    id: 'kaution-rueckforderung',
    name: 'Kaution-Rueckforderung',
    description: 'Fordern Sie Ihre Kaution zurueck',
    icon: Key,
    color: 'bg-purple-500',
    category: 'auszug',
    popular: true,
    checkerLink: '/checker/kaution',
  },
  {
    id: 'schoenheitsreparaturen-widerspruch',
    name: 'Schoenheitsreparaturen-Widerspruch',
    description: 'Widersprechen Sie unzulaessigen Renovierungsforderungen',
    icon: Paintbrush,
    color: 'bg-cyan-500',
    category: 'auszug',
    checkerLink: '/checker/schoenheitsreparaturen',
  },
  {
    id: 'uebergabeprotokoll',
    name: 'Uebergabeprotokoll',
    description: 'Dokumentieren Sie den Zustand der Wohnung',
    icon: FileSignature,
    color: 'bg-slate-500',
    category: 'auszug',
  },

  // Sonstige
  {
    id: 'auskunftsanfrage',
    name: 'Auskunftsanfrage',
    description: 'Fordern Sie Informationen vom Vermieter an',
    icon: Mail,
    color: 'bg-gray-500',
    category: 'sonstige',
  },
  {
    id: 'datenschutz-auskunft',
    name: 'Datenschutz-Auskunft',
    description: 'DSGVO-Auskunftsanfrage an den Vermieter',
    icon: FileText,
    color: 'bg-emerald-500',
    category: 'sonstige',
  },
]

const CATEGORIES = [
  { id: 'miete', name: 'Miete & Kosten', description: 'Formulare zu Miete, Erhoehungen und Nebenkosten' },
  { id: 'kuendigung', name: 'Kuendigung', description: 'Widerspruch gegen Kuendigungen' },
  { id: 'maengel', name: 'Maengel & Reparaturen', description: 'Maengelanzeigen und Mietminderung' },
  { id: 'auszug', name: 'Auszug', description: 'Kaution, Renovierung, Uebergabe' },
  { id: 'sonstige', name: 'Sonstige', description: 'Weitere nuetzliche Formulare' },
]

export default function FormularePage() {
  const popularFormulare = FORMULARE.filter(f => f.popular)

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
            Mieter-Formulare
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professionelle Vorlagen fuer alle wichtigen Mieter-Anliegen.
            Einfach ausfuellen, herunterladen und absenden.
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
            <div className="text-3xl font-bold text-fintutto-primary">{FORMULARE.length}+</div>
            <div className="text-sm text-gray-600">Formulare verfuegbar</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">PDF</div>
            <div className="text-sm text-gray-600">Download moeglich</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">Rechtlich</div>
            <div className="text-sm text-gray-600">geprueft</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">Einfach</div>
            <div className="text-sm text-gray-600">auszufuellen</div>
          </div>
        </motion.div>

        {/* Popular Formulare */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beliebte Formulare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFormulare.map((formular, index) => (
              <motion.div
                key={formular.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-fintutto-primary">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 ${formular.color} rounded-lg flex items-center justify-center mb-3`}>
                      <formular.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{formular.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{formular.description}</CardDescription>
                    <div className="space-y-2">
                      {formular.checkerLink && (
                        <Link
                          to={formular.checkerLink}
                          className="flex items-center text-fintutto-primary font-medium text-sm hover:underline"
                        >
                          Erst pruefen <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      )}
                      <div className="flex items-center text-gray-600 text-sm">
                        <Download className="w-4 h-4 mr-1" /> Als PDF
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Formulare by Category */}
        {CATEGORIES.map((category, catIndex) => {
          const categoryFormulare = FORMULARE.filter(f => f.category === category.id)
          if (categoryFormulare.length === 0) return null

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + catIndex * 0.1 }}
              className="mb-12"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryFormulare.map((formular) => (
                  <Card key={formular.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${formular.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <formular.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-fintutto-primary transition-colors truncate">
                            {formular.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{formular.description}</p>
                          {formular.checkerLink && (
                            <Link
                              to={formular.checkerLink}
                              className="text-xs text-fintutto-primary hover:underline mt-1 inline-block"
                            >
                              → Zuerst mit Checker pruefen
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )
        })}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center bg-gradient-to-r from-fintutto-primary to-blue-600 rounded-2xl p-8 text-white"
        >
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Welches Formular brauchen Sie?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Nutzen Sie unsere Checker, um herauszufinden, welches Formular fuer Ihre Situation passt.
            Der Checker analysiert Ihren Fall und empfiehlt das passende Dokument.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/checker">
              Zu den Checkern
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
