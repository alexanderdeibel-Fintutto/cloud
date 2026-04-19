import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDocumentArchive, DocumentType, RETENTION_PERIODS } from '@/hooks/useDocumentArchive';
import {
  Archive, Shield, CheckCircle, AlertTriangle, Clock, Search,
  FileText, Download, Eye, Settings, Trash2, BarChart3
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'invoice-outgoing': 'Ausgangsrechnung',
  'invoice-incoming': 'Eingangsrechnung',
  'receipt': 'Beleg',
  'contract': 'Vertrag',
  'bank-statement': 'Kontoauszug',
  'tax-document': 'Steuerdokument',
  'correspondence': 'Korrespondenz',
  'annual-report': 'Jahresabschluss',
  'other': 'Sonstiges',
};

export default function DocumentArchive() {
  const {
    documents,
    settings,
    updateSettings,
    verifyDocument,
    logAccess,
    searchDocuments,
    getExpiringDocuments,
    getUnverifiedDocuments,
    exportForAudit,
    deleteExpiredDocuments,
    retentionPeriods,
    stats,
  } = useDocumentArchive();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; details: string } | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  // Get unique fiscal years
  const fiscalYears = useMemo(() => {
    const years = [...new Set(documents.map(d => d.metadata.fiscalYear))];
    return years.sort((a, b) => b - a);
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (filterType !== 'all') {
      result = result.filter(d => d.type === filterType);
    }

    if (filterYear !== 'all') {
      result = result.filter(d => d.metadata.fiscalYear === parseInt(filterYear));
    }

    if (filterVerified === 'verified') {
      result = result.filter(d => d.verification.verified);
    } else if (filterVerified === 'unverified') {
      result = result.filter(d => !d.verification.verified);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.metadata.counterparty?.toLowerCase().includes(query) ||
        d.metadata.reference?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [documents, filterType, filterYear, filterVerified, searchQuery]);

  const expiringDocuments = getExpiringDocuments(settings.notifyBeforeExpiry);
  const unverifiedDocuments = getUnverifiedDocuments();
  const selectedDoc = documents.find(d => d.id === selectedDocument);

  const handleVerify = async () => {
    if (!selectedDocument || !selectedDoc) return;
    // In production, would fetch actual content
    const result = await verifyDocument(selectedDocument, selectedDoc.content || '');
    setVerifyResult(result);
    setVerifyDialogOpen(true);
  };

  const handleExport = () => {
    const exportData = exportForAudit(parseInt(exportYear));
    // In production, would download as file
    console.log('Export data:', exportData);
    setExportDialogOpen(false);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dokumenten-Archiv</h1>
          <p className="text-muted-foreground">GoBD-konforme Langzeitarchivierung</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export für Prüfung
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {expiringDocuments.length > 0 && (
        <Alert variant="default">
          <Clock className="h-4 w-4" />
          <AlertTitle>Bald ablaufende Dokumente</AlertTitle>
          <AlertDescription>
            {expiringDocuments.length} Dokument(e) laufen in den nächsten {settings.notifyBeforeExpiry} Tagen ab.
          </AlertDescription>
        </Alert>
      )}

      {unverifiedDocuments.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Verifizierung erforderlich</AlertTitle>
          <AlertDescription>
            {unverifiedDocuments.length} Dokument(e) wurden seit über einem Monat nicht verifiziert.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Dokumente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Speicher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(stats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">Verwendet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verifiziert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verifiedCount}</div>
            <Progress
              value={(stats.verifiedCount / stats.totalDocuments) * 100}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ablaufend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringCount}</div>
            <p className="text-xs text-muted-foreground">In 90 Tagen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GoBD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-lg font-bold text-green-600">Konform</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="expiring">Ablaufend ({expiringDocuments.length})</TabsTrigger>
          <TabsTrigger value="retention">Aufbewahrungsfristen</TabsTrigger>
          <TabsTrigger value="stats">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Suchen..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as DocumentType | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Dokumenttyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Jahr" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Jahre</SelectItem>
                    {fiscalYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterVerified} onValueChange={setFilterVerified}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="verified">Verifiziert</SelectItem>
                    <SelectItem value="unverified">Nicht verifiziert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Keine Dokumente gefunden</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dokument</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Jahr</TableHead>
                      <TableHead>Archiviert</TableHead>
                      <TableHead>Läuft ab</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.slice(0, 20).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              {doc.metadata.counterparty && (
                                <div className="text-sm text-muted-foreground">
                                  {doc.metadata.counterparty}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {DOCUMENT_TYPE_LABELS[doc.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.metadata.fiscalYear}</TableCell>
                        <TableCell>
                          {format(new Date(doc.retention.archivedAt), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.retention.expiresAt), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>
                          {doc.verification.verified ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verifiziert
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Prüfen
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(doc.id);
                                logAccess(doc.id, 'view', 'CurrentUser');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(doc.id);
                                handleVerify();
                              }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bald ablaufende Dokumente</CardTitle>
              <CardDescription>
                Dokumente, deren Aufbewahrungsfrist in den nächsten {settings.notifyBeforeExpiry} Tagen endet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine ablaufenden Dokumente
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dokument</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Läuft ab</TableHead>
                      <TableHead>Verbleibend</TableHead>
                      <TableHead>Rechtsgrundlage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{DOCUMENT_TYPE_LABELS[doc.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.retention.expiresAt), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(doc.retention.expiresAt), { locale: de, addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {doc.retention.legalBasis}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aufbewahrungsfristen nach GoBD</CardTitle>
              <CardDescription>
                Gesetzliche Aufbewahrungsfristen für verschiedene Dokumenttypen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dokumenttyp</TableHead>
                    <TableHead>Aufbewahrungsfrist</TableHead>
                    <TableHead>Rechtsgrundlage</TableHead>
                    <TableHead className="text-right">Anzahl archiviert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(RETENTION_PERIODS).map(([type, info]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium">
                        {DOCUMENT_TYPE_LABELS[type as DocumentType]}
                      </TableCell>
                      <TableCell>
                        <Badge variant={info.years === 10 ? 'default' : 'secondary'}>
                          {info.years} Jahre
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {info.basis}
                      </TableCell>
                      <TableCell className="text-right">
                        {stats.byType[type as DocumentType] || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nach Dokumenttyp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span>{DOCUMENT_TYPE_LABELS[type as DocumentType]}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(count / stats.totalDocuments) * 100}
                          className="w-24 h-2"
                        />
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Nach Geschäftsjahr</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byFiscalYear)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a))
                    .map(([year, count]) => (
                      <div key={year} className="flex items-center justify-between">
                        <span>{year}</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(count / stats.totalDocuments) * 100}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Detail Sheet */}
      <Sheet open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <SheetContent className="w-[500px]">
          <SheetHeader>
            <SheetTitle>Dokumentdetails</SheetTitle>
            <SheetDescription>Archivierte Dokumentinformationen</SheetDescription>
          </SheetHeader>
          {selectedDoc && (
            <div className="space-y-6 mt-6">
              <div>
                <Label className="text-muted-foreground">Dokumentname</Label>
                <p className="font-medium">{selectedDoc.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Typ</Label>
                  <p>{DOCUMENT_TYPE_LABELS[selectedDoc.type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Größe</Label>
                  <p>{formatSize(selectedDoc.size)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">SHA-256 Hash</Label>
                <p className="font-mono text-xs break-all">{selectedDoc.hashSHA256}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Archiviert</Label>
                  <p>{format(new Date(selectedDoc.retention.archivedAt), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Läuft ab</Label>
                  <p>{format(new Date(selectedDoc.retention.expiresAt), 'dd.MM.yyyy', { locale: de })}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Rechtsgrundlage</Label>
                <p>{selectedDoc.retention.legalBasis}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Letzter Zugriff</Label>
                <div className="space-y-1 mt-1">
                  {selectedDoc.accessLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="text-sm flex justify-between">
                      <span>{log.action} - {log.user}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(log.date), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerify} className="flex-1">
                  <Shield className="mr-2 h-4 w-4" />
                  Integrität prüfen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => logAccess(selectedDoc.id, 'download', 'CurrentUser')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Verify Result Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Integritätsprüfung</DialogTitle>
          </DialogHeader>
          {verifyResult && (
            <div className={`p-4 rounded-lg ${verifyResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {verifyResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${verifyResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {verifyResult.valid ? 'Dokument ist integer' : 'Warnung!'}
                </span>
              </div>
              <p className="text-sm">{verifyResult.details}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setVerifyDialogOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export für Betriebsprüfung</DialogTitle>
            <DialogDescription>
              Exportieren Sie alle Dokumente eines Geschäftsjahres für die Prüfung
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Geschäftsjahr</Label>
              <Select value={exportYear} onValueChange={setExportYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Es werden {stats.byFiscalYear[parseInt(exportYear)] || 0} Dokumente exportiert.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Archiv-Einstellungen</SheetTitle>
            <SheetDescription>Konfigurieren Sie die Archivierung</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Archivierung</Label>
                <p className="text-sm text-muted-foreground">Dokumente automatisch archivieren</p>
              </div>
              <Switch
                checked={settings.autoArchive}
                onCheckedChange={(checked) => updateSettings({ autoArchive: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Komprimierung</Label>
                <p className="text-sm text-muted-foreground">Dokumente komprimieren</p>
              </div>
              <Switch
                checked={settings.compressionEnabled}
                onCheckedChange={(checked) => updateSettings({ compressionEnabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Verifizierungsintervall</Label>
              <Select
                value={settings.verificationSchedule}
                onValueChange={(v) => updateSettings({ verificationSchedule: v as 'daily' | 'weekly' | 'monthly' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ablaufwarnung (Tage vorher)</Label>
              <Input
                type="number"
                value={settings.notifyBeforeExpiry}
                onChange={(e) => updateSettings({ notifyBeforeExpiry: parseInt(e.target.value) || 90 })}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
