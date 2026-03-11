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
            Informationen zum Schutz Ihrer personenbezogenen Daten
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-xl font-semibold mb-2">Allgemeine Hinweise</h3>
            <p className="text-muted-foreground">
              Die folgenden Hinweise geben einen einfachen Ueberblick darueber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persoenlich identifiziert werden koennen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Verantwortliche Stelle</h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground">Fintutto UG (haftungsbeschraenkt) i.G.</p>
              <p>[Adresse wird nach Eintragung ergaenzt]</p>
              <p>
                <strong className="text-foreground">E-Mail:</strong>{" "}
                <a href="mailto:kontakt@fintutto.de" className="text-primary hover:underline">kontakt@fintutto.de</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Erhebung und Speicherung personenbezogener Daten</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">a) Beim Besuch der Website</h3>
                <p className="text-muted-foreground mb-2">
                  Beim Aufrufen unserer Website werden automatisch Informationen an den Server gesendet (IP-Adresse, Datum/Uhrzeit, aufgerufene URL, Browser, Betriebssystem). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">b) Bei Registrierung eines Benutzerkontos</h3>
                <p className="text-muted-foreground">
                  Wenn Sie ein Benutzerkonto erstellen, erheben wir Ihre E-Mail-Adresse und ein verschluesseltes Passwort. Die Authentifizierung erfolgt ueber Supabase Auth. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">c) Bei Nutzung der Lernplattform</h3>
                <p className="text-muted-foreground">
                  Wenn Sie Kurse bearbeiten, speichern wir Ihren Lernfortschritt (abgeschlossene Lektionen, Kursfortschritt, erzielte Zertifikate). Diese Daten sind fuer die Bereitstellung der Lernplattform erforderlich. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">d) Bei Nutzung des KI-Tutors</h3>
                <p className="text-muted-foreground">
                  Wenn Sie den KI-Tutor nutzen, werden Ihre Fragen an einen KI-Dienst uebermittelt. Chatverlaeufe werden verschluesselt gespeichert und koennen jederzeit geloescht werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Weitergabe von Daten</h2>
            <p className="text-muted-foreground mb-3">
              Wir geben Ihre persoenlichen Daten nur an Dritte weiter, wenn dies zur Vertragsdurchfuehrung erforderlich ist:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Supabase</strong> &ndash; Datenbank, Authentifizierung und Dateispeicherung</li>
              <li><strong className="text-foreground">Stripe</strong> &ndash; Zahlungsabwicklung (bei kostenpflichtigen Tarifen)</li>
              <li><strong className="text-foreground">Anthropic / OpenAI</strong> &ndash; KI-Tutor-Funktionen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
            <p className="text-muted-foreground">
              Wir verwenden ausschliesslich technisch notwendige Cookies fuer die Authentifizierung (Supabase Auth Token). Es werden keine Tracking-Cookies oder Cookies zu Werbezwecken eingesetzt. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. SSL-Verschluesselung</h2>
            <p className="text-muted-foreground">
              Diese Seite nutzt aus Sicherheitsgruenden eine SSL- bzw. TLS-Verschluesselung. Eine verschluesselte Verbindung erkennen Sie an &bdquo;https://&ldquo; in der Adresszeile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Rechte der betroffenen Person</h2>
            <p className="text-muted-foreground mb-3">Sie haben folgende Rechte:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Recht auf Auskunft</strong> (Art. 15 DSGVO)</li>
              <li><strong className="text-foreground">Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong className="text-foreground">Recht auf Loeschung</strong> (Art. 17 DSGVO)</li>
              <li><strong className="text-foreground">Recht auf Einschraenkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong className="text-foreground">Recht auf Datenportabilitaet</strong> (Art. 20 DSGVO)</li>
              <li><strong className="text-foreground">Recht auf Widerspruch</strong> (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Zur Ausuebung Ihrer Rechte wenden Sie sich bitte an{" "}
              <a href="mailto:kontakt@fintutto.de" className="text-primary hover:underline">kontakt@fintutto.de</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Recht auf Beschwerde bei der Aufsichtsbehoerde</h2>
            <p className="text-muted-foreground">
              Sie haben das Recht auf Beschwerde bei einer Aufsichtsbehoerde, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstoesst (Art. 77 DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Aenderung der Datenschutzerklaerung</h2>
            <p className="text-muted-foreground">
              Wir behalten uns vor, diese Datenschutzerklaerung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht.
            </p>
          </section>

          <p className="text-sm text-muted-foreground italic">Stand: Maerz 2026</p>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
            <Link to="/impressum" className="text-primary hover:underline text-sm">Impressum</Link>
            <Link to="/agb" className="text-primary hover:underline text-sm">Allgemeine Geschaeftsbedingungen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
