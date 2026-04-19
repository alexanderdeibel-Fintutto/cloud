import { Link } from 'react-router-dom'
import { ArrowRight, Globe, Zap, Shield, FileText, Brain, Star } from 'lucide-react'

const FEATURES = [
  { icon: Globe, title: '20+ Sprachen', desc: 'Deutsch, Englisch, Französisch, Spanisch, Italienisch, Japanisch, Chinesisch und viele mehr.' },
  { icon: Brain, title: 'Kontextuelle Übersetzung', desc: 'Die KI versteht den Kontext und liefert natürlich klingende Übersetzungen.' },
  { icon: FileText, title: 'Dokument-Übersetzung', desc: 'Übersetze ganze Dokumente — PDFs, Word-Dateien und mehr.' },
  { icon: Zap, title: 'Echtzeit-Übersetzung', desc: 'Übersetze Gespräche in Echtzeit — ideal für internationale Meetings.' },
  { icon: Shield, title: 'Datenschutz', desc: 'Deine Texte werden nicht gespeichert oder für Training verwendet.' },
  { icon: Star, title: 'Fachvokabular', desc: 'Spezialisierte Übersetzungen für Recht, Medizin, Technik und Finanzen.' },
]

export function TranslatorPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Globe size={12} />
            Kommunikation
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            Translator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Übersetze Texte, Dokumente und Sprache in über 20 Sprachen — schnell, präzise und mit dem Kontext, der wirklich zählt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <a
              href="#"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
            >
              Jetzt kostenlos starten
            </a>
            <Link
              to="/preise"
              className="w-full sm:w-auto border border-slate-300 hover:border-indigo-400 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
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
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Was Translator für dich tut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Bereit loszulegen?</h2>
          <p className="text-indigo-200 text-lg mb-8">14 Tage kostenlos testen. Kein Risiko.</p>
          <a
            href="#"
            className="inline-block bg-white text-indigo-600 font-bold px-10 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-xl"
          >
            Jetzt starten
          </a>
        </div>
      </section>
    </>
  )
}
