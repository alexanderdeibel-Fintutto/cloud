import { Home, Wrench, FileText, Calculator, Scale, User } from "lucide-react";

export default function Dashboard() {
  const features = [
    { icon: Wrench, title: "Reparaturen", description: "Schaeden melden und verfolgen", href: "/reparaturen", color: "bg-orange-500" },
    { icon: FileText, title: "Dokumente", description: "Mietvertrag, Abrechnungen", href: "/dokumente", color: "bg-blue-500" },
    { icon: Calculator, title: "Nebenkosten", description: "NK-Abrechnungen pruefen", href: "/nebenkosten", color: "bg-green-500" },
    { icon: Scale, title: "Mietrecht", description: "Deine Rechte als Mieter", href: "/mietrecht", color: "bg-purple-500" },
    { icon: Calculator, title: "Rechner", description: "Mieterhoehung, Nebenkosten", href: "/rechner", color: "bg-yellow-500" },
    { icon: User, title: "Profil", description: "Deine Daten verwalten", href: "/profil", color: "bg-gray-500" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Willkommen im Mieterportal</h1>
        <p className="text-gray-600 mt-2">Alles rund um deine Wohnung an einem Ort.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <a
            key={feature.title}
            href={feature.href}
            className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">KI-Assistent</h3>
            <p className="text-emerald-700 text-sm mt-1">
              Klicke auf den Chat-Button unten rechts, um Fragen zu stellen.
              Der Assistent kennt deutsches Mietrecht und hilft dir bei allen Wohnungsfragen!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
