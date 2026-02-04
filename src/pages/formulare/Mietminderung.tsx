import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, TrendingDown, Save, FileDown } from 'lucide-react'
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
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateMietminderungPDF } from '@/lib/pdf/mietminderung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  mieter: PersonData
  mieterAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mangelKategorie: string
  mangelBeschreibung: string
  mangelSeit: string
  maengelanzeigeDatum: string
  aktuelleMiete: number | null
  minderungsquote: string
  minderungsbetrag: number | null
  forderungAb: string
  fristsetzung: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mangelKategorie: '',
  mangelBeschreibung: '',
  mangelSeit: '',
  maengelanzeigeDatum: '',
  aktuelleMiete: null,
  minderungsquote: '10',
  minderungsbetrag: null,
  forderungAb: '',
  fristsetzung: '14',
  erstelltAm: new Date().toISOString().split('T')[0],
}

const MANGEL_KATEGORIEN = [
  { value: 'heizung', label: 'Heizungsausfall / unzureichende Heizung' },
  { value: 'feuchtigkeit', label: 'Feuchtigkeit / Schimmel' },
  { value: 'laerm', label: 'Lärmbelästigung' },
  { value: 'wasser', label: 'Wasserversorgung / Warmwasser' },
  { value: 'elektrik', label: 'Elektrische Anlagen' },
  { value: 'fenster', label: 'Fenster / Türen' },
  { value: 'sanitaer', label: 'Sanitäranlagen' },
  { value: 'ungeziefer', label: 'Ungeziefer / Schädlinge' },
  { value: 'sonstige', label: 'Sonstige Mängel' },
]

export default function MietminderungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mietminderung',
    generateTitle: (data) => `Mietminderung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mietminderung'
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

  // Berechne Minderungsbetrag
  React.useEffect(() => {
    if (formData.aktuelleMiete && formData.minderungsquote) {
      const quote = parseFloat(formData.minderungsquote) / 100
      const betrag = formData.aktuelleMiete * quote
      updateData({ minderungsbetrag: Math.round(betrag * 100) / 100 })
    }
  }, [formData.aktuelleMiete, formData.minderungsquote])

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietminderungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Mietminderungsanzeige wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietminderung</h1>
              <p className="text-muted-foreground">Anzeige einer Mietminderung wegen Mängeln gemäß § 536 BGB</p>
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
              <CardTitle>Vermieter (Empfänger)</CardTitle>
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
                label="Adresse des Mietobjekts"
                required
              />
            </CardContent>
          </Card>

          {/* Mangel */}
          <Card>
            <CardHeader>
              <CardTitle>Mangel</CardTitle>
              <CardDescription>
                Beschreibung des vorliegenden Mangels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mangelkategorie *</Label>
                <Select
                  value={formData.mangelKategorie}
                  onValueChange={(v) => updateData({ mangelKategorie: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                  <SelectContent>
                    {MANGEL_KATEGORIEN.map(k => (
                      <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Detaillierte Beschreibung des Mangels *</Label>
                <Textarea
                  value={formData.mangelBeschreibung}
                  onChange={(e) => updateData({ mangelBeschreibung: e.target.value })}
                  placeholder="Beschreiben Sie den Mangel so genau wie möglich..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mangel besteht seit *</Label>
                  <Input
                    type="date"
                    value={formData.mangelSeit}
                    onChange={(e) => updateData({ mangelSeit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mängelanzeige erfolgt am</Label>
                  <Input
                    type="date"
                    value={formData.maengelanzeigeDatum}
                    onChange={(e) => updateData({ maengelanzeigeDatum: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minderung */}
          <Card>
            <CardHeader>
              <CardTitle>Mietminderung</CardTitle>
              <CardDescription>
                Berechnung der Minderung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Aktuelle Bruttowarmmiete *"
                  value={formData.aktuelleMiete}
                  onChange={(v) => updateData({ aktuelleMiete: v })}
                />
                <div>
                  <Label>Minderungsquote (%) *</Label>
                  <Select
                    value={formData.minderungsquote}
                    onValueChange={(v) => updateData({ minderungsquote: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="100">100% (Unbewohnbarkeit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.minderungsbetrag && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-medium">Monatlicher Minderungsbetrag: {formData.minderungsbetrag.toFixed(2)} €</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minderung geltend ab *</Label>
                  <Input
                    type="date"
                    value={formData.forderungAb}
                    onChange={(e) => updateData({ forderungAb: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Frist zur Mängelbeseitigung (Tage)</Label>
                  <Select
                    value={formData.fristsetzung}
                    onValueChange={(v) => updateData({ fristsetzung: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Tage</SelectItem>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="21">21 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
