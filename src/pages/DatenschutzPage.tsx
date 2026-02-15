import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
          <p className="text-muted-foreground">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
          <p className="text-muted-foreground">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br /><br />
            Fintutto UG (haftungsbeschränkt)<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br /><br />
            E-Mail: info@fintutto.de
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf dieser Website</h2>
          <h3 className="text-lg font-medium mb-2">Cookies</h3>
          <p className="text-muted-foreground">
            Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem
            Rechner keinen Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot
            nutzerfreundlicher, effektiver und sicherer zu machen.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">Server-Log-Dateien</h3>
          <p className="text-muted-foreground">
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
            Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Registrierung und Nutzerkonto</h2>
          <p className="text-muted-foreground">
            Sie können sich auf unserer Website registrieren, um zusätzliche Funktionen zu nutzen.
            Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen
            Angebotes oder Dienstes, für den Sie sich registriert haben. Bei der Registrierung
            abgefragte Pflichtangaben müssen vollständig angegeben werden.
          </p>
          <p className="text-muted-foreground mt-2">
            Wir nutzen Supabase als Authentifizierungsdienst. Die Datenverarbeitung erfolgt auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Zahlungsabwicklung</h2>
          <p className="text-muted-foreground">
            Für die Zahlungsabwicklung nutzen wir den Dienst Stripe (Stripe, Inc., 510 Townsend St.,
            San Francisco, CA 94103, USA). Stripe verarbeitet Ihre Zahlungsdaten gemäß deren
            Datenschutzerklärung:{' '}
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://stripe.com/de/privacy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Hosting</h2>
          <p className="text-muted-foreground">
            Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet.
            Details entnehmen Sie der Datenschutzerklärung von Vercel:{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://vercel.com/legal/privacy-policy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Ihre Rechte</h2>
          <p className="text-muted-foreground">
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
            personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung
            sowie ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren
            Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.
          </p>
          <p className="text-muted-foreground mt-2">
            Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht
            sind, dass die Verarbeitung Ihrer personenbezogenen Daten rechtswidrig erfolgt.
          </p>
        </section>
      </div>
    </div>
  )
}
