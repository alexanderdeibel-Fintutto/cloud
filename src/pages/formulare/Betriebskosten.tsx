import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Euro, Calculator, Info, Plus, Trash2, Calendar, Home, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateBetriebskostenPDF, type BetriebskostenPDFData } from '@/lib/pdf/betriebskosten-pdf'

// Betriebskostenarten nach § 2 BetrKV
const BETRIEBSKOSTENARTEN = [
  { id: 'grundsteuer', name: 'Grundsteuer', paragraph: '§ 2 Nr. 1' },
  { id: 'wasser', name: 'Wasserversorgung', paragraph: '§ 2 Nr. 2' },
  { id: 'abwasser', name: 'Entwässerung', paragraph: '§ 2 Nr. 3' },
  { id: 'heizung', name: 'Heizung (inkl. Brennstoff)', paragraph: '§ 2 Nr. 4' },
  { id: 'warmwasser', name: 'Warmwasser', paragraph: '§ 2 Nr. 5' },
  { id: 'aufzug', name: 'Aufzug', paragraph: '§ 2 Nr. 7' },
  { id: 'strassenreinigung', name: 'Straßenreinigung', paragraph: '§ 2 Nr. 8' },
  { id: 'muellabfuhr', name: 'Müllbeseitigung', paragraph: '§ 2 Nr. 9' },
  { id: 'hausreinigung', name: 'Gebäudereinigung', paragraph: '§ 2 Nr. 10' },
  { id: 'gartenpflege', name: 'Gartenpflege', paragraph: '§ 2 Nr. 11' },
  { id: 'beleuchtung', name: 'Beleuchtung (Gemeinschaftsflächen)', paragraph: '§ 2 Nr. 12' },
  { id: 'schornsteinfeger', name: 'Schornsteinreinigung', paragraph: '§ 2 Nr. 13' },
  { id: 'versicherung', name: 'Sach- und Haftpflichtversicherung', paragraph: '§ 2 Nr. 14' },
  { id: 'hauswart', name: 'Hauswart', paragraph: '§ 2 Nr. 15' },
  { id: 'kabel', name: 'Gemeinschaftsantenne/Kabel', paragraph: '§ 2 Nr. 16' },
  { id: 'waschraum', name: 'Waschraum', paragraph: '§ 2 Nr. 17' },
  { id: 'sonstige', name: 'Sonstige Betriebskosten', paragraph: '§ 2 Nr. 18' },
]

const UMLAGESCHLUESSEL = [
  { value: 'wohnflaeche', label: 'Nach Wohnfläche (m²)' },
  { value: 'personen', label: 'Nach Personenzahl' },
  { value: 'einheiten', label: 'Nach Wohneinheiten' },
  { value: 'verbrauch', label: 'Nach Verbrauch' },
]

interface KostenPosition {
  id: string
  kostenartId: string
  gesamtbetrag: number | null
  umlageschluessel: string
  mieteranteil: number | null
}

interface BetriebskostenData {
  // Abrechnungszeitraum
  abrechnungsjahrVon: string
  abrechnungsjahrBis: string

  // Vermieter
  vermieter: PersonData
  vermieterAdresse: AddressData

  // Mieter
  mieter: PersonData
  mieterAdresse: AddressData

  // Mietobjekt
  objektAdresse: AddressData
  wohnflaecheMieter: number | null
  wohnflaecheGesamt: number | null
  personenMieter: number | null
  personenGesamt: number | null
  einheitenGesamt: number | null

  // Kostenpositionen
  positionen: KostenPosition[]

  // Vorauszahlungen
  vorauszahlungenGesamt: number | null

  // Ergebnis
  nachzahlung: number | null
  guthaben: number | null
  neueVorauszahlung: number | null
}

const EMPTY_PERSON: PersonData = {
  anrede: '',
  vorname: '',
  nachname: ''
}

const EMPTY_ADDRESS: AddressData = {
  strasse: '',
  hausnummer: '',
  plz: '',
  ort: '',
  land: 'Deutschland'
}

const INITIAL_DATA: BetriebskostenData = {
  abrechnungsjahrVon: `${new Date().getFullYear() - 1}-01-01`,
  abrechnungsjahrBis: `${new Date().getFullYear() - 1}-12-31`,
  vermieter: EMPTY_PERSON,
  vermieterAdresse: EMPTY_ADDRESS,
  mieter: EMPTY_PERSON,
  mieterAdresse: EMPTY_ADDRESS,
  objektAdresse: EMPTY_ADDRESS,
  wohnflaecheMieter: null,
  wohnflaecheGesamt: null,
  personenMieter: null,
  personenGesamt: null,
  einheitenGesamt: null,
  positionen: [],
  vorauszahlungenGesamt: null,
  nachzahlung: null,
  guthaben: null,
  neueVorauszahlung: null
}

export default function BetriebskostenabrechnungPage() {
  const { toast } = useToast()
  const [data, setData] = React.useState<BetriebskostenData>(INITIAL_DATA)

  const updateData = (updates: Partial<BetriebskostenData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  // PDF generieren
  const handleGeneratePDF = async () => {
    try {
      const pdfData: BetriebskostenPDFData = {
        abrechnungsjahrVon: data.abrechnungsjahrVon,
        abrechnungsjahrBis: data.abrechnungsjahrBis,
        vermieter: {
          anrede: data.vermieter.anrede,
          titel: data.vermieter.titel,
          vorname: data.vermieter.vorname,
          nachname: data.vermieter.nachname,
        },
        vermieterAdresse: {
          strasse: data.vermieterAdresse.strasse,
          hausnummer: data.vermieterAdresse.hausnummer,
          plz: data.vermieterAdresse.plz,
          ort: data.vermieterAdresse.ort,
        },
        mieter: {
          anrede: data.mieter.anrede,
          titel: data.mieter.titel,
          vorname: data.mieter.vorname,
          nachname: data.mieter.nachname,
        },
        mieterAdresse: {
          strasse: data.mieterAdresse.strasse,
          hausnummer: data.mieterAdresse.hausnummer,
          plz: data.mieterAdresse.plz,
          ort: data.mieterAdresse.ort,
        },
        objektAdresse: {
          strasse: data.objektAdresse.strasse,
          hausnummer: data.objektAdresse.hausnummer,
          plz: data.objektAdresse.plz,
          ort: data.objektAdresse.ort,
        },
        wohnflaecheMieter: data.wohnflaecheMieter,
        wohnflaecheGesamt: data.wohnflaecheGesamt,
        personenMieter: data.personenMieter,
        personenGesamt: data.personenGesamt,
        einheitenGesamt: data.einheitenGesamt,
        positionen: data.positionen.map(p => ({
          id: p.id,
          kostenartId: p.kostenartId,
          gesamtbetrag: p.gesamtbetrag,
          umlageschluessel: p.umlageschluessel,
          mieteranteil: p.mieteranteil,
        })),
        vorauszahlungenGesamt: data.vorauszahlungenGesamt,
      }

      await generateBetriebskostenPDF(pdfData)

      toast({
        title: "PDF erstellt",
        description: "Die Betriebskostenabrechnung wurde als PDF heruntergeladen.",
      })
    } catch (error) {
      console.error('PDF-Generierung fehlgeschlagen:', error)
      toast({
        title: "Fehler",
        description: "Die PDF-Erstellung ist fehlgeschlagen.",
        variant: "destructive"
      })
    }
  }

  // Position hinzufügen
  const handleAddPosition = () => {
    const newPosition: KostenPosition = {
      id: Date.now().toString(),
      kostenartId: '',
      gesamtbetrag: null,
      umlageschluessel: 'wohnflaeche',
      mieteranteil: null
    }
    updateData({ positionen: [...data.positionen, newPosition] })
  }

  // Position entfernen
  const handleRemovePosition = (id: string) => {
    updateData({ positionen: data.positionen.filter(p => p.id !== id) })
  }

  // Position aktualisieren
  const handlePositionChange = (id: string, field: keyof KostenPosition, value: any) => {
    const newPositionen = data.positionen.map(p => {
      if (p.id !== id) return p

      const updated = { ...p, [field]: value }

      // Mieteranteil automatisch berechnen
      if (field === 'gesamtbetrag' || field === 'umlageschluessel') {
        updated.mieteranteil = berechneMieteranteil(
          updated.gesamtbetrag,
          updated.umlageschluessel
        )
      }

      return updated
    })
    updateData({ positionen: newPositionen })
  }

  // Mieteranteil berechnen
  const berechneMieteranteil = (gesamtbetrag: number | null, schluessel: string): number | null => {
    if (!gesamtbetrag) return null

    switch (schluessel) {
      case 'wohnflaeche':
        if (data.wohnflaecheMieter && data.wohnflaecheGesamt) {
          return Math.round((gesamtbetrag * data.wohnflaecheMieter / data.wohnflaecheGesamt) * 100) / 100
        }
        break
      case 'personen':
        if (data.personenMieter && data.personenGesamt) {
          return Math.round((gesamtbetrag * data.personenMieter / data.personenGesamt) * 100) / 100
        }
        break
      case 'einheiten':
        if (data.einheitenGesamt) {
          return Math.round((gesamtbetrag / data.einheitenGesamt) * 100) / 100
        }
        break
      case 'verbrauch':
        return gesamtbetrag // Muss manuell eingegeben werden
    }
    return null
  }

  // Alle Mieteranteile neu berechnen wenn sich die Verteilungsgrößen ändern
  React.useEffect(() => {
    const newPositionen = data.positionen.map(p => ({
      ...p,
      mieteranteil: berechneMieteranteil(p.gesamtbetrag, p.umlageschluessel)
    }))
    if (JSON.stringify(newPositionen) !== JSON.stringify(data.positionen)) {
      updateData({ positionen: newPositionen })
    }
  }, [data.wohnflaecheMieter, data.wohnflaecheGesamt, data.personenMieter, data.personenGesamt, data.einheitenGesamt])

  // Gesamtberechnung
  const gesamtKosten = data.positionen.reduce((sum, p) => sum + (p.mieteranteil || 0), 0)
  const vorauszahlungen = data.vorauszahlungenGesamt || 0
  const differenz = gesamtKosten - vorauszahlungen
  const istNachzahlung = differenz > 0

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
              <Euro className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Betriebskostenabrechnung</h1>
              <p className="text-muted-foreground">
                Erstellen Sie eine korrekte Nebenkostenabrechnung
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptbereich */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abrechnungszeitraum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Abrechnungszeitraum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Von</Label>
                    <Input
                      type="date"
                      value={data.abrechnungsjahrVon}
                      onChange={(e) => updateData({ abrechnungsjahrVon: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bis</Label>
                    <Input
                      type="date"
                      value={data.abrechnungsjahrBis}
                      onChange={(e) => updateData({ abrechnungsjahrBis: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mietobjekt & Verteilung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mietobjekt & Verteilungsschlüssel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AddressField
                  value={data.objektAdresse}
                  onChange={(objektAdresse) => updateData({ objektAdresse })}
                  label="Adresse des Mietobjekts"
                  showAIHelper={false}
                />

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Wohnfläche Mieter (m²)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.wohnflaecheMieter || ''}
                      onChange={(e) => updateData({ wohnflaecheMieter: parseFloat(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Wohnfläche Gesamt (m²)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={data.wohnflaecheGesamt || ''}
                      onChange={(e) => updateData({ wohnflaecheGesamt: parseFloat(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Anteil</Label>
                    <div className="mt-1 h-10 px-3 flex items-center border rounded-md bg-muted text-sm">
                      {data.wohnflaecheMieter && data.wohnflaecheGesamt
                        ? `${((data.wohnflaecheMieter / data.wohnflaecheGesamt) * 100).toFixed(2)}%`
                        : '—'
                      }
                    </div>
                  </div>

                  <div>
                    <Label>Personen Mieter</Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.personenMieter || ''}
                      onChange={(e) => updateData({ personenMieter: parseInt(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Personen Gesamt</Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.personenGesamt || ''}
                      onChange={(e) => updateData({ personenGesamt: parseInt(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Wohneinheiten</Label>
                    <Input
                      type="number"
                      min="1"
                      value={data.einheitenGesamt || ''}
                      onChange={(e) => updateData({ einheitenGesamt: parseInt(e.target.value) || null })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kostenpositionen */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Betriebskosten nach BetrKV
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleAddPosition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Position hinzufügen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {data.positionen.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Kostenpositionen hinzugefügt</p>
                    <Button variant="outline" className="mt-4" onClick={handleAddPosition}>
                      <Plus className="h-4 w-4 mr-1" />
                      Erste Position hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                      <div className="col-span-4">Kostenart</div>
                      <div className="col-span-2 text-right">Gesamtkosten</div>
                      <div className="col-span-3">Umlageschlüssel</div>
                      <div className="col-span-2 text-right">Ihr Anteil</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Positionen */}
                    {data.positionen.map((position) => {
                      const kostenart = BETRIEBSKOSTENARTEN.find(k => k.id === position.kostenartId)

                      return (
                        <div key={position.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <Select
                              value={position.kostenartId}
                              onValueChange={(v) => handlePositionChange(position.id, 'kostenartId', v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Kostenart wählen" />
                              </SelectTrigger>
                              <SelectContent>
                                {BETRIEBSKOSTENARTEN.map((art) => (
                                  <SelectItem key={art.id} value={art.id}>
                                    <span>{art.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({art.paragraph})</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={position.gesamtbetrag || ''}
                              onChange={(e) => handlePositionChange(position.id, 'gesamtbetrag', parseFloat(e.target.value) || null)}
                              placeholder="0,00"
                              className="text-right"
                            />
                          </div>
                          <div className="col-span-3">
                            <Select
                              value={position.umlageschluessel}
                              onValueChange={(v) => handlePositionChange(position.id, 'umlageschluessel', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UMLAGESCHLUESSEL.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <div className="h-10 px-3 flex items-center justify-end border rounded-md bg-muted text-sm font-medium">
                              {position.mieteranteil !== null
                                ? formatCurrency(position.mieteranteil)
                                : '—'
                              }
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePosition(position.id)}
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Summe */}
                    <Separator />
                    <div className="grid grid-cols-12 gap-2 items-center font-medium">
                      <div className="col-span-4">Summe Betriebskosten</div>
                      <div className="col-span-2 text-right text-muted-foreground">
                        {formatCurrency(data.positionen.reduce((sum, p) => sum + (p.gesamtbetrag || 0), 0))}
                      </div>
                      <div className="col-span-3"></div>
                      <div className="col-span-2 text-right text-lg">
                        {formatCurrency(gesamtKosten)}
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vorauszahlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geleistete Vorauszahlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <CurrencyField
                  value={data.vorauszahlungenGesamt}
                  onChange={(vorauszahlungenGesamt) => updateData({ vorauszahlungenGesamt })}
                  label="Summe der Vorauszahlungen im Abrechnungszeitraum"
                  helperText="Alle monatlichen Vorauszahlungen zusammen"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar mit Ergebnis */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Abrechnungsergebnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Betriebskosten:</span>
                  <span className="font-medium">{formatCurrency(gesamtKosten)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vorauszahlungen:</span>
                  <span className="font-medium">- {formatCurrency(vorauszahlungen)}</span>
                </div>

                <Separator />

                <div className={`p-4 rounded-lg ${istNachzahlung ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-sm ${istNachzahlung ? 'text-red-800' : 'text-green-800'}`}>
                    {istNachzahlung ? 'Nachzahlung' : 'Guthaben'}
                  </p>
                  <p className={`text-2xl font-bold ${istNachzahlung ? 'text-red-700' : 'text-green-700'}`}>
                    {formatCurrency(Math.abs(differenz))}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Neue monatliche Vorauszahlung (Vorschlag)</Label>
                  <div className="mt-1 h-10 px-3 flex items-center border rounded-md bg-muted text-lg font-medium">
                    {formatCurrency(Math.ceil(gesamtKosten / 12))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Basierend auf den aktuellen Kosten
                  </p>
                </div>

                <Button className="w-full" onClick={handleGeneratePDF}>
                  PDF erstellen
                </Button>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Fristen beachten</p>
                    <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
                      <li>Abrechnung binnen 12 Monaten nach Abrechnungsende</li>
                      <li>Mieter hat 12 Monate Einspruchsfrist</li>
                      <li>Belegvorlage auf Verlangen</li>
                    </ul>
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
