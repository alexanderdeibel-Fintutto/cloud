import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wallet, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { CurrencyField } from '@/components/fields/CurrencyField'
import { useToast } from '@/hooks/use-toast'
import { generateKautionsabrechnungPDF } from '@/lib/pdf/kautionsabrechnung-pdf'

const EMPTY_PERSON: PersonData = { anrede: '', titel: '', vorname: '', nachname: '', telefon: '', email: '' }
const EMPTY_ADDRESS: AddressData = { strasse: '', hausnummer: '', plz: '', ort: '', land: 'Deutschland' }

interface Abzug {
  id: string
  bezeichnung: string
  betrag: number | null
}

interface FormData {
  vermieter: PersonData
  vermieterAdresse: AddressData
  mieter: PersonData
  mieterNeueAdresse: AddressData
  mietobjektAdresse: AddressData
  mietvertragVom: string
  mietende: string
  kautionsbetrag: number | null
  zinsen: number | null
  abzuege: Abzug[]
  sonstigeAnmerkungen: string
  bankverbindungMieter: string
  erstelltAm: string
}

const INITIAL_DATA: FormData = {
  vermieter: { ...EMPTY_PERSON },
  vermieterAdresse: { ...EMPTY_ADDRESS },
  mieter: { ...EMPTY_PERSON },
  mieterNeueAdresse: { ...EMPTY_ADDRESS },
  mietobjektAdresse: { ...EMPTY_ADDRESS },
  mietvertragVom: '',
  mietende: '',
  kautionsbetrag: null,
  zinsen: null,
  abzuege: [],
  sonstigeAnmerkungen: '',
  bankverbindungMieter: '',
  erstelltAm: new Date().toISOString().split('T')[0],
}

export default function KautionsabrechnungPage() {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<FormData>(INITIAL_DATA)
  const [isLoading, setIsLoading] = React.useState(false)

  const updateData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addAbzug = () => {
    setFormData(prev => ({
      ...prev,
      abzuege: [...prev.abzuege, { id: Date.now().toString(), bezeichnung: '', betrag: null }],
    }))
  }

  const updateAbzug = (id: string, updates: Partial<Abzug>) => {
    setFormData(prev => ({
      ...prev,
      abzuege: prev.abzuege.map(a => a.id === id ? { ...a, ...updates } : a),
    }))
  }

  const removeAbzug = (id: string) => {
    setFormData(prev => ({
      ...prev,
      abzuege: prev.abzuege.filter(a => a.id !== id),
    }))
  }

  const summeAbzuege = formData.abzuege.reduce((sum, a) => sum + (a.betrag || 0), 0)
  const kautionMitZinsen = (formData.kautionsbetrag || 0) + (formData.zinsen || 0)
  const auszahlungsbetrag = kautionMitZinsen - summeAbzuege

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      await generateKautionsabrechnungPDF({
        ...formData,
        summeAbzuege,
        kautionMitZinsen,
        auszahlungsbetrag,
      })
      toast({ title: 'PDF erstellt', description: 'Die Kautionsabrechnung wurde als PDF gespeichert.' })
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
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kautionsabrechnung</h1>
              <p className="text-muted-foreground">Abrechnung der Mietkaution nach Mietende</p>
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
                value={formData.mieterNeueAdresse}
                onChange={(v) => updateData({ mieterNeueAdresse: v })}
                label="Neue Anschrift"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Mietvertrag vom</Label>
                  <Input
                    type="date"
                    value={formData.mietvertragVom}
                    onChange={(e) => updateData({ mietvertragVom: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mietende *</Label>
                  <Input
                    type="date"
                    value={formData.mietende}
                    onChange={(e) => updateData({ mietende: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kaution */}
          <Card>
            <CardHeader>
              <CardTitle>Kaution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CurrencyField
                  label="Gezahlte Kaution *"
                  value={formData.kautionsbetrag}
                  onChange={(v) => updateData({ kautionsbetrag: v })}
                />
                <CurrencyField
                  label="Zinsen (optional)"
                  value={formData.zinsen}
                  onChange={(v) => updateData({ zinsen: v })}
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Kaution inkl. Zinsen: {kautionMitZinsen.toFixed(2)} €</p>
              </div>
            </CardContent>
          </Card>

          {/* Abzüge */}
          <Card>
            <CardHeader>
              <CardTitle>Abzüge</CardTitle>
              <CardDescription>
                Berechtigte Abzüge von der Kaution (z.B. Schäden, offene Nebenkosten)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.abzuege.map((abzug) => (
                <div key={abzug.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Bezeichnung</Label>
                    <Input
                      value={abzug.bezeichnung}
                      onChange={(e) => updateAbzug(abzug.id, { bezeichnung: e.target.value })}
                      placeholder="z.B. Reparatur Türschloss"
                    />
                  </div>
                  <div className="w-40">
                    <CurrencyField
                      label="Betrag"
                      value={abzug.betrag}
                      onChange={(v) => updateAbzug(abzug.id, { betrag: v })}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeAbzug(abzug.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addAbzug} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Abzug hinzufügen
              </Button>

              {formData.abzuege.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-red-700">Summe Abzüge: {summeAbzuege.toFixed(2)} €</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Abrechnung */}
          <Card>
            <CardHeader>
              <CardTitle>Abrechnung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Kaution inkl. Zinsen:</span>
                  <span>{kautionMitZinsen.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Abzüge:</span>
                  <span>- {summeAbzuege.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{auszahlungsbetrag >= 0 ? 'Auszahlungsbetrag:' : 'Nachforderung:'}</span>
                  <span className={auszahlungsbetrag >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(auszahlungsbetrag).toFixed(2)} €
                  </span>
                </div>
              </div>

              <div>
                <Label>Bankverbindung des Mieters</Label>
                <Textarea
                  value={formData.bankverbindungMieter}
                  onChange={(e) => updateData({ bankverbindungMieter: e.target.value })}
                  placeholder="IBAN: DE...&#10;Bank: ..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Sonstige Anmerkungen</Label>
                <Textarea
                  value={formData.sonstigeAnmerkungen}
                  onChange={(e) => updateData({ sonstigeAnmerkungen: e.target.value })}
                  placeholder="z.B. Belege liegen bei, Vorbehalt Nebenkostenabrechnung..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Datum der Abrechnung</Label>
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
            <Button onClick={handleGeneratePDF} disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'PDF erstellen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
