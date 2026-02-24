import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, Phone, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ImpressumPage() {
  return (
    <div>
      <section className="gradient-portal py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Startseite
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Impressum</h1>
          <p className="text-white/80 mt-1">Angaben gemäß § 5 TMG</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Anbieter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Fintutto GmbH</p>
                <p className="text-muted-foreground">Musterstraße 42</p>
                <p className="text-muted-foreground">10115 Berlin</p>
                <p className="text-muted-foreground">Deutschland</p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>kontakt@fintutto.de</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+49 30 12345678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>www.fintutto.de</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vertretungsberechtigte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Geschäftsführer: Alexander Deibel</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registereintrag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Eintragung im Handelsregister</p>
              <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
              <p>Registernummer: HRB XXXXXX</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Umsatzsteuer-ID</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
              </p>
              <p className="font-medium text-foreground mt-1">DE XXXXXXXXX</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verantwortlich für den Inhalt</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</p>
              <p className="mt-2">Alexander Deibel</p>
              <p>Musterstraße 42</p>
              <p>10115 Berlin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streitschlichtung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                https://ec.europa.eu/consumers/odr/
              </p>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Haftung für Inhalte</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                Tätigkeit hinweisen.
              </p>
              <p>
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
                erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
                umgehend entfernen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Haftung für Links</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
                der Seiten verantwortlich.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Urheberrecht</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
