import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Plus, Trash2, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { generateStaffelmietvertragPDF } from '@/lib/pdf/staffelmietvertrag-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface Staffelung {
  id: string
  abDatum: string
  kaltmiete: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  wohnflaeche: string
  zimmer: string
  mietbeginn: string
  anfangsmiete: number | null
  staffelungen: Staffelung[]
  nebenkosten: number | null
  nebenkostenArt: 'pauschale' | 'vorauszahlung'
  kaution: number | null
  vertragslaufzeit: 'unbefristet' | 'befristet'
  befristetBis: string
  unterschriftVermieter: SignatureData
  unterschriftMieter: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  wohnflaeche: '',
  zimmer: '',
  mietbeginn: '',
  anfangsmiete: null,
  staffelungen: [
    { id: '1', abDatum: '', kaltmiete: null },
  ],
  nebenkosten: null,
  nebenkostenArt: 'vorauszahlung',
  kaution: null,
  vertragslaufzeit: 'unbefristet',
  befristetBis: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function StaffelmietvertragPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'staffelmietvertrag',
    generateTitle: (data) => `Staffelmietvertrag - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Staffelmietvertrag'
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

  const handleSubmit = () => {
    handleSave(formData)
  }

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addStaffelung = () => {
    updateData({
      staffelungen: [
        ...formData.staffelungen,
        { id: Date.now().toString(), abDatum: '', kaltmiete: null }
      ]
    })
  }

  const removeStaffelung = (id: string) => {
    updateData({
      staffelungen: formData.staffelungen.filter(s => s.id !== id)
    })
  }

  const updateStaffelung = (id: string, updates: Partial<Staffelung>) => {
    updateData({
      staffelungen: formData.staffelungen.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    })
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateStaffelmietvertragPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Der Staffelmietvertrag wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Staffelmietvertrag</h1>
              <p className="text-muted-foreground">Mietvertrag mit vereinbarten Mieterhöhungen</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <strong>§ 557a BGB:</strong> Die Mietstaffelungen müssen für mindestens ein Jahr unverändert
            bleiben. Die Erhöhungen müssen als Geldbetrag (nicht als Prozentsatz) ausgewiesen werden.
            Während der Staffelmietzeit ist keine Mieterhöhung nach § 558 BGB möglich.
          </AlertDescription>
        </Alert>

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
                value={formData.mieterAdresse}
                onChange={(v) => updateData({ mieterAdresse: v })}
                label="Bisherige Anschrift"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Wohnfläche (m²) *</Label>
                  <Input
                    type="number"
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                    placeholder="z.B. 75"
                  />
                </div>
                <div>
                  <Label>Zimmer</Label>
                  <Input
                    value={formData.zimmer}
                    onChange={(e) => updateData({ zimmer: e.target.value })}
                    placeholder="z.B. 3"
                  />
                </div>
                <div>
                  <Label>Mietbeginn *</Label>
                  <Input
                    type="date"
                    value={formData.mietbeginn}
                    onChange={(e) => updateData({ mietbeginn: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staffelmiete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Staffelmiete
              </CardTitle>
              <CardDescription>
                Legen Sie die Anfangsmiete und die Mietstaffelungen fest.
                Jede Staffelung muss mindestens ein Jahr andauern.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyField
                label="Anfangsmiete (Kaltmiete) *"
                value={formData.anfangsmiete}
                onChange={(v) => updateData({ anfangsmiete: v })}
              />

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-semibold">Mietstaffelungen</Label>
                {formData.staffelungen.map((staffelung, idx) => (
                  <div key={staffelung.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-1 flex items-center justify-center pb-2">
                      <span className="text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                    </div>
                    <div className="col-span-5">
                      <Label>Ab Datum</Label>
                      <Input
                        type="date"
                        value={staffelung.abDatum}
                        onChange={(e) => updateStaffelung(staffelung.id, { abDatum: e.target.value })}
                      />
                    </div>
                    <div className="col-span-5">
                      <CurrencyField
                        label="Neue Kaltmiete"
                        value={staffelung.kaltmiete}
                        onChange={(v) => updateStaffelung(staffelung.id, { kaltmiete: v })}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStaffelung(staffelung.id)}
                        disabled={formData.staffelungen.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addStaffelung} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Weitere Staffelung hinzufügen
                </Button>
              </div>

              {formData.anfangsmiete && formData.staffelungen.length > 0 && (
                <div className="p-4 bg-muted rounded-lg mt-4">
                  <h4 className="font-medium mb-2">Übersicht der Mietentwicklung:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Anfangsmiete (ab {formData.mietbeginn || 'Mietbeginn'}):</span>
                      <span className="font-medium">{formatCurrency(formData.anfangsmiete)}</span>
                    </div>
                    {formData.staffelungen.map((s, idx) => s.kaltmiete && (
                      <div key={s.id} className="flex justify-between">
                        <span>{idx + 1}. Staffelung (ab {s.abDatum || '...'}):</span>
                        <span className="font-medium">{formatCurrency(s.kaltmiete)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nebenkosten & Kaution */}
          <Card>
            <CardHeader>
              <CardTitle>Nebenkosten und Kaution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Nebenkosten monatlich *"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
                <CurrencyField
                  label="Kaution *"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Vertragsabschluss</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignatureField
                  value={formData.unterschriftVermieter}
                  onChange={(v) => updateData({ unterschriftVermieter: v })}
                  label="Unterschrift Vermieter"
                  required
                />
                <SignatureField
                  value={formData.unterschriftMieter}
                  onChange={(v) => updateData({ unterschriftMieter: v })}
                  label="Unterschrift Mieter"
                  required
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
