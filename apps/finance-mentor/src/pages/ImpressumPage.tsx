import { Link } from "react-router-dom";
import { Scale, ArrowLeft } from "lucide-react";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Startseite
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Impressum</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Angaben gemaess &sect; 5 TMG
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">Angaben gemaess &sect; 5 TMG</h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground">Fintutto UG (haftungsbeschraenkt) &ndash; i.G. (in Gruendung)</p>
              <p><strong className="text-foreground">Vertreten durch:</strong> [Name wird ergaenzt]</p>
              <p><strong className="text-foreground">Adresse:</strong> [Wird nach Eintragung ergaenzt]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">E-Mail:</strong>{" "}
                <a href="mailto:kontakt@fintutto.de" className="text-primary hover:underline">kontakt@fintutto.de</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Umsatzsteuer-ID</h2>
            <p className="text-muted-foreground">
              Umsatzsteuer-Identifikationsnummer gemaess &sect; 27 a Umsatzsteuergesetz: [Wird nach Anmeldung ergaenzt]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Handelsregister</h2>
            <p className="text-muted-foreground">[Wird nach Eintragung ergaenzt]</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Verantwortlich fuer den Inhalt nach &sect; 18 Abs. 2 MStV</h2>
            <p className="text-muted-foreground">[Wird ergaenzt]</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">EU-Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europaeische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-muted-foreground mt-2">
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Haftungsausschluss</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Haftung fuer Inhalte</h3>
                <p className="text-muted-foreground">
                  Als Diensteanbieter sind wir gemaess &sect; 7 Abs. 1 TMG fuer eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach &sect;&sect; 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, uebermittelte oder gespeicherte fremde Informationen zu ueberwachen. Bei Bekanntwerden von Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Haftung fuer Links</h3>
                <p className="text-muted-foreground">
                  Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Urheberrecht</h3>
                <p className="text-muted-foreground">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfaeltigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes beduerfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Wichtiger Hinweis</h2>
            <p className="text-muted-foreground">
              Finance Mentor bietet keine individuelle Finanzberatung im Sinne des KWG oder WpHG. Die Kursinhalte dienen ausschliesslich der allgemeinen Finanzbildung und ersetzen nicht die Beratung durch einen zugelassenen Finanzberater. Bei konkreten Anlageentscheidungen wenden Sie sich bitte an einen Fachberater.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
            <Link to="/datenschutz" className="text-primary hover:underline text-sm">Datenschutzerklaerung</Link>
            <Link to="/agb" className="text-primary hover:underline text-sm">Allgemeine Geschaeftsbedingungen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
