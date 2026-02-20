import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ScanLine,
  Camera,
  Upload,
  FileText,
  Image,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ZoomIn,
  Crop,
  Wand2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'

type ScanStep = 'upload' | 'processing' | 'preview' | 'result'

interface OcrResult {
  typ: string
  steuerjahr: string
  finanzamt: string
  aktenzeichen: string
  festgesetzteSteuer: string
  confidence: number
}

export default function DokumentScannerPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ScanStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    startProcessing()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const startProcessing = () => {
    setStep('processing')
    setProgress(0)

    // Simulate OCR processing
    const steps = [
      { progress: 15, delay: 400 },
      { progress: 35, delay: 800 },
      { progress: 55, delay: 600 },
      { progress: 75, delay: 500 },
      { progress: 90, delay: 400 },
      { progress: 100, delay: 300 },
    ]

    let totalDelay = 0
    steps.forEach(({ progress: p, delay }) => {
      totalDelay += delay
      setTimeout(() => setProgress(p), totalDelay)
    })

    setTimeout(() => {
      setOcrResult({
        typ: 'Einkommensteuer',
        steuerjahr: '2024',
        finanzamt: 'Berlin Mitte',
        aktenzeichen: '21/815/61234',
        festgesetzteSteuer: '8.432,00',
        confidence: 94,
      })
      setStep('result')
    }, totalDelay + 200)
  }

  const reset = () => {
    setStep('upload')
    setSelectedFile(null)
    setPreviewUrl(null)
    setOcrResult(null)
    setProgress(0)
  }

  const handleUebernehmen = () => {
    navigate('/schnellerfassung')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ScanLine className="h-8 w-8" />
          Dokument-Scanner
        </h1>
        <p className="text-muted-foreground mt-1">
          Bescheid fotografieren oder hochladen - KI erkennt die Daten automatisch
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Upload', 'Verarbeitung', 'Vorschau', 'Ergebnis'].map((label, i) => {
          const stepIndex = ['upload', 'processing', 'preview', 'result'].indexOf(step)
          const isActive = i === stepIndex
          const isDone = i < stepIndex
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 ${
                isDone
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'text-muted-foreground'} hidden sm:inline`}>
                {label}
              </span>
              {i < 3 && <div className="h-px flex-1 bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drag & Drop */}
          <Card
            className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-flex rounded-2xl bg-fintutto-blue-100 dark:bg-fintutto-blue-900/40 p-5 mb-4">
                  <Upload className="h-10 w-10 text-fintutto-blue-600 dark:text-fintutto-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Datei hochladen</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, JPG oder PNG hierher ziehen
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  oder klicken zum Auswaehlen
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Camera (mobile) */}
          <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-flex rounded-2xl bg-green-100 dark:bg-green-900/40 p-5 mb-4">
                  <Camera className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Foto aufnehmen</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bescheid direkt mit der Kamera scannen
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verfuegbar auf Mobilgeraeten
                </p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  id="camera-input"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Tipps fuer beste Ergebnisse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <ZoomIn className="h-4 w-4 text-fintutto-blue-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">Gute Beleuchtung und scharfes Bild</p>
                </div>
                <div className="flex items-start gap-2">
                  <Crop className="h-4 w-4 text-fintutto-blue-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">Gesamtes Dokument sichtbar</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-fintutto-blue-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">PDF liefert beste Qualitaet</p>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="h-4 w-4 text-fintutto-blue-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">Dokument gerade ausrichten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-16">
            <div className="max-w-md mx-auto text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold">Dokument wird analysiert...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {progress < 30
                  ? 'Dokument wird geladen...'
                  : progress < 60
                    ? 'OCR-Texterkennung laeuft...'
                    : progress < 90
                      ? 'Daten werden extrahiert...'
                      : 'Fast fertig...'}
              </p>
              <Progress value={progress} className="mt-6 h-2" />
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Step */}
      {step === 'result' && ocrResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Dokument-Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/50 border border-border h-[400px] flex items-center justify-center">
                  {previewUrl ? (
                    selectedFile?.type === 'application/pdf' ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs mt-1">
                          {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Bescheid-Vorschau"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm">Keine Vorschau</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* OCR Result */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Erkannte Daten
                  </CardTitle>
                  <Badge
                    variant={ocrResult.confidence >= 90 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {ocrResult.confidence >= 90 ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {ocrResult.confidence}% Konfidenz
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Steuerart', value: ocrResult.typ },
                  { label: 'Steuerjahr', value: ocrResult.steuerjahr },
                  { label: 'Finanzamt', value: ocrResult.finanzamt },
                  { label: 'Aktenzeichen', value: ocrResult.aktenzeichen },
                  { label: 'Festgesetzte Steuer', value: `${ocrResult.festgesetzteSteuer} EUR` },
                ].map(field => (
                  <div key={field.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-muted-foreground">{field.label}</span>
                    <span className="text-sm font-semibold">{field.value}</span>
                  </div>
                ))}

                <div className="pt-4 flex gap-2">
                  <Button onClick={handleUebernehmen} className="flex-1 gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Daten uebernehmen
                  </Button>
                  <Button variant="outline" onClick={reset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Neu scannen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
