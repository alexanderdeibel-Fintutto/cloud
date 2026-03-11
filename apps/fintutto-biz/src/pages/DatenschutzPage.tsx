import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Startseite
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Datenschutzerklaerung</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Informationen zum Datenschutz bei Fintutto Biz
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Verantwortlicher</h2>
            <p className="text-muted-foreground">
              Fintutto UG (haftungsbeschraenkt) i.G.<br />
              Musterstrasse 1<br />
              10115 Berlin<br />
              E-Mail: kontakt@fintutto.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Erhobene Daten</h2>
            <p className="text-muted-foreground mb-4">
              Im Rahmen der Nutzung von Fintutto Biz erheben wir folgende personenbezogene Daten:
            </p>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Registrierungsdaten</h3>
                <p className="text-sm text-muted-foreground">
                  E-Mail-Adresse, Passwort (verschluesselt), Vor- und Nachname
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Unternehmensdaten</h3>
                <p className="text-sm text-muted-foreground">
                  Firmenname, Rechtsform, Adresse, Steuernummer, Umsatzsteuer-ID, Bankverbindung, Rechnungskonfiguration
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Rechnungsdaten</h3>
                <p className="text-sm text-muted-foreground">
                  Rechnungsinhalte, Rechnungsnummern, Betraege, Zahlungsstatus, Faelligkeitsdaten
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Kundendaten</h3>
                <p className="text-sm text-muted-foreground">
                  Kontaktdaten Ihrer Geschaeftskunden (Name, Firma, Adresse, E-Mail, Telefon, Steuernummer)
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Ausgabendaten</h3>
                <p className="text-sm text-muted-foreground">
                  Geschaeftsausgaben mit Kategorie, Betrag, Datum, Beschreibung und Vorsteuer-Informationen
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Nutzungsdaten</h3>
                <p className="text-sm text-muted-foreground">
                  IP-Adresse, Browsertyp, Geraeteinformationen, Zugriffszeitpunkte
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Zweck der Datenverarbeitung</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Bereitstellung der Buchhaltungs- und Rechnungsfunktionen</li>
              <li>Erstellung und Verwaltung von Rechnungen</li>
              <li>Steuerberechnung und -uebersichten (USt, EUeR)</li>
              <li>Kundenverwaltung fuer Ihre Geschaeftskontakte</li>
              <li>Ausgaben-Tracking und Kategorisierung</li>
              <li>Zahlungsabwicklung ueber Stripe</li>
              <li>Kommunikation und Support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Rechtsgrundlagen</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Art. 6 Abs. 1 lit. b DSGVO</strong> &ndash; Vertragserfullung (Bereitstellung der Buchhaltungsplattform)</li>
              <li><strong className="text-foreground">Art. 6 Abs. 1 lit. a DSGVO</strong> &ndash; Einwilligung (optionale Funktionen)</li>
              <li><strong className="text-foreground">Art. 6 Abs. 1 lit. f DSGVO</strong> &ndash; Berechtigtes Interesse (Plattform-Sicherheit, Analyse)</li>
              <li><strong className="text-foreground">Art. 6 Abs. 1 lit. c DSGVO</strong> &ndash; Rechtliche Verpflichtung (steuerrechtliche Aufbewahrungspflichten)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Aufbewahrungsfristen</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Wichtiger Hinweis:</strong> Rechnungen und buchhalterische Unterlagen unterliegen den gesetzlichen Aufbewahrungspflichten gemaess &sect; 147 AO und &sect; 257 HGB. Diese Daten werden fuer die gesetzlich vorgeschriebene Dauer von <strong>10 Jahren</strong> (Rechnungen, Buchungsbelege) bzw. <strong>6 Jahren</strong> (Geschaeftsbriefe) aufbewahrt, auch nach Kontoloeschung.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Drittanbieter und Auftragsverarbeitung</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Dienst</th>
                    <th className="text-left py-3 px-4 font-semibold">Anbieter</th>
                    <th className="text-left py-3 px-4 font-semibold">Zweck</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">Supabase</td>
                    <td className="py-3 px-4">Supabase Inc.</td>
                    <td className="py-3 px-4">Datenbank, Authentifizierung</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">Stripe</td>
                    <td className="py-3 px-4">Stripe Inc.</td>
                    <td className="py-3 px-4">Zahlungsabwicklung</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium text-foreground">Vercel</td>
                    <td className="py-3 px-4">Vercel Inc.</td>
                    <td className="py-3 px-4">Hosting</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Mit allen Auftragsverarbeitern bestehen Vertraege gemaess Art. 28 DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Kundendaten Dritter</h2>
            <p className="text-muted-foreground">
              Wenn Sie Kundendaten (Namen, Adressen, Steuernummern) Ihrer Geschaeftskunden in Fintutto Biz erfassen, sind Sie als Nutzer selbst Verantwortlicher fuer diese Daten im Sinne der DSGVO. Sie sind verpflichtet, die datenschutzrechtlichen Anforderungen gegenueber Ihren Kunden einzuhalten. Fintutto Biz agiert hierbei als Auftragsverarbeiter.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Ihre Rechte</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Auskunft</strong> &ndash; Recht auf Auskunft ueber Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li><strong className="text-foreground">Berichtigung</strong> &ndash; Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li><strong className="text-foreground">Loeschung</strong> &ndash; Recht auf Loeschung Ihrer Daten (Art. 17 DSGVO), unter Beruecksichtigung gesetzlicher Aufbewahrungspflichten</li>
              <li><strong className="text-foreground">Einschraenkung</strong> &ndash; Recht auf Einschraenkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li><strong className="text-foreground">Datenuebertragbarkeit</strong> &ndash; Recht auf Datenuebertragbarkeit (Art. 20 DSGVO)</li>
              <li><strong className="text-foreground">Widerspruch</strong> &ndash; Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li><strong className="text-foreground">Beschwerde</strong> &ndash; Recht auf Beschwerde bei der zustaendigen Aufsichtsbehoerde</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Datensicherheit</h2>
            <p className="text-muted-foreground">
              Wir verwenden SSL/TLS-Verschluesselung fuer alle Datenuebertragungen. Geschaeftsdaten werden verschluesselt gespeichert. Der Zugang zu Servern und Datenbanken ist streng beschraenkt und wird protokolliert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Cookies</h2>
            <p className="text-muted-foreground">
              Fintutto Biz verwendet ausschliesslich technisch notwendige Cookies fuer die Authentifizierung und Sitzungsverwaltung. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Kontakt</h2>
            <p className="text-muted-foreground">
              Bei Fragen zum Datenschutz wenden Sie sich bitte an:<br />
              <strong className="text-foreground">datenschutz@fintutto.de</strong>
            </p>
          </section>

          <p className="text-sm text-muted-foreground italic">Stand: Maerz 2026</p>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
            <Link to="/impressum" className="text-primary hover:underline text-sm">Impressum</Link>
            <Link to="/agb" className="text-primary hover:underline text-sm">AGB</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
