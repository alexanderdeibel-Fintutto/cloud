import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AgbPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
          <p className="text-muted-foreground">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der
            Fintutto UG (haftungsbeschränkt) (nachfolgend &quot;Anbieter&quot;) und dem Nutzer
            (nachfolgend &quot;Kunde&quot;) über die Nutzung der Fintutto-Plattform und ihrer
            Dienste.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 2 Leistungsbeschreibung</h2>
          <p className="text-muted-foreground">
            Der Anbieter stellt über die Plattform fintutto.de verschiedene digitale Werkzeuge
            für Mieter und Vermieter bereit, darunter:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Rechner zur Berechnung von Miet- und Immobilienkennzahlen</li>
            <li>Checker zur Prüfung mietrechtlicher Sachverhalte</li>
            <li>Formulare zur Erstellung rechtlicher Dokumente</li>
            <li>Weitere spezialisierte Apps im Fintutto-Ökosystem</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Die bereitgestellten Tools dienen ausschließlich der Information und Orientierung.
            Sie ersetzen keine Rechtsberatung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 3 Registrierung und Nutzerkonto</h2>
          <p className="text-muted-foreground">
            Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Der Kunde
            ist verpflichtet, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vertraulich
            zu behandeln.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 4 Credits und Zahlungsbedingungen</h2>
          <p className="text-muted-foreground">
            Die Nutzung bestimmter Premium-Funktionen erfordert Credits. Credits können über die
            Plattform erworben werden. Der Preis richtet sich nach dem zum Zeitpunkt des Kaufs
            gültigen Preisverzeichnis. Die Zahlung erfolgt über den Zahlungsdienstleister Stripe.
          </p>
          <p className="text-muted-foreground mt-2">
            Erworbene Credits sind nicht übertragbar und können nicht in Bargeld ausgezahlt werden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 5 Widerrufsrecht</h2>
          <p className="text-muted-foreground">
            Als Verbraucher haben Sie ein 14-tägiges Widerrufsrecht. Das Widerrufsrecht erlischt
            bei digitalen Inhalten, wenn mit der Ausführung des Vertrags begonnen wurde und der
            Kunde ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrags
            vor Ablauf der Widerrufsfrist beginnt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 6 Haftungsbeschränkung</h2>
          <p className="text-muted-foreground">
            Die über die Plattform bereitgestellten Berechnungen, Prüfungen und Dokumente dienen
            ausschließlich der Orientierung. Der Anbieter übernimmt keine Haftung für die
            Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen.
          </p>
          <p className="text-muted-foreground mt-2">
            Der Anbieter haftet nur für Schäden, die auf einer vorsätzlichen oder grob fahrlässigen
            Pflichtverletzung beruhen. Die Haftung ist auf den vertragstypischen, vorhersehbaren
            Schaden begrenzt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 7 Datenschutz</h2>
          <p className="text-muted-foreground">
            Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{' '}
            <Link to="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">§ 8 Schlussbestimmungen</h2>
          <p className="text-muted-foreground">
            Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser
            AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen
            unberührt.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">
          Stand: Februar 2026
        </p>
      </div>
    </div>
  )
}
