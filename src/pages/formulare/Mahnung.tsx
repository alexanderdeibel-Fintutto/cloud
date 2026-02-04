import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Plus, Trash2, Euro, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { formatCurrency } from '@/lib/utils'
import { generateMahnungPDF } from '@/lib/pdf/mahnung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface Rueckstand {
  id: string
  zeitraum: string
  art: 'miete' | 'nebenkosten' | 'sonstige'
  betrag: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mahnungsstufe: 1 | 2 | 3
  rueckstaende: Rueckstand[]
  mahngebuehr: number | null
  verzugszinsen: number | null
  zahlungsfrist: string
  androhungKuendigung: boolean
  androhungInkasso: boolean
  bankinhaber: string
  iban: string
  verwendungszweck: string
  unterschriftVermieter: SignatureData
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mahnungsstufe: 1,
  rueckstaende: [{ id: '1', zeitraum: '', art: 'miete', betrag: null }],
  mahngebuehr: null,
  verzugszinsen: null,
  zahlungsfrist: '',
  androhungKuendigung: false,
  androhungInkasso: false,
  bankinhaber: '',
  iban: '',
  verwendungszweck: '',
  unterschriftVermieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function MahnungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mahnung',
    generateTitle: (data) => `Mahnung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mahnung'
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

  const addRueckstand = () => {
    updateData({
      rueckstaende: [
        ...formData.rueckstaende,
        { id: Date.now().toString(), zeitraum: '', art: 'miete', betrag: null }
      ]
    })
  }

  const removeRueckstand = (id: string) => {
    updateData({
      rueckstaende: formData.rueckstaende.filter(r => r.id !== id)
    })
  }

  const updateRueckstand = (id: string, updates: Partial<Rueckstand>) => {
    updateData({
      rueckstaende: formData.rueckstaende.map(r =>
        r.id === id ? { ...r, ...updates } : r
      )
    })
  }

  const gesamtforderung = React.useMemo(() => {
    const summe = formData.rueckstaende.reduce((sum, r) => sum + (r.betrag || 0), 0)
    return summe + (formData.mahngebuehr || 0) + (formData.verzugszinsen || 0)
  }, [formData.rueckstaende, formData.mahngebuehr, formData.verzugszinsen])

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMahnungPDF({ ...formData, gesamtforderung })
      toast({ title: 'PDF erstellt', description: 'Die Mahnung wurde als PDF gespeichert.' })
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
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mahnung</h1>
              <p className="text-muted-foreground">Zahlungserinnerung bei Mietrückständen</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mahnungsstufe */}
          <Card>
            <CardHeader>
              <CardTitle>Mahnungsstufe</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={String(formData.mahnungsstufe)}
                onValueChange={(v) => updateData({ mahnungsstufe: Number(v) as 1 | 2 | 3 })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1. Mahnung (Zahlungserinnerung)</SelectItem>
                  <SelectItem value="2">2. Mahnung</SelectItem>
                  <SelectItem value="3">3. Mahnung (Letzte Mahnung vor Kündigung)</SelectItem>
                </SelectContent>
              </Select>
              {formData.mahnungsstufe >= 2 && (
                <Alert variant="warning" className="mt-4">
                  <AlertDescription>
                    {formData.mahnungsstufe === 2
                      ? 'Bei der 2. Mahnung empfiehlt es sich, auf mögliche Konsequenzen hinzuweisen.'
                      : 'Die 3. Mahnung ist in der Regel die letzte Mahnung vor rechtlichen Schritten.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

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
                value={formData.mieterAdresse}
                onChange={(v) => updateData({ mieterAdresse: v })}
                label="Anschrift"
                required
              />
              <Separator />
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Mietobjekt"
                required
              />
            </CardContent>
          </Card>

          {/* Rückstände */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Offene Forderungen
              </CardTitle>
              <CardDescription>
                Listen Sie alle offenen Beträge auf
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.rueckstaende.map((rueckstand) => (
                <div key={rueckstand.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label>Zeitraum</Label>
                    <Input
                      value={rueckstand.zeitraum}
                      onChange={(e) => updateRueckstand(rueckstand.id, { zeitraum: e.target.value })}
                      placeholder="z.B. Januar 2024"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Art</Label>
                    <Select
                      value={rueckstand.art}
                      onValueChange={(v: 'miete' | 'nebenkosten' | 'sonstige') =>
                        updateRueckstand(rueckstand.id, { art: v })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="miete">Miete</SelectItem>
                        <SelectItem value="nebenkosten">Nebenkosten</SelectItem>
                        <SelectItem value="sonstige">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <CurrencyField
                      label="Betrag"
                      value={rueckstand.betrag}
                      onChange={(v) => updateRueckstand(rueckstand.id, { betrag: v })}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRueckstand(rueckstand.id)}
                      disabled={formData.rueckstaende.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addRueckstand} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weitere Position hinzufügen
              </Button>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Mahngebühr"
                  value={formData.mahngebuehr}
                  onChange={(v) => updateData({ mahngebuehr: v })}
                />
                <CurrencyField
                  label="Verzugszinsen"
                  value={formData.verzugszinsen}
                  onChange={(v) => updateData({ verzugszinsen: v })}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gesamtforderung:</span>
                  <span className="text-xl font-bold">{formatCurrency(gesamtforderung)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zahlungsziel */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsziel und Konsequenzen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Zahlungsfrist *</Label>
                <Input
                  type="date"
                  value={formData.zahlungsfrist}
                  onChange={(e) => updateData({ zahlungsfrist: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kuendigung"
                    checked={formData.androhungKuendigung}
                    onCheckedChange={(c) => updateData({ androhungKuendigung: !!c })}
                  />
                  <Label htmlFor="kuendigung">Androhung der fristlosen Kündigung</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inkasso"
                    checked={formData.androhungInkasso}
                    onCheckedChange={(c) => updateData({ androhungInkasso: !!c })}
                  />
                  <Label htmlFor="inkasso">Androhung von Inkasso / gerichtlichen Schritten</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bankverbindung */}
          <Card>
            <CardHeader>
              <CardTitle>Bankverbindung für Zahlung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kontoinhaber</Label>
                <Input
                  value={formData.bankinhaber}
                  onChange={(e) => updateData({ bankinhaber: e.target.value })}
                />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input
                  value={formData.iban}
                  onChange={(e) => updateData({ iban: e.target.value })}
                  placeholder="DE00 0000 0000 0000 0000 00"
                />
              </div>
              <div>
                <Label>Verwendungszweck</Label>
                <Input
                  value={formData.verwendungszweck}
                  onChange={(e) => updateData({ verwendungszweck: e.target.value })}
                  placeholder="z.B. Miete Januar 2024, Mustermann"
                />
              </div>
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Unterschrift</CardTitle>
            </CardHeader>
            <CardContent>
              <SignatureField
                value={formData.unterschriftVermieter}
                onChange={(v) => updateData({ unterschriftVermieter: v })}
                label="Unterschrift Vermieter"
                required
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
