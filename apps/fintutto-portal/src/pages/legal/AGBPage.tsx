import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AGBPage() {
  return (
    <div>
      <section className="gradient-portal py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Startseite
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Allgemeine Geschäftsbedingungen</h1>
              <p className="text-white/80">Nutzungsbedingungen für Fintutto Portal</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-3xl space-y-6">
          <Card className="bg-muted/30 border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Wichtiger Hinweis:</strong> Fintutto bietet Informations- und
                  Berechnungstools. Die Ergebnisse stellen keine Rechtsberatung dar. Für rechtlich verbindliche
                  Auskünfte wenden Sie sich bitte an einen Rechtsanwalt.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 1 Geltungsbereich</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der
                Fintutto Portal Plattform, betrieben von der Fintutto GmbH, Musterstraße 42,
                10115 Berlin (nachfolgend "Anbieter").
              </p>
              <p>
                (2) Die AGB gelten für alle registrierten Nutzer und Besucher der Plattform,
                einschließlich aller Unterseiten und Dienste (Rechner, Checker, Formulare).
              </p>
              <p>
                (3) Es gelten die zum Zeitpunkt der Registrierung bzw. Nutzung gültigen AGB.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 2 Leistungsbeschreibung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Fintutto Portal bietet folgende Dienste an:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>7 Vermieter-Rechner (Kaution, Mieterhöhung, Kaufnebenkosten, Eigenkapital, Grundsteuer, Rendite, Nebenkosten)</li>
                <li>10 Mieter-Checker (Mietpreisbremse, Mieterhöhung, Nebenkosten, Betriebskosten, Kündigung, Kaution, Mietminderung, Eigenbedarf, Modernisierung, Schönheitsreparaturen)</li>
                <li>10 Formular-Vorlagen (Mietvertrag, Übergabeprotokoll, Mieterhöhung, etc.)</li>
                <li>Credit-basiertes Nutzungssystem mit verschiedenen Abonnement-Stufen</li>
              </ul>
              <p>
                (2) Die Ergebnisse der Rechner und Checker basieren auf den zum Zeitpunkt der Programmierung
                geltenden gesetzlichen Regelungen. Der Anbieter bemüht sich um Aktualität, übernimmt aber
                keine Gewähr für die Vollständigkeit und Richtigkeit.
              </p>
              <p>
                (3) Die Tools ersetzen keine professionelle Rechtsberatung durch einen zugelassenen Rechtsanwalt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 3 Registrierung und Nutzerkonto</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Für die vollständige Nutzung der Plattform ist eine Registrierung erforderlich.
                Bestimmte Tools können auch ohne Registrierung im Rahmen des kostenlosen Tarifs genutzt werden.
              </p>
              <p>
                (2) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen
                und seine Zugangsdaten vertraulich zu behandeln.
              </p>
              <p>
                (3) Jede Person darf nur ein Nutzerkonto anlegen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 4 Credit-System und Abonnements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Die Nutzung der Tools erfolgt über ein Credit-System. Jede Aktion verbraucht
                je nach Typ 1-3 Credits:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Checker-Nutzung: 1 Credit</li>
                <li>Rechner-Nutzung: 1 Credit</li>
                <li>Standard-Formulare: 2 Credits</li>
                <li>Premium-Formulare: 3 Credits</li>
                <li>PDF-Export: 1 Credit zusätzlich</li>
              </ul>
              <p>
                (2) Verfügbare Tarife:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Kostenlos:</strong> 3 Credits/Monat, kein Speichern</li>
                <li><strong>Mieter:</strong> 15 Credits/Monat, Speichern & PDF-Export</li>
                <li><strong>Vermieter:</strong> 20 Credits/Monat, Speichern & PDF-Export</li>
                <li><strong>Kombi Pro:</strong> 50 Credits/Monat, alle Funktionen</li>
                <li><strong>Unlimited:</strong> Unbegrenzte Credits, alle Funktionen</li>
              </ul>
              <p>
                (3) Nicht verbrauchte Credits verfallen am Ende des Abrechnungszeitraums und werden nicht übertragen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 5 Preise und Zahlung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Die aktuell gültigen Preise sind auf der Preisseite des Portals einsehbar.
                Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
              </p>
              <p>
                (2) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es werden
                gängige Zahlungsmethoden (Kreditkarte, SEPA-Lastschrift) akzeptiert.
              </p>
              <p>
                (3) Bei Jahresabonnements gewähren wir einen Rabatt von 20% gegenüber der monatlichen Zahlung.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 6 Kündigung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Kostenpflichtige Abonnements können jederzeit zum Ende des aktuellen
                Abrechnungszeitraums gekündigt werden.
              </p>
              <p>
                (2) Nach Kündigung eines kostenpflichtigen Abonnements wird das Konto automatisch
                auf den kostenlosen Tarif herabgestuft. Gespeicherte Berechnungen bleiben erhalten,
                können jedoch nicht mehr bearbeitet werden, wenn das Speicherlimit des kostenlosen
                Tarifs überschritten ist.
              </p>
              <p>
                (3) Die Kündigung kann über die Kontoeinstellungen oder per E-Mail an
                kuendigung@fintutto.de erfolgen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 7 Haftungsausschluss</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Die Ergebnisse der Rechner und Checker dienen ausschließlich der Information
                und stellen keine Rechtsberatung dar. Der Anbieter haftet nicht für Schäden, die
                aus der Verwendung der Ergebnisse entstehen.
              </p>
              <p>
                (2) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens,
                des Körpers oder der Gesundheit, die auf einer Pflichtverletzung des Anbieters beruhen.
              </p>
              <p>
                (3) Im Übrigen haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 8 Datenschutz</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß unserer{' '}
                <Link to="/datenschutz" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 9 Referral-Programm</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Registrierte Nutzer können über das Referral-Programm andere Personen einladen.
              </p>
              <p>
                (2) Für jede erfolgreiche Empfehlung (Abschluss eines kostenpflichtigen Abonnements)
                erhält der Empfehlende 15 Bonus-Credits und einen kostenlosen Monat.
              </p>
              <p>
                (3) Die geworbene Person erhält 20% Rabatt auf den ersten Monat.
              </p>
              <p>
                (4) Missbrauch des Referral-Programms (z.B. durch Selbstempfehlungen) führt zum
                Ausschluss aus dem Programm.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>§ 10 Schlussbestimmungen</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                (1) Es gilt das Recht der Bundesrepublik Deutschland.
              </p>
              <p>
                (2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit
                der übrigen Bestimmungen unberührt.
              </p>
              <p>
                (3) Gerichtsstand ist Berlin, sofern der Nutzer Kaufmann ist.
              </p>
              <p className="mt-4 text-xs">Stand: Februar 2026</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
