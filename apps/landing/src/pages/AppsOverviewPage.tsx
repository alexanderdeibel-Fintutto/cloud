import { Link } from 'react-router-dom'
import {
  TrendingUp, GraduationCap, Briefcase, Shield,
  Building2, Home, Calculator, Scale,
  BookOpen, Brain, Leaf, Globe, Users, FileText,
  ArrowRight,
} from 'lucide-react'

const GROUPS = [
  {
    title: 'Finanzen',
    color: 'emerald',
    apps: [
      { label: 'Finance Coach', sub: 'KI-Finanzcoach & Budgetierung', href: '/apps/finance-coach', icon: TrendingUp },
      { label: 'Finance Mentor', sub: 'Finanz-Bildung & Zertifikate', href: '/apps/finance-mentor', icon: GraduationCap },
      { label: 'Fintutto Biz', sub: 'Freelancer Finance OS', href: '/apps/fintutto-biz', icon: Briefcase },
      { label: 'Bescheidboxer', sub: 'Steuerbescheide prüfen', href: '/apps/bescheidboxer', icon: Shield },
    ],
  },
  {
    title: 'Wohnen',
    color: 'sky',
    apps: [
      { label: 'Vermietify', sub: 'Immobilienverwaltung für Vermieter', href: '/apps/vermietify', icon: Building2 },
      { label: 'WohnHeld', sub: 'Mieter-App für Wohnungsmanagement', href: '/apps/wohnheld', icon: Home },
      { label: 'Ablesung', sub: 'Zählerablesung & Rechnungs-OCR', href: '/apps/ablesung', icon: Calculator },
      { label: 'Fintutto Portal', sub: 'Rechner & Formulare für Mietrecht', href: '/apps/portal', icon: Scale },
    ],
  },
  {
    title: 'Lernen & Alltag',
    color: 'lime',
    apps: [
      { label: 'LernApp', sub: 'KI-Erklärungen für Schüler', href: '/apps/lernapp', icon: BookOpen },
      { label: 'SecondBrain', sub: 'KI-Dokumentenmanagement', href: '/apps/secondbrain', icon: Brain },
      { label: 'Pflanzen-Manager', sub: 'Zimmerpflanzen-Verwaltung', href: '/apps/pflanzen', icon: Leaf },
      { label: 'Translator', sub: 'Übersetzer in 20+ Sprachen', href: '/apps/translator', icon: Globe },
    ],
  },
  {
    title: 'Soziales & Recht',
    color: 'rose',
    apps: [
      { label: 'Arbeitslos-Portal', sub: 'Bürgergeld, ALG I & Sozialrecht', href: '/apps/arbeitslos', icon: Users },
      { label: 'Widerspruch-Jobcenter', sub: 'Community & Tipps', href: '/apps/widerspruch', icon: FileText },
    ],
  },
]

export function AppsOverviewPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">Alle Fintutto Cloud Apps</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">14 smarte Apps für jeden Lebensbereich — alle kostenlos starten.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          {GROUPS.map(group => (
            <div key={group.title}>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{group.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.apps.map(app => (
                  <Link
                    key={app.href}
                    to={app.href}
                    className="group bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${group.color}-100 flex items-center justify-center mb-3`}>
                      <app.icon size={20} className={`text-${group.color}-600`} />
                    </div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">{app.label}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{app.sub}</div>
                    <div className="flex items-center gap-1 mt-3 text-xs text-indigo-500 font-medium">
                      Mehr erfahren <ArrowRight size={12} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
