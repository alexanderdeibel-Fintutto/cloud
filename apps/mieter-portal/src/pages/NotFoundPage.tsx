import { Link } from 'react-router-dom'
import { useAppConfig } from '@fintutto/core'
import { Button } from '@fintutto/ui'

export default function NotFoundPage() {
  const config = useAppConfig()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Diese Seite existiert nicht im {config.displayName}.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Zurueck zum Dashboard</Link>
      </Button>
    </div>
  )
}
