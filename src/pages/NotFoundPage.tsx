import { Link } from 'react-router-dom'
import { Home, Calculator, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-bold mt-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="flex gap-3 justify-center mt-8">
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Startseite
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-lg mx-auto">
          <Link to="/rechner" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/40 hover:bg-accent transition-colors">
            <Calculator className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">7 Rechner</span>
          </Link>
          <Link to="/checker" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/40 hover:bg-accent transition-colors">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">10 Checker</span>
          </Link>
          <Link to="/formulare" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/40 hover:bg-accent transition-colors">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">10 Formulare</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
