export function DatenschutzPage() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Verantwortlicher</h2>
            <p>Fintutto GmbH, Musterstraße 1, 10115 Berlin. E-Mail: datenschutz@fintutto.world</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Erhobene Daten</h2>
            <p>Wir erheben nur die Daten, die für die Bereitstellung unserer Services notwendig sind. Alle Daten werden verschlüsselt in deutschen Rechenzentren gespeichert.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Deine Rechte</h2>
            <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung und Übertragbarkeit deiner Daten. Schreib uns an datenschutz@fintutto.world.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Cookies</h2>
            <p>Wir verwenden nur technisch notwendige Cookies. Keine Tracking- oder Werbe-Cookies.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
