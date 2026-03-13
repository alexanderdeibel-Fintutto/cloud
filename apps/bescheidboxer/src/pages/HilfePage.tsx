import { useState } from 'react'
import { Search, BookOpen, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

interface GlossarEntry {
  term: string
  short: string
  detail: string
  kategorie: 'grundlagen' | 'bescheid' | 'einspruch' | 'fristen' | 'steuern'
}

const GLOSSAR: GlossarEntry[] = [
  {
    term: 'Steuerbescheid',
    short: 'Offizielle Mitteilung des Finanzamts ueber die festgesetzte Steuer.',
    detail: 'Ein Steuerbescheid ist ein Verwaltungsakt, in dem das Finanzamt die Hoehe Ihrer Steuerschuld festsetzt. Er basiert auf Ihrer Steuererklaerung und den Pruefungen des Finanzamts. Wenn die festgesetzte Steuer von Ihrer Berechnung abweicht, koennen Sie innerhalb der Einspruchsfrist Einspruch einlegen.',
    kategorie: 'grundlagen',
  },
  {
    term: 'Einspruch',
    short: 'Rechtsbehelf gegen einen fehlerhaften Steuerbescheid.',
    detail: 'Ein Einspruch ist ein foermlicher Rechtsbehelf, mit dem Sie sich gegen einen Steuerbescheid wehren koennen. Er muss schriftlich beim zustaendigen Finanzamt innerhalb eines Monats nach Bekanntgabe des Bescheids eingereicht werden. Der Einspruch ist kostenfrei und fuehrt zu einer nochmaligen Pruefung des gesamten Bescheids. Wichtig: Im schlimmsten Fall kann die Steuer auch hoeher ausfallen (Verboserung).',
    kategorie: 'einspruch',
  },
  {
    term: 'Einspruchsfrist',
    short: 'Ein Monat nach Bekanntgabe des Bescheids.',
    detail: 'Die Einspruchsfrist betraegt einen Monat nach Bekanntgabe des Steuerbescheids. Die Bekanntgabe gilt in der Regel drei Tage nach Aufgabe zur Post (Dreitagesfiktion, § 122 AO). Bei elektronischer Uebermittlung gilt der dritte Tag nach Absendung. Faellt das Fristende auf einen Samstag, Sonntag oder Feiertag, verlaengert sich die Frist auf den naechsten Werktag.',
    kategorie: 'fristen',
  },
  {
    term: 'Festgesetzte Steuer',
    short: 'Der vom Finanzamt berechnete Steuerbetrag.',
    detail: 'Die festgesetzte Steuer ist der Betrag, den das Finanzamt nach Pruefung Ihrer Steuererklaerung als geschuldete Steuer berechnet hat. Dieser Betrag kann von Ihrer eigenen Berechnung oder Erwartung abweichen, z.B. wenn das Finanzamt bestimmte Abzuege nicht anerkannt hat.',
    kategorie: 'bescheid',
  },
  {
    term: 'Aktenzeichen',
    short: 'Eindeutige Kennung Ihres Steuerfalls beim Finanzamt.',
    detail: 'Das Aktenzeichen (auch Steuernummer genannt) ist eine eindeutige Nummer, die Ihrem Steuerfall beim zustaendigen Finanzamt zugeordnet ist. Es besteht in der Regel aus mehreren Zifferngruppen (z.B. 123/456/78901) und muss bei jedem Schriftverkehr mit dem Finanzamt angegeben werden.',
    kategorie: 'grundlagen',
  },
  {
    term: 'Werbungskosten',
    short: 'Ausgaben, die im Zusammenhang mit Ihrem Beruf entstehen.',
    detail: 'Werbungskosten sind alle Aufwendungen, die durch die berufliche Taetigkeit veranlasst sind. Dazu gehoeren z.B. Fahrtkosten zur Arbeit (Pendlerpauschale), Arbeitsmittel, Fortbildungskosten, Reisekosten und Homeoffice-Pauschale. Das Finanzamt erkennt automatisch einen Arbeitnehmer-Pauschbetrag von 1.230 EUR an. Liegen Ihre tatsaechlichen Werbungskosten hoeher, sollten Sie diese einzeln nachweisen.',
    kategorie: 'steuern',
  },
  {
    term: 'Sonderausgaben',
    short: 'Bestimmte private Aufwendungen, die steuerlich absetzbar sind.',
    detail: 'Sonderausgaben sind gesetzlich definierte private Ausgaben, die Ihre Steuerlast mindern. Dazu gehoeren z.B. Beitraege zur Kranken- und Pflegeversicherung, Kirchensteuer, Spenden, Beitraege zur Altersvorsorge und Unterhaltsleistungen an geschiedene Ehegatten. Viele Sonderausgaben werden automatisch vom Finanzamt beruecksichtigt.',
    kategorie: 'steuern',
  },
  {
    term: 'Aussergewoehnliche Belastungen',
    short: 'Ungewoehnliche, groessere Kosten aus persoenlichen Gruenden.',
    detail: 'Aussergewoehnliche Belastungen sind zwangslaeufig entstandene Aufwendungen, die groesser sind als bei der ueberwiegenden Mehrzahl der Steuerzahler gleicher Verhaeltnisse. Beispiele: Krankheitskosten (nicht von der Versicherung erstattet), Pflegekosten, Beerdigungskosten, Kosten fuer Hochwasserschaeden. Es gilt eine zumutbare Belastung (Eigenanteil), die abhaengig von Einkommen, Familienstand und Kinderzahl ist.',
    kategorie: 'steuern',
  },
  {
    term: 'Vorsorgeaufwendungen',
    short: 'Beitraege fuer die eigene Absicherung (Rente, Krankenversicherung).',
    detail: 'Vorsorgeaufwendungen umfassen Beitraege zur gesetzlichen Rentenversicherung, berufsstaendischen Versorgung, Rurup-Rente (Basisrente) sowie Beitraege zur Kranken- und Pflegeversicherung. Diese koennen als Sonderausgaben steuermindernd geltend gemacht werden, wobei fuer Altersvorsorgeaufwendungen eine schrittweise Erhoehung des Abzugsanteils gilt.',
    kategorie: 'steuern',
  },
  {
    term: 'Vorbehalt der Nachpruefung',
    short: 'Bescheid kann vom Finanzamt jederzeit geaendert werden.',
    detail: 'Steht ein Bescheid unter dem Vorbehalt der Nachpruefung (§ 164 AO), kann das Finanzamt ihn jederzeit aendern, aufheben oder berichtigen. Dies ist haeufig der Fall, wenn das Finanzamt bestimmte Angaben noch nicht abschliessend pruefen konnte. Fuer Sie als Steuerpflichtigen bedeutet das, dass Sie auch nach Ablauf der Einspruchsfrist noch Aenderungen beantragen koennen.',
    kategorie: 'bescheid',
  },
  {
    term: 'Vorlaeufige Festsetzung',
    short: 'Bestimmte Punkte im Bescheid sind noch offen.',
    detail: 'Bei einer vorlaeufigen Festsetzung (§ 165 AO) ist die Steuerfestsetzung in bestimmten Punkten noch offen. Dies geschieht haeufig, wenn Verfassungsbeschwerden oder Gerichtsverfahren zu bestimmten Steuerfragen anhaengig sind. In den vorlaeufig festgesetzten Punkten koennen Sie von einer positiven Gerichtsentscheidung automatisch profitieren, ohne Einspruch einlegen zu muessen.',
    kategorie: 'bescheid',
  },
  {
    term: 'Verboserung',
    short: 'Im Einspruchsverfahren kann die Steuer auch steigen.',
    detail: 'Verboserung bedeutet, dass das Finanzamt im Rahmen eines Einspruchsverfahrens den gesamten Bescheid erneut prueft und die Steuer auch hoeher festsetzen kann als im urspruenglichen Bescheid. Vor einer Verboserung muss das Finanzamt Sie allerdings darauf hinweisen (§ 367 Abs. 2 AO), und Sie haben die Moeglichkeit, den Einspruch zurueckzunehmen.',
    kategorie: 'einspruch',
  },
  {
    term: 'Aussetzung der Vollziehung (AdV)',
    short: 'Zahlung wird bis zur Entscheidung ueber den Einspruch ausgesetzt.',
    detail: 'Mit einem Antrag auf Aussetzung der Vollziehung koennen Sie erreichen, dass Sie den strittigen Steuerbetrag zunaechst nicht zahlen muessen, bis ueber Ihren Einspruch entschieden ist. Der Antrag muss begruendet werden. Wird dem Einspruch nicht stattgegeben, werden Aussetzungszinsen berechnet (0,5% pro Monat).',
    kategorie: 'einspruch',
  },
  {
    term: 'Dreitagesfiktion',
    short: 'Ein Brief vom Finanzamt gilt drei Tage nach Absendung als zugestellt.',
    detail: 'Die Dreitagesfiktion (§ 122 Abs. 2 AO) besagt, dass ein per Post versandter Verwaltungsakt (z.B. Steuerbescheid) am dritten Tag nach Aufgabe zur Post als bekannt gegeben gilt. Ab diesem Tag beginnt die Einspruchsfrist zu laufen. Wenn der dritte Tag auf einen Samstag, Sonntag oder Feiertag faellt, verschiebt sich die Bekanntgabe auf den naechsten Werktag.',
    kategorie: 'fristen',
  },
  {
    term: 'Steuererklaerung',
    short: 'Ihre jaehrliche Erklaerung gegenueber dem Finanzamt.',
    detail: 'Die Steuererklaerung ist die jaehrliche Erklaerung Ihrer Einnahmen, Ausgaben und persoenlichen Verhaeltnisse gegenueber dem Finanzamt. Auf Basis dieser Erklaerung erstellt das Finanzamt den Steuerbescheid. Arbeitnehmer sind nicht immer zur Abgabe verpflichtet, aber eine freiwillige Abgabe lohnt sich oft, da durchschnittlich ueber 1.000 EUR erstattet werden.',
    kategorie: 'grundlagen',
  },
]

const KATEGORIE_LABELS: Record<GlossarEntry['kategorie'], string> = {
  grundlagen: 'Grundlagen',
  bescheid: 'Steuerbescheid',
  einspruch: 'Einspruch',
  fristen: 'Fristen & Termine',
  steuern: 'Steuerrecht',
}

const KATEGORIE_COLORS: Record<GlossarEntry['kategorie'], string> = {
  grundlagen: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  bescheid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  einspruch: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  fristen: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  steuern: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const FAQ = [
  {
    q: 'Mein Steuerbescheid weicht von meiner Berechnung ab. Was tun?',
    a: 'Vergleichen Sie die einzelnen Positionen im Bescheid mit Ihrer Steuererklaerung. Der Steuer-Bescheidprüfer hilft Ihnen dabei, Abweichungen automatisch zu erkennen. Wenn Abweichungen vorliegen, koennen Sie innerhalb eines Monats Einspruch einlegen.',
  },
  {
    q: 'Wie lange habe ich Zeit fuer einen Einspruch?',
    a: 'Sie haben einen Monat ab Bekanntgabe des Bescheids (in der Regel 3 Tage nach dem Datum auf dem Bescheid). Der Steuer-Bescheidprüfer berechnet die Frist automatisch und erinnert Sie rechtzeitig.',
  },
  {
    q: 'Muss ich einen Steuerberater fuer den Einspruch beauftragen?',
    a: 'Nein, einen Einspruch koennen Sie selbst einlegen. Der Steuer-Bescheidprüfer hilft Ihnen dabei, den Einspruch zu formulieren und als PDF zu erstellen. Bei komplexen Faellen kann es aber sinnvoll sein, einen Steuerberater hinzuzuziehen.',
  },
  {
    q: 'Kann mir durch den Einspruch ein Nachteil entstehen?',
    a: 'Ja, theoretisch kann das Finanzamt im Einspruchsverfahren den Bescheid auch zu Ihren Ungunsten aendern (Verboserung). Sie werden aber vorher gewarnt und koennen den Einspruch dann zuruecknehmen.',
  },
  {
    q: 'Was passiert nach dem Einspruch?',
    a: 'Das Finanzamt prueft Ihren Einspruch. Moegliche Ergebnisse: (1) Stattgabe: Ihr Einspruch wird akzeptiert und der Bescheid geaendert. (2) Teilstattgabe: Nur ein Teil wird anerkannt. (3) Einspruchsentscheidung: Ihr Einspruch wird abgelehnt. Dagegen koennen Sie beim Finanzgericht klagen.',
  },
  {
    q: 'Sind meine Daten beim Steuer-Bescheidprüfer sicher?',
    a: 'Ja. Alle Daten werden verschluesselt uebertragen und in einer sicheren Datenbank mit Zugriffskontrolle gespeichert. Nur Sie haben Zugriff auf Ihre Steuerdaten. Wir geben keine Daten an Dritte weiter.',
  },
]

export default function HilfePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())
  const [expandedFaq, setExpandedFaq] = useState<Set<number>>(new Set())

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => {
      const next = new Set(prev)
      if (next.has(term)) {
        next.delete(term)
      } else {
        next.add(term)
      }
      return next
    })
  }

  const toggleFaq = (idx: number) => {
    setExpandedFaq(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const filteredGlossar = GLOSSAR
    .filter(entry => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          entry.term.toLowerCase().includes(q) ||
          entry.short.toLowerCase().includes(q) ||
          entry.detail.toLowerCase().includes(q)
        )
      }
      return true
    })
    .filter(entry => filterKategorie === 'alle' || entry.kategorie === filterKategorie)

  const filteredFaq = FAQ.filter(item => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hilfe & Glossar</h1>
        <p className="text-muted-foreground mt-1">
          Steuerbegriffe einfach erklaert und haeufige Fragen beantwortet
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Begriff oder Frage suchen..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 text-base"
        />
      </div>

      {/* Kategorie Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterKategorie('alle')}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            filterKategorie === 'alle'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:border-muted-foreground/30'
          }`}
        >
          Alle
        </button>
        {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterKategorie(key)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filterKategorie === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:border-muted-foreground/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Glossar */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Steuer-Glossar</h2>
          <Badge variant="secondary">{filteredGlossar.length} Begriffe</Badge>
        </div>

        <div className="space-y-2">
          {filteredGlossar.map(entry => {
            const expanded = expandedTerms.has(entry.term)
            return (
              <Card key={entry.term}>
                <button
                  onClick={() => toggleTerm(entry.term)}
                  className="w-full text-left"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">{entry.term}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${KATEGORIE_COLORS[entry.kategorie]}`}>
                            {KATEGORIE_LABELS[entry.kategorie]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.short}</p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                    {expanded && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm leading-relaxed">{entry.detail}</p>
                      </div>
                    )}
                  </CardContent>
                </button>
              </Card>
            )
          })}

          {filteredGlossar.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Kein Begriff gefunden</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Haeufige Fragen</h2>
        </div>

        <div className="space-y-2">
          {filteredFaq.map((item, idx) => {
            const expanded = expandedFaq.has(idx)
            return (
              <Card key={idx}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-sm">{item.q}</p>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                    </div>
                    {expanded && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </CardContent>
                </button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Support Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weitere Hilfe benoetigt?</CardTitle>
          <CardDescription>
            Unser Support-Team hilft Ihnen gerne weiter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="mailto:support@fintutto.de"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            support@fintutto.de
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
