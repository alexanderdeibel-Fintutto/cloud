import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function LegalFooter() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 no-print">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-brain flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span>&copy; {new Date().getFullYear()} Fintutto UG (haftungsbeschränkt)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">Startseite</Link>
            <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
