import { Languages, Mic, Volume2, History, Globe, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Languages,
    title: 'Über 22 Sprachen',
    description: 'Übersetze zwischen Deutsch, Englisch, Französisch, Spanisch, Italienisch, Türkisch, Arabisch, Chinesisch und vielen weiteren Sprachen.',
  },
  {
    icon: Mic,
    title: 'Spracheingabe',
    description: 'Diktiere deinen Text per Mikrofon. Die Spracheingabe erkennt automatisch die gewählte Quellsprache.',
  },
  {
    icon: Volume2,
    title: 'Sprachausgabe',
    description: 'Lasse dir den Originaltext oder die Übersetzung vorlesen. Ideal zum Üben der Aussprache.',
  },
  {
    icon: History,
    title: 'Übersetzungsverlauf',
    description: 'Deine letzten Übersetzungen werden lokal gespeichert. Greife schnell auf frühere Übersetzungen zu.',
  },
  {
    icon: Globe,
    title: 'Kostenlos & ohne Anmeldung',
    description: 'Nutze den Übersetzer komplett kostenlos und ohne Registrierung. Sofort loslegen.',
  },
  {
    icon: Shield,
    title: 'Datenschutz',
    description: 'Der Übersetzungsverlauf wird nur lokal in deinem Browser gespeichert. Keine Daten werden auf unseren Servern gespeichert.',
  },
]

export default function InfoPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Über <span className="gradient-text-translator">Fintutto Translator</span>
        </h1>
        <p className="text-muted-foreground">
          Der kostenlose Online-Übersetzer für den Alltag, Behördengänge und die Wohnungssuche in Deutschland.
          Mit Spracheingabe und Sprachausgabe für barrierefreie Kommunikation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(feature => (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg gradient-translator flex items-center justify-center mb-2">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unterstützte Sprachen</CardTitle>
          <CardDescription>
            Aktuell werden 22 Sprachen unterstützt, mit Fokus auf in Deutschland häufig benötigte Sprachen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              '\uD83C\uDDE9\uD83C\uDDEA Deutsch', '\uD83C\uDDEC\uD83C\uDDE7 Englisch', '\uD83C\uDDEB\uD83C\uDDF7 Französisch', '\uD83C\uDDEA\uD83C\uDDF8 Spanisch',
              '\uD83C\uDDEE\uD83C\uDDF9 Italienisch', '\uD83C\uDDF5\uD83C\uDDF9 Portugiesisch', '\uD83C\uDDF3\uD83C\uDDF1 Niederländisch', '\uD83C\uDDF5\uD83C\uDDF1 Polnisch',
              '\uD83C\uDDF9\uD83C\uDDF7 Türkisch', '\uD83C\uDDF7\uD83C\uDDFA Russisch', '\uD83C\uDDFA\uD83C\uDDE6 Ukrainisch', '\uD83C\uDDF8\uD83C\uDDE6 Arabisch',
              '\uD83C\uDDE8\uD83C\uDDF3 Chinesisch', '\uD83C\uDDEF\uD83C\uDDF5 Japanisch', '\uD83C\uDDF0\uD83C\uDDF7 Koreanisch', '\uD83C\uDDEE\uD83C\uDDF3 Hindi',
              '\uD83C\uDDF8\uD83C\uDDEA Schwedisch', '\uD83C\uDDE9\uD83C\uDDF0 Dänisch', '\uD83C\uDDE8\uD83C\uDDFF Tschechisch', '\uD83C\uDDF7\uD83C\uDDF4 Rumänisch',
              '\uD83C\uDDEC\uD83C\uDDF7 Griechisch', '\uD83C\uDDED\uD83C\uDDFA Ungarisch',
            ].map(lang => (
              <div key={lang} className="text-sm px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
                {lang}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teil des Fintutto-Ökosystems</CardTitle>
          <CardDescription>
            Fintutto Translator ist Teil der Fintutto-Plattform für Finanzen, Immobilien und Verwaltung in Deutschland.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Fintutto Portal</strong> - Rechner, Checker & Formulare
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Vermietify</strong> - Immobilienverwaltung
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Ablesung</strong> - Zählerablesung & Energie
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>BescheidBoxer</strong> - Steuerbescheid-Prüfung
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
