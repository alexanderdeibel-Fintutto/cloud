import { Link } from 'react-router-dom'
import { ArrowRight, Star, Brain, Zap, Shield, TrendingUp, Star, FileText, Brain } from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Scan & Erkennung', desc: 'Fotografiere Briefe und Dokumente — die KI erkennt und kategorisiert sie automatisch.' },
  { icon: Brain, title: 'Intelligente Suche', desc: 'Finde jedes Dokument in Sekunden — auch wenn du nur den Inhalt kennst.' },
  { icon: Shield, title: 'Sicheres Archiv', desc: 'Alle Dokumente verschlüsselt gespeichert — für immer abrufbar.' },
  { icon: FileText, title: 'Automatische Kategorisierung', desc: 'Rechnungen, Verträge, Behördenschreiben — alles wird automatisch einsortiert.' },
  { icon: TrendingUp, title: 'Integration', desc: 'Dokumente können direkt in Vermietify, Finance Coach und anderen Apps verwendet werden.' },
  { icon: Star, title: 'Erinnerungen', desc: 'Fristen aus Briefen werden automatisch erkannt und als Erinnerung gesetzt.' },
]

export function SecondBrainPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Brain size={12} />
            Produktivität
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            SecondBrain
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Scanne alle eingehenden Briefe und Dokumente — SecondBrain erkennt, kategorisiert und archiviert alles automatisch. Nie wieder wichtige Post verlieren.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href={href_app}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-cyan-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was SecondBrain für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-cyan-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-cyan-600 to-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-cyan-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href={href_app}
            className="inline-block bg-white text-cyan-600 font-bold px-10 py-4 rounded-xl hover:bg-cyan-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
