import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Loader2, Check, AlertCircle, Camera, X, Plus, Zap } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS,
  formatNumber, formatEuro,
} from '@/types/database';

interface ExtractedMeter {
  meterNumber: string;
  meterType: MeterType;
  readingValue: number | null;
  readingDate: string | null;
  consumption: number | null;
  unit: string;
  costAmount: number | null;
  confidence: number;
  matched: boolean;
  matchedMeterId?: string;
}

interface InvoiceData {
  provider: string;
  invoiceNumber: string;
  invoiceDate: string;
  periodFrom: string;
  periodTo: string;
  totalAmount: number;
  meters: ExtractedMeter[];
}

type Step = 'upload' | 'processing' | 'review' | 'done';

export default function InvoiceOCRDialog() {
  const navigate = useNavigate();
  const { buildings, createReading } = useBuildings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  // All meters for matching
  const allMeters = buildings.flatMap(b => [
    ...(b.meters || []),
    ...b.units.flatMap(u => u.meters),
  ]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process
    setStep('processing');

    try {
      const base64 = await fileToBase64(file);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Nicht angemeldet');

      const response = await supabase.functions.invoke('ocr-invoice', {
        body: {
          file: base64,
          fileType: file.type,
          prompt: `Analysiere diese Rechnung/Abrechnung und extrahiere folgende Informationen im JSON-Format:
{
  "provider": "Name des Energieversorgers",
  "invoiceNumber": "Rechnungsnummer",
  "invoiceDate": "Rechnungsdatum (YYYY-MM-DD)",
  "periodFrom": "Abrechnungszeitraum von (YYYY-MM-DD)",
  "periodTo": "Abrechnungszeitraum bis (YYYY-MM-DD)",
  "totalAmount": Gesamtbetrag als Zahl,
  "meters": [
    {
      "meterNumber": "Zählernummer",
      "meterType": "electricity|gas|water_cold|water_hot|heating|district_heating",
      "readingValue": Zählerstand als Zahl oder null,
      "readingDate": "Ablesedatum (YYYY-MM-DD)" oder null,
      "consumption": Verbrauch als Zahl oder null,
      "unit": "kWh|m³|Liter",
      "costAmount": Kosten als Zahl oder null,
      "confidence": Konfidenz 0-1
    }
  ]
}
Extrahiere ALLE Zähler die auf der Rechnung zu finden sind.`,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const extractedData = response.data as InvoiceData;

      // Match extracted meters with existing meters
      if (extractedData.meters) {
        extractedData.meters = extractedData.meters.map(em => {
          const match = allMeters.find(m =>
            m.meter_number.replace(/\s/g, '').toLowerCase() === em.meterNumber.replace(/\s/g, '').toLowerCase()
          );
          return {
            ...em,
            matched: !!match,
            matchedMeterId: match?.id,
          };
        });
      }

      setInvoiceData(extractedData);
      setStep('review');
    } catch (error) {
      console.error('Invoice OCR error:', error);

      // Demo/Fallback data for when Edge Function is not available
      const demoData: InvoiceData = {
        provider: 'Stadtwerke München',
        invoiceNumber: 'RE-2025-123456',
        invoiceDate: '2025-12-15',
        periodFrom: '2025-01-01',
        periodTo: '2025-12-31',
        totalAmount: 1847.32,
        meters: [
          {
            meterNumber: 'STR-001',
            meterType: 'electricity',
            readingValue: 45230,
            readingDate: '2025-12-10',
            consumption: 3200,
            unit: 'kWh',
            costAmount: 1024.00,
            confidence: 0.95,
            matched: false,
          },
          {
            meterNumber: 'GAS-001',
            meterType: 'gas',
            readingValue: 12450,
            readingDate: '2025-12-10',
            consumption: 1200,
            unit: 'm³',
            costAmount: 823.32,
            confidence: 0.88,
            matched: false,
          },
        ],
      };

      // Try to match with existing meters
      demoData.meters = demoData.meters.map(em => {
        const match = allMeters.find(m =>
          m.meter_number.replace(/\s/g, '').toLowerCase() === em.meterNumber.replace(/\s/g, '').toLowerCase()
        );
        return { ...em, matched: !!match, matchedMeterId: match?.id };
      });

      setInvoiceData(demoData);
      setStep('review');

      toast({
        title: 'OCR-Dienst nicht verfügbar',
        description: 'Demo-Daten werden angezeigt. Im Produktivbetrieb werden echte Rechnungsdaten extrahiert.',
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Import matched readings
  const handleImport = async () => {
    if (!invoiceData) return;
    setImporting(true);

    let success = 0;
    let failed = 0;

    for (const meter of invoiceData.meters) {
      if (!meter.matched || !meter.matchedMeterId || !meter.readingValue) continue;

      try {
        await createReading.mutateAsync({
          meter_id: meter.matchedMeterId,
          reading_date: meter.readingDate || invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
          reading_value: meter.readingValue,
          source: 'ocr' as const,
          confidence: meter.confidence,
          is_verified: false,
        });
        success++;
      } catch {
        failed++;
      }
    }

    setImportResults({ success, failed });
    setStep('done');
    setImporting(false);

    toast({
      title: 'Import abgeschlossen',
      description: `${success} Ablesung(en) importiert${failed > 0 ? `, ${failed} fehlgeschlagen` : ''}.`,
    });
  };

  // Update meter number in extracted data
  const updateMeterNumber = (index: number, value: string) => {
    if (!invoiceData) return;
    const updated = { ...invoiceData };
    updated.meters = [...updated.meters];
    updated.meters[index] = { ...updated.meters[index], meterNumber: value };

    // Re-match
    const match = allMeters.find(m =>
      m.meter_number.replace(/\s/g, '').toLowerCase() === value.replace(/\s/g, '').toLowerCase()
    );
    updated.meters[index].matched = !!match;
    updated.meters[index].matchedMeterId = match?.id;

    setInvoiceData(updated);
  };

  // Update reading value
  const updateReadingValue = (index: number, value: number) => {
    if (!invoiceData) return;
    const updated = { ...invoiceData };
    updated.meters = [...updated.meters];
    updated.meters[index] = { ...updated.meters[index], readingValue: value };
    setInvoiceData(updated);
  };

  const matchedCount = invoiceData?.meters.filter(m => m.matched && m.readingValue).length || 0;

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Rechnungserkennung
      </h1>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Rechnung hochladen</p>
                <p className="text-xs text-muted-foreground">
                  Foto oder PDF der Energierechnung aufnehmen oder auswählen
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                  capture="environment"
                />
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <Camera className="w-4 h-4 mr-1" />Kamera
                  </Button>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <Upload className="w-4 h-4 mr-1" />Datei
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">So funktioniert's:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Fotografieren Sie Ihre Energierechnung oder laden Sie ein PDF hoch</li>
                <li>Die KI erkennt automatisch Zählernummern, Stände und Kosten</li>
                <li>Überprüfen Sie die erkannten Daten und korrigieren Sie bei Bedarf</li>
                <li>Importieren Sie die Ablesungen direkt in Ihre Zähler</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <Card>
          <CardContent className="p-8 text-center">
            {imagePreview && (
              <img src={imagePreview} alt="Rechnung" className="max-h-40 mx-auto rounded-lg mb-4 opacity-50" />
            )}
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm font-medium">Rechnung wird analysiert...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Die KI erkennt Zähler, Stände und Kosten
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === 'review' && invoiceData && (
        <div className="space-y-4">
          {/* Invoice header */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rechnungsdaten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Versorger</span>
                  <p className="font-medium">{invoiceData.provider || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Rechnungsnr.</span>
                  <p className="font-medium">{invoiceData.invoiceNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Zeitraum</span>
                  <p className="font-medium">
                    {invoiceData.periodFrom && invoiceData.periodTo
                      ? `${invoiceData.periodFrom} – ${invoiceData.periodTo}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Gesamtbetrag</span>
                  <p className="font-bold text-primary">{formatEuro(invoiceData.totalAmount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted meters */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium">Erkannte Zähler ({invoiceData.meters.length})</h2>
            {invoiceData.meters.map((meter, i) => (
              <Card key={i} className={meter.matched ? 'border-green-500/30' : 'border-amber-500/30'}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {meter.matched ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {METER_TYPE_LABELS[meter.meterType] || meter.meterType}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Konfidenz: {Math.round(meter.confidence * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Zählernummer</Label>
                      <Input
                        value={meter.meterNumber}
                        onChange={(e) => updateMeterNumber(i, e.target.value)}
                        className="h-7 text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Zählerstand</Label>
                      <Input
                        type="number"
                        value={meter.readingValue || ''}
                        onChange={(e) => updateReadingValue(i, parseFloat(e.target.value))}
                        className="h-7 text-xs mt-0.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                    {meter.consumption != null && (
                      <span>Verbr.: {formatNumber(meter.consumption)} {meter.unit}</span>
                    )}
                    {meter.costAmount != null && (
                      <span>Kosten: {formatEuro(meter.costAmount)}</span>
                    )}
                    {meter.readingDate && (
                      <span>Datum: {meter.readingDate}</span>
                    )}
                  </div>

                  {!meter.matched && (
                    <p className="text-[10px] text-amber-500 mt-1">
                      Kein passender Zähler gefunden. Nummer prüfen oder Zähler zuerst anlegen.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setStep('upload'); setInvoiceData(null); setImagePreview(null); }}>
              <X className="w-4 h-4 mr-1" />Verwerfen
            </Button>
            <Button
              className="flex-1"
              disabled={matchedCount === 0 || importing}
              onClick={handleImport}
            >
              {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              {matchedCount} Ablesung(en) importieren
            </Button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold mb-2">Import abgeschlossen</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {importResults.success} Ablesung(en) erfolgreich importiert
              {importResults.failed > 0 && `, ${importResults.failed} fehlgeschlagen`}.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => { setStep('upload'); setInvoiceData(null); setImagePreview(null); }}>
                Weitere Rechnung
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Zum Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
