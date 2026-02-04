import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileX2, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { generateWiderspruchBetriebskostenPDF } from '@/lib/pdf/widerspruch-betriebskosten-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Einwand {
  id: string
  kostenposition: string
  beanstandung: string
  betrag: number | null
}

interface FormData {
  mieter: PersonData
  mieterAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  abrechnungszeitraum: string
  abrechnungsdatum: string
  einwaende: Einwand[]
  allgemeineBegruendung: string
  forderung: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  abrechnungszeitraum: '',
  abrechnungsdatum: '',
  einwaende: [{ id: '1', kostenposition: '', beanstandung: '', betrag: null }],
  allgemeineBegruendung: '',
  forderung: 'korrektur',
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function WiderspruchBetriebskostenPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addEinwand = () => {
    setFormData(prev => ({
      ...prev,
      einwaende: [...prev.einwaende, { id: Date.now().toString(), kostenposition: '', beanstandung: '', betrag: null }],
    }))
  }

  const updateEinwand = (id: string, updates: Partial<Einwand>) => {
    setFormData(prev => ({
      ...prev,
      einwaende: prev.einwaende.map(e => e.id === id ? { ...e, ...updates } : e),
    }))
  }

  const removeEinwand = (id: string) => {
    if (formData.einwaende.length > 1) {
      setFormData(prev => ({
        ...prev,
        einwaende: prev.einwaende.filter(e => e.id !== id),
      }))
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateWiderspruchBetriebskostenPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Widerspruch wurde als PDF gespeichert.' })
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
              <FileX2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Widerspruch Betriebskostenabrechnung</h1>
              <p className="text-muted-foreground">Einwendungen gemäß § 556 Abs. 3 BGB</p>
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
                label="Anschrift"
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

          {/* Mietobjekt & Abrechnung */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt & Abrechnung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Mietobjekt"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Abrechnungszeitraum *</Label>
                  <Input
                    value={formData.abrechnungszeitraum}
                    onChange={(e) => updateData({ abrechnungszeitraum: e.target.value })}
                    placeholder="z.B. 01.01.2024 - 31.12.2024"
                  />
                </div>
                <div>
                  <Label>Abrechnungsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.abrechnungsdatum}
                    onChange={(e) => updateData({ abrechnungsdatum: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Einwände */}
          <Card>
            <CardHeader>
              <CardTitle>Einwände gegen die Abrechnung</CardTitle>
              <CardDescription>
                Detaillierte Auflistung der beanstandeten Positionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.einwaende.map((einwand, idx) => (
                <div key={einwand.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Einwand {idx + 1}</Label>
                    {formData.einwaende.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeEinwand(einwand.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Kostenposition</Label>
                      <Input
                        value={einwand.kostenposition}
                        onChange={(e) => updateEinwand(einwand.id, { kostenposition: e.target.value })}
                        placeholder="z.B. Heizkosten, Hauswart"
                      />
                    </div>
                    <CurrencyField
                      label="Strittiger Betrag"
                      value={einwand.betrag}
                      onChange={(v) => updateEinwand(einwand.id, { betrag: v })}
                    />
                  </div>
                  <div>
                    <Label>Beanstandung / Begründung</Label>
                    <Textarea
                      value={einwand.beanstandung}
                      onChange={(e) => updateEinwand(einwand.id, { beanstandung: e.target.value })}
                      placeholder="Warum wird diese Position beanstandet?"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addEinwand} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weiteren Einwand hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Allgemeine Begründung */}
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Begründung (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.allgemeineBegruendung}
                onChange={(e) => updateData({ allgemeineBegruendung: e.target.value })}
                placeholder="Zusätzliche allgemeine Anmerkungen oder Begründungen..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Erstellungsdatum */}
          <Card>
            <CardHeader>
              <CardTitle>Dokument</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Datum des Widerspruchs</Label>
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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
