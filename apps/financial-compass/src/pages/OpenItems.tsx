import { useState } from 'react';
import {
  useOpenItems,
  OpenItem,
  OpenItemType,
  OpenItemStatus,
} from '@/hooks/useOpenItems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Search,
  Download,
  Euro,
  AlertTriangle,
  Clock,
  CreditCard,
  Trash2,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

const OpenItems = () => {
  const { toast } = useToast();
  const {
    items,
    payments,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    recordPayment,
    writeOff,
    setDunningLevel,
    getByType,
    getOverdueItems,
    getDueSoon,
    getAgingSummary,
    getSummary,
    getPaymentHistory,
    exportItems,
  } = useOpenItems();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<OpenItemType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OpenItemStatus | 'all'>('all');
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OpenItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'card' | 'paypal' | 'other'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');

  const [formData, setFormData] = useState<Partial<OpenItem>>({
    type: 'receivable',
    currency: 'EUR',
    paymentTermDays: 30,
  });

  const summary = getSummary();
  const receivablesAging = getAgingSummary('receivable');
  const payablesAging = getAgingSummary('payable');
  const overdueItems = getOverdueItems();
  const dueSoon = getDueSoon(7);

  const filteredItems = items.filter(i => {
    const matchesSearch = searchQuery === '' ||
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateItem = () => {
    if (!formData.invoiceNumber || !formData.contactName || !formData.originalAmount || !formData.invoiceDate || !formData.dueDate) {
      toast({
        title: 'Fehler',
        description: 'Bitte alle Pflichtfelder ausfüllen.',
        variant: 'destructive',
      });
      return;
    }
    createItem({
      ...formData,
      paidAmount: 0,
      remainingAmount: formData.originalAmount,
    } as any);
    toast({
      title: 'Posten erstellt',
      description: `${formData.invoiceNumber} wurde erfolgreich angelegt.`,
    });
    setNewItemOpen(false);
    setFormData({ type: 'receivable', currency: 'EUR', paymentTermDays: 30 });
  };

  const handleRecordPayment = () => {
    if (!selectedItem || paymentAmount <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte einen gültigen Betrag eingeben.',
        variant: 'destructive',
      });
      return;
    }
    recordPayment({
      openItemId: selectedItem.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: paymentAmount,
      paymentMethod,
      reference: paymentReference,
    });
    toast({
      title: 'Zahlung erfasst',
      description: `${formatCurrency(paymentAmount)} wurde erfasst.`,
    });
    setPaymentDialogOpen(false);
    setSelectedItem(null);
    setPaymentAmount(0);
    setPaymentReference('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: OpenItemStatus) => {
    const configs: Record<OpenItemStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      open: { label: 'Offen', variant: 'outline' },
      partial: { label: 'Teilweise bezahlt', variant: 'secondary' },
      paid: { label: 'Bezahlt', variant: 'default' },
      overdue: { label: 'Überfällig', variant: 'destructive' },
      written_off: { label: 'Abgeschrieben', variant: 'outline' },
    };
    const config = configs[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDaysOverdue = (dueDate: string): number => {
    return differenceInDays(new Date(), new Date(dueDate));
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
          <h1 className="text-3xl font-bold">Offene Posten</h1>
          <p className="text-muted-foreground">
            Forderungen und Verbindlichkeiten verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportItems()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Posten
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Posten anlegen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen offenen Posten
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData({ ...formData, type: v as OpenItemType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receivable">Forderung</SelectItem>
                        <SelectItem value="payable">Verbindlichkeit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rechnungsnummer *</Label>
                    <Input
                      value={formData.invoiceNumber || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kontakt *</Label>
                  <Input
                    value={formData.contactName || ''}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Firmenname"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rechnungsdatum *</Label>
                    <Input
                      type="date"
                      value={formData.invoiceDate || ''}
                      onChange={(e) => {
                        const invoiceDate = e.target.value;
                        const dueDate = new Date(invoiceDate);
                        dueDate.setDate(dueDate.getDate() + (formData.paymentTermDays || 30));
                        setFormData({
                          ...formData,
                          invoiceDate,
                          dueDate: dueDate.toISOString().split('T')[0],
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fälligkeitsdatum *</Label>
                    <Input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Betrag *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.originalAmount || ''}
                      onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zahlungsziel (Tage)</Label>
                    <Input
                      type="number"
                      value={formData.paymentTermDays || 30}
                      onChange={(e) => setFormData({ ...formData, paymentTermDays: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewItemOpen(false)}>Abbrechen</Button>
                <Button onClick={handleCreateItem}>Erstellen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forderungen</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceivables)}</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.receivablesCount} offene Posten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verbindlichkeiten</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPayables)}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.payablesCount} offene Posten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Netto-Position</p>
                <p className={`text-2xl font-bold ${summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netPosition)}
                </p>
              </div>
              {summary.netPosition >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Forderungen - Verbindlichkeiten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Überfällig</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.overdueReceivablesAmount)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.overdueReceivablesCount} Forderungen, {summary.dunningNeeded} zur Mahnung
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueItems.filter(i => i.type === 'receivable').length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Überfällige Forderungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueItems.filter(i => i.type === 'receivable').slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <span className="font-medium">{item.invoiceNumber}</span>
                    <span className="mx-2">-</span>
                    <span>{item.contactName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-red-600">
                      {getDaysOverdue(item.dueDate)} Tage überfällig
                    </span>
                    <span className="font-bold">{formatCurrency(item.remainingAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle Posten</TabsTrigger>
          <TabsTrigger value="forderungen">Forderungen</TabsTrigger>
          <TabsTrigger value="verbindlichkeiten">Verbindlichkeiten</TabsTrigger>
          <TabsTrigger value="faelligkeit">Fälligkeitsanalyse</TabsTrigger>
        </TabsList>

        {/* All Items Tab */}
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
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="receivable">Forderungen</SelectItem>
                <SelectItem value="payable">Verbindlichkeiten</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="partial">Teilweise bezahlt</SelectItem>
                <SelectItem value="overdue">Überfällig</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="text-right">Offen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Keine offenen Posten gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const daysOverdue = getDaysOverdue(item.dueDate);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.type === 'receivable' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <ArrowDownCircle className="h-3 w-3 mr-1" />
                                Forderung
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                Verbindlichk.
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                          <TableCell>{item.contactName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {daysOverdue > 0 ? (
                                <Clock className="h-4 w-4 text-red-500" />
                              ) : daysOverdue > -7 ? (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{format(new Date(item.dueDate), 'dd.MM.yyyy', { locale: de })}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.originalAmount)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.remainingAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {item.status !== 'paid' && item.status !== 'written_off' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setPaymentAmount(item.remainingAmount);
                                    setPaymentDialogOpen(true);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receivables Tab */}
        <TabsContent value="forderungen">
          <Card>
            <CardHeader>
              <CardTitle>Forderungen (Debitorenkonten)</CardTitle>
              <CardDescription>Offene Ausgangsrechnungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Rechnungsdatum</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Offen</TableHead>
                    <TableHead>Mahnstufe</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getByType('receivable')
                    .filter(i => i.status !== 'paid' && i.status !== 'written_off')
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                        <TableCell>{item.contactName}</TableCell>
                        <TableCell>{format(new Date(item.invoiceDate), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>{format(new Date(item.dueDate), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.remainingAmount)}</TableCell>
                        <TableCell>
                          {item.dunningLevel > 0 ? (
                            <Badge variant="destructive">Mahnstufe {item.dunningLevel}</Badge>
                          ) : (
                            <Badge variant="outline">Keine</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payables Tab */}
        <TabsContent value="verbindlichkeiten">
          <Card>
            <CardHeader>
              <CardTitle>Verbindlichkeiten (Kreditorenkonten)</CardTitle>
              <CardDescription>Offene Eingangsrechnungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Lieferant</TableHead>
                    <TableHead>Rechnungsdatum</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Offen</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getByType('payable')
                    .filter(i => i.status !== 'paid' && i.status !== 'written_off')
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                        <TableCell>{item.contactName}</TableCell>
                        <TableCell>{format(new Date(item.invoiceDate), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>{format(new Date(item.dueDate), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.remainingAmount)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Analysis Tab */}
        <TabsContent value="faelligkeit" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  Forderungen nach Fälligkeit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Nicht fällig</span>
                    <span className="font-medium">{formatCurrency(receivablesAging.current)}</span>
                  </div>
                  <Progress value={(receivablesAging.current / receivablesAging.total) * 100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span>1-30 Tage überfällig</span>
                    <span className="font-medium text-yellow-600">{formatCurrency(receivablesAging.days1to30)}</span>
                  </div>
                  <Progress value={(receivablesAging.days1to30 / receivablesAging.total) * 100} className="h-2 [&>div]:bg-yellow-500" />

                  <div className="flex justify-between items-center">
                    <span>31-60 Tage überfällig</span>
                    <span className="font-medium text-orange-600">{formatCurrency(receivablesAging.days31to60)}</span>
                  </div>
                  <Progress value={(receivablesAging.days31to60 / receivablesAging.total) * 100} className="h-2 [&>div]:bg-orange-500" />

                  <div className="flex justify-between items-center">
                    <span>61-90 Tage überfällig</span>
                    <span className="font-medium text-red-500">{formatCurrency(receivablesAging.days61to90)}</span>
                  </div>
                  <Progress value={(receivablesAging.days61to90 / receivablesAging.total) * 100} className="h-2 [&>div]:bg-red-400" />

                  <div className="flex justify-between items-center">
                    <span>&gt; 90 Tage überfällig</span>
                    <span className="font-medium text-red-700">{formatCurrency(receivablesAging.over90days)}</span>
                  </div>
                  <Progress value={(receivablesAging.over90days / receivablesAging.total) * 100} className="h-2 [&>div]:bg-red-700" />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(receivablesAging.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  Verbindlichkeiten nach Fälligkeit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Nicht fällig</span>
                    <span className="font-medium">{formatCurrency(payablesAging.current)}</span>
                  </div>
                  <Progress value={payablesAging.total > 0 ? (payablesAging.current / payablesAging.total) * 100 : 0} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span>1-30 Tage überfällig</span>
                    <span className="font-medium text-yellow-600">{formatCurrency(payablesAging.days1to30)}</span>
                  </div>
                  <Progress value={payablesAging.total > 0 ? (payablesAging.days1to30 / payablesAging.total) * 100 : 0} className="h-2 [&>div]:bg-yellow-500" />

                  <div className="flex justify-between items-center">
                    <span>31-60 Tage überfällig</span>
                    <span className="font-medium text-orange-600">{formatCurrency(payablesAging.days31to60)}</span>
                  </div>
                  <Progress value={payablesAging.total > 0 ? (payablesAging.days31to60 / payablesAging.total) * 100 : 0} className="h-2 [&>div]:bg-orange-500" />

                  <div className="flex justify-between items-center">
                    <span>61-90 Tage überfällig</span>
                    <span className="font-medium text-red-500">{formatCurrency(payablesAging.days61to90)}</span>
                  </div>
                  <Progress value={payablesAging.total > 0 ? (payablesAging.days61to90 / payablesAging.total) * 100 : 0} className="h-2 [&>div]:bg-red-400" />

                  <div className="flex justify-between items-center">
                    <span>&gt; 90 Tage überfällig</span>
                    <span className="font-medium text-red-700">{formatCurrency(payablesAging.over90days)}</span>
                  </div>
                  <Progress value={payablesAging.total > 0 ? (payablesAging.over90days / payablesAging.total) * 100 : 0} className="h-2 [&>div]:bg-red-700" />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(payablesAging.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zahlung erfassen</DialogTitle>
            <DialogDescription>
              {selectedItem?.invoiceNumber} - {selectedItem?.contactName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Rechnungsbetrag:</span>
                <span>{formatCurrency(selectedItem?.originalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bereits bezahlt:</span>
                <span>{formatCurrency(selectedItem?.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Offen:</span>
                <span>{formatCurrency(selectedItem?.remainingAmount || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zahlungsbetrag</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Zahlungsart</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Überweisung</SelectItem>
                  <SelectItem value="cash">Bar</SelectItem>
                  <SelectItem value="card">Karte</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Sonstige</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referenz / Verwendungszweck</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleRecordPayment}>Zahlung erfassen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpenItems;
