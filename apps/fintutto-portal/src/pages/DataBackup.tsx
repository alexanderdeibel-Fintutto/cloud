import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDataBackup } from '@/hooks/useDataBackup';
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Database,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileJson,
  RefreshCw,
  Shield,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DataBackup() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isExporting,
    isImporting,
    progress,
    downloadBackup,
    importData,
    getBackupHistory,
    getStorageStats,
    clearAllData,
    formatBytes,
  } = useDataBackup();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [importResult, setImportResult] = useState<any>(null);

  const stats = useMemo(() => getStorageStats(), [getStorageStats]);
  const history = useMemo(() => getBackupHistory(), [getBackupHistory]);

  const handleExport = async () => {
    try {
      const success = await downloadBackup();
      if (success) {
        toast({
          title: 'Backup erstellt',
          description: 'Ihre Daten wurden erfolgreich exportiert',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Backup konnte nicht erstellt werden',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast({
          title: 'Ungültiges Format',
          description: 'Bitte wählen Sie eine JSON-Backup-Datei',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setImportDialogOpen(true);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const result = await importData(selectedFile, { overwrite: overwriteExisting });
    setImportResult(result);

    if (result.success) {
      toast({
        title: 'Import erfolgreich',
        description: result.message,
      });
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      toast({
        title: 'Import fehlgeschlagen',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleClearData = async () => {
    const success = await clearAllData();
    if (success) {
      toast({
        title: 'Daten gelöscht',
        description: 'Alle Daten wurden entfernt',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const resetImportDialog = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Datensicherung</h1>
          <p className="text-muted-foreground">Backup und Wiederherstellung Ihrer Daten</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatBytes(stats.used)}</p>
                <p className="text-sm text-muted-foreground">Speicherplatz</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <Database className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.items.toLocaleString('de-DE')}</p>
                <p className="text-sm text-muted-foreground">Datensätze</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.breakdown.length}</p>
                <p className="text-sm text-muted-foreground">Datenbereiche</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <History className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-sm text-muted-foreground">Backups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Daten exportieren
            </CardTitle>
            <CardDescription>
              Erstellen Sie ein vollständiges Backup aller Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Alle Buchungen und Rechnungen</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Kontakte und Bankkonten</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Einstellungen und Vorlagen</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>JSON-Format (lesbar & portabel)</span>
              </div>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Export läuft... {progress}%
                </p>
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exportiere...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Backup herunterladen
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Daten importieren
            </CardTitle>
            <CardDescription>
              Stellen Sie Daten aus einem Backup wieder her
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileJson className="h-4 w-4 text-blue-600" />
                <span>JSON-Backup-Datei auswählen</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Vorhandene Daten können überschrieben werden</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Backup-Datei auswählen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Storage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Speichernutzung nach Bereich</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.breakdown.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Daten vorhanden
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bereich</TableHead>
                  <TableHead className="text-right">Datensätze</TableHead>
                  <TableHead className="text-right">Größe</TableHead>
                  <TableHead className="w-[200px]">Anteil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.breakdown.map((item) => {
                  const percent = stats.used > 0 ? (item.size / stats.used) * 100 : 0;
                  return (
                    <TableRow key={item.key}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-right">{item.count.toLocaleString('de-DE')}</TableCell>
                      <TableCell className="text-right">{formatBytes(item.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={percent} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup-Verlauf</CardTitle>
          <CardDescription>
            Letzte Sicherungen und Wiederherstellungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Backups erstellt
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-right">Größe</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.slice(0, 10).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDistanceToNow(new Date(entry.date), { addSuffix: true, locale: de })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.type === 'manual' ? 'Manuell' : 'Automatisch'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatBytes(entry.size)}</TableCell>
                    <TableCell className="text-right">
                      {entry.status === 'success' ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Erfolgreich
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Fehlgeschlagen
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Gefahrenzone
          </CardTitle>
          <CardDescription>
            Diese Aktionen können nicht rückgängig gemacht werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Alle Daten löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion löscht alle Ihre Daten unwiderruflich.
                  Erstellen Sie vorher unbedingt ein Backup!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ja, alle Daten löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => !open && resetImportDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daten importieren</DialogTitle>
            <DialogDescription>
              {selectedFile?.name} ({selectedFile && formatBytes(selectedFile.size)})
            </DialogDescription>
          </DialogHeader>

          {!importResult ? (
            <>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vorhandene Daten überschreiben</Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn deaktiviert, werden nur neue Daten hinzugefügt
                    </p>
                  </div>
                  <Switch
                    checked={overwriteExisting}
                    onCheckedChange={setOverwriteExisting}
                  />
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        Wichtiger Hinweis
                      </p>
                      <p className="text-orange-700 dark:text-orange-300">
                        Diese Aktion kann vorhandene Daten überschreiben.
                        Stellen Sie sicher, dass Sie ein aktuelles Backup haben.
                      </p>
                    </div>
                  </div>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Import läuft... {progress}%
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetImportDialog}>
                  Abbrechen
                </Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importiere...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import starten
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                {importResult.success ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Import erfolgreich
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {importResult.restoredKeys.length} Bereiche wiederhergestellt
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">
                        Import fehlgeschlagen
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {importResult.message}
                      </p>
                    </div>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <Label>Hinweise:</Label>
                    <div className="max-h-32 overflow-y-auto text-sm space-y-1">
                      {importResult.errors.map((error: string, i: number) => (
                        <p key={i} className="text-muted-foreground">• {error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center">
                  Die Seite wird in Kürze neu geladen...
                </p>
              </div>

              <DialogFooter>
                <Button onClick={resetImportDialog}>
                  Schließen
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
