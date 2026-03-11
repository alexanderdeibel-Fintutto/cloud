import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, Mail, MapPin, Globe, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import LegalFooter from '@/components/LegalFooter'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brain flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Impressum</h1>
            <p className="text-sm text-muted-foreground">Angaben gemäß § 5 TMG / § 25 MedienG</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Company Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Angaben zum Unternehmen
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-base">Fintutto UG (haftungsbeschränkt)</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p>Musterstraße 1</p>
                    <p>1010 Wien</p>
                    <p>Österreich</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Geschäftsführer</p>
                    <p className="font-medium">Alexander Deibel</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Firmenbuchnummer</p>
                    <p className="font-medium">FN XXXXXX z</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Firmenbuchgericht</p>
                    <p className="font-medium">Handelsgericht Wien</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">UID-Nummer</p>
                    <p className="font-medium">ATU XXXXXXXX</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Kontakt</h2>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href="mailto:kontakt@fintutto.com" className="text-primary hover:underline">kontakt@fintutto.com</a>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href="https://fintutto.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.fintutto.com</a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Aufsichtsbehörde</h2>
              <p className="text-sm text-muted-foreground">
                Magistratisches Bezirksamt des I. Bezirkes, Wien
              </p>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Streitschlichtung</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Haftung für Inhalte</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                  Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                  Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                  Tätigkeit hinweisen.
                </p>
                <p>
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                  allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
                  erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                  Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Copyright */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Urheberrecht</h2>
              <p className="text-sm text-muted-foreground">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede
                Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground mt-8 text-center">
          Stand: März 2026
        </p>
      </div>

      <LegalFooter />
    </div>
  )
}
