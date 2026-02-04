import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Home, AlertTriangle, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateEigenbedarfskuendigungPDF } from '@/lib/pdf/eigenbedarfskuendigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  bedarfsperson: string
  bedarfspersonVerhaeltnis: string
  bedarfsgrund: string
  detaillierteBegrundung: string
  mietdauer: string
  kuendigungsfrist: string
  kuendigungZum: string
  widerspruchsbelehrung: boolean
  unterschriftVermieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  bedarfsperson: '',
  bedarfspersonVerhaeltnis: '',
  bedarfsgrund: '',
  detaillierteBegrundung: '',
  mietdauer: '',
  kuendigungsfrist: '3',
  kuendigungZum: '',
  widerspruchsbelehrung: true,
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const VERHAELTNIS_OPTIONS = [
  { value: 'selbst', label: 'Vermieter selbst' },
  { value: 'ehepartner', label: 'Ehepartner/Lebenspartner' },
  { value: 'kind', label: 'Kind' },
  { value: 'eltern', label: 'Eltern' },
  { value: 'geschwister', label: 'Geschwister' },
  { value: 'enkel', label: 'Enkel' },
  { value: 'grosseltern', label: 'Großeltern' },
  { value: 'sonstige', label: 'Sonstige Familienangehörige' },
]

const BEDARFSGRUND_OPTIONS = [
  { value: 'wohnbedarf', label: 'Eigener Wohnbedarf' },
  { value: 'familiengruendung', label: 'Familiengründung / Nachwuchs' },
  { value: 'pflegebedarf', label: 'Pflegebedarf / Nähe zu Pflegebedürftigen' },
  { value: 'arbeitsplatz', label: 'Arbeitsplatzwechsel / Nähe zum Arbeitsplatz' },
  { value: 'trennung', label: 'Trennung / Scheidung' },
  { value: 'rueckzug', label: 'Rückzug ins Eigentum im Alter' },
  { value: 'sonstige', label: 'Sonstiger Grund' },
]

export default function EigenbedarfskuendigungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'eigenbedarfskuendigung',
    generateTitle: (data) => `Eigenbedarfskündigung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Eigenbedarfskündigung'
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

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateEigenbedarfskuendigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Eigenbedarfskündigung wurde als PDF gespeichert.' })
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
              <Home className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Eigenbedarfskündigung</h1>
              <p className="text-muted-foreground">Kündigung wegen Eigenbedarf gemäß § 573 Abs. 2 Nr. 2 BGB</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Wichtiger Hinweis:</strong> Eine Eigenbedarfskündigung muss gut begründet sein.
            Der Eigenbedarf muss konkret und nachvollziehbar dargelegt werden. Bei Fehlern kann die
            Kündigung unwirksam sein. Im Zweifel sollten Sie rechtliche Beratung in Anspruch nehmen.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Kündigender)</CardTitle>
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
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Mietobjekt"
                required
              />
              <div>
                <Label>Mietvertrag vom</Label>
                <Input
                  type="date"
                  value={formData.mietvertragVom}
                  onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Eigenbedarf */}
          <Card>
            <CardHeader>
              <CardTitle>Eigenbedarf</CardTitle>
              <CardDescription>
                Detaillierte Angaben zur Bedarfsperson und zum Grund
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bedarfsperson (Name) *</Label>
                <Input
                  value={formData.bedarfsperson}
                  onChange={(e) => updateData({ bedarfsperson: e.target.value })}
                  placeholder="Name der Person, die einziehen soll"
                />
              </div>

              <div>
                <Label>Verhältnis zum Vermieter *</Label>
                <Select
                  value={formData.bedarfspersonVerhaeltnis}
                  onValueChange={(v) => updateData({ bedarfspersonVerhaeltnis: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                  <SelectContent>
                    {VERHAELTNIS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Grund des Eigenbedarfs *</Label>
                <Select
                  value={formData.bedarfsgrund}
                  onValueChange={(v) => updateData({ bedarfsgrund: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                  <SelectContent>
                    {BEDARFSGRUND_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Detaillierte Begründung *</Label>
                <Textarea
                  value={formData.detaillierteBegrundung}
                  onChange={(e) => updateData({ detaillierteBegrundung: e.target.value })}
                  placeholder="Beschreiben Sie ausführlich, warum die Wohnung für die Bedarfsperson benötigt wird. Je konkreter, desto besser. Z.B.: Aktuelle Wohnsituation, warum gerade diese Wohnung, Dringlichkeit..."
                  rows={5}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Die Begründung muss konkret und nachvollziehbar sein.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Kündigungsfristen */}
          <Card>
            <CardHeader>
              <CardTitle>Kündigungsfrist</CardTitle>
              <CardDescription>
                Die Kündigungsfrist richtet sich nach der Mietdauer (§ 573c BGB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bisherige Mietdauer</Label>
                <Select
                  value={formData.mietdauer}
                  onValueChange={(v) => {
                    updateData({ mietdauer: v })
                    // Automatisch Kündigungsfrist setzen
                    if (v === 'unter5') updateData({ kuendigungsfrist: '3' })
                    else if (v === '5bis8') updateData({ kuendigungsfrist: '6' })
                    else if (v === 'ueber8') updateData({ kuendigungsfrist: '9' })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Mietdauer wählen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unter5">Unter 5 Jahre → 3 Monate Frist</SelectItem>
                    <SelectItem value="5bis8">5 bis 8 Jahre → 6 Monate Frist</SelectItem>
                    <SelectItem value="ueber8">Über 8 Jahre → 9 Monate Frist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Kündigungsfrist (Monate)</Label>
                  <Input
                    value={formData.kuendigungsfrist}
                    onChange={(e) => updateData({ kuendigungsfrist: e.target.value })}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Kündigung zum *</Label>
                  <Input
                    type="date"
                    value={formData.kuendigungZum}
                    onChange={(e) => updateData({ kuendigungZum: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Kündigung</CardTitle>
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

              <SignatureField
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift Vermieter"
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
