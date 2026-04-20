export function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">Kontakt</h1>
          <p className="text-lg text-slate-600">Wir freuen uns von dir zu hören. Schreib uns einfach.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Dein Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input type="email" className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="deine@email.de" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nachricht</label>
              <textarea rows={5} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Wie können wir dir helfen?" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors">
              Nachricht senden
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            Oder schreib direkt an{' '}
            <a href="mailto:hallo@fintutto.world" className="text-indigo-600 hover:underline">hallo@fintutto.world</a>
          </div>
        </div>
      </section>
    </>
  )
}
