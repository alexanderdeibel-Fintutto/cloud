import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Plus, X, Save, FileDown } from 'lucide-react'
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
import { generateMietrueckstandPDF } from '@/lib/pdf/mietrueckstand-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Rueckstand {
  id: string
  monat: string
  betrag: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  rueckstaende: Rueckstand[]
  gesamtrueckstand: number
  zahlungsfrist: string
  mahnungStufe: string
  bankverbindung: string
  kuendigungsandrohung: boolean
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  rueckstaende: [{ id: '1', monat: '', betrag: null }],
  gesamtrueckstand: 0,
  zahlungsfrist: '14',
  mahnungStufe: '1',
  bankverbindung: '',
  kuendigungsandrohung: false,
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function MietrueckstandPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mietrueckstand',
    generateTitle: (data) => `Mietrückstand - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mietrückstand'
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

  // Gesamtrückstand berechnen
  React.useEffect(() => {
    const gesamt = formData.rueckstaende.reduce((sum, r) => sum + (r.betrag || 0), 0)
    updateData({ gesamtrueckstand: gesamt })
  }, [formData.rueckstaende])

  const addRueckstand = () => {
    const newId = Date.now().toString()
    updateData({ rueckstaende: [...formData.rueckstaende, { id: newId, monat: '', betrag: null }] })
  }

  const removeRueckstand = (id: string) => {
    if (formData.rueckstaende.length > 1) {
      updateData({ rueckstaende: formData.rueckstaende.filter(r => r.id !== id) })
    }
  }

  const updateRueckstand = (id: string, field: keyof Rueckstand, value: string | number | null) => {
    updateData({
      rueckstaende: formData.rueckstaende.map(r =>
        r.id === id ? { ...r, [field]: value } : r
      )
    })
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietrueckstandPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Das Mietrückstandsschreiben wurde als PDF gespeichert.' })
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
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mietrückstand</h1>
              <p className="text-muted-foreground">Mahnung und Zahlungsaufforderung bei Mietrückständen</p>
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
            </CardContent>
          </Card>

          {/* Rückstände */}
          <Card>
            <CardHeader>
              <CardTitle>Ausstehende Mietzahlungen</CardTitle>
              <CardDescription>
                Erfassen Sie alle offenen Mietzahlungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.rueckstaende.map((rueckstand, index) => (
                <div key={rueckstand.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Monat {index + 1}</Label>
                    <Input
                      type="month"
                      value={rueckstand.monat}
                      onChange={(e) => updateRueckstand(rueckstand.id, 'monat', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <CurrencyField
                      label="Betrag"
                      value={rueckstand.betrag}
                      onChange={(v) => updateRueckstand(rueckstand.id, 'betrag', v)}
                    />
                  </div>
                  {formData.rueckstaende.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRueckstand(rueckstand.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addRueckstand} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weiteren Monat hinzufügen
              </Button>

              {formData.gesamtrueckstand > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-bold text-red-700">
                    Gesamtrückstand: {formData.gesamtrueckstand.toFixed(2)} €
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mahnung */}
          <Card>
            <CardHeader>
              <CardTitle>Mahnungsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mahnungsstufe *</Label>
                  <Select
                    value={formData.mahnungStufe}
                    onValueChange={(v) => updateData({ mahnungStufe: v, kuendigungsandrohung: v === '3' })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. Mahnung (freundliche Erinnerung)</SelectItem>
                      <SelectItem value="2">2. Mahnung (nachdrücklich)</SelectItem>
                      <SelectItem value="3">3. Mahnung (mit Kündigungsandrohung)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zahlungsfrist (Tage)</Label>
                  <Select
                    value={formData.zahlungsfrist}
                    onValueChange={(v) => updateData({ zahlungsfrist: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Tage</SelectItem>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="21">21 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Bankverbindung für die Zahlung</Label>
                <Textarea
                  value={formData.bankverbindung}
                  onChange={(e) => updateData({ bankverbindung: e.target.value })}
                  placeholder="IBAN: DE12 3456 7890 1234 5678 90&#10;BIC: GENODEF1XXX&#10;Kontoinhaber: Max Mustermann"
                  rows={3}
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
