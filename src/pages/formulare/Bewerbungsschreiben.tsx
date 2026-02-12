import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Send, Save, FileDown } from 'lucide-react'
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
import { generateBewerbungsschreibenPDF } from '@/lib/pdf/bewerbungsschreiben-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  bewerber: PersonData
  bewerberAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  beruf: string
  arbeitgeber: string
  monatlichesNettoeinkommen: number | null
  personenanzahl: string
  einzugstermin: string
  mietdauer: string
  motivation: string
  haustiere: string
  raucher: boolean
  musikinstrumente: boolean
  anlagen: string[]
  unterschriftBewerber: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  bewerber: { ...EMPTY_PERSON },
  bewerberAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  beruf: '',
  arbeitgeber: '',
  monatlichesNettoeinkommen: null,
  personenanzahl: '',
  einzugstermin: '',
  mietdauer: '',
  motivation: '',
  haustiere: '',
  raucher: false,
  musikinstrumente: false,
  anlagen: [],
  unterschriftBewerber: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const ANLAGEN_OPTIONEN = [
  { value: 'selbstauskunft', label: 'Mieterselbstauskunft' },
  { value: 'schufa', label: 'SCHUFA-Bonitätsauskunft' },
  { value: 'einkommensnachweis', label: 'Einkommensnachweise (letzte 3 Gehaltabrechnungen)' },
  { value: 'arbeitgeberbestaetigung', label: 'Arbeitgeberbescheinigung' },
  { value: 'mietschuldenfreiheit', label: 'Mietschuldenfreiheitsbescheinigung' },
  { value: 'personalausweis', label: 'Kopie Personalausweis' },
]

export default function BewerbungsschreibenPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'bewerbungsschreiben',
    generateTitle: (data) => `Bewerbung - ${data.bewerber?.vorname || ''} ${data.bewerber?.nachname || ''}`.trim() || 'Bewerbungsschreiben'
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

  const toggleAnlage = (value: string) => {
    const current = formData.anlagen
    if (current.includes(value)) {
      updateData({ anlagen: current.filter(v => v !== value) })
    } else {
      updateData({ anlagen: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateBewerbungsschreibenPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Das Bewerbungsschreiben wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Send className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bewerbungsschreiben</h1>
              <p className="text-muted-foreground">Professionelle Bewerbung für eine Mietwohnung</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bewerber */}
          <Card>
            <CardHeader>
              <CardTitle>Ihre Daten (Bewerber)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.bewerber}
                onChange={(v) => updateData({ bewerber: v })}
                label="Bewerber"
                required
              />
              <AddressField
                value={formData.bewerberAdresse}
                onChange={(v) => updateData({ bewerberAdresse: v })}
                label="Aktuelle Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter / Hausverwaltung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.vermieter}
                onChange={(v) => updateData({ vermieter: v })}
                label="Empfänger"
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

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Gewünschte Wohnung</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse der Wohnung"
                required
              />
            </CardContent>
          </Card>

          {/* Persönliche Angaben */}
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Angaben</CardTitle>
              <CardDescription>
                Informationen zu Ihrer beruflichen und finanziellen Situation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Beruf / Tätigkeit</Label>
                  <Input
                    value={formData.beruf}
                    onChange={(e) => updateData({ beruf: e.target.value })}
                    placeholder="z.B. Software-Entwickler"
                  />
                </div>
                <div>
                  <Label>Arbeitgeber</Label>
                  <Input
                    value={formData.arbeitgeber}
                    onChange={(e) => updateData({ arbeitgeber: e.target.value })}
                    placeholder="z.B. Musterfirma GmbH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Monatliches Nettoeinkommen"
                  value={formData.monatlichesNettoeinkommen}
                  onChange={(v) => updateData({ monatlichesNettoeinkommen: v })}
                />
                <div>
                  <Label>Anzahl Personen im Haushalt</Label>
                  <Input
                    value={formData.personenanzahl}
                    onChange={(e) => updateData({ personenanzahl: e.target.value })}
                    placeholder="z.B. 2 Erwachsene, 1 Kind"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gewünschter Einzugstermin</Label>
                  <Input
                    type="date"
                    value={formData.einzugstermin}
                    onChange={(e) => updateData({ einzugstermin: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Geplante Mietdauer</Label>
                  <Input
                    value={formData.mietdauer}
                    onChange={(e) => updateData({ mietdauer: e.target.value })}
                    placeholder="z.B. Langfristig / mind. 3 Jahre"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle>Motivation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Warum interessieren Sie sich für diese Wohnung?</Label>
                <Textarea
                  value={formData.motivation}
                  onChange={(e) => updateData({ motivation: e.target.value })}
                  placeholder="Beschreiben Sie kurz, warum diese Wohnung für Sie ideal wäre..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Haustiere</Label>
                  <Input
                    value={formData.haustiere}
                    onChange={(e) => updateData({ haustiere: e.target.value })}
                    placeholder="z.B. keine / 1 Katze"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="raucher"
                    checked={formData.raucher}
                    onCheckedChange={(c) => updateData({ raucher: !!c })}
                  />
                  <Label htmlFor="raucher">Raucher</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="musik"
                    checked={formData.musikinstrumente}
                    onCheckedChange={(c) => updateData({ musikinstrumente: !!c })}
                  />
                  <Label htmlFor="musik">Spiele Musikinstrument</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anlagen */}
          <Card>
            <CardHeader>
              <CardTitle>Beigefügte Unterlagen</CardTitle>
              <CardDescription>
                Wählen Sie die Unterlagen, die Sie beifügen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ANLAGEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={formData.anlagen.includes(option.value)}
                      onCheckedChange={() => toggleAnlage(option.value)}
                    />
                    <Label htmlFor={option.value} className="font-normal">{option.label}</Label>
                  </div>
                ))}
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
                value={formData.unterschriftBewerber}
                onChange={(v) => updateData({ unterschriftBewerber: v })}
                label="Unterschrift"
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
