import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '@/hooks/useDocumentTitle'
import {
  ScanSearch,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Swords,
  Euro,
  Clock,
  Shield,
  X,
  Plus,
  FileImage,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreditsContext } from '@/contexts/CreditsContext'
import { supabase } from '@/integrations/supabase/client'
import {
  type BescheidPage,
  type AnalysisResult,
  createPage,
  releasePage,
  processAllPages,
  analyzeBescheidText,
  validateFile,
} from '@/lib/bescheid-ocr'
import BescheidScanner from '@/components/BescheidScanner'

interface ScanError {
  type: 'fehler' | 'warnung' | 'ok'
  title: string
  description: string
  betrag?: number
  paragraph?: string
  templateId?: string
}

interface ScanResult {
  errors: ScanError[]
  totalMissing: number
  totalOver6Months: number
  urgency: 'hoch' | 'mittel' | 'niedrig'
  fristEnde?: string
  ocrText?: string
}

/** Transform API analysis to our UI format */
function transformAnalysis(analysis: AnalysisResult): ScanResult {
  const errors: ScanError[] = [
    ...(analysis.fehler || []).map((f) => ({
      type: (f.schwere === 'kritisch' ? 'fehler' : f.schwere === 'warnung' ? 'warnung' : 'ok') as 'fehler' | 'warnung' | 'ok',
      title: f.beschreibung?.split('.')[0] || 'Fehler gefunden',
      description: f.beschreibung || '',
      paragraph: f.paragraph,
      betrag: f.potenziellerBetrag || undefined,
      templateId: f.kategorie === 'kdu' ? 'widerspruch_kdu'
        : f.kategorie === 'mehrbedarf' ? 'antrag_mehrbedarf'
        : f.kategorie === 'einkommen' ? 'widerspruch_einkommen'
        : undefined,
    })),
    ...(analysis.korrekt || []).map((k) => ({
      type: 'ok' as const,
      title: k.split('.')[0] || k,
      description: k,
    })),
  ]

  return {
    errors,
    totalMissing: analysis.gesamtPotenzial || 0,
    totalOver6Months: (analysis.gesamtPotenzial || 0) * 6,
    urgency: analysis.dringlichkeit || 'mittel',
    fristEnde: analysis.fristende || undefined,
  }
}

// Demo scan results for demonstration
function generateDemoScanResult(): ScanResult {
  return {
    errors: [
      {
        type: 'fehler',
        title: 'Mehrbedarf Alleinerziehend fehlt!',
        description: 'Du bist alleinerziehend mit 2 Kindern unter 16. Dir steht ein Mehrbedarf von 36% des Regelsatzes zu. Das sind 202,68 EUR monatlich die im Bescheid fehlen.',
        betrag: 202.68,
        paragraph: '\u00a7 21 Abs. 3 Nr. 1 SGB II',
        templateId: 'antrag_mehrbedarf',
      },
      {
        type: 'fehler',
        title: 'Heizkosten nur teilweise anerkannt',
        description: 'Die tatsaechlichen Heizkosten von 85 EUR wurden auf 65 EUR gekuerzt. Das Jobcenter muss ein schluessiges Konzept vorlegen. Ohne schluessiges Konzept muessen die tatsaechlichen Kosten uebernommen werden.',
        betrag: 20.00,
        paragraph: '\u00a7 22 Abs. 1 SGB II',
        templateId: 'widerspruch_kdu',
      },
      {
        type: 'warnung',
        title: 'Kindersofortzuschlag pruefen',
        description: 'Der Kindersofortzuschlag von 25 EUR je Kind sollte im Bescheid aufgefuehrt sein. Bitte pruefe ob dieser Betrag enthalten ist.',
        paragraph: '\u00a7 72 SGB II',
      },
      {
        type: 'ok',
        title: 'Regelsatz korrekt',
        description: 'Der Regelsatz von 563 EUR (Stufe 1) ist korrekt fuer 2025/2026.',
        paragraph: '\u00a7 20 SGB II',
      },
      {
        type: 'ok',
        title: 'Bewilligungszeitraum korrekt',
        description: 'Der Bewilligungszeitraum von 12 Monaten ist im Rahmen des Ueblichen.',
        paragraph: '\u00a7 41 Abs. 3 SGB II',
      },
    ],
    totalMissing: 222.68,
    totalOver6Months: 1336.08,
    urgency: 'hoch',
    fristEnde: '2026-03-06',
  }
}

export default function BescheidScanPage() {
  useDocumentTitle('BescheidScan - BescheidBoxer')
  const [scanState, setScanState] = useState<'upload' | 'ocr' | 'review' | 'analyzing' | 'result'>('upload')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [pages, setPages] = useState<BescheidPage[]>([])
  const [ocrText, setOcrText] = useState('')
  const [manualText, setManualText] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [showOcrText, setShowOcrText] = useState(false)
  const [scanProgress, setScanProgress] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { checkScan, useScan } = useCreditsContext()

  const addFiles = useCallback((files: FileList | File[]) => {
    setUploadError(null)
    const newPages: BescheidPage[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const validation = validateFile(file)
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
        return
      }
      newPages.push(createPage(file, pages.length + newPages.length + 1))
    })

    if (errors.length > 0) {
      setUploadError(errors.join('\n'))
    }

    if (newPages.length > 0) {
      setPages(prev => [...prev, ...newPages])
    }
  }, [pages.length])

  const removePage = (pageId: string) => {
    setPages(prev => {
      const page = prev.find(p => p.id === pageId)
      if (page) releasePage(page)
      return prev
        .filter(p => p.id !== pageId)
        .map((p, i) => ({ ...p, pageNumber: i + 1 }))
    })
  }

  const handleScanCapture = useCallback((file: File) => {
    setUploadError(null)
    const validation = validateFile(file)
    if (!validation.valid) {
      setUploadError(validation.error || 'Datei ungueltig')
      return
    }
    setPages(prev => [...prev, createPage(file, prev.length + 1)])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    e.target.value = ''
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  /** Step 1: Run OCR on all uploaded pages */
  const startOcr = async () => {
    if (pages.length === 0 && !manualText.trim()) return

    const scanCheck = checkScan()
    if (!scanCheck.allowed) return

    setScanState('ocr')
    setScanProgress('OCR-Texterkennung wird gestartet...')

    let combinedText = ''

    if (pages.length > 0) {
      setScanProgress(`${pages.length} Seiten werden per OCR gelesen...`)

      combinedText = await processAllPages(
        pages,
        (pageId, update) => {
          setPages(prev => prev.map(p => p.id === pageId ? { ...p, ...update } : p))
          if (update.status === 'processing') {
            const page = pages.find(p => p.id === pageId)
            if (page) {
              setScanProgress(`Seite ${page.pageNumber} von ${pages.length} wird gelesen...`)
            }
          }
        },
      )
    }

    // Add manual text
    if (manualText.trim()) {
      combinedText = combinedText
        ? combinedText + '\n\n[Manuell eingegebener Text]\n' + manualText.trim()
        : manualText.trim()
    }

    setOcrText(combinedText)

    // If we got text, go to review; if not, show error
    if (combinedText.trim()) {
      setScanState('review')
    } else {
      setScanState('upload')
      setUploadError('Kein Text erkannt. Bitte versuche es mit besseren Fotos oder gib den Text manuell ein.')
    }
  }

  /** Step 2: Send OCR text to AI for analysis */
  const startAnalysis = async () => {
    if (!ocrText.trim()) return

    setScanState('analyzing')
    setAnalysisError(null)
    await useScan()

    setScanProgress('Bescheid wird auf Fehler analysiert...')

    // Get Supabase URL and key from the client config
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Try to get a fresh session token for authenticated requests
    let authToken = supabaseAnonKey
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authToken = session.access_token
      }
    } catch {
      // Use anon key
    }

    const analysis = await analyzeBescheidText(ocrText, supabaseUrl, authToken)

    if (analysis) {
      const scanResult = transformAnalysis(analysis)
      scanResult.ocrText = ocrText
      setResult(scanResult)
      setScanState('result')
    } else {
      // No backend available - show the OCR text and explain
      setAnalysisError(
        'Die KI-Analyse ist derzeit nicht verfuegbar. Der OCR-Text wurde erfolgreich extrahiert. ' +
        'Du kannst den Text kopieren und im Chat besprechen, oder es spaeter erneut versuchen.'
      )
      setScanState('review')
    }
  }

  const handleDemoScan = async () => {
    const scanCheck = checkScan()
    if (!scanCheck.allowed) return

    setScanState('analyzing')
    await useScan()
    setScanProgress('Demo-Bescheid wird analysiert...')
    await new Promise((r) => setTimeout(r, 2500))
    setResult(generateDemoScanResult())
    setScanState('result')
  }

  const resetAll = () => {
    pages.forEach(releasePage)
    setPages([])
    setManualText('')
    setOcrText('')
    setShowManualInput(false)
    setShowOcrText(false)
    setShowScanner(false)
    setScanState('upload')
    setResult(null)
    setScanProgress('')
    setUploadError(null)
    setAnalysisError(null)
  }

  const errorsCount = result?.errors.filter(e => e.type === 'fehler').length || 0
  const warningsCount = result?.errors.filter(e => e.type === 'warnung').length || 0
  const canStartOcr = pages.length > 0 || manualText.trim().length > 0
  const pagesWithText = pages.filter(p => p.status === 'done' && p.extractedText && p.extractedText !== '(Kein Text erkannt)')
  const avgConfidence = pagesWithText.length > 0
    ? Math.round(pagesWithText.reduce((sum, p) => sum + p.confidence, 0) / pagesWithText.length)
    : 0

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-boxer text-white mb-4">
          <ScanSearch className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">BescheidScan</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Scanne alle Seiten deines Bescheids - unsere KI liest und prueft alles auf Fehler.
          Ein Bescheid hat oft mehrere Seiten - lade einfach alle hoch.
        </p>
      </div>

      {/* ==================== UPLOAD STATE ==================== */}
      {scanState === 'upload' && (
        <div className="space-y-6">
          {/* Scan limit warning */}
          {!checkScan().allowed && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Scan-Limit erreicht</p>
                  <p className="text-xs text-muted-foreground">{checkScan().reason}</p>
                </div>
                <Link to="/preise" className="ml-auto">
                  <Button size="sm" variant="outline">Upgrade</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Multi-page info banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Mehrseitiger Bescheid-Scanner mit OCR</p>
                <p className="text-xs text-muted-foreground">
                  Ein Bescheid besteht oft aus 4-8 Seiten (beidseitig bedruckt). Lade alle Seiten als Fotos hoch.
                  Unser OCR-Scanner (Tesseract) liest den Text automatisch aus jedem Bild - direkt in deinem Browser.
                  Danach analysiert die KI den gesamten Bescheid auf Fehler.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Drop zone for uploading pages */}
          <Card
            className={`border-dashed border-2 transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-8">
              {pages.length === 0 ? (
                <div className="text-center">
                  <Upload className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Bescheid-Seiten scannen oder hochladen</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Scanne jede Seite direkt mit der Kamera oder lade vorhandene Fotos/PDFs hoch.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="amt" size="lg" onClick={() => setShowScanner(true)}>
                      <Camera className="mr-2 h-5 w-5" />
                      Seiten scannen
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-5 w-5" />
                      Dateien hochladen
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-muted-foreground mt-4">
                    JPG, PNG, WebP, HEIC, PDF - max. 20 MB pro Datei - Mehrfachauswahl moeglich
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {pages.length} {pages.length === 1 ? 'Seite' : 'Seiten'} erfasst
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                        <Camera className="h-4 w-4 mr-1" />
                        Scannen
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Plus className="h-4 w-4 mr-1" />
                        Dateien
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Page thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="relative group border rounded-lg overflow-hidden bg-muted/50"
                      >
                        {page.previewUrl ? (
                          <img
                            src={page.previewUrl}
                            alt={`Seite ${page.pageNumber}`}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          S. {page.pageNumber}
                        </div>
                        <button
                          onClick={() => removePage(page.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="p-1.5 text-xs text-muted-foreground truncate">
                          {page.file.name}
                        </div>
                      </div>
                    ))}

                    {/* Add more button as tile */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-xs">Seite hinzufuegen</span>
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload error */}
          {uploadError && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Fehler</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{uploadError}</p>
                </div>
                <button onClick={() => setUploadError(null)} className="ml-auto">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          )}

          {/* Manual text input toggle */}
          <Card>
            <CardContent className="p-4">
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="flex items-center gap-2 w-full text-left"
              >
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Text manuell eingeben</p>
                  <p className="text-xs text-muted-foreground">
                    Alternativ oder ergaenzend: Bescheid-Text abtippen oder einfuegen
                  </p>
                </div>
                <span className="text-xs text-primary">{showManualInput ? 'Schliessen' : 'Oeffnen'}</span>
              </button>

              {showManualInput && (
                <div className="mt-4">
                  <textarea
                    className="w-full h-48 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
                    placeholder={`Gib hier den Text deines Bescheids ein oder fuege ihn ein...\n\nBeispiel:\nBewilligungsbescheid\nAktenzeichen: 123-456-789\nBewilligungszeitraum: 01.01.2026 - 31.12.2026\nRegelbedarf: 563,00 EUR\nKosten der Unterkunft: 450,00 EUR\n...`}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                  />
                  {manualText.trim() && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {manualText.trim().split(/\s+/).length} Woerter eingegeben
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start OCR button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="amt"
              size="lg"
              disabled={!canStartOcr}
              onClick={startOcr}
              className="min-w-64"
            >
              <ScanSearch className="mr-2 h-5 w-5" />
              {pages.length > 0
                ? `${pages.length} ${pages.length === 1 ? 'Seite' : 'Seiten'} scannen`
                : manualText.trim()
                  ? 'Text uebernehmen'
                  : 'Seiten hochladen um zu starten'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Der OCR-Scan laeuft komplett in deinem Browser - deine Daten verlassen dein Geraet nicht.
            </p>
          </div>

          {/* Demo Button */}
          <div className="text-center">
            <button
              onClick={handleDemoScan}
              className="text-sm text-primary hover:underline"
            >
              Demo: Beispiel-Bescheid analysieren
            </button>
          </div>

          {/* What we check */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Euro, title: 'Regelsatz', desc: 'Ist der richtige Betrag angesetzt?' },
              { icon: Shield, title: 'Mehrbedarfe', desc: 'Alleinerziehend, schwanger, krank?' },
              { icon: FileText, title: 'KdU / Miete', desc: 'Wird die volle Miete gezahlt?' },
              { icon: AlertCircle, title: 'Einkommen', desc: 'Freibetraege korrekt berechnet?' },
              { icon: Clock, title: 'Fristen', desc: 'Widerspruchsfrist noch offen?' },
              { icon: CheckCircle2, title: 'Formfehler', desc: 'Rechtsbehelfsbelehrung korrekt?' },
            ].map((item) => (
              <Card key={item.title} className="bg-muted/30">
                <CardContent className="p-4 flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================== OCR PROCESSING STATE ==================== */}
      {scanState === 'ocr' && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="relative inline-flex mb-6">
                <div className="h-20 w-20 rounded-2xl gradient-boxer flex items-center justify-center">
                  <ScanSearch className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">OCR-Texterkennung laeuft...</h2>
              <p className="text-muted-foreground mb-6">{scanProgress}</p>

              {/* Page-by-page progress */}
              {pages.length > 0 && (
                <div className="max-w-md mx-auto mb-6">
                  <div className="flex gap-1.5 justify-center flex-wrap">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          page.status === 'done'
                            ? 'bg-green-100 text-green-700'
                            : page.status === 'processing'
                            ? 'bg-blue-100 text-blue-700'
                            : page.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {page.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {page.status === 'done' && <CheckCircle2 className="h-3 w-3" />}
                        {page.status === 'error' && <AlertCircle className="h-3 w-3" />}
                        {page.status === 'pending' && <FileImage className="h-3 w-3" />}
                        S. {page.pageNumber}
                        {page.status === 'done' && page.confidence > 0 && (
                          <span className="opacity-70">({page.confidence}%)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Die Texterkennung laeuft lokal in deinem Browser (Tesseract.js).
                Deine Daten verlassen dein Geraet nicht.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== OCR REVIEW STATE ==================== */}
      {scanState === 'review' && (
        <div className="space-y-6">
          {/* OCR Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">OCR-Ergebnis</h2>
                  <p className="text-sm text-muted-foreground">
                    {pagesWithText.length} von {pages.length} Seiten erfolgreich gelesen
                    {avgConfidence > 0 && ` - Durchschnittliche Konfidenz: ${avgConfidence}%`}
                  </p>
                </div>
                {avgConfidence > 0 && (
                  <Badge variant={avgConfidence >= 70 ? 'default' : 'destructive'}>
                    {avgConfidence}% Konfidenz
                  </Badge>
                )}
              </div>

              {/* Per-page status */}
              <div className="flex gap-1.5 flex-wrap mb-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      page.status === 'done' && page.extractedText !== '(Kein Text erkannt)'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {page.status === 'done' && page.extractedText !== '(Kein Text erkannt)' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    S. {page.pageNumber}
                    {page.confidence > 0 && <span className="opacity-70">({page.confidence}%)</span>}
                  </div>
                ))}
              </div>

              {/* Extracted text preview */}
              <button
                onClick={() => setShowOcrText(!showOcrText)}
                className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
              >
                <Eye className="h-4 w-4" />
                Erkannten Text {showOcrText ? 'verbergen' : 'anzeigen'}
                {showOcrText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {showOcrText && (
                <div className="mt-2">
                  <textarea
                    className="w-full h-64 px-4 py-3 rounded-lg border border-input bg-muted/50 text-sm font-mono"
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Du kannst den erkannten Text hier korrigieren oder ergaenzen bevor die Analyse startet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis error */}
          {analysisError && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Analyse nicht verfuegbar</p>
                  <p className="text-xs text-muted-foreground">{analysisError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="amt" size="lg" onClick={startAnalysis} disabled={!ocrText.trim()}>
              <Swords className="mr-2 h-5 w-5" />
              Jetzt KI-Analyse starten
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/chat">
                <FileText className="mr-2 h-5 w-5" />
                Text im Chat besprechen
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={resetAll}>
              Zurueck
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Die KI-Analyse wird ueber unseren Server durchgefuehrt. Deine Daten werden verschluesselt uebertragen und nach der Analyse geloescht.
          </p>
        </div>
      )}

      {/* ==================== ANALYZING STATE ==================== */}
      {scanState === 'analyzing' && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="relative inline-flex mb-6">
                <div className="h-20 w-20 rounded-2xl gradient-boxer flex items-center justify-center">
                  <Swords className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">BescheidBoxer analysiert...</h2>
              <p className="text-muted-foreground mb-6">{scanProgress}</p>
              <div className="max-w-sm mx-auto space-y-3">
                {[
                  'Regelsaetze werden geprueft...',
                  'Mehrbedarfe werden analysiert...',
                  'KdU wird berechnet...',
                  'Fristen werden geprueft...',
                  'Fehler werden identifiziert...',
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationDelay: `${i * 600}ms` }}>
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== RESULT STATE ==================== */}
      {scanState === 'result' && result && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <Card className={errorsCount > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-success/40 bg-success/5'}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {errorsCount > 0 ? (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    )}
                    <h2 className="text-xl font-bold">
                      {errorsCount > 0
                        ? `${errorsCount} Fehler in deinem Bescheid gefunden!`
                        : 'Dein Bescheid sieht korrekt aus!'}
                    </h2>
                  </div>
                  {errorsCount > 0 && (
                    <p className="text-muted-foreground">
                      {warningsCount > 0 && `Plus ${warningsCount} Warnung(en) zum Pruefen. `}
                      Handlung empfohlen!
                    </p>
                  )}
                  {pages.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Analysiert: {pages.length} {pages.length === 1 ? 'Seite' : 'Seiten'}
                      {avgConfidence > 0 && ` (OCR-Konfidenz: ${avgConfidence}%)`}
                    </p>
                  )}
                </div>
                {errorsCount > 0 && result.totalMissing > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-destructive">
                      {result.totalMissing.toFixed(2).replace('.', ',')} EUR
                    </div>
                    <div className="text-sm text-muted-foreground">fehlen dir monatlich</div>
                    <div className="text-lg font-bold text-destructive mt-1">
                      {result.totalOver6Months.toFixed(2).replace('.', ',')} EUR
                    </div>
                    <div className="text-xs text-muted-foreground">ueber 6 Monate</div>
                  </div>
                )}
              </div>
              {result.fristEnde && errorsCount > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Widerspruchsfrist: bis {new Date(result.fristEnde).toLocaleDateString('de-DE')} - noch{' '}
                    {Math.ceil((new Date(result.fristEnde).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tage!
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Findings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Detaillierte Analyse</h3>
            {result.errors.map((error, i) => (
              <div
                key={i}
                className={
                  error.type === 'fehler'
                    ? 'scan-error-card'
                    : error.type === 'warnung'
                    ? 'scan-warning-card'
                    : 'scan-success-card'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {error.type === 'fehler' ? (
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      ) : error.type === 'warnung' ? (
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      )}
                      <h4 className="font-semibold">{error.title}</h4>
                      {error.betrag && (
                        <Badge variant="destructive" className="ml-auto">
                          +{error.betrag.toFixed(2).replace('.', ',')} EUR/Monat
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">{error.description}</p>
                    <div className="flex items-center gap-3 mt-2 ml-7">
                      {error.paragraph && (
                        <span className="text-xs text-primary font-medium">{error.paragraph}</span>
                      )}
                      {error.templateId && (
                        <Link
                          to={`/generator/${error.templateId}`}
                          className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Widerspruch erstellen
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show OCR text in results */}
          {ocrText && (
            <Card>
              <CardContent className="p-4">
                <button
                  onClick={() => setShowOcrText(!showOcrText)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                  Erkannter OCR-Text {showOcrText ? 'verbergen' : 'anzeigen'}
                  {showOcrText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {showOcrText && (
                  <pre className="mt-3 p-4 bg-muted/50 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {ocrText}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {errorsCount > 0 && (
            <Card className="gradient-boxer text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">Jetzt handeln!</h3>
                <p className="opacity-90 mb-4">
                  Dir fehlen {result.totalMissing.toFixed(2).replace('.', ',')} EUR pro Monat. Das sind{' '}
                  {result.totalOver6Months.toFixed(2).replace('.', ',')} EUR ueber 6 Monate.
                  Lege jetzt Widerspruch ein!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="bg-white text-red-700 hover:bg-white/90" asChild>
                    <Link to="/generator/widerspruch_bescheid">
                      <Swords className="mr-2 h-5 w-5" />
                      Widerspruch erstellen
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
                    <Link to="/chat">
                      <FileText className="mr-2 h-5 w-5" />
                      Im Chat besprechen
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Scan */}
          <div className="text-center">
            <Button variant="outline" onClick={resetAll}>
              Neuen Bescheid scannen
            </Button>
          </div>
        </div>
      )}

      {/* ==================== CAMERA SCANNER OVERLAY ==================== */}
      {showScanner && (
        <BescheidScanner
          pageCount={pages.length}
          onCapture={handleScanCapture}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
