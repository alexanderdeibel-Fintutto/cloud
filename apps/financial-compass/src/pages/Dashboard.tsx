import { Compass, TrendingUp, Receipt, FileText, Users, CreditCard, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const features = [
    { icon: TrendingUp, title: 'Cashflow', desc: 'Einnahmen & Ausgaben im Blick' },
    { icon: Receipt, title: 'Buchungen', desc: 'Alle Transaktionen verwalten' },
    { icon: FileText, title: 'Rechnungen', desc: 'Rechnungen erstellen & versenden' },
    { icon: Users, title: 'Kontakte', desc: 'Kunden & Lieferanten' },
    { icon: CreditCard, title: 'Bankkonten', desc: 'Kontoabgleich & Import' },
    { icon: BarChart3, title: 'Berichte', desc: 'BWA, EUeR, Umsatzsteuer' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Compass className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Financial Compass</h1>
          <p className="text-muted-foreground">Finanzuebersicht & Buchhaltung</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <Icon className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
