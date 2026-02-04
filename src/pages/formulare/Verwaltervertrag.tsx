import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, Save, FileDown } from 'lucide-react'
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
import { generateVerwaltervertragPDF } from '@/lib/pdf/verwaltervertrag-pdf'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface VerwalterData extends PersonData {
  firma?: string
}

interface FormData {
  eigentuemer: PersonData
  eigentuemerAdresse: AddressData
  verwalter: VerwalterData
  verwalterAdresse: AddressData
  objektAdresse: AddressData
  vertragsbeginn: string
  vertragsende: string
  unbefristet: boolean
  verguetung: number | null
  zahlungsrhythmus: string
  aufgaben: string[]
  sonderaufgaben: string
  vollmacht: string[]
  kuendigungsfrist: string
  unterschriftEigentuemer: SignatureData
  unterschriftVerwalter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  eigentuemer: { ...EMPTY_PERSON },
  eigentuemerAdresse: { ...EMPTY_ADDRESS },
  verwalter: { ...EMPTY_PERSON, firma: '' },
  verwalterAdresse: { ...EMPTY_ADDRESS },
  objektAdresse: { ...EMPTY_ADDRESS },
  vertragsbeginn: '',
  vertragsende: '',
  unbefristet: true,
  verguetung: null,
  zahlungsrhythmus: 'monatlich',
  aufgaben: [],
  sonderaufgaben: '',
  vollmacht: [],
  kuendigungsfrist: '3',
  unterschriftEigentuemer: { ...EMPTY_SIGNATURE },
  unterschriftVerwalter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const AUFGABEN_OPTIONEN = [
  { value: 'mieterverwaltung', label: 'Mieterverwaltung und Kommunikation' },
  { value: 'mietinkasso', label: 'Mietinkasso und Mahnwesen' },
  { value: 'nebenkostenabrechnung', label: 'Erstellung der Nebenkostenabrechnung' },
  { value: 'instandhaltung', label: 'Organisation von Instandhaltungsmaßnahmen' },
  { value: 'handwerker', label: 'Beauftragung und Koordination von Handwerkern' },
  { value: 'neuvermietung', label: 'Neuvermietung bei Leerstand' },
  { value: 'buchhaltung', label: 'Buchführung und Abrechnung' },
  { value: 'begehungen', label: 'Regelmäßige Objektbegehungen' },
  { value: 'versicherungen', label: 'Verwaltung von Versicherungsangelegenheiten' },
]

const VOLLMACHT_OPTIONEN = [
  { value: 'vertragsabschluss', label: 'Abschluss von Mietverträgen' },
  { value: 'kuendigung', label: 'Kündigungen aussprechen' },
  { value: 'handwerkerbeauftragung', label: 'Beauftragung von Handwerkern bis zu einer Summe' },
  { value: 'zahlungen', label: 'Zahlungen im Namen des Eigentümers leisten' },
  { value: 'gerichtliche_vertretung', label: 'Gerichtliche Vertretung in Mietangelegenheiten' },
]

export default function VerwaltervertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'verwaltervertrag',
    generateTitle: (data) => `Verwaltervertrag - ${data.verwalter?.firma || data.verwalter?.nachname || 'Verwalter'}`
  })

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

  const toggleAufgabe = (value: string) => {
    const current = formData.aufgaben
    if (current.includes(value)) {
      updateData({ aufgaben: current.filter(v => v !== value) })
    } else {
      updateData({ aufgaben: [...current, value] })
    }
  }

  const toggleVollmacht = (value: string) => {
    const current = formData.vollmacht
    if (current.includes(value)) {
      updateData({ vollmacht: current.filter(v => v !== value) })
    } else {
      updateData({ vollmacht: [...current, value] })
    }
  }

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateVerwaltervertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Verwaltervertrag wurde als PDF heruntergeladen.' })
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Verwaltervertrag</h1>
              <p className="text-muted-foreground">Hausverwaltungsvertrag zwischen Eigentümer und Verwalter</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Eigentümer */}
          <Card>
            <CardHeader>
              <CardTitle>Eigentümer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.eigentuemer}
                onChange={(v) => updateData({ eigentuemer: v })}
                label="Eigentümer"
                required
              />
              <AddressField
                value={formData.eigentuemerAdresse}
                onChange={(v) => updateData({ eigentuemerAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Verwalter */}
          <Card>
            <CardHeader>
              <CardTitle>Verwalter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Firma (falls zutreffend)</Label>
                <Input
                  value={formData.verwalter.firma || ''}
                  onChange={(e) => updateData({ verwalter: { ...formData.verwalter, firma: e.target.value } })}
                  placeholder="z.B. Mustermann Hausverwaltung GmbH"
                />
              </div>
              <PersonField
                value={formData.verwalter}
                onChange={(v) => updateData({ verwalter: { ...v, firma: formData.verwalter.firma } })}
                label="Ansprechpartner"
                required
              />
              <AddressField
                value={formData.verwalterAdresse}
                onChange={(v) => updateData({ verwalterAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Objekt */}
          <Card>
            <CardHeader>
              <CardTitle>Zu verwaltendes Objekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Adresse des Objekts"
                required
              />
            </CardContent>
          </Card>

          {/* Vertragsdauer */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsdauer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Vertragsbeginn *</Label>
                <Input
                  type="date"
                  value={formData.vertragsbeginn}
                  onChange={(e) => updateData({ vertragsbeginn: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unbefristet"
                  checked={formData.unbefristet}
                  onCheckedChange={(c) => updateData({ unbefristet: !!c })}
                />
                <Label htmlFor="unbefristet">Unbefristeter Vertrag</Label>
              </div>

              {!formData.unbefristet && (
                <div>
                  <Label>Vertragsende</Label>
                  <Input
                    type="date"
                    value={formData.vertragsende}
                    onChange={(e) => updateData({ vertragsende: e.target.value })}
                  />
                </div>
              )}

              <div>
                <Label>Kündigungsfrist (Monate)</Label>
                <Input
                  value={formData.kuendigungsfrist}
                  onChange={(e) => updateData({ kuendigungsfrist: e.target.value })}
                  placeholder="z.B. 3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aufgaben */}
          <Card>
            <CardHeader>
              <CardTitle>Aufgaben des Verwalters</CardTitle>
              <CardDescription>
                Wählen Sie die Aufgaben, die der Verwalter übernehmen soll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {AUFGABEN_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`aufgabe-${option.value}`}
                      checked={formData.aufgaben.includes(option.value)}
                      onCheckedChange={() => toggleAufgabe(option.value)}
                    />
                    <Label htmlFor={`aufgabe-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
              <div>
                <Label>Sonderaufgaben</Label>
                <Textarea
                  value={formData.sonderaufgaben}
                  onChange={(e) => updateData({ sonderaufgaben: e.target.value })}
                  placeholder="Weitere vereinbarte Aufgaben..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vollmachten */}
          <Card>
            <CardHeader>
              <CardTitle>Vollmachten</CardTitle>
              <CardDescription>
                Der Verwalter wird bevollmächtigt zu:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {VOLLMACHT_OPTIONEN.map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vollmacht-${option.value}`}
                      checked={formData.vollmacht.includes(option.value)}
                      onCheckedChange={() => toggleVollmacht(option.value)}
                    />
                    <Label htmlFor={`vollmacht-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vergütung */}
          <Card>
            <CardHeader>
              <CardTitle>Vergütung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Vergütung"
                  value={formData.verguetung}
                  onChange={(v) => updateData({ verguetung: v })}
                />
                <div>
                  <Label>Zahlungsrhythmus</Label>
                  <Input
                    value={formData.zahlungsrhythmus}
                    onChange={(e) => updateData({ zahlungsrhythmus: e.target.value })}
                    placeholder="z.B. monatlich, jährlich"
                  />
                </div>
              </div>
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
                  value={formData.unterschriftEigentuemer}
                  onChange={(v) => updateData({ unterschriftEigentuemer: v })}
                  label="Unterschrift Eigentümer"
                />
                <SignatureField
                  value={formData.unterschriftVerwalter}
                  onChange={(v) => updateData({ unterschriftVerwalter: v })}
                  label="Unterschrift Verwalter"
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
