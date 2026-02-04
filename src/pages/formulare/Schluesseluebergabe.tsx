import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Key, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateSchluesseluebergabePDF } from '@/lib/pdf/schluesseluebergabe-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface Schluessel {
  id: string
  bezeichnung: string
  anzahl: string
  nummer: string
}

interface FormData {
  uebergebender: PersonData
  empfaenger: PersonData
  mietobjektAdresse: AddressData
  uebergabeArt: 'einzug' | 'auszug' | 'sonstige'
  schluessel: Schluessel[]
  bemerkungen: string
  unterschriftUebergebender: SignatureData
  unterschriftEmpfaenger: SignatureData
  erstelltAm: string
  erstelltOrt: string
}

const INITIAL_DATA: FormData = {
  uebergebender: { ...EMPTY_PERSON },
  empfaenger: { ...EMPTY_PERSON },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  uebergabeArt: 'einzug',
  schluessel: [
    { id: '1', bezeichnung: 'Wohnungsschlüssel', anzahl: '2', nummer: '' },
    { id: '2', bezeichnung: 'Haustürschlüssel', anzahl: '2', nummer: '' },
    { id: '3', bezeichnung: 'Briefkastenschlüssel', anzahl: '1', nummer: '' },
  ],
  bemerkungen: '',
  unterschriftUebergebender: { ...EMPTY_SIGNATURE },
  unterschriftEmpfaenger: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
  erstelltOrt: '',
}

export default function SchluesseluebergabePage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addSchluessel = () => {
    setFormData(prev => ({
      ...prev,
      schluessel: [...prev.schluessel, { id: Date.now().toString(), bezeichnung: '', anzahl: '1', nummer: '' }],
    }))
  }

  const updateSchluessel = (id: string, updates: Partial<Schluessel>) => {
    setFormData(prev => ({
      ...prev,
      schluessel: prev.schluessel.map(s => s.id === id ? { ...s, ...updates } : s),
    }))
  }

  const removeSchluessel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      schluessel: prev.schluessel.filter(s => s.id !== id),
    }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateSchluesseluebergabePDF(formData)
      toast({ title: 'PDF erstellt', description: 'Das Schlüsselübergabeprotokoll wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-amber-100 rounded-lg">
              <Key className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Schlüsselübergabeprotokoll</h1>
              <p className="text-muted-foreground">Dokumentation der Schlüsselübergabe</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Art der Übergabe */}
          <Card>
            <CardHeader>
              <CardTitle>Art der Übergabe</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.uebergabeArt}
                onValueChange={(v: 'einzug' | 'auszug' | 'sonstige') => updateData({ uebergabeArt: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="einzug">Einzug (Vermieter an Mieter)</SelectItem>
                  <SelectItem value="auszug">Auszug (Mieter an Vermieter)</SelectItem>
                  <SelectItem value="sonstige">Sonstige Übergabe</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Übergebender */}
          <Card>
            <CardHeader>
              <CardTitle>Übergebende Person</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonField
                value={formData.uebergebender}
                onChange={(v) => updateData({ uebergebender: v })}
                label="Übergebender"
                required
              />
            </CardContent>
          </Card>

          {/* Empfänger */}
          <Card>
            <CardHeader>
              <CardTitle>Empfangende Person</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonField
                value={formData.empfaenger}
                onChange={(v) => updateData({ empfaenger: v })}
                label="Empfänger"
                required
              />
            </CardContent>
          </Card>

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Adresse"
                required
              />
            </CardContent>
          </Card>

          {/* Schlüssel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Übergebene Schlüssel
              </CardTitle>
              <CardDescription>
                Detaillierte Auflistung aller übergebenen Schlüssel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.schluessel.map((schluessel) => (
                <div key={schluessel.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Bezeichnung</Label>
                    <Input
                      value={schluessel.bezeichnung}
                      onChange={(e) => updateSchluessel(schluessel.id, { bezeichnung: e.target.value })}
                      placeholder="z.B. Wohnungsschlüssel"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Anzahl</Label>
                    <Input
                      value={schluessel.anzahl}
                      onChange={(e) => updateSchluessel(schluessel.id, { anzahl: e.target.value })}
                      placeholder="2"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Nummer (opt.)</Label>
                    <Input
                      value={schluessel.nummer}
                      onChange={(e) => updateSchluessel(schluessel.id, { nummer: e.target.value })}
                      placeholder="z.B. 123"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSchluessel(schluessel.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addSchluessel} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Weiteren Schlüssel hinzufügen
              </Button>
            </CardContent>
          </Card>

          {/* Bemerkungen */}
          <Card>
            <CardHeader>
              <CardTitle>Bemerkungen (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.bemerkungen}
                onChange={(e) => updateData({ bemerkungen: e.target.value })}
                placeholder="z.B. Hinweise zum Zustand der Schlüssel, fehlende Schlüssel..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Unterschriften */}
          <Card>
            <CardHeader>
              <CardTitle>Übergabebestätigung</CardTitle>
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
                  value={formData.unterschriftUebergebender}
                  onChange={(v) => updateData({ unterschriftUebergebender: v })}
                  label="Unterschrift Übergebender"
                  required
                />
                <SignatureField
                  value={formData.unterschriftEmpfaenger}
                  onChange={(v) => updateData({ unterschriftEmpfaenger: v })}
                  label="Unterschrift Empfänger"
                  required
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
