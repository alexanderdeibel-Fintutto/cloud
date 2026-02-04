import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateIndexmietvertragPDF } from '@/lib/pdf/indexmietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  wohnflaeche: string
  zimmer: string
  mietbeginn: string
  kaltmiete: number | null
  nebenkosten: number | null
  basisindex: string
  basisjahr: string
  anpassungsintervall: '12' | '24'
  mindestanpassung: string
  kaution: number | null
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  wohnflaeche: '',
  zimmer: '',
  mietbeginn: '',
  kaltmiete: null,
  nebenkosten: null,
  basisindex: '',
  basisjahr: new Date().getFullYear().toString(),
  anpassungsintervall: '12',
  mindestanpassung: '0',
  kaution: null,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function IndexmietvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'indexmietvertrag',
    generateTitle: (data) => `Indexmietvertrag - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Indexmietvertrag'
  })

  // Load existing document if editing
  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const doc = getDocument(id, user.id)
      if (doc?.data) {
        setFormData({ ...INITIAL_DATA, ...doc.data })
      }
    }
  }, [searchParams, user])

  const handleSubmit = () => {
    handleSave(formData)
  }

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateIndexmietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Indexmietvertrag wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-violet-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Indexmietvertrag</h1>
              <p className="text-muted-foreground">Mietvertrag mit Anpassung an den Verbraucherpreisindex</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <strong>§ 557b BGB:</strong> Bei der Indexmiete wird die Miete an die Entwicklung des
            Verbraucherpreisindex gekoppelt. Die Anpassung muss schriftlich geltend gemacht werden
            und darf frühestens ein Jahr nach Mietbeginn oder der letzten Anpassung erfolgen.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter</CardTitle>
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
              <CardTitle>Mieter</CardTitle>
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
                label="Bisherige Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Wohnfläche (m²) *</Label>
                  <Input
                    type="number"
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                    placeholder="z.B. 75"
                  />
                </div>
                <div>
                  <Label>Zimmer</Label>
                  <Input
                    value={formData.zimmer}
                    onChange={(e) => updateData({ zimmer: e.target.value })}
                    placeholder="z.B. 3"
                  />
                </div>
                <div>
                  <Label>Mietbeginn *</Label>
                  <Input
                    type="date"
                    value={formData.mietbeginn}
                    onChange={(e) => updateData({ mietbeginn: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Miete */}
          <Card>
            <CardHeader>
              <CardTitle>Miete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Kaltmiete *"
                  value={formData.kaltmiete}
                  onChange={(v) => updateData({ kaltmiete: v })}
                />
                <CurrencyField
                  label="Nebenkosten monatlich *"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
              </div>
              <CurrencyField
                label="Kaution"
                value={formData.kaution}
                onChange={(v) => updateData({ kaution: v })}
              />
            </CardContent>
          </Card>

          {/* Indexklausel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Indexklausel
              </CardTitle>
              <CardDescription>
                Die Miete wird an den Verbraucherpreisindex des Statistischen Bundesamtes gekoppelt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Basisindex (Punkte)</Label>
                  <Input
                    value={formData.basisindex}
                    onChange={(e) => updateData({ basisindex: e.target.value })}
                    placeholder="z.B. 117,4"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Aktueller VPI bei Vertragsabschluss (destatis.de)
                  </p>
                </div>
                <div>
                  <Label>Basisjahr</Label>
                  <Input
                    value={formData.basisjahr}
                    onChange={(e) => updateData({ basisjahr: e.target.value })}
                    placeholder="z.B. 2020"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Referenzjahr für den Index (z.B. 2020 = 100)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Anpassungsintervall</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.anpassungsintervall}
                    onChange={(e) => updateData({ anpassungsintervall: e.target.value as '12' | '24' })}
                  >
                    <option value="12">Jährlich (12 Monate)</option>
                    <option value="24">Alle 2 Jahre (24 Monate)</option>
                  </select>
                </div>
                <div>
                  <Label>Mindeständerung für Anpassung (%)</Label>
                  <Input
                    value={formData.mindestanpassung}
                    onChange={(e) => updateData({ mindestanpassung: e.target.value })}
                    placeholder="z.B. 0 oder 3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0 = jede Änderung, 3 = erst ab 3% Änderung
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Berechnungsbeispiel:</h4>
                <p className="text-sm text-muted-foreground">
                  Steigt der Verbraucherpreisindex von {formData.basisindex || '117,4'} auf 120,0 Punkte
                  (ca. 2,2% Steigerung), erhöht sich die Miete entsprechend prozentual.
                  Bei einer Kaltmiete von {formData.kaltmiete ? `${formData.kaltmiete.toLocaleString('de-DE')} €` : '1.000 €'}
                  wären das ca. {formData.kaltmiete ? `${(formData.kaltmiete * 0.022).toFixed(2).replace('.', ',')} €` : '22 €'} mehr.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsabschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ort *</Label>
                  <Input
                    value={formData.erstelltOrt}
                    onChange={(e) => updateData({ erstelltOrt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={formData.erstelltAm}
                    onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatureField
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                  required
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
                  required
                />
              </div>
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
