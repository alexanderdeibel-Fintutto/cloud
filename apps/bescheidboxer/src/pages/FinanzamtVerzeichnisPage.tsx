import { useState, useMemo } from 'react'
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Globe,
  Mail,
  ChevronRight,
  Map,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

interface Finanzamt {
  id: string
  name: string
  adresse: string
  plz: string
  ort: string
  bundesland: string
  telefon: string
  email: string
  website: string
  bufa: string // Bundesfinanzamtsnummer
}

const BUNDESLAENDER = [
  'Baden-Wuerttemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thueringen',
]

// Representative sample of Finanzaemter (in production this would be a full database)
const FINANZAEMTER: Finanzamt[] = [
  { id: '1', name: 'Finanzamt Muenchen I', adresse: 'Karlstr. 9-11', plz: '80333', ort: 'Muenchen', bundesland: 'Bayern', telefon: '089/1252-0', email: 'poststelle@fa-m1.bayern.de', website: 'www.finanzamt-muenchen-I.de', bufa: '9105' },
  { id: '2', name: 'Finanzamt Muenchen II', adresse: 'Deroystr. 20', plz: '80335', ort: 'Muenchen', bundesland: 'Bayern', telefon: '089/1252-0', email: 'poststelle@fa-m2.bayern.de', website: 'www.finanzamt-muenchen-II.de', bufa: '9106' },
  { id: '3', name: 'Finanzamt Nuernberg-Zentral', adresse: 'Krelingstr. 50', plz: '90408', ort: 'Nuernberg', bundesland: 'Bayern', telefon: '0911/3998-0', email: 'poststelle@fa-n-zentral.bayern.de', website: 'www.finanzamt-nuernberg-zentral.de', bufa: '9228' },
  { id: '4', name: 'Finanzamt fuer Koerperschaften I Berlin', adresse: 'Neue Jakobstr. 6-7', plz: '10179', ort: 'Berlin', bundesland: 'Berlin', telefon: '030/9024-0', email: 'poststelle@fa-koerp1.berlin.de', website: 'www.berlin.de/sen/finanzen/', bufa: '1127' },
  { id: '5', name: 'Finanzamt Berlin Mitte/Tiergarten', adresse: 'Neue Jakobstr. 6-7', plz: '10179', ort: 'Berlin', bundesland: 'Berlin', telefon: '030/9024-11-0', email: 'poststelle@fa-mitte.berlin.de', website: 'www.berlin.de/sen/finanzen/', bufa: '1113' },
  { id: '6', name: 'Finanzamt Hamburg-Mitte', adresse: 'Steinstr. 10', plz: '20095', ort: 'Hamburg', bundesland: 'Hamburg', telefon: '040/42853-0', email: 'poststelle@fa-hh-mitte.hamburg.de', website: 'www.hamburg.de/fa-mitte', bufa: '2217' },
  { id: '7', name: 'Finanzamt Hamburg-Nord', adresse: 'Borsteler Chaussee 45', plz: '22453', ort: 'Hamburg', bundesland: 'Hamburg', telefon: '040/42853-0', email: 'poststelle@fa-hh-nord.hamburg.de', website: 'www.hamburg.de/fa-nord', bufa: '2220' },
  { id: '8', name: 'Finanzamt Frankfurt am Main V-Hoechst', adresse: 'Gutleutstr. 116', plz: '60327', ort: 'Frankfurt am Main', bundesland: 'Hessen', telefon: '069/212-0', email: 'poststelle@fa-ffm5.hessen.de', website: 'www.finanzamt-frankfurt5.de', bufa: '2614' },
  { id: '9', name: 'Finanzamt Stuttgart I', adresse: 'Rotebuehlplatz 30', plz: '70178', ort: 'Stuttgart', bundesland: 'Baden-Wuerttemberg', telefon: '0711/6673-0', email: 'poststelle@fa-s1.bwl.de', website: 'www.fa-stuttgart.de', bufa: '2846' },
  { id: '10', name: 'Finanzamt Koeln-Altstadt', adresse: 'Am Weidenbach 6', plz: '50676', ort: 'Koeln', bundesland: 'Nordrhein-Westfalen', telefon: '0221/2026-0', email: 'poststelle@fa-5214.fin-nrw.de', website: 'www.finanzamt-koeln-altstadt.de', bufa: '5214' },
  { id: '11', name: 'Finanzamt Koeln-Mitte', adresse: 'Blaubach 7', plz: '50676', ort: 'Koeln', bundesland: 'Nordrhein-Westfalen', telefon: '0221/2026-0', email: 'poststelle@fa-5215.fin-nrw.de', website: 'www.finanzamt-koeln-mitte.de', bufa: '5215' },
  { id: '12', name: 'Finanzamt Duesseldorf-Mitte', adresse: 'Kruppstr. 110-112', plz: '40227', ort: 'Duesseldorf', bundesland: 'Nordrhein-Westfalen', telefon: '0211/7798-0', email: 'poststelle@fa-5105.fin-nrw.de', website: 'www.finanzamt-duesseldorf-mitte.de', bufa: '5105' },
  { id: '13', name: 'Finanzamt Leipzig I', adresse: 'Wilhelm-Liebknecht-Platz 3', plz: '04105', ort: 'Leipzig', bundesland: 'Sachsen', telefon: '0341/559-0', email: 'poststelle@fa-l1.smf.sachsen.de', website: 'www.finanzamt-leipzig.de', bufa: '3231' },
  { id: '14', name: 'Finanzamt Dresden-Nord', adresse: 'Koepkestr. 7', plz: '01099', ort: 'Dresden', bundesland: 'Sachsen', telefon: '0351/8174-0', email: 'poststelle@fa-dd-nord.smf.sachsen.de', website: 'www.finanzamt-dresden.de', bufa: '3205' },
  { id: '15', name: 'Finanzamt Hannover-Mitte', adresse: 'Lavesallee 10', plz: '30169', ort: 'Hannover', bundesland: 'Niedersachsen', telefon: '0511/6790-0', email: 'poststelle@fa-h-mitte.niedersachsen.de', website: 'www.ofd.niedersachsen.de', bufa: '2318' },
  { id: '16', name: 'Finanzamt Bremen', adresse: 'Rudolf-Hilferding-Platz 1', plz: '28195', ort: 'Bremen', bundesland: 'Bremen', telefon: '0421/361-0', email: 'office@fa-bremen.bremen.de', website: 'www.finanzen.bremen.de', bufa: '2471' },
  { id: '17', name: 'Finanzamt Mainz', adresse: 'Schillerstr. 11', plz: '55116', ort: 'Mainz', bundesland: 'Rheinland-Pfalz', telefon: '06131/252-0', email: 'poststelle@fa-mainz.fin-rlp.de', website: 'www.lfst-rlp.de', bufa: '2713' },
  { id: '18', name: 'Finanzamt Saarbruecken Am Stadtgraben', adresse: 'Am Stadtgraben 2-4', plz: '66111', ort: 'Saarbruecken', bundesland: 'Saarland', telefon: '0681/3000-0', email: 'poststelle@fa-sb-stadtgr.saarland.de', website: 'www.saarland.de/finanzamt', bufa: '1010' },
  { id: '19', name: 'Finanzamt Potsdam', adresse: 'Steinstr. 104-106', plz: '14480', ort: 'Potsdam', bundesland: 'Brandenburg', telefon: '0331/287-0', email: 'poststelle@fa-potsdam.brandenburg.de', website: 'www.finanzamt-potsdam.de', bufa: '3053' },
  { id: '20', name: 'Finanzamt Kiel-Nord', adresse: 'Feldstr. 100', plz: '24105', ort: 'Kiel', bundesland: 'Schleswig-Holstein', telefon: '0431/604-0', email: 'poststelle@fa-kiel-nord.landsh.de', website: 'www.schleswig-holstein.de/FAKI', bufa: '2116' },
  { id: '21', name: 'Finanzamt Magdeburg I', adresse: 'Tessenowstr. 6', plz: '39114', ort: 'Magdeburg', bundesland: 'Sachsen-Anhalt', telefon: '0391/885-0', email: 'poststelle@fa-md1.sachsen-anhalt.de', website: 'www.finanzamt-magdeburg.de', bufa: '3101' },
  { id: '22', name: 'Finanzamt Erfurt', adresse: 'August-Bebel-Str. 38', plz: '99086', ort: 'Erfurt', bundesland: 'Thueringen', telefon: '0361/378-0', email: 'poststelle@fa-erfurt.thueringen.de', website: 'www.thueringen.de/th3/tfm/', bufa: '4151' },
  { id: '23', name: 'Finanzamt Rostock', adresse: 'Moellner Str. 13', plz: '18109', ort: 'Rostock', bundesland: 'Mecklenburg-Vorpommern', telefon: '0381/7000-0', email: 'poststelle@fa-hro.mv-regierung.de', website: 'www.regierung-mv.de/Landesregierung/fm/', bufa: '4080' },
]

export default function FinanzamtVerzeichnisPage() {
  const [query, setQuery] = useState('')
  const [selectedBundesland, setSelectedBundesland] = useState<string | null>(null)
  const [selectedAmt, setSelectedAmt] = useState<Finanzamt | null>(null)

  const results = useMemo(() => {
    let filtered = FINANZAEMTER

    if (selectedBundesland) {
      filtered = filtered.filter(fa => fa.bundesland === selectedBundesland)
    }

    if (query.trim().length >= 2) {
      const q = query.toLowerCase()
      filtered = filtered.filter(fa =>
        fa.name.toLowerCase().includes(q) ||
        fa.ort.toLowerCase().includes(q) ||
        fa.plz.includes(q) ||
        fa.bufa.includes(q)
      )
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [query, selectedBundesland])

  const bundeslandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    FINANZAEMTER.forEach(fa => {
      counts[fa.bundesland] = (counts[fa.bundesland] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finanzamt-Verzeichnis</h1>
        <p className="text-muted-foreground mt-1">
          Finden Sie Ihr zustaendiges Finanzamt mit Kontaktdaten
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Name, Ort, PLZ oder BuFa-Nr..."
              className="pl-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setQuery('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="h-4 w-4" />
                Bundesland
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                <button
                  onClick={() => setSelectedBundesland(null)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                    !selectedBundesland ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  Alle ({FINANZAEMTER.length})
                </button>
                {BUNDESLAENDER.filter(bl => bundeslandCounts[bl]).map(bl => (
                  <button
                    key={bl}
                    onClick={() => setSelectedBundesland(selectedBundesland === bl ? null : bl)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                      selectedBundesland === bl ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                  >
                    <span>{bl}</span>
                    <span className={`text-xs ${selectedBundesland === bl ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {bundeslandCounts[bl]}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            {results.length} Finanzamt{results.length !== 1 ? 'er' : ''} gefunden
            {selectedBundesland && ` in ${selectedBundesland}`}
          </p>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">Keine Ergebnisse</h3>
                <p className="text-sm text-muted-foreground">
                  Kein Finanzamt gefunden. Versuchen Sie andere Suchbegriffe.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {results.map(fa => (
                <Card
                  key={fa.id}
                  className={`cursor-pointer transition-all ${
                    selectedAmt?.id === fa.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedAmt(selectedAmt?.id === fa.id ? null : fa)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-2.5 shrink-0">
                        <Building2 className="h-5 w-5 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm truncate">{fa.name}</h3>
                          <Badge variant="secondary" className="text-[10px] shrink-0">BuFa {fa.bufa}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {fa.adresse}, {fa.plz} {fa.ort}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{fa.bundesland}</Badge>

                        {selectedAmt?.id === fa.id && (
                          <div className="mt-4 space-y-3 border-t pt-3" onClick={e => e.stopPropagation()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Adresse</p>
                                  <p className="text-sm">{fa.adresse}, {fa.plz} {fa.ort}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Telefon</p>
                                  <a href={`tel:${fa.telefon}`} className="text-sm text-fintutto-blue-600 dark:text-fintutto-blue-400 hover:underline">
                                    {fa.telefon}
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">E-Mail</p>
                                  <a href={`mailto:${fa.email}`} className="text-sm text-fintutto-blue-600 dark:text-fintutto-blue-400 hover:underline break-all">
                                    {fa.email}
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Website</p>
                                  <p className="text-sm text-fintutto-blue-600 dark:text-fintutto-blue-400 break-all">
                                    {fa.website}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => navigator.clipboard.writeText(`${fa.name}\n${fa.adresse}\n${fa.plz} ${fa.ort}\nTel: ${fa.telefon}\nE-Mail: ${fa.email}`)}
                            >
                              Kontakt kopieren
                            </Button>
                          </div>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                        selectedAmt?.id === fa.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
