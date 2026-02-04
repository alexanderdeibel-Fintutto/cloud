import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Receipt, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateBetriebskostenvorauszahlungPDF } from '@/lib/pdf/betriebskostenvorauszahlung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  bisherigeBetriebskosten: number | null
  neueBetriebskosten: number | null
  aenderungAb: string
  begruendung: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  bisherigeBetriebskosten: null,
  neueBetriebskosten: null,
  aenderungAb: '',
  begruendung: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function BetriebskostenvorauszahlungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'betriebskostenvorauszahlung',
    generateTitle: (data) => `Betriebskostenvorauszahlung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Betriebskostenvorauszahlung'
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

  const differenz = formData.neueBetriebskosten && formData.bisherigeBetriebskosten
    ? formData.neueBetriebskosten - formData.bisherigeBetriebskosten
    : null

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateBetriebskostenvorauszahlungPDF({ ...formData, differenz })
      toast({ title: 'PDF erstellt', description: 'Das Anpassungsschreiben wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Receipt className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Betriebskostenvorauszahlung</h1>
              <p className="text-muted-foreground">Anpassung der Betriebskostenvorauszahlung</p>
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

          {/* Anpassung */}
          <Card>
            <CardHeader>
              <CardTitle>Anpassung der Vorauszahlung</CardTitle>
              <CardDescription>
                Gemäß § 560 Abs. 4 BGB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Bisherige Vorauszahlung (monatlich) *"
                  value={formData.bisherigeBetriebskosten}
                  onChange={(v) => updateData({ bisherigeBetriebskosten: v })}
                />
                <CurrencyField
                  label="Neue Vorauszahlung (monatlich) *"
                  value={formData.neueBetriebskosten}
                  onChange={(v) => updateData({ neueBetriebskosten: v })}
                />
              </div>

              {differenz !== null && (
                <div className={`p-4 rounded-lg border ${differenz >= 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="font-medium">
                    {differenz >= 0 ? 'Erhöhung' : 'Reduzierung'}: {Math.abs(differenz).toFixed(2)} € pro Monat
                  </p>
                </div>
              )}

              <div>
                <Label>Anpassung ab *</Label>
                <Input
                  type="date"
                  value={formData.aenderungAb}
                  onChange={(e) => updateData({ aenderungAb: e.target.value })}
                />
              </div>

              <div>
                <Label>Begründung</Label>
                <Textarea
                  value={formData.begruendung}
                  onChange={(e) => updateData({ begruendung: e.target.value })}
                  placeholder="z.B. Die letzte Betriebskostenabrechnung ergab eine erhebliche Nachzahlung..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Datum */}
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
