import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { METER_TYPE_UNITS, MeterType } from '@/types/database';

interface ParsedRow {
  date: string;
  value: number;
  originalRow: Record<string, string>;
}

interface ImportReadingsWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meterId: string;
  meterType: MeterType;
  existingDates: string[];
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing';

export function ImportReadingsWizard({
  open,
  onOpenChange,
  meterId,
  meterType,
  existingDates,
}: ImportReadingsWizardProps) {
  const { createReading } = useBuildings();
  const { toast } = useToast();

  const [step, setStep] = useState<WizardStep>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dateColumn, setDateColumn] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const resetWizard = useCallback(() => {
    setStep('upload');
    setIsProcessing(false);
    setRawData([]);
    setColumns([]);
    setDateColumn('');
    setValueColumn('');
    setParsedRows([]);
    setImportProgress(0);
    setImportedCount(0);
  }, []);

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'csv') {
        // Parse CSV locally
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('Datei enthält keine Daten');
        
        const headers = lines[0].split(/[;,\t]/).map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(/[;,\t]/).map(v => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(v => v));

        setColumns(headers);
        setRawData(rows);
        
        // Auto-detect columns
        const dateCols = headers.filter(h => 
          /datum|date|zeit|time/i.test(h)
        );
        const valueCols = headers.filter(h => 
          /stand|wert|value|reading|verbrauch|kwh|m³|cbm/i.test(h)
        );
        
        if (dateCols.length > 0) setDateColumn(dateCols[0]);
        if (valueCols.length > 0) setValueColumn(valueCols[0]);
        
        setStep('mapping');
      } else if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'pdf') {
        // Send to edge function for parsing
        const formData = new FormData();
        formData.append('file', file);

        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-meter-import`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Fehler beim Verarbeiten der Datei');
        }

        const result = await response.json();
        
        if (!result.data || result.data.length === 0) {
          throw new Error('Keine Daten in der Datei gefunden');
        }

        setColumns(result.columns);
        setRawData(result.data);
        
        // Auto-detect columns
        if (result.suggestedDateColumn) setDateColumn(result.suggestedDateColumn);
        if (result.suggestedValueColumn) setValueColumn(result.suggestedValueColumn);
        
        setStep('mapping');
      } else {
        throw new Error('Nicht unterstütztes Dateiformat. Bitte CSV, Excel oder PDF verwenden.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Lesen der Datei',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
    }

    setIsProcessing(false);
    e.target.value = '';
  };

  const handleMapping = () => {
    if (!dateColumn || !valueColumn) {
      toast({
        variant: 'destructive',
        title: 'Bitte wählen Sie Spalten aus',
        description: 'Datum und Zählerstand müssen zugeordnet werden.',
      });
      return;
    }

    const parsed: ParsedRow[] = [];
    
    for (const row of rawData) {
      const dateStr = row[dateColumn];
      const valueStr = row[valueColumn];
      
      if (!dateStr || !valueStr) continue;
      
      // Parse date
      let date: Date | null = null;
      
      // Try various date formats
      const datePatterns = [
        /^(\d{4})-(\d{2})-(\d{2})/, // ISO
        /^(\d{2})\.(\d{2})\.(\d{4})/, // DD.MM.YYYY
        /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
        /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
      ];
      
      for (const pattern of datePatterns) {
        const match = dateStr.match(pattern);
        if (match) {
          if (pattern === datePatterns[0]) {
            date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
          } else if (pattern === datePatterns[1] || pattern === datePatterns[3]) {
            date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
            // Assume DD/MM/YYYY for European format
            date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          }
          break;
        }
      }
      
      if (!date || isNaN(date.getTime())) continue;
      
      // Parse value
      const cleanValue = valueStr.replace(/[^\d.,]/g, '').replace(',', '.');
      const value = parseFloat(cleanValue);
      
      if (isNaN(value)) continue;
      
      parsed.push({
        date: date.toISOString().split('T')[0],
        value,
        originalRow: row,
      });
    }

    if (parsed.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keine gültigen Daten',
        description: 'Es konnten keine gültigen Zählerstände erkannt werden.',
      });
      return;
    }

    // Sort by date
    parsed.sort((a, b) => a.date.localeCompare(b.date));
    
    setParsedRows(parsed);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);
    setImportedCount(0);

    let imported = 0;
    const total = parsedRows.length;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      
      try {
        await createReading.mutateAsync({
          meter_id: meterId,
          reading_value: row.value,
          reading_date: row.date,
          source: 'api', // Mark as imported
        });
        imported++;
      } catch (error) {
        console.error('Error importing row:', row, error);
      }
      
      setImportProgress(Math.round(((i + 1) / total) * 100));
      setImportedCount(imported);
    }

    toast({
      title: 'Import abgeschlossen',
      description: `${imported} von ${total} Ablesungen wurden importiert.`,
    });

    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const duplicateCount = parsedRows.filter(r => existingDates.includes(r.date)).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Historische Daten importieren
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {(['upload', 'mapping', 'preview', 'importing'] as WizardStep[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : s === 'importing' && step !== 'importing'
                    ? 'bg-muted text-muted-foreground'
                    : parsedRows.length > 0 && i < ['upload', 'mapping', 'preview', 'importing'].indexOf(step)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Laden Sie eine Datei mit historischen Zählerständen hoch. 
                Unterstützte Formate: CSV, Excel (XLSX, XLS), PDF.
              </p>

              <Card className="border-dashed">
                <CardContent className="p-8">
                  <label className="flex flex-col items-center gap-4 cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground">Datei wird verarbeitet...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <div className="text-center">
                          <p className="font-medium">Datei auswählen</p>
                          <p className="text-sm text-muted-foreground">
                            oder hier ablegen
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <FileSpreadsheet className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p>CSV</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <FileSpreadsheet className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p>Excel</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-red-600" />
                  <p>PDF</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ordnen Sie die Spalten Ihrer Datei den entsprechenden Feldern zu.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum-Spalte</Label>
                  <Select value={dateColumn} onValueChange={setDateColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Spalte wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zählerstand-Spalte ({METER_TYPE_UNITS[meterType]})</Label>
                  <Select value={valueColumn} onValueChange={setValueColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Spalte wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {rawData.length > 0 && (
                <div className="mt-4">
                  <Label className="mb-2 block">Vorschau der Rohdaten ({rawData.length} Zeilen)</Label>
                  <ScrollArea className="h-48 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.slice(0, 5).map(col => (
                            <TableHead 
                              key={col}
                              className={
                                col === dateColumn ? 'bg-blue-50 dark:bg-blue-950' :
                                col === valueColumn ? 'bg-green-50 dark:bg-green-950' : ''
                              }
                            >
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rawData.slice(0, 5).map((row, i) => (
                          <TableRow key={i}>
                            {columns.slice(0, 5).map(col => (
                              <TableCell 
                                key={col}
                                className={
                                  col === dateColumn ? 'bg-blue-50 dark:bg-blue-950' :
                                  col === valueColumn ? 'bg-green-50 dark:bg-green-950' : ''
                                }
                              >
                                {row[col]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {parsedRows.length} Ablesungen erkannt
                </Badge>
                {duplicateCount > 0 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {duplicateCount} Duplikate
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-64 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead className="text-right">Zählerstand</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row, i) => {
                      const isDuplicate = existingDates.includes(row.date);
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            {isDuplicate ? (
                              <Badge variant="outline" className="text-amber-600">
                                Überschreiben
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600">
                                Neu
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(row.date).toLocaleDateString('de-DE')}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.value.toLocaleString('de-DE')} {METER_TYPE_UNITS[meterType]}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>

              {duplicateCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Duplikate gefunden</p>
                    <p>{duplicateCount} Ablesungen existieren bereits für diese Daten und werden überschrieben.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                {importProgress < 100 ? (
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                ) : (
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
                )}
              </div>

              <Progress value={importProgress} className="h-2" />

              <p className="text-center text-muted-foreground">
                {importProgress < 100
                  ? `Importiere... ${importedCount} von ${parsedRows.length}`
                  : `Import abgeschlossen! ${importedCount} Ablesungen importiert.`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
              <Button onClick={handleMapping} disabled={!dateColumn || !valueColumn}>
                Weiter
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zurück
              </Button>
              <Button onClick={handleImport}>
                {parsedRows.length} Ablesungen importieren
              </Button>
            </>
          )}

          {(step === 'upload' || step === 'importing') && (
            <Button variant="outline" onClick={handleClose} disabled={step === 'importing' && importProgress < 100}>
              {step === 'importing' && importProgress === 100 ? 'Schließen' : 'Abbrechen'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
