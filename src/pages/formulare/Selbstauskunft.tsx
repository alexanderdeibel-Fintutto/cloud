import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, User, Briefcase, Euro, Home, Shield, AlertCircle, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { generateSelbstauskunftPDF } from '@/lib/pdf/selbstauskunft-pdf'

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

interface SelbstauskunftData {
  // Persönliche Daten
  person: PersonData
  geburtsdatum: string
  geburtsort: string
  staatsangehoerigkeit: string
  familienstand: 'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet' | 'getrennt' | ''
  aktuelleAdresse: AddressData
  wohntSeit: string

  // Berufliche Situation
  berufstaetig: boolean
  arbeitgeber: string
  arbeitgeberAdresse: string
  beschaeftigtSeit: string
  berufsbezeichnung: string
  befristet: boolean

  // Einkommen
  nettoeinkommenMonatlich: number | null
  weitereEinkuenfte: number | null
  einkunftsart: string

  // Mietverhältnis
  anzahlPersonen: number
  personenDetails: string
  haustiere: boolean
  haustiereDetails: string
  raucher: boolean
  musikinstrumente: boolean
  musikinstrumenteDetails: string

  // Bonität
  insolvenzverfahren: boolean
  eidesstattlicheVersicherung: boolean
  mietschulden: boolean
  raeumungsklage: boolean

  // Vormieterverhältnis
  aktuelleMiete: number | null
  kuendigungVonWem: 'mieter' | 'vermieter' | ''
  kuendigungsgrund: string
  vormieterKontakt: boolean
  vormieterName: string
  vormieterTelefon: string

  // Datenschutz
  datenschutzEinwilligung: boolean
  schufaEinwilligung: boolean

  // Unterschrift
  unterschrift: SignatureData
}

const INITIAL_DATA: SelbstauskunftData = {
  person: EMPTY_PERSON,
  geburtsdatum: '',
  geburtsort: '',
  staatsangehoerigkeit: 'deutsch',
  familienstand: '',
  aktuelleAdresse: EMPTY_ADDRESS,
  wohntSeit: '',

  berufstaetig: true,
  arbeitgeber: '',
  arbeitgeberAdresse: '',
  beschaeftigtSeit: '',
  berufsbezeichnung: '',
  befristet: false,

  nettoeinkommenMonatlich: null,
  weitereEinkuenfte: null,
  einkunftsart: '',

  anzahlPersonen: 1,
  personenDetails: '',
  haustiere: false,
  haustiereDetails: '',
  raucher: false,
  musikinstrumente: false,
  musikinstrumenteDetails: '',

  insolvenzverfahren: false,
  eidesstattlicheVersicherung: false,
  mietschulden: false,
  raeumungsklage: false,

  aktuelleMiete: null,
  kuendigungVonWem: '',
  kuendigungsgrund: '',
  vormieterKontakt: false,
  vormieterName: '',
  vormieterTelefon: '',

  datenschutzEinwilligung: false,
  schufaEinwilligung: false,

  unterschrift: EMPTY_SIGNATURE
}

export default function Selbstauskunft() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [data, setData] = React.useState<SelbstauskunftData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'selbstauskunft',
    generateTitle: (formData) => `Selbstauskunft - ${formData.person?.vorname || ''} ${formData.person?.nachname || ''}`.trim() || 'Selbstauskunft'
  })

  // Load existing document if editing
  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const loadDocument = async () => {
        const doc = await getDocument(id, user.id)
        if (doc?.data) {
          setData({ ...INITIAL_DATA, ...doc.data })
        }
      }
      loadDocument()
    }
  }, [searchParams, user])

  const updateData = (updates: Partial<SelbstauskunftData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = () => {
    handleSave(data)
  }

  // Gesamteinkommen berechnen
  const gesamtEinkommen = (data.nettoeinkommenMonatlich || 0) + (data.weitereEinkuenfte || 0)

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateSelbstauskunftPDF({
        person: data.person,
        geburtsdatum: data.geburtsdatum,
        geburtsort: data.geburtsort,
        staatsangehoerigkeit: data.staatsangehoerigkeit,
        familienstand: data.familienstand,
        aktuelleAdresse: data.aktuelleAdresse,
        wohntSeit: data.wohntSeit,
        berufstaetig: data.berufstaetig,
        arbeitgeber: data.arbeitgeber,
        arbeitgeberAdresse: data.arbeitgeberAdresse,
        beschaeftigtSeit: data.beschaeftigtSeit,
        berufsbezeichnung: data.berufsbezeichnung,
        befristet: data.befristet,
        nettoeinkommenMonatlich: data.nettoeinkommenMonatlich,
        weitereEinkuenfte: data.weitereEinkuenfte,
        einkunftsart: data.einkunftsart,
        anzahlPersonen: data.anzahlPersonen,
        personenDetails: data.personenDetails,
        haustiere: data.haustiere,
        haustiereDetails: data.haustiereDetails,
        raucher: data.raucher,
        musikinstrumente: data.musikinstrumente,
        musikinstrumenteDetails: data.musikinstrumenteDetails,
        insolvenzverfahren: data.insolvenzverfahren,
        eidesstattlicheVersicherung: data.eidesstattlicheVersicherung,
        mietschulden: data.mietschulden,
        raeumungsklage: data.raeumungsklage,
        datenschutzEinwilligung: data.datenschutzEinwilligung,
        schufaEinwilligung: data.schufaEinwilligung,
        unterschrift: data.unterschrift
      })
      toast({
        title: 'PDF erstellt',
        description: 'Die Selbstauskunft wurde als PDF heruntergeladen.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht erstellt werden.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mieterselbstauskunft</h1>
              <p className="text-muted-foreground">
                Standardisierte Selbstauskunft für Mietinteressenten
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hinweis DSGVO */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Datenschutz-Hinweis</p>
                  <p className="text-blue-600">
                    Alle Angaben sind freiwillig. Der Vermieter darf nur Fragen stellen, die für die
                    Begründung des Mietverhältnisses erforderlich sind. Unzulässige Fragen müssen
                    nicht wahrheitsgemäß beantwortet werden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Persönliche Daten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PersonField
                value={data.person}
                onChange={(person) => updateData({ person })}
                required
                showBirthdate={false}
                showContact={true}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
                  <Input
                    id="geburtsdatum"
                    type="date"
                    value={data.geburtsdatum}
                    onChange={(e) => updateData({ geburtsdatum: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="geburtsort">Geburtsort</Label>
                  <Input
                    id="geburtsort"
                    value={data.geburtsort}
                    onChange={(e) => updateData({ geburtsort: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit</Label>
                  <Input
                    id="staatsangehoerigkeit"
                    value={data.staatsangehoerigkeit}
                    onChange={(e) => updateData({ staatsangehoerigkeit: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Familienstand</Label>
                <Select
                  value={data.familienstand}
                  onValueChange={(v) => updateData({ familienstand: v as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ledig">Ledig</SelectItem>
                    <SelectItem value="verheiratet">Verheiratet</SelectItem>
                    <SelectItem value="geschieden">Geschieden</SelectItem>
                    <SelectItem value="verwitwet">Verwitwet</SelectItem>
                    <SelectItem value="getrennt">Getrennt lebend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <AddressField
                value={data.aktuelleAdresse}
                onChange={(aktuelleAdresse) => updateData({ aktuelleAdresse })}
                label="Aktuelle Anschrift"
                showAIHelper={false}
              />

              <div className="max-w-xs">
                <Label htmlFor="wohntSeit">Wohnhaft seit</Label>
                <Input
                  id="wohntSeit"
                  type="date"
                  value={data.wohntSeit}
                  onChange={(e) => updateData({ wohntSeit: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Berufliche Situation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Berufliche Situation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={data.berufstaetig ? 'ja' : 'nein'}
                onValueChange={(v) => updateData({ berufstaetig: v === 'ja' })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ja" id="beruf-ja" />
                  <Label htmlFor="beruf-ja">Berufstätig</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nein" id="beruf-nein" />
                  <Label htmlFor="beruf-nein">Nicht berufstätig (Student, Rentner, etc.)</Label>
                </div>
              </RadioGroup>

              {data.berufstaetig && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="berufsbezeichnung">Berufsbezeichnung</Label>
                      <Input
                        id="berufsbezeichnung"
                        value={data.berufsbezeichnung}
                        onChange={(e) => updateData({ berufsbezeichnung: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="arbeitgeber">Arbeitgeber</Label>
                      <Input
                        id="arbeitgeber"
                        value={data.arbeitgeber}
                        onChange={(e) => updateData({ arbeitgeber: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="arbeitgeberAdresse">Adresse des Arbeitgebers</Label>
                    <Input
                      id="arbeitgeberAdresse"
                      value={data.arbeitgeberAdresse}
                      onChange={(e) => updateData({ arbeitgeberAdresse: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="beschaeftigtSeit">Beschäftigt seit</Label>
                      <Input
                        id="beschaeftigtSeit"
                        type="date"
                        value={data.beschaeftigtSeit}
                        onChange={(e) => updateData({ beschaeftigtSeit: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="befristet"
                          checked={data.befristet}
                          onCheckedChange={(checked) => updateData({ befristet: !!checked })}
                        />
                        <Label htmlFor="befristet">Befristetes Arbeitsverhältnis</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Einkommen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Einkommensverhältnisse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nettoeinkommen">Monatliches Nettoeinkommen (€)</Label>
                  <Input
                    id="nettoeinkommen"
                    type="number"
                    min="0"
                    value={data.nettoeinkommenMonatlich || ''}
                    onChange={(e) => updateData({ nettoeinkommenMonatlich: parseFloat(e.target.value) || null })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weitereEinkuenfte">Weitere Einkünfte (€)</Label>
                  <Input
                    id="weitereEinkuenfte"
                    type="number"
                    min="0"
                    value={data.weitereEinkuenfte || ''}
                    onChange={(e) => updateData({ weitereEinkuenfte: parseFloat(e.target.value) || null })}
                    className="mt-1"
                  />
                </div>
              </div>

              {data.weitereEinkuenfte && data.weitereEinkuenfte > 0 && (
                <div>
                  <Label htmlFor="einkunftsart">Art der weiteren Einkünfte</Label>
                  <Input
                    id="einkunftsart"
                    value={data.einkunftsart}
                    onChange={(e) => updateData({ einkunftsart: e.target.value })}
                    placeholder="z.B. Kindergeld, Rente, Unterhalt"
                    className="mt-1"
                  />
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gesamteinkommen:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(gesamtEinkommen)} / Monat
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mietverhältnis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5" />
                Angaben zum geplanten Mietverhältnis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anzahlPersonen">Anzahl einziehender Personen</Label>
                  <Input
                    id="anzahlPersonen"
                    type="number"
                    min="1"
                    value={data.anzahlPersonen}
                    onChange={(e) => updateData({ anzahlPersonen: parseInt(e.target.value) || 1 })}
                    className="mt-1"
                  />
                </div>
                {data.anzahlPersonen > 1 && (
                  <div>
                    <Label htmlFor="personenDetails">Weitere Personen</Label>
                    <Input
                      id="personenDetails"
                      value={data.personenDetails}
                      onChange={(e) => updateData({ personenDetails: e.target.value })}
                      placeholder="Name, Alter, Verhältnis"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="haustiere"
                    checked={data.haustiere}
                    onCheckedChange={(checked) => updateData({ haustiere: !!checked })}
                  />
                  <Label htmlFor="haustiere">Haustierhaltung gewünscht</Label>
                </div>
                {data.haustiere && (
                  <Input
                    value={data.haustiereDetails}
                    onChange={(e) => updateData({ haustiereDetails: e.target.value })}
                    placeholder="Art und Anzahl der Tiere"
                    className="ml-6"
                  />
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="raucher"
                    checked={data.raucher}
                    onCheckedChange={(checked) => updateData({ raucher: !!checked })}
                  />
                  <Label htmlFor="raucher">Raucher</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="musikinstrumente"
                    checked={data.musikinstrumente}
                    onCheckedChange={(checked) => updateData({ musikinstrumente: !!checked })}
                  />
                  <Label htmlFor="musikinstrumente">Musikinstrumente</Label>
                </div>
                {data.musikinstrumente && (
                  <Input
                    value={data.musikinstrumenteDetails}
                    onChange={(e) => updateData({ musikinstrumenteDetails: e.target.value })}
                    placeholder="Welche Instrumente?"
                    className="ml-6"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bonität */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bonitätsrelevante Angaben
              </CardTitle>
              <CardDescription>
                Bitte wahrheitsgemäß beantworten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insolvenz"
                    checked={data.insolvenzverfahren}
                    onCheckedChange={(checked) => updateData({ insolvenzverfahren: !!checked })}
                  />
                  <Label htmlFor="insolvenz">
                    Es läuft ein Insolvenzverfahren gegen mich
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eidesstattlich"
                    checked={data.eidesstattlicheVersicherung}
                    onCheckedChange={(checked) => updateData({ eidesstattlicheVersicherung: !!checked })}
                  />
                  <Label htmlFor="eidesstattlich">
                    Ich habe eine eidesstattliche Versicherung abgegeben
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mietschulden"
                    checked={data.mietschulden}
                    onCheckedChange={(checked) => updateData({ mietschulden: !!checked })}
                  />
                  <Label htmlFor="mietschulden">
                    Ich habe Mietschulden aus einem früheren Mietverhältnis
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="raeumungsklage"
                    checked={data.raeumungsklage}
                    onCheckedChange={(checked) => updateData({ raeumungsklage: !!checked })}
                  />
                  <Label htmlFor="raeumungsklage">
                    Es wurde/wird eine Räumungsklage gegen mich erhoben
                  </Label>
                </div>
              </div>

              {(data.insolvenzverfahren || data.eidesstattlicheVersicherung || data.mietschulden || data.raeumungsklage) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <p>
                      Bei positiven Angaben kann der Vermieter weitere Nachweise verlangen.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Einwilligungen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Einwilligungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="datenschutz"
                  checked={data.datenschutzEinwilligung}
                  onCheckedChange={(checked) => updateData({ datenschutzEinwilligung: !!checked })}
                />
                <div>
                  <Label htmlFor="datenschutz" className="cursor-pointer">
                    Datenschutz-Einwilligung
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ich willige ein, dass meine Daten zum Zweck der Prüfung meiner Eignung als
                    Mieter verarbeitet werden.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="schufa"
                  checked={data.schufaEinwilligung}
                  onCheckedChange={(checked) => updateData({ schufaEinwilligung: !!checked })}
                />
                <div>
                  <Label htmlFor="schufa" className="cursor-pointer">
                    SCHUFA-Einwilligung (optional)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ich willige ein, dass der Vermieter eine SCHUFA-Auskunft über mich einholt.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unterschrift</CardTitle>
              <CardDescription>
                Ich versichere die Richtigkeit aller Angaben.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureField
                value={{
                  ...data.unterschrift,
                  signerName: data.unterschrift.signerName ||
                    `${data.person.vorname} ${data.person.nachname}`.trim()
                }}
                onChange={(unterschrift) => updateData({ unterschrift })}
                required
              />
            </CardContent>
          </Card>

          {/* Aktionen */}
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Abbrechen</Link>
            </Button>
            {documentId && (
              <Button variant="outline" onClick={handleGeneratePDF} disabled={isLoading}>
                <FileDown className="h-4 w-4 mr-2" />
                PDF erstellen
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
