import { Link } from 'react-router-dom'
 claude/improve-app-integration-k7JF2
import { Home, ArrowLeft, Shield, TrendingUp, Receipt } from 'lucide-react'
import { useDocumentTitle } from '@fintutto/shared'

import { Home, Calculator, Shield, FileText } from 'lucide-react'
 main
import { Button } from '@/components/ui/button'

const suggestions = [
  { title: 'Mietpreisbremse', description: 'Ist deine Miete zu hoch?', href: '/checker/mietpreisbremse', icon: Shield },
  { title: 'Mieterhoehung', description: 'Ist die Erhoehung gueltig?', href: '/checker/mieterhoehung', icon: TrendingUp },
  { title: 'Nebenkosten', description: 'Stimmt deine Abrechnung?', href: '/checker/nebenkosten', icon: Receipt },
]

export default function NotFoundPage() {
  useDocumentTitle('Seite nicht gefunden', 'Fintutto Checker')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
 claude/improve-app-integration-k7JF2
      <div className="text-center max-w-lg">
        <h1 className="text-9xl font-bold text-fintutto-primary/20">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Seite nicht gefunden</h2>
        <p className="text-gray-600 mt-2 max-w-md">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex gap-4 justify-center mt-8 mb-10">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurueck
            </Link>
          </Button>
          <Button variant="fintutto" asChild>

      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary/20">404</h1>
        <h2 className="text-2xl font-bold mt-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="flex gap-3 justify-center mt-8">
          <Button asChild>
 main
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Startseite
            </Link>
          </Button>
        </div>

 claude/improve-app-integration-k7JF2
        <div className="border-t pt-8">
          <p className="text-sm font-medium text-gray-500 mb-4">Beliebte Checker:</p>
          <div className="grid grid-cols-3 gap-3">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                className="p-3 rounded-lg border hover:border-fintutto-primary/40 hover:shadow-sm transition-all text-left"
              >
                <s.icon className="h-5 w-5 text-fintutto-primary mb-1" />
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </Link>
            ))}
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
 main
        </div>
      </div>
    </div>
  )
}
