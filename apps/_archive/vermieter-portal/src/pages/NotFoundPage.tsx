import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Calculator, FileText, TrendingUp } from 'lucide-react'
import { useDocumentTitle } from '@fintutto/shared'
import { Button } from '../components/ui/button'

const suggestions = [
  { title: 'Kautions-Rechner', description: 'Max. Kaution berechnen', href: '/rechner/kaution', icon: Calculator },
  { title: 'Rendite-Rechner', description: 'Rendite berechnen', href: '/rechner/rendite', icon: TrendingUp },
  { title: 'Mietvertrag', description: 'Vertrag erstellen', href: '/formulare/mietvertrag', icon: FileText },
]

export default function NotFoundPage() {
  useDocumentTitle('Seite nicht gefunden', 'Fintutto Vermieter')

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold gradient-text-vermieter mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mb-8">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex gap-4 justify-center mb-10">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurueck
            </Link>
          </Button>
          <Button className="gradient-vermieter text-white" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Zur Startseite
            </Link>
          </Button>
        </div>

        <div className="border-t pt-8">
          <p className="text-sm font-medium text-muted-foreground mb-4">Beliebte Tools:</p>
          <div className="grid grid-cols-3 gap-3">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                className="p-3 rounded-lg border hover:border-primary/40 hover:shadow-sm transition-all text-left"
              >
                <s.icon className="h-5 w-5 text-primary mb-1" />
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
