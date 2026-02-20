import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Seite nicht gefunden</h1>
      <p className="text-muted-foreground mb-6">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link to="/">
        <Button>Zurueck zum Dashboard</Button>
      </Link>
    </div>
  )
}
