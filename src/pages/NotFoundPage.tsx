import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-fintutto-primary/20">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Seite nicht gefunden</h2>
        <p className="text-gray-600 mt-2 max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurueck
            </Link>
          </Button>
          <Button variant="fintutto" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
