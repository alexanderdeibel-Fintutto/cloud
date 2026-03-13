import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ClipboardList, Info, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

interface CheckItem {
  id: string
  label: string
  info?: string
  pflicht?: boolean
}

interface Kategorie {
  id: string
  name: string
  items: CheckItem[]
}

const KATEGORIEN: Kategorie[] = [
  {
    id: 'pflicht',
    name: 'Pflichtangaben',
    items: [
      { id: 'p1', label: 'Steuernummer / Steuer-ID', pflicht: true },
      { id: 'p2', label: 'Personalausweis / Reisepass (Identifikation)', pflicht: true },
      { id: 'p3', label: 'Bankverbindung fuer Erstattung', pflicht: true },
      { id: 'p4', label: 'Lohnsteuerbescheinigung(en)', pflicht: true, info: 'Vom Arbeitgeber bis Ende Februar' },
      { id: 'p5', label: 'Vorjahresbescheid (falls vorhanden)', info: 'Fuer Verlustvortrag und Vergleich' },
    ],
  },
  {
    id: 'werbung',
    name: 'Werbungskosten (Anlage N)',
    items: [
      { id: 'w1', label: 'Fahrten Wohnung–Arbeit (Entfernungspauschale)', info: 'Einfache Strecke × 0,30/0,38 EUR × Arbeitstage' },
      { id: 'w2', label: 'Homeoffice-Pauschale (max. 1.260 EUR)', info: '6 EUR/Tag, max. 210 Tage' },
      { id: 'w3', label: 'Arbeitsmittel (PC, Schreibtisch, Fachliteratur)' },
      { id: 'w4', label: 'Fortbildungskosten (Kurse, Seminare, Studium)' },
      { id: 'w5', label: 'Berufskleidung (typische Berufskleidung)' },
      { id: 'w6', label: 'Reisekosten (Dienstreisen)', info: 'Fahrtkosten, Verpflegungsmehraufwand, Uebernachtung' },
      { id: 'w7', label: 'Bewerbungskosten (Porto, Fotos, Fahrtkosten)' },
      { id: 'w8', label: 'Umzugskosten (beruflich veranlasst)' },
      { id: 'w9', label: 'Doppelte Haushaltsfuehrung' },
      { id: 'w10', label: 'Gewerkschaftsbeitraege / Berufsverband' },
      { id: 'w11', label: 'Kontoführungsgebuehren (Pauschale 16 EUR)' },
      { id: 'w12', label: 'Telefon/Internet (beruflicher Anteil)' },
    ],
  },
  {
    id: 'sonderausgaben',
    name: 'Sonderausgaben',
    items: [
      { id: 's1', label: 'Kranken-/Pflegeversicherung (Basisabsicherung)', pflicht: true, info: 'Wird meist elektronisch uebermittelt' },
      { id: 's2', label: 'Riester-Beitraege (Anlage AV)', info: 'Max. 2.100 EUR inkl. Zulagen' },
      { id: 's3', label: 'Ruerup-Beitraege (Basisrente)', info: '2025: 100% abzugsfaehig, max. 27.566 EUR' },
      { id: 's4', label: 'Kirchensteuer (gezahlt im Veranlagungsjahr)' },
      { id: 's5', label: 'Spenden und Mitgliedsbeitraege', info: 'Zuwendungsbestaetigungen beifuegen' },
      { id: 's6', label: 'Schulgeld (30%, max. 5.000 EUR)' },
      { id: 's7', label: 'Berufsausbildungskosten (Erstausbildung max. 6.000 EUR)' },
      { id: 's8', label: 'Unterhaltsleistungen an Ex-Partner (§ 10 Abs. 1a)', info: 'Realsplitting: max. 14.748 EUR' },
    ],
  },
  {
    id: 'agbelastungen',
    name: 'Aussergewoehnliche Belastungen',
    items: [
      { id: 'a1', label: 'Krankheitskosten (Arzt, Zahnarzt, Brille, Medikamente)', info: 'Abzgl. zumutbare Belastung' },
      { id: 'a2', label: 'Pflegekosten / Behinderung', info: 'Behinderten-Pauschbetrag oder Einzelnachweis' },
      { id: 'a3', label: 'Bestattungskosten (Erbschaft reicht nicht aus)' },
      { id: 'a4', label: 'Unterhalt an beduerftige Angehoerige (§ 33a)', info: 'Max. 11.784 EUR + KV/PV' },
      { id: 'a5', label: 'Scheidungskosten (nur Prozesskosten, BFH)' },
    ],
  },
  {
    id: 'haushalt',
    name: 'Haushaltsnahe Dienste & Handwerker (§ 35a)',
    items: [
      { id: 'h1', label: 'Minijob im Haushalt (20%, max. 510 EUR)', info: 'Haushaltshilfe als Minijob' },
      { id: 'h2', label: 'Haushaltsnahe Dienstleistungen (20%, max. 4.000 EUR)', info: 'Reinigung, Gartenpflege, Betreuung' },
      { id: 'h3', label: 'Handwerkerleistungen (20%, max. 1.200 EUR)', info: 'Nur Arbeitslohn, kein Material' },
      { id: 'h4', label: 'Nebenkostenabrechnung (Haushaltsnahe Anteile)' },
    ],
  },
  {
    id: 'kinder',
    name: 'Kinder',
    items: [
      { id: 'k1', label: 'Anlage Kind (pro Kind)', pflicht: true, info: 'Kindergeld vs. Kinderfreibetrag Guenstigerpruefung' },
      { id: 'k2', label: 'Kinderbetreuungskosten (2/3, max. 4.000 EUR)', info: 'Kita, Tagesmutter, Hort (bis 14 Jahre)' },
      { id: 'k3', label: 'Entlastungsbetrag Alleinerziehende (4.260 EUR + 240 EUR)', info: 'Steuerklasse II, Anlage Kind' },
      { id: 'k4', label: 'Ausbildungsfreibetrag (1.200 EUR)', info: 'Volljaehriges Kind in Ausbildung, auswaertig' },
      { id: 'k5', label: 'Schulgeld (Privatschule)' },
    ],
  },
  {
    id: 'kapital',
    name: 'Kapitalertraege (Anlage KAP)',
    items: [
      { id: 'kap1', label: 'Steuerbescheinigung der Bank(en)', info: 'Nur bei Guenstigerpruefung oder fehlender Abfuehrung' },
      { id: 'kap2', label: 'Auslaendische Kapitalertraege' },
      { id: 'kap3', label: 'Verlustbescheinigung (beantragt bis 15.12.)' },
      { id: 'kap4', label: 'Freistellungsauftraege pruefen (1.000/2.000 EUR)' },
    ],
  },
  {
    id: 'vermietung',
    name: 'Vermietung (Anlage V)',
    items: [
      { id: 'v1', label: 'Mieteinnahmen (Mietvertraege)' },
      { id: 'v2', label: 'Nebenkosten-Abrechnung (Umlagen)' },
      { id: 'v3', label: 'Abschreibung (AfA) Gebaeude', info: '2% / 2,5% / 3% je nach Baujahr' },
      { id: 'v4', label: 'Darlehenszinsen (Finanzierung)' },
      { id: 'v5', label: 'Instandhaltungskosten / Renovierung' },
      { id: 'v6', label: 'Grundsteuer, Versicherungen, Hausverwaltung' },
    ],
  },
]

export default function SteuererklaerungChecklistePage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(KATEGORIEN.map(k => [k.id, true]))
  )

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleKategorie = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const stats = useMemo(() => {
    const total = KATEGORIEN.reduce((s, k) => s + k.items.length, 0)
    const done = Object.values(checked).filter(Boolean).length
    const pflichtTotal = KATEGORIEN.reduce((s, k) => s + k.items.filter(i => i.pflicht).length, 0)
    const pflichtDone = KATEGORIEN.reduce((s, k) => s + k.items.filter(i => i.pflicht && checked[i.id]).length, 0)

    const perKategorie = KATEGORIEN.map(k => ({
      ...k,
      total: k.items.length,
      done: k.items.filter(i => checked[i.id]).length,
    }))

    return { total, done, pflichtTotal, pflichtDone, perKategorie, prozent: total > 0 ? Math.round(done / total * 100) : 0 }
  }, [checked])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Steuererklaerung Checkliste
        </h1>
        <p className="text-muted-foreground mt-1">
          Alle Unterlagen und Belege im Ueberblick
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="pt-4">
          <div className="flex gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200">
              <p>Haken Sie alle vorhandenen Belege und Unterlagen ab. <strong>Pflichtangaben</strong> sind markiert. Die Checkliste deckt die wichtigsten Anlagen der Einkommensteuererklaerung ab.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fortschritt */}
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Fortschritt</span>
            <span className="text-sm text-muted-foreground">{stats.done} / {stats.total} ({stats.prozent}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${stats.prozent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Pflicht: {stats.pflichtDone}/{stats.pflichtTotal}</span>
            <span>{stats.total - stats.done} offen</span>
          </div>
        </CardContent>
      </Card>

      {/* Kategorien */}
      {KATEGORIEN.map(kat => {
        const katStats = stats.perKategorie.find(k => k.id === kat.id)
        const isExpanded = expanded[kat.id]
        return (
          <Card key={kat.id}>
            <CardHeader className="cursor-pointer" onClick={() => toggleKategorie(kat.id)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {kat.name}
                </CardTitle>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  katStats && katStats.done === katStats.total
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {katStats?.done}/{katStats?.total}
                </span>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {kat.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${checked[item.id] ? 'opacity-60' : ''}`}
                      onClick={() => toggle(item.id)}
                    >
                      {checked[item.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${checked[item.id] ? 'line-through' : ''}`}>
                          {item.label}
                          {item.pflicht && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        {item.info && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.info}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fristen 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">31.07.2026</p>
              <p className="text-xs text-muted-foreground">Abgabefrist (ohne Berater)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">30.04.2027</p>
              <p className="text-xs text-muted-foreground">Abgabefrist (mit Steuerberater)</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-lg font-bold">4 Jahre</p>
              <p className="text-xs text-muted-foreground">Freiwillige Abgabe (Antragsveranlagung)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
