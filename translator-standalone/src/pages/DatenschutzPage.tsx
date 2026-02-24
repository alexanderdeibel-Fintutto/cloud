import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function DatenschutzPage() {
  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Verantwortlicher</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Fintutto UG (haftungsbeschränkt)</p>
          <p>Kontakt: datenschutz@fintutto.de</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Datenverarbeitung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Übersetzungen:</strong> Eingegebene Texte werden an Google Cloud Translation API übermittelt, um die Übersetzung durchzuführen. Google verarbeitet diese Daten gemäß der Google Cloud Datenschutzrichtlinie.</p>
          <p><strong>Sprachausgabe:</strong> Texte werden an Google Cloud Text-to-Speech API übermittelt, um die Sprachausgabe zu erzeugen.</p>
          <p><strong>Spracheingabe:</strong> Bei Nutzung der Mikrofon-Funktion werden Audiodaten über die Web Speech API des Browsers verarbeitet. Bei Nutzung des Offline-Modus (Whisper) erfolgt die Verarbeitung vollständig auf deinem Gerät.</p>
          <p><strong>Live-Sessions:</strong> Für Echtzeit-Übersetzungssitzungen nutzen wir Supabase Realtime. Übertragene Texte werden nicht dauerhaft gespeichert.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Lokale Datenspeicherung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Folgende Daten werden ausschließlich lokal auf deinem Gerät gespeichert:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Übersetzungsverlauf (localStorage)</li>
            <li>Übersetzungs-Cache (IndexedDB, 30 Tage)</li>
            <li>Sprachausgabe-Cache (IndexedDB)</li>
            <li>Heruntergeladene Offline-Sprachmodelle (IndexedDB)</li>
            <li>Einstellungen wie Dark Mode und Sprachpräferenzen (localStorage)</li>
          </ul>
          <p>Diese Daten werden nicht an unsere Server übermittelt. Du kannst sie jederzeit in den Einstellungen der App löschen.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Drittanbieter-Dienste</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Google Cloud Translation API</strong> — Übersetzung von Texten</li>
            <li><strong>Google Cloud Text-to-Speech API</strong> — Sprachausgabe</li>
            <li><strong>Supabase</strong> — Echtzeit-Kommunikation für Live-Sessions</li>
            <li><strong>Vercel</strong> — Hosting der Web-Applikation</li>
            <li><strong>Google Fonts</strong> — Schriftarten (Inter)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">5. Deine Rechte</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten. Da wir keine personenbezogenen Daten auf unseren Servern speichern, betreffen diese Rechte primär die Drittanbieter-Dienste.</p>
          <p>Kontakt: datenschutz@fintutto.de</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Stand: Februar 2026</p>
    </div>
  )
}
