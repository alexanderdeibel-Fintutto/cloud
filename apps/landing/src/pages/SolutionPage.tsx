import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const SOLUTIONS: Record<string, { title: string; desc: string; apps: string[] }> = {
  privat: {
    title: 'Fintutto Cloud für Privatpersonen',
    desc: 'Ob Finanzen im Griff behalten, Wohnsituation optimieren oder neue Dinge lernen — Fintutto Cloud hat die passende App für jeden Lebensbereich.',
    apps: ['Finance Coach', 'Finance Mentor', 'SecondBrain', 'Translator', 'Pflanzen-Manager'],
  },
  familien: {
    title: 'Fintutto Cloud für Familien',
    desc: 'Gemeinsam sparen, organisieren und lernen — Fintutto Cloud unterstützt die ganze Familie mit smarten Apps.',
    apps: ['Finance Coach', 'LernApp', 'SecondBrain', 'Pflanzen-Manager'],
  },
  freelancer: {
    title: 'Fintutto Cloud für Freelancer',
    desc: 'Rechnungen, Steuern, Cashflow — Fintutto Cloud ist das komplette Finance-OS für Selbstständige.',
    apps: ['Fintutto Biz', 'Finance Coach', 'Bescheidboxer', 'SecondBrain', 'Translator'],
  },
  vermieter: {
    title: 'Fintutto Cloud für Vermieter',
    desc: 'Immobilien professionell verwalten — von der Nebenkostenabrechnung bis zum digitalen Mietvertrag.',
    apps: ['Vermietify', 'Ablesung', 'Fintutto Portal', 'SecondBrain'],
  },
  schueler: {
    title: 'Fintutto Cloud für Schüler & Studenten',
    desc: 'Mit KI-Unterstützung besser lernen — die LernApp passt sich deinem Niveau an und macht Lernen wieder Spaß.',
    apps: ['LernApp', 'Translator', 'Finance Mentor'],
  },
}

export function SolutionPage() {
  const { slug } = useParams<{ slug: string }>()
  const solution = SOLUTIONS[slug ?? '']

  if (!solution) {
    return (
      <section className="py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Lösung nicht gefunden</h1>
        <Link to="/" className="text-indigo-600 hover:underline">Zurück zur Startseite</Link>
      </section>
    )
  }

  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">{solution.title}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{solution.desc}</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Empfohlene Apps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {solution.apps.map(app => (
              <div key={app} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-sm font-semibold text-slate-800">{app}</div>
                <ArrowRight size={14} className="text-indigo-400 ml-auto" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/starten" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
              Jetzt kostenlos starten
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
