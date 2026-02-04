import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wrench, Plus, Trash2, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateModernisierungsankuendigungPDF } from '@/lib/pdf/modernisierungsankuendigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Massnahme {
  id: string
  beschreibung: string
  dauer: string
  kosten: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  wohnungsNr: string
  massnahmen: Massnahme[]
  gruende: string[]
  sonstigerGrund: string
  geplanterBeginn: string
  voraussichtlicheDauer: string
  gesamtkosten: number | null
  mieterAnteil: number | null
  voraussichtlicheErhoehung: number | null
  haertefallHinweis: boolean
  ansprechpartner: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  wohnungsNr: '',
  massnahmen: [{ id: '1', beschreibung: '', dauer: '', kosten: null }],
  gruende: [],
  sonstigerGrund: '',
  geplanterBeginn: '',
  voraussichtlicheDauer: '',
  gesamtkosten: null,
  mieterAnteil: null,
  voraussichtlicheErhoehung: null,
  haertefallHinweis: true,
  ansprechpartner: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

const MODERNISIERUNGS_GRUENDE = [
  { id: 'energie', label: 'Energetische Modernisierung (z.B. Dämmung, Heizung)' },
  { id: 'wasser', label: 'Einsparung von Wasser' },
  { id: 'wohnwert', label: 'Nachhaltige Erhöhung des Gebrauchswerts' },
  { id: 'wohnverhaeltnisse', label: 'Verbesserung der allgemeinen Wohnverhältnisse' },
  { id: 'klimaschutz', label: 'Klimaschutzmaßnahmen' },
  { id: 'barrierefreiheit', label: 'Herstellung von Barrierefreiheit' },
]

export default function ModernisierungsankuendigungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'modernisierungsankuendigung',
    generateTitle: (data) => `Modernisierungsankündigung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Modernisierungsankündigung'
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

  const toggleGrund = (id: string) => {
    if (formData.gruende.includes(id)) {
      updateData({ gruende: formData.gruende.filter(g => g !== id) })
    } else {
      updateData({ gruende: [...formData.gruende, id] })
    }
  }

  const updateMassnahme = (id: string, updates: Partial<Massnahme>) => {
    setFormData(prev => ({
      ...prev,
      massnahmen: prev.massnahmen.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }))
  }

  const addMassnahme = () => {
    setFormData(prev => ({
      ...prev,
      massnahmen: [
        ...prev.massnahmen,
        { id: Date.now().toString(), beschreibung: '', dauer: '', kosten: null },
      ],
    }))
  }

  const removeMassnahme = (id: string) => {
    if (formData.massnahmen.length > 1) {
      setFormData(prev => ({
        ...prev,
        massnahmen: prev.massnahmen.filter(m => m.id !== id),
      }))
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateModernisierungsankuendigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Modernisierungsankündigung wurde als PDF gespeichert.' })
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
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Modernisierungsankündigung</h1>
              <p className="text-muted-foreground">Ankündigung gemäß § 555c BGB</p>
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
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Mietobjekt"
                required
              />
              <div>
                <Label>Wohnungsnummer</Label>
                <Input
                  value={formData.wohnungsNr}
                  onChange={(e) => updateData({ wohnungsNr: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Maßnahmen */}
          <Card>
            <CardHeader>
              <CardTitle>Geplante Maßnahmen</CardTitle>
              <CardDescription>
                Beschreibung der Modernisierungsmaßnahmen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.massnahmen.map((massnahme, idx) => (
                <div key={massnahme.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Maßnahme {idx + 1}</Label>
                    {formData.massnahmen.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMassnahme(massnahme.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={massnahme.beschreibung}
                    onChange={(e) => updateMassnahme(massnahme.id, { beschreibung: e.target.value })}
                    placeholder="Beschreibung der Maßnahme..."
                    rows={2}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Voraussichtliche Dauer</Label>
                      <Input
                        value={massnahme.dauer}
                        onChange={(e) => updateMassnahme(massnahme.id, { dauer: e.target.value })}
                        placeholder="z.B. 2 Wochen"
                      />
                    </div>
                    <CurrencyField
                      label="Geschätzte Kosten"
                      value={massnahme.kosten}
                      onChange={(v) => updateMassnahme(massnahme.id, { kosten: v })}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addMassnahme} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weitere Maßnahme hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Gründe */}
          <Card>
            <CardHeader>
              <CardTitle>Modernisierungsgründe</CardTitle>
              <CardDescription>
                Rechtliche Grundlage der Modernisierung (§ 555b BGB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MODERNISIERUNGS_GRUENDE.map(grund => (
                <div key={grund.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={grund.id}
                    checked={formData.gruende.includes(grund.id)}
                    onCheckedChange={() => toggleGrund(grund.id)}
                  />
                  <Label htmlFor={grund.id} className="leading-tight">{grund.label}</Label>
                </div>
              ))}

              <div>
                <Label>Sonstige Gründe</Label>
                <Textarea
                  value={formData.sonstigerGrund}
                  onChange={(e) => updateData({ sonstigerGrund: e.target.value })}
                  placeholder="Weitere Begründung..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Zeitplan */}
          <Card>
            <CardHeader>
              <CardTitle>Zeitplan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Geplanter Beginn *</Label>
                  <Input
                    type="date"
                    value={formData.geplanterBeginn}
                    onChange={(e) => updateData({ geplanterBeginn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Voraussichtliche Gesamtdauer</Label>
                  <Input
                    value={formData.voraussichtlicheDauer}
                    onChange={(e) => updateData({ voraussichtlicheDauer: e.target.value })}
                    placeholder="z.B. 3 Monate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kosten */}
          <Card>
            <CardHeader>
              <CardTitle>Kosten und Mieterhöhung</CardTitle>
              <CardDescription>
                Informationen zur voraussichtlichen Mieterhöhung gemäß § 559 BGB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Gesamtkosten"
                  value={formData.gesamtkosten}
                  onChange={(v) => updateData({ gesamtkosten: v })}
                />
                <CurrencyField
                  label="Anteil dieser Wohnung"
                  value={formData.mieterAnteil}
                  onChange={(v) => updateData({ mieterAnteil: v })}
                />
                <CurrencyField
                  label="Voraussichtliche monatliche Erhöhung"
                  value={formData.voraussichtlicheErhoehung}
                  onChange={(v) => updateData({ voraussichtlicheErhoehung: v })}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="haertefall"
                  checked={formData.haertefallHinweis}
                  onCheckedChange={(c) => updateData({ haertefallHinweis: c === true })}
                />
                <Label htmlFor="haertefall" className="leading-tight">
                  Härtefallhinweis gemäß § 555d BGB aufnehmen (Mieter kann bis Monatsende nach Zugang Einwände erheben)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Ansprechpartner */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ansprechpartner für Rückfragen</Label>
                <Textarea
                  value={formData.ansprechpartner}
                  onChange={(e) => updateData({ ansprechpartner: e.target.value })}
                  placeholder="Name, Telefon, E-Mail..."
                  rows={2}
                />
              </div>
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
