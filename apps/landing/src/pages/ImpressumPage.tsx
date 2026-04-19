export function ImpressumPage() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Impressum</h1>
        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4">
          <p><strong>Fintutto GmbH</strong><br />Musterstraße 1<br />10115 Berlin<br />Deutschland</p>
          <p>E-Mail: <a href="mailto:hallo@fintutto.world" className="text-indigo-600">hallo@fintutto.world</a></p>
          <p>Geschäftsführer: Alexander Deibel</p>
          <p>Registergericht: Amtsgericht Berlin-Charlottenburg<br />Registernummer: HRB 000000</p>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE000000000</p>
        </div>
      </div>
    </section>
  )
}
