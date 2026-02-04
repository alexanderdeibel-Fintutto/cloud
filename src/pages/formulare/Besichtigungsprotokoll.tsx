import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, Plus, X, Save, FileDown } from 'lucide-react'
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
import { type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { generateBesichtigungsprotokollPDF } from '@/lib/pdf/besichtigungsprotokoll-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Teilnehmer {
  id: string
  name: string
  rolle: string
}

interface FormData {
  objektAdresse: AddressData
  vermieterKontakt: PersonData
  besichtigungsdatum: string
  besichtigungsuhrzeit: string
  teilnehmer: Teilnehmer[]
  wohnungsgroesse: string
  zimmeranzahl: string
  etage: string
  kaltmiete: number | null
  nebenkosten: number | null
  kaution: number | null
  verfuegbarAb: string
  allgemeinesBild: string
  zustandKueche: string
  zustandBad: string
  zustandBoeden: string
  zustandWaende: string
  zustandFenster: string
  besonderheiten: string
  interesse: string
  fragen: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  objektAdresse: { ...EMPTY_ADDRESS },
  vermieterKontakt: { ...EMPTY_PERSON },
  besichtigungsdatum: '',
  besichtigungsuhrzeit: '',
  teilnehmer: [{ id: '1', name: '', rolle: '' }],
  wohnungsgroesse: '',
  zimmeranzahl: '',
  etage: '',
  kaltmiete: null,
  nebenkosten: null,
  kaution: null,
  verfuegbarAb: '',
  allgemeinesBild: '',
  zustandKueche: '',
  zustandBad: '',
  zustandBoeden: '',
  zustandWaende: '',
  zustandFenster: '',
  besonderheiten: '',
  interesse: '',
  fragen: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

const ZUSTAND_OPTIONS = [
  { value: 'sehr_gut', label: 'Sehr gut' },
  { value: 'gut', label: 'Gut' },
  { value: 'befriedigend', label: 'Befriedigend' },
  { value: 'ausreichend', label: 'Ausreichend' },
  { value: 'mangelhaft', label: 'Mangelhaft' },
]

export default function BesichtigungsprotokollPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const { handleSave, documentId } = useDocumentSave({
    type: 'besichtigungsprotokoll',
    generateTitle: (data) => `Besichtigung - ${data.objektAdresse?.strasse || ''} ${data.objektAdresse?.hausnummer || ''}, ${data.objektAdresse?.ort || ''}`.trim() || 'Besichtigungsprotokoll'
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

  const addTeilnehmer = () => {
    const newId = Date.now().toString()
    updateData({ teilnehmer: [...formData.teilnehmer, { id: newId, name: '', rolle: '' }] })
  }

  const removeTeilnehmer = (id: string) => {
    if (formData.teilnehmer.length > 1) {
      updateData({ teilnehmer: formData.teilnehmer.filter(t => t.id !== id) })
    }
  }

  const updateTeilnehmer = (id: string, field: keyof Teilnehmer, value: string) => {
    updateData({
      teilnehmer: formData.teilnehmer.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    })
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateBesichtigungsprotokollPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Das Besichtigungsprotokoll wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-teal-100 rounded-lg">
              <Eye className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Besichtigungsprotokoll</h1>
              <p className="text-muted-foreground">Dokumentation einer Wohnungsbesichtigung</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Objekt */}
          <Card>
            <CardHeader>
              <CardTitle>Objekt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.objektAdresse}
                onChange={(v) => updateData({ objektAdresse: v })}
                label="Adresse"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Wohnungsgröße (m²)</Label>
                  <Input
                    value={formData.wohnungsgroesse}
                    onChange={(e) => updateData({ wohnungsgroesse: e.target.value })}
                    placeholder="z.B. 65"
                  />
                </div>
                <div>
                  <Label>Zimmeranzahl</Label>
                  <Input
                    value={formData.zimmeranzahl}
                    onChange={(e) => updateData({ zimmeranzahl: e.target.value })}
                    placeholder="z.B. 2,5"
                  />
                </div>
                <div>
                  <Label>Etage</Label>
                  <Input
                    value={formData.etage}
                    onChange={(e) => updateData({ etage: e.target.value })}
                    placeholder="z.B. 3. OG"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Besichtigung */}
          <Card>
            <CardHeader>
              <CardTitle>Besichtigungstermin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={formData.besichtigungsdatum}
                    onChange={(e) => updateData({ besichtigungsdatum: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Uhrzeit</Label>
                  <Input
                    type="time"
                    value={formData.besichtigungsuhrzeit}
                    onChange={(e) => updateData({ besichtigungsuhrzeit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Teilnehmer</Label>
                {formData.teilnehmer.map((t) => (
                  <div key={t.id} className="flex gap-2 mb-2">
                    <Input
                      value={t.name}
                      onChange={(e) => updateTeilnehmer(t.id, 'name', e.target.value)}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      value={t.rolle}
                      onChange={(e) => updateTeilnehmer(t.id, 'rolle', e.target.value)}
                      placeholder="Rolle (z.B. Makler)"
                      className="flex-1"
                    />
                    {formData.teilnehmer.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeTeilnehmer(t.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTeilnehmer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Teilnehmer hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Konditionen */}
          <Card>
            <CardHeader>
              <CardTitle>Mietkonditionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CurrencyField
                  label="Kaltmiete"
                  value={formData.kaltmiete}
                  onChange={(v) => updateData({ kaltmiete: v })}
                />
                <CurrencyField
                  label="Nebenkosten"
                  value={formData.nebenkosten}
                  onChange={(v) => updateData({ nebenkosten: v })}
                />
                <CurrencyField
                  label="Kaution"
                  value={formData.kaution}
                  onChange={(v) => updateData({ kaution: v })}
                />
              </div>
              <div>
                <Label>Verfügbar ab</Label>
                <Input
                  type="date"
                  value={formData.verfuegbarAb}
                  onChange={(e) => updateData({ verfuegbarAb: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Zustand */}
          <Card>
            <CardHeader>
              <CardTitle>Zustandsbewertung</CardTitle>
              <CardDescription>
                Bewertung der verschiedenen Bereiche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allgemeiner Eindruck</Label>
                <Textarea
                  value={formData.allgemeinesBild}
                  onChange={(e) => updateData({ allgemeinesBild: e.target.value })}
                  placeholder="Beschreiben Sie Ihren allgemeinen Eindruck..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: 'zustandKueche', label: 'Küche' },
                  { field: 'zustandBad', label: 'Bad' },
                  { field: 'zustandBoeden', label: 'Böden' },
                  { field: 'zustandWaende', label: 'Wände/Decken' },
                  { field: 'zustandFenster', label: 'Fenster' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <Select
                      value={formData[field as keyof FormData] as string}
                      onValueChange={(v) => updateData({ [field]: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Bewertung" /></SelectTrigger>
                      <SelectContent>
                        {ZUSTAND_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div>
                <Label>Besonderheiten / Mängel</Label>
                <Textarea
                  value={formData.besonderheiten}
                  onChange={(e) => updateData({ besonderheiten: e.target.value })}
                  placeholder="Notieren Sie besondere Merkmale oder festgestellte Mängel..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fazit */}
          <Card>
            <CardHeader>
              <CardTitle>Fazit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Interesse</Label>
                <Select
                  value={formData.interesse}
                  onValueChange={(v) => updateData({ interesse: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Interesse bewerten" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoch">Hohes Interesse - sofort bewerben</SelectItem>
                    <SelectItem value="mittel">Mittleres Interesse - weitere Besichtigungen abwarten</SelectItem>
                    <SelectItem value="gering">Geringes Interesse - nicht passend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Offene Fragen / Anmerkungen</Label>
                <Textarea
                  value={formData.fragen}
                  onChange={(e) => updateData({ fragen: e.target.value })}
                  placeholder="Fragen, die noch geklärt werden müssen..."
                  rows={3}
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
