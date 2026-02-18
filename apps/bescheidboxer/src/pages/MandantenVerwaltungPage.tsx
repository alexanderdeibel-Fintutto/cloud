import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Users, Search, Plus, Mail, Phone, FileText, ChevronDown, ChevronRight, Building2, Calendar } from 'lucide-react'

interface Mandant {
  id: string
  name: string
  typ: 'privatperson' | 'unternehmen' | 'freiberufler'
  steuernummer?: string
  email: string
  telefon: string
  adresse: string
  bescheideAnzahl: number
  offeneEinsprueche: number
  naechsteFrist?: string
  notizen?: string
  erstellt: string
}

const TYP_CONFIG: Record<string, { label: string; color: string }> = {
  privatperson: { label: 'Privatperson', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  unternehmen: { label: 'Unternehmen', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  freiberufler: { label: 'Freiberufler', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
}

const DEMO_MANDANTEN: Mandant[] = [
  {
    id: 'm-1', name: 'Familie Schmidt', typ: 'privatperson',
    steuernummer: '123/456/78901', email: 'schmidt@email.de', telefon: '0221 / 111 222',
    adresse: 'Hauptstr. 15, 50667 Köln', bescheideAnzahl: 8, offeneEinsprueche: 1,
    naechsteFrist: '2026-03-15', notizen: 'Grundsteuer-Einspruch läuft. Nachweise nachreichen.',
    erstellt: '2024-06-01',
  },
  {
    id: 'm-2', name: 'TechStart GmbH', typ: 'unternehmen',
    steuernummer: '234/567/89012', email: 'buchhaltung@techstart.de', telefon: '0211 / 333 444',
    adresse: 'Innovationspark 8, 40210 Düsseldorf', bescheideAnzahl: 15, offeneEinsprueche: 2,
    naechsteFrist: '2026-02-28', notizen: 'GewSt und USt-Einspruch. Betriebsprüfung Q3 angesetzt.',
    erstellt: '2023-11-15',
  },
  {
    id: 'm-3', name: 'Dr. Anna Bauer', typ: 'freiberufler',
    steuernummer: '345/678/90123', email: 'bauer@praxis.de', telefon: '0228 / 555 666',
    adresse: 'Arztweg 3, 53111 Bonn', bescheideAnzahl: 6, offeneEinsprueche: 0,
    erstellt: '2025-01-10',
  },
  {
    id: 'm-4', name: 'Müller Immobilien KG', typ: 'unternehmen',
    steuernummer: '456/789/01234', email: 'info@mueller-immo.de', telefon: '0201 / 777 888',
    adresse: 'Bismarckstr. 22, 45127 Essen', bescheideAnzahl: 24, offeneEinsprueche: 3,
    naechsteFrist: '2026-03-01', notizen: '5 Grundsteuerbescheide angefochten. Gutachten bestellt.',
    erstellt: '2023-03-20',
  },
  {
    id: 'm-5', name: 'Peter Klein', typ: 'privatperson',
    email: 'klein.peter@gmx.de', telefon: '0221 / 999 000',
    adresse: 'Gartenstr. 7, 50823 Köln', bescheideAnzahl: 3, offeneEinsprueche: 0,
    erstellt: '2025-08-01',
  },
  {
    id: 'm-6', name: 'Lisa Meier Grafikdesign', typ: 'freiberufler',
    steuernummer: '567/890/12345', email: 'lisa@meier-design.de', telefon: '0211 / 222 111',
    adresse: 'Kreativhof 12, 40213 Düsseldorf', bescheideAnzahl: 5, offeneEinsprueche: 1,
    naechsteFrist: '2026-04-10', notizen: 'USt-Voranmeldung Q4 noch offen.',
    erstellt: '2024-09-15',
  },
]

export default function MandantenVerwaltungPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterTyp, setFilterTyp] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = DEMO_MANDANTEN
    .filter(m => {
      if (filterTyp !== 'alle' && m.typ !== filterTyp) return false
      if (suchbegriff) {
        const q = suchbegriff.toLowerCase()
        return m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.adresse.toLowerCase().includes(q) ||
          (m.steuernummer && m.steuernummer.includes(q))
      }
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const stats = {
    gesamt: DEMO_MANDANTEN.length,
    offeneEinsprueche: DEMO_MANDANTEN.reduce((s, m) => s + m.offeneEinsprueche, 0),
    bescheideGesamt: DEMO_MANDANTEN.reduce((s, m) => s + m.bescheideAnzahl, 0),
    mitFristen: DEMO_MANDANTEN.filter(m => m.naechsteFrist).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mandantenverwaltung</h1>
          <p className="text-muted-foreground mt-1">
            Überblick über alle Mandanten und deren Steuerangelegenheiten
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Mandant anlegen
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Mandanten</p>
            <p className="text-2xl font-bold mt-1">{stats.gesamt}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Offene Einsprüche</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.offeneEinsprueche}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bescheide gesamt</p>
            <p className="text-2xl font-bold mt-1 text-primary">{stats.bescheideGesamt}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Mit laufenden Fristen</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.mitFristen}</p>
          </CardContent>
        </Card>
      </div>

      {/* Suche & Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Name, E-Mail, Adresse oder Steuernummer..."
              value={suchbegriff}
              onChange={e => setSuchbegriff(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'alle', label: 'Alle' },
            { key: 'privatperson', label: 'Privat' },
            { key: 'unternehmen', label: 'Unternehmen' },
            { key: 'freiberufler', label: 'Freiberufler' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterTyp(f.key)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                filterTyp === f.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} Mandanten</p>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map(mandant => {
          const isExpanded = expandedId === mandant.id
          const typConf = TYP_CONFIG[mandant.typ]

          return (
            <Card key={mandant.id}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : mandant.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {mandant.typ === 'unternehmen'
                      ? <Building2 className="h-5 w-5 text-primary" />
                      : <Users className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{mandant.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typConf.color}`}>
                        {typConf.label}
                      </span>
                      {mandant.offeneEinsprueche > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {mandant.offeneEinsprueche} Einsprüche
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{mandant.adresse}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-medium">{mandant.bescheideAnzahl} Bescheide</p>
                    {mandant.naechsteFrist && (
                      <p className="text-xs text-red-600 flex items-center gap-1 justify-end mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Frist: {new Date(mandant.naechsteFrist).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{mandant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{mandant.telefon}</span>
                    </div>
                    {mandant.steuernummer && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>StNr.: {mandant.steuernummer}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Mandant seit {new Date(mandant.erstellt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  {mandant.notizen && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notizen</p>
                      <p>{mandant.notizen}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
