import { Link } from 'react-router-dom'
import { ArrowRight, Users, Shield, TrendingUp, FileText, Brain, Star } from 'lucide-react'

const FEATURES = [
  { icon: Shield, title: 'Anspruchs-Rechner', desc: 'Berechne deinen Anspruch auf ALG I und Bürgergeld — schnell und verständlich.' },
  { icon: FileText, title: 'Antragshelfer', desc: 'Schritt-für-Schritt-Hilfe beim Ausfüllen von Anträgen beim Jobcenter.' },
  { icon: Brain, title: 'Rechtsfragen-KI', desc: 'Stelle deine Fragen zum Sozialrecht — die KI antwortet verständlich.' },
  { icon: Star, title: 'Fristen-Tracker', desc: 'Behalte alle wichtigen Fristen im Blick — Widerspruchsfristen, Meldepflichten.' },
  { icon: Users, title: 'Community', desc: 'Tausche dich mit anderen Betroffenen aus und finde Unterstützung.' },
  { icon: TrendingUp, title: 'Weiterbildungs-Finder', desc: 'Finde geförderte Weiterbildungen und Umschulungen in deiner Region.' },
]

export function ArbeitslosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-rose-50/30 to-pink-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Users size={12} />
            Soziales & Recht
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Arbeitslos-Portal
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Bürgergeld, ALG I, Sozialrecht — das Arbeitslos-Portal erklärt deine Rechte verständlich und hilft dir, alle Ansprüche durchzusetzen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="#"
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-rose-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was Arbeitslos-Portal für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-rose-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-rose-600 to-pink-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-rose-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="#"
            className="inline-block bg-white text-rose-600 font-bold px-10 py-4 rounded-xl hover:bg-rose-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
