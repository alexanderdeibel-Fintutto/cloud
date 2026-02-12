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
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateAbmahnungPDF } from '@/lib/pdf/abmahnung-pdf'
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
  abmahnungsgrund: string
  abmahnungsgruende: string[]
  sachverhalt: string
  aufforderung: string
  fristsetzung: string
  androhungKuendigung: boolean
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
  abmahnungsgrund: 'vertragsverletzung',
  abmahnungsgruende: [],
  sachverhalt: '',
  aufforderung: '',
  fristsetzung: '',
  androhungKuendigung: true,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const ABMAHNUNGSGRUENDE = [
  { value: 'mietrueckstand', label: 'Mietrückstand / Zahlungsverzug' },
  { value: 'laermbelaestigung', label: 'Lärmbelästigung / Ruhestörung' },
  { value: 'unerlaubte-tierhaltung', label: 'Unerlaubte Tierhaltung' },
  { value: 'unerlaubte-untervermietung', label: 'Unerlaubte Untervermietung' },
  { value: 'beschaedigung', label: 'Beschädigung der Mietsache' },
  { value: 'hausordnung', label: 'Verstoß gegen Hausordnung' },
  { value: 'verwahrlosung', label: 'Verwahrlosung der Wohnung' },
  { value: 'beleidigung', label: 'Beleidigung / Bedrohung' },
  { value: 'gewerbliche-nutzung', label: 'Unerlaubte gewerbliche Nutzung' },
  { value: 'sonstiges', label: 'Sonstiger Grund' },
]

export default function AbmahnungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'abmahnung',
    generateTitle: (data) => `Abmahnung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Abmahnung'
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
    const current = formData.abmahnungsgruende
    if (current.includes(value)) {
      updateData({ abmahnungsgruende: current.filter(v => v !== value) })
    } else {
      updateData({ abmahnungsgruende: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateAbmahnungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Abmahnung wurde als PDF heruntergeladen.' })
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
              <h1 className="text-2xl font-bold">Abmahnung</h1>
              <p className="text-muted-foreground">Formelle Abmahnung wegen Vertragsverletzung (§ 541, § 543 BGB)</p>
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
                label="Anschrift"
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
                label="Adresse der Mietwohnung"
                required
              />
            </CardContent>
          </Card>

          {/* Abmahnungsgründe */}
          <Card>
            <CardHeader>
              <CardTitle>Abmahnungsgrund</CardTitle>
              <CardDescription>
                Wählen Sie den Grund für die Abmahnung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {ABMAHNUNGSGRUENDE.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.abmahnungsgruende.includes(option.value)}
                      onCheckedChange={() => toggleGrund(option.value)}
                    />
                    <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sachverhalt */}
          <Card>
            <CardHeader>
              <CardTitle>Sachverhalt</CardTitle>
              <CardDescription>
                Beschreiben Sie den konkreten Vorfall / die Vertragsverletzung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.sachverhalt}
                onChange={(e) => updateData({ sachverhalt: e.target.value })}
                placeholder="Beschreiben Sie detailliert, welche Vertragsverletzung vorliegt, wann diese stattgefunden hat und welche Auswirkungen dies hat..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Aufforderung */}
          <Card>
            <CardHeader>
              <CardTitle>Aufforderung zur Unterlassung / Beseitigung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.aufforderung}
                onChange={(e) => updateData({ aufforderung: e.target.value })}
                placeholder="z.B. Ich fordere Sie hiermit auf, das vertragswidrige Verhalten sofort einzustellen und künftig zu unterlassen..."
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frist zur Abhilfe</Label>
                  <Input
                    type="date"
                    value={formData.fristsetzung}
                    onChange={(e) => updateData({ fristsetzung: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="androhung"
                  checked={formData.androhungKuendigung}
                  onCheckedChange={(c) => updateData({ androhungKuendigung: !!c })}
                />
                <Label htmlFor="androhung">
                  Androhung einer Kündigung bei Nichtbeachtung
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Rechtlicher Hinweis */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Rechtlicher Hinweis</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Eine Abmahnung ist in der Regel Voraussetzung für eine verhaltensbedingte Kündigung</li>
                    <li>Die Abmahnung muss das beanstandete Verhalten konkret bezeichnen</li>
                    <li>Senden Sie die Abmahnung per Einschreiben mit Rückschein</li>
                    <li>Bewahren Sie eine Kopie für Ihre Unterlagen auf</li>
                  </ul>
                </div>
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
                label="Unterschrift Vermieter"
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
