import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
          <p className="text-muted-foreground">
            Fintutto UG (haftungsbeschränkt)<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Vertreten durch</h2>
          <p className="text-muted-foreground">
            Geschäftsführer: Alexander Deibel
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
          <p className="text-muted-foreground">
            E-Mail: info@fintutto.de<br />
            Telefon: [Telefonnummer]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Registereintrag</h2>
          <p className="text-muted-foreground">
            Eintragung im Handelsregister<br />
            Registergericht: [Amtsgericht]<br />
            Registernummer: [HRB-Nummer]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Umsatzsteuer-ID</h2>
          <p className="text-muted-foreground">
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
            [USt-IdNr.]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="text-muted-foreground">
            Alexander Deibel<br />
            [Adresse wie oben]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Streitschlichtung</h2>
          <p className="text-muted-foreground">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-muted-foreground mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Haftung für Inhalte</h2>
          <p className="text-muted-foreground">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Haftung für Links</h2>
          <p className="text-muted-foreground">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
            Seiten verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
          <p className="text-muted-foreground">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </div>
  )
}
