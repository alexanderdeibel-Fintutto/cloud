import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { generateZahlungserinnerungPDF } from '@/lib/pdf/zahlungserinnerung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  faelligkeitsdatum: string
  offenerBetrag: number | null
  monat: string
  rechnungsnummer: string
  zahlungsziel: string
  bankverbindung: string
  zusaetzlicherHinweis: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  faelligkeitsdatum: '',
  offenerBetrag: null,
  monat: '',
  rechnungsnummer: '',
  zahlungsziel: '7',
  bankverbindung: '',
  zusaetzlicherHinweis: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function ZahlungserinnerungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateZahlungserinnerungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Zahlungserinnerung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Zahlungserinnerung</h1>
              <p className="text-muted-foreground">Freundliche Erinnerung an ausstehende Mietzahlung</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Absender)</CardTitle>
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
              <CardTitle>Mieter (Empfänger)</CardTitle>
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
            </CardContent>
          </Card>

          {/* Zahlungsdetails */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsdetails</CardTitle>
              <CardDescription>
                Details zur ausstehenden Zahlung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Betroffener Monat *</Label>
                  <Input
                    value={formData.monat}
                    onChange={(e) => updateData({ monat: e.target.value })}
                    placeholder="z.B. Januar 2025"
                  />
                </div>
                <div>
                  <Label>Fälligkeitsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.faelligkeitsdatum}
                    onChange={(e) => updateData({ faelligkeitsdatum: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Offener Betrag *"
                  value={formData.offenerBetrag}
                  onChange={(v) => updateData({ offenerBetrag: v })}
                />
                <div>
                  <Label>Rechnungsnummer (optional)</Label>
                  <Input
                    value={formData.rechnungsnummer}
                    onChange={(e) => updateData({ rechnungsnummer: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Zahlungsziel (Tage)</Label>
                <Input
                  value={formData.zahlungsziel}
                  onChange={(e) => updateData({ zahlungsziel: e.target.value })}
                  placeholder="7"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bankverbindung */}
          <Card>
            <CardHeader>
              <CardTitle>Bankverbindung</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.bankverbindung}
                onChange={(e) => updateData({ bankverbindung: e.target.value })}
                placeholder="IBAN: DE12 3456 7890 1234 5678 90&#10;BIC: ABCDEFGH&#10;Bank: Musterbank"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Zusätzlicher Hinweis */}
          <Card>
            <CardHeader>
              <CardTitle>Zusätzlicher Hinweis (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.zusaetzlicherHinweis}
                onChange={(e) => updateData({ zusaetzlicherHinweis: e.target.value })}
                placeholder="Optionale zusätzliche Bemerkungen..."
                rows={2}
              />

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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
