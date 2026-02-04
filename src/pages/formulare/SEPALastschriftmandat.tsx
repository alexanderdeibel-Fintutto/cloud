import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, Building, User, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { IBANField } from '@/components/fields/IBANField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateSEPALastschriftmandatPDF } from '@/lib/pdf/sepa-lastschriftmandat-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  // Zahlungsempfänger (Vermieter)
  zahlungsempfaenger: PersonData
  zahlungsempfaengerAdresse: AddressData
  glaeubigerIdentifikationsnummer: string
  mandatsreferenz: string

  // Zahlungspflichtiger (Mieter)
  zahlungspflichtiger: PersonData
  zahlungspflichtigerAdresse: AddressData

  // Bankverbindung
  kontoinhaber: string
  iban: string
  bic: string
  kreditinstitut: string

  // Mandat
  mandatArt: 'wiederkehrend' | 'einmalig'
  zahlungsart: string
  betrag: number | null

  // Mietobjekt
  mietobjektAdresse: AddressData

  // Aussteller
  erstelltAm: string
  erstelltOrt: string

  unterschriftZahlungspflichtiger: SignatureData
}

const INITIAL_DATA: FormData = {
  zahlungsempfaenger: { ...EMPTY_PERSON },
  zahlungsempfaengerAdresse: { ...EMPTY_ADDRESS },
  glaeubigerIdentifikationsnummer: '',
  mandatsreferenz: '',
  zahlungspflichtiger: { ...EMPTY_PERSON },
  zahlungspflichtigerAdresse: { ...EMPTY_ADDRESS },
  kontoinhaber: '',
  iban: '',
  bic: '',
  kreditinstitut: '',
  mandatArt: 'wiederkehrend',
  zahlungsart: 'miete_und_nebenkosten',
  betrag: null,
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
  unterschriftZahlungspflichtiger: { ...EMPTY_SIGNATURE },
}

export default function SEPALastschriftmandatPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'sepa-lastschriftmandat',
    generateTitle: (data) => `SEPA-Lastschriftmandat - ${data.zahlungspflichtiger?.vorname || ''} ${data.zahlungspflichtiger?.nachname || ''}`.trim() || 'SEPA-Lastschriftmandat'
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

  // Auto-generate Mandatsreferenz
  React.useEffect(() => {
    if (!formData.mandatsreferenz) {
      const ref = `MIETE-${Date.now().toString(36).toUpperCase()}`
      updateData({ mandatsreferenz: ref })
    }
  }, [])

  const handleSubmit = () => {
    handleSave(formData)
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateSEPALastschriftmandatPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Das SEPA-Lastschriftmandat wurde als PDF gespeichert.' })
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
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SEPA-Lastschriftmandat</h1>
              <p className="text-muted-foreground">Einzugsermächtigung für Mietzahlungen</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Mit dem SEPA-Lastschriftmandat ermächtigen Sie den Vermieter, fällige Zahlungen
            von Ihrem Konto einzuziehen. Sie können das Mandat jederzeit widerrufen.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Zahlungsempfänger (Vermieter) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Zahlungsempfänger (Vermieter)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.zahlungsempfaenger}
                onChange={(v) => updateData({ zahlungsempfaenger: v })}
                label="Vermieter / Hausverwaltung"
                required
              />
              <AddressField
                value={formData.zahlungsempfaengerAdresse}
                onChange={(v) => updateData({ zahlungsempfaengerAdresse: v })}
                label="Anschrift"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gläubiger-Identifikationsnummer</Label>
                  <Input
                    value={formData.glaeubigerIdentifikationsnummer}
                    onChange={(e) => updateData({ glaeubigerIdentifikationsnummer: e.target.value })}
                    placeholder="z.B. DE98ZZZ09999999999"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Falls vorhanden (bei Bundesbank beantragen)
                  </p>
                </div>
                <div>
                  <Label>Mandatsreferenz *</Label>
                  <Input
                    value={formData.mandatsreferenz}
                    onChange={(e) => updateData({ mandatsreferenz: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Eindeutige Referenznummer für dieses Mandat
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zahlungspflichtiger (Mieter) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Zahlungspflichtiger (Mieter)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.zahlungspflichtiger}
                onChange={(v) => updateData({ zahlungspflichtiger: v })}
                label="Mieter"
                required
              />
              <AddressField
                value={formData.zahlungspflichtigerAdresse}
                onChange={(v) => updateData({ zahlungspflichtigerAdresse: v })}
                label="Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Bankverbindung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bankverbindung
              </CardTitle>
              <CardDescription>
                Konto, von dem die Miete eingezogen werden soll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kontoinhaber *</Label>
                <Input
                  value={formData.kontoinhaber}
                  onChange={(e) => updateData({ kontoinhaber: e.target.value })}
                  placeholder="Name des Kontoinhabers"
                />
              </div>
              <IBANField
                value={formData.iban}
                onChange={(v) => updateData({ iban: v })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>BIC</Label>
                  <Input
                    value={formData.bic}
                    onChange={(e) => updateData({ bic: e.target.value })}
                    placeholder="z.B. COBADEFFXXX"
                  />
                </div>
                <div>
                  <Label>Kreditinstitut</Label>
                  <Input
                    value={formData.kreditinstitut}
                    onChange={(e) => updateData({ kreditinstitut: e.target.value })}
                    placeholder="Name der Bank"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mandat-Details */}
          <Card>
            <CardHeader>
              <CardTitle>Mandatsdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mandatsart *</Label>
                  <Select
                    value={formData.mandatArt}
                    onValueChange={(v: 'wiederkehrend' | 'einmalig') => updateData({ mandatArt: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wiederkehrend">Wiederkehrende Zahlung</SelectItem>
                      <SelectItem value="einmalig">Einmalige Zahlung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zahlungsart *</Label>
                  <Select
                    value={formData.zahlungsart}
                    onValueChange={(v) => updateData({ zahlungsart: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miete_und_nebenkosten">Miete und Nebenkosten</SelectItem>
                      <SelectItem value="miete">Nur Miete</SelectItem>
                      <SelectItem value="nebenkosten">Nur Nebenkosten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CurrencyField
                label="Monatlicher Betrag (optional)"
                value={formData.betrag}
                onChange={(v) => updateData({ betrag: v })}
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

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Erteilung des Mandats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="mb-2">
                  Ich ermächtige den Zahlungsempfänger, Zahlungen von meinem Konto mittels
                  Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die
                  vom Zahlungsempfänger auf mein Konto gezogenen Lastschriften einzulösen.
                </p>
                <p>
                  <strong>Hinweis:</strong> Ich kann innerhalb von acht Wochen, beginnend mit dem
                  Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten
                  dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.
                </p>
              </div>
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
              <SignatureField
                value={formData.unterschriftZahlungspflichtiger}
                onChange={(v) => updateData({ unterschriftZahlungspflichtiger: v })}
                label="Unterschrift Zahlungspflichtiger (Mieter)"
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
