import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  ArrowLeft,
  Send,
  Download,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Scale,
  Lock,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getTemplateById, SGB_CATEGORIES, type LetterType } from '@/lib/sgb-knowledge'
import { useCreditsContext } from '@/contexts/CreditsContext'

export default function GeneratorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { checkLetter } = useCreditsContext()

  const template = getTemplateById(templateId as LetterType)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'form' | 'preview' | 'done'>('form')
  const [generatedLetter, setGeneratedLetter] = useState('')

  if (!template) {
    return (
      <div className="container py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vorlage nicht gefunden</h2>
        <Button variant="outline" asChild>
          <Link to="/musterschreiben">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurueck zu Musterschreiben
          </Link>
        </Button>
      </div>
    )
  }

  const categoryInfo = SGB_CATEGORIES[template.category]
  const requiredFieldsFilled = template.requiredFields
    .filter(f => f.required)
    .every(f => formData[f.id]?.trim())
  const totalFields = template.requiredFields.length
  const filledFields = template.requiredFields.filter(f => formData[f.id]?.trim()).length
  const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleGenerate = () => {
    // Generate demo letter
    const letter = generateDemoLetter(template, formData)
    setGeneratedLetter(letter)
    setStep('preview')
  }

  const letterCheck = checkLetter()

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back link */}
      <Link
        to="/musterschreiben"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zu Musterschreiben
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={template.category as 'sgb2' | 'sgb3' | 'sgb12' | 'kdu' | 'sgb10'}>
            {categoryInfo?.name}
          </Badge>
          <Badge variant="outline">{template.difficulty}</Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{template.title}</h1>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Form / Preview */}
        <div className="md:col-span-2">
          {step === 'form' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Deine Angaben</CardTitle>
                  <span className="text-sm text-muted-foreground">{filledFields}/{totalFields} Felder</span>
                </div>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-5">
                {template.requiredFields.map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id} className="mb-1.5 block">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Bitte waehlen...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      />
                    )}
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  {letterCheck.cost > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-muted flex items-start gap-2">
                      <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Kosten: {letterCheck.cost.toFixed(2).replace('.', ',')} EUR</p>
                        <p className="text-xs text-muted-foreground">
                          {letterCheck.reason || 'Fuer die Erstellung des personalisierten Schreibens.'}
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleGenerate}
                    disabled={!requiredFieldsFilled}
                    variant="amt"
                    size="lg"
                    className="w-full"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Schreiben generieren
                    {letterCheck.cost > 0 && ` (${letterCheck.cost.toFixed(2).replace('.', ',')} EUR)`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'preview' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Dein Schreiben ist fertig
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setStep('form')}>
                    Bearbeiten
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-border rounded-lg p-6 md:p-8 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {generatedLetter}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button variant="amt" size="lg" className="flex-1">
                    <Download className="mr-2 h-5 w-5" />
                    Als PDF herunterladen
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    <Send className="mr-2 h-5 w-5" />
                    Per Post senden (1,99 EUR)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Tipp: Sende den Widerspruch per Einschreiben oder gib ihn persoenlich ab!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legal Basis */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Rechtsgrundlage
              </h3>
              <div className="space-y-1">
                {template.legalBasis.map((basis) => (
                  <div key={basis} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {basis}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Wichtige Tipps
              </h3>
              <ul className="space-y-2">
                {template.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Dieses Schreiben ersetzt keine Rechtsberatung. Bei komplexen Faellen empfehlen wir eine Beratung
                  beim Sozialverband oder einer Rechtsantragstelle.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* KI Chat Link */}
          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Fragen zu diesem Thema?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Unser KI-Rechtsberater hilft dir, deine Situation besser zu verstehen.
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/chat">KI-Berater fragen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function generateDemoLetter(template: ReturnType<typeof getTemplateById>, data: Record<string, string>): string {
  if (!template) return ''

  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const name = data.name || '[Dein Name]'
  const bgNummer = data.bg_nummer || '[BG-Nummer]'
  const jobcenter = data.jobcenter || '[Jobcenter]'
  const bescheidDatum = data.bescheid_datum
    ? new Date(data.bescheid_datum).toLocaleDateString('de-DE')
    : '[Bescheiddatum]'

  let letterBody = ''

  switch (template.id) {
    case 'widerspruch_bescheid':
      letterBody = `${name}
[Deine Adresse]
[PLZ Ort]

${jobcenter}
[Adresse des Jobcenters]
[PLZ Ort]

${today}

Betreff: Widerspruch gegen Ihren Bescheid vom ${bescheidDatum}
BG-Nummer: ${bgNummer}

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Bescheid vom ${bescheidDatum}, mir zugegangen am [Datum des Zugangs], fristgerecht

                    WIDERSPRUCH

ein.

Begruendung:
${data.grund || '[Deine Begruendung wird hier eingefuegt]'}

Ich bitte um Ueberpruefung des Bescheids und um Erlass eines rechtsmittelfaehigen Widerspruchsbescheids fuer den Fall, dass meinem Widerspruch nicht abgeholfen wird.

Vorsorglich beantrage ich die Aussetzung der sofortigen Vollziehung gemaess § 86a SGG.

Eine ausfuehrliche Begruendung behalte ich mir vor.

Mit freundlichen Gruessen

${name}`
      break

    case 'widerspruch_sanktion':
      const sanktionsgrund = data.sanktionsgrund === 'termin' ? 'Meldeversaeumnis'
        : data.sanktionsgrund === 'massnahme' ? 'Nichtantritt einer Massnahme'
        : data.sanktionsgrund === 'arbeit' ? 'Nichtannahme eines Arbeitsangebots'
        : data.sanktionsgrund === 'egv' ? 'Nichterfuellung der Eingliederungsvereinbarung'
        : 'den genannten Grund'

      letterBody = `${name}
[Deine Adresse]
[PLZ Ort]

${jobcenter}
[Adresse des Jobcenters]
[PLZ Ort]

${today}

Betreff: Widerspruch gegen Sanktionsbescheid vom ${bescheidDatum}
BG-Nummer: ${bgNummer}

Sehr geehrte Damen und Herren,

hiermit lege ich gegen Ihren Sanktionsbescheid vom ${bescheidDatum} wegen ${sanktionsgrund} fristgerecht

                    WIDERSPRUCH

ein.

Die Sanktion ist rechtswidrig aus folgendem Grund:
${data.wichtiger_grund || '[Begruendung]'}

Ich hatte einen wichtigen Grund im Sinne des § 31 Abs. 1 Satz 2 SGB II, der die Pflichtverletzung entschuldigt.

Ich weise darauf hin, dass nach der aktuellen Rechtslage (Buergergeld-Gesetz) Sanktionen auf maximal 30% des Regelsatzes begrenzt sind und die Kosten der Unterkunft nicht gekuerzt werden duerfen.

Ich beantrage:
1. Aufhebung des Sanktionsbescheids
2. Weiterzahlung der ungekürzten Leistungen
3. Nachzahlung bereits einbehaltener Betraege

Mit freundlichen Gruessen

${name}`
      break

    case 'ueberpruefungsantrag':
      letterBody = `${name}
[Deine Adresse]
[PLZ Ort]

${jobcenter}
[Adresse des Jobcenters]
[PLZ Ort]

${today}

Betreff: Ueberpruefungsantrag gemaess § 44 SGB X
BG-Nummer: ${bgNummer}
Bescheid vom: ${bescheidDatum}
Bewilligungszeitraum: ${data.zeitraum || '[Zeitraum]'}

Sehr geehrte Damen und Herren,

hiermit beantrage ich gemaess § 44 SGB X die Ueberpruefung Ihres Bescheids vom ${bescheidDatum} fuer den Bewilligungszeitraum ${data.zeitraum || '[Zeitraum]'}.

Der Bescheid ist rechtswidrig:
${data.grund || '[Begruendung]'}

Ich beantrage:
1. Ueberpruefung des genannten Bescheids
2. Abänderung zugunsten des Antragstellers
3. Nachzahlung der zu Unrecht vorenthaltenen Leistungen fuer den gesamten Zeitraum (bis zu 4 Jahre, § 44 Abs. 4 SGB X)

Mit freundlichen Gruessen

${name}`
      break

    default:
      letterBody = `${name}
[Deine Adresse]
[PLZ Ort]

${jobcenter}
[Adresse des Jobcenters]
[PLZ Ort]

${today}

Betreff: ${template.title}
BG-Nummer: ${bgNummer}

Sehr geehrte Damen und Herren,

[Der Inhalt wird basierend auf Ihren Angaben generiert]

Rechtsgrundlagen: ${template.legalBasis.join(', ')}

Mit freundlichen Gruessen

${name}`
  }

  return letterBody
}
