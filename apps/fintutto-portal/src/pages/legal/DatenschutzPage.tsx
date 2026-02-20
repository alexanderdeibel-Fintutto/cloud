import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, Lock, Trash2, Users, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatenschutzPage() {
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Datenschutzerklärung</h1>
              <p className="text-white/80">Informationen zum Schutz Ihrer Daten</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-3xl space-y-6">
          {/* Overview */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">SSL-verschlüsselt</p>
                </div>
                <div>
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">DSGVO-konform</p>
                </div>
                <div>
                  <Database className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">EU-Server</p>
                </div>
                <div>
                  <Trash2 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">Löschrecht</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Verantwortlicher</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Verantwortlich für die Datenverarbeitung auf dieser Website:</p>
              <p className="font-medium text-foreground">Fintutto GmbH</p>
              <p>Musterstraße 42, 10115 Berlin</p>
              <p>E-Mail: datenschutz@fintutto.de</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                2. Erhebung und Speicherung personenbezogener Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.1 Beim Besuch der Website</h4>
                <p>
                  Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden
                  Browser automatisch Informationen an den Server unserer Website gesendet. Diese Informationen
                  werden temporär in einem sog. Logfile gespeichert:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>IP-Adresse des anfragenden Rechners</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Name und URL der abgerufenen Datei</li>
                  <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                  <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">2.2 Bei Registrierung / Nutzung unserer Tools</h4>
                <p>Bei der Registrierung und Nutzung unserer Rechner, Checker und Formulare erheben wir:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>E-Mail-Adresse</li>
                  <li>Gewählter Tarif / Abonnement-Details</li>
                  <li>Nutzungsdaten (Credits-Verbrauch, gespeicherte Berechnungen)</li>
                  <li>Von Ihnen eingegebene Berechnungsdaten (z.B. Mietpreise, Wohnflächen)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                3. Zweck der Datenverarbeitung
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bereitstellung unserer Rechner, Checker und Formulare (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Verwaltung Ihres Benutzerkontos und Abonnements (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Zahlungsabwicklung über Stripe (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Speicherung Ihrer Berechnungsergebnisse (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Sicherstellung der IT-Sicherheit (Art. 6 Abs. 1 lit. f DSGVO)</li>
                <li>Verbesserung unseres Angebots durch anonymisierte Nutzungsanalysen (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                4. Weitergabe von Daten an Dritte
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Eine Übermittlung Ihrer persönlichen Daten an Dritte findet nur statt, wenn:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sie ausdrücklich eingewilligt haben (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Dies zur Abwicklung von Vertragsverhältnissen erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Eine gesetzliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO)</li>
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-2">Eingesetzte Dienstleister:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supabase</strong> (Backend & Datenbank) - Server in der EU (Frankfurt)</li>
                  <li><strong>Stripe</strong> (Zahlungsabwicklung) - Zertifiziert nach PCI DSS Level 1</li>
                  <li><strong>Vercel</strong> (Hosting) - Server in der EU</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                5. Ihre Rechte
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Sie haben jederzeit das Recht auf:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Auskunft</strong> über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
                <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
                <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
                <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
                <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
                <li><strong>Widerruf</strong> erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
              <p className="mt-3">
                Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: datenschutz@fintutto.de
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die Ihr
                Browser automatisch erstellt und auf Ihrem Endgerät speichert.
              </p>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Notwendige Cookies:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Session-Cookie für die Authentifizierung (Supabase Auth)</li>
                  <li>Sprach- und Einstellungspräferenzen</li>
                </ul>
              </div>
              <p>
                Sie können Ihre Browser-Einstellung ändern, um das Setzen von Cookies zu deaktivieren.
                Bereits gespeicherte Cookies können jederzeit gelöscht werden.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Datensicherheit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Wir verwenden SSL- bzw. TLS-Verschlüsselung für die Sicherheit Ihrer Daten. Unsere
                Datenbank verwendet Row-Level Security (RLS), sodass jeder Nutzer nur seine eigenen
                Daten einsehen kann. Alle Server befinden sich in der EU.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Aktualität dieser Datenschutzerklärung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Februar 2026.
                Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher bzw.
                behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
