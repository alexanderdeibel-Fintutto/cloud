import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShieldAlert,
  FileText,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'
import { useBescheidContext } from '../../contexts/BescheidContext'
import { exportEinspruchAsPdf } from '../../lib/pdf-export'
import Breadcrumbs from '../../components/Breadcrumbs'

type EinspruchStep = 'generate' | 'review' | 'complete'

export default function EinspruchNeuPage() {
  const { bescheidId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { bescheide, createEinspruch } = useBescheidContext()

  const bescheid = bescheide.find(b => b.id === bescheidId)
  const [step, setStep] = useState<EinspruchStep>('generate')
  const [generating, setGenerating] = useState(false)
  const [begruendung, setBegruendung] = useState('')
  const [absenderName, setAbsenderName] = useState('')
  const [absenderAdresse, setAbsenderAdresse] = useState('')
  const [absenderSteuerNr, setAbsenderSteuerNr] = useState('')

  if (!bescheid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bescheid nicht gefunden</h2>
        <Link to="/einspruch">
          <Button variant="outline">Zurueck zu den Einspruechen</Button>
        </Link>
      </div>
    )
  }

  const generateEinspruch = () => {
    setGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      const abweichungen = bescheid.pruefungsergebnis?.abweichungen ?? []
      const abweichungenText = abweichungen
        .filter(a => a.differenz > 0)
        .map(a => `- ${a.position}: Erklaerter Betrag ${formatCurrency(a.erklaerterBetrag)}, festgesetzter Betrag ${formatCurrency(a.festgesetzterBetrag)}. ${a.beschreibung}`)
        .join('\n')

      const generated = `Sehr geehrte Damen und Herren,

hiermit lege ich gegen den ${bescheid.titel} vom ${formatDate(bescheid.eingangsdatum)}, Aktenzeichen ${bescheid.aktenzeichen}, fristgerecht Einspruch ein.

Begruendung:

Die festgesetzte Steuer in Hoehe von ${formatCurrency(bescheid.festgesetzteSteuer)} weicht von der erklaerten Steuer in Hoehe von ${formatCurrency(bescheid.erwarteteSteuer ?? 0)} ab. Die Abweichung in Hoehe von ${formatCurrency(bescheid.abweichung ?? 0)} ist aus folgenden Gruenden nicht gerechtfertigt:

${abweichungenText}

Ich bitte um Ueberpruefung und Korrektur des Bescheids. Die entsprechenden Nachweise sind beigefuegt bzw. werden nachgereicht.

Gleichzeitig beantrage ich die Aussetzung der Vollziehung gemaess § 361 AO in Hoehe des streitigen Betrags von ${formatCurrency(bescheid.abweichung ?? 0)}.

Mit freundlichen Gruessen`

      setBegruendung(generated)
      setGenerating(false)
      setStep('review')
    }, 2000)
  }

  const handleSubmit = async () => {
    if (!begruendung.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie eine Begruendung ein.',
        variant: 'destructive',
      })
      return
    }

    // Save to Supabase
    if (bescheid) {
      await createEinspruch({
        bescheidId: bescheid.id,
        begruendung,
        forderung: bescheid.abweichung ?? 0,
        frist: bescheid.einspruchsfrist,
      })
    }

    setStep('complete')
    toast({
      title: 'Einspruch erstellt',
      description: 'Der Einspruch wurde erfolgreich gespeichert.',
    })
  }

  const copyToClipboard = () => {
    const fullText = `${absenderName}\n${absenderAdresse}\n${absenderSteuerNr ? `Steuernummer: ${absenderSteuerNr}` : ''}\n\n${bescheid.finanzamt}\n\nDatum: ${formatDate(new Date().toISOString())}\n\nAktenzeichen: ${bescheid.aktenzeichen}\n\nEinspruch gegen ${bescheid.titel}\n\n${begruendung}`

    navigator.clipboard.writeText(fullText)
    toast({
      title: 'Kopiert',
      description: 'Der Einspruch wurde in die Zwischenablage kopiert.',
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumbs items={[
        { label: 'Einsprueche', href: '/einspruch' },
        { label: 'Neuer Einspruch' },
      ]} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Einspruch erstellen</h1>
        <p className="text-muted-foreground mt-1">
          Gegen: {bescheid.titel}
        </p>
      </div>

      {/* Bescheid Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{bescheid.titel}</h3>
              <p className="text-sm text-muted-foreground">
                {bescheid.finanzamt} &middot; {bescheid.aktenzeichen}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Abweichung</p>
              <p className="text-lg font-bold text-destructive">
                +{formatCurrency(bescheid.abweichung ?? 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Step */}
      {step === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle>Einspruch generieren</CardTitle>
            <CardDescription>
              Die KI erstellt einen Einspruch basierend auf den gefundenen Abweichungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Abweichungen */}
            {bescheid.pruefungsergebnis?.abweichungen.filter(a => a.differenz > 0).map(abw => (
              <div key={abw.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-sm">{abw.position}</p>
                  <p className="text-xs text-muted-foreground">{abw.beschreibung}</p>
                </div>
                <span className="text-sm font-medium text-destructive">
                  +{formatCurrency(abw.differenz)}
                </span>
              </div>
            ))}

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ihr Name</Label>
                <Input
                  value={absenderName}
                  onChange={e => setAbsenderName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label>Steuernummer</Label>
                <Input
                  value={absenderSteuerNr}
                  onChange={e => setAbsenderSteuerNr(e.target.value)}
                  placeholder="123/456/78901"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Adresse</Label>
                <Input
                  value={absenderAdresse}
                  onChange={e => setAbsenderAdresse(e.target.value)}
                  placeholder="Musterstrasse 1, 80331 Muenchen"
                />
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={generateEinspruch}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Einspruch wird generiert...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  Einspruch generieren lassen
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Einspruch generiert
                </CardTitle>
                <CardDescription>
                  Bitte pruefen und bearbeiten Sie den generierten Einspruch
                </CardDescription>
              </div>
              <Badge variant="secondary">Entwurf</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">An: {bescheid.finanzamt}</span>
                <span className="text-muted-foreground">Aktenzeichen: {bescheid.aktenzeichen}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Frist: {formatDate(bescheid.einspruchsfrist)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Einspruchstext</Label>
              <Textarea
                value={begruendung}
                onChange={e => setBegruendung(e.target.value)}
                rows={18}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSubmit} className="gap-2 flex-1">
                <CheckCircle2 className="h-4 w-4" />
                Einspruch speichern
              </Button>
              <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                <Copy className="h-4 w-4" />
                Kopieren
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  if (!bescheid) return
                  exportEinspruchAsPdf({
                    absenderName: absenderName || 'Ihr Name',
                    absenderAdresse: absenderAdresse || 'Ihre Adresse',
                    absenderSteuerNr: absenderSteuerNr,
                    finanzamt: bescheid.finanzamt,
                    aktenzeichen: bescheid.aktenzeichen,
                    bescheidTitel: bescheid.titel,
                    bescheidDatum: bescheid.eingangsdatum,
                    begruendung,
                    abweichung: bescheid.abweichung ?? 0,
                  })
                }}
              >
                <Download className="h-4 w-4" />
                Als PDF
              </Button>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
              <strong>Hinweis:</strong> Dieser Einspruch wurde KI-gestuetzt generiert. Bitte pruefen Sie
              den Text sorgfaeltig und passen Sie ihn bei Bedarf an. Der Einspruch muss
              fristgerecht beim Finanzamt eingehen.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-green-100 dark:bg-green-900/40 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Einspruch gespeichert!</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Ihr Einspruch wurde als Entwurf gespeichert. Vergessen Sie nicht, ihn
              fristgerecht an das Finanzamt zu senden.
            </p>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 mb-6 max-w-md">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                <strong>Einspruchsfrist:</strong> {formatDate(bescheid.einspruchsfrist)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/einspruch')}>
                Zu den Einspruechen
              </Button>
              <Button variant="outline" onClick={() => navigate('/bescheide')}>
                Zu den Bescheiden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
