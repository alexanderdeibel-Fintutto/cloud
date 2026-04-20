import { Link } from 'react-router-dom'
import { Heart, Zap, Shield, Globe } from 'lucide-react'

export function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">Über Fintutto Cloud</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Wir glauben, dass jeder Mensch Zugang zu smarten Tools verdient — unabhängig von Bildung, Einkommen oder technischem Wissen.
          </p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Unsere Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Fintutto Cloud wurde mit einer einfachen Idee gegründet: Smarte Apps sollen nicht nur für Tech-Profis sein.
                Ob Finanzen, Wohnen, Lernen oder Alltag — wir bauen Apps, die wirklich helfen und die jeder bedienen kann.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Was uns antreibt</h2>
              <p className="text-slate-600 leading-relaxed">
                Wir sind frustriert von überkomplexen Apps, versteckten Kosten und Datenkraken.
                Deshalb bauen wir anders: transparent, datenschutzfreundlich und mit echtem Mehrwert.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Nutzer-zentriert', desc: 'Jede Entscheidung wird aus Nutzerperspektive getroffen.' },
              { icon: Shield, title: 'Datenschutz first', desc: 'Deine Daten gehören dir — immer.' },
              { icon: Zap, title: 'Einfachheit', desc: 'Komplexe Probleme, einfache Lösungen.' },
              { icon: Globe, title: 'Für alle', desc: 'Mehrsprachig, barrierefrei, zugänglich.' },
            ].map(v => (
              <div key={v.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                  <v.icon size={22} className="text-indigo-600" />
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1">{v.title}</div>
                <div className="text-xs text-slate-500">{v.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/kontakt" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
              Schreib uns
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
