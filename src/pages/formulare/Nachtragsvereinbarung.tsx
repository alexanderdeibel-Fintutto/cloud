import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileEdit, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateNachtragsvereinbarungPDF } from '@/lib/pdf/nachtragsvereinbarung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface Aenderung {
  id: string
  bisherig: string
  neu: string
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  aenderungen: Aenderung[]
  gueltigAb: string
  sonstigeVereinbarungen: string
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  aenderungen: [{ id: '1', bisherig: '', neu: '' }],
  gueltigAb: '',
  sonstigeVereinbarungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function NachtragsvereinbarungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addAenderung = () => {
    const newId = Date.now().toString()
    updateData({ aenderungen: [...formData.aenderungen, { id: newId, bisherig: '', neu: '' }] })
  }

  const removeAenderung = (id: string) => {
    if (formData.aenderungen.length > 1) {
      updateData({ aenderungen: formData.aenderungen.filter(a => a.id !== id) })
    }
  }

  const updateAenderung = (id: string, field: keyof Aenderung, value: string) => {
    updateData({
      aenderungen: formData.aenderungen.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    })
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateNachtragsvereinbarungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Nachtragsvereinbarung wurde als PDF gespeichert.' })
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
              <FileEdit className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nachtragsvereinbarung</h1>
              <p className="text-muted-foreground">Änderung oder Ergänzung zum bestehenden Mietvertrag</p>
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
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse des Mietobjekts"
                required
              />
              <div>
                <Label>Ursprünglicher Mietvertrag vom *</Label>
                <Input
                  type="date"
                  value={formData.mietvertragVom}
                  onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Änderungen */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsänderungen</CardTitle>
              <CardDescription>
                Bisherige und neue Regelungen gegenüberstellen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.aenderungen.map((aenderung, index) => (
                <div key={aenderung.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Änderung {index + 1}</span>
                    {formData.aenderungen.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAenderung(aenderung.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Bisherige Regelung</Label>
                    <Textarea
                      value={aenderung.bisherig}
                      onChange={(e) => updateAenderung(aenderung.id, 'bisherig', e.target.value)}
                      placeholder="Beschreiben Sie die bisherige Vertragsregelung..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Neue Regelung</Label>
                    <Textarea
                      value={aenderung.neu}
                      onChange={(e) => updateAenderung(aenderung.id, 'neu', e.target.value)}
                      placeholder="Beschreiben Sie die neue Vertragsregelung..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addAenderung} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weitere Änderung hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Gültigkeit */}
          <Card>
            <CardHeader>
              <CardTitle>Gültigkeit & Sonstiges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Änderungen gelten ab *</Label>
                <Input
                  type="date"
                  value={formData.gueltigAb}
                  onChange={(e) => updateData({ gueltigAb: e.target.value })}
                />
              </div>
              <div>
                <Label>Sonstige Vereinbarungen</Label>
                <Textarea
                  value={formData.sonstigeVereinbarungen}
                  onChange={(e) => updateData({ sonstigeVereinbarungen: e.target.value })}
                  placeholder="Weitere Vereinbarungen im Rahmen dieser Änderung..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschriften</CardTitle>
              <CardDescription>
                Die Nachtragsvereinbarung bedarf der Unterschrift beider Parteien
              </CardDescription>
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
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
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
