import { useState, useRef } from 'react';
import { Camera, FileText, Loader2, CheckCircle2, AlertCircle, X, FileSpreadsheet, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface DetectedReading {
  date: string;
  value: number;
}

export interface MeterEra {
  label: string;
  readings: DetectedReading[];
  swapNote: string | null;
}

interface ScanResult {
  meterNumber: string | null;
  confidence: number;
  readings: DetectedReading[];
  meterName: string | null;
  meterSwapDetected: boolean;
  eras: MeterEra[];
}

interface MeterNumberScannerProps {
  onNumberDetected: (meterNumber: string) => void;
  onReadingsDetected?: (readings: DetectedReading[], meterName: string | null) => void;
  onMeterSwapDetected?: (eras: MeterEra[], meterName: string | null) => void;
  disabled?: boolean;
}

export function MeterNumberScanner({ onNumberDetected, onReadingsDetected, onMeterSwapDetected, disabled }: MeterNumberScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Nur JPEG, PNG, WebP und PDF werden unterstützt');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Datei zu groß. Maximum 10MB.');
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (file.type.startsWith('image/')) {
        setPreview(base64);
      } else {
        setPreview(null);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Nicht angemeldet');
      }

      const response = await supabase.functions.invoke('ocr-meter-number', {
        body: { file: base64, fileType: file.type },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Verarbeitung fehlgeschlagen');
      }

      const data = response.data as ScanResult;
      setResult(data);

      if (data.meterNumber) {
        onNumberDetected(data.meterNumber);
        toast({
          title: 'Zählernummer erkannt',
          description: `Erkannte Nummer: ${data.meterNumber} (${data.confidence}% Konfidenz)`,
        });
      }

      // Handle meter swap detection
      if (data.meterSwapDetected && data.eras?.length > 1 && onMeterSwapDetected) {
        onMeterSwapDetected(data.eras, data.meterName);
      } else if (data.readings?.length > 0 && onReadingsDetected) {
        // No swap, pass flat readings
        onReadingsDetected(data.readings, data.meterName);
      }

      if (!data.meterNumber && !data.meterSwapDetected && (!data.readings || data.readings.length === 0)) {
        setError('Keine Zählernummer und keine Zählerstände gefunden.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verarbeitung fehlgeschlagen';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: message,
      });
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const openCamera = () => cameraInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();

  const clearPreview = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const hasReadingsOnly = result && !result.meterNumber && !result.meterSwapDetected && result.readings?.length > 0;
  const hasNumberAndReadings = result && result.meterNumber && result.readings?.length > 0 && !result.meterSwapDetected;
  const hasSwap = result?.meterSwapDetected && result.eras?.length > 1;
  const totalReadings = result?.eras?.reduce((sum, era) => sum + era.readings.length, 0) || result?.readings?.length || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={disabled || scanning}
          onClick={openCamera}
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          Foto
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={disabled || scanning}
          onClick={openFilePicker}
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Dokument
        </Button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || scanning}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || scanning}
      />

      <AnimatePresence>
        {(preview || result || error || scanning) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              "relative rounded-lg border p-3 space-y-2",
              result?.meterNumber && !hasSwap && "border-success/50 bg-success/5",
              hasReadingsOnly && "border-primary/50 bg-primary/5",
              hasSwap && "border-amber-500/50 bg-amber-500/5",
              error && !hasReadingsOnly && !hasSwap && "border-destructive/50 bg-destructive/5",
              scanning && "border-primary/50 bg-primary/5"
            )}>
              {preview && (
                <div className="relative mb-2">
                  <img
                    src={preview}
                    alt="Vorschau"
                    className="w-full h-32 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background"
                    onClick={clearPreview}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {scanning && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analysiere Dokument...</span>
                </div>
              )}

              {result?.meterNumber && !hasSwap && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div>
                    <span className="font-medium text-success">Zählernummer erkannt: </span>
                    <span className="font-mono">{result.meterNumber}</span>
                    <span className="text-muted-foreground ml-2">
                      ({result.confidence}% sicher)
                    </span>
                  </div>
                </div>
              )}

              {/* Meter swap detected */}
              {hasSwap && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        Zählerwechsel erkannt!
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    {result.eras.length} Zähler-Zeiträume mit insgesamt {totalReadings} Ablesungen gefunden.
                    Bitte geben Sie die aktuelle Zählernummer ein – alle Zeiträume werden als verkettete Zähler angelegt.
                  </p>
                  <div className="pl-6 space-y-1">
                    {result.eras.map((era, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          i === result.eras.length - 1 ? "bg-primary" : "bg-muted-foreground/50"
                        )} />
                        <span className="text-muted-foreground">
                          {era.label} – {era.readings.length} Ablesungen
                          {era.swapNote && <span className="italic ml-1">({era.swapNote})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Readings only (no swap) */}
              {hasReadingsOnly && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="font-medium text-primary">
                        {result.readings.length} Zählerstände erkannt
                      </span>
                      {result.meterName && (
                        <span className="text-muted-foreground ml-1">
                          ({result.meterName})
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    Keine Zählernummer gefunden. Bitte geben Sie die Zählernummer manuell ein – 
                    die erkannten Zählerstände werden nach dem Anlegen automatisch importiert.
                  </p>
                </div>
              )}

              {hasNumberAndReadings && (
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-primary font-medium">
                    + {result.readings.length} Zählerstände erkannt (werden importiert)
                  </span>
                </div>
              )}

              {error && !scanning && !hasReadingsOnly && !hasSwap && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">
        Fotografieren Sie den Zähler oder laden Sie ein Dokument hoch – Zählernummer, Zählerstände und Zählerwechsel werden automatisch erkannt.
      </p>
    </div>
  );
}
