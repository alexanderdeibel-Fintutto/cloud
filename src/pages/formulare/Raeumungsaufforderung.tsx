import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateRaeumungsaufforderungPDF } from '@/lib/pdf/raeumungsaufforderung-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  kuendigungVom: string
  raeumungBis: string
  gruende: string[]
  rueckstaende: number | null
  fristsetzung: boolean
  fristBis: string
  androhungRaeumungsklage: boolean
  sonstigeForderungen: string
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  kuendigungVom: '',
  raeumungBis: '',
  gruende: [],
  rueckstaende: null,
  fristsetzung: false,
  fristBis: '',
  androhungRaeumungsklage: true,
  sonstigeForderungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const GRUENDE_OPTIONEN = [
  { value: 'kuendigung', label: 'Wirksame Kündigung des Mietverhältnisses' },
  { value: 'mietrueckstand', label: 'Erhebliche Mietrückstände' },
  { value: 'vertragsverletzung', label: 'Schwerwiegende Vertragsverletzungen' },
  { value: 'eigenbedarf', label: 'Angemeldeter Eigenbedarf' },
  { value: 'fristablauf', label: 'Ablauf eines befristeten Mietvertrags' },
]

export default function RaeumungsaufforderungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'raeumungsaufforderung',
    generateTitle: (data) => `Räumungsaufforderung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Räumungsaufforderung'
  })

  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const loadDocument = async () => {
        const doc = await getDocument(id, user.id)
        if (doc?.data) {
          setFormData({ ...INITIAL_DATA, ...doc.data })
        }
      }
      loadDocument()
    }
  }, [searchParams, user])

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleGrund = (value: string) => {
    const current = formData.gruende
    if (current.includes(value)) {
      updateData({ gruende: current.filter(v => v !== value) })
    } else {
      updateData({ gruende: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateRaeumungsaufforderungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Räumungsaufforderung wurde als PDF heruntergeladen.' })
    } catch (error) {
      toast({ title: 'Fehler', description: 'PDF konnte nicht erstellt werden.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Räumungsaufforderung</h1>
              <p className="text-muted-foreground">Aufforderung zur Räumung und Herausgabe des Mietobjekts</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Absender)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.vermieter}
                onChange={(v) => updateData({ vermieter: v })}
                label="Vermieter"
                required
              />
              <AddressField
                value={formData.vermieterAdresse}
                onChange={(v) => updateData({ vermieterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter (Empfänger)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mieter"
                required
              />
              <AddressField
                value={formData.mieterAdresse}
                onChange={(v) => updateData({ mieterAdresse: v })}
                label="Aktuelle Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
            </CardContent>
          </Card>

          {/* Räumungsdetails */}
          <Card>
            <CardHeader>
              <CardTitle>Räumungsaufforderung</CardTitle>
              <CardDescription>
                Angaben zur Räumung und Begründung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kündigung vom</Label>
                  <Input
                    type="date"
                    value={formData.kuendigungVom}
                    onChange={(e) => updateData({ kuendigungVom: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Räumung bis *</Label>
                  <Input
                    type="date"
                    value={formData.raeumungBis}
                    onChange={(e) => updateData({ raeumungBis: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Gründe für die Räumungsaufforderung:</Label>
                <div className="space-y-2">
                  {GRUENDE_OPTIONEN.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.gruende.includes(option.value)}
                        onCheckedChange={() => toggleGrund(option.value)}
                      />
                      <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <CurrencyField
                label="Offene Mietrückstände (falls vorhanden)"
                value={formData.rueckstaende}
                onChange={(v) => updateData({ rueckstaende: v })}
              />

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fristsetzung"
                    checked={formData.fristsetzung}
                    onCheckedChange={(c) => updateData({ fristsetzung: !!c })}
                  />
                  <Label htmlFor="fristsetzung" className="font-medium">
                    Zusätzliche Frist setzen
                  </Label>
                </div>

                {formData.fristsetzung && (
                  <div>
                    <Label>Frist bis</Label>
                    <Input
                      type="date"
                      value={formData.fristBis}
                      onChange={(e) => updateData({ fristBis: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="androhung"
                    checked={formData.androhungRaeumungsklage}
                    onCheckedChange={(c) => updateData({ androhungRaeumungsklage: !!c })}
                  />
                  <Label htmlFor="androhung" className="font-medium">
                    Räumungsklage androhen
                  </Label>
                </div>
              </div>

              <div>
                <Label>Sonstige Forderungen</Label>
                <Textarea
                  value={formData.sonstigeForderungen}
                  onChange={(e) => updateData({ sonstigeForderungen: e.target.value })}
                  placeholder="Weitere Forderungen (z.B. Schlüsselrückgabe, Renovierung)..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ort</Label>
                  <Input
                    value={formData.erstelltOrt}
                    onChange={(e) => updateData({ erstelltOrt: e.target.value })}
                    placeholder="z.B. Berlin"
                  />
                </div>
                <div>
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={formData.erstelltAm}
                    onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  />
                </div>
              </div>
              <SignatureField
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift des Vermieters"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
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
