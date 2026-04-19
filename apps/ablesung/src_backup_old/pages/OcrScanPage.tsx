import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ScanLine, Upload, ArrowLeft, FileImage, X, CheckCircle2,
  AlertTriangle, Zap, Flame, Droplets, ThermometerSun, Loader2,
  FileText, Copy, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { processImageFile, processOcrText, BILL_TYPE_LABELS, type OcrBillResult, type BillType } from '@/lib/ocr'

const BILL_TYPE_ICONS: Record<BillType, typeof Zap> = {
  strom: Zap,
  gas: Flame,
  wasser: Droplets,
  fernwaerme: ThermometerSun,
  heizoel: Flame,
}

const BILL_TYPE_COLORS: Record<BillType, string> = {
  strom: 'bg-yellow-100 text-yellow-700',
  gas: 'bg-orange-100 text-orange-700',
  wasser: 'bg-blue-100 text-blue-700',
  fernwaerme: 'bg-red-100 text-red-700',
  heizoel: 'bg-amber-100 text-amber-700',
}

export default function OcrScanPage() {
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<OcrBillResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualText, setManualText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file)
    setError(null)
    setResult(null)
    setProcessing(true)

    try {
      const ocrResult = await processImageFile(file)
      setResult(ocrResult)
    } catch {
      setError('Fehler beim Verarbeiten der Datei. Bitte versuche es erneut.')
    } finally {
      setProcessing(false)
    }
  }, [])

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

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleManualSubmit = () => {
    if (!manualText.trim()) return
    setProcessing(true)
    setError(null)

    setTimeout(() => {
      try {
        const ocrResult = processOcrText(manualText)
        setResult(ocrResult)
      } catch {
        setError('Fehler beim Verarbeiten des Textes.')
      } finally {
        setProcessing(false)
      }
    }, 800)
  }

  const reset = () => {
    setResult(null)
    setSelectedFile(null)
    setError(null)
    setManualText('')
    setProcessing(false)
  }

  const BillTypeIcon = result ? BILL_TYPE_ICONS[result.billType] : Zap

  return (
    <div>
      {/* Hero */}
      <section className="gradient-energy py-12">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <ScanLine className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Rechnungs-OCR</h1>
              <p className="text-white/80">Versorger-Rechnung scannen und automatisch auswerten</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Upload Area */}
            <div className="space-y-6">
              {!result && !processing && (
                <>
                  {/* Drag & Drop Zone */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Rechnung hochladen
                      </CardTitle>
                      <CardDescription>
                        Lade ein Bild oder PDF deiner Versorger-Rechnung hoch
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                          dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileImage className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Datei hierhin ziehen oder klicken
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unterstützt: JPG, PNG, PDF (max. 10 MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Text Input */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Oder: Text manuell eingeben
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setManualMode(!manualMode)}>
                          {manualMode ? 'Schließen' : 'Öffnen'}
                        </Button>
                      </div>
                    </CardHeader>
                    {manualMode && (
                      <CardContent>
                        <textarea
                          className="w-full h-48 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
                          placeholder={`Beispiel:\nRechnungsnummer: R-2025-1234\nVersorger: Vattenfall\nStrom\nKundennummer: KD-123456\nZählernummer: Z-98765\nVerbrauch: 3.200 kWh\nGesamtbetrag: 1.152,00 EUR\nAbschläge: 1.080,00 EUR`}
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                        />
                        <Button onClick={handleManualSubmit} disabled={!manualText.trim()} className="mt-3">
                          <ScanLine className="h-4 w-4 mr-2" />
                          Text analysieren
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                </>
              )}

              {/* Processing State */}
              {processing && (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold mb-2">Rechnung wird verarbeitet...</h3>
                    <p className="text-sm text-muted-foreground">
                      OCR-Erkennung läuft. Dies kann einige Sekunden dauern.
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Datei: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {error && (
                <Card className="border-destructive/30">
                  <CardContent className="py-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fehler bei der Erkennung</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button onClick={reset} variant="outline">Erneut versuchen</Button>
                  </CardContent>
                </Card>
              )}

              {/* Result Display */}
              {result && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Erkannte Rechnungsdaten</h2>
                    <Button variant="outline" size="sm" onClick={reset}>
                      <X className="h-4 w-4 mr-1" />
                      Neue Rechnung
                    </Button>
                  </div>

                  {/* Provider & Type */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${BILL_TYPE_COLORS[result.billType]}`}>
                            <BillTypeIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{result.provider}</h3>
                            <p className="text-sm text-muted-foreground">
                              {BILL_TYPE_LABELS[result.billType]} - {result.billNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            result.confidence >= 80
                              ? 'bg-green-100 text-green-700'
                              : result.confidence >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {result.confidence >= 80 ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            {result.confidence}% Konfidenz
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Data */}
                  {result.customer.customerNumber && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Kundendaten</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {result.customer.name && (
                            <div>
                              <p className="text-muted-foreground">Name</p>
                              <p className="font-medium">{result.customer.name}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Kundennummer</p>
                            <p className="font-medium">{result.customer.customerNumber}</p>
                          </div>
                          {result.customer.address && (
                            <div className="col-span-2">
                              <p className="text-muted-foreground">Adresse</p>
                              <p className="font-medium">{result.customer.address}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Meter & Consumption */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Zähler & Verbrauch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Zählernummer</p>
                          <p className="font-semibold text-sm mt-1">{result.meter.meterNumber || '—'}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Alter Stand</p>
                          <p className="font-semibold text-sm mt-1">
                            {result.meter.readingStart.toLocaleString('de-DE')} {result.meter.unit}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Neuer Stand</p>
                          <p className="font-semibold text-sm mt-1">
                            {result.meter.readingEnd.toLocaleString('de-DE')} {result.meter.unit}
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <p className="text-xs text-primary">Verbrauch</p>
                          <p className="font-bold text-lg text-primary mt-1">
                            {result.meter.consumption.toLocaleString('de-DE')}
                          </p>
                          <p className="text-xs text-primary">{result.meter.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Costs Breakdown */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Kostenaufstellung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Grundpreis</span>
                          <span>{formatCurrency(result.costs.basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Verbrauchskosten</span>
                          <span>{formatCurrency(result.costs.consumptionPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Steuern & Abgaben</span>
                          <span>{formatCurrency(result.costs.taxes)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-semibold">
                          <span>Gesamtbetrag</span>
                          <span>{formatCurrency(result.costs.totalGross)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Geleistete Abschläge</span>
                          <span>-{formatCurrency(result.costs.prepayments)}</span>
                        </div>
                        <div className={`border-t pt-3 flex justify-between font-bold text-lg ${
                          result.costs.balance > 0 ? 'text-destructive' : 'text-green-600'
                        }`}>
                          <span>{result.costs.balance > 0 ? 'Nachzahlung' : 'Guthaben'}</span>
                          <span>{formatCurrency(Math.abs(result.costs.balance))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button className="flex-1 gradient-energy text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Daten kopieren
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Unterstützte Rechnungstypen</h3>
                  <div className="space-y-3">
                    {(['strom', 'gas', 'wasser', 'fernwaerme', 'heizoel'] as BillType[]).map((type) => {
                      const Icon = BILL_TYPE_ICONS[type]
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${BILL_TYPE_COLORS[type]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{BILL_TYPE_LABELS[type]}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Tipps für bessere Erkennung</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Gute Beleuchtung beim Fotografieren
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Gesamte Rechnung im Bild erfassen
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Möglichst gerade halten (kein Winkel)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      PDF-Rechnungen liefern beste Ergebnisse
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Erkannte Versorger</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatische Erkennung für 15+ deutsche Versorger:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Vattenfall', 'E.ON', 'EnBW', 'RWE', 'Stadtwerke', 'eprimo', 'LichtBlick', 'Yello'].map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
