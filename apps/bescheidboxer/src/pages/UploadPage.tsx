import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Progress } from '../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../hooks/use-toast'

type UploadStep = 'upload' | 'processing' | 'details' | 'complete'

interface UploadedFile {
  name: string
  size: number
  type: string
}

export default function UploadPage() {
  const [step, setStep] = useState<UploadStep>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [progress, setProgress] = useState(0)
  const [bescheidTyp, setBescheidTyp] = useState('')
  const [steuerjahr, setSteuerjahr] = useState('')
  const [finanzamt, setFinanzamt] = useState('')
  const [aktenzeichen, setAktenzeichen] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const processFile = (file: File) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    })
    setStep('processing')

    // Simulate OCR processing
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setStep('details')
        // Simulate auto-detection
        setBescheidTyp('einkommensteuer')
        setSteuerjahr('2024')
        setFinanzamt('Finanzamt Muenchen I')
        setAktenzeichen('123/456/78901')
      }
      setProgress(Math.min(currentProgress, 100))
    }, 300)
  }

  const handleSubmit = () => {
    if (!bescheidTyp || !steuerjahr) {
      toast({
        title: 'Fehlende Angaben',
        description: 'Bitte fuellen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      })
      return
    }

    setStep('complete')
    toast({
      title: 'Bescheid erfolgreich hochgeladen',
      description: 'Der Bescheid wird jetzt analysiert.',
    })
  }

  const resetUpload = () => {
    setStep('upload')
    setUploadedFile(null)
    setProgress(0)
    setBescheidTyp('')
    setSteuerjahr('')
    setFinanzamt('')
    setAktenzeichen('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bescheid hochladen</h1>
        <p className="text-muted-foreground mt-1">
          Laden Sie Ihren Steuerbescheid als PDF oder Foto hoch. Die KI analysiert den Bescheid automatisch.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['upload', 'processing', 'details', 'complete'] as UploadStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === s ? 'bg-primary text-primary-foreground' :
              (['upload', 'processing', 'details', 'complete'].indexOf(step) > i) ? 'bg-green-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {(['upload', 'processing', 'details', 'complete'].indexOf(step) > i) ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && <div className="flex-1 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Dokument hochladen</CardTitle>
            <CardDescription>PDF-Dateien und Bilder (JPG, PNG) werden unterstuetzt</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">Datei hier ablegen</p>
              <p className="text-sm text-muted-foreground mb-4">
                oder klicken Sie um eine Datei auszuwaehlen
              </p>
              <div className="flex gap-3">
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                    <span>
                      <FileText className="h-4 w-4" />
                      PDF auswaehlen
                    </span>
                  </Button>
                </label>
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                  />
                  <Button variant="outline" className="gap-2 cursor-pointer" asChild>
                    <span>
                      <Camera className="h-4 w-4" />
                      Foto aufnehmen
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-2">Unterstuetzte Formate</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>PDF-Dateien (max. 20 MB)</li>
                <li>Bilder: JPG, PNG (max. 10 MB)</li>
                <li>Gescannte Dokumente werden per OCR erkannt</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Step */}
      {step === 'processing' && uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Bescheid wird verarbeitet...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>OCR & Analyse</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Dokument hochgeladen</span>
              </div>
              {progress > 30 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>OCR-Texterkennung</span>
                </div>
              )}
              {progress > 60 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Bescheidtyp erkannt</span>
                </div>
              )}
              {progress > 80 && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Daten extrahieren...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Step */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Daten erkannt
                </CardTitle>
                <CardDescription>Bitte pruefen und ergaenzen Sie die erkannten Daten</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFile && (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">{uploadedFile.name}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bescheidtyp *</Label>
                <Select value={bescheidTyp} onValueChange={setBescheidTyp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswaehlen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="einkommensteuer">Einkommensteuer</SelectItem>
                    <SelectItem value="gewerbesteuer">Gewerbesteuer</SelectItem>
                    <SelectItem value="umsatzsteuer">Umsatzsteuer</SelectItem>
                    <SelectItem value="koerperschaftsteuer">Koerperschaftsteuer</SelectItem>
                    <SelectItem value="grundsteuer">Grundsteuer</SelectItem>
                    <SelectItem value="sonstige">Sonstige</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Steuerjahr *</Label>
                <Select value={steuerjahr} onValueChange={setSteuerjahr}>
                  <SelectTrigger>
                    <SelectValue placeholder="Jahr auswaehlen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2025, 2024, 2023, 2022, 2021].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Finanzamt</Label>
                <Input
                  value={finanzamt}
                  onChange={e => setFinanzamt(e.target.value)}
                  placeholder="z.B. Finanzamt Muenchen I"
                />
              </div>

              <div className="space-y-2">
                <Label>Aktenzeichen</Label>
                <Input
                  value={aktenzeichen}
                  onChange={e => setAktenzeichen(e.target.value)}
                  placeholder="z.B. 123/456/78901"
                />
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Die erkannten Daten wurden automatisch eingetragen. Bitte ueberpruefen Sie die Angaben
                und korrigieren Sie diese bei Bedarf.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Bescheid speichern & analysieren
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Erfolgreich hochgeladen!</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Ihr Bescheid wurde gespeichert und die KI-Analyse wurde gestartet.
              Sie erhalten eine Benachrichtigung sobald die Analyse abgeschlossen ist.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/bescheide')}>
                Zu den Bescheiden
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Weiteren Bescheid hochladen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
