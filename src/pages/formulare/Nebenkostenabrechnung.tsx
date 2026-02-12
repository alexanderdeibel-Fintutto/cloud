import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Receipt, Plus, Trash2, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateNebenkostenabrechnungPDF } from '@/lib/pdf/nebenkostenabrechnung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Kostenposition {
  id: string
  bezeichnung: string
  gesamtbetrag: number | null
  mieteranteil: number | null
  umlageschluessel: string
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  wohnungsNr: string
  abrechnungszeitraumVon: string
  abrechnungszeitraumBis: string
  wohnflaeche: string
  gesamtflaeche: string
  personenzahl: string
  gesamtpersonenzahl: string
  kostenpositionen: Kostenposition[]
  vorauszahlungen: number | null
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  wohnungsNr: '',
  abrechnungszeitraumVon: '',
  abrechnungszeitraumBis: '',
  wohnflaeche: '',
  gesamtflaeche: '',
  personenzahl: '',
  gesamtpersonenzahl: '',
  kostenpositionen: [
    { id: '1', bezeichnung: 'Grundsteuer', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
    { id: '2', bezeichnung: 'Wasser/Abwasser', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'personen' },
    { id: '3', bezeichnung: 'Heizkosten', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'verbrauch' },
    { id: '4', bezeichnung: 'Müllabfuhr', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'personen' },
    { id: '5', bezeichnung: 'Straßenreinigung', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
    { id: '6', bezeichnung: 'Gebäudeversicherung', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
    { id: '7', bezeichnung: 'Hausmeister', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
    { id: '8', bezeichnung: 'Allgemeinstrom', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
  ],
  vorauszahlungen: null,
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function NebenkostenabrechnungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'nebenkostenabrechnung',
    generateTitle: (data) => `Nebenkostenabrechnung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Nebenkostenabrechnung'
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

  const updateKostenposition = (id: string, updates: Partial<Kostenposition>) => {
    setFormData(prev => ({
      ...prev,
      kostenpositionen: prev.kostenpositionen.map(k =>
        k.id === id ? { ...k, ...updates } : k
      ),
    }))
  }

  const addKostenposition = () => {
    setFormData(prev => ({
      ...prev,
      kostenpositionen: [
        ...prev.kostenpositionen,
        { id: Date.now().toString(), bezeichnung: '', gesamtbetrag: null, mieteranteil: null, umlageschluessel: 'flaeche' },
      ],
    }))
  }

  const removeKostenposition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      kostenpositionen: prev.kostenpositionen.filter(k => k.id !== id),
    }))
  }

  const gesamtMieteranteil = formData.kostenpositionen.reduce(
    (sum, k) => sum + (k.mieteranteil || 0),
    0
  )

  const saldo = gesamtMieteranteil - (formData.vorauszahlungen || 0)

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateNebenkostenabrechnungPDF({
        ...formData,
        gesamtMieteranteil,
        saldo,
      })
      toast({ title: 'PDF erstellt', description: 'Die Nebenkostenabrechnung wurde als PDF gespeichert.' })
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
              <Receipt className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nebenkostenabrechnung</h1>
              <p className="text-muted-foreground">Jährliche Betriebskostenabrechnung gemäß § 556 BGB</p>
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
                  placeholder="z.B. EG links, Whg. 3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Abrechnungszeitraum */}
          <Card>
            <CardHeader>
              <CardTitle>Abrechnungszeitraum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Von *</Label>
                  <Input
                    type="date"
                    value={formData.abrechnungszeitraumVon}
                    onChange={(e) => updateData({ abrechnungszeitraumVon: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bis *</Label>
                  <Input
                    type="date"
                    value={formData.abrechnungszeitraumBis}
                    onChange={(e) => updateData({ abrechnungszeitraumBis: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Umlageschlüssel-Daten */}
          <Card>
            <CardHeader>
              <CardTitle>Verteilerschlüssel</CardTitle>
              <CardDescription>
                Angaben zur Berechnung des Mieteranteils
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Wohnfläche Mieter (m²) *</Label>
                  <Input
                    value={formData.wohnflaeche}
                    onChange={(e) => updateData({ wohnflaeche: e.target.value })}
                    placeholder="z.B. 75"
                  />
                </div>
                <div>
                  <Label>Gesamtfläche Gebäude (m²) *</Label>
                  <Input
                    value={formData.gesamtflaeche}
                    onChange={(e) => updateData({ gesamtflaeche: e.target.value })}
                    placeholder="z.B. 450"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Personenzahl Mieter</Label>
                  <Input
                    value={formData.personenzahl}
                    onChange={(e) => updateData({ personenzahl: e.target.value })}
                    placeholder="z.B. 2"
                  />
                </div>
                <div>
                  <Label>Gesamtpersonenzahl im Haus</Label>
                  <Input
                    value={formData.gesamtpersonenzahl}
                    onChange={(e) => updateData({ gesamtpersonenzahl: e.target.value })}
                    placeholder="z.B. 12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kostenpositionen */}
          <Card>
            <CardHeader>
              <CardTitle>Kostenpositionen</CardTitle>
              <CardDescription>
                Betriebskosten gemäß Betriebskostenverordnung (BetrKV)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.kostenpositionen.map((position) => (
                <div key={position.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Input
                      value={position.bezeichnung}
                      onChange={(e) => updateKostenposition(position.id, { bezeichnung: e.target.value })}
                      placeholder="Kostenart"
                      className="font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKostenposition(position.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CurrencyField
                      label="Gesamtkosten"
                      value={position.gesamtbetrag}
                      onChange={(v) => updateKostenposition(position.id, { gesamtbetrag: v })}
                    />
                    <CurrencyField
                      label="Mieteranteil"
                      value={position.mieteranteil}
                      onChange={(v) => updateKostenposition(position.id, { mieteranteil: v })}
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addKostenposition} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weitere Kostenposition
              </Button>
            </CardContent>
          </Card>

          {/* Zusammenfassung */}
          <Card>
            <CardHeader>
              <CardTitle>Abrechnung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Summe Mieteranteil:</span>
                  <span className="font-medium">{gesamtMieteranteil.toFixed(2)} €</span>
                </div>
                <Separator />
                <div>
                  <CurrencyField
                    label="Geleistete Vorauszahlungen"
                    value={formData.vorauszahlungen}
                    onChange={(v) => updateData({ vorauszahlungen: v })}
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{saldo >= 0 ? 'Nachzahlung:' : 'Guthaben:'}</span>
                  <span className={saldo >= 0 ? 'text-red-600' : 'text-green-600'}>
                    {Math.abs(saldo).toFixed(2)} €
                  </span>
                </div>
              </div>

              <div>
                <Label>Erstellungsdatum</Label>
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
