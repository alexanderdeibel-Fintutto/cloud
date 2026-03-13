import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Sparkles, ChevronDown, ChevronRight, CheckCircle2, TrendingDown, Calculator, Lightbulb } from 'lucide-react'

interface SparTipp {
  id: string
  titel: string
  kategorie: string
  sparPotential: number
  schwierigkeit: 'einfach' | 'mittel' | 'komplex'
  beschreibung: string
  voraussetzungen: string[]
  schritte: string[]
  rechtsgrundlage: string
}

const SCHWIERIGKEIT_CONFIG: Record<string, { label: string; color: string }> = {
  einfach: { label: 'Einfach', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  mittel: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  komplex: { label: 'Komplex', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
}

const DEMO_TIPPS: SparTipp[] = [
  {
    id: 's-1', titel: 'Homeoffice-Pauschale voll ausschöpfen', kategorie: 'Werbungskosten',
    sparPotential: 1260, schwierigkeit: 'einfach',
    beschreibung: 'Die Homeoffice-Pauschale beträgt 6 € pro Tag, maximal 1.260 € pro Jahr (210 Tage). Auch ohne separates Arbeitszimmer absetzbar.',
    voraussetzungen: ['Berufliche Tätigkeit überwiegend zu Hause', 'Keine Erstattung durch Arbeitgeber'],
    schritte: ['Homeoffice-Tage dokumentieren', 'In Anlage N bei Werbungskosten eintragen', 'Alternativ: Arbeitszimmer-Kosten nachweisen'],
    rechtsgrundlage: '§ 4 Abs. 5 Nr. 6c EStG',
  },
  {
    id: 's-2', titel: 'Entfernungspauschale ab 21. km nutzen', kategorie: 'Werbungskosten',
    sparPotential: 950, schwierigkeit: 'einfach',
    beschreibung: 'Ab dem 21. Entfernungskilometer gilt ein erhöhter Satz von 0,38 € statt 0,30 €. Bei 40 km einfacher Strecke und 220 Arbeitstagen ergibt sich ein Betrag von über 3.000 €.',
    voraussetzungen: ['Arbeitsstätte > 20 km Entfernung', 'Regelmäßige Fahrten zum Arbeitsplatz'],
    schritte: ['Kürzeste Straßenverbindung ermitteln', 'Arbeitstage dokumentieren', 'In Anlage N eintragen'],
    rechtsgrundlage: '§ 9 Abs. 1 Nr. 4 EStG',
  },
  {
    id: 's-3', titel: 'Handwerkerkosten steuerlich absetzen', kategorie: 'Haushaltsnahe Dienste',
    sparPotential: 1200, schwierigkeit: 'einfach',
    beschreibung: '20% der Arbeitskosten von Handwerkerleistungen sind direkt von der Steuerschuld abziehbar, max. 1.200 € Steuerersparnis pro Jahr (max. 6.000 € Arbeitskosten).',
    voraussetzungen: ['Handwerkerleistung im eigenen Haushalt', 'Rechnung mit ausgewiesenen Arbeitskosten', 'Überweisung (keine Barzahlung!)'],
    schritte: ['Rechnungen mit aufgeschlüsselten Arbeitskosten anfordern', 'Per Überweisung bezahlen', 'In Anlage Haushaltsnahe Aufwendungen eintragen'],
    rechtsgrundlage: '§ 35a Abs. 3 EStG',
  },
  {
    id: 's-4', titel: 'Energetische Sanierung absetzen', kategorie: 'Immobilien',
    sparPotential: 8000, schwierigkeit: 'komplex',
    beschreibung: 'Für energetische Sanierungsmaßnahmen können bis zu 20% der Kosten (max. 40.000 €) über 3 Jahre steuerlich geltend gemacht werden.',
    voraussetzungen: ['Selbstgenutztes Wohngebäude älter als 10 Jahre', 'Fachgerechte Durchführung', 'Bescheinigung durch Energieberater'],
    schritte: ['Energieberater konsultieren', 'Maßnahmen durch Fachbetrieb durchführen lassen', 'Bescheinigung nach amtlichem Muster ausstellen lassen', 'In Anlage Energetische Maßnahmen eintragen'],
    rechtsgrundlage: '§ 35c EStG',
  },
  {
    id: 's-5', titel: 'Sonderausgaben: Vorsorge maximieren', kategorie: 'Vorsorgeaufwendungen',
    sparPotential: 2500, schwierigkeit: 'mittel',
    beschreibung: 'Beiträge zur Altersvorsorge, Kranken-/Pflegeversicherung und weitere Vorsorgeaufwendungen können als Sonderausgaben abgesetzt werden.',
    voraussetzungen: ['Eigene Vorsorgebeiträge gezahlt'],
    schritte: ['Alle Versicherungsbeiträge zusammenstellen', 'Rürup-/Basis-Rente prüfen (max. 27.566 €)', 'Riester-Beiträge prüfen (Zulage oder Sonderausgabenabzug)', 'In Anlage Vorsorgeaufwand eintragen'],
    rechtsgrundlage: '§ 10 Abs. 1 EStG',
  },
  {
    id: 's-6', titel: 'Grundsteuer-Einspruch bei Neubewertung', kategorie: 'Grundsteuer',
    sparPotential: 400, schwierigkeit: 'mittel',
    beschreibung: 'Viele Grundsteuerwertbescheide nach der Reform enthalten Fehler. Ein Einspruch kann sich lohnen, wenn der Bodenrichtwert oder die Fläche fehlerhaft sind.',
    voraussetzungen: ['Grundsteuerwertbescheid erhalten', 'Fehlerhafte Daten erkennbar'],
    schritte: ['Bescheid auf Plausibilität prüfen', 'Bodenrichtwert mit BORIS vergleichen', 'Flächen und Gebäudedaten prüfen', 'Einspruch innerhalb eines Monats einlegen'],
    rechtsgrundlage: '§ 347 AO',
  },
  {
    id: 's-7', titel: 'GWG-Sofortabschreibung bis 800 €', kategorie: 'Betriebsausgaben',
    sparPotential: 800, schwierigkeit: 'einfach',
    beschreibung: 'Geringwertige Wirtschaftsgüter (GWG) bis 800 € netto können im Jahr der Anschaffung sofort vollständig abgeschrieben werden.',
    voraussetzungen: ['Netto-Anschaffungskosten ≤ 800 €', 'Selbständig nutzbar'],
    schritte: ['Prüfen ob Anschaffung unter 800 € netto liegt', 'Im Jahr der Anschaffung voll abschreiben', 'In Anlage EÜR oder Bilanz erfassen'],
    rechtsgrundlage: '§ 6 Abs. 2 EStG',
  },
  {
    id: 's-8', titel: 'Doppelte Haushaltsführung', kategorie: 'Werbungskosten',
    sparPotential: 3000, schwierigkeit: 'komplex',
    beschreibung: 'Bei beruflich bedingter doppelter Haushaltsführung können Unterkunftskosten bis 1.000 €/Monat, Fahrtkosten und Verpflegungsmehraufwendungen abgesetzt werden.',
    voraussetzungen: ['Eigener Hausstand am Lebensmittelpunkt', 'Zweitwohnung am Arbeitsort beruflich veranlasst'],
    schritte: ['Mietvertrag der Zweitwohnung vorlegen', 'Eigenbeteiligung am Haupthaushalt nachweisen', 'Fahrtkosten für Familienheimfahrten dokumentieren', 'Verpflegungsmehraufwand für erste 3 Monate geltend machen'],
    rechtsgrundlage: '§ 9 Abs. 1 Nr. 5 EStG',
  },
]

export default function SteuerSparRechnerPage() {
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [filterSchwierigkeit, setFilterSchwierigkeit] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const kategorien = [...new Set(DEMO_TIPPS.map(t => t.kategorie))]

  const filtered = useMemo(() => {
    return DEMO_TIPPS.filter(t => {
      if (filterKategorie !== 'alle' && t.kategorie !== filterKategorie) return false
      if (filterSchwierigkeit !== 'alle' && t.schwierigkeit !== filterSchwierigkeit) return false
      return true
    }).sort((a, b) => b.sparPotential - a.sparPotential)
  }, [filterKategorie, filterSchwierigkeit])

  const gesamtPotential = filtered.reduce((s, t) => s + t.sparPotential, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Steuerspar-Rechner</h1>
        <p className="text-muted-foreground mt-1">
          Entdecken Sie konkrete Möglichkeiten zur Steuerersparnis
        </p>
      </div>

      {/* Gesamt-Potential */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Geschätztes Sparpotential</p>
              <p className="text-3xl font-bold text-primary">{gesamtPotential.toLocaleString('de-DE')} €</p>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} Optimierungsmöglichkeiten</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterKategorie('alle')} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterKategorie === 'alle' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
            Alle
          </button>
          {kategorien.map(k => (
            <button key={k} onClick={() => setFilterKategorie(k)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterKategorie === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {['alle', 'einfach', 'mittel', 'komplex'].map(s => (
            <button key={s} onClick={() => setFilterSchwierigkeit(s)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterSchwierigkeit === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {s === 'alle' ? 'Alle Level' : SCHWIERIGKEIT_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipps */}
      <div className="space-y-4">
        {filtered.map(tipp => {
          const isExpanded = expandedId === tipp.id
          const schwConf = SCHWIERIGKEIT_CONFIG[tipp.schwierigkeit]

          return (
            <Card key={tipp.id}>
              <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : tipp.id)}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{tipp.titel}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${schwConf.color}`}>{schwConf.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{tipp.beschreibung.substring(0, 120)}...</p>
                    <p className="text-xs text-muted-foreground mt-1">{tipp.kategorie} • {tipp.rechtsgrundlage}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-green-600">bis {tipp.sparPotential.toLocaleString('de-DE')} €</p>
                    <p className="text-xs text-muted-foreground">Ersparnis/Jahr</p>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-4">
                  <p className="text-sm">{tipp.beschreibung}</p>

                  <div>
                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Voraussetzungen
                    </p>
                    <ul className="space-y-1">
                      {tipp.voraussetzungen.map((v, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span> {v}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium flex items-center gap-1 mb-2">
                      <Calculator className="h-4 w-4 text-primary" /> Schritte
                    </p>
                    <ol className="space-y-1">
                      {tipp.schritte.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary font-medium mt-0 shrink-0">{i + 1}.</span> {s}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Rechtsgrundlage: {tipp.rechtsgrundlage}. Prüfen Sie die Voraussetzungen sorgfältig oder konsultieren Sie einen Steuerberater.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
