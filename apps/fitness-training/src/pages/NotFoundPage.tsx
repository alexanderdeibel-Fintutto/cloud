import { Link } from 'react-router-dom'
import { Dumbbell, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Dumbbell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Diese Seite wurde nicht gefunden.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  )
}
