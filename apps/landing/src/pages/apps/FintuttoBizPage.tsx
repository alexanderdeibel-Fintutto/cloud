import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Zap, Shield, TrendingUp, Calculator, FileText, Star } from 'lucide-react'

const FEATURES = [
  { icon: FileText, title: 'Rechnungen in Sekunden', desc: 'Professionelle Rechnungen erstellen und per E-Mail versenden — in unter 60 Sekunden.' },
  { icon: Calculator, title: 'Steuervorauszahlung', desc: 'Behalte immer im Blick, wie viel du für Steuern zurücklegen musst.' },
  { icon: TrendingUp, title: 'Cashflow-Dashboard', desc: 'Einnahmen und Ausgaben auf einen Blick — immer wissen, wie es um dein Business steht.' },
  { icon: Shield, title: 'DATEV-Export', desc: 'Exportiere deine Daten direkt für deinen Steuerberater.' },
  { icon: Zap, title: 'Automatische Kategorisierung', desc: 'Ausgaben werden automatisch als Betriebsausgaben kategorisiert.' },
  { icon: Star, title: 'Angebote & Verträge', desc: 'Erstelle professionelle Angebote und Verträge mit wenigen Klicks.' },
]

export function FintuttoBizPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Briefcase size={12} />
            Freelancer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Fintutto Biz
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Rechnungen schreiben, Steuern vorbereiten, Cashflow im Blick — alles in einem Tool. Das komplette Finance-OS für Freelancer und Selbstständige.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="https://biz.fintutto.cloud/register"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-violet-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was Fintutto Biz für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-violet-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-violet-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="https://biz.fintutto.cloud/register"
            className="inline-block bg-white text-violet-600 font-bold px-10 py-4 rounded-xl hover:bg-violet-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
