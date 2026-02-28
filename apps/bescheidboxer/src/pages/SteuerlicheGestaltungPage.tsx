import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Lightbulb, Info, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

interface Tipp {
  id: string
  titel: string
  beschreibung: string
  sparpotenzial: string
  frist?: string
  kategorie: string
}

const TIPPS: Tipp[] = [
  // Werbungskosten
  { id: 't1', titel: 'Arbeitsmittel noch 2025 kaufen', beschreibung: 'PC, Laptop, Smartphone bis 800 EUR netto als GWG sofort absetzbar. Ueber 800 EUR: AfA.', sparpotenzial: 'bis 400 EUR', frist: '31.12.2025', kategorie: 'Werbungskosten' },
  { id: 't2', titel: 'Homeoffice-Tage dokumentieren', beschreibung: '6 EUR/Tag, max. 210 Tage = 1.260 EUR. Kalender fuehren als Nachweis.', sparpotenzial: 'bis 440 EUR', kategorie: 'Werbungskosten' },
  { id: 't3', titel: 'Fortbildung/Weiterbildung planen', beschreibung: 'Kurse, Seminare, Zertifizierungen voll absetzbar inkl. Reisekosten.', sparpotenzial: 'individuell', kategorie: 'Werbungskosten' },

  // Sonderausgaben
  { id: 't4', titel: 'Riester-Beitraege maximieren', beschreibung: 'Max. 2.100 EUR inkl. Zulagen. Grundzulage 175 EUR + Kinderzulage 300 EUR.', sparpotenzial: 'bis 700 EUR', frist: '31.12.2025', kategorie: 'Vorsorge' },
  { id: 't5', titel: 'Ruerup-Beitraege optimieren', beschreibung: '2025: 100% absetzbar, max. 27.566 EUR. Ideal fuer Selbstaendige.', sparpotenzial: 'bis 12.400 EUR', frist: '31.12.2025', kategorie: 'Vorsorge' },
  { id: 't6', titel: 'Spenden noch vor Jahresende', beschreibung: 'Bis 20% des Gesamtbetrags der Einkuenfte absetzbar. Zuwendungsbestaetigung anfordern.', sparpotenzial: 'individuell', frist: '31.12.2025', kategorie: 'Sonderausgaben' },

  // Haushaltsnahe
  { id: 't7', titel: 'Handwerker-Rechnungen bezahlen', beschreibung: 'Nur Zahlungseingang im laufenden Jahr zaehlt! 20% von max. 6.000 EUR = 1.200 EUR.', sparpotenzial: 'bis 1.200 EUR', frist: '31.12.2025', kategorie: 'Haushalt' },
  { id: 't8', titel: 'Nebenkostenabrechnung pruefen', beschreibung: 'Haushaltsnahe Anteile (Hausmeister, Gartenpflege, Reinigung) absetzbar.', sparpotenzial: 'bis 200 EUR', kategorie: 'Haushalt' },

  // Kapital
  { id: 't9', titel: 'Freistellungsauftraege pruefen', beschreibung: 'Sparerpauschbetrag 1.000/2.000 EUR optimal verteilen. Aenderung fuer 2026 jetzt planen.', sparpotenzial: 'bis 264 EUR', frist: '31.12.2025', kategorie: 'Kapital' },
  { id: 't10', titel: 'Verlustbescheinigung beantragen', beschreibung: 'Fuer bankeninterne Verlustverrechnung. Antrag bis 15.12. bei der Bank.', sparpotenzial: 'individuell', frist: '15.12.2025', kategorie: 'Kapital' },
  { id: 't11', titel: 'Nichtveranlagungsbescheinigung pruefen', beschreibung: 'Fuer Rentner/Studenten mit geringem Einkommen: Kapitalertraege steuerfrei.', sparpotenzial: 'bis 264 EUR', kategorie: 'Kapital' },

  // Kinder
  { id: 't12', titel: 'Kinderbetreuungskosten sammeln', beschreibung: '2/3 der Kosten, max. 4.000 EUR/Kind. Rechnungen + Ueberweisungsbelege aufbewahren.', sparpotenzial: 'bis 1.400 EUR', kategorie: 'Kinder' },
  { id: 't13', titel: 'Kindergeld vs. Kinderfreibetrag', beschreibung: 'Guenstigerpruefung automatisch. Ab ca. 40.000 EUR zvE lohnt sich der Freibetrag.', sparpotenzial: 'automatisch', kategorie: 'Kinder' },

  // Immobilien
  { id: 't14', titel: 'Erhaltungsaufwand vorziehen', beschreibung: 'Renovierung/Reparatur bei Mietobjekten sofort absetzbar (nicht aktivierungspflichtig).', sparpotenzial: 'individuell', frist: '31.12.2025', kategorie: 'Immobilien' },
  { id: 't15', titel: 'Sonder-AfA § 7b pruefen', beschreibung: 'Mietwohnungsneubau: 5% Sonder-AfA in den ersten 4 Jahren.', sparpotenzial: 'individuell', kategorie: 'Immobilien' },

  // Allgemein
  { id: 't16', titel: 'Steuerklassenwechsel pruefen', beschreibung: 'Wechsel III/V zu IV/IV (oder umgekehrt) bis 30.11. Effekt auf Netto und Erstattung.', sparpotenzial: 'Liquiditaet', frist: '30.11.2025', kategorie: 'Allgemein' },
  { id: 't17', titel: 'Belege digital archivieren', beschreibung: 'Fotos/Scans von Quittungen und Rechnungen. Aufbewahrungsfrist: 10 Jahre (Gewerbetreibende).', sparpotenzial: 'Sicherheit', kategorie: 'Allgemein' },
  { id: 't18', titel: 'Freibetrag beim FA beantragen', beschreibung: 'Lohnsteuerermaessigung fuer 2026 ab Oktober beantragen: Mehr Netto monatlich.', sparpotenzial: 'Liquiditaet', frist: '30.11.2025', kategorie: 'Allgemein' },
]

const KATEGORIEN = Array.from(new Set(TIPPS.map(t => t.kategorie)))

export default function SteuerlicheGestaltungPage() {
  const [erledigt, setErledigt] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(KATEGORIEN.map(k => [k, true]))
  )

  const toggle = (id: string) => setErledigt(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleKat = (k: string) => setExpanded(prev => ({ ...prev, [k]: !prev[k] }))

  const erledigtCount = Object.values(erledigt).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Steuerliche Gestaltung
        </h1>
        <p className="text-muted-foreground mt-1">
          Jahresend-Optimierung – Noch 2025 Steuern sparen
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p><strong>Jahresend-Planung:</strong> Viele steuerliche Gestaltungen muessen <strong>bis zum 31.12.</strong> umgesetzt werden. Pruefen Sie jede Position und handeln Sie rechtzeitig!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Fortschritt</span>
            <span className="text-sm text-muted-foreground">{erledigtCount} / {TIPPS.length}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${TIPPS.length > 0 ? Math.round(erledigtCount / TIPPS.length * 100) : 0}%` }} />
          </div>
        </CardContent>
      </Card>

      {KATEGORIEN.map(kat => {
        const katTipps = TIPPS.filter(t => t.kategorie === kat)
        const katErledigt = katTipps.filter(t => erledigt[t.id]).length
        const isExpanded = expanded[kat]

        return (
          <Card key={kat}>
            <CardHeader className="cursor-pointer" onClick={() => toggleKat(kat)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {kat}
                </CardTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full ${katErledigt === katTipps.length ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {katErledigt}/{katTipps.length}
                </span>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0 space-y-2">
                {katTipps.map(tipp => (
                  <div
                    key={tipp.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 ${erledigt[tipp.id] ? 'opacity-50' : ''}`}
                    onClick={() => toggle(tipp.id)}
                  >
                    {erledigt[tipp.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${erledigt[tipp.id] ? 'line-through' : ''}`}>{tipp.titel}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tipp.beschreibung}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Sparpotenzial: {tipp.sparpotenzial}
                        </span>
                        {tipp.frist && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            Frist: {tipp.frist}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
