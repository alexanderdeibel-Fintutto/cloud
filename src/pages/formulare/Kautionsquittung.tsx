import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Receipt, Save, FileDown } from 'lucide-react'
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
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateKautionsquittungPDF } from '@/lib/pdf/kautionsquittung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  kautionsbetrag: number | null
  zahlungsart: string
  bankverbindung: string
  verwendungszweck: string
  bemerkungen: string
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
  kautionsbetrag: null,
  zahlungsart: '',
  bankverbindung: '',
  verwendungszweck: '',
  bemerkungen: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

const ZAHLUNGSARTEN = [
  { value: 'ueberweisung', label: 'Banküberweisung' },
  { value: 'bar', label: 'Barzahlung' },
  { value: 'scheck', label: 'Scheck' },
  { value: 'buergschaft', label: 'Bankbürgschaft / Kautionsversicherung' },
]

export default function KautionsquittungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'kautionsquittung',
    generateTitle: (data) => `Kautionsquittung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Kautionsquittung'
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
      await generateKautionsquittungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Kautionsquittung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-violet-100 rounded-lg">
              <Receipt className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kautionsquittung</h1>
              <p className="text-muted-foreground">Quittung über den Erhalt der Mietkaution</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Empfänger der Kaution)</CardTitle>
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
              <CardTitle>Mieter (Kautionszahler)</CardTitle>
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
                <Label>Mietvertrag vom</Label>
                <Input
                  type="date"
                  value={formData.mietvertragVom}
                  onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kaution */}
          <Card>
            <CardHeader>
              <CardTitle>Kautionszahlung</CardTitle>
              <CardDescription>
                Details zur erhaltenen Kaution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Kautionsbetrag *"
                  value={formData.kautionsbetrag}
                  onChange={(v) => updateData({ kautionsbetrag: v })}
                />
                <div>
                  <Label>Zahlungsart *</Label>
                  <Select
                    value={formData.zahlungsart}
                    onValueChange={(v) => updateData({ zahlungsart: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Zahlungsart wählen" /></SelectTrigger>
                    <SelectContent>
                      {ZAHLUNGSARTEN.map(z => (
                        <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.zahlungsart === 'ueberweisung' && (
                <div>
                  <Label>Bankverbindung (Kautionskonto)</Label>
                  <Textarea
                    value={formData.bankverbindung}
                    onChange={(e) => updateData({ bankverbindung: e.target.value })}
                    placeholder="IBAN, BIC, Kontoinhaber..."
                    rows={2}
                  />
                </div>
              )}

              <div>
                <Label>Verwendungszweck</Label>
                <Input
                  value={formData.verwendungszweck}
                  onChange={(e) => updateData({ verwendungszweck: e.target.value })}
                  placeholder="z.B. Mietkaution Musterstraße 1"
                />
              </div>

              <div>
                <Label>Bemerkungen</Label>
                <Textarea
                  value={formData.bemerkungen}
                  onChange={(e) => updateData({ bemerkungen: e.target.value })}
                  placeholder="Weitere Anmerkungen zur Kautionszahlung..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Quittierung</CardTitle>
              <CardDescription>
                Bestätigung des Erhalts durch den Vermieter
              </CardDescription>
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
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift Vermieter"
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
