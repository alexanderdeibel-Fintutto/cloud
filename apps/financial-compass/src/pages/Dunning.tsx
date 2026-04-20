import { useState } from 'react';
import {
  useDunning,
  DunningNotice,
  DunningLevel,
  DunningStatus,
} from '@/hooks/useDunning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Plus,
  Search,
  Download,
  Send,
  Mail,
  FileText,
  Settings,
  Printer,
  Euro,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const Dunning = () => {
  const { toast } = useToast();
  const {
    notices,
    settings,
    templates,
    isLoading,
    updateSettings,
    updateTemplate,
    createNotice,
    updateNotice,
    deleteNotice,
    markAsSent,
    markAsPaid,
    cancelNotice,
    generateDunningText,
    getByStatus,
    getSummary,
    exportNotices,
  } = useDunning();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DunningStatus | 'all'>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<DunningNotice | null>(null);
  const [templateEditOpen, setTemplateEditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DunningLevel | null>(null);

  const summary = getSummary();
  const draftNotices = getByStatus('draft');
  const sentNotices = getByStatus('sent');

  const filteredNotices = notices.filter(n => {
    const matchesSearch = searchQuery === '' ||
      n.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSend = (id: string, via: 'email' | 'mail' | 'fax') => {
    markAsSent(id, via);
    toast({
      title: 'Mahnung versendet',
      description: `Die Mahnung wurde als "${via === 'email' ? 'per E-Mail' : via === 'mail' ? 'per Post' : 'per Fax'}" versendet markiert.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: DunningStatus) => {
    const configs: Record<DunningStatus, { label: string; className: string }> = {
      draft: { label: 'Entwurf', className: 'bg-gray-500' },
      sent: { label: 'Versendet', className: 'bg-blue-500' },
      paid: { label: 'Bezahlt', className: 'bg-green-500' },
      cancelled: { label: 'Storniert', className: 'bg-red-500' },
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: DunningLevel) => {
    const configs: Record<DunningLevel, { label: string; className: string }> = {
      0: { label: '-', className: '' },
      1: { label: 'Erinnerung', className: 'bg-yellow-500' },
      2: { label: '1. Mahnung', className: 'bg-orange-500' },
      3: { label: '2. Mahnung', className: 'bg-red-500' },
    };
    const config = configs[level];
    if (level === 0) return null;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mahnwesen</h1>
          <p className="text-muted-foreground">
            Mahnungen erstellen, verwalten und versenden
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Einstellungen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Mahnwesen-Einstellungen</DialogTitle>
                <DialogDescription>
                  Konfigurieren Sie die Mahnparameter
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Stufe 1 nach (Tage)</Label>
                    <Input
                      type="number"
                      value={settings.level1DaysOverdue}
                      onChange={(e) => updateSettings({ level1DaysOverdue: parseInt(e.target.value) || 14 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stufe 2 nach (Tage)</Label>
                    <Input
                      type="number"
                      value={settings.level2DaysOverdue}
                      onChange={(e) => updateSettings({ level2DaysOverdue: parseInt(e.target.value) || 28 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stufe 3 nach (Tage)</Label>
                    <Input
                      type="number"
                      value={settings.level3DaysOverdue}
                      onChange={(e) => updateSettings({ level3DaysOverdue: parseInt(e.target.value) || 42 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Gebühr Stufe 1 (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level1Fee}
                      onChange={(e) => updateSettings({ level1Fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gebühr Stufe 2 (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level2Fee}
                      onChange={(e) => updateSettings({ level2Fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gebühr Stufe 3 (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level3Fee}
                      onChange={(e) => updateSettings({ level3Fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Zinsen Stufe 1 (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level1InterestRate}
                      onChange={(e) => updateSettings({ level1InterestRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zinsen Stufe 2 (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level2InterestRate}
                      onChange={(e) => updateSettings({ level2InterestRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zinsen Stufe 3 (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.level3InterestRate}
                      onChange={(e) => updateSettings({ level3InterestRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Zahlungsfrist (Tage)</Label>
                    <Input
                      type="number"
                      value={settings.paymentDeadlineDays}
                      onChange={(e) => updateSettings({ paymentDeadlineDays: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <Label>E-Mail-Benachrichtigungen</Label>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(c) => updateSettings({ emailNotifications: c })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Firmenname</Label>
                  <Input
                    value={settings.companyName}
                    onChange={(e) => updateSettings({ companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bankverbindung</Label>
                  <Input
                    value={settings.bankDetails}
                    onChange={(e) => updateSettings({ bankDetails: e.target.value })}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportNotices}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entwürfe</p>
                <p className="text-2xl font-bold">{summary.draftCount}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              zum Versenden bereit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Versendet</p>
                <p className="text-2xl font-bold">{summary.sentCount}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              warten auf Zahlung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutstanding)}</p>
              </div>
              <Euro className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              offene Forderungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mahngebühren</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalFees + summary.totalInterest)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(summary.totalFees)} Gebühren + {formatCurrency(summary.totalInterest)} Zinsen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500">Erinnerung</Badge>
                <span className="text-2xl font-bold">{summary.level1Count}</span>
              </div>
              <p className="text-sm text-muted-foreground">Stufe 1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500">1. Mahnung</Badge>
                <span className="text-2xl font-bold">{summary.level2Count}</span>
              </div>
              <p className="text-sm text-muted-foreground">Stufe 2</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500">2. Mahnung</Badge>
                <span className="text-2xl font-bold">{summary.level3Count}</span>
              </div>
              <p className="text-sm text-muted-foreground">Stufe 3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle Mahnungen</TabsTrigger>
          <TabsTrigger value="entwuerfe">Entwürfe ({summary.draftCount})</TabsTrigger>
          <TabsTrigger value="versendet">Versendet ({summary.sentCount})</TabsTrigger>
          <TabsTrigger value="vorlagen">Vorlagen</TabsTrigger>
        </TabsList>

        {/* All Notices Tab */}
        <TabsContent value="alle" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechnungsnummer oder Kontakt suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="sent">Versendet</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahnstufe</TableHead>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead className="text-right">Offener Betrag</TableHead>
                    <TableHead className="text-right">Gebühren</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                    <TableHead>Frist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Keine Mahnungen gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>{getLevelBadge(notice.level)}</TableCell>
                        <TableCell className="font-medium">{notice.invoiceNumber}</TableCell>
                        <TableCell>{notice.contactName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(notice.remainingAmount)}</TableCell>
                        <TableCell className="text-right">
                          {notice.dunningFee + notice.interestAmount > 0 ? (
                            <span className="text-orange-600">
                              +{formatCurrency(notice.dunningFee + notice.interestAmount)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(notice.totalAmount)}</TableCell>
                        <TableCell>{format(new Date(notice.paymentDeadline), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>{getStatusBadge(notice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedNotice(notice);
                                setPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {notice.status === 'draft' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSend(notice.id, 'email')}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSend(notice.id, 'mail')}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {notice.status === 'sent' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  markAsPaid(notice.id);
                                  toast({ title: 'Als bezahlt markiert' });
                                }}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            {notice.status !== 'paid' && notice.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  cancelNotice(notice.id);
                                  toast({ title: 'Mahnung storniert' });
                                }}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="entwuerfe">
          <Card>
            <CardHeader>
              <CardTitle>Mahnentwürfe</CardTitle>
              <CardDescription>Mahnungen, die noch nicht versendet wurden</CardDescription>
            </CardHeader>
            <CardContent>
              {draftNotices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keine Entwürfe vorhanden
                </p>
              ) : (
                <div className="space-y-3">
                  {draftNotices.map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getLevelBadge(notice.level)}
                        <div>
                          <p className="font-medium">{notice.invoiceNumber} - {notice.contactName}</p>
                          <p className="text-sm text-muted-foreground">
                            Frist: {format(new Date(notice.paymentDeadline), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold">{formatCurrency(notice.totalAmount)}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleSend(notice.id, 'email')}>
                            <Mail className="h-4 w-4 mr-1" />
                            E-Mail
                          </Button>
                          <Button size="sm" onClick={() => handleSend(notice.id, 'mail')}>
                            <Printer className="h-4 w-4 mr-1" />
                            Drucken
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="versendet">
          <Card>
            <CardHeader>
              <CardTitle>Versendete Mahnungen</CardTitle>
              <CardDescription>Mahnungen, die auf Zahlung warten</CardDescription>
            </CardHeader>
            <CardContent>
              {sentNotices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keine versendeten Mahnungen
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahnstufe</TableHead>
                      <TableHead>Rechnungsnr.</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Versendet am</TableHead>
                      <TableHead>Via</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      <TableHead>Frist</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell>{getLevelBadge(notice.level)}</TableCell>
                        <TableCell className="font-medium">{notice.invoiceNumber}</TableCell>
                        <TableCell>{notice.contactName}</TableCell>
                        <TableCell>
                          {notice.sentDate && format(new Date(notice.sentDate), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {notice.sentVia === 'email' ? 'E-Mail' : notice.sentVia === 'mail' ? 'Post' : 'Fax'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(notice.totalAmount)}</TableCell>
                        <TableCell>{format(new Date(notice.paymentDeadline), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              markAsPaid(notice.id);
                              toast({ title: 'Als bezahlt markiert' });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Bezahlt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="vorlagen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mahnungsvorlagen</CardTitle>
              <CardDescription>Texte für verschiedene Mahnstufen anpassen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.filter(t => t.level > 0).map((template) => (
                  <Card key={template.level}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getLevelBadge(template.level as DunningLevel)}
                          {template.level === 1 ? 'Zahlungserinnerung' : `${template.level - 1}. Mahnung`}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template.level as DunningLevel);
                            setTemplateEditOpen(true);
                          }}
                        >
                          Bearbeiten
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                      <p className="text-sm mt-2">{template.introText.substring(0, 150)}...</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mahnungsvorschau</DialogTitle>
            <DialogDescription>
              {selectedNotice?.invoiceNumber} - {selectedNotice?.contactName}
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="bg-muted p-6 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {generateDunningText(selectedNotice)}
            </div>
          )}
          <DialogFooter>
            {selectedNotice?.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => handleSend(selectedNotice.id, 'email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Per E-Mail senden
                </Button>
                <Button onClick={() => handleSend(selectedNotice.id, 'mail')}>
                  <Printer className="h-4 w-4 mr-2" />
                  Drucken
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Edit Dialog */}
      <Dialog open={templateEditOpen} onOpenChange={setTemplateEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vorlage bearbeiten</DialogTitle>
          </DialogHeader>
          {editingTemplate !== null && (() => {
            const template = templates.find(t => t.level === editingTemplate);
            if (!template) return null;
            return (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Betreff</Label>
                  <Input
                    value={template.subject}
                    onChange={(e) => updateTemplate(editingTemplate, { subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anrede</Label>
                  <Input
                    value={template.salutation}
                    onChange={(e) => updateTemplate(editingTemplate, { salutation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Einleitung</Label>
                  <Textarea
                    value={template.introText}
                    onChange={(e) => updateTemplate(editingTemplate, { introText: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Haupttext</Label>
                  <Textarea
                    value={template.mainText}
                    onChange={(e) => updateTemplate(editingTemplate, { mainText: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schlusstext</Label>
                  <Textarea
                    value={template.closingText}
                    onChange={(e) => updateTemplate(editingTemplate, { closingText: e.target.value })}
                    rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Platzhalter: {'{invoiceNumber}'}, {'{totalAmount}'}, {'{paymentDeadline}'}, {'{bankDetails}'}
                </p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button onClick={() => setTemplateEditOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dunning;
