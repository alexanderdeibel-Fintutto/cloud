import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Building2, Plus, MapPin, Euro, Users, Home,
  Edit, Trash2, BarChart3, TrendingUp, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import MapView from '@/components/shared/MapView'
import CrossSellBanner from '@/components/shared/CrossSellBanner'

interface Immobilie {
  id: string
  bezeichnung: string
  typ: 'wohnung' | 'haus' | 'gewerbe' | 'grundstueck'
  adresse: string
  plz: string
  ort: string
  flaeche: number
  zimmer: number
  baujahr: number
  kaufpreis: number
  aktuellerWert: number
  mieteinnahmen: number
  einheiten: number
  mieter: number
}

const DEMO_IMMOBILIEN: Immobilie[] = [
  {
    id: '1', bezeichnung: 'MFH Berliner Str. 42', typ: 'haus',
    adresse: 'Berliner Str. 42', plz: '10115', ort: 'Berlin',
    flaeche: 480, zimmer: 12, baujahr: 1985, kaufpreis: 850000,
    aktuellerWert: 1120000, mieteinnahmen: 4200, einheiten: 6, mieter: 5,
  },
  {
    id: '2', bezeichnung: 'ETW Schiller-Allee 8', typ: 'wohnung',
    adresse: 'Schiller-Allee 8, 3. OG', plz: '80333', ort: 'München',
    flaeche: 85, zimmer: 3, baujahr: 2010, kaufpreis: 420000,
    aktuellerWert: 510000, mieteinnahmen: 1400, einheiten: 1, mieter: 1,
  },
  {
    id: '3', bezeichnung: 'Büro Hauptstr. 15', typ: 'gewerbe',
    adresse: 'Hauptstr. 15', plz: '20095', ort: 'Hamburg',
    flaeche: 220, zimmer: 6, baujahr: 2000, kaufpreis: 380000,
    aktuellerWert: 420000, mieteinnahmen: 2800, einheiten: 2, mieter: 2,
  },
]

const TYP_LABELS = { wohnung: 'Eigentumswohnung', haus: 'Mehrfamilienhaus', gewerbe: 'Gewerbe', grundstueck: 'Grundstück' }
const TYP_COLORS = { wohnung: 'bg-blue-100 text-blue-700', haus: 'bg-purple-100 text-purple-700', gewerbe: 'bg-orange-100 text-orange-700', grundstueck: 'bg-green-100 text-green-700' }

export default function ImmobilienPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [immobilien] = useState(DEMO_IMMOBILIEN)

  const filtered = immobilien.filter((i) =>
    i.bezeichnung.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.ort.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const gesamtWert = immobilien.reduce((sum, i) => sum + i.aktuellerWert, 0)
  const gesamtMiete = immobilien.reduce((sum, i) => sum + i.mieteinnahmen, 0)
  const gesamtMieter = immobilien.reduce((sum, i) => sum + i.mieter, 0)
  const gesamtEinheiten = immobilien.reduce((sum, i) => sum + i.einheiten, 0)

  return (
    <div>
      <section className="gradient-vermieter py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Startseite
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Immobilien-Verwaltung</h1>
                <p className="text-white/80">Alle deine Objekte im Überblick</p>
              </div>
            </div>
            <Button
              className="bg-white text-purple-700 hover:bg-white/90 hidden md:flex"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Objekt hinzufügen
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{immobilien.length}</p>
                    <p className="text-xs text-muted-foreground">Objekte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Euro className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(gesamtWert)}</p>
                    <p className="text-xs text-muted-foreground">Gesamtwert</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(gesamtMiete)}/Mo.</p>
                    <p className="text-xs text-muted-foreground">Mieteinnahmen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{gesamtMieter} / {gesamtEinheiten}</p>
                    <p className="text-xs text-muted-foreground">Mieter / Einheiten</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Objekte suchen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Form */}
          {showAddForm && (
            <Card className="mb-6 border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Neues Objekt hinzufügen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Bezeichnung *</label>
                    <input type="text" placeholder="z.B. MFH Berliner Str. 42" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Typ</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                      <option value="wohnung">Eigentumswohnung</option>
                      <option value="haus">Mehrfamilienhaus</option>
                      <option value="gewerbe">Gewerbe</option>
                      <option value="grundstueck">Grundstück</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Straße</label>
                    <input type="text" placeholder="Musterstraße 1" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">PLZ</label>
                    <input type="text" placeholder="10115" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Ort</label>
                    <input type="text" placeholder="Berlin" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Fläche (m²)</label>
                    <input type="number" placeholder="120" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button size="sm">Speichern</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Abbrechen</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map View */}
          <MapView
            markers={immobilien.map((i) => ({
              id: i.id,
              lat: i.ort === 'Berlin' ? 52.52 : i.ort === 'München' ? 48.1351 : 53.5511,
              lng: i.ort === 'Berlin' ? 13.405 : i.ort === 'München' ? 11.582 : 9.9937,
              label: i.bezeichnung,
              type: 'property' as const,
              details: `${i.ort} - ${formatCurrency(i.mieteinnahmen)}/Mo.`,
            }))}
            className="mb-6"
          />

          {/* Immobilien List */}
          <div className="space-y-4">
            {filtered.map((immo) => (
              <Card key={immo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${TYP_COLORS[immo.typ]}`}>
                      {immo.typ === 'haus' ? <Building2 className="h-7 w-7" /> : <Home className="h-7 w-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{immo.bezeichnung}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${TYP_COLORS[immo.typ]}`}>
                          {TYP_LABELS[immo.typ]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {immo.adresse}, {immo.plz} {immo.ort}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <span className="text-muted-foreground">{immo.flaeche} m²</span>
                        <span className="text-muted-foreground">{immo.zimmer} Zimmer</span>
                        <span className="text-muted-foreground">Bj. {immo.baujahr}</span>
                        <span className="text-muted-foreground">{immo.einheiten} Einheiten</span>
                        <span className="text-muted-foreground">{immo.mieter} Mieter</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-lg">{formatCurrency(immo.mieteinnahmen)}<span className="text-sm text-muted-foreground">/Mo.</span></p>
                      <p className="text-sm text-muted-foreground">Wert: {formatCurrency(immo.aktuellerWert)}</p>
                      <div className="flex gap-1 mt-2 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cross-Sell */}
          <div className="mt-8">
            <CrossSellBanner currentApp="Portal" context="rechner" maxItems={2} />
          </div>
        </div>
      </section>
    </div>
  )
}
