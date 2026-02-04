import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Calculator, Info, MapPin, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

// Beispielhafte Mietspiegeldaten (vereinfacht)
const MIETSPIEGEL_DATEN: Record<string, {
  stadt: string
  basisPreis: number // €/m² für mittlere Lage, Baujahr 1970-1990
  faktoren: {
    neubau: number      // Baujahr nach 2010
    altbau: number      // Baujahr vor 1950
    gute_lage: number   // Gute/sehr gute Lage
    einfache_lage: number // Einfache Lage
    balkon: number
    einbaukueche: number
    parkett: number
    aufzug: number
  }
  mietpreisbremse: boolean
}> = {
  '10115': { stadt: 'Berlin-Mitte', basisPreis: 12.50, faktoren: { neubau: 1.25, altbau: 1.05, gute_lage: 1.15, einfache_lage: 0.85, balkon: 0.05, einbaukueche: 0.08, parkett: 0.05, aufzug: 0.03 }, mietpreisbremse: true },
  '10178': { stadt: 'Berlin-Mitte', basisPreis: 13.00, faktoren: { neubau: 1.30, altbau: 1.10, gute_lage: 1.20, einfache_lage: 0.85, balkon: 0.05, einbaukueche: 0.08, parkett: 0.05, aufzug: 0.03 }, mietpreisbremse: true },
  '10969': { stadt: 'Berlin-Kreuzberg', basisPreis: 11.50, faktoren: { neubau: 1.20, altbau: 1.00, gute_lage: 1.10, einfache_lage: 0.90, balkon: 0.05, einbaukueche: 0.08, parkett: 0.05, aufzug: 0.03 }, mietpreisbremse: true },
  '80331': { stadt: 'München-Altstadt', basisPreis: 19.00, faktoren: { neubau: 1.30, altbau: 1.15, gute_lage: 1.25, einfache_lage: 0.85, balkon: 0.04, einbaukueche: 0.06, parkett: 0.04, aufzug: 0.03 }, mietpreisbremse: true },
  '80469': { stadt: 'München-Isarvorstadt', basisPreis: 18.50, faktoren: { neubau: 1.25, altbau: 1.10, gute_lage: 1.20, einfache_lage: 0.85, balkon: 0.04, einbaukueche: 0.06, parkett: 0.04, aufzug: 0.03 }, mietpreisbremse: true },
  '60311': { stadt: 'Frankfurt-Innenstadt', basisPreis: 15.50, faktoren: { neubau: 1.25, altbau: 1.05, gute_lage: 1.15, einfache_lage: 0.88, balkon: 0.05, einbaukueche: 0.07, parkett: 0.04, aufzug: 0.03 }, mietpreisbremse: true },
  '20095': { stadt: 'Hamburg-Altstadt', basisPreis: 14.00, faktoren: { neubau: 1.20, altbau: 1.08, gute_lage: 1.15, einfache_lage: 0.88, balkon: 0.05, einbaukueche: 0.07, parkett: 0.04, aufzug: 0.03 }, mietpreisbremse: true },
  '50667': { stadt: 'Köln-Innenstadt', basisPreis: 12.00, faktoren: { neubau: 1.20, altbau: 1.05, gute_lage: 1.15, einfache_lage: 0.88, balkon: 0.05, einbaukueche: 0.08, parkett: 0.05, aufzug: 0.03 }, mietpreisbremse: true },
  '40213': { stadt: 'Düsseldorf-Altstadt', basisPreis: 13.50, faktoren: { neubau: 1.22, altbau: 1.08, gute_lage: 1.18, einfache_lage: 0.88, balkon: 0.05, einbaukueche: 0.07, parkett: 0.05, aufzug: 0.03 }, mietpreisbremse: true },
}

// Standard-Faktoren für unbekannte PLZ
const DEFAULT_FAKTOREN = {
  basisPreis: 9.00,
  faktoren: { neubau: 1.15, altbau: 0.95, gute_lage: 1.10, einfache_lage: 0.90, balkon: 0.05, einbaukueche: 0.08, parkett: 0.05, aufzug: 0.03 },
  mietpreisbremse: false,
  stadt: 'Durchschnitt Deutschland'
}

export default function Mietpreisrechner() {
  // Eingaben
  const [plz, setPlz] = React.useState('')
  const [wohnflaeche, setWohnflaeche] = React.useState<number | null>(null)
  const [baujahr, setBaujahr] = React.useState<string>('1970-1990')
  const [lage, setLage] = React.useState<string>('mittel')
  const [ausstattung, setAusstattung] = React.useState({
    balkon: false,
    einbaukueche: false,
    parkett: false,
    aufzug: false
  })

  // Mietspiegeldaten für PLZ finden
  const mietspiegelDaten = plz.length === 5
    ? MIETSPIEGEL_DATEN[plz] || { ...DEFAULT_FAKTOREN, stadt: `PLZ ${plz} (geschätzt)` }
    : null

  // Berechnung
  const berechnung = React.useMemo(() => {
    if (!mietspiegelDaten || !wohnflaeche) return null

    let preis = mietspiegelDaten.basisPreis

    // Baujahr-Faktor
    if (baujahr === 'nach-2010') {
      preis *= mietspiegelDaten.faktoren.neubau
    } else if (baujahr === 'vor-1950') {
      preis *= mietspiegelDaten.faktoren.altbau
    }

    // Lage-Faktor
    if (lage === 'gut') {
      preis *= mietspiegelDaten.faktoren.gute_lage
    } else if (lage === 'einfach') {
      preis *= mietspiegelDaten.faktoren.einfache_lage
    }

    // Ausstattungs-Zuschläge
    if (ausstattung.balkon) preis *= (1 + mietspiegelDaten.faktoren.balkon)
    if (ausstattung.einbaukueche) preis *= (1 + mietspiegelDaten.faktoren.einbaukueche)
    if (ausstattung.parkett) preis *= (1 + mietspiegelDaten.faktoren.parkett)
    if (ausstattung.aufzug) preis *= (1 + mietspiegelDaten.faktoren.aufzug)

    const preisProQm = Math.round(preis * 100) / 100
    const kaltmiete = Math.round(preis * wohnflaeche * 100) / 100

    // Spanne berechnen (±15%)
    const preisMin = Math.round(preisProQm * 0.85 * 100) / 100
    const preisMax = Math.round(preisProQm * 1.15 * 100) / 100
    const mieteMin = Math.round(preisMin * wohnflaeche * 100) / 100
    const mieteMax = Math.round(preisMax * wohnflaeche * 100) / 100

    return {
      preisProQm,
      preisMin,
      preisMax,
      kaltmiete,
      mieteMin,
      mieteMax,
      stadt: mietspiegelDaten.stadt,
      mietpreisbremse: mietspiegelDaten.mietpreisbremse
    }
  }, [mietspiegelDaten, wohnflaeche, baujahr, lage, ausstattung])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietpreisrechner</h1>
              <p className="text-muted-foreground">
                Ermitteln Sie die ortsübliche Vergleichsmiete
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eingabe */}
          <div className="space-y-6">
            {/* Standort */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Standort
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plz">Postleitzahl</Label>
                  <Input
                    id="plz"
                    type="text"
                    maxLength={5}
                    value={plz}
                    onChange={(e) => setPlz(e.target.value.replace(/\D/g, ''))}
                    placeholder="z.B. 10115"
                    className="mt-1 text-lg font-mono"
                  />
                  {mietspiegelDaten && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {mietspiegelDaten.stadt}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Wohnlage</Label>
                  <Select value={lage} onValueChange={setLage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="einfach">Einfache Lage</SelectItem>
                      <SelectItem value="mittel">Mittlere Lage</SelectItem>
                      <SelectItem value="gut">Gute / sehr gute Lage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Wohnung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wohnungsdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="wohnflaeche">Wohnfläche (m²)</Label>
                  <Input
                    id="wohnflaeche"
                    type="number"
                    min="10"
                    max="500"
                    value={wohnflaeche || ''}
                    onChange={(e) => setWohnflaeche(parseFloat(e.target.value) || null)}
                    placeholder="z.B. 65"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Baujahr</Label>
                  <Select value={baujahr} onValueChange={setBaujahr}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vor-1950">Vor 1950 (Altbau)</SelectItem>
                      <SelectItem value="1950-1969">1950 - 1969</SelectItem>
                      <SelectItem value="1970-1990">1970 - 1990</SelectItem>
                      <SelectItem value="1991-2009">1991 - 2009</SelectItem>
                      <SelectItem value="nach-2010">Nach 2010 (Neubau)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Ausstattung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ausstattung</CardTitle>
                <CardDescription>
                  Merkmale, die den Mietpreis beeinflussen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="balkon"
                      checked={ausstattung.balkon}
                      onCheckedChange={(checked) => setAusstattung(prev => ({ ...prev, balkon: !!checked }))}
                    />
                    <Label htmlFor="balkon" className="cursor-pointer">Balkon / Terrasse / Loggia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="einbaukueche"
                      checked={ausstattung.einbaukueche}
                      onCheckedChange={(checked) => setAusstattung(prev => ({ ...prev, einbaukueche: !!checked }))}
                    />
                    <Label htmlFor="einbaukueche" className="cursor-pointer">Einbauküche</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parkett"
                      checked={ausstattung.parkett}
                      onCheckedChange={(checked) => setAusstattung(prev => ({ ...prev, parkett: !!checked }))}
                    />
                    <Label htmlFor="parkett" className="cursor-pointer">Parkett / hochwertiger Bodenbelag</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aufzug"
                      checked={ausstattung.aufzug}
                      onCheckedChange={(checked) => setAusstattung(prev => ({ ...prev, aufzug: !!checked }))}
                    />
                    <Label htmlFor="aufzug" className="cursor-pointer">Aufzug im Haus</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ergebnis */}
          <div className="space-y-6">
            {berechnung ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Ortsübliche Vergleichsmiete
                    </CardTitle>
                    <CardDescription>
                      Für {berechnung.stadt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Hauptergebnis */}
                    <div className="p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Geschätzte Kaltmiete</p>
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency(berechnung.kaltmiete)}
                      </p>
                      <p className="text-lg text-muted-foreground">
                        / Monat
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Preis pro m²</p>
                        <p className="text-xl font-bold">{berechnung.preisProQm.toFixed(2)} €</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Wohnfläche</p>
                        <p className="text-xl font-bold">{wohnflaeche} m²</p>
                      </div>
                    </div>

                    {/* Spanne */}
                    <div>
                      <p className="text-sm font-medium mb-2">Marktübliche Spanne</p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{formatCurrency(berechnung.mieteMin)}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full relative">
                          <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{ width: '50%', marginLeft: '25%' }}
                          />
                        </div>
                        <span className="text-muted-foreground">{formatCurrency(berechnung.mieteMax)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {berechnung.preisMin.toFixed(2)} - {berechnung.preisMax.toFixed(2)} €/m²
                      </p>
                    </div>

                    {/* Mietpreisbremse */}
                    {berechnung.mietpreisbremse && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium">Mietpreisbremse aktiv</p>
                            <p className="text-yellow-600">
                              In diesem Gebiet gilt die Mietpreisbremse. Die Miete bei Neuvermietung
                              darf maximal 10% über der ortsüblichen Vergleichsmiete liegen.
                            </p>
                            <p className="font-medium mt-2">
                              Maximale Neumiete: {formatCurrency(berechnung.kaltmiete * 1.10)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mieterhöhung */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Mieterhöhungs-Potenzial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Liegt Ihre aktuelle Miete unter der ortsüblichen Vergleichsmiete?
                    </p>
                    <Link to="/formulare/mieterhoehung">
                      <Button variant="outline" className="w-full">
                        Mieterhöhungsverlangen erstellen
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geben Sie PLZ und Wohnfläche ein,</p>
                    <p>um die Vergleichsmiete zu berechnen.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hinweis */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Hinweis</p>
                    <p className="text-blue-600">
                      Dies ist eine Schätzung basierend auf vereinfachten Mietspiegeldaten.
                      Für eine verbindliche Auskunft nutzen Sie den offiziellen Mietspiegel
                      Ihrer Stadt oder konsultieren Sie einen Experten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
