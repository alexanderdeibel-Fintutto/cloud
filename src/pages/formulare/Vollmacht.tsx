import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileCheck, Save, FileDown } from 'lucide-react'
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
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateVollmachtPDF } from '@/lib/pdf/vollmacht-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vollmachtgeber: PersonData
  vollmachtgeberAdresse: AddressData
  bevollmaechtigter: PersonData
  bevollmaechtigterAdresse: AddressData
  mietobjektAdresse: AddressData
  befugnisse: string[]
  sonstigeBefugnisse: string
  befristet: boolean
  gueltigBis: string
  unterschrift: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vollmachtgeber: { ...EMPTY_PERSON },
  vollmachtgeberAdresse: { ...EMPTY_ADDRESS },
  bevollmaechtigter: { ...EMPTY_PERSON },
  bevollmaechtigterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  befugnisse: [],
  sonstigeBefugnisse: '',
  befristet: false,
  gueltigBis: '',
  unterschrift: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const BEFUGNISSE_OPTIONEN = [
  { value: 'vertretung', label: 'Vertretung gegenüber dem Vermieter in allen Mietangelegenheiten' },
  { value: 'kuendigung', label: 'Empfang und Ausspruch von Kündigungen' },
  { value: 'vertragsaenderung', label: 'Abschluss von Vertragsänderungen und Nachträgen' },
  { value: 'uebergabe', label: 'Durchführung von Wohnungsübergaben/-abnahmen' },
  { value: 'maengelanzeige', label: 'Mängelanzeigen und Reparaturanforderungen' },
  { value: 'zahlungen', label: 'Empfang von Zahlungen (z.B. Kautionsrückzahlung)' },
  { value: 'schriftverkehr', label: 'Entgegennahme und Versand von Schriftverkehr' },
  { value: 'besichtigungen', label: 'Teilnahme an Wohnungsbesichtigungen' },
]

export default function VollmachtPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'vollmacht',
    generateTitle: (data) => `Vollmacht - ${data.vollmachtgeber?.vorname || ''} ${data.vollmachtgeber?.nachname || ''}`.trim() || 'Vollmacht'
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

  const toggleBefugnis = (value: string) => {
    const current = formData.befugnisse
    if (current.includes(value)) {
      updateData({ befugnisse: current.filter(v => v !== value) })
    } else {
      updateData({ befugnisse: [...current, value] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateVollmachtPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Vollmacht wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vollmacht</h1>
              <p className="text-muted-foreground">Bevollmächtigung für Mietangelegenheiten</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vollmachtgeber */}
          <Card>
            <CardHeader>
              <CardTitle>Vollmachtgeber</CardTitle>
              <CardDescription>
                Person, die die Vollmacht erteilt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.vollmachtgeber}
                onChange={(v) => updateData({ vollmachtgeber: v })}
                label="Vollmachtgeber"
                required
              />
              <AddressField
                value={formData.vollmachtgeberAdresse}
                onChange={(v) => updateData({ vollmachtgeberAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Bevollmächtigter */}
          <Card>
            <CardHeader>
              <CardTitle>Bevollmächtigter</CardTitle>
              <CardDescription>
                Person, die bevollmächtigt wird
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.bevollmaechtigter}
                onChange={(v) => updateData({ bevollmaechtigter: v })}
                label="Bevollmächtigter"
                required
              />
              <AddressField
                value={formData.bevollmaechtigterAdresse}
                onChange={(v) => updateData({ bevollmaechtigterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
              <CardDescription>
                Für welches Mietobjekt gilt die Vollmacht
              </CardDescription>
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

          {/* Befugnisse */}
          <Card>
            <CardHeader>
              <CardTitle>Umfang der Vollmacht</CardTitle>
              <CardDescription>
                Wählen Sie die gewünschten Befugnisse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {BEFUGNISSE_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.befugnisse.includes(option.value)}
                      onCheckedChange={() => toggleBefugnis(option.value)}
                    />
                    <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>

              <div>
                <Label>Sonstige Befugnisse</Label>
                <Textarea
                  value={formData.sonstigeBefugnisse}
                  onChange={(e) => updateData({ sonstigeBefugnisse: e.target.value })}
                  placeholder="Weitere spezifische Befugnisse..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="befristet"
                  checked={formData.befristet}
                  onCheckedChange={(c) => updateData({ befristet: !!c })}
                />
                <Label htmlFor="befristet">Vollmacht ist zeitlich befristet</Label>
              </div>

              {formData.befristet && (
                <div>
                  <Label>Gültig bis</Label>
                  <Input
                    type="date"
                    value={formData.gueltigBis}
                    onChange={(e) => updateData({ gueltigBis: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift des Vollmachtgebers</CardTitle>
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
                value={formData.unterschrift}
                onChange={(v) => updateData({ unterschrift: v })}
                label="Unterschrift des Vollmachtgebers"
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
