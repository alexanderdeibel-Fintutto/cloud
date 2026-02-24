import { useState } from 'react'
import { LogIn, X, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * A dismissible banner shown on Rechner/Formulare pages for anonymous users.
 * Encourages login for auto-fill with Vermietify property data.
 */
export default function LoginPrompt() {
  const { user, loading } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (loading || user || dismissed) return null

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
      <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900">
          Vermietify-Nutzer? Melde dich an!
        </p>
        <p className="text-xs text-blue-700 mt-0.5">
          Deine Immobiliendaten werden automatisch in die Rechner und Formulare geladen.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-1.5 transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />
          Anmelden
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-400 hover:text-blue-600 p-1"
          aria-label="Schliessen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
