import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Hammer, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateReparaturanforderungPDF } from '@/lib/pdf/reparaturanforderung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  mieter: PersonData
  mieterAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  bereich: string
  dringlichkeit: string
  beschreibung: string
  festgestelltAm: string
  erreichbarkeit: string[]
  telefonErreichbar: string
  sonstigeHinweise: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  bereich: '',
  dringlichkeit: 'normal',
  beschreibung: '',
  festgestelltAm: new Date().toISOString().split('T')[0],
  erreichbarkeit: ['vormittags', 'nachmittags'],
  telefonErreichbar: '',
  sonstigeHinweise: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

const BEREICHE = [
  { value: 'sanitaer', label: 'Sanitär (Bad, WC, Waschbecken)' },
  { value: 'heizung', label: 'Heizung / Warmwasser' },
  { value: 'elektrik', label: 'Elektrik / Steckdosen / Licht' },
  { value: 'fenster', label: 'Fenster / Türen / Schlösser' },
  { value: 'wasser', label: 'Wasserschaden / Rohrbruch' },
  { value: 'wand', label: 'Wände / Decken / Böden' },
  { value: 'kueche', label: 'Küche / Einbaugeräte' },
  { value: 'balkon', label: 'Balkon / Terrasse' },
  { value: 'keller', label: 'Keller / Abstellräume' },
  { value: 'sonstige', label: 'Sonstiges' },
]

const DRINGLICHKEITEN = [
  { value: 'notfall', label: 'Notfall (sofortige Maßnahmen erforderlich)' },
  { value: 'dringend', label: 'Dringend (innerhalb weniger Tage)' },
  { value: 'normal', label: 'Normal (baldige Reparatur gewünscht)' },
  { value: 'gering', label: 'Gering (kann warten)' },
]

export default function ReparaturanforderungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'reparaturanforderung',
    generateTitle: (data) => `Reparaturanforderung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Reparaturanforderung'
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

  const toggleErreichbarkeit = (zeit: string) => {
    if (formData.erreichbarkeit.includes(zeit)) {
      updateData({ erreichbarkeit: formData.erreichbarkeit.filter(e => e !== zeit) })
    } else {
      updateData({ erreichbarkeit: [...formData.erreichbarkeit, zeit] })
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateReparaturanforderungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Reparaturanforderung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Hammer className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reparaturanforderung</h1>
              <p className="text-muted-foreground">Meldung eines Reparaturbedarfs an den Vermieter</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter (Absender)</CardTitle>
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

          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter / Hausverwaltung (Empfänger)</CardTitle>
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

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse"
                required
              />
            </CardContent>
          </Card>

          {/* Reparaturbedarf */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Reparaturbedarf
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bereich *</Label>
                  <Select
                    value={formData.bereich}
                    onValueChange={(v) => updateData({ bereich: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                    <SelectContent>
                      {BEREICHE.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dringlichkeit *</Label>
                  <Select
                    value={formData.dringlichkeit}
                    onValueChange={(v) => updateData({ dringlichkeit: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DRINGLICHKEITEN.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Festgestellt am</Label>
                <Input
                  type="date"
                  value={formData.festgestelltAm}
                  onChange={(e) => updateData({ festgestelltAm: e.target.value })}
                />
              </div>

              <div>
                <Label>Beschreibung des Problems *</Label>
                <Textarea
                  value={formData.beschreibung}
                  onChange={(e) => updateData({ beschreibung: e.target.value })}
                  placeholder="Bitte beschreiben Sie das Problem möglichst genau (Was, Wo, Seit wann, Auswirkungen...)"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Erreichbarkeit */}
          <Card>
            <CardHeader>
              <CardTitle>Erreichbarkeit für Handwerker</CardTitle>
              <CardDescription>
                Wann können Handwerker die Wohnung betreten?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'vormittags', label: 'Vormittags (8-12 Uhr)' },
                  { id: 'nachmittags', label: 'Nachmittags (12-17 Uhr)' },
                  { id: 'abends', label: 'Abends (17-20 Uhr)' },
                  { id: 'samstags', label: 'Samstags' },
                ].map(zeit => (
                  <div key={zeit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={zeit.id}
                      checked={formData.erreichbarkeit.includes(zeit.id)}
                      onCheckedChange={() => toggleErreichbarkeit(zeit.id)}
                    />
                    <Label htmlFor={zeit.id}>{zeit.label}</Label>
                  </div>
                ))}
              </div>

              <div>
                <Label>Telefon für Terminabsprache</Label>
                <Input
                  value={formData.telefonErreichbar}
                  onChange={(e) => updateData({ telefonErreichbar: e.target.value })}
                  placeholder="Ihre Telefonnummer"
                />
              </div>

              <div>
                <Label>Sonstige Hinweise (optional)</Label>
                <Textarea
                  value={formData.sonstigeHinweise}
                  onChange={(e) => updateData({ sonstigeHinweise: e.target.value })}
                  placeholder="z.B. Haustiere vorhanden, Schlüssel beim Nachbarn..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Erstellungsdatum */}
          <Card>
            <CardHeader>
              <CardTitle>Dokument</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Datum des Schreibens</Label>
                <Input
                  type="date"
                  value={formData.erstelltAm}
                  onChange={(e) => updateData({ erstelltAm: e.target.value })}
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
