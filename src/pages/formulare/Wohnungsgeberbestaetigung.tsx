import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home, User, FileCheck, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { useToast } from '@/hooks/use-toast'
import { generateWohnungsgeberbestaetigungPDF } from '@/lib/pdf/wohnungsgeberbestaetigung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface WohnungsgeberbestaetigungFormData {
  // Wohnungsgeber
  wohnungsgeber: PersonData
  wohnungsgeberAdresse: AddressData
  wohnungsgeberIstEigentuemer: boolean

  // Meldepflichtige Person
  meldepflichtiger: PersonData
  meldepflichtigerGeburtsdatum: string
  meldepflichtigerGeburtsort: string
  meldepflichtigerStaatsangehoerigkeit: string
  meldepflichtigerFamilienstand: string

  // Wohnung
  wohnungAdresse: AddressData
  einzugsdatum: string

  // Art der Meldung
  meldeart: 'einzug' | 'auszug'
  auszugsdatum: string

  // Aussteller
  ausstellungsdatum: string
  ausstellungsort: string

  unterschriftWohnungsgeber: SignatureData
}

const INITIAL_DATA: WohnungsgeberbestaetigungFormData = {
  wohnungsgeber: { ...EMPTY_PERSON },
  wohnungsgeberAdresse: { ...EMPTY_ADDRESS },
  wohnungsgeberIstEigentuemer: true,
  meldepflichtiger: { ...EMPTY_PERSON },
  meldepflichtigerGeburtsdatum: '',
  meldepflichtigerGeburtsort: '',
  meldepflichtigerStaatsangehoerigkeit: 'deutsch',
  meldepflichtigerFamilienstand: '',
  wohnungAdresse: { ...EMPTY_ADDRESS },
  einzugsdatum: new Date().toISOString().split('T')[0],
  meldeart: 'einzug',
  auszugsdatum: '',
  ausstellungsdatum: new Date().toISOString().split('T')[0],
  ausstellungsort: '',
  unterschriftWohnungsgeber: { ...EMPTY_SIGNATURE },
}

export default function WohnungsgeberbestaetigungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<WohnungsgeberbestaetigungFormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<WohnungsgeberbestaetigungFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateWohnungsgeberbestaetigungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Wohnungsgeberbestätigung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wohnungsgeberbestätigung</h1>
              <p className="text-muted-foreground">nach § 19 Bundesmeldegesetz (BMG)</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <strong>Wichtig:</strong> Nach § 19 BMG ist der Wohnungsgeber (Vermieter) verpflichtet, dem Mieter
            den Einzug oder Auszug schriftlich zu bestätigen. Diese Bestätigung muss innerhalb von zwei Wochen
            nach Ein- oder Auszug der meldepflichtigen Person übergeben werden.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Art der Meldung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Art der Meldung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Meldeart *</Label>
                  <Select
                    value={formData.meldeart}
                    onValueChange={(v: 'einzug' | 'auszug') => updateData({ meldeart: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="einzug">Einzug (Anmeldung)</SelectItem>
                      <SelectItem value="auszug">Auszug (Abmeldung)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{formData.meldeart === 'einzug' ? 'Einzugsdatum' : 'Auszugsdatum'} *</Label>
                  <Input
                    type="date"
                    value={formData.meldeart === 'einzug' ? formData.einzugsdatum : formData.auszugsdatum}
                    onChange={(e) => updateData(
                      formData.meldeart === 'einzug'
                        ? { einzugsdatum: e.target.value }
                        : { auszugsdatum: e.target.value }
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wohnungsgeber */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Wohnungsgeber (Vermieter)
              </CardTitle>
              <CardDescription>
                Angaben zur Person, die die Wohnung überlässt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.wohnungsgeber}
                onChange={(v) => updateData({ wohnungsgeber: v })}
                label="Wohnungsgeber"
                required
              />
              <AddressField
                value={formData.wohnungsgeberAdresse}
                onChange={(v) => updateData({ wohnungsgeberAdresse: v })}
                label="Anschrift des Wohnungsgebers"
                required
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="eigentuemer"
                  checked={formData.wohnungsgeberIstEigentuemer}
                  onCheckedChange={(c) => updateData({ wohnungsgeberIstEigentuemer: !!c })}
                />
                <Label htmlFor="eigentuemer">Wohnungsgeber ist Eigentümer der Wohnung</Label>
              </div>
            </CardContent>
          </Card>

          {/* Meldepflichtige Person */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meldepflichtige Person (Mieter)
              </CardTitle>
              <CardDescription>
                Angaben zur Person, die ein- oder auszieht
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.meldepflichtiger}
                onChange={(v) => updateData({ meldepflichtiger: v })}
                label="Meldepflichtige Person"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Geburtsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.meldepflichtigerGeburtsdatum}
                    onChange={(e) => updateData({ meldepflichtigerGeburtsdatum: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Geburtsort</Label>
                  <Input
                    value={formData.meldepflichtigerGeburtsort}
                    onChange={(e) => updateData({ meldepflichtigerGeburtsort: e.target.value })}
                    placeholder="z.B. Berlin"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Staatsangehörigkeit</Label>
                  <Input
                    value={formData.meldepflichtigerStaatsangehoerigkeit}
                    onChange={(e) => updateData({ meldepflichtigerStaatsangehoerigkeit: e.target.value })}
                    placeholder="z.B. deutsch"
                  />
                </div>
                <div>
                  <Label>Familienstand</Label>
                  <Select
                    value={formData.meldepflichtigerFamilienstand}
                    onValueChange={(v) => updateData({ meldepflichtigerFamilienstand: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ledig">ledig</SelectItem>
                      <SelectItem value="verheiratet">verheiratet</SelectItem>
                      <SelectItem value="geschieden">geschieden</SelectItem>
                      <SelectItem value="verwitwet">verwitwet</SelectItem>
                      <SelectItem value="lebenspartnerschaft">eingetragene Lebenspartnerschaft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wohnung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Wohnung
              </CardTitle>
              <CardDescription>
                Anschrift der Wohnung, in die ein- bzw. aus der ausgezogen wird
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddressField
                value={formData.wohnungAdresse}
                onChange={(v) => updateData({ wohnungAdresse: v })}
                label="Anschrift der Wohnung"
                required
              />
            </CardContent>
          </Card>

          {/* Unterschrift */}
          <Card>
            <CardHeader>
              <CardTitle>Bestätigung und Unterschrift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ausstellungsort *</Label>
                  <Input
                    value={formData.ausstellungsort}
                    onChange={(e) => updateData({ ausstellungsort: e.target.value })}
                    placeholder="z.B. Berlin"
                  />
                </div>
                <div>
                  <Label>Ausstellungsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.ausstellungsdatum}
                    onChange={(e) => updateData({ ausstellungsdatum: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <SignatureField
                value={formData.unterschriftWohnungsgeber}
                onChange={(v) => updateData({ unterschriftWohnungsgeber: v })}
                label="Unterschrift des Wohnungsgebers"
                required
              />
            </CardContent>
          </Card>

          {/* Aktionen */}
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
