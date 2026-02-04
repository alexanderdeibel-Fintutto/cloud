import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Banknote, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import { generateKautionsrueckforderungPDF } from '@/lib/pdf/kautionsrueckforderung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }
const EMPTY_SIGNATURE: SignatureData = { imageData: null, signerName: '', signedAt: null, signedLocation: '' }

interface FormData {
  mieter: PersonData
  mieterNeueAdresse: AddressData
  vermieter: PersonData
  vermieterAdresse: AddressData
  mietobjektAdresse: AddressData
  mietverhaeltnisEnde: string
  wohnungsuebergabe: string
  kautionHoehe: number | null
  kautionArt: 'barkaution' | 'sparbuch' | 'buergschaft'
  kautionEingezahltAm: string
  bankinhaber: string
  iban: string
  bic: string
  fristBis: string
  unterschriftMieter: SignatureData
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  mieter: { ...EMPTY_PERSON },
  mieterNeueAdresse: { ...EMPTY_ADDRESS },
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietverhaeltnisEnde: '',
  wohnungsuebergabe: '',
  kautionHoehe: null,
  kautionArt: 'barkaution',
  kautionEingezahltAm: '',
  bankinhaber: '',
  iban: '',
  bic: '',
  fristBis: '',
  unterschriftMieter: { ...EMPTY_SIGNATURE },
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function KautionsrueckforderungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateKautionsrueckforderungPDF(formData)
      toast({ title: 'PDF erstellt', description: 'Die Kautionsrückforderung wurde als PDF gespeichert.' })
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kautionsrückforderung</h1>
              <p className="text-muted-foreground">Rückzahlung der Mietkaution einfordern</p>
            </div>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            <strong>Hinweis:</strong> Der Vermieter hat in der Regel bis zu 6 Monate Zeit, die Kaution
            abzurechnen (BGH, Urteil vom 18.01.2006 - VIII ZR 71/05). Diese Frist kann sich verlängern,
            wenn noch Nebenkostenabrechnungen ausstehen.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Mieter */}
          <Card>
            <CardHeader>
              <CardTitle>Mieter (Absender)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PersonField
                value={formData.mieter}
                onChange={(v) => updateData({ mieter: v })}
                label="Mieter"
                required
              />
              <AddressField
                value={formData.mieterNeueAdresse}
                onChange={(v) => updateData({ mieterNeueAdresse: v })}
                label="Neue Anschrift"
                required
              />
            </CardContent>
          </Card>

          {/* Vermieter */}
          <Card>
            <CardHeader>
              <CardTitle>Vermieter (Empfänger)</CardTitle>
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

          {/* Mietobjekt */}
          <Card>
            <CardHeader>
              <CardTitle>Mietobjekt und Mietende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressField
                value={formData.mietobjektAdresse}
                onChange={(v) => updateData({ mietobjektAdresse: v })}
                label="Ehemaliges Mietobjekt"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mietverhältnis beendet am *</Label>
                  <Input
                    type="date"
                    value={formData.mietverhaeltnisEnde}
                    onChange={(e) => updateData({ mietverhaeltnisEnde: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Wohnungsübergabe am *</Label>
                  <Input
                    type="date"
                    value={formData.wohnungsuebergabe}
                    onChange={(e) => updateData({ wohnungsuebergabe: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kaution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kautionsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CurrencyField
                label="Kautionshöhe *"
                value={formData.kautionHoehe}
                onChange={(v) => updateData({ kautionHoehe: v })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Art der Kaution</Label>
                  <Select
                    value={formData.kautionArt}
                    onValueChange={(v: 'barkaution' | 'sparbuch' | 'buergschaft') =>
                      updateData({ kautionArt: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barkaution">Barkaution</SelectItem>
                      <SelectItem value="sparbuch">Sparbuch / Kautionskonto</SelectItem>
                      <SelectItem value="buergschaft">Bankbürgschaft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kaution eingezahlt am</Label>
                  <Input
                    type="date"
                    value={formData.kautionEingezahltAm}
                    onChange={(e) => updateData({ kautionEingezahltAm: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bankverbindung */}
          <Card>
            <CardHeader>
              <CardTitle>Bankverbindung für Rückzahlung</CardTitle>
              <CardDescription>
                Wohin soll die Kaution überwiesen werden?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kontoinhaber *</Label>
                <Input
                  value={formData.bankinhaber}
                  onChange={(e) => updateData({ bankinhaber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>IBAN *</Label>
                  <Input
                    value={formData.iban}
                    onChange={(e) => updateData({ iban: e.target.value })}
                    placeholder="DE00 0000 0000 0000 0000 00"
                  />
                </div>
                <div>
                  <Label>BIC (optional)</Label>
                  <Input
                    value={formData.bic}
                    onChange={(e) => updateData({ bic: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frist */}
          <Card>
            <CardHeader>
              <CardTitle>Frist für Rückzahlung</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Rückzahlung erbeten bis *</Label>
                <Input
                  type="date"
                  value={formData.fristBis}
                  onChange={(e) => updateData({ fristBis: e.target.value })}
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
                value={formData.unterschriftMieter}
                onChange={(v) => updateData({ unterschriftMieter: v })}
                label="Unterschrift Mieter"
                required
              />
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
