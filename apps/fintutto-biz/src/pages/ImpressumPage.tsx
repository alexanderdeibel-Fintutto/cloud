import { Link } from "react-router-dom";
import { Building2, ArrowLeft, Mail, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zurueck zur Startseite
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Impressum</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Angaben gemaess &sect; 5 TMG
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">Unternehmen</h3>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p className="font-semibold text-foreground">Fintutto UG (haftungsbeschraenkt) i.G.</p>
                <p>Musterstrasse 1</p>
                <p>10115 Berlin</p>
                <p>Deutschland</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">Kontakt</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>kontakt@fintutto.de</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>www.fintutto.de</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4">Vertretungsberechtigter Geschaeftsfuehrer</h2>
            <p className="text-muted-foreground">Alexander Deibel</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Registereintrag</h2>
            <p className="text-muted-foreground">
              Eintragung im Handelsregister.<br />
              Registergericht: Amtsgericht Berlin-Charlottenburg<br />
              Registernummer: HRB [wird nach Eintragung ergaenzt]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Umsatzsteuer-Identifikationsnummer</h2>
            <p className="text-muted-foreground">
              Umsatzsteuer-Identifikationsnummer gemaess &sect; 27 a Umsatzsteuergesetz:<br />
              DE [wird nach Vergabe ergaenzt]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Haftungsausschluss</h2>
            <h3 className="text-lg font-semibold mb-2">Haftung fuer Inhalte</h3>
            <p className="text-muted-foreground mb-4">
              Die Inhalte unserer Seiten wurden mit groesster Sorgfalt erstellt. Fuer die Richtigkeit, Vollstaendigkeit und Aktualitaet der Inhalte koennen wir jedoch keine Gewaehr uebernehmen. Als Diensteanbieter sind wir gemaess &sect; 7 Abs. 1 TMG fuer eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>

            <h3 className="text-lg font-semibold mb-2">Haftung fuer Links</h3>
            <p className="text-muted-foreground mb-4">
              Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb koennen wir fuer diese fremden Inhalte auch keine Gewaehr uebernehmen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Hinweis zu Fintutto Biz</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <p className="text-muted-foreground">
                Fintutto Biz ist eine Buchhaltungs- und Rechnungssoftware fuer Selbststaendige und kleine Unternehmen. Die Plattform ersetzt <strong>keine steuerliche Beratung</strong> durch zugelassene Steuerberater. Fuer steuerliche Fragestellungen empfehlen wir die Konsultation eines qualifizierten Steuerberaters.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Urheberrecht</h2>
            <p className="text-muted-foreground">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfaeltigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes beduerfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europaeische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <p className="text-sm text-muted-foreground italic">Stand: Maerz 2026</p>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-border">
            <Link to="/datenschutz" className="text-primary hover:underline text-sm">Datenschutzerklaerung</Link>
            <Link to="/agb" className="text-primary hover:underline text-sm">AGB</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
