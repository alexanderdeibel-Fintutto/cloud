import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ImpressumPage() {
  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Impressum</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Angaben gemäß § 5 TMG</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Fintutto UG (haftungsbeschränkt)</p>
          <p>E-Mail: info@fintutto.de</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Haftungsausschluss</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Übersetzungen:</strong> Die bereitgestellten Übersetzungen werden maschinell erstellt und dienen nur zur Orientierung. Für rechtsverbindliche Übersetzungen wende dich bitte an einen vereidigten Übersetzer.</p>
          <p><strong>Haftung für Inhalte:</strong> Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Bei Fragen zur App oder zum Datenschutz erreichst du uns unter:</p>
          <p className="mt-2">E-Mail: info@fintutto.de</p>
        </CardContent>
      </Card>
    </div>
  )
}
