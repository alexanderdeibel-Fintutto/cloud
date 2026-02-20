import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { FileSpreadsheet, Search, ExternalLink, ChevronDown, ChevronUp, Tag } from 'lucide-react'

interface Formular {
  id: string
  name: string
  kurzname: string
  kategorie: string
  beschreibung: string
  fuer: string[]
  pflicht: boolean
  elster: boolean
  hinweis: string
  felder: string[]
}

const FORMULARE: Formular[] = [
  {
    id: 'mantelbogen', name: 'Mantelbogen (ESt 1 A)', kurzname: 'ESt 1 A', kategorie: 'Hauptvordruck',
    beschreibung: 'Hauptformular der Einkommensteuererklärung. Persönliche Daten, Sonderausgaben, außergewöhnliche Belastungen, haushaltsnahe Aufwendungen.',
    fuer: ['Alle Steuerpflichtigen'], pflicht: true, elster: true,
    hinweis: 'Immer erforderlich als Basisformular jeder Einkommensteuererklärung.',
    felder: ['Persönliche Daten', 'Bankverbindung', 'Sonderausgaben', 'Außergewöhnliche Belastungen', 'Haushaltsnahe Dienste § 35a'],
  },
  {
    id: 'anlage-n', name: 'Anlage N (Einkünfte aus nichtselbstständiger Arbeit)', kurzname: 'Anlage N', kategorie: 'Einkünfte',
    beschreibung: 'Für Arbeitnehmer: Lohn, Gehalt, Werbungskosten wie Fahrten zur Arbeit, Arbeitsmittel, Fortbildung.',
    fuer: ['Arbeitnehmer', 'Beamte', 'Pensionäre'], pflicht: true, elster: true,
    hinweis: 'Werbungskosten-Pauschale 2025: 1.230 €. Nur ausfüllen, wenn höhere Kosten geltend gemacht werden sollen.',
    felder: ['Arbeitslohn', 'Versorgungsbezüge', 'Werbungskosten', 'Entfernungspauschale', 'Arbeitsmittel', 'Doppelte Haushaltsführung'],
  },
  {
    id: 'anlage-v', name: 'Anlage V (Einkünfte aus Vermietung und Verpachtung)', kurzname: 'Anlage V', kategorie: 'Einkünfte',
    beschreibung: 'Mieteinnahmen, Werbungskosten für vermietete Immobilien, AfA, Schuldzinsen, Erhaltungsaufwand.',
    fuer: ['Vermieter', 'Immobilienbesitzer'], pflicht: true, elster: true,
    hinweis: 'Für jedes vermietete Objekt eine separate Anlage V einreichen.',
    felder: ['Mieteinnahmen', 'Umlagen', 'AfA', 'Schuldzinsen', 'Erhaltungsaufwand', 'Nebenkosten'],
  },
  {
    id: 'anlage-kap', name: 'Anlage KAP (Einkünfte aus Kapitalvermögen)', kurzname: 'Anlage KAP', kategorie: 'Einkünfte',
    beschreibung: 'Zinsen, Dividenden, Kursgewinne. Relevant bei Günstigerprüfung oder ausländischen Kapitalerträgen.',
    fuer: ['Anleger', 'Sparer'], pflicht: false, elster: true,
    hinweis: 'Abgeltungsteuer (25%) wird automatisch von Banken einbehalten. Anlage KAP nur bei Günstigerprüfung oder Kirchensteuerpflicht nötig.',
    felder: ['Kapitalerträge', 'Verluste', 'Angerechnete Abgeltungsteuer', 'Kirchensteuer', 'Günstigerprüfung'],
  },
  {
    id: 'anlage-s', name: 'Anlage S (Einkünfte aus selbständiger Arbeit)', kurzname: 'Anlage S', kategorie: 'Einkünfte',
    beschreibung: 'Für Freiberufler und selbständig Tätige. Gewinn, Betriebsausgaben, Investitionsabzugsbetrag.',
    fuer: ['Freiberufler', 'Selbständige'], pflicht: true, elster: true,
    hinweis: 'EÜR-Anlage (Anlage EÜR) wird zusätzlich benötigt.',
    felder: ['Gewinn', 'Betriebseinnahmen', 'Betriebsausgaben', 'Investitionsabzugsbetrag', 'Sonderabschreibungen'],
  },
  {
    id: 'anlage-g', name: 'Anlage G (Einkünfte aus Gewerbebetrieb)', kurzname: 'Anlage G', kategorie: 'Einkünfte',
    beschreibung: 'Gewerbliche Einkünfte, GewSt-Anrechnung, Veräußerungsgewinne.',
    fuer: ['Gewerbetreibende', 'GmbH-Gesellschafter'], pflicht: true, elster: true,
    hinweis: 'Gewerbesteuererklärung (GewSt 1 A) muss separat beim Gewerbesteuer-Finanzamt eingereicht werden.',
    felder: ['Gewinn', 'GewSt-Anrechnung § 35', 'Veräußerungsgewinn', 'Freibetrag'],
  },
  {
    id: 'anlage-vorsorge', name: 'Anlage Vorsorgeaufwand', kurzname: 'Vorsorge', kategorie: 'Abzüge',
    beschreibung: 'Krankenversicherung, Rentenversicherung, Pflegeversicherung, Haftpflicht, Unfallversicherung.',
    fuer: ['Alle Steuerpflichtigen'], pflicht: false, elster: true,
    hinweis: 'Besonders relevant für Selbständige und privat Versicherte.',
    felder: ['Krankenversicherung', 'Pflegeversicherung', 'Rentenversicherung', 'Basisrente (Rürup)', 'Haftpflicht', 'Unfallversicherung'],
  },
  {
    id: 'anlage-kind', name: 'Anlage Kind', kurzname: 'Kind', kategorie: 'Abzüge',
    beschreibung: 'Kinderfreibetrag, Kinderbetreuungskosten, Schulgeld, Ausbildungsfreibetrag.',
    fuer: ['Eltern'], pflicht: false, elster: true,
    hinweis: 'Pro Kind eine Anlage. Günstigerprüfung Kindergeld vs. Kinderfreibetrag erfolgt automatisch.',
    felder: ['Kinderdaten', 'Kindergeld', 'Betreuungskosten', 'Schulgeld', 'Ausbildungsfreibetrag'],
  },
  {
    id: 'anlage-r', name: 'Anlage R (Renten und andere Leistungen)', kurzname: 'Anlage R', kategorie: 'Einkünfte',
    beschreibung: 'Gesetzliche Rente, Betriebsrente, Riester-Rente, Rürup-Rente, private Rentenversicherung.',
    fuer: ['Rentner', 'Pensionäre'], pflicht: true, elster: true,
    hinweis: 'Besteuerungsanteil abhängig vom Rentenbeginn. Ab 2058: 100% steuerpflichtig.',
    felder: ['Gesetzliche Rente', 'Betriebsrente', 'Riester-Rente', 'Private Rente', 'Besteuerungsanteil'],
  },
  {
    id: 'anlage-so', name: 'Anlage SO (Sonstige Einkünfte)', kurzname: 'Anlage SO', kategorie: 'Einkünfte',
    beschreibung: 'Private Veräußerungsgeschäfte (Krypto, Immobilien <10 Jahre), Unterhalt erhalten.',
    fuer: ['Krypto-Trader', 'Immobilien-Verkäufer'], pflicht: false, elster: true,
    hinweis: 'Krypto-Gewinne: steuerfrei nach 1 Jahr Haltefrist. Freigrenze: 1.000 € (ab 2024).',
    felder: ['Veräußerungsgewinne', 'Krypto-Einkünfte', 'Unterhalt', 'Spekulationsgeschäfte'],
  },
]

const KATEGORIEN = [...new Set(FORMULARE.map(f => f.kategorie))]

export default function SteuerFormularePage() {
  const [search, setSearch] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = FORMULARE
    .filter(f => filterKategorie === 'alle' || f.kategorie === filterKategorie)
    .filter(f => {
      if (!search) return true
      const q = search.toLowerCase()
      return f.name.toLowerCase().includes(q) || f.kurzname.toLowerCase().includes(q) ||
        f.beschreibung.toLowerCase().includes(q) || f.fuer.some(x => x.toLowerCase().includes(q))
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-cyan-500" />
          Steuer-Formulare
        </h1>
        <p className="text-muted-foreground mt-1">
          Übersicht aller relevanten Steuerformulare und Anlagen mit Erklärungen
        </p>
      </div>

      {/* Suche & Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Formular suchen (z.B. Anlage V, Vermieter...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterKategorie('alle')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              filterKategorie === 'alle' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            Alle ({FORMULARE.length})
          </button>
          {KATEGORIEN.map(k => (
            <button
              key={k}
              onClick={() => setFilterKategorie(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                filterKategorie === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border hover:bg-muted'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Formular-Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              Keine Formulare gefunden.
            </CardContent>
          </Card>
        ) : (
          filtered.map(f => {
            const isExpanded = expandedId === f.id
            return (
              <Card key={f.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}
                  className="w-full text-left"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2 mt-0.5">
                          <FileSpreadsheet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{f.kurzname}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">{f.kategorie}</span>
                            {f.pflicht && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">Pflicht</span>
                            )}
                            {f.elster && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">ELSTER</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{f.beschreibung}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {f.fuer.map(x => (
                              <span key={x} className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <Tag className="h-2.5 w-2.5" />{x}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Beschreibung</p>
                          <p className="text-sm">{f.beschreibung}</p>
                        </div>

                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Hinweis</p>
                          <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">{f.hinweis}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Wichtige Felder</p>
                          <div className="flex flex-wrap gap-1.5">
                            {f.felder.map(feld => (
                              <span key={feld} className="rounded-full bg-muted px-2.5 py-1 text-xs">{feld}</span>
                            ))}
                          </div>
                        </div>

                        <a
                          href="https://portal.fintutto.cloud/formulare"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Formular im Portal ausfüllen
                        </a>
                      </div>
                    )}
                  </CardContent>
                </button>
              </Card>
            )
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} von {FORMULARE.length} Formularen · Stand: Veranlagungszeitraum 2025
      </p>
    </div>
  )
}
