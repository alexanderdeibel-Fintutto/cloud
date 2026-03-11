import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import LegalFooter from '@/components/LegalFooter'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>
            <p className="text-sm text-muted-foreground">gemäß DSGVO & DSG 2018</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="1. Verantwortlicher">
            <p>
              <strong>Fintutto UG (haftungsbeschränkt)</strong><br />
              Musterstraße 1, 1010 Wien, Österreich<br />
              E-Mail: <a href="mailto:datenschutz@fintutto.com" className="text-primary hover:underline">datenschutz@fintutto.com</a><br />
              Geschäftsführer: Alexander Deibel
            </p>
          </Section>

          <Section title="2. Überblick der Verarbeitungen">
            <p>
              Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer
              Verarbeitung zusammen und verweist auf die betroffenen Personen.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Bestandsdaten (z.B. Namen, E-Mail-Adressen)</li>
              <li>Inhaltsdaten (z.B. hochgeladene Dokumente, Texteingaben im Chat)</li>
              <li>Nutzungsdaten (z.B. besuchte Seiten, Zugriffszeiten)</li>
              <li>Meta-/Kommunikationsdaten (z.B. IP-Adressen, Geräteinformationen)</li>
            </ul>
          </Section>

          <Section title="3. Rechtsgrundlagen">
            <p>Im Folgenden erhalten Sie eine Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir personenbezogene Daten verarbeiten:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a DSGVO)</strong> — Die betroffene Person hat ihre Einwilligung in die Verarbeitung gegeben.</li>
              <li><strong>Vertragserfüllung (Art. 6 Abs. 1 S. 1 lit. b DSGVO)</strong> — Die Verarbeitung ist für die Erfüllung eines Vertrags erforderlich.</li>
              <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f DSGVO)</strong> — Die Verarbeitung ist zur Wahrung berechtigter Interessen erforderlich.</li>
            </ul>
          </Section>

          <Section title="4. Erhebung und Speicherung personenbezogener Daten">
            <h4 className="font-medium mt-2 mb-1">4.1 Registrierung und Konto</h4>
            <p>Bei der Registrierung erheben wir:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt gespeichert via Supabase Auth)</li>
            </ul>
            <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>

            <h4 className="font-medium mt-4 mb-1">4.2 Dokumenten-Upload und KI-Analyse</h4>
            <p>
              Wenn du Dokumente hochlädst, werden diese in einem sicheren Cloud-Speicher (Supabase Storage) abgelegt.
              Die KI-Analyse (OCR, Kategorisierung) erfolgt serverseitig. Dabei werden folgende Daten verarbeitet:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Dokumenteninhalt (Text, Bilder)</li>
              <li>Extrahierte Metadaten (Absender, Beträge, Fristen, Dokumenttyp)</li>
              <li>KI-generierte Zusammenfassungen</li>
            </ul>
            <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>

            <h4 className="font-medium mt-4 mb-1">4.3 KI-Chat</h4>
            <p>
              Nachrichten im KI-Chat werden verarbeitet, um dir Antworten zu deinen Dokumenten zu geben.
              Chat-Verläufe werden in deinem Konto gespeichert und können jederzeit gelöscht werden.
            </p>

            <h4 className="font-medium mt-4 mb-1">4.4 Aktivitätsprotokoll</h4>
            <p>
              Wir protokollieren deine Aktionen (Dokumentenansichten, Uploads, Statusänderungen) zur Darstellung
              im Verlauf. Das Protokoll kann jederzeit in den Einstellungen gelöscht werden.
            </p>
          </Section>

          <Section title="5. Datenweitergabe an Dritte">
            <p>
              Eine Übermittlung deiner persönlichen Daten an Dritte zu anderen als den im Folgenden
              aufgeführten Zwecken findet nicht statt.
            </p>
            <h4 className="font-medium mt-2 mb-1">Auftragsverarbeiter:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase Inc.</strong> — Hosting, Datenbank, Authentifizierung, Dateispeicher (Sitz: USA, EU-Standardvertragsklauseln)</li>
              <li><strong>Anthropic / OpenAI</strong> — KI-Textanalyse und OCR-Verarbeitung (Sitz: USA, EU-Standardvertragsklauseln)</li>
              <li><strong>Vercel Inc.</strong> — Website-Hosting und CDN (Sitz: USA, EU-Standardvertragsklauseln)</li>
            </ul>
          </Section>

          <Section title="6. Datensicherheit">
            <p>
              Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL/TLS-Verfahren in Verbindung
              mit der jeweils höchsten Verschlüsselungsstufe, die von deinem Browser unterstützt wird.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
              <li>Row-Level-Security (RLS) in der Datenbank — nur du hast Zugriff auf deine Daten</li>
              <li>Verschlüsselte Passwortspeicherung (bcrypt)</li>
              <li>Regelmäßige Sicherheits-Updates</li>
            </ul>
          </Section>

          <Section title="7. Cookies und lokale Speicherung">
            <p>
              SecondBrain verwendet <strong>keine Tracking-Cookies</strong> und keine Analyse-Tools von Drittanbietern.
            </p>
            <p className="mt-2">Wir nutzen ausschließlich:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>localStorage</strong> — Für Benutzereinstellungen (Theme, Benachrichtigungen, Quick Notes, gespeicherte Suchen). Diese Daten verlassen nie deinen Browser.</li>
              <li><strong>Session-Token</strong> — Für die Authentifizierung (Supabase Auth Session).</li>
            </ul>
          </Section>

          <Section title="8. Deine Rechte">
            <p>Du hast das Recht:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>gemäß Art. 15 DSGVO <strong>Auskunft</strong> über deine verarbeiteten personenbezogenen Daten zu verlangen</li>
              <li>gemäß Art. 16 DSGVO unverzüglich die <strong>Berichtigung</strong> unrichtiger Daten zu verlangen</li>
              <li>gemäß Art. 17 DSGVO die <strong>Löschung</strong> deiner gespeicherten Daten zu verlangen</li>
              <li>gemäß Art. 18 DSGVO die <strong>Einschränkung der Verarbeitung</strong> zu verlangen</li>
              <li>gemäß Art. 20 DSGVO deine Daten in einem strukturierten Format zu erhalten (<strong>Datenübertragbarkeit</strong>)</li>
              <li>gemäß Art. 7 Abs. 3 DSGVO deine einmal erteilte <strong>Einwilligung jederzeit zu widerrufen</strong></li>
              <li>gemäß Art. 77 DSGVO sich bei einer <strong>Aufsichtsbehörde zu beschweren</strong></li>
            </ul>
            <p className="mt-3">
              <strong>Datenexport:</strong> Du kannst jederzeit alle deine Daten über die Einstellungen als JSON, CSV oder Markdown exportieren.
            </p>
            <p className="mt-2">
              <strong>Datenlöschung:</strong> Du kannst in den Einstellungen jederzeit alle deine Daten unwiderruflich löschen.
            </p>
          </Section>

          <Section title="9. Speicherdauer">
            <p>
              Deine Daten werden so lange gespeichert, wie dein Konto aktiv ist. Nach Löschung deines Kontos
              werden alle personenbezogenen Daten innerhalb von 30 Tagen vollständig gelöscht.
            </p>
            <p className="mt-2">
              Die in den Einstellungen verfügbare Funktion „Alle Daten löschen" entfernt sofort alle
              Dokumente, Sammlungen, Chat-Verläufe und Aktivitätsprotokolle.
            </p>
          </Section>

          <Section title="10. Aufsichtsbehörde">
            <p>
              Zuständige Aufsichtsbehörde für den Datenschutz:
            </p>
            <p className="mt-2">
              <strong>Österreichische Datenschutzbehörde</strong><br />
              Barichgasse 40-42, 1030 Wien<br />
              Telefon: +43 1 52 152-0<br />
              E-Mail: dsb@dsb.gv.at<br />
              Website: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.dsb.gv.at</a>
            </p>
          </Section>

          <Section title="11. Änderungen dieser Datenschutzerklärung">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
              rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
              Datenschutzerklärung umzusetzen. Für deinen erneuten Besuch gilt dann die neue Datenschutzerklärung.
            </p>
          </Section>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Stand: März 2026
        </p>
      </div>

      <LegalFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
