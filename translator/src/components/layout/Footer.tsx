import { Languages } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-auto">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4" />
            <span>Fintutto Translator</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Fintutto</span>
            <Link to="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
