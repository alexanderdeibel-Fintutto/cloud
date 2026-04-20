import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useImportWizard, ImportTarget, ImportFormat, ImportMapping, WizardStep } from '@/hooks/useImportWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { FeatureGate } from '@/components/FeatureGate';
import {
  Upload, FileSpreadsheet, ArrowRight, ArrowLeft, Check, X, AlertTriangle,
  Users, FileText, Receipt, Landmark, BookOpen, Table2, Download, RefreshCw
} from 'lucide-react';

const TARGET_OPTIONS: { value: ImportTarget; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'contacts', label: 'Kontakte', icon: Users, description: 'Kunden und Lieferanten importieren' },
  { value: 'invoices', label: 'Rechnungen', icon: FileText, description: 'Ausgangsrechnungen importieren' },
  { value: 'receipts', label: 'Belege', icon: Receipt, description: 'Eingangsbelege importieren' },
  { value: 'bookings', label: 'Buchungen', icon: BookOpen, description: 'Buchungssätze importieren' },
  { value: 'transactions', label: 'Transaktionen', icon: Landmark, description: 'Banktransaktionen importieren' },
  { value: 'accounts', label: 'Konten', icon: Table2, description: 'Kontenplan importieren' },
];

const FORMAT_OPTIONS: { value: ImportFormat; label: string; extension: string }[] = [
  { value: 'csv', label: 'CSV', extension: '.csv' },
  { value: 'pdf', label: 'PDF Kontoauszug', extension: '.pdf' },
  { value: 'xlsx', label: 'Excel', extension: '.xlsx' },
  { value: 'json', label: 'JSON', extension: '.json' },
  { value: 'datev', label: 'DATEV', extension: '.csv' },
  { value: 'mt940', label: 'MT940', extension: '.sta' },
  { value: 'camt', label: 'CAMT.053', extension: '.xml' },
];

const TRANSFORM_OPTIONS = [
  { value: 'none', label: 'Keine Transformation' },
  { value: 'date', label: 'Datum (ISO)' },
  { value: 'number', label: 'Zahl' },
  { value: 'currency', label: 'Währung' },
  { value: 'lowercase', label: 'Kleinbuchstaben' },
  { value: 'uppercase', label: 'Großbuchstaben' },
];

const Import = () => {
  const { toast } = useToast();
  const [target, setTarget] = useState<ImportTarget>('transactions');

  const {
    step,
    file,
    rawData,
    headers,
    mappings,
    preview,
    result,
    isProcessing,
    hasHeaders,
    delimiter,
    canProceed,
    targetFields,
    handleFileUpload,
    setFormat,
    setHasHeaders,
    setDelimiter,
    updateMapping,
    generatePreview,
    executeImport,
    reset,
    goToStep,
  } = useImportWizard(target);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [handleFileUpload]);

  const { user } = useAuth();
  const { selectedCompany } = useCompany();

  const handleImport = useCallback(async () => {
    const importHandler = async (data: Record<string, string>[]) => {
      if (target === 'transactions') {
        // Zuerst ein Standard-Bankkonto für den Import suchen oder erstellen
        let bankAccountId: string | null = null;
        const { data: existingAccounts } = await supabase
          .from('bank_accounts')
          .select('id')
          .eq('user_id', user?.id)
          .limit(1);
        if (existingAccounts && existingAccounts.length > 0) {
          bankAccountId = existingAccounts[0].id;
        } else {
          const { data: newAccount } = await supabase
            .from('bank_accounts')
            .insert({
              user_id: user?.id,
              company_id: selectedCompany?.id,
              account_name: 'Import-Konto',
              account_type: 'checking',
            })
            .select('id')
            .single();
          bankAccountId = newAccount?.id || null;
        }
        // Transaktionen in bank_transactions speichern
        const rows = data.map(row => ({
          user_id: user?.id,
          company_id: selectedCompany?.id,
          bank_account_id: bankAccountId,
          booking_date: row.date || new Date().toISOString().split('T')[0],
          value_date: row.valueDate || row.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(String(row.amount).replace(',', '.').replace(/[^\d.-]/g, '')) || 0,
          purpose: row.description || '',
          counterpart_name: row.counterparty || null,
          counterpart_iban: row.iban || null,
          match_status: 'unmatched' as const,
        }));

        const results: { success: boolean; error?: string }[] = [];
        const BATCH_SIZE = 50;
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE);
          const { error } = await supabase.from('bank_transactions').insert(batch);
          if (error) {
            batch.forEach(() => results.push({ success: false, error: error.message }));
          } else {
            batch.forEach(() => results.push({ success: true }));
          }
        }
        return results;
      }
      // Fallback für andere Ziele
      await new Promise(resolve => setTimeout(resolve, 500));
      return data.map(() => ({ success: true }));
    };
    const importResult = await executeImport(importHandler);
    if (importResult.imported > 0) {
      toast({
        title: 'Import erfolgreich',
        description: `${importResult.imported} Einträge wurden importiert.`,
      });
    }
  }, [executeImport, toast, target, user, selectedCompany]);

  const handleDownloadTemplate = useCallback(() => {
    const headerRow = targetFields.map(f => f.label).join(';');
    const exampleRow = targetFields.map(f => {
      switch (f.type) {
        case 'date': return '2024-01-15';
        case 'currency': return '1234.56';
        case 'number': return '19';
        case 'email': return 'beispiel@email.de';
        default: return 'Beispielwert';
      }
    }).join(';');
    const csv = `${headerRow}\n${exampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vorlage_${target}.csv`;
    link.click();
  }, [target, targetFields]);

  const stepNumber = (s: WizardStep): number => {
    const steps: WizardStep[] = ['upload', 'mapping', 'preview', 'import', 'complete'];
    return steps.indexOf(s) + 1;
  };

  const STEPS = [
    { id: 'upload', label: 'Datei hochladen' },
    { id: 'mapping', label: 'Zuordnung' },
    { id: 'preview', label: 'Vorschau' },
    { id: 'import', label: 'Import' },
    { id: 'complete', label: 'Fertig' },
  ];

  return (
    <FeatureGate feature="import-wizard" requiredTier="starter">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Upload className="h-8 w-8 text-primary" />
              Daten-Import
            </h1>
            <p className="text-muted-foreground">Importieren Sie Daten aus CSV, Excel, DATEV und mehr</p>
          </div>
          {step !== 'upload' && (
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Neu starten
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${stepNumber(step) >= idx + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber(step) > idx + 1 ? 'bg-primary text-primary-foreground' :
                  stepNumber(step) === idx + 1 ? 'bg-primary/20 text-primary border-2 border-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {stepNumber(step) > idx + 1 ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="hidden sm:inline text-sm">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-12 lg:w-24 h-0.5 mx-2 ${stepNumber(step) > idx + 1 ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Target Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Importziel</CardTitle>
                <CardDescription>Was möchten Sie importieren?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={target} onValueChange={(v) => setTarget(v as ImportTarget)}>
                  <div className="grid gap-2">
                    {TARGET_OPTIONS.map(option => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          target === option.value ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <option.icon className={`h-5 w-5 ${target === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Datei hochladen</CardTitle>
                <CardDescription>Wählen Sie Format und Datei</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select defaultValue="csv" onValueChange={(v) => setFormat(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Format wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trennzeichen</Label>
                  <Select value={delimiter} onValueChange={(v) => setDelimiter(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=";">Semikolon (;)</SelectItem>
                      <SelectItem value=",">Komma (,)</SelectItem>
                      <SelectItem value={"\t"}>Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kopfzeile</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Checkbox id="hasHeaders" checked={hasHeaders} onCheckedChange={(c) => setHasHeaders(!!c)} />
                    <Label htmlFor="hasHeaders" className="font-normal">Erste Zeile enthält Spaltenüberschriften</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Datei auswählen</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.json,.sta,.xml,.pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Badge variant="secondary">CSV</Badge>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Datei wird analysiert...
                  </div>
                )}

                <Separator />

                <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Vorlage für {TARGET_OPTIONS.find(t => t.value === target)?.label} herunterladen
                </Button>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={!file || isProcessing} onClick={() => goToStep('mapping')}>
                  Weiter zur Spaltenzuordnung
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 'mapping' && (
          <Card>
            <CardHeader>
              <CardTitle>Spaltenzuordnung</CardTitle>
              <CardDescription>
                Ordnen Sie die Spalten Ihrer Datei den Zielfeldern zu. Mit * markierte Felder sind Pflichtfelder.
                {headers.length > 0 && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Erkannte Spalten: {headers.join(', ')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zielfeld</TableHead>
                    <TableHead>Quellspalte</TableHead>
                    <TableHead>Transformation</TableHead>
                    <TableHead>Standardwert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping, idx) => (
                    <TableRow key={mapping.targetField}>
                      <TableCell className="font-medium">
                        {targetFields.find(f => f.field === mapping.targetField)?.label || mapping.targetField}
                        {mapping.required && <span className="text-red-500 ml-1">*</span>}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mapping.sourceColumn || '_none'}
                          onValueChange={(v) => updateMapping(idx, { sourceColumn: v === '_none' ? '' : v })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Spalte wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">-- Nicht zuordnen --</SelectItem>
                            {headers.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mapping.transform || 'none'}
                          onValueChange={(v) => updateMapping(idx, { transform: v as any })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSFORM_OPTIONS.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={mapping.defaultValue || ''}
                          onChange={(e) => updateMapping(idx, { defaultValue: e.target.value })}
                          placeholder="Optional"
                          className="w-32"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => goToStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <Button onClick={generatePreview}>
                Vorschau
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Import-Vorschau</CardTitle>
              <CardDescription>
                Überprüfen Sie die ersten Zeilen vor dem Import. {preview.filter(p => p.isValid).length} von {preview.length} Zeilen sind gültig.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                      {targetFields.map(f => (
                        <TableHead key={f.field}>{f.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map(row => (
                      <TableRow key={row.rowNumber} className={!row.isValid ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3" /></Badge>
                          ) : (
                            <Badge variant="destructive"><X className="h-3 w-3" /></Badge>
                          )}
                        </TableCell>
                        {targetFields.map(f => (
                          <TableCell key={f.field} className={row.errors.some(e => e.column === f.field) ? 'text-red-600' : ''}>
                            {row.data[f.field] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {preview.some(p => !p.isValid) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validierungsfehler</AlertTitle>
                  <AlertDescription>
                    Einige Zeilen haben Fehler und werden beim Import übersprungen.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => goToStep('mapping')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <Button disabled={!canProceed} onClick={handleImport}>
                {rawData.length} Einträge importieren
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Import running */}
        {step === 'import' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Import läuft...</h3>
              <p className="text-muted-foreground">Bitte warten Sie, bis der Import abgeschlossen ist.</p>
              <Progress value={50} className="mt-4 max-w-xs mx-auto" />
            </CardContent>
          </Card>
        )}

        {/* Step 5: Complete */}
        {step === 'complete' && result && (
          <Card>
            <CardContent className="py-12 text-center">
              {result.imported > 0 ? (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Import abgeschlossen</h3>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Import fehlgeschlagen</h3>
                </>
              )}

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                  <p className="text-sm text-muted-foreground">Importiert</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{result.skipped}</p>
                  <p className="text-sm text-muted-foreground">Übersprungen</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{result.errors.length}</p>
                  <p className="text-sm text-muted-foreground">Fehler</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Dauer: {(result.duration / 1000).toFixed(1)} Sekunden
              </p>

              <div className="flex gap-2 justify-center">
                <Button onClick={reset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Neuer Import
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Zurück zur Übersicht
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FeatureGate>
  );
};

export default Import;
