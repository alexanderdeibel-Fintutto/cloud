import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Trees, Save, FileDown } from 'lucide-react'
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
import { generateGartennutzungsvereinbarungPDF } from '@/lib/pdf/gartennutzungsvereinbarung-pdf'
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
  gartenflaeche: string
  gartengroesse: string
  nutzungsbeginn: string
  monatlicheKosten: number | null
  inMieteEnthalten: boolean
  nutzungsrechte: string[]
  pflichten: string[]
  sonstigeVereinbarungen: string
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
  gartenflaeche: '',
  gartengroesse: '',
  nutzungsbeginn: '',
  monatlicheKosten: null,
  inMieteEnthalten: true,
  nutzungsrechte: [],
  pflichten: [],
  sonstigeVereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const NUTZUNGSRECHTE_OPTIONEN = [
  { value: 'bepflanzung', label: 'Bepflanzung mit Blumen und Sträuchern' },
  { value: 'gemuese', label: 'Anlegen eines Gemüsegartens' },
  { value: 'rasen', label: 'Rasenfläche nutzen' },
  { value: 'gartenmoebel', label: 'Aufstellen von Gartenmöbeln' },
  { value: 'grill', label: 'Grillen (unter Beachtung der Hausordnung)' },
  { value: 'spielgeraete', label: 'Aufstellen von Spielgeräten' },
  { value: 'pool', label: 'Aufstellen eines Pools (nach Absprache)' },
  { value: 'gartenhaus', label: 'Nutzung des vorhandenen Gartenhauses' },
  { value: 'kompost', label: 'Anlegen eines Komposts' },
]

const PFLICHTEN_OPTIONEN = [
  { value: 'rasenpflege', label: 'Regelmäßiges Rasenmähen' },
  { value: 'unkraut', label: 'Unkrautentfernung' },
  { value: 'hecke', label: 'Heckenschnitt' },
  { value: 'laub', label: 'Laubentfernung im Herbst' },
  { value: 'winterdienst', label: 'Winterdienst auf Gartenwegen' },
  { value: 'bewaesserung', label: 'Bewässerung der Pflanzen' },
  { value: 'baumschnitt', label: 'Obstbaumschnitt' },
  { value: 'sauberkeit', label: 'Sauberhalten der Gartenfläche' },
]

export default function GartennutzungsvereinbarungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'gartennutzungsvereinbarung',
    generateTitle: (data) => `Gartennutzung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Gartennutzungsvereinbarung'
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

  const toggleNutzungsrecht = (value: string) => {
    const current = formData.nutzungsrechte
    if (current.includes(value)) {
      updateData({ nutzungsrechte: current.filter(v => v !== value) })
    } else {
      updateData({ nutzungsrechte: [...current, value] })
    }
  }

  const togglePflicht = (value: string) => {
    const current = formData.pflichten
    if (current.includes(value)) {
      updateData({ pflichten: current.filter(v => v !== value) })
    } else {
      updateData({ pflichten: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateGartennutzungsvereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Gartennutzungsvereinbarung wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Trees className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gartennutzungsvereinbarung</h1>
              <p className="text-muted-foreground">Vereinbarung über die Nutzung einer Gartenfläche</p>
            </div>
          </div>
        </div>

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
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt & Garten */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt und Gartenfläche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bezeichnung der Gartenfläche</Label>
                  <Input
                    value={formData.gartenflaeche}
                    onChange={(e) => updateData({ gartenflaeche: e.target.value })}
                    placeholder="z.B. Hinterer Gartenbereich, Parzelle 3"
                  />
                </div>
                <div>
                  <Label>Größe der Gartenfläche (ca.)</Label>
                  <Input
                    value={formData.gartengroesse}
                    onChange={(e) => updateData({ gartengroesse: e.target.value })}
                    placeholder="z.B. 50 m²"
                  />
                </div>
              </div>

              <div>
                <Label>Nutzungsbeginn</Label>
                <Input
                  type="date"
                  value={formData.nutzungsbeginn}
                  onChange={(e) => updateData({ nutzungsbeginn: e.target.value })}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Kosten */}
          <Card>
            <CardHeader>
              <CardTitle>Kosten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="inMiete"
                  checked={formData.inMieteEnthalten}
                  onCheckedChange={(c) => updateData({ inMieteEnthalten: !!c })}
                />
                <Label htmlFor="inMiete">
                  Die Gartennutzung ist in der Miete enthalten (keine zusätzlichen Kosten)
                </Label>
              </div>

              {!formData.inMieteEnthalten && (
                <CurrencyField
                  label="Monatliche Kosten für Gartennutzung"
                  value={formData.monatlicheKosten}
                  onChange={(v) => updateData({ monatlicheKosten: v })}
                />
              )}
            </CardContent>
          </Card>

          {/* Nutzungsrechte */}
          <Card>
            <CardHeader>
              <CardTitle>Nutzungsrechte</CardTitle>
              <CardDescription>
                Welche Nutzungen sind dem Mieter gestattet?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {NUTZUNGSRECHTE_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`recht-${option.value}`}
                      checked={formData.nutzungsrechte.includes(option.value)}
                      onCheckedChange={() => toggleNutzungsrecht(option.value)}
                    />
                    <Label htmlFor={`recht-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pflichten */}
          <Card>
            <CardHeader>
              <CardTitle>Pflichten des Mieters</CardTitle>
              <CardDescription>
                Welche Pflegepflichten übernimmt der Mieter?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PFLICHTEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pflicht-${option.value}`}
                      checked={formData.pflichten.includes(option.value)}
                      onCheckedChange={() => togglePflicht(option.value)}
                    />
                    <Label htmlFor={`pflicht-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sonstige Vereinbarungen */}
          <Card>
            <CardHeader>
              <CardTitle>Sonstige Vereinbarungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.sonstigeVereinbarungen}
                onChange={(e) => updateData({ sonstigeVereinbarungen: e.target.value })}
                placeholder="Weitere Vereinbarungen zur Gartennutzung..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschriften</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatureField
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
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
