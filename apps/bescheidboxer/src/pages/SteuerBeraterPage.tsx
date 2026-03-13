import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Search, Star, MapPin, Phone, Mail, Globe, Filter, Award, Clock, ChevronDown, ChevronRight } from 'lucide-react'

interface SteuerBerater {
  id: string
  name: string
  kanzlei: string
  fachgebiete: string[]
  plz: string
  ort: string
  telefon: string
  email: string
  website?: string
  bewertung: number
  bewertungenAnzahl: number
  erstberatungKostenlos: boolean
  sprechzeiten: string
  beschreibung: string
}

const FACHGEBIETE = [
  'Einkommensteuer',
  'Grundsteuer',
  'Gewerbesteuer',
  'Umsatzsteuer',
  'Erbschaftsteuer',
  'Immobilienbesteuerung',
  'Lohnbuchhaltung',
  'Betriebsprüfung',
  'Einspruchsverfahren',
  'Internationale Steuer',
]

const DEMO_BERATER: SteuerBerater[] = [
  {
    id: 'sb-1', name: 'Dr. Christina Müller', kanzlei: 'Müller & Partner StBG',
    fachgebiete: ['Einkommensteuer', 'Grundsteuer', 'Einspruchsverfahren', 'Immobilienbesteuerung'],
    plz: '50667', ort: 'Köln', telefon: '0221 / 123 456 0', email: 'info@mueller-stb.de', website: 'mueller-stb.de',
    bewertung: 4.8, bewertungenAnzahl: 142, erstberatungKostenlos: true, sprechzeiten: 'Mo-Fr 8:00-18:00',
    beschreibung: 'Spezialisiert auf Einspruchsverfahren und die neue Grundsteuerreform. 20 Jahre Erfahrung.',
  },
  {
    id: 'sb-2', name: 'Thomas Weber', kanzlei: 'Weber Steuerberatung',
    fachgebiete: ['Gewerbesteuer', 'Umsatzsteuer', 'Lohnbuchhaltung'],
    plz: '40210', ort: 'Düsseldorf', telefon: '0211 / 987 654 0', email: 'kontakt@weber-stb.de',
    bewertung: 4.5, bewertungenAnzahl: 89, erstberatungKostenlos: false, sprechzeiten: 'Mo-Fr 9:00-17:00',
    beschreibung: 'Betreuung von KMUs und Freiberuflern. Digitale Buchhaltung und DATEV-Anbindung.',
  },
  {
    id: 'sb-3', name: 'Sabine Richter-Koch', kanzlei: 'Richter & Kollegen',
    fachgebiete: ['Erbschaftsteuer', 'Immobilienbesteuerung', 'Grundsteuer'],
    plz: '53111', ort: 'Bonn', telefon: '0228 / 555 333 0', email: 'info@richter-kollegen.de', website: 'richter-kollegen.de',
    bewertung: 4.9, bewertungenAnzahl: 67, erstberatungKostenlos: true, sprechzeiten: 'Mo-Do 8:30-17:30, Fr 8:30-14:00',
    beschreibung: 'Experten für Vermögensnachfolge und Immobiliensteuerrecht. Persönliche Beratung.',
  },
  {
    id: 'sb-4', name: 'Michael Schneider', kanzlei: 'Schneider Tax GmbH',
    fachgebiete: ['Internationale Steuer', 'Umsatzsteuer', 'Gewerbesteuer', 'Betriebsprüfung'],
    plz: '45127', ort: 'Essen', telefon: '0201 / 444 222 0', email: 'office@schneider-tax.de', website: 'schneider-tax.de',
    bewertung: 4.6, bewertungenAnzahl: 114, erstberatungKostenlos: false, sprechzeiten: 'Mo-Fr 8:00-18:00, Sa nach Vereinbarung',
    beschreibung: 'Internationale Steuerberatung für Unternehmen. Spezialist für grenzüberschreitende Sachverhalte.',
  },
  {
    id: 'sb-5', name: 'Anna-Lena Hoffmann', kanzlei: 'Hoffmann Steuer & Recht',
    fachgebiete: ['Einkommensteuer', 'Einspruchsverfahren', 'Lohnbuchhaltung'],
    plz: '51065', ort: 'Köln', telefon: '0221 / 777 888 0', email: 'info@hoffmann-steuer.de',
    bewertung: 4.7, bewertungenAnzahl: 93, erstberatungKostenlos: true, sprechzeiten: 'Mo-Fr 9:00-18:00',
    beschreibung: 'Persönliche Steuerberatung für Arbeitnehmer und Familien. Hilfe bei Einsprüchen.',
  },
  {
    id: 'sb-6', name: 'Prof. Dr. Klaus Becker', kanzlei: 'Becker & Becker PartG',
    fachgebiete: ['Betriebsprüfung', 'Gewerbesteuer', 'Einkommensteuer', 'Erbschaftsteuer'],
    plz: '42103', ort: 'Wuppertal', telefon: '0202 / 333 111 0', email: 'sekretariat@becker-stb.de', website: 'becker-stb.de',
    bewertung: 4.4, bewertungenAnzahl: 56, erstberatungKostenlos: false, sprechzeiten: 'Mo-Fr 8:00-16:30',
    beschreibung: 'Erfahrene Kanzlei mit Schwerpunkt Betriebsprüfungen und Rechtsbehelfsverfahren.',
  },
]

export default function SteuerBeraterPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterFachgebiet, setFilterFachgebiet] = useState<string>('alle')
  const [nurKostenlos, setNurKostenlos] = useState(false)
  const [sortierung, setSortierung] = useState<'bewertung' | 'name' | 'ort'>('bewertung')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return DEMO_BERATER
      .filter(b => {
        if (suchbegriff) {
          const q = suchbegriff.toLowerCase()
          const match = b.name.toLowerCase().includes(q) ||
            b.kanzlei.toLowerCase().includes(q) ||
            b.ort.toLowerCase().includes(q) ||
            b.plz.includes(q) ||
            b.fachgebiete.some(f => f.toLowerCase().includes(q))
          if (!match) return false
        }
        if (filterFachgebiet !== 'alle' && !b.fachgebiete.includes(filterFachgebiet)) return false
        if (nurKostenlos && !b.erstberatungKostenlos) return false
        return true
      })
      .sort((a, b) => {
        if (sortierung === 'bewertung') return b.bewertung - a.bewertung
        if (sortierung === 'name') return a.name.localeCompare(b.name)
        return a.ort.localeCompare(b.ort)
      })
  }, [suchbegriff, filterFachgebiet, nurKostenlos, sortierung])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Steuerberater finden</h1>
        <p className="text-muted-foreground mt-1">
          Finden Sie den passenden Steuerberater in Ihrer Nähe
        </p>
      </div>

      {/* Suche & Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Name, Kanzlei, PLZ, Ort oder Fachgebiet..."
              value={suchbegriff}
              onChange={e => setSuchbegriff(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" /> Fachgebiet
              </label>
              <select
                value={filterFachgebiet}
                onChange={e => setFilterFachgebiet(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="alle">Alle Fachgebiete</option>
                {FACHGEBIETE.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-muted-foreground">Sortierung</label>
              <select
                value={sortierung}
                onChange={e => setSortierung(e.target.value as typeof sortierung)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="bewertung">Beste Bewertung</option>
                <option value="name">Name A-Z</option>
                <option value="ort">Ort A-Z</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={nurKostenlos}
                onChange={e => setNurKostenlos(e.target.checked)}
                className="rounded"
              />
              Kostenlose Erstberatung
            </label>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} Steuerberater gefunden</p>

      {/* Ergebnisse */}
      <div className="space-y-4">
        {filtered.map(berater => {
          const isExpanded = expandedId === berater.id
          return (
            <Card key={berater.id}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : berater.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {berater.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{berater.name}</h3>
                      {berater.erstberatungKostenlos && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Erstberatung kostenlos
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{berater.kanzlei}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {berater.plz} {berater.ort}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {berater.bewertung} ({berater.bewertungenAnzahl})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {berater.fachgebiete.map(f => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <p className="text-sm text-muted-foreground">{berater.beschreibung}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{berater.telefon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{berater.email}</span>
                    </div>
                    {berater.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{berater.website}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{berater.sprechzeiten}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{berater.bewertung}</span>
                    <span className="text-muted-foreground">/ 5.0 aus {berater.bewertungenAnzahl} Bewertungen</span>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Keine Steuerberater für Ihre Kriterien gefunden. Versuchen Sie andere Filter.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
