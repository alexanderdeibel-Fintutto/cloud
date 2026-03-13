import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Search, BookOpen, Tag, Clock, ChevronDown, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react'

interface WissensArtikel {
  id: string
  titel: string
  zusammenfassung: string
  inhalt: string
  kategorie: string
  tags: string[]
  lesezeit: number
  aktualisiert: string
  quelle?: string
}

const KATEGORIEN = [
  'Einkommensteuer',
  'Grundsteuer',
  'Gewerbesteuer',
  'Umsatzsteuer',
  'Einspruch',
  'Fristen & Termine',
  'Abzüge & Freibeträge',
  'Immobilien',
]

const DEMO_ARTIKEL: WissensArtikel[] = [
  {
    id: 'w-1', titel: 'Einspruch gegen Steuerbescheid - Schritt für Schritt',
    zusammenfassung: 'Alles was Sie über den Einspruch gegen einen Steuerbescheid wissen müssen.',
    inhalt: 'Ein Einspruch gegen einen Steuerbescheid muss innerhalb eines Monats nach Bekanntgabe eingelegt werden. Der Bescheid gilt am dritten Tag nach Aufgabe zur Post als bekannt gegeben (§ 122 Abs. 2 AO). Der Einspruch muss schriftlich oder elektronisch beim zuständigen Finanzamt eingereicht werden. Eine Begründung ist empfehlenswert, aber nicht zwingend erforderlich. Wichtig: Der Einspruch hemmt nicht die Zahlungspflicht - beantragen Sie ggf. Aussetzung der Vollziehung (AdV).',
    kategorie: 'Einspruch', tags: ['Einspruch', 'Frist', 'Steuerbescheid', 'AdV'], lesezeit: 5, aktualisiert: '2026-01-15',
  },
  {
    id: 'w-2', titel: 'Die neue Grundsteuer ab 2025 - Was sich ändert',
    zusammenfassung: 'Überblick über die Grundsteuerreform und was Eigentümer beachten müssen.',
    inhalt: 'Ab dem 01.01.2025 gilt die neue Grundsteuer. Im Bundesmodell wird der Grundsteuerwert aus Bodenrichtwert, Grundstücksfläche, Gebäudeart und Gebäudealter berechnet. Die Steuermesszahl beträgt im Bundesmodell 0,31‰ (Wohngebäude). Einige Bundesländer (BW, BY, HH, HE, NI) nutzen eigene Modelle. Baden-Württemberg besteuert nur den Bodenwert (Bodenwertmodell). Bayern verwendet ein Flächenmodell.',
    kategorie: 'Grundsteuer', tags: ['Grundsteuer', 'Reform', 'Bundesmodell', 'Eigentümer'], lesezeit: 8, aktualisiert: '2026-02-01',
  },
  {
    id: 'w-3', titel: 'Werbungskosten - Die wichtigsten Abzüge für Arbeitnehmer',
    zusammenfassung: 'Welche Werbungskosten Sie in der Steuererklärung geltend machen können.',
    inhalt: 'Werbungskosten sind Aufwendungen zur Erwerbung, Sicherung und Erhaltung von Einnahmen. Der Arbeitnehmer-Pauschbetrag beträgt 1.230 € (ab 2023). Darüber hinausgehende Kosten müssen nachgewiesen werden. Typische Werbungskosten: Fahrtkosten (0,30 €/km einfache Entfernung, ab 21. km: 0,38 €), Arbeitsmittel, Fortbildungskosten, Bewerbungskosten, Umzugskosten bei beruflich bedingtem Umzug, häusliches Arbeitszimmer/Homeoffice-Pauschale (6 €/Tag, max. 1.260 €/Jahr).',
    kategorie: 'Abzüge & Freibeträge', tags: ['Werbungskosten', 'Arbeitnehmer', 'Pauschbetrag', 'Homeoffice'], lesezeit: 6, aktualisiert: '2026-01-20',
  },
  {
    id: 'w-4', titel: 'Wichtige Steuertermine und Fristen 2026',
    zusammenfassung: 'Alle relevanten Abgabe- und Zahlungstermine für das Steuerjahr 2026.',
    inhalt: 'Einkommensteuer-Vorauszahlung: 10. März, 10. Juni, 10. September, 10. Dezember. Umsatzsteuer-Voranmeldung: Monatlich bis zum 10. des Folgemonats (oder vierteljährlich). Gewerbesteuer-Vorauszahlung: 15. Februar, 15. Mai, 15. August, 15. November. Steuererklärung 2025 (mit Berater): Frist bis 30.04.2027. Steuererklärung 2025 (ohne Berater): Frist bis 31.07.2026. Grundsteuer: Quartalszahlung jeweils zum 15.02, 15.05, 15.08, 15.11.',
    kategorie: 'Fristen & Termine', tags: ['Termine', 'Fristen', 'Vorauszahlung', '2026'], lesezeit: 4, aktualisiert: '2026-01-01',
  },
  {
    id: 'w-5', titel: 'Gewerbesteuer - Berechnung und Freibetrag',
    zusammenfassung: 'Wie die Gewerbesteuer berechnet wird und welche Freibeträge gelten.',
    inhalt: 'Die Gewerbesteuer wird auf den Gewerbeertrag erhoben. Der Freibetrag für Einzelunternehmen und Personengesellschaften beträgt 24.500 €. Kapitalgesellschaften haben keinen Freibetrag. Die Steuermesszahl beträgt 3,5%. Der Gewerbesteuermessbetrag wird mit dem kommunalen Hebesatz (mindestens 200%) multipliziert. Hinzurechnungen nach § 8 GewStG: 25% der Finanzierungsentgelte (nach Freibetrag 200.000 €). Anrechnung auf die Einkommensteuer: max. Faktor 4,0 des Messbeitrags.',
    kategorie: 'Gewerbesteuer', tags: ['Gewerbesteuer', 'Hebesatz', 'Freibetrag', 'Berechnung'], lesezeit: 7, aktualisiert: '2026-01-10',
  },
  {
    id: 'w-6', titel: 'Aussetzung der Vollziehung (AdV) beantragen',
    zusammenfassung: 'Wie Sie die Zahlung bei einem laufenden Einspruch aussetzen lassen.',
    inhalt: 'Bei Einlegung eines Einspruchs gegen einen Steuerbescheid besteht grundsätzlich weiterhin Zahlungspflicht. Um diese aufzuschieben, können Sie einen Antrag auf Aussetzung der Vollziehung (AdV) stellen. Voraussetzung: Ernstliche Zweifel an der Rechtmäßigkeit des Bescheids. Der Antrag wird zunächst beim Finanzamt gestellt. Bei Ablehnung kann AdV beim Finanzgericht beantragt werden. Zinsen: Bei erfolglosem Einspruch werden Aussetzungszinsen von 0,5% pro Monat fällig.',
    kategorie: 'Einspruch', tags: ['AdV', 'Aussetzung', 'Vollziehung', 'Einspruch', 'Zahlung'], lesezeit: 5, aktualisiert: '2025-12-15',
  },
  {
    id: 'w-7', titel: 'Immobilien-Abschreibung (AfA) richtig anwenden',
    zusammenfassung: 'Lineare und degressive AfA für Immobilien im Überblick.',
    inhalt: 'Vermietete Immobilien können über die Nutzungsdauer abgeschrieben werden. Lineare AfA: Gebäude nach 1925: 2% (50 Jahre Nutzungsdauer). Gebäude vor 1925: 2,5% (40 Jahre). Sonderabschreibung § 7b EStG: Zusätzlich 5% p.a. für 4 Jahre bei Neubauwohnungen (Baukosten max. 5.200 €/m²). Degressive AfA (Neuregelung): 5% für Neubauten mit Baubeginn nach 30.09.2023 und vor 01.10.2029. Anschaffungsnebenkosten (Grunderwerbsteuer, Notar, Makler für Erwerb) erhöhen die AfA-Bemessungsgrundlage.',
    kategorie: 'Immobilien', tags: ['AfA', 'Abschreibung', 'Immobilie', 'Vermietung', 'Neubau'], lesezeit: 6, aktualisiert: '2026-02-05',
  },
  {
    id: 'w-8', titel: 'Umsatzsteuer-Voranmeldung - Pflichten und Fristen',
    zusammenfassung: 'Wer muss wann eine Umsatzsteuer-Voranmeldung abgeben?',
    inhalt: 'Die USt-Voranmeldung ist elektronisch über ELSTER abzugeben. Monatliche Abgabe: Bei USt-Zahllast > 7.500 € im Vorjahr. Vierteljährliche Abgabe: Bei Zahllast zwischen 1.000 € und 7.500 €. Befreiung: Bei Zahllast < 1.000 € (nur Jahreserklärung). Dauerfristverlängerung: Verlängert die Abgabefrist um einen Monat (Sondervorauszahlung 1/11 der Vorjahres-USt). Abgabefrist: Bis zum 10. des Folgemonats/-quartals.',
    kategorie: 'Umsatzsteuer', tags: ['Umsatzsteuer', 'Voranmeldung', 'ELSTER', 'Frist'], lesezeit: 5, aktualisiert: '2026-01-08',
  },
]

export default function WissensDatenbankPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bb-wissen-saved') || '[]')
    } catch { return [] }
  })

  const toggleGespeichert = (id: string) => {
    setGespeichert(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('bb-wissen-saved', JSON.stringify(next))
      return next
    })
  }

  const filtered = useMemo(() => {
    return DEMO_ARTIKEL.filter(a => {
      if (filterKategorie !== 'alle' && a.kategorie !== filterKategorie) return false
      if (suchbegriff) {
        const q = suchbegriff.toLowerCase()
        return a.titel.toLowerCase().includes(q) ||
          a.zusammenfassung.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q)) ||
          a.inhalt.toLowerCase().includes(q)
      }
      return true
    })
  }, [suchbegriff, filterKategorie])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wissens-Datenbank</h1>
        <p className="text-muted-foreground mt-1">
          Steuer-Wissen kompakt erklärt - durchsuchen Sie unsere Fachbeiträge
        </p>
      </div>

      {/* Suche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Artikel durchsuchen..."
          value={suchbegriff}
          onChange={e => setSuchbegriff(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm"
        />
      </div>

      {/* Kategorie-Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterKategorie('alle')}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            filterKategorie === 'alle'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          Alle ({DEMO_ARTIKEL.length})
        </button>
        {KATEGORIEN.map(k => {
          const count = DEMO_ARTIKEL.filter(a => a.kategorie === k).length
          if (count === 0) return null
          return (
            <button
              key={k}
              onClick={() => setFilterKategorie(k)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                filterKategorie === k
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {k} ({count})
            </button>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} Artikel gefunden</p>

      {/* Artikel */}
      <div className="space-y-4">
        {filtered.map(artikel => {
          const isExpanded = expandedId === artikel.id
          const isSaved = gespeichert.includes(artikel.id)

          return (
            <Card key={artikel.id}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : artikel.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{artikel.titel}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{artikel.zusammenfassung}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {artikel.kategorie}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {artikel.lesezeit} Min. Lesezeit
                      </span>
                      <span>
                        Aktualisiert: {new Date(artikel.aktualisiert).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); toggleGespeichert(artikel.id) }}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      title={isSaved ? 'Gespeichert' : 'Speichern'}
                    >
                      {isSaved
                        ? <BookmarkCheck className="h-4 w-4 text-primary" />
                        : <Bookmark className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>
                    {isExpanded
                      ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      : <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm leading-relaxed">{artikel.inhalt}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {artikel.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground cursor-pointer hover:bg-primary/10"
                        onClick={() => setSuchbegriff(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Keine Artikel gefunden. Versuchen Sie andere Suchbegriffe.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
