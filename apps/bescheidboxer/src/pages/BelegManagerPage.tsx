import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Receipt, Search, Filter, Upload, CheckCircle2, Clock, XCircle, Eye, ChevronDown, ChevronRight, Calendar, Tag } from 'lucide-react'

interface Beleg {
  id: string
  dateiname: string
  datum: string
  betrag: number
  kategorie: string
  beschreibung: string
  ocrStatus: 'ausstehend' | 'verarbeitet' | 'fehlgeschlagen'
  erkannterText?: string
  steuerrelevant: boolean
  zugeordnet?: string
}

const KATEGORIEN = [
  'Fahrtkosten',
  'Arbeitsmittel',
  'Bewirtung',
  'Fortbildung',
  'Versicherung',
  'Handwerker',
  'Bürobedarf',
  'Miete & Nebenkosten',
  'Telefon & Internet',
  'Sonstiges',
]

const OCR_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ausstehend: { label: 'Ausstehend', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Clock },
  verarbeitet: { label: 'Verarbeitet', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  fehlgeschlagen: { label: 'Fehlgeschlagen', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
}

const DEMO_BELEGE: Beleg[] = [
  { id: 'b-1', dateiname: 'tankquittung_2026-02-14.pdf', datum: '2026-02-14', betrag: 82.50, kategorie: 'Fahrtkosten', beschreibung: 'Tankquittung Shell Köln', ocrStatus: 'verarbeitet', erkannterText: 'Shell Station Köln-Ehrenfeld, Diesel 82,50 EUR', steuerrelevant: true, zugeordnet: 'ESt 2026' },
  { id: 'b-2', dateiname: 'laptop_rechnung.pdf', datum: '2026-01-20', betrag: 1299.00, kategorie: 'Arbeitsmittel', beschreibung: 'MacBook Air M4 - MediaMarkt', ocrStatus: 'verarbeitet', erkannterText: 'MediaMarkt Rechnung Nr. 4521789, Apple MacBook Air', steuerrelevant: true, zugeordnet: 'ESt 2026' },
  { id: 'b-3', dateiname: 'restaurant_beleg.jpg', datum: '2026-02-10', betrag: 145.80, kategorie: 'Bewirtung', beschreibung: 'Geschäftsessen Restaurant Da Vinci', ocrStatus: 'verarbeitet', erkannterText: 'Ristorante Da Vinci, 2 Personen, 145,80 EUR', steuerrelevant: true },
  { id: 'b-4', dateiname: 'fortbildung_zertifikat.pdf', datum: '2026-01-15', betrag: 490.00, kategorie: 'Fortbildung', beschreibung: 'Online-Kurs Steuerrecht Update 2026', ocrStatus: 'verarbeitet', erkannterText: 'Haufe Akademie, Steuerrecht-Update 2026', steuerrelevant: true },
  { id: 'b-5', dateiname: 'versicherung_q1.pdf', datum: '2026-01-05', betrag: 320.00, kategorie: 'Versicherung', beschreibung: 'Berufshaftpflicht Q1/2026', ocrStatus: 'verarbeitet', steuerrelevant: true, zugeordnet: 'ESt 2026' },
  { id: 'b-6', dateiname: 'handwerker_rechnung.pdf', datum: '2026-02-05', betrag: 850.00, kategorie: 'Handwerker', beschreibung: 'Maler- und Tapezierarbeiten Arbeitszimmer', ocrStatus: 'ausstehend', steuerrelevant: true },
  { id: 'b-7', dateiname: 'buero_amazon.jpg', datum: '2026-02-12', betrag: 45.99, kategorie: 'Bürobedarf', beschreibung: 'Druckerpapier und Toner', ocrStatus: 'verarbeitet', erkannterText: 'Amazon.de, Druckerpapier 500 Blatt, Toner HP', steuerrelevant: true },
  { id: 'b-8', dateiname: 'scan_unleserlich.jpg', datum: '2026-02-01', betrag: 0, kategorie: 'Sonstiges', beschreibung: 'Unleserlicher Kassenbon', ocrStatus: 'fehlgeschlagen', steuerrelevant: false },
  { id: 'b-9', dateiname: 'telekom_rechnung.pdf', datum: '2026-02-01', betrag: 59.95, kategorie: 'Telefon & Internet', beschreibung: 'Telekom Internet & Telefon Feb 2026', ocrStatus: 'verarbeitet', erkannterText: 'Deutsche Telekom, Rechnung Feb 2026, 59,95 EUR', steuerrelevant: true },
  { id: 'b-10', dateiname: 'miete_feb2026.pdf', datum: '2026-02-03', betrag: 280.00, kategorie: 'Miete & Nebenkosten', beschreibung: 'Anteilige Miete Arbeitszimmer Feb 2026', ocrStatus: 'verarbeitet', steuerrelevant: true, zugeordnet: 'ESt 2026' },
]

export default function BelegManagerPage() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterKategorie, setFilterKategorie] = useState<string>('alle')
  const [filterStatus, setFilterStatus] = useState<string>('alle')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return DEMO_BELEGE
      .filter(b => {
        if (filterKategorie !== 'alle' && b.kategorie !== filterKategorie) return false
        if (filterStatus !== 'alle' && b.ocrStatus !== filterStatus) return false
        if (suchbegriff) {
          const q = suchbegriff.toLowerCase()
          return b.dateiname.toLowerCase().includes(q) ||
            b.beschreibung.toLowerCase().includes(q) ||
            b.kategorie.toLowerCase().includes(q) ||
            (b.erkannterText && b.erkannterText.toLowerCase().includes(q))
        }
        return true
      })
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
  }, [suchbegriff, filterKategorie, filterStatus])

  const stats = {
    gesamt: DEMO_BELEGE.length,
    verarbeitet: DEMO_BELEGE.filter(b => b.ocrStatus === 'verarbeitet').length,
    gesamtBetrag: DEMO_BELEGE.filter(b => b.steuerrelevant).reduce((s, b) => s + b.betrag, 0),
    zugeordnet: DEMO_BELEGE.filter(b => b.zugeordnet).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Beleg-Manager</h1>
          <p className="text-muted-foreground mt-1">
            Belege verwalten, OCR-Status prüfen und Steuererklärungen zuordnen
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload className="h-4 w-4" />
          Beleg hochladen
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Belege gesamt</p>
            <p className="text-2xl font-bold mt-1">{stats.gesamt}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">OCR verarbeitet</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.verarbeitet}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuerrel. Summe</p>
            <p className="text-2xl font-bold mt-1 text-primary">{stats.gesamtBetrag.toLocaleString('de-DE')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Zugeordnet</p>
            <p className="text-2xl font-bold mt-1">{stats.zugeordnet}/{stats.gesamt}</p>
          </CardContent>
        </Card>
      </div>

      {/* Suche & Filter */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Beleg suchen (Name, Beschreibung, OCR-Text)..."
              value={suchbegriff}
              onChange={e => setSuchbegriff(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted-foreground flex items-center gap-1"><Filter className="h-3 w-3" /> Kategorie</label>
              <select value={filterKategorie} onChange={e => setFilterKategorie(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="alle">Alle Kategorien</option>
                {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted-foreground">OCR-Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="alle">Alle</option>
                <option value="verarbeitet">Verarbeitet</option>
                <option value="ausstehend">Ausstehend</option>
                <option value="fehlgeschlagen">Fehlgeschlagen</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{filtered.length} Belege</p>

      {/* Belegliste */}
      <div className="space-y-3">
        {filtered.map(beleg => {
          const isExpanded = expandedId === beleg.id
          const statusConf = OCR_STATUS_CONFIG[beleg.ocrStatus]
          const StatusIcon = statusConf.icon

          return (
            <Card key={beleg.id}>
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : beleg.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{beleg.beschreibung}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusConf.color}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {statusConf.label}
                      </span>
                      {beleg.steuerrelevant && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Steuerrelevant
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(beleg.datum).toLocaleDateString('de-DE')}</span>
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{beleg.kategorie}</span>
                      <span className="truncate">{beleg.dateiname}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {beleg.betrag > 0 && (
                      <p className="text-sm font-medium">{beleg.betrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                    )}
                    {beleg.zugeordnet && (
                      <p className="text-xs text-green-600 mt-0.5">{beleg.zugeordnet}</p>
                    )}
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  {beleg.erkannterText && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> OCR-erkannter Text
                      </p>
                      <p className="text-sm">{beleg.erkannterText}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors">
                      Bescheid zuordnen
                    </button>
                    <button className="px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors">
                      Kategorie ändern
                    </button>
                    <button className="px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors">
                      OCR erneut starten
                    </button>
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
