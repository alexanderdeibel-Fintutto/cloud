import { useState } from 'react';
import {
  useSupplierInvoices,
  SupplierInvoice,
  InvoicePayment,
  INVOICE_CATEGORIES,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/hooks/useSupplierInvoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Building2,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

export default function SupplierInvoices() {
  const { toast } = useToast();
  const {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    approveInvoice,
    getOverdueInvoices,
    getDueSoon,
    getSummary,
    getSuppliers,
    exportInvoices,
  } = useSupplierInvoices();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SupplierInvoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierName: '',
    supplierVatId: '',
    invoiceDate: '',
    receivedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    netAmount: 0,
    taxRate: 19,
    description: '',
    category: '',
    accountNumber: '',
    notes: '',
    tags: [] as string[],
  });

  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'bank' as InvoicePayment['method'],
    reference: '',
  });

  const summary = getSummary();
  const overdueInvoices = getOverdueInvoices();
  const dueSoon = getDueSoon(7);
  const suppliers = getSuppliers();

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      supplierName: '',
      supplierVatId: '',
      invoiceDate: '',
      receivedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      netAmount: 0,
      taxRate: 19,
      description: '',
      category: '',
      accountNumber: '',
      notes: '',
      tags: [],
    });
    setEditingInvoice(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (invoice: SupplierInvoice) => {
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      supplierName: invoice.supplierName,
      supplierVatId: invoice.supplierVatId || '',
      invoiceDate: invoice.invoiceDate,
      receivedDate: invoice.receivedDate,
      dueDate: invoice.dueDate,
      netAmount: invoice.netAmount,
      taxRate: invoice.taxRate,
      description: invoice.description,
      category: invoice.category || '',
      accountNumber: invoice.accountNumber || '',
      notes: invoice.notes || '',
      tags: [...invoice.tags],
    });
    setEditingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const openPaymentDialog = (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      date: new Date().toISOString().split('T')[0],
      amount: invoice.grossAmount - invoice.paidAmount,
      method: 'bank',
      reference: '',
    });
    setIsPaymentDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.invoiceNumber || !formData.supplierName || !formData.netAmount) {
      toast({ title: 'Fehler', description: 'Bitte alle Pflichtfelder ausfüllen', variant: 'destructive' });
      return;
    }

    const taxAmount = formData.netAmount * (formData.taxRate / 100);
    const grossAmount = formData.netAmount + taxAmount;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        ...formData,
        taxAmount,
        grossAmount,
      });
      toast({ title: 'Rechnung aktualisiert' });
    } else {
      createInvoice({
        ...formData,
        taxAmount,
        grossAmount,
        currency: 'EUR',
        status: 'received',
      });
      toast({ title: 'Rechnung erstellt' });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handlePayment = () => {
    if (!selectedInvoice || paymentData.amount <= 0) return;

    addPayment(selectedInvoice.id, paymentData);
    toast({ title: 'Zahlung erfasst', description: `${paymentData.amount.toFixed(2)} € bezahlt` });
    setIsPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleDelete = (id: string) => {
    deleteInvoice(id);
    setDeleteInvoiceId(null);
    toast({ title: 'Rechnung gelöscht' });
  };

  const handleApprove = (id: string) => {
    approveInvoice(id, 'Benutzer');
    toast({ title: 'Rechnung freigegeben' });
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'open' && inv.paymentStatus !== 'paid') ||
      (activeTab === 'overdue' && inv.paymentStatus === 'overdue') ||
      (activeTab === 'paid' && inv.paymentStatus === 'paid');

    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eingangsrechnungen</h1>
          <p className="text-muted-foreground">
            Lieferantenrechnungen verwalten und bezahlen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportInvoices('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Rechnung
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-muted-foreground">{summary.totalInvoices} Rechnungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bezahlt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paidAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
            <Progress value={(summary.paidAmount / summary.totalAmount) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.openAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
          </CardContent>
        </Card>
        <Card className={summary.overdueCount > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              {summary.overdueCount > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              Überfällig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
            <p className="text-xs text-muted-foreground">{summary.overdueCount} Rechnungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lieferanten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(overdueInvoices.length > 0 || dueSoon.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {overdueInvoices.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Überfällige Rechnungen ({overdueInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueInvoices.slice(0, 3).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">{inv.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{inv.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{(inv.grossAmount - inv.paidAmount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                        <p className="text-xs text-red-500">
                          {differenceInDays(new Date(), new Date(inv.dueDate))} Tage überfällig
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {dueSoon.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Clock className="h-5 w-5" />
                  Bald fällig ({dueSoon.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dueSoon.slice(0, 3).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div>
                        <p className="font-medium">{inv.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{inv.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{(inv.grossAmount - inv.paidAmount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                        <p className="text-xs text-yellow-600">
                          Fällig: {format(new Date(inv.dueDate), 'dd.MM.yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Alle ({invoices.length})</TabsTrigger>
            <TabsTrigger value="open">Offen ({invoices.filter(i => i.paymentStatus !== 'paid').length})</TabsTrigger>
            <TabsTrigger value="overdue">Überfällig ({overdueInvoices.length})</TabsTrigger>
            <TabsTrigger value="paid">Bezahlt ({invoices.filter(i => i.paymentStatus === 'paid').length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Rechnungen gefunden</p>
              <Button variant="link" onClick={openCreateDialog}>
                Erste Rechnung erfassen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Lieferant</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {invoice.supplierName}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.invoiceDate), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(invoice.dueDate), 'dd.MM.yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {invoice.grossAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.paymentStatus === 'paid' ? (
                        <span className="text-green-600">-</span>
                      ) : (
                        <span className={invoice.paymentStatus === 'overdue' ? 'text-red-600 font-bold' : ''}>
                          {(invoice.grossAmount - invoice.paidAmount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[invoice.status]}>
                        {STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(invoice)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          {invoice.paymentStatus !== 'paid' && (
                            <DropdownMenuItem onClick={() => openPaymentDialog(invoice)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Zahlung erfassen
                            </DropdownMenuItem>
                          )}
                          {invoice.status === 'received' && (
                            <DropdownMenuItem onClick={() => handleApprove(invoice.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Freigeben
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteInvoiceId(invoice.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? 'Rechnung bearbeiten' : 'Neue Eingangsrechnung'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rechnungsnummer *</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="R-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Lieferant *</Label>
                <Input
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Firmenname"
                />
              </div>
              <div className="space-y-2">
                <Label>Rechnungsdatum</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fälligkeitsdatum</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nettobetrag *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.netAmount || ''}
                  onChange={(e) => setFormData({ ...formData, netAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>MwSt-Satz</Label>
                <Select
                  value={String(formData.taxRate)}
                  onValueChange={(v) => setFormData({ ...formData, taxRate: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                    <SelectItem value="19">19%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Worum geht es?"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buchungskonto</Label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="z.B. 4920"
                />
              </div>
            </div>

            {/* Calculated Amount */}
            {formData.netAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Netto:</span>
                  <span>{formData.netAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MwSt ({formData.taxRate}%):</span>
                  <span>{(formData.netAmount * formData.taxRate / 100).toFixed(2)} €</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Brutto:</span>
                  <span>{(formData.netAmount * (1 + formData.taxRate / 100)).toFixed(2)} €</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              {editingInvoice ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zahlung erfassen</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  {selectedInvoice.supplierName} - {selectedInvoice.invoiceNumber}
                  <br />
                  Offener Betrag: {(selectedInvoice.grossAmount - selectedInvoice.paidAmount).toFixed(2)} €
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Zahlungsdatum</Label>
              <Input
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Betrag</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentData.amount || ''}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Zahlungsart</Label>
              <Select
                value={paymentData.method}
                onValueChange={(v) => setPaymentData({ ...paymentData, method: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Überweisung</SelectItem>
                  <SelectItem value="sepa">SEPA-Lastschrift</SelectItem>
                  <SelectItem value="cash">Bar</SelectItem>
                  <SelectItem value="card">Karte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Referenz</Label>
              <Input
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handlePayment}>
              <Euro className="h-4 w-4 mr-2" />
              Zahlung buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteInvoiceId} onOpenChange={() => setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechnung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteInvoiceId && handleDelete(deleteInvoiceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
