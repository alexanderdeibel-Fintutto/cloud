import { Building2, Users, Wallet, Receipt, FileText, Calculator, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Objekte", value: "12", icon: Building2, color: "bg-blue-500" },
    { name: "Mieter", value: "48", icon: Users, color: "bg-green-500" },
    { name: "Mieteinnahmen/Monat", value: "42.500 EUR", icon: Wallet, color: "bg-indigo-500" },
    { name: "Offene Posten", value: "3", icon: AlertCircle, color: "bg-red-500" },
  ];

  const quickActions = [
    { name: "Neues Objekt", href: "/objekte/neu", icon: Building2 },
    { name: "Mieter anlegen", href: "/mieter/neu", icon: Users },
    { name: "NK-Abrechnung", href: "/betriebskosten", icon: Receipt },
    { name: "Mietvertrag", href: "/formulare", icon: FileText },
    { name: "Mieterhoehung", href: "/formulare/mieterhoehung", icon: TrendingUp },
    { name: "Anlage V", href: "/steuern", icon: Calculator },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Uebersicht Ihrer Immobilien</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <action.icon className="h-8 w-8 text-indigo-600 mb-2" />
              <span className="text-sm text-center">{action.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* AI Hint */}
      <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">KI-Assistent</h3>
            <p className="text-indigo-700 text-sm mt-1">
              Klicken Sie auf den Chat-Button unten rechts fuer Fragen zu Mietrecht,
              Nebenkostenabrechnung, Mieterhoehungen und mehr!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
