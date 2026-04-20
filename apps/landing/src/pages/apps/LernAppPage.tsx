import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Zap, Shield, TrendingUp, Brain, Star } from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'KI-Erklärungen', desc: 'Komplexe Schulthemen werden einfach und verständlich erklärt — auf das Niveau des Schülers angepasst.' },
  { icon: Star, title: 'Alle Fächer', desc: 'Mathe, Deutsch, Englisch, Physik, Chemie, Geschichte und mehr.' },
  { icon: Zap, title: 'Sofortiges Feedback', desc: 'Aufgaben lösen und sofort sehen, ob die Antwort richtig ist — mit Erklärung warum.' },
  { icon: TrendingUp, title: 'Lernfortschritt', desc: 'Eltern und Schüler sehen den Fortschritt in jedem Fach auf einen Blick.' },
  { icon: BookOpen, title: 'Hausaufgaben-Hilfe', desc: 'Schritt-für-Schritt-Hilfe bei Hausaufgaben — ohne die Lösung einfach zu verraten.' },
  { icon: Shield, title: 'Kindersicher', desc: 'DSGVO-konform, ohne Werbung und mit elterlicher Kontrolle.' },
]

export function LernAppPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-lime-50/30 to-green-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-lime-100 text-lime-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <BookOpen size={12} />
            Lernen
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            LernApp
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Mathe, Deutsch, Englisch und mehr — die LernApp erklärt Schulstoff verständlich mit KI, passt sich dem Lerntempo an und macht Lernen wieder Spaß.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="https://fintutto.cloud/register"
              className="w-full sm:w-auto bg-lime-600 hover:bg-lime-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-lime-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
            >
              Preise ansehen <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-sm text-slate-500">14 Tage kostenlos · Keine Kreditkarte · Jederzeit kündbar</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was LernApp für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-lime-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-lime-600 to-green-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-lime-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="https://fintutto.cloud/register"
            className="inline-block bg-white text-lime-600 font-bold px-10 py-4 rounded-xl hover:bg-lime-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
