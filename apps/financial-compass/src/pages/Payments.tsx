import { useState } from 'react';
import {
  usePaymentTracking,
  Payment,
  PAYMENT_METHODS,
  PAYMENT_TYPES,
} from '@/hooks/usePaymentTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  CheckCircle,
  XCircle,
  Euro,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Payments() {
  const { toast } = useToast();
  const {
    payments,
    isLoading,
    recordPayment,
    deletePayment,
    reconcilePayment,
    getStats,
    exportPayments,
  } = usePaymentTracking();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    direction: 'incoming' as Payment['direction'],
    type: 'invoice' as Payment['type'],
    method: 'bank_transfer' as Payment['method'],
    amount: 0,
    currency: 'EUR',
    date: new Date().toISOString().split('T')[0],
    contactName: '',
    invoiceNumber: '',
    description: '',
    reference: '',
    isReconciled: false,
    tags: [] as string[],
  });

  const stats = getStats();

  const resetForm = () => {
    setFormData({
      direction: 'incoming',
      type: 'invoice',
      method: 'bank_transfer',
      amount: 0,
      currency: 'EUR',
      date: new Date().toISOString().split('T')[0],
      contactName: '',
      invoiceNumber: '',
      description: '',
      reference: '',
      isReconciled: false,
      tags: [],
    });
  };

  const handleSave = () => {
    if (!formData.contactName || formData.amount <= 0) {
      toast({ title: 'Fehler', description: 'Kontakt und Betrag sind erforderlich', variant: 'destructive' });
      return;
    }
    recordPayment(formData);
    toast({ title: 'Zahlung erfasst' });
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePayment(id);
    toast({ title: 'Zahlung gelöscht' });
  };

  const handleReconcile = (id: string) => {
    reconcilePayment(id, `tx-${Date.now()}`);
    toast({ title: 'Zahlung abgestimmt' });
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'incoming' && p.direction === 'incoming') ||
      (activeTab === 'outgoing' && p.direction === 'outgoing') ||
      (activeTab === 'unreconciled' && !p.isReconciled);

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
          <h1 className="text-3xl font-bold">Zahlungen</h1>
          <p className="text-muted-foreground">Zahlungseingänge und -ausgänge verwalten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportPayments('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Zahlung
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-500" />
              Eingänge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.incoming.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
            <p className="text-xs text-muted-foreground">{stats.incoming.count} Zahlungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              Ausgänge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outgoing.total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
            <p className="text-xs text-muted-foreground">{stats.outgoing.count} Zahlungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.incoming.total - stats.outgoing.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats.incoming.total - stats.outgoing.total).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nicht abgestimmt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => !p.isReconciled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="incoming">Eingänge</TabsTrigger>
            <TabsTrigger value="outgoing">Ausgänge</TabsTrigger>
            <TabsTrigger value="unreconciled">Offen</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Zahlungen gefunden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.direction === 'incoming' ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(payment.date), 'dd.MM.yyyy')}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.contactName}</p>
                        {payment.invoiceNumber && (
                          <p className="text-sm text-muted-foreground">{payment.invoiceNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_METHODS.find(m => m.value === payment.method)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${payment.direction === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.direction === 'incoming' ? '+' : '-'}
                      {payment.amount.toLocaleString('de-DE', { style: 'currency', currency: payment.currency })}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.isReconciled ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReconcile(payment.id)}
                        >
                          <XCircle className="h-5 w-5 text-yellow-500" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment.id)}
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

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Zahlung erfassen</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Richtung</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(v) => setFormData({ ...formData, direction: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Eingang</SelectItem>
                    <SelectItem value="outgoing">Ausgang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kontakt *</Label>
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Name des Zahlenden/Empfängers"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Betrag *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Zahlungsart</Label>
                <Select
                  value={formData.method}
                  onValueChange={(v) => setFormData({ ...formData, method: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rechnungsnummer</Label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Wofür?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              <CreditCard className="h-4 w-4 mr-2" />
              Erfassen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
