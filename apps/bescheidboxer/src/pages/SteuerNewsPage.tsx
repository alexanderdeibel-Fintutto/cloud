import { useState } from 'react'
import { Card } from '../components/ui/card'
import { Newspaper, Clock, Tag, ChevronDown, ChevronRight, ExternalLink, Bookmark, BookmarkCheck, Bell } from 'lucide-react'

interface SteuerNews {
  id: string
  titel: string
  zusammenfassung: string
  inhalt: string
  kategorie: string
  datum: string
  quelle: string
  wichtig: boolean
}

const NEWS_KATEGORIEN = ['Gesetzgebung', 'Grundsteuer', 'Einkommensteuer', 'Rechtsprechung', 'Digitalisierung', 'Immobilien']

const DEMO_NEWS: SteuerNews[] = [
  {
    id: 'n-1',
    titel: 'Grundsteuer 2026: Erste Kommunen passen Hebesätze erneut an',
    zusammenfassung: 'Mehrere Städte in NRW und Hessen kündigen Hebesatz-Anpassungen für Mitte 2026 an.',
    inhalt: 'Nach der Grundsteuerreform zum 01.01.2025 haben zahlreiche Kommunen ihre Hebesätze zunächst aufkommensneutral angepasst. Nun zeigt sich, dass einige Städte nachsteuern: Köln prüft eine Erhöhung um 15%, während Düsseldorf den Hebesatz stabil halten will. Eigentümer sollten ihre Grundsteuerbescheide genau prüfen und ggf. Einspruch einlegen, wenn der Grundsteuerwert fehlerhaft berechnet wurde.',
    kategorie: 'Grundsteuer', datum: '2026-02-15', quelle: 'Haufe Steuer News', wichtig: true,
  },
  {
    id: 'n-2',
    titel: 'BFH-Urteil: Homeoffice-Pauschale auch bei gemischter Nutzung',
    zusammenfassung: 'Der Bundesfinanzhof bestätigt die Homeoffice-Pauschale auch ohne separates Arbeitszimmer.',
    inhalt: 'In einem aktuellen Urteil hat der BFH klargestellt, dass die Homeoffice-Pauschale von 6 € pro Tag (max. 1.260 €/Jahr) auch dann geltend gemacht werden kann, wenn kein separates Arbeitszimmer vorhanden ist. Voraussetzung bleibt, dass die berufliche Tätigkeit überwiegend in der häuslichen Wohnung ausgeübt wird. Dies betrifft Millionen von Arbeitnehmern im Homeoffice.',
    kategorie: 'Rechtsprechung', datum: '2026-02-12', quelle: 'BFH Pressemitteilung', wichtig: true,
  },
  {
    id: 'n-3',
    titel: 'Steuererklärung 2025: Abgabefrist für Berater verlängert',
    zusammenfassung: 'Die Abgabefrist für steuerlich beratene Steuerpflichtige wird um 2 Monate verlängert.',
    inhalt: 'Das Bundesfinanzministerium hat eine Verlängerung der Abgabefrist für die Steuererklärung 2025 beschlossen. Wer einen Steuerberater beauftragt hat, muss die Erklärung nun erst bis zum 30.06.2027 (statt 30.04.2027) einreichen. Ohne Berater bleibt die Frist beim 31.07.2026. Die Verlängerung soll die Nachwirkungen der Pandemie-Rückstände abmildern.',
    kategorie: 'Gesetzgebung', datum: '2026-02-08', quelle: 'BMF Schreiben', wichtig: false,
  },
  {
    id: 'n-4',
    titel: 'Digitale Betriebsprüfung: Finanzämter setzen verstärkt auf KI',
    zusammenfassung: 'Neue KI-Tools bei Betriebsprüfungen sollen Unstimmigkeiten schneller aufdecken.',
    inhalt: 'Die Finanzverwaltung setzt zunehmend auf KI-gestützte Analysewerkzeuge bei Betriebsprüfungen. Die Software erkennt Muster in Buchführungsdaten und markiert automatisch auffällige Transaktionen. Experten empfehlen Unternehmen, ihre Buchführung noch sorgfältiger zu dokumentieren und regelmäßig interne Plausibilitätsprüfungen durchzuführen.',
    kategorie: 'Digitalisierung', datum: '2026-02-05', quelle: 'Handelsblatt Steuer', wichtig: false,
  },
  {
    id: 'n-5',
    titel: 'Sonder-AfA für energetische Sanierung verlängert bis 2028',
    zusammenfassung: 'Die steuerliche Förderung energetischer Gebäudesanierung wird um 2 Jahre verlängert.',
    inhalt: 'Die Bundesregierung hat die Sonderabschreibung für energetische Sanierung (§ 35c EStG) bis Ende 2028 verlängert. Eigentümer können weiterhin bis zu 20% der Kosten (max. 40.000 € pro Wohnobjekt) über 3 Jahre steuerlich geltend machen. Die Maßnahmen müssen von einem Fachunternehmen durchgeführt und durch einen Energieberater bestätigt werden.',
    kategorie: 'Immobilien', datum: '2026-01-28', quelle: 'Bundesgesetzblatt', wichtig: true,
  },
  {
    id: 'n-6',
    titel: 'Kleinunternehmergrenze steigt auf 25.000 € ab 2027',
    zusammenfassung: 'Der Bundestag beschließt die Anhebung der Kleinunternehmergrenze bei der Umsatzsteuer.',
    inhalt: 'Ab dem 01.01.2027 wird die Kleinunternehmergrenze gemäß § 19 UStG von aktuell 22.000 € auf 25.000 € Jahresumsatz angehoben. Dies bedeutet, dass mehr Selbständige und Kleingewerbetreibende von der Umsatzsteuer befreit werden. Wer die Regelung in Anspruch nimmt, darf keine Vorsteuer geltend machen.',
    kategorie: 'Gesetzgebung', datum: '2026-01-20', quelle: 'Bundesanzeiger', wichtig: false,
  },
  {
    id: 'n-7',
    titel: 'Pendlerpauschale: Keine Erhöhung für 2026 geplant',
    zusammenfassung: 'Trotz gestiegener Spritpreise bleibt die Entfernungspauschale unverändert.',
    inhalt: 'Die Bundesregierung plant keine Erhöhung der Entfernungspauschale für das Steuerjahr 2026. Es bleibt bei 0,30 €/km für die ersten 20 Kilometer und 0,38 €/km ab dem 21. Kilometer. Arbeitnehmerverbände kritisieren die Entscheidung angesichts gestiegener Mobilitätskosten und fordern eine Anpassung an die Inflation.',
    kategorie: 'Einkommensteuer', datum: '2026-01-15', quelle: 'Steuertipps.de', wichtig: false,
  },
  {
    id: 'n-8',
    titel: 'ELSTER: Neue Funktionen für Grundsteuererklärung freigeschaltet',
    zusammenfassung: 'Das ELSTER-Portal erhält erweiterte Eingabemöglichkeiten für Grundsteuer-Korrekturen.',
    inhalt: 'Die Finanzverwaltung hat das ELSTER-Portal um neue Funktionen für Grundsteuererklärungen erweitert. Eigentümer können nun direkt über ELSTER Korrekturen zu ihrem Grundsteuerwertbescheid einreichen und den Bearbeitungsstatus einsehen. Auch die Einspruchseinlegung ist nun elektronisch möglich, was den Prozess deutlich beschleunigt.',
    kategorie: 'Digitalisierung', datum: '2026-01-10', quelle: 'ELSTER News', wichtig: false,
  },
]

export default function SteuerNewsPage() {
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [nurWichtig, setNurWichtig] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('bb-news-saved') || '[]') }
    catch { return [] }
  })

  const toggleGespeichert = (id: string) => {
    setGespeichert(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('bb-news-saved', JSON.stringify(next))
      return next
    })
  }

  const filtered = DEMO_NEWS.filter(n => {
    if (filterKategorie !== 'alle' && n.kategorie !== filterKategorie) return false
    if (nurWichtig && !n.wichtig) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Steuer-News</h1>
        <p className="text-muted-foreground mt-1">
          Aktuelle Änderungen, Urteile und Entwicklungen im Steuerrecht
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setFilterKategorie('alle')}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            filterKategorie === 'alle' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          Alle
        </button>
        {NEWS_KATEGORIEN.map(k => (
          <button
            key={k}
            onClick={() => setFilterKategorie(k)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filterKategorie === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {k}
          </button>
        ))}
        <div className="ml-auto">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={nurWichtig} onChange={e => setNurWichtig(e.target.checked)} className="rounded" />
            <Bell className="h-3.5 w-3.5 text-red-500" />
            Nur wichtige
          </label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} Artikel</p>

      {/* News-Liste */}
      <div className="space-y-4">
        {filtered.map(news => {
          const isExpanded = expandedId === news.id
          const isSaved = gespeichert.includes(news.id)

          return (
            <Card key={news.id}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : news.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${news.wichtig ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                    <Newspaper className={`h-5 w-5 ${news.wichtig ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{news.titel}</h3>
                      {news.wichtig && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Wichtig
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{news.zusammenfassung}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(news.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {news.kategorie}
                      </span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {news.quelle}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); toggleGespeichert(news.id) }}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3">
                  <p className="text-sm leading-relaxed">{news.inhalt}</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
