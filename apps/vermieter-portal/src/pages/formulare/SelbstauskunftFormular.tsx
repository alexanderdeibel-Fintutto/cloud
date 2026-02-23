import { Link } from 'react-router-dom'
import { Users, ArrowLeft, Construction } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { useDocumentTitle, useMetaTags, useJsonLd } from '@fintutto/shared'

export default function SelbstauskunftFormular() {
  useDocumentTitle('Selbstauskunft', 'Fintutto Vermieter')
  useMetaTags({
    title: 'Mieterselbstauskunft erstellen – Vermieter Portal',
    description: 'DSGVO-konforme Selbstauskunft für Mietinteressenten',
    path: '/formulare/selbstauskunft',
    baseUrl: 'https://vermieter.fintutto.cloud',
  })
  useJsonLd({
    type: 'WebApplication',
    name: 'Mieterselbstauskunft erstellen',
    description: 'DSGVO-konforme Selbstauskunft für Mietinteressenten',
    url: 'https://vermieter.fintutto.cloud/formulare/selbstauskunft',
    offers: { price: '0', priceCurrency: 'EUR' },
  })
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Selbstauskunft</h1>
              <p className="text-white/80">Mieterselbstauskunft erstellen</p>
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
