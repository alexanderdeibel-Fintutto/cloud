import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { BookMarked, Info, Search } from 'lucide-react'

interface Begriff {
  term: string
  definition: string
  paragraph?: string
  kategorie: string
}

const BEGRIFFE: Begriff[] = [
  { term: 'Abgeltungsteuer', definition: 'Pauschale Steuer von 25% auf Kapitalertraege (Zinsen, Dividenden, Kursgewinne). Wird direkt von der Bank einbehalten.', paragraph: '§ 32d EStG', kategorie: 'Kapital' },
  { term: 'AfA', definition: 'Absetzung fuer Abnutzung. Verteilung der Anschaffungskosten von Wirtschaftsguetern ueber deren Nutzungsdauer.', paragraph: '§ 7 EStG', kategorie: 'Abschreibung' },
  { term: 'Arbeitnehmer-Pauschbetrag', definition: 'Werbungskosten-Pauschale von 1.230 EUR/Jahr fuer Arbeitnehmer, ohne Nachweis abziehbar.', paragraph: '§ 9a EStG', kategorie: 'Werbungskosten' },
  { term: 'Aussergewoehnliche Belastungen', definition: 'Unvermeidbare Aufwendungen (Krankheit, Pflege, Bestattung) abzueglich zumutbarer Belastung.', paragraph: '§ 33 EStG', kategorie: 'Belastungen' },
  { term: 'Besteuerungsanteil', definition: 'Prozentsatz der Rente, der steuerpflichtig ist. Abhaengig vom Jahr des Rentenbeginns (2025: 83,5%).', paragraph: '§ 22 Nr. 1a EStG', kategorie: 'Rente' },
  { term: 'Einkommensteuer', definition: 'Steuer auf das zu versteuernde Einkommen natuerlicher Personen. Progressiver Tarif von 14% bis 45%.', paragraph: '§ 32a EStG', kategorie: 'Grundlagen' },
  { term: 'Ehegattensplitting', definition: 'Gemeinsames Einkommen wird halbiert, Tarif angewendet und verdoppelt. Vorteil bei unterschiedlichen Einkommen.', paragraph: '§ 32a Abs. 5 EStG', kategorie: 'Grundlagen' },
  { term: 'Entfernungspauschale', definition: 'Pendlerpauschale: 0,30 EUR/km (bis 20 km) bzw. 0,38 EUR/km (ab 21 km) fuer einfache Strecke.', paragraph: '§ 9 Abs. 1 Nr. 4 EStG', kategorie: 'Werbungskosten' },
  { term: 'Freibetrag', definition: 'Betrag, der vom Einkommen abgezogen wird und damit steuerfrei bleibt (z.B. Grundfreibetrag 12.084 EUR).', kategorie: 'Grundlagen' },
  { term: 'Freigrenze', definition: 'Wird die Grenze ueberschritten, ist der gesamte Betrag steuerpflichtig (Unterschied zu Freibetrag!).', kategorie: 'Grundlagen' },
  { term: 'Gewerbesteuer', definition: 'Gemeindliche Steuer auf Gewerbebetriebe. Freibetrag 24.500 EUR, Messzahl 3,5% × Hebesatz.', paragraph: '§ 11 GewStG', kategorie: 'Gewerbe' },
  { term: 'Grundfreibetrag', definition: 'Existenzminimum: 12.084 EUR (2025). Einkommen bis zu diesem Betrag ist steuerfrei.', paragraph: '§ 32a EStG', kategorie: 'Grundlagen' },
  { term: 'Grundsteuer', definition: 'Jaehrliche Steuer auf Grundbesitz. Seit 2025 nach neuem Bundesmodell oder Laendermodell.', paragraph: 'GrStG', kategorie: 'Immobilien' },
  { term: 'Guenstigerpruefung', definition: 'Automatischer Vergleich durch das Finanzamt, ob Kindergeld oder Kinderfreibetrag vorteilhafter ist.', paragraph: '§ 31 EStG', kategorie: 'Kinder' },
  { term: 'Haerteausgleich', definition: 'Nebeneinkuenfte bis 410 EUR bleiben steuerfrei, 410-820 EUR werden ermaeßigt besteuert.', paragraph: '§ 46 Abs. 3 EStG', kategorie: 'Grundlagen' },
  { term: 'Homeoffice-Pauschale', definition: '6 EUR pro Homeoffice-Tag, max. 210 Tage = 1.260 EUR/Jahr. Kein eigenes Arbeitszimmer noetig.', paragraph: '§ 4 Abs. 5 Nr. 6c EStG', kategorie: 'Werbungskosten' },
  { term: 'Kindergeld', definition: '250 EUR/Monat pro Kind (2025). Wird mit Kinderfreibetrag verrechnet (Guenstigerpruefung).', paragraph: '§ 66 EStG', kategorie: 'Kinder' },
  { term: 'Kinderfreibetrag', definition: '6.612 EUR + 2.928 EUR BEA-Freibetrag pro Kind (2025). Alternative zum Kindergeld.', paragraph: '§ 32 Abs. 6 EStG', kategorie: 'Kinder' },
  { term: 'Kirchensteuer', definition: '8% (Bayern/BaWue) oder 9% der Einkommensteuer fuer Kirchenmitglieder.', kategorie: 'Grundlagen' },
  { term: 'Lohnsteuer', definition: 'Vorauszahlung auf die Einkommensteuer, die der Arbeitgeber einbehaelt und abfuehrt.', paragraph: '§ 38 EStG', kategorie: 'Grundlagen' },
  { term: 'Progressionsvorbehalt', definition: 'Steuerfreie Einkuenfte (z.B. ALG I, Kurzarbeitergeld) erhoehen den Steuersatz fuer das uebrige Einkommen.', paragraph: '§ 32b EStG', kategorie: 'Grundlagen' },
  { term: 'Realsplitting', definition: 'Unterhalt an Ex-Partner als Sonderausgaben absetzen (max. 14.748 EUR). Empfaenger muss zustimmen und versteuern.', paragraph: '§ 10 Abs. 1a EStG', kategorie: 'Sonderausgaben' },
  { term: 'Riester-Rente', definition: 'Staatlich gefoerderte Altersvorsorge. Grundzulage 175 EUR, Kinderzulage 300 EUR, Sonderausgabenabzug max. 2.100 EUR.', paragraph: '§ 10a EStG', kategorie: 'Vorsorge' },
  { term: 'Ruerup-Rente', definition: 'Basisrente. Beitraege als Sonderausgaben absetzbar (2025: 100%, max. 27.566 EUR). Nachgelagerte Besteuerung.', paragraph: '§ 10 Abs. 1 Nr. 2 EStG', kategorie: 'Vorsorge' },
  { term: 'Solidaritaetszuschlag', definition: '5,5% der Einkommensteuer. Seit 2021 fuer 90% der Steuerzahler abgeschafft (Freigrenze 18.130 EUR).', paragraph: 'SolZG', kategorie: 'Grundlagen' },
  { term: 'Sonderausgaben', definition: 'Bestimmte Privatausgaben, die steuerlich absetzbar sind (Vorsorge, Spenden, Kirchensteuer, Schulgeld).', paragraph: '§ 10 EStG', kategorie: 'Sonderausgaben' },
  { term: 'Sparerpauschbetrag', definition: 'Freibetrag fuer Kapitalertraege: 1.000 EUR (Einzelveranlagung) bzw. 2.000 EUR (Zusammenveranlagung).', paragraph: '§ 20 Abs. 9 EStG', kategorie: 'Kapital' },
  { term: 'Steuerklasse', definition: 'Bestimmt die Hoehe der Lohnsteuer-Vorauszahlung. Klassen I-VI je nach Familienstand.', paragraph: '§ 38b EStG', kategorie: 'Grundlagen' },
  { term: 'Uebungsleiterpauschale', definition: '3.000 EUR/Jahr steuerfrei fuer nebenberufliche Taetigkeit als Trainer, Dozent, Pfleger etc.', paragraph: '§ 3 Nr. 26 EStG', kategorie: 'Ehrenamt' },
  { term: 'Umsatzsteuer', definition: 'Verbrauchsteuer auf Lieferungen/Leistungen. Regelsatz 19%, ermaessigt 7%. Vorsteuerabzug fuer Unternehmer.', paragraph: '§ 1 UStG', kategorie: 'Gewerbe' },
  { term: 'Verlustvortrag', definition: 'Negative Einkuenfte werden in Folgejahre uebertragen und dort mit positiven Einkuenften verrechnet.', paragraph: '§ 10d EStG', kategorie: 'Grundlagen' },
  { term: 'Vorsorgeaufwendungen', definition: 'Beitraege zur Altersvorsorge, Kranken-, Pflege-, Arbeitslosen- und Berufsunfaehigkeitsversicherung.', paragraph: '§ 10 Abs. 1 Nr. 2-3a EStG', kategorie: 'Vorsorge' },
  { term: 'Werbungskosten', definition: 'Aufwendungen zum Erwerb, Sicherung und Erhaltung von Einkuenften. Pendler, Arbeitsmittel, Fortbildung etc.', paragraph: '§ 9 EStG', kategorie: 'Werbungskosten' },
  { term: 'Zu versteuerndes Einkommen', definition: 'Gesamtbetrag der Einkuenfte abzueglich Sonderausgaben, aussergewoehnliche Belastungen und Freibetraege.', paragraph: '§ 2 Abs. 5 EStG', kategorie: 'Grundlagen' },
]

export default function SteuerBegriffsLexikonPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')

  const kategorien = useMemo(() => {
    const kats = new Set(BEGRIFFE.map(b => b.kategorie))
    return ['alle', ...Array.from(kats).sort()]
  }, [])

  const gefiltert = useMemo(() => {
    return BEGRIFFE
      .filter(b => filterKategorie === 'alle' || b.kategorie === filterKategorie)
      .filter(b =>
        suchbegriff === '' ||
        b.term.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        b.definition.toLowerCase().includes(suchbegriff.toLowerCase())
      )
      .sort((a, b) => a.term.localeCompare(b.term, 'de'))
  }, [suchbegriff, filterKategorie])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-primary" />
          Steuer-Lexikon
        </h1>
        <p className="text-muted-foreground mt-1">
          Wichtige Steuerbegriffe einfach erklaert
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p>{BEGRIFFE.length} Steuerbegriffe mit Erklaerungen und Gesetzesverweisen. Durchsuchen Sie das Lexikon oder filtern Sie nach Kategorien.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suche und Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Begriff suchen..."
              value={suchbegriff}
              onChange={e => setSuchbegriff(e.target.value)}
              className="w-full rounded-md border pl-10 pr-4 py-2.5 text-sm bg-background"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {kategorien.map(k => (
              <button key={k} onClick={() => setFilterKategorie(k)} className={`rounded-md px-3 py-1.5 text-xs ${filterKategorie === k ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {k === 'alle' ? `Alle (${BEGRIFFE.length})` : k}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ergebnisse */}
      <div className="text-sm text-muted-foreground">{gefiltert.length} Begriffe</div>

      <div className="space-y-3">
        {gefiltert.map((b, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base">{b.term}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{b.definition}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{b.kategorie}</span>
                  {b.paragraph && (
                    <span className="text-xs text-muted-foreground">{b.paragraph}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gefiltert.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Keine Begriffe gefunden. Versuchen Sie einen anderen Suchbegriff.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
