import { Wrench, Building2, ClipboardList, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

export default function Dashboard() {
  const stats = [
    { icon: ClipboardList, title: 'Offene Aufgaben', value: '0', color: 'text-orange-600' },
    { icon: CheckCircle2, title: 'Erledigt (Monat)', value: '0', color: 'text-green-600' },
    { icon: AlertTriangle, title: 'Dringend', value: '0', color: 'text-red-600' },
    { icon: Clock, title: 'In Bearbeitung', value: '0', color: 'text-blue-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold">HausmeisterPro</h1>
          <p className="text-muted-foreground">Hausmeister- & Gebaeudeverwaltung</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, title, value, color }) => (
          <div key={title} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-sm text-muted-foreground">{title}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5" />
          <h2 className="font-semibold">Gebaeude</h2>
        </div>
        <p className="text-muted-foreground">Noch keine Gebaeude angelegt. Verbinde dein Konto mit Vermietify.</p>
      </div>
    </div>
  )
}
