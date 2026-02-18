import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const values = [
  {
    title: 'Transparenz',
    description: 'Mietrecht ist komplex – wir machen es verständlich. Unsere Tools liefern klare Ergebnisse statt juristischem Fachjargon.',
  },
  {
    title: 'Fairness',
    description: 'Wir stehen auf beiden Seiten. Mieter und Vermieter verdienen gleichermaßen Zugang zu guten Werkzeugen.',
  },
  {
    title: 'Einfachheit',
    description: 'Kein Studium nötig. Unsere Rechner, Checker und Formulare sind so gebaut, dass jeder sie nutzen kann.',
  },
  {
    title: 'Datenschutz',
    description: 'Deine Daten gehören dir. Wir speichern nur das Nötigste und setzen auf europäische Infrastruktur.',
  },
]

export default function UeberUnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-4">Über Fintutto</h1>
      <p className="text-lg text-muted-foreground mb-10">
        Digitale Werkzeuge für Mieter und Vermieter – einfach, fair und transparent.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Unsere Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Mietrecht betrifft Millionen von Menschen in Deutschland, aber die meisten fühlen sich
          damit überfordert. Fintutto wurde gegründet, um das zu ändern. Wir bauen digitale
          Werkzeuge, die komplexe mietrechtliche Fragen in wenigen Klicks beantworten – für
          Mieter und Vermieter gleichermaßen.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          Mit 7 Rechnern, 10 Checkern, 10 Formularen und einem wachsenden Ökosystem aus
          spezialisierten Apps decken wir die wichtigsten Bereiche des deutschen Mietrechts ab.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Unsere Werte</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v) => (
            <Card key={v.title}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Das Fintutto-Ökosystem</h2>
        <p className="text-muted-foreground leading-relaxed">
          Fintutto ist mehr als nur ein Portal. Wir entwickeln 6 spezialisierte Apps, die
          zusammen das gesamte Spektrum der Immobilienverwaltung abdecken – von der
          Nebenkostenabrechnung über die Zählerablesung bis hin zur Vermietung.
        </p>
        <Link to="/apps">
          <Button variant="outline" className="mt-4">
            Alle Apps entdecken <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
        <p className="text-muted-foreground">
          Fragen, Feedback oder Partnerschaften?<br />
          Schreib uns an{' '}
          <a href="mailto:info@fintutto.de" className="text-primary hover:underline">
            info@fintutto.de
          </a>
        </p>
      </section>
    </div>
  )
}
