import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertOctagon, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { generateAusserordentlicheKuendigungPDF } from '@/lib/pdf/ausserordentliche-kuendigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  absenderRolle: 'vermieter' | 'mieter'
  absender: PersonData
  absenderAdresse: AddressData
  empfaenger: PersonData
  empfaengerAdresse: AddressData
  mietobjektAdresse: AddressData
  kuendigungsgrund: 'zahlungsverzug' | 'stoerung' | 'vertragsbruch' | 'gesundheit' | 'sonstige'
  kuendigungsgrundDetails: string
  abmahnungErfolgt: boolean
  abmahnungDatum: string
  kuendigungZum: string
  fristlos: boolean
  unterschriftAbsender: SignatureData
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  absenderRolle: 'vermieter',
  absender: { ...EMPTY_PERSON },
  absenderAdresse: { ...EMPTY_ADDRESS },
  empfaenger: { ...EMPTY_PERSON },
  empfaengerAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  kuendigungsgrund: 'zahlungsverzug',
  kuendigungsgrundDetails: '',
  abmahnungErfolgt: false,
  abmahnungDatum: '',
  kuendigungZum: '',
  fristlos: true,
  unterschriftAbsender: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function AusserordentlicheKuendigungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'ausserordentliche-kuendigung',
    generateTitle: (data) => `Außerordentliche Kündigung - ${data.absender?.vorname || ''} ${data.absender?.nachname || ''}`.trim() || 'Außerordentliche Kündigung'
  })

  // Load existing document if editing
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

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateAusserordentlicheKuendigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die außerordentliche Kündigung wurde als PDF gespeichert.' })
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
              <AlertOctagon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Außerordentliche Kündigung</h1>
              <p className="text-muted-foreground">Fristlose Kündigung aus wichtigem Grund</p>
            </div>
          </div>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <strong>§ 543 BGB:</strong> Eine außerordentliche fristlose Kündigung setzt einen wichtigen
            Grund voraus. Bei Zahlungsverzug ist die fristlose Kündigung möglich, wenn der Mieter mit
            zwei Monatsmieten oder einem erheblichen Teil (§ 569 BGB) in Verzug ist. In vielen Fällen
            ist vorher eine Abmahnung erforderlich.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Absender-Rolle */}
          <Card>
            <CardHeader>
              <CardTitle>Wer kündigt?</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.absenderRolle}
                onValueChange={(v: 'vermieter' | 'mieter') => updateData({ absenderRolle: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vermieter">Vermieter kündigt dem Mieter</SelectItem>
                  <SelectItem value="mieter">Mieter kündigt dem Vermieter</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Absender */}
          <Card>
            <CardHeader>
              <CardTitle>{formData.absenderRolle === 'vermieter' ? 'Vermieter' : 'Mieter'} (Absender)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.absender}
                onChange={(v) => updateData({ absender: v })}
                label={formData.absenderRolle === 'vermieter' ? 'Vermieter' : 'Mieter'}
                required
              />
              <AddressField
                value={formData.absenderAdresse}
                onChange={(v) => updateData({ absenderAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Empfänger */}
          <Card>
            <CardHeader>
              <CardTitle>{formData.absenderRolle === 'vermieter' ? 'Mieter' : 'Vermieter'} (Empfänger)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.empfaenger}
                onChange={(v) => updateData({ empfaenger: v })}
                label={formData.absenderRolle === 'vermieter' ? 'Mieter' : 'Vermieter'}
                required
              />
              <AddressField
                value={formData.empfaengerAdresse}
                onChange={(v) => updateData({ empfaengerAdresse: v })}
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
                label="Adresse des Mietobjekts"
                required
              />
            </CardContent>
          </Card>

          {/* Kündigungsgrund */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                Kündigungsgrund
              </CardTitle>
              <CardDescription>
                Der wichtige Grund muss konkret dargelegt werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Grund für die außerordentliche Kündigung *</Label>
                <Select
                  value={formData.kuendigungsgrund}
                  onValueChange={(v: typeof formData.kuendigungsgrund) => updateData({ kuendigungsgrund: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formData.absenderRolle === 'vermieter' ? (
                      <>
                        <SelectItem value="zahlungsverzug">Zahlungsverzug (§ 543 Abs. 2 Nr. 3 BGB)</SelectItem>
                        <SelectItem value="stoerung">Nachhaltige Störung des Hausfriedens</SelectItem>
                        <SelectItem value="vertragsbruch">Erhebliche Vertragsverletzung</SelectItem>
                        <SelectItem value="sonstige">Sonstiger wichtiger Grund</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="gesundheit">Gesundheitsgefährdung (§ 569 Abs. 1 BGB)</SelectItem>
                        <SelectItem value="vertragsbruch">Vertragsverletzung durch Vermieter</SelectItem>
                        <SelectItem value="sonstige">Sonstiger wichtiger Grund</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ausführliche Begründung *</Label>
                <Textarea
                  value={formData.kuendigungsgrundDetails}
                  onChange={(e) => updateData({ kuendigungsgrundDetails: e.target.value })}
                  placeholder={
                    formData.kuendigungsgrund === 'zahlungsverzug'
                      ? 'z.B.: Der Mieter ist mit der Miete für die Monate Januar und Februar 2024 in Höhe von jeweils 800,00 € im Rückstand. Trotz Mahnung vom 15.01.2024 erfolgte keine Zahlung...'
                      : formData.kuendigungsgrund === 'stoerung'
                      ? 'z.B.: Der Mieter stört wiederholt den Hausfrieden durch nächtlichen Lärm. Trotz Abmahnungen vom ... hat sich das Verhalten nicht geändert...'
                      : 'Beschreiben Sie den wichtigen Grund ausführlich und nachvollziehbar...'
                  }
                  rows={5}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="abmahnung"
                    checked={formData.abmahnungErfolgt}
                    onChange={(e) => updateData({ abmahnungErfolgt: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="abmahnung">Vorherige Abmahnung erfolgt</Label>
                </div>
                {formData.abmahnungErfolgt && (
                  <div>
                    <Label>Abmahnung vom</Label>
                    <Input
                      type="date"
                      value={formData.abmahnungDatum}
                      onChange={(e) => updateData({ abmahnungDatum: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fristlos"
                  checked={formData.fristlos}
                  onChange={(e) => updateData({ fristlos: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="fristlos">Fristlose Kündigung (sofortige Wirkung)</Label>
              </div>

              {!formData.fristlos && (
                <div>
                  <Label>Kündigung zum</Label>
                  <Input
                    type="date"
                    value={formData.kuendigungZum}
                    onChange={(e) => updateData({ kuendigungZum: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Datum *</Label>
                <Input
                  type="date"
                  value={formData.erstelltAm}
                  onChange={(e) => updateData({ erstelltAm: e.target.value })}
                  className="w-48"
                />
              </div>
              <Separator />
              <SignatureField
                value={formData.unterschriftAbsender}
                onChange={(v) => updateData({ unterschriftAbsender: v })}
                label={`Unterschrift ${formData.absenderRolle === 'vermieter' ? 'Vermieter' : 'Mieter'}`}
                required
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
