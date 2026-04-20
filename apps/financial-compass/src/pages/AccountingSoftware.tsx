import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import {
  useAccountingSoftware,
  AccountingSoftware as AccountingSoftwareType,
  ImportExportFormat,
  SyncDirection,
} from '@/hooks/useAccountingSoftware';
import {
  Upload,
  Download,
  Plus,
  Settings,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Link2,
  Unlink,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  FileUp,
  FileDown,
  History,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function AccountingSoftware() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    connections,
    importTemplates,
    exportTemplates,
    syncLogs,
    loading,
    processing,
    createConnection,
    deleteConnection,
    createImportTemplate,
    deleteImportTemplate,
    deleteExportTemplate,
    importData,
    exportData,
    getSoftwareInfo,
    getStats,
  } = useAccountingSoftware();

  const [activeTab, setActiveTab] = useState('connections');
  const [newConnectionOpen, setNewConnectionOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [importFile, setImportFile] = useState<File | null>(null);

  const [newConnection, setNewConnection] = useState({
    software: 'lexware' as AccountingSoftwareType,
    name: '',
    version: '',
    sync_direction: 'both' as SyncDirection,
  });

  const stats = getStats();

  const handleCreateConnection = () => {
    if (!newConnection.name) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie einen Namen ein', variant: 'destructive' });
      return;
    }

    createConnection(newConnection);
    setNewConnectionOpen(false);
    setNewConnection({ software: 'lexware', name: '', version: '', sync_direction: 'both' });
    toast({ title: 'Verbindung erstellt', description: `${newConnection.name} wurde hinzugefügt` });
  };

  const handleImport = async () => {
    if (!selectedConnection || !selectedTemplate || !importFile) {
      toast({ title: 'Fehler', description: 'Bitte wählen Sie alle Optionen', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await importData(selectedConnection, selectedTemplate, content, importFile.name);

      if (result.success) {
        toast({
          title: 'Import erfolgreich',
          description: `${result.imported} von ${result.total_rows} Datensätzen importiert`,
        });
      } else {
        toast({
          title: 'Import teilweise fehlgeschlagen',
          description: `${result.errors.length} Fehler aufgetreten`,
          variant: 'destructive',
        });
      }

      setImportDialogOpen(false);
      setImportFile(null);
      setSelectedConnection('');
      setSelectedTemplate('');
    };
    reader.readAsText(importFile);
  };

  const handleExport = async () => {
    if (!selectedConnection || !selectedTemplate) {
      toast({ title: 'Fehler', description: 'Bitte wählen Sie alle Optionen', variant: 'destructive' });
      return;
    }

    const result = await exportData(selectedConnection, selectedTemplate);

    if (result.success) {
      // Download file
      const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export erfolgreich',
        description: `${result.recordCount} Datensätze exportiert als ${result.fileName}`,
      });
    }

    setExportDialogOpen(false);
    setSelectedConnection('');
    setSelectedTemplate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Verbunden</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><Unlink className="h-3 w-3 mr-1" /> Getrennt</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Fehler</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Erfolgreich</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Teilweise</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Buchhaltungssoftware</h1>
          <p className="text-muted-foreground">Lexware, SAGE, DATEV Import/Export</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daten importieren</DialogTitle>
                <DialogDescription>
                  Importieren Sie Daten aus Ihrer Buchhaltungssoftware
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Verbindung</Label>
                  <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Verbindung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.filter(c => c.status === 'connected').map(conn => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Import-Vorlage</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vorlage wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {importTemplates.map(tpl => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Datei</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xml,.txt,.json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground">
                      Ausgewählt: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleImport} disabled={processing}>
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importiere...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importieren
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daten exportieren</DialogTitle>
                <DialogDescription>
                  Exportieren Sie Daten für Ihre Buchhaltungssoftware
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Verbindung</Label>
                  <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Verbindung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.filter(c => c.status === 'connected').map(conn => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Export-Vorlage</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vorlage wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {exportTemplates.map(tpl => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.format.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleExport} disabled={processing}>
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Exportiere...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exportieren
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newConnectionOpen} onOpenChange={setNewConnectionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neue Verbindung
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Verbindung</DialogTitle>
                <DialogDescription>
                  Verbinden Sie Ihre Buchhaltungssoftware
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Software</Label>
                  <Select
                    value={newConnection.software}
                    onValueChange={(v) => setNewConnection({ ...newConnection, software: v as AccountingSoftwareType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lexware">Lexware Financial Office</SelectItem>
                      <SelectItem value="sage">SAGE 50</SelectItem>
                      <SelectItem value="datev">DATEV Unternehmen Online</SelectItem>
                      <SelectItem value="sevdesk">sevDesk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="z.B. Lexware Hauptbuchhaltung"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version (optional)</Label>
                  <Input
                    placeholder="z.B. 2024"
                    value={newConnection.version}
                    onChange={(e) => setNewConnection({ ...newConnection, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sync-Richtung</Label>
                  <Select
                    value={newConnection.sync_direction}
                    onValueChange={(v) => setNewConnection({ ...newConnection, sync_direction: v as SyncDirection })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="import">Nur Import</SelectItem>
                      <SelectItem value="export">Nur Export</SelectItem>
                      <SelectItem value="both">Import & Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewConnectionOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateConnection}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Verbinden
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeConnections}</p>
                <p className="text-sm text-muted-foreground">Aktive Verbindungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <FileUp className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalImported.toLocaleString('de-DE')}</p>
                <p className="text-sm text-muted-foreground">Importiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <FileDown className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalExported.toLocaleString('de-DE')}</p>
                <p className="text-sm text-muted-foreground">Exportiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <FileSpreadsheet className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.importTemplates + stats.exportTemplates}</p>
                <p className="text-sm text-muted-foreground">Vorlagen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connections">
            <Link2 className="h-4 w-4 mr-2" />
            Verbindungen
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Vorlagen
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Verlauf
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {connections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Keine Verbindungen</h3>
                <p className="text-muted-foreground mb-4">
                  Verbinden Sie Ihre Buchhaltungssoftware für Import/Export
                </p>
                <Button onClick={() => setNewConnectionOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Verbindung erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {connections.map((conn) => {
                const info = getSoftwareInfo(conn.software);
                return (
                  <Card key={conn.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${info.color} text-white`}>
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{conn.name}</h3>
                              {getStatusBadge(conn.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {info.fullName} {conn.version && `(${conn.version})`}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ArrowRightLeft className="h-3 w-3" />
                                {conn.sync_direction === 'both' ? 'Import & Export' :
                                  conn.sync_direction === 'import' ? 'Nur Import' : 'Nur Export'}
                              </span>
                              {conn.last_import_at && (
                                <span className="flex items-center gap-1">
                                  <Upload className="h-3 w-3" />
                                  Import: {formatDistanceToNow(new Date(conn.last_import_at), { addSuffix: true, locale: de })}
                                </span>
                              )}
                              {conn.last_export_at && (
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  Export: {formatDistanceToNow(new Date(conn.last_export_at), { addSuffix: true, locale: de })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4 hidden sm:block">
                            <p className="text-sm">
                              <span className="text-green-600 font-medium">{conn.imported_count}</span> importiert
                            </p>
                            <p className="text-sm">
                              <span className="text-blue-600 font-medium">{conn.exported_count}</span> exportiert
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedConnection(conn.id);
                              setImportDialogOpen(true);
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedConnection(conn.id);
                              setExportDialogOpen(true);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              deleteConnection(conn.id);
                              toast({ title: 'Verbindung gelöscht' });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Import Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import-Vorlagen
              </CardTitle>
              <CardDescription>
                Vorlagen für den Datenimport aus externen Systemen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importTemplates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Import-Vorlagen vorhanden
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Software</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Felder</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importTemplates.map((tpl) => {
                      const info = getSoftwareInfo(tpl.software);
                      return (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">{tpl.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${info.color} text-white`}>
                              {info.name}
                            </Badge>
                          </TableCell>
                          <TableCell>{tpl.format.toUpperCase()}</TableCell>
                          <TableCell>{tpl.field_mappings.length} Felder</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                deleteImportTemplate(tpl.id);
                                toast({ title: 'Vorlage gelöscht' });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Export Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export-Vorlagen
              </CardTitle>
              <CardDescription>
                Vorlagen für den Datenexport zu externen Systemen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exportTemplates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Export-Vorlagen vorhanden
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Software</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Datentyp</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportTemplates.map((tpl) => {
                      const info = getSoftwareInfo(tpl.software);
                      const dataTypeLabels = {
                        transactions: 'Buchungen',
                        invoices: 'Rechnungen',
                        contacts: 'Kontakte',
                        accounts: 'Konten',
                      };
                      return (
                        <TableRow key={tpl.id}>
                          <TableCell className="font-medium">{tpl.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${info.color} text-white`}>
                              {info.name}
                            </Badge>
                          </TableCell>
                          <TableCell>{tpl.format.toUpperCase()}</TableCell>
                          <TableCell>{dataTypeLabels[tpl.data_type]}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                deleteExportTemplate(tpl.id);
                                toast({ title: 'Vorlage gelöscht' });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sync-Verlauf</CardTitle>
              <CardDescription>
                Historie aller Import- und Export-Vorgänge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Sync-Vorgänge durchgeführt
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Typ</TableHead>
                      <TableHead>Datei</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datensätze</TableHead>
                      <TableHead>Zeitpunkt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.type === 'import' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                              <Upload className="h-3 w-3 mr-1" />
                              Import
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.file_name || '-'}
                        </TableCell>
                        <TableCell>{getSyncStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{log.records_processed}</span>
                          {log.records_failed > 0 && (
                            <span className="text-destructive ml-1">
                              / {log.records_failed} fehlerhaft
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(log.completed_at), { addSuffix: true, locale: de })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
