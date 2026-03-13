import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { BadgeInfo, Info } from 'lucide-react'

interface Steuerklasse {
  klasse: number
  fuer: string
  beschreibung: string
  freibetraege: string[]
  wechselMoeglich: string
  besonderheiten: string[]
}

const STEUERKLASSEN: Steuerklasse[] = [
  {
    klasse: 1,
    fuer: 'Ledige, Geschiedene, Verwitwete (nach dem 2. Kalenderjahr)',
    beschreibung: 'Standard-Steuerklasse für Alleinstehende ohne Kinder. Grundfreibetrag und Arbeitnehmer-Pauschbetrag werden berücksichtigt.',
    freibetraege: ['Grundfreibetrag: 11.784 €', 'Arbeitnehmer-Pauschbetrag: 1.230 €', 'Sonderausgaben-Pauschbetrag: 36 €', 'Vorsorgepauschale'],
    wechselMoeglich: 'Automatisch bei Heirat → III/V oder IV/IV',
    besonderheiten: ['Keine Kinderfreibeträge auf der Lohnsteuerkarte', 'Günstigste Klasse für Ledige'],
  },
  {
    klasse: 2,
    fuer: 'Alleinerziehende (mindestens ein Kind im Haushalt)',
    beschreibung: 'Wie Klasse I, aber mit Entlastungsbetrag für Alleinerziehende. Voraussetzung: Kind im Haushalt, kein weiterer Erwachsener.',
    freibetraege: ['Grundfreibetrag: 11.784 €', 'Entlastungsbetrag: 4.260 € + 240 €/weiteres Kind', 'Arbeitnehmer-Pauschbetrag: 1.230 €', 'Sonderausgaben-Pauschbetrag: 36 €'],
    wechselMoeglich: 'Automatisch wenn Voraussetzungen wegfallen → Klasse I',
    besonderheiten: ['Entlastungsbetrag für Alleinerziehende (§ 24b EStG)', 'Kein weiterer Erwachsener im Haushalt', '0,5 Kinderfreibetrag auf der Karte'],
  },
  {
    klasse: 3,
    fuer: 'Verheiratete (Ehepartner in Klasse V)',
    beschreibung: 'Höchster Grundfreibetrag. Optimal für den Ehepartner mit dem höheren Einkommen, wenn der andere in Klasse V ist.',
    freibetraege: ['Doppelter Grundfreibetrag: 23.568 €', 'Arbeitnehmer-Pauschbetrag: 1.230 €', 'Sonderausgaben-Pauschbetrag: 36 €', 'Vorsorgepauschale'],
    wechselMoeglich: 'Jederzeit zum III/V ↔ IV/IV wechseln (einmal jährlich, bis 30.11.)',
    besonderheiten: ['Doppelter Grundfreibetrag → niedrigste monatliche Lohnsteuer', 'Pflicht zur Einkommensteuererklärung!', 'Partner muss Klasse V wählen'],
  },
  {
    klasse: 4,
    fuer: 'Verheiratete (beide Ehepartner in Klasse IV)',
    beschreibung: 'Standard bei Heirat. Beide Partner werden wie Ledige besteuert. Optional mit Faktorverfahren für genauere monatliche Steuer.',
    freibetraege: ['Grundfreibetrag: 11.784 €', 'Arbeitnehmer-Pauschbetrag: 1.230 €', 'Sonderausgaben-Pauschbetrag: 36 €', 'Vorsorgepauschale'],
    wechselMoeglich: 'Jederzeit zu III/V wechseln (einmal jährlich, bis 30.11.)',
    besonderheiten: ['Automatisch bei Heirat zugewiesen', 'Faktor-Verfahren möglich (IV+Faktor)', 'Keine Pflichtveranlagung bei IV/IV ohne Faktor'],
  },
  {
    klasse: 5,
    fuer: 'Verheiratete (Ehepartner in Klasse III)',
    beschreibung: 'Kein Grundfreibetrag. Höchste monatliche Lohnsteuer. Für den Partner mit dem geringeren Einkommen bei Kombination III/V.',
    freibetraege: ['Kein Grundfreibetrag!', 'Arbeitnehmer-Pauschbetrag: 1.230 €', 'Sonderausgaben-Pauschbetrag: 36 €'],
    wechselMoeglich: 'Jederzeit zu IV/IV wechseln',
    besonderheiten: ['Kein Grundfreibetrag → höchste monatliche Lohnsteuer', 'Pflicht zur Einkommensteuererklärung!', 'Sinnvoll bei großem Gehaltsunterschied'],
  },
  {
    klasse: 6,
    fuer: 'Zweit- und Nebenjobs (ab dem 2. Arbeitsverhältnis)',
    beschreibung: 'Keine Freibeträge. Höchste Besteuerung. Wird automatisch für jedes weitere Arbeitsverhältnis vergeben.',
    freibetraege: ['Keine Freibeträge!', 'Keine Pauschalen'],
    wechselMoeglich: 'Nicht wählbar – automatisch bei Zweitjob',
    besonderheiten: ['Höchste Besteuerung', 'Ab dem ersten Euro wird Lohnsteuer fällig', 'Pflicht zur Einkommensteuererklärung'],
  },
]

export default function SteuerklassenInfoPage() {
  const [ausgewaehlteKlasse, setAusgewaehlteKlasse] = useState(1)

  const klasse = STEUERKLASSEN.find(s => s.klasse === ausgewaehlteKlasse)!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BadgeInfo className="h-6 w-6 text-primary" />
          Steuerklassen-Ratgeber
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle 6 Steuerklassen im Detail – Freibeträge, Voraussetzungen und Wechselmöglichkeiten
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-blue-800 dark:text-blue-200">
              <p><strong>Die Steuerklasse bestimmt nur die monatliche Lohnsteuer</strong>, nicht die Jahressteuer! Über die Einkommensteuererklärung wird alles ausgeglichen.</p>
              <p><strong>Wechsel:</strong> Ehepaare können einmal jährlich (bis 30.11.) zwischen III/V und IV/IV wechseln. IV+Faktor jederzeit beantragbar.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Klassen-Auswahl */}
      <div className="flex gap-2 flex-wrap">
        {STEUERKLASSEN.map(sk => (
          <button
            key={sk.klasse}
            onClick={() => setAusgewaehlteKlasse(sk.klasse)}
            className={`rounded-lg px-4 py-3 text-center transition-colors min-w-[80px] ${
              ausgewaehlteKlasse === sk.klasse
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            <p className="text-lg font-bold">{sk.klasse}</p>
            <p className="text-[10px] mt-0.5">{sk.klasse === 1 ? 'Ledig' : sk.klasse === 2 ? 'Alleinerz.' : sk.klasse === 3 ? 'Verh. (hoch)' : sk.klasse === 4 ? 'Verh. (gleich)' : sk.klasse === 5 ? 'Verh. (gering)' : 'Zweitjob'}</p>
          </button>
        ))}
      </div>

      {/* Detail */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-lg">Steuerklasse {klasse.klasse}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Für wen?</p>
            <p className="text-sm mt-1">{klasse.fuer}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Beschreibung</p>
            <p className="text-sm mt-1">{klasse.beschreibung}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Freibeträge & Pauschalen</p>
            <ul className="mt-1 space-y-1">
              {klasse.freibetraege.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Wechselmöglichkeit</p>
            <p className="text-sm mt-1">{klasse.wechselMoeglich}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Besonderheiten</p>
            <ul className="mt-1 space-y-1">
              {klasse.besonderheiten.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Übersichtstabelle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vergleichstabelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Klasse</th>
                  <th className="py-2 pr-3">Grundfreibetrag</th>
                  <th className="py-2 pr-3">Für wen</th>
                  <th className="py-2">Pflichtveranlagung</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { klasse: 1, fb: '11.784 €', fuer: 'Ledige', pflicht: 'Nein' },
                  { klasse: 2, fb: '11.784 € + 4.260 €', fuer: 'Alleinerziehende', pflicht: 'Nein' },
                  { klasse: 3, fb: '23.568 €', fuer: 'Verheiratet (Besserverdienend)', pflicht: 'Ja' },
                  { klasse: 4, fb: '11.784 €', fuer: 'Verheiratet (beide)', pflicht: 'Nein*' },
                  { klasse: 5, fb: '0 €', fuer: 'Verheiratet (Geringverdienend)', pflicht: 'Ja' },
                  { klasse: 6, fb: '0 €', fuer: 'Zweitjob', pflicht: 'Ja' },
                ].map(row => (
                  <tr key={row.klasse} className={`border-b ${ausgewaehlteKlasse === row.klasse ? 'bg-primary/5 font-medium' : ''}`}>
                    <td className="py-2 pr-3 font-bold">{row.klasse}</td>
                    <td className="py-2 pr-3">{row.fb}</td>
                    <td className="py-2 pr-3">{row.fuer}</td>
                    <td className="py-2">{row.pflicht}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-2">* Bei IV/IV ohne Faktor keine Pflichtveranlagung. Bei IV+Faktor: Pflichtveranlagung.</p>
          </div>
        </CardContent>
      </Card>

      {/* Empfehlung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Empfehlung für Ehepaare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { kombi: 'IV / IV', wann: 'Beide verdienen ähnlich viel', vorteil: 'Kein großer Unterschied zur Einzelveranlagung, keine Pflichtveranlagung' },
              { kombi: 'III / V', wann: 'Großer Gehaltsunterschied (z.B. 70/30)', vorteil: 'Mehr Netto monatlich für den Besserverdienenden, aber Pflichtveranlagung' },
              { kombi: 'IV+Faktor', wann: 'Optimale monatliche Verteilung gewünscht', vorteil: 'Berücksichtigt Splittingvorteil schon im Lohnsteuerabzug' },
            ].map((e, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="font-medium text-sm">{e.kombi}</p>
                <p className="text-xs text-muted-foreground mt-1"><strong>Wann:</strong> {e.wann}</p>
                <p className="text-xs text-muted-foreground"><strong>Vorteil:</strong> {e.vorteil}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
