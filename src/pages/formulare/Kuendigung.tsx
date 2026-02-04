import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, User, Home, AlertCircle, Save, FileDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PersonField, type PersonData } from '@/components/fields/PersonField'
import { AddressField, type AddressData } from '@/components/fields/AddressField'
import { SignatureField, type SignatureData } from '@/components/fields/SignatureField'
import { calculateKuendigungsfrist } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useDocumentSave } from '@/hooks/useDocumentSave'
import { getDocument } from '@/services/documentStorage'
import { useAuth } from '@/contexts/AuthContext'
import { addMonths, endOfMonth, differenceInYears, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { generateKuendigungPDF, type KuendigungData } from '@/lib/pdf/kuendigung-pdf'

const EMPTY_PERSON: PersonData = {
  anrede: '',
  vorname: '',
  nachname: '',
  telefon: '',
  email: ''
}

const EMPTY_ADDRESS: AddressData = {
  strasse: '',
  hausnummer: '',
  plz: '',
  ort: '',
  land: 'Deutschland'
}

const EMPTY_SIGNATURE: SignatureData = {
  imageData: null,
  signerName: '',
  signedAt: null,
  signedLocation: ''
}

export default function KuendigungFormularPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)

  // Formular-State
  const [kuendigender, setKuendigender] = React.useState<'mieter' | 'vermieter'>('mieter')
  const [kuendigungsart, setKuendigungsart] = React.useState<'ordentlich' | 'ausserordentlich'>('ordentlich')

  const [absender, setAbsender] = React.useState<PersonData>(EMPTY_PERSON)
  const [absenderAdresse, setAbsenderAdresse] = React.useState<AddressData>(EMPTY_ADDRESS)

  const [empfaenger, setEmpfaenger] = React.useState<PersonData>(EMPTY_PERSON)
  const [empfaengerAdresse, setEmpfaengerAdresse] = React.useState<AddressData>(EMPTY_ADDRESS)

  const [mietobjektAdresse, setMietobjektAdresse] = React.useState<AddressData>(EMPTY_ADDRESS)
  const [mietbeginn, setMietbeginn] = React.useState<string>('')
  const [kuendigungsgrund, setKuendigungsgrund] = React.useState<string>('')

  const [unterschrift, setUnterschrift] = React.useState<SignatureData>(EMPTY_SIGNATURE)

  const { handleSave, documentId } = useDocumentSave({
    type: 'kuendigung',
    generateTitle: (data) => `Kündigung - ${data.absender?.vorname || ''} ${data.absender?.nachname || ''}`.trim() || 'Kündigung'
  })

  // Load existing document if editing
  React.useEffect(() => {
    const id = searchParams.get('id')
    if (id && user) {
      const doc = getDocument(id, user.id)
      if (doc?.data) {
        const data = doc.data
        if (data.kuendigender) setKuendigender(data.kuendigender)
        if (data.kuendigungsart) setKuendigungsart(data.kuendigungsart)
        if (data.absender) setAbsender({ ...EMPTY_PERSON, ...data.absender })
        if (data.absenderAdresse) setAbsenderAdresse({ ...EMPTY_ADDRESS, ...data.absenderAdresse })
        if (data.empfaenger) setEmpfaenger({ ...EMPTY_PERSON, ...data.empfaenger })
        if (data.empfaengerAdresse) setEmpfaengerAdresse({ ...EMPTY_ADDRESS, ...data.empfaengerAdresse })
        if (data.mietobjektAdresse) setMietobjektAdresse({ ...EMPTY_ADDRESS, ...data.mietobjektAdresse })
        if (data.mietbeginn) setMietbeginn(data.mietbeginn)
        if (data.kuendigungsgrund) setKuendigungsgrund(data.kuendigungsgrund)
        if (data.unterschrift) setUnterschrift({ ...EMPTY_SIGNATURE, ...data.unterschrift })
      }
    }
  }, [searchParams, user])

  const handleSubmit = () => {
    const formData = {
      kuendigender,
      kuendigungsart,
      absender,
      absenderAdresse,
      empfaenger,
      empfaengerAdresse,
      mietobjektAdresse,
      mietbeginn,
      kuendigungsgrund,
      unterschrift,
    }
    handleSave(formData)
  }

  // Berechnungen
  const berechneWohndauer = () => {
    if (!mietbeginn) return 0
    return differenceInYears(new Date(), new Date(mietbeginn))
  }

  const wohndauer = berechneWohndauer()
  const kuendigungsfrist = calculateKuendigungsfrist(wohndauer, kuendigender === 'vermieter')

  const berechneAuszugsdatum = () => {
    const heute = new Date()
    const istVor3Werktag = heute.getDate() <= 3

    let wirksamerMonat: Date
    if (istVor3Werktag) {
      wirksamerMonat = heute
    } else {
      wirksamerMonat = addMonths(heute, 1)
    }

    return endOfMonth(addMonths(wirksamerMonat, kuendigungsfrist))
  }

  const auszugsdatum = berechneAuszugsdatum()

  // PDF generieren
  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      const kuendigungData: KuendigungData = {
        kuendigender,
        kuendigungsart,
        absender: {
          anrede: absender.anrede,
          titel: absender.titel,
          vorname: absender.vorname,
          nachname: absender.nachname,
          telefon: absender.telefon,
          email: absender.email,
        },
        absenderAdresse: {
          strasse: absenderAdresse.strasse,
          hausnummer: absenderAdresse.hausnummer,
          plz: absenderAdresse.plz,
          ort: absenderAdresse.ort,
        },
        empfaenger: {
          anrede: empfaenger.anrede,
          titel: empfaenger.titel,
          vorname: empfaenger.vorname,
          nachname: empfaenger.nachname,
        },
        empfaengerAdresse: {
          strasse: empfaengerAdresse.strasse,
          hausnummer: empfaengerAdresse.hausnummer,
          plz: empfaengerAdresse.plz,
          ort: empfaengerAdresse.ort,
        },
        mietobjektAdresse: {
          strasse: mietobjektAdresse.strasse,
          hausnummer: mietobjektAdresse.hausnummer,
          plz: mietobjektAdresse.plz,
          ort: mietobjektAdresse.ort,
        },
        mietbeginn: mietbeginn || undefined,
        kuendigungsgrund: kuendigungsgrund || undefined,
        unterschrift: unterschrift.imageData ? {
          imageData: unterschrift.imageData,
          signerName: unterschrift.signerName || `${absender.vorname} ${absender.nachname}`.trim(),
          signedAt: unterschrift.signedAt,
          signedLocation: unterschrift.signedLocation,
        } : undefined,
      }

      await generateKuendigungPDF(kuendigungData)

      toast({
        title: "PDF erstellt",
        description: "Ihre Kündigung wurde als PDF heruntergeladen.",
      })
    } catch (error) {
      console.error('PDF-Generierung fehlgeschlagen:', error)
      toast({
        title: "Fehler",
        description: "Die PDF-Erstellung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Kündigung Mietvertrag</h1>
              <p className="text-muted-foreground">
                Erstellen Sie eine rechtssichere Kündigung für Ihr Mietverhältnis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formular */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grunddaten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kündigungsart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Wer kündigt?</Label>
                  <RadioGroup
                    value={kuendigender}
                    onValueChange={(v) => setKuendigender(v as 'mieter' | 'vermieter')}
                    className="mt-2 flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mieter" id="k-mieter" />
                      <Label htmlFor="k-mieter" className="cursor-pointer">Mieter kündigt</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vermieter" id="k-vermieter" />
                      <Label htmlFor="k-vermieter" className="cursor-pointer">Vermieter kündigt</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <Label>Art der Kündigung</Label>
                  <RadioGroup
                    value={kuendigungsart}
                    onValueChange={(v) => setKuendigungsart(v as 'ordentlich' | 'ausserordentlich')}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ordentlich" id="ordentlich" />
                      <Label htmlFor="ordentlich" className="cursor-pointer">
                        Ordentliche Kündigung (mit Frist)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ausserordentlich" id="ausserordentlich" />
                      <Label htmlFor="ausserordentlich" className="cursor-pointer">
                        Außerordentliche Kündigung (fristlos)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Absender */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {kuendigender === 'mieter' ? 'Mieter (Absender)' : 'Vermieter (Absender)'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PersonField
                  value={absender}
                  onChange={setAbsender}
                  required
                  showBirthdate={false}
                  showContact={true}
                />
                <Separator />
                <AddressField
                  value={absenderAdresse}
                  onChange={setAbsenderAdresse}
                  label="Aktuelle Adresse"
                  required
                />
              </CardContent>
            </Card>

            {/* Empfänger */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {kuendigender === 'mieter' ? 'Vermieter (Empfänger)' : 'Mieter (Empfänger)'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PersonField
                  value={empfaenger}
                  onChange={setEmpfaenger}
                  required
                  showBirthdate={false}
                  showContact={false}
                />
                <Separator />
                <AddressField
                  value={empfaengerAdresse}
                  onChange={setEmpfaengerAdresse}
                  label="Adresse"
                  required
                />
              </CardContent>
            </Card>

            {/* Mietobjekt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mietobjekt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AddressField
                  value={mietobjektAdresse}
                  onChange={setMietobjektAdresse}
                  label="Adresse der Mietwohnung"
                  required
                />

                <div>
                  <Label htmlFor="mietbeginn">Mietbeginn</Label>
                  <Input
                    id="mietbeginn"
                    type="date"
                    value={mietbeginn}
                    onChange={(e) => setMietbeginn(e.target.value)}
                    className="mt-1 max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Für die Berechnung der Kündigungsfrist
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kündigungsgrund (bei Vermieter oder außerordentlich) */}
            {(kuendigender === 'vermieter' || kuendigungsart === 'ausserordentlich') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kündigungsgrund</CardTitle>
                  <CardDescription>
                    {kuendigender === 'vermieter'
                      ? 'Als Vermieter müssen Sie einen gesetzlich anerkannten Grund angeben'
                      : 'Bei außerordentlicher Kündigung muss ein wichtiger Grund vorliegen'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={kuendigungsgrund}
                    onChange={(e) => setKuendigungsgrund(e.target.value)}
                    placeholder={
                      kuendigender === 'vermieter'
                        ? 'z.B. Eigenbedarf: Die Wohnung wird für meinen Sohn Max Mustermann benötigt, der zum 01.07.2024 nach Berlin zieht...'
                        : 'z.B. Erhebliche Mängel, die trotz mehrfacher Aufforderung nicht behoben wurden...'
                    }
                    rows={5}
                  />

                  {kuendigender === 'vermieter' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="font-medium">Zulässige Kündigungsgründe (§ 573 BGB):</p>
                          <ul className="list-disc list-inside text-yellow-600 mt-1">
                            <li>Eigenbedarf</li>
                            <li>Erhebliche Pflichtverletzung des Mieters</li>
                            <li>Angemessene wirtschaftliche Verwertung</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Unterschrift */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unterschrift</CardTitle>
              </CardHeader>
              <CardContent>
                <SignatureField
                  value={{
                    ...unterschrift,
                    signerName: unterschrift.signerName || `${absender.vorname} ${absender.nachname}`.trim()
                  }}
                  onChange={setUnterschrift}
                  required
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Frist-Berechnung */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Kündigungsfrist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mietbeginn ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Wohndauer:</span>
                      <Badge variant="secondary">{wohndauer} Jahre</Badge>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground">Kündigungsfrist</p>
                      <p className="text-2xl font-bold text-primary">
                        {kuendigungsfrist} Monate
                      </p>
                    </div>

                    <Separator />

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">Frühestmöglicher Auszug</p>
                      <p className="text-xl font-bold text-green-700">
                        {format(auszugsdatum, 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Geben Sie den Mietbeginn ein</p>
                  </div>
                )}

                <Link to="/rechner/kuendigungsfrist">
                  <Button variant="outline" className="w-full">
                    Zum Kündigungsfrist-Rechner
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Aktionen */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                {documentId && (
                  <Button variant="outline" className="w-full" onClick={handleGeneratePDF} disabled={isLoading}>
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF erstellen
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Senden Sie die Kündigung per Einschreiben mit Rückschein
                </p>
              </CardContent>
            </Card>

            {/* Tipps */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Wichtige Hinweise</p>
                  <ul className="list-disc list-inside text-blue-600 space-y-1">
                    <li>Kündigung muss schriftlich erfolgen</li>
                    <li>Original-Unterschrift erforderlich</li>
                    <li>Zugang bis zum 3. Werktag des Monats</li>
                    <li>Einschreiben/Rückschein empfohlen</li>
                    <li>Kopie für eigene Unterlagen</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
