import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-gray-400" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Zahlung abgebrochen
            </h1>
            <p className="text-gray-600 mb-8">
              Keine Sorge - es wurde nichts berechnet. Sie koennen jederzeit
              zurueckkehren und ein Abonnement abschliessen.
            </p>

            <div className="space-y-3">
              <Button variant="fintutto" className="w-full" asChild>
                <Link to="/preise">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurueck zur Preisseite
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">
                  Zur Startseite
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Haben Sie Fragen?</p>
              <p>
                Wenn Sie Hilfe bei der Auswahl des richtigen Plans benoetigen,
                kontaktieren Sie uns unter{' '}
                <a href="mailto:support@fintutto.cloud" className="underline">
                  support@fintutto.cloud
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
