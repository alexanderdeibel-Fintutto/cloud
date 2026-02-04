import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Save, FileDown } from 'lucide-react'
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
import { generateMietanpassungPDF } from '@/lib/pdf/mietanpassung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  anpassungsgrund: string
  sonstigerGrund: string
  bisherigeMiete: number | null
  neueMiete: number | null
  anpassungAb: string
  begruendung: string
  frist: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  anpassungsgrund: '',
  sonstigerGrund: '',
  bisherigeMiete: null,
  neueMiete: null,
  anpassungAb: '',
  begruendung: '',
  frist: '30',
  erstelltAm: new Date().toISOString().split('T')[0],
}

const ANPASSUNGSGRUENDE = [
  { value: 'mietspiegel', label: 'Anpassung an ortsübliche Vergleichsmiete (Mietspiegel)' },
  { value: 'modernisierung', label: 'Umlage von Modernisierungskosten' },
  { value: 'betriebskosten', label: 'Erhöhung der Betriebskostenvorauszahlung' },
  { value: 'vereinbarung', label: 'Vertraglich vereinbarte Anpassung' },
  { value: 'sonstige', label: 'Sonstiger Grund' },
]

export default function MietanpassungPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'mietanpassung',
    generateTitle: (data) => `Mietanpassung - ${data.mieter?.vorname || ''} ${data.mieter?.nachname || ''}`.trim() || 'Mietanpassung'
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

  const differenz = formData.neueMiete && formData.bisherigeMiete
    ? formData.neueMiete - formData.bisherigeMiete
    : null

  const prozent = formData.neueMiete && formData.bisherigeMiete && formData.bisherigeMiete > 0
    ? ((formData.neueMiete - formData.bisherigeMiete) / formData.bisherigeMiete * 100).toFixed(1)
    : null

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateMietanpassungPDF({
        ...formData,
        differenz,
        prozent,
      })
      toast({ title: 'PDF erstellt', description: 'Das Mietanpassungsschreiben wurde als PDF gespeichert.' })
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
              <h1 className="text-2xl font-bold">Mietanpassung</h1>
              <p className="text-muted-foreground">Allgemeines Mietanpassungsschreiben</p>
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
              <CardTitle>Mietanpassung</CardTitle>
              <CardDescription>
                Details zur gewünschten Mietänderung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Grund der Anpassung *</Label>
                <Select
                  value={formData.anpassungsgrund}
                  onValueChange={(v) => updateData({ anpassungsgrund: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Grund auswählen" /></SelectTrigger>
                  <SelectContent>
                    {ANPASSUNGSGRUENDE.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.anpassungsgrund === 'sonstige' && (
                <div>
                  <Label>Sonstiger Grund</Label>
                  <Input
                    value={formData.sonstigerGrund}
                    onChange={(e) => updateData({ sonstigerGrund: e.target.value })}
                    placeholder="Bitte angeben..."
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Bisherige Miete (Kaltmiete) *"
                  value={formData.bisherigeMiete}
                  onChange={(v) => updateData({ bisherigeMiete: v })}
                />
                <CurrencyField
                  label="Neue Miete (Kaltmiete) *"
                  value={formData.neueMiete}
                  onChange={(v) => updateData({ neueMiete: v })}
                />
              </div>

              {differenz !== null && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="font-medium">
                    Erhöhung: {differenz.toFixed(2)} € ({prozent}%)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Anpassung ab *</Label>
                  <Input
                    type="date"
                    value={formData.anpassungAb}
                    onChange={(e) => updateData({ anpassungAb: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Zustimmungsfrist (Tage)</Label>
                  <Select
                    value={formData.frist}
                    onValueChange={(v) => updateData({ frist: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Begründung</Label>
                <Textarea
                  value={formData.begruendung}
                  onChange={(e) => updateData({ begruendung: e.target.value })}
                  placeholder="Detaillierte Begründung für die Mietanpassung..."
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
