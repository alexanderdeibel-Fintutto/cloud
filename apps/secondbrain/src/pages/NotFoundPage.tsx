import { Link } from 'react-router-dom'
import { Brain, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
        <Brain className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-extrabold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Diese Seite existiert nicht in deinem SecondBrain
      </p>
      <Link to="/">
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Dashboard
        </Button>
      </Link>
    </div>
  )
}
