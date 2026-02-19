import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight, Info } from 'lucide-react'

interface PruefBereich {
  id: string
  name: string
  beschreibung: string
  risiko: 'gering' | 'mittel' | 'hoch'
  items: PruefItem[]
}

interface PruefItem {
  id: string
  text: string
  erledigt: boolean
  wichtig: boolean
}

const RISIKO_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  gering: { label: 'Geringes Risiko', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  mittel: { label: 'Mittleres Risiko', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: AlertTriangle },
  hoch: { label: 'Hohes Risiko', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
}

const INITIAL_BEREICHE: PruefBereich[] = [
  {
    id: 'b-1', name: 'Buchführung & Aufzeichnungen', beschreibung: 'Vollständigkeit und Ordnungsmäßigkeit der Buchführung', risiko: 'hoch',
    items: [
      { id: 'i-1', text: 'Alle Einnahmen lückenlos erfasst (Kassenbuch, Bankauszüge)', erledigt: false, wichtig: true },
      { id: 'i-2', text: 'Belege für alle Betriebsausgaben vorhanden', erledigt: false, wichtig: true },
      { id: 'i-3', text: 'Privatentnahmen und -einlagen korrekt gebucht', erledigt: false, wichtig: true },
      { id: 'i-4', text: 'Rechnungen entsprechen § 14 UStG (Pflichtangaben)', erledigt: false, wichtig: false },
      { id: 'i-5', text: 'GoBD-konforme Archivierung sichergestellt', erledigt: false, wichtig: true },
    ],
  },
  {
    id: 'b-2', name: 'Umsatzsteuer', beschreibung: 'Korrektheit der Umsatzsteuer-Voranmeldungen und -Erklärung', risiko: 'mittel',
    items: [
      { id: 'i-6', text: 'Umsatzsteuer-Voranmeldungen pünktlich abgegeben', erledigt: true, wichtig: true },
      { id: 'i-7', text: 'Vorsteuerabzug nur mit ordnungsgemäßen Rechnungen', erledigt: false, wichtig: true },
      { id: 'i-8', text: 'Innergemeinschaftliche Lieferungen korrekt dokumentiert', erledigt: false, wichtig: false },
      { id: 'i-9', text: 'Umsatzsteuer-ID bei EU-Geschäften geprüft', erledigt: true, wichtig: false },
    ],
  },
  {
    id: 'b-3', name: 'Lohn & Gehalt', beschreibung: 'Korrektheit der Lohnabrechnungen und Sozialversicherungsbeiträge', risiko: 'mittel',
    items: [
      { id: 'i-10', text: 'Lohnabrechnungen vollständig und korrekt', erledigt: true, wichtig: true },
      { id: 'i-11', text: 'Minijob-Regelungen eingehalten (520 €-Grenze)', erledigt: true, wichtig: false },
      { id: 'i-12', text: 'Sachbezüge korrekt versteuert (Firmenwagen, Gutscheine)', erledigt: false, wichtig: true },
      { id: 'i-13', text: 'Reisekostenabrechnung mit Belegen', erledigt: false, wichtig: false },
    ],
  },
  {
    id: 'b-4', name: 'Abschreibungen & Anlagevermögen', beschreibung: 'Korrekte AfA und Bestandsverzeichnisse', risiko: 'gering',
    items: [
      { id: 'i-14', text: 'Anlageverzeichnis aktuell und vollständig', erledigt: false, wichtig: true },
      { id: 'i-15', text: 'AfA-Tabellen korrekt angewendet', erledigt: false, wichtig: true },
      { id: 'i-16', text: 'GWG-Grenze (800 €) beachtet', erledigt: true, wichtig: false },
      { id: 'i-17', text: 'Sonderabschreibungen dokumentiert', erledigt: false, wichtig: false },
    ],
  },
  {
    id: 'b-5', name: 'Verträge & Beziehungen', beschreibung: 'Verträge mit nahestehenden Personen und Gesellschaftern', risiko: 'hoch',
    items: [
      { id: 'i-18', text: 'Verträge mit Angehörigen fremdüblich gestaltet', erledigt: false, wichtig: true },
      { id: 'i-19', text: 'Geschäftsführergehalt bei GmbH angemessen', erledigt: false, wichtig: true },
      { id: 'i-20', text: 'Darlehensverträge schriftlich und verzinst', erledigt: false, wichtig: true },
      { id: 'i-21', text: 'Mietverträge für betrieblich genutzte Privaträume vorhanden', erledigt: false, wichtig: false },
    ],
  },
]

export default function BetriebspruefungPage() {
  const [bereiche, setBereiche] = useState(INITIAL_BEREICHE)
  const [expandedId, setExpandedId] = useState<string | null>('b-1')

  const toggleItem = (bereichId: string, itemId: string) => {
    setBereiche(prev => prev.map(b =>
      b.id === bereichId
        ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, erledigt: !i.erledigt } : i) }
        : b
    ))
  }

  const gesamtItems = bereiche.reduce((s, b) => s + b.items.length, 0)
  const erledigteItems = bereiche.reduce((s, b) => s + b.items.filter(i => i.erledigt).length, 0)
  const fortschritt = gesamtItems > 0 ? Math.round((erledigteItems / gesamtItems) * 100) : 0

  const risikoScore = (() => {
    let score = 0
    bereiche.forEach(b => {
      const unerledigte = b.items.filter(i => !i.erledigt)
      const wichtigeUnerledigte = unerledigte.filter(i => i.wichtig)
      if (b.risiko === 'hoch') score += wichtigeUnerledigte.length * 3 + unerledigte.length
      else if (b.risiko === 'mittel') score += wichtigeUnerledigte.length * 2 + unerledigte.length * 0.5
      else score += wichtigeUnerledigte.length + unerledigte.length * 0.3
    })
    return Math.min(100, Math.round(score * 2.5))
  })()

  const risikoLabel = risikoScore <= 30 ? 'Gut vorbereitet' : risikoScore <= 60 ? 'Teilweise vorbereitet' : 'Handlungsbedarf'
  const risikoColor = risikoScore <= 30 ? 'text-green-600' : risikoScore <= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Betriebsprüfungs-Vorbereitung</h1>
        <p className="text-muted-foreground mt-1">
          Checklisten und Risikobewertung für eine mögliche Betriebsprüfung
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Fortschritt</p>
            <p className="text-2xl font-bold mt-1">{erledigteItems}/{gesamtItems} ({fortschritt}%)</p>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${fortschritt}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Risiko-Score</p>
            <p className={`text-2xl font-bold mt-1 ${risikoColor}`}>{risikoScore}/100</p>
            <p className={`text-sm mt-1 ${risikoColor}`}>{risikoLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Prüfungsbereiche</p>
            <p className="text-2xl font-bold mt-1">{bereiche.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {bereiche.filter(b => b.risiko === 'hoch').length} hohes Risiko
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Hinweis zur Betriebsprüfung</p>
            <p className="text-muted-foreground mt-1">
              Eine Betriebsprüfung wird in der Regel 2-4 Wochen vorher angekündigt.
              Bereiten Sie sich proaktiv vor, indem Sie alle Checklisten-Punkte abarbeiten.
              Bei hohem Risiko empfehlen wir die Hinzuziehung eines Steuerberaters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bereiche */}
      <div className="space-y-4">
        {bereiche.map(bereich => {
          const isExpanded = expandedId === bereich.id
          const rConf = RISIKO_CONFIG[bereich.risiko]
          const RIcon = rConf.icon
          const erledigtCount = bereich.items.filter(i => i.erledigt).length
          const progress = Math.round((erledigtCount / bereich.items.length) * 100)

          return (
            <Card key={bereich.id}>
              <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : bereich.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${rConf.color}`}>
                    <RIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{bereich.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${rConf.color}`}>{rConf.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{bereich.beschreibung}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{erledigtCount}/{bereich.items.length}</p>
                    <div className="mt-1 w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3">
                  <div className="space-y-2">
                    {bereich.items.map(item => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer py-1.5 hover:bg-muted/30 rounded-md px-2 -mx-2 transition-colors">
                        <input
                          type="checkbox"
                          checked={item.erledigt}
                          onChange={() => toggleItem(bereich.id, item.id)}
                          className="rounded mt-0.5"
                        />
                        <span className={`text-sm flex-1 ${item.erledigt ? 'line-through text-muted-foreground' : ''}`}>
                          {item.text}
                        </span>
                        {item.wichtig && !item.erledigt && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shrink-0">
                            Wichtig
                          </span>
                        )}
                      </label>
                    ))}
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
