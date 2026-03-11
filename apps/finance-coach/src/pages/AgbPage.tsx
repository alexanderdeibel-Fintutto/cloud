import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Startseite
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Allgemeine Geschaeftsbedingungen</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            AGB der Finance Coach Plattform
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 1 Geltungsbereich</h2>
            <p className="text-muted-foreground">
              Diese Allgemeinen Geschaeftsbedingungen (AGB) gelten fuer die Nutzung der Finance Coach Plattform, betrieben von der Fintutto UG (haftungsbeschraenkt) i.G. (nachfolgend &bdquo;Anbieter&ldquo;).
            </p>
            <p className="text-muted-foreground mt-3">
              Mit der Registrierung oder Nutzung der Plattform erkennt der Nutzer diese AGB an.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 2 Vertragsgegenstand</h2>
            <p className="text-muted-foreground mb-3">
              Der Anbieter stellt dem Nutzer ueber die Finance Coach Plattform folgende Dienste zur Verfuegung:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Budget-Planung</strong> &ndash; Erstellung und Verwaltung von Budget-Kategorien mit Echtzeit-Tracking</li>
              <li><strong className="text-foreground">Sparziele</strong> &ndash; Setzen und Verfolgen von persoenlichen Sparzielen</li>
              <li><strong className="text-foreground">KI-Insights</strong> &ndash; Personalisierte Finanz-Empfehlungen und Analysen durch kuenstliche Intelligenz</li>
              <li><strong className="text-foreground">Cashflow-Prognose</strong> &ndash; KI-gestuetzte Vorhersage der finanziellen Entwicklung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 3 Keine Finanzberatung</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-4">
              <p className="text-foreground font-semibold mb-2">Ausdruecklicher Hinweis:</p>
              <p className="text-muted-foreground">
                Finance Coach bietet <strong>keine individuelle Finanzberatung</strong> im Sinne des KWG oder WpHG. Die KI-gestuetzten Insights und Prognosen dienen ausschliesslich der allgemeinen Finanzplanung und stellen keine Anlageberatung dar.
              </p>
            </div>
            <p className="text-muted-foreground">
              Es wird ausdruecklich empfohlen, bei konkreten Anlageentscheidungen einen zugelassenen Finanzberater zu konsultieren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 4 Registrierung und Benutzerkonto</h2>
            <p className="text-muted-foreground">
              Fuer die Nutzung bestimmter Funktionen ist die Erstellung eines Benutzerkontos erforderlich. Der Nutzer ist verpflichtet, wahrheitsgemaesse Angaben zu machen und seine Zugangsdaten vertraulich zu behandeln.
            </p>
            <p className="text-muted-foreground mt-3">
              Der Anbieter ist berechtigt, Benutzerkonten bei Verstoss gegen diese AGB zu sperren oder zu loeschen. Der Nutzer kann sein Benutzerkonto jederzeit loeschen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 5 Preise und Zahlung</h2>
            <p className="text-muted-foreground mb-4">Die Plattform bietet folgende Tarife an:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Tarif</th>
                    <th className="text-left py-3 px-4 font-semibold">Preis</th>
                    <th className="text-left py-3 px-4 font-semibold">Beschreibung</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">Free</td>
                    <td className="py-3 px-4">Kostenlos</td>
                    <td className="py-3 px-4">Dashboard, 3 Budget-Kategorien, 1 Sparziel</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">Premium</td>
                    <td className="py-3 px-4">4,99 EUR/Monat</td>
                    <td className="py-3 px-4">Unbegrenzte Budgets, Sparziele, KI-Insights</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">AI Forecast</td>
                    <td className="py-3 px-4">+2,99 EUR/Monat</td>
                    <td className="py-3 px-4">KI-Prognose, Investment-Empfehlungen, KI-Coach</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground">
              Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Die Zahlungsabwicklung erfolgt ueber Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 6 Widerrufsrecht</h2>
            <p className="text-muted-foreground">
              Verbraucher im Sinne von &sect; 13 BGB haben ein vierzehntagiges Widerrufsrecht. Um Ihr Widerrufsrecht auszuueben, kontaktieren Sie uns unter kontakt@fintutto.de.
            </p>
            <p className="text-muted-foreground mt-3">
              Im Falle eines wirksamen Widerrufs werden bereits geleistete Zahlungen unverzueglich zurueckerstattet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 7 Haftung</h2>
            <p className="text-muted-foreground">
              Der Anbieter haftet unbeschraenkt fuer Schaeden aus der Verletzung des Lebens, des Koerpers oder der Gesundheit. Bei leichter Fahrlaessigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 8 Datenschutz</h2>
            <p className="text-muted-foreground">
              Ausfuehrliche Informationen finden Sie in unserer{" "}
              <Link to="/datenschutz" className="text-primary hover:underline">Datenschutzerklaerung</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 9 Aenderungen der AGB</h2>
            <p className="text-muted-foreground">
              Der Anbieter behaelt sich vor, diese AGB jederzeit zu aendern. Nutzer werden ueber Aenderungen informiert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">&sect; 10 Schlussbestimmungen</h2>
            <p className="text-muted-foreground">
              Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der uebrigen Bestimmungen unberuehrt.
            </p>
          </section>

          <p className="text-sm text-muted-foreground italic">Stand: Maerz 2026</p>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
            <Link to="/impressum" className="text-primary hover:underline text-sm">Impressum</Link>
            <Link to="/datenschutz" className="text-primary hover:underline text-sm">Datenschutzerklaerung</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
