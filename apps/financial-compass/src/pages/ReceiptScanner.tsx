import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useReceiptScanner, ScannedReceipt } from '@/hooks/useReceiptScanner';
import {
  Camera,
  Upload,
  Scan,
  FileImage,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Edit2,
  Save,
  X,
  RefreshCw,
  Settings,
  Zap,
  CameraOff,
  ImagePlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ReceiptScanner() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    scannedReceipts,
    settings,
    isScanning,
    isAnalyzing,
    cameraError,
    videoRef,
    canvasRef,
    loadData,
    startCamera,
    stopCamera,
    scanReceipt,
    processUploadedImage,
    analyzeExistingReceipt,
    updateExtractedData,
    markAsSaved,
    deleteScannedReceipt,
    updateSettings,
    getStats,
  } = useReceiptScanner();

  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedReceipt, setSelectedReceipt] = useState<ScannedReceipt | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = getStats();

  const handleStartCamera = async () => {
    const success = await startCamera();
    if (!success) {
      toast({
        title: 'Kamera-Fehler',
        description: cameraError || 'Kamera konnte nicht gestartet werden',
        variant: 'destructive',
      });
    }
  };

  const handleCapture = async () => {
    const receipt = await scanReceipt();
    if (receipt) {
      toast({
        title: 'Beleg erfasst',
        description: receipt.status === 'analyzed'
          ? 'Beleg wurde analysiert und ist bereit zur Überprüfung'
          : 'Beleg wurde gespeichert',
      });
      stopCamera();
      setActiveTab('history');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ungültiges Format',
        description: 'Bitte laden Sie ein Bild hoch',
        variant: 'destructive',
      });
      return;
    }

    const receipt = await processUploadedImage(file);
    if (receipt) {
      toast({
        title: 'Beleg hochgeladen',
        description: receipt.status === 'analyzed'
          ? 'Beleg wurde analysiert und ist bereit zur Überprüfung'
          : 'Beleg wurde gespeichert',
      });
      setActiveTab('history');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (receiptId: string) => {
    const success = await analyzeExistingReceipt(receiptId);
    if (success) {
      toast({ title: 'Analyse abgeschlossen' });
    } else {
      toast({ title: 'Analyse fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleSaveReceipt = (receiptId: string) => {
    markAsSaved(receiptId);
    toast({ title: 'Als Beleg gespeichert', description: 'Der Beleg wurde in Ihre Belege übernommen' });
  };

  const handleEdit = (receipt: ScannedReceipt) => {
    setSelectedReceipt(receipt);
    setEditData(receipt.extracted_data || {});
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (selectedReceipt) {
      updateExtractedData(selectedReceipt.id, editData);
      toast({ title: 'Änderungen gespeichert' });
    }
    setEditMode(false);
    setSelectedReceipt(null);
  };

  const handleDelete = (receiptId: string) => {
    deleteScannedReceipt(receiptId);
    toast({ title: 'Scan gelöscht' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Ausstehend</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Verarbeitung</Badge>;
      case 'analyzed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle2 className="h-3 w-3 mr-1" /> Analysiert</Badge>;
      case 'saved':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"><Save className="h-3 w-3 mr-1" /> Gespeichert</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Fehler</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Beleg-Scanner</h1>
          <p className="text-muted-foreground">Belege mit der Kamera erfassen und automatisch analysieren</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.analyzed}</p>
                <p className="text-sm text-muted-foreground">Analysiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Save className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.saved}</p>
                <p className="text-sm text-muted-foreground">Gespeichert</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                <p className="text-sm text-muted-foreground">Genauigkeit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scanner">
            <Camera className="h-4 w-4 mr-2" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileImage className="h-4 w-4 mr-2" />
            Verlauf ({scannedReceipts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    </div>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Analysiere Beleg...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={stopCamera}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Abbrechen
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCapture}
                      disabled={isAnalyzing}
                      className="px-8"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Aufnehmen
                    </Button>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Positionieren Sie den Beleg innerhalb des Rahmens
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Beleg scannen</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Fotografieren Sie Ihre Belege mit der Kamera oder laden Sie bestehende Bilder hoch.
                      Die KI analysiert automatisch die wichtigsten Daten.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="h-5 w-5 mr-2" />
                      Bild hochladen
                    </Button>
                    <Button size="lg" onClick={handleStartCamera}>
                      <Camera className="h-5 w-5 mr-2" />
                      Kamera starten
                    </Button>
                  </div>
                  {cameraError && (
                    <div className="flex items-center justify-center gap-2 text-destructive">
                      <CameraOff className="h-4 w-4" />
                      <span className="text-sm">{cameraError}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {scannedReceipts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Keine gescannten Belege</h3>
                <p className="text-muted-foreground mb-4">
                  Scannen oder laden Sie Belege hoch, um sie hier zu sehen
                </p>
                <Button onClick={() => setActiveTab('scanner')}>
                  <Camera className="h-4 w-4 mr-2" />
                  Beleg scannen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {scannedReceipts.map((receipt) => (
                <Card key={receipt.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumbnail */}
                      <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={receipt.image_data}
                          alt="Beleg"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setEditMode(false);
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">
                              {receipt.extracted_data?.vendor_name || receipt.image_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(receipt.scan_date), { addSuffix: true, locale: de })}
                            </p>
                          </div>
                          {getStatusBadge(receipt.status)}
                        </div>

                        {receipt.extracted_data && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Datum:</span>{' '}
                              <span className="font-medium">
                                {receipt.extracted_data.receipt_date || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Betrag:</span>{' '}
                              <span className="font-medium text-green-600">
                                {receipt.extracted_data.total_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">MwSt:</span>{' '}
                              <span className="font-medium">
                                {receipt.extracted_data.tax_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Kategorie:</span>{' '}
                              <span className="font-medium">{receipt.extracted_data.category || '-'}</span>
                            </div>
                          </div>
                        )}

                        {receipt.confidence_score && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${receipt.confidence_score * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(receipt.confidence_score * 100)}% Genauigkeit
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setEditMode(false);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ansehen
                          </Button>
                          {receipt.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAnalyze(receipt.id)}
                              disabled={isAnalyzing}
                            >
                              <Scan className="h-4 w-4 mr-1" />
                              Analysieren
                            </Button>
                          )}
                          {receipt.status === 'analyzed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(receipt)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Bearbeiten
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveReceipt(receipt.id)}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Als Beleg speichern
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(receipt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View/Edit Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Beleg bearbeiten' : 'Beleg-Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedReceipt?.extracted_data?.vendor_name || selectedReceipt?.image_name}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedReceipt.image_data}
                  alt="Beleg"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Data */}
              <div className="space-y-4">
                {editMode ? (
                  <>
                    <div className="space-y-2">
                      <Label>Händler</Label>
                      <Input
                        value={editData.vendor_name || ''}
                        onChange={(e) => setEditData({ ...editData, vendor_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Datum</Label>
                      <Input
                        type="date"
                        value={editData.receipt_date || ''}
                        onChange={(e) => setEditData({ ...editData, receipt_date: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gesamtbetrag</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.total_amount || ''}
                          onChange={(e) => setEditData({ ...editData, total_amount: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>MwSt</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.tax_amount || ''}
                          onChange={(e) => setEditData({ ...editData, tax_amount: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kategorie</Label>
                      <Select
                        value={editData.category || ''}
                        onValueChange={(v) => setEditData({ ...editData, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Büromaterial">Büromaterial</SelectItem>
                          <SelectItem value="Lebensmittel">Lebensmittel</SelectItem>
                          <SelectItem value="Elektronik">Elektronik</SelectItem>
                          <SelectItem value="Möbel">Möbel</SelectItem>
                          <SelectItem value="Reisekosten">Reisekosten</SelectItem>
                          <SelectItem value="Bewirtung">Bewirtung</SelectItem>
                          <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Belegnummer</Label>
                      <Input
                        value={editData.receipt_number || ''}
                        onChange={(e) => setEditData({ ...editData, receipt_number: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {selectedReceipt.extracted_data ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-muted-foreground">Händler</Label>
                          <p className="font-medium">{selectedReceipt.extracted_data.vendor_name || '-'}</p>
                          {selectedReceipt.extracted_data.vendor_address && (
                            <p className="text-sm text-muted-foreground">{selectedReceipt.extracted_data.vendor_address}</p>
                          )}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Datum</Label>
                            <p className="font-medium">{selectedReceipt.extracted_data.receipt_date || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Belegnummer</Label>
                            <p className="font-medium">{selectedReceipt.extracted_data.receipt_number || '-'}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Nettobetrag</Label>
                            <p className="font-medium">
                              {selectedReceipt.extracted_data.net_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">MwSt ({selectedReceipt.extracted_data.tax_rate}%)</Label>
                            <p className="font-medium">
                              {selectedReceipt.extracted_data.tax_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Gesamtbetrag</Label>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedReceipt.extracted_data.total_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) || '-'}
                          </p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Kategorie</Label>
                            <p className="font-medium">{selectedReceipt.extracted_data.category || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Zahlungsart</Label>
                            <p className="font-medium">{selectedReceipt.extracted_data.payment_method || '-'}</p>
                          </div>
                        </div>
                        {selectedReceipt.extracted_data.items && selectedReceipt.extracted_data.items.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-muted-foreground">Positionen</Label>
                              <div className="mt-2 space-y-2">
                                {selectedReceipt.extracted_data.items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">
                                      {item.total_price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Noch nicht analysiert</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                  Schließen
                </Button>
                {selectedReceipt?.status === 'analyzed' && (
                  <Button onClick={() => {
                    handleEdit(selectedReceipt);
                  }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scanner-Einstellungen</DialogTitle>
            <DialogDescription>
              Konfigurieren Sie den Beleg-Scanner
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Analyse</Label>
                <p className="text-sm text-muted-foreground">
                  Belege nach dem Scannen automatisch analysieren
                </p>
              </div>
              <Switch
                checked={settings.auto_analyze}
                onCheckedChange={(v) => updateSettings({ auto_analyze: v })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Bildqualität</Label>
              <Select
                value={settings.image_quality}
                onValueChange={(v: any) => updateSettings({ image_quality: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig (schneller)</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch (beste Qualität)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bevorzugte Kamera</Label>
              <Select
                value={settings.preferred_camera}
                onValueChange={(v: any) => updateSettings({ preferred_camera: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">Rückkamera</SelectItem>
                  <SelectItem value="user">Frontkamera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Standard-Kategorie</Label>
              <Select
                value={settings.default_category}
                onValueChange={(v) => updateSettings({ default_category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Büromaterial">Büromaterial</SelectItem>
                  <SelectItem value="Lebensmittel">Lebensmittel</SelectItem>
                  <SelectItem value="Elektronik">Elektronik</SelectItem>
                  <SelectItem value="Reisekosten">Reisekosten</SelectItem>
                  <SelectItem value="Bewirtung">Bewirtung</SelectItem>
                  <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
