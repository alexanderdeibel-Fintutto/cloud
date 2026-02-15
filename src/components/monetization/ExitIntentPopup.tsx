import { useState, useEffect, useCallback } from 'react'
import { X, Sparkles, Gift, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const { user } = useAuth()

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Nur triggern wenn Maus nach oben (zur Browser-Leiste) bewegt wird
    if (e.clientY <= 5) {
      // Prüfen ob Popup bereits gezeigt wurde (pro Session)
      const alreadyShown = sessionStorage.getItem('exit_intent_shown')
      // Prüfen ob User schon registriert ist
      if (!alreadyShown && !user) {
        setIsVisible(true)
        sessionStorage.setItem('exit_intent_shown', 'true')
      }
    }
  }, [user])

  useEffect(() => {
    // Nur auf Desktop (Maus-Events)
    const isMobile = window.innerWidth < 768
    if (isMobile) return

    // Delay: Nicht sofort triggern, erst nach 5 Sekunden auf der Seite
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 5000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseLeave])

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Gradient Header */}
            <div className="gradient-portal p-6 text-center">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
              <Sparkles className="h-10 w-10 text-yellow-300 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white">
                Warten Sie!
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Ihre Ergebnisse gehen verloren
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-center">
                Registrieren Sie sich kostenlos und erhalten Sie:
              </p>

              <div className="space-y-3">
                {[
                  { icon: '3', text: 'kostenlose Checks pro Monat' },
                  { icon: '28+', text: 'professionelle Mietrecht-Tools' },
                  { icon: 'PDF', text: 'Ergebnisse speichern & exportieren' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Bonus:</strong> Jetzt registrieren und 3 Extra-Credits erhalten!
                </p>
              </div>

              <Button variant="fintutto" size="xl" className="w-full" asChild>
                <Link to="/register" onClick={handleClose}>
                  Kostenlos registrieren
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>

              <button
                onClick={handleClose}
                className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Nein danke, ich möchte weiter ohne Konto
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
