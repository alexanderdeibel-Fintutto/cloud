import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Calculator, Shield, FileText, Search, Sparkles } from 'lucide-react'
import { useDocumentTitle } from '@fintutto/shared'
import { Button } from '../components/ui/button'

const suggestions = [
  { title: 'Rechner', description: 'Kaution, Rendite, Nebenkosten & mehr', href: '/rechner', icon: Calculator, gradient: 'from-purple-500 to-indigo-500' },
  { title: 'Checker', description: 'Mietpreisbremse, Kuendigung & mehr', href: '/checker', icon: Shield, gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Formulare', description: 'Mietvertrag, Uebergabe & mehr', href: '/formulare', icon: FileText, gradient: 'from-rose-500 to-pink-500' },
]

export default function NotFoundPage() {
  useDocumentTitle('Seite nicht gefunden', 'Fintutto Portal')

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(var(--primary)/0.05),transparent_60%)]" />

      {/* Floating Elements */}
      <div className="absolute top-[20%] left-[15%] animate-float hidden md:block opacity-30">
        <div className="h-16 w-16 rounded-2xl gradient-portal flex items-center justify-center">
          <Search className="h-7 w-7 text-white" />
        </div>
      </div>
      <div className="absolute bottom-[25%] right-[12%] animate-float-delayed hidden md:block opacity-20">
        <div className="h-14 w-14 rounded-2xl gradient-portal flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="text-center max-w-lg px-6 relative">
        {/* Giant 404 */}
        <div className="relative mb-8">
          <h1 className="text-[140px] md:text-[180px] font-black leading-none gradient-text-portal select-none opacity-90">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="gradient-portal rounded-full p-5 shadow-2xl glow-purple animate-pulse-glow">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">
          Seite nicht gefunden
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
          Kein Problem - hier geht's weiter:
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-12">
          <Button variant="outline" size="lg" className="rounded-xl h-12" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurueck
            </Link>
          </Button>
          <Button size="lg" className="gradient-portal text-white border-0 rounded-xl h-12 font-semibold" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Zur Startseite
            </Link>
          </Button>
        </div>

        {/* Suggestions */}
        <div className="border-t pt-8">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
            Beliebte Tools
          </p>
          <div className="grid grid-cols-3 gap-3 stagger-children">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                className="tool-card p-4 text-center group"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-bold text-sm mb-0.5">{s.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
