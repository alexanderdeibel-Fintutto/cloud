import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Zap, Shield, Lock, Brain, Star } from 'lucide-react'

const FEATURES = [
  { icon: TrendingUp, title: 'Multi-Bank-Anbindung', desc: 'Verbinde alle deine Konten und behalte den Überblick über alle Ausgaben und Einnahmen.' },
  { icon: Brain, title: 'KI-Budgetierung', desc: 'Die KI analysiert deine Ausgaben und schlägt automatisch ein passendes Budget vor.' },
  { icon: Star, title: 'Persönliches Coaching', desc: 'Erhalte individuelle Tipps und Empfehlungen, die zu deiner Lebenssituation passen.' },
  { icon: Shield, title: 'Sparziele verfolgen', desc: 'Setze dir Sparziele und verfolge deinen Fortschritt in Echtzeit.' },
  { icon: Zap, title: 'Ausgaben-Kategorisierung', desc: 'Alle Ausgaben werden automatisch kategorisiert — du siehst sofort, wohin dein Geld fließt.' },
  { icon: Lock, title: 'Bankensicherheit', desc: 'Deine Bankdaten sind verschlüsselt und werden niemals weitergegeben.' },
]

export function FinanceCoachPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <TrendingUp size={12} />
            Finanzen
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Finance Coach
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Verstehe deine Finanzen endlich — mit KI-gestützter Budgetierung, Multi-Bank-Anbindung und persönlichem Coaching. Für Privatpersonen, die mehr aus ihrem Geld machen wollen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="#"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-emerald-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was Finance Coach für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-emerald-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="#"
            className="inline-block bg-white text-emerald-600 font-bold px-10 py-4 rounded-xl hover:bg-emerald-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
