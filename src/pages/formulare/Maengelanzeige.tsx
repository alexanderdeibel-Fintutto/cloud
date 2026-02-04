import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Camera, Calendar, FileText, Send, Info, Euro } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { generateMangelanzeigePDF } from '@/lib/pdf/maengelanzeige-pdf'

const MANGEL_KATEGORIEN = [
  { id: 'heizung', label: 'Heizung / Warmwasser', dringlichkeit: 'hoch', typischeFrist: 3 },
  { id: 'wasser', label: 'Wasserversorgung / Sanitär', dringlichkeit: 'hoch', typischeFrist: 3 },
  { id: 'elektrik', label: 'Elektrik / Strom', dringlichkeit: 'hoch', typischeFrist: 3 },
  { id: 'schimmel', label: 'Schimmel / Feuchtigkeit', dringlichkeit: 'hoch', typischeFrist: 14 },
  { id: 'fenster', label: 'Fenster / Türen', dringlichkeit: 'mittel', typischeFrist: 14 },
  { id: 'dach', label: 'Dach / Fassade', dringlichkeit: 'mittel', typischeFrist: 14 },
  { id: 'boden', label: 'Bodenbelag', dringlichkeit: 'niedrig', typischeFrist: 30 },
  { id: 'geraeusche', label: 'Lärmbelästigung', dringlichkeit: 'mittel', typischeFrist: 14 },
  { id: 'ungeziefer', label: 'Ungeziefer / Schädlinge', dringlichkeit: 'hoch', typischeFrist: 7 },
  { id: 'gemeinschaft', label: 'Gemeinschaftsräume', dringlichkeit: 'niedrig', typischeFrist: 30 },
  { id: 'sonstige', label: 'Sonstiges', dringlichkeit: 'mittel', typischeFrist: 14 },
]

const MIETMINDERUNG_RICHTWERTE: Record<string, number> = {
  'heizung': 30,
  'wasser': 20,
  'schimmel': 20,
  'fenster': 10,
  'elektrik': 15,
  'ungeziefer': 25,
  'geraeusche': 15,
}

const EMPTY_PERSON: PersonData = {
  anrede: '',
  vorname: '',
  nachname: '',
  telefon: '',
  email: ''
}

const EMPTY_ADDRESS: AddressData = {
  strasse: '',
  hausnummer: '',
  plz: '',
  ort: '',
  land: 'Deutschland'
}

const EMPTY_SIGNATURE: SignatureData = {
  imageData: null,
  signerName: '',
  signedAt: null,
  signedLocation: ''
}

interface MangelanzeigeData {
  // Mieter
  mieter: PersonData
  mieterAdresse: AddressData

  // Vermieter
  vermieter: PersonData
  vermieterAdresse: AddressData

  // Mietobjekt
  objektAdresse: AddressData

  // Mangel
  kategorie: string
  beschreibung: string
  entdecktAm: string
  raeume: string

  // Frist & Folgen
  fristTage: number
  fristDatum: string
  mietminderungAngedroht: boolean
  mietminderungProzent: number | null
  ersatzvornahmeAngedroht: boolean

  // Unterschrift
  unterschrift: SignatureData
}

export default function MangelanzeigePage() {
  const { toast } = useToast()

  const [data, setData] = React.useState<MangelanzeigeData>({
    mieter: EMPTY_PERSON,
    mieterAdresse: EMPTY_ADDRESS,
    vermieter: EMPTY_PERSON,
    vermieterAdresse: EMPTY_ADDRESS,
    objektAdresse: EMPTY_ADDRESS,
    kategorie: '',
    beschreibung: '',
    entdecktAm: format(new Date(), 'yyyy-MM-dd'),
    raeume: '',
    fristTage: 14,
    fristDatum: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    mietminderungAngedroht: false,
    mietminderungProzent: null,
    ersatzvornahmeAngedroht: false,
    unterschrift: EMPTY_SIGNATURE
  })

  const updateData = (updates: Partial<MangelanzeigeData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  // Frist automatisch berechnen
  const handleKategorieChange = (kategorie: string) => {
    const kat = MANGEL_KATEGORIEN.find(k => k.id === kategorie)
    const fristTage = kat?.typischeFrist || 14
    const mietminderung = MIETMINDERUNG_RICHTWERTE[kategorie] || null

    updateData({
      kategorie,
      fristTage,
      fristDatum: format(addDays(new Date(), fristTage), 'yyyy-MM-dd'),
      mietminderungProzent: mietminderung
    })
  }

  const handleFristChange = (tage: number) => {
    updateData({
      fristTage: tage,
      fristDatum: format(addDays(new Date(), tage), 'yyyy-MM-dd')
    })
  }

  const selectedKategorie = MANGEL_KATEGORIEN.find(k => k.id === data.kategorie)

  const handleGeneratePDF = async () => {
    try {
      await generateMangelanzeigePDF({
        mieter: data.mieter,
        mieterAdresse: data.mieterAdresse,
        vermieter: data.vermieter,
        vermieterAdresse: data.vermieterAdresse,
        objektAdresse: data.objektAdresse,
        kategorie: data.kategorie,
        kategorieLabel: selectedKategorie?.label,
        beschreibung: data.beschreibung,
        entdecktAm: data.entdecktAm,
        raeume: data.raeume,
        fristTage: data.fristTage,
        fristDatum: data.fristDatum,
        mietminderungAngedroht: data.mietminderungAngedroht,
        mietminderungProzent: data.mietminderungProzent,
        ersatzvornahmeAngedroht: data.ersatzvornahmeAngedroht,
        unterschrift: data.unterschrift
      })
      toast({
        title: 'PDF erstellt',
        description: 'Die Mängelanzeige wurde als PDF heruntergeladen.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht erstellt werden.',
        variant: 'destructive'
      })
    }
  }

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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mängelanzeige</h1>
              <p className="text-muted-foreground">
                Melden Sie Wohnungsmängel formgerecht an Ihren Vermieter
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptbereich */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mieter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mieter (Absender)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PersonField
                  value={data.mieter}
                  onChange={(mieter) => updateData({ mieter })}
                  required
                  showBirthdate={false}
                  showContact={true}
                />
                <Separator />
                <AddressField
                  value={data.mieterAdresse}
                  onChange={(mieterAdresse) => updateData({ mieterAdresse })}
                  label="Aktuelle Adresse"
                  showAIHelper={false}
                />
              </CardContent>
            </Card>

            {/* Vermieter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vermieter (Empfänger)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PersonField
                  value={data.vermieter}
                  onChange={(vermieter) => updateData({ vermieter })}
                  required
                  showBirthdate={false}
                  showContact={false}
                />
                <Separator />
                <AddressField
                  value={data.vermieterAdresse}
                  onChange={(vermieterAdresse) => updateData({ vermieterAdresse })}
                  label="Adresse"
                  showAIHelper={false}
                />
              </CardContent>
            </Card>

            {/* Mietobjekt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mietobjekt</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressField
                  value={data.objektAdresse}
                  onChange={(objektAdresse) => updateData({ objektAdresse })}
                  label="Adresse der Mietwohnung"
                  showAIHelper={false}
                />
              </CardContent>
            </Card>

            {/* Mangel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Mangelbeschreibung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mangelkategorie</Label>
                    <Select
                      value={data.kategorie}
                      onValueChange={handleKategorieChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Kategorie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {MANGEL_KATEGORIEN.map((kat) => (
                          <SelectItem key={kat.id} value={kat.id}>
                            <div className="flex items-center gap-2">
                              <span>{kat.label}</span>
                              <Badge
                                variant={
                                  kat.dringlichkeit === 'hoch' ? 'destructive' :
                                  kat.dringlichkeit === 'mittel' ? 'warning' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {kat.dringlichkeit}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="entdecktAm">Mangel entdeckt am</Label>
                    <Input
                      id="entdecktAm"
                      type="date"
                      value={data.entdecktAm}
                      onChange={(e) => updateData({ entdecktAm: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="raeume">Betroffene Räume</Label>
                  <Input
                    id="raeume"
                    value={data.raeume}
                    onChange={(e) => updateData({ raeume: e.target.value })}
                    placeholder="z.B. Badezimmer, Küche"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="beschreibung">Detaillierte Beschreibung des Mangels</Label>
                  <Textarea
                    id="beschreibung"
                    value={data.beschreibung}
                    onChange={(e) => updateData({ beschreibung: e.target.value })}
                    placeholder="Beschreiben Sie den Mangel möglichst genau: Was ist defekt? Seit wann? Welche Auswirkungen?"
                    className="mt-1"
                    rows={5}
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <Camera className="h-4 w-4" />
                  <span>Tipp: Dokumentieren Sie den Mangel mit Fotos als Beweismittel</span>
                </div>
              </CardContent>
            </Card>

            {/* Fristsetzung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fristsetzung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frist zur Mängelbeseitigung</Label>
                    <Select
                      value={data.fristTage.toString()}
                      onValueChange={(v) => handleFristChange(parseInt(v))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Tage (dringend)</SelectItem>
                        <SelectItem value="7">7 Tage</SelectItem>
                        <SelectItem value="14">14 Tage (Standard)</SelectItem>
                        <SelectItem value="21">21 Tage</SelectItem>
                        <SelectItem value="30">30 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fristende</Label>
                    <div className="mt-1 h-10 px-3 flex items-center border rounded-md bg-muted text-sm font-medium">
                      {format(new Date(data.fristDatum), 'dd.MM.yyyy', { locale: de })}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Mietminderung */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="mietminderung"
                      checked={data.mietminderungAngedroht}
                      onCheckedChange={(checked) => updateData({ mietminderungAngedroht: !!checked })}
                    />
                    <div>
                      <Label htmlFor="mietminderung" className="cursor-pointer">
                        Mietminderung androhen
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Bei Nichtbeseitigung werde ich die Miete mindern
                      </p>
                    </div>
                  </div>

                  {data.mietminderungAngedroht && data.mietminderungProzent && (
                    <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Richtwert für diese Mangelkategorie: ca. <strong>{data.mietminderungProzent}%</strong> Mietminderung
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Die tatsächliche Quote hängt vom Einzelfall ab.
                      </p>
                    </div>
                  )}
                </div>

                {/* Ersatzvornahme */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="ersatzvornahme"
                    checked={data.ersatzvornahmeAngedroht}
                    onCheckedChange={(checked) => updateData({ ersatzvornahmeAngedroht: !!checked })}
                  />
                  <div>
                    <Label htmlFor="ersatzvornahme" className="cursor-pointer">
                      Ersatzvornahme androhen
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Bei Nichtbeseitigung lasse ich den Mangel auf Ihre Kosten beheben
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unterschrift */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unterschrift</CardTitle>
              </CardHeader>
              <CardContent>
                <SignatureField
                  value={{
                    ...data.unterschrift,
                    signerName: data.unterschrift.signerName ||
                      `${data.mieter.vorname} ${data.mieter.nachname}`.trim()
                  }}
                  onChange={(unterschrift) => updateData({ unterschrift })}
                  required
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vorschau */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedKategorie && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Kategorie:</span>
                    <Badge
                      variant={
                        selectedKategorie.dringlichkeit === 'hoch' ? 'destructive' :
                        selectedKategorie.dringlichkeit === 'mittel' ? 'warning' : 'secondary'
                      }
                    >
                      {selectedKategorie.label}
                    </Badge>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fristende:</span>
                  <span className="font-medium">
                    {format(new Date(data.fristDatum), 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>

                {data.mietminderungAngedroht && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mietminderung:</span>
                    <span className="font-medium text-yellow-600">
                      ca. {data.mietminderungProzent}%
                    </span>
                  </div>
                )}

                <Separator />

                <Button className="w-full" onClick={handleGeneratePDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF erstellen
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Senden Sie die Mängelanzeige per Einschreiben
                </p>
              </CardContent>
            </Card>

            {/* Tipps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Wichtige Hinweise</p>
                    <ul className="list-disc list-inside text-blue-600 mt-1 space-y-1">
                      <li>Mängel sofort melden (Anzeigepflicht!)</li>
                      <li>Schriftform empfohlen (Einschreiben)</li>
                      <li>Fotos als Beweis sichern</li>
                      <li>Angemessene Frist setzen</li>
                      <li>Bei Gefahr: sofortige Maßnahmen erlaubt</li>
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
