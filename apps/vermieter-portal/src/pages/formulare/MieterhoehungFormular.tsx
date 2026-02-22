import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Construction } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { useDocumentTitle, useMetaTags, useJsonLd, useKeyboardNav, useUnsavedChanges } from '@fintutto/shared'
import { toast } from 'sonner'

export default function MieterhoehungFormular() {
  useDocumentTitle('Mieterhöhung', 'Fintutto Vermieter')
  useMetaTags({
    title: 'Mieterhöhungsschreiben erstellen – Vermieter Portal',
    description: 'Erstelle ein korrektes Mieterhöhungsschreiben nach §558 BGB',
    path: '/formulare/mieterhoehung',
    baseUrl: 'https://vermieter.fintutto.cloud',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Mieterhöhungsschreiben erstellen',
    description: 'Erstelle ein korrektes Mieterhöhungsschreiben nach §558 BGB',
    url: 'https://vermieter.fintutto.cloud/formulare/mieterhoehung',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
  const navigate = useNavigate()
  useKeyboardNav({ onEscape: () => navigate('/formulare') })
  const { setDirty } = useUnsavedChanges()
  return (
    <div>
      <section className="gradient-vermieter py-12">
        <div className="container">
          <Link to="/formulare" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Alle Formulare
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mieterhöhungsschreiben</h1>
              <p className="text-white/80">Mieterhöhung nach §558 BGB</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="py-16 text-center">
              <Construction className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">In Entwicklung</h2>
              <p className="text-muted-foreground">Dieses Formular wird gerade entwickelt.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
