import { useState, useMemo } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft, Search,
  Filter, RefreshCw, ChevronRight, FileText, Receipt, BookOpen,
  Check, X, MessageSquare, Sparkles, Building2, Calendar, Euro
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useBankReconciliation,
  type BankTransaction,
  type MatchableItem,
  type ReconciliationStatus,
} from '@/hooks/useBankReconciliation';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<ReconciliationStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  unreconciled: { label: 'Offen', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  matched: { label: 'Zugeordnet', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ArrowRightLeft },
  reconciled: { label: 'Abgestimmt', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  disputed: { label: 'Strittig', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const itemTypeConfig: Record<string, { label: string; icon: typeof FileText }> = {
  invoice: { label: 'Rechnung', icon: FileText },
  receipt: { label: 'Beleg', icon: Receipt },
  booking: { label: 'Buchung', icon: BookOpen },
};

export default function BankReconciliation() {
  const { toast } = useToast();
  const {
    transactions,
    loading,
    stats,
    bankAccounts,
    selectedTransaction,
    setSelectedTransaction,
    getSuggestedMatches,
    matchTransaction,
    unmatchTransaction,
    reconcileTransaction,
    reconcileAllMatched,
    disputeTransaction,
    addNote,
    autoMatchAll,
    getMatchedItem,
    getFilteredTransactions,
  } = useBankReconciliation();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState('');

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let result = statusFilter === 'all'
      ? transactions
      : getFilteredTransactions(statusFilter as ReconciliationStatus);

    if (bankFilter !== 'all') {
      result = result.filter(tx => tx.bank_account_id === bankFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx =>
        tx.description.toLowerCase().includes(query) ||
        tx.counterparty?.toLowerCase().includes(query) ||
        tx.reference?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, statusFilter, bankFilter, searchQuery, getFilteredTransactions]);

  // Get suggestions for selected transaction
  const suggestions = useMemo(() => {
    if (!selectedTransaction) return [];
    return getSuggestedMatches(selectedTransaction);
  }, [selectedTransaction, getSuggestedMatches]);

  // Handle auto-match
  const handleAutoMatch = () => {
    const matched = autoMatchAll();
    toast({
      title: 'Automatische Zuordnung',
      description: `${matched} Transaktionen wurden automatisch zugeordnet.`,
    });
  };

  // Handle reconcile all matched
  const handleReconcileAll = () => {
    reconcileAllMatched();
    toast({
      title: 'Abstimmung abgeschlossen',
      description: 'Alle zugeordneten Transaktionen wurden abgestimmt.',
    });
  };

  // Handle match selection
  const handleMatch = (item: MatchableItem) => {
    if (!selectedTransaction) return;
    matchTransaction(selectedTransaction.id, item);
    setMatchDialogOpen(false);
    toast({
      title: 'Zuordnung erfolgreich',
      description: `Transaktion wurde ${itemTypeConfig[item.type].label} "${item.reference}" zugeordnet.`,
    });
  };

  // Handle dispute
  const handleDispute = () => {
    if (!selectedTransaction) return;
    disputeTransaction(selectedTransaction.id, disputeNotes);
    setDisputeDialogOpen(false);
    setDisputeNotes('');
    toast({
      title: 'Als strittig markiert',
      description: 'Die Transaktion wurde als strittig markiert.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const reconciliationProgress = stats.total > 0
    ? Math.round(((stats.reconciled + stats.matched) / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Bank-Abstimmung</h1>
          <p className="text-muted-foreground">
            Ordnen Sie Banktransaktionen Rechnungen und Belegen zu
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoMatch}>
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Zuordnung
          </Button>
          {stats.matched > 0 && (
            <Button size="sm" onClick={handleReconcileAll}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Alle abstimmen ({stats.matched})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unreconciled}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.unreconciledAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Zugeordnet</p>
              <p className="text-2xl font-bold text-blue-600">{stats.matched}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Abgestimmt</p>
              <p className="text-2xl font-bold text-green-600">{stats.reconciled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Strittig</p>
              <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Abstimmungsfortschritt</span>
            <span className="text-sm text-muted-foreground">{reconciliationProgress}%</span>
          </div>
          <Progress value={reconciliationProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{stats.reconciled + stats.matched} von {stats.total} Transaktionen</span>
            <span>{formatCurrency(stats.totalAmount - stats.unreconciledAmount)} abgestimmt</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="unreconciled">Offen</SelectItem>
            <SelectItem value="matched">Zugeordnet</SelectItem>
            <SelectItem value="reconciled">Abgestimmt</SelectItem>
            <SelectItem value="disputed">Strittig</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bankFilter} onValueChange={setBankFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Bankkonto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Konten</SelectItem>
            {bankAccounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transaktionen</CardTitle>
          <CardDescription>
            {filteredTransactions.length} Transaktionen gefunden
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Transaktionen gefunden</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((tx) => {
                const status = statusConfig[tx.reconciliation_status];
                const StatusIcon = status.icon;
                const matchedItem = getMatchedItem(tx);

                return (
                  <div
                    key={tx.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                      selectedTransaction?.id === tx.id && 'bg-muted'
                    )}
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-2 rounded-full',
                        tx.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
                      )}>
                        <Euro className={cn(
                          'h-5 w-5',
                          tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium truncate">{tx.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              {tx.counterparty && (
                                <span>{tx.counterparty}</span>
                              )}
                              {tx.reference && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{tx.reference}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn(
                              'font-bold',
                              tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {formatCurrency(tx.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(tx.date), 'dd.MM.yyyy', { locale: de })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {tx.bank_account_name}
                          </span>
                          {matchedItem && (
                            <Badge variant="secondary" className="text-xs">
                              {itemTypeConfig[matchedItem.type].label}: {matchedItem.reference}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Sheet */}
      <Sheet open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <SheetContent className="sm:max-w-lg">
          {selectedTransaction && (
            <>
              <SheetHeader>
                <SheetTitle>Transaktionsdetails</SheetTitle>
                <SheetDescription>
                  {format(parseISO(selectedTransaction.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Transaction Info */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Betrag</span>
                    <span className={cn(
                      'font-bold text-lg',
                      selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beschreibung</span>
                    <span className="text-right max-w-[200px]">{selectedTransaction.description}</span>
                  </div>
                  {selectedTransaction.counterparty && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gegenpartei</span>
                      <span>{selectedTransaction.counterparty}</span>
                    </div>
                  )}
                  {selectedTransaction.reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referenz</span>
                      <span className="font-mono text-sm">{selectedTransaction.reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Konto</span>
                    <span>{selectedTransaction.bank_account_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className={statusConfig[selectedTransaction.reconciliation_status].color}>
                      {statusConfig[selectedTransaction.reconciliation_status].label}
                    </Badge>
                  </div>
                </div>

                {/* Matched Item */}
                {getMatchedItem(selectedTransaction) && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {(() => {
                          const item = getMatchedItem(selectedTransaction)!;
                          const ItemIcon = itemTypeConfig[item.type].icon;
                          return (
                            <>
                              <ItemIcon className="h-4 w-4" />
                              Zugeordnet: {itemTypeConfig[item.type].label}
                            </>
                          );
                        })()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      {(() => {
                        const item = getMatchedItem(selectedTransaction)!;
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Referenz</span>
                              <span className="font-mono">{item.reference}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Betrag</span>
                              <span>{formatCurrency(item.amount)}</span>
                            </div>
                            {item.contact_name && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Kontakt</span>
                                <span>{item.contact_name}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {selectedTransaction.reconciliation_status === 'unreconciled' && suggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Vorgeschlagene Zuordnungen
                    </h4>
                    <div className="space-y-2">
                      {suggestions.slice(0, 3).map((suggestion) => {
                        const ItemIcon = itemTypeConfig[suggestion.item.type].icon;
                        return (
                          <Card
                            key={suggestion.item.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleMatch(suggestion.item)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <ItemIcon className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{suggestion.item.reference}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {suggestion.item.contact_name || suggestion.item.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(suggestion.item.amount)}</p>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-xs',
                                      suggestion.confidence >= 75 ? 'bg-green-50 text-green-700' :
                                        suggestion.confidence >= 50 ? 'bg-yellow-50 text-yellow-700' :
                                          'bg-gray-50 text-gray-700'
                                    )}
                                  >
                                    {suggestion.confidence}% Match
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {suggestion.matchReasons.map((reason, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {selectedTransaction.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t">
                  {selectedTransaction.reconciliation_status === 'unreconciled' && (
                    <>
                      <Button className="w-full" onClick={() => setMatchDialogOpen(true)}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Manuell zuordnen
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setDisputeDialogOpen(true)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Als strittig markieren
                      </Button>
                    </>
                  )}

                  {selectedTransaction.reconciliation_status === 'matched' && (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => {
                          reconcileTransaction(selectedTransaction.id);
                          setSelectedTransaction(null);
                          toast({ title: 'Transaktion abgestimmt' });
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Abstimmung bestätigen
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          unmatchTransaction(selectedTransaction.id);
                          toast({ title: 'Zuordnung aufgehoben' });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Zuordnung aufheben
                      </Button>
                    </>
                  )}

                  {selectedTransaction.reconciliation_status === 'disputed' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        unmatchTransaction(selectedTransaction.id);
                        toast({ title: 'Status zurückgesetzt' });
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Status zurücksetzen
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Match Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaktion zuordnen</DialogTitle>
            <DialogDescription>
              Wählen Sie eine Rechnung, einen Beleg oder eine Buchung aus
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="invoice">Rechnungen</TabsTrigger>
              <TabsTrigger value="receipt">Belege</TabsTrigger>
              <TabsTrigger value="booking">Buchungen</TabsTrigger>
            </TabsList>

            {['all', 'invoice', 'receipt', 'booking'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
                {suggestions
                  .filter(s => tab === 'all' || s.item.type === tab)
                  .map((suggestion) => {
                    const ItemIcon = itemTypeConfig[suggestion.item.type].icon;
                    return (
                      <Card
                        key={suggestion.item.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleMatch(suggestion.item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <ItemIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{suggestion.item.reference}</p>
                                <p className="text-sm text-muted-foreground">
                                  {suggestion.item.description}
                                </p>
                                {suggestion.item.contact_name && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {suggestion.item.contact_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(suggestion.item.amount)}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(suggestion.item.date), 'dd.MM.yyyy', { locale: de })}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'mt-1 text-xs',
                                  suggestion.confidence >= 75 ? 'bg-green-50 text-green-700 border-green-200' :
                                    suggestion.confidence >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      'bg-gray-50 text-gray-700'
                                )}
                              >
                                {suggestion.confidence}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {suggestions.filter(s => tab === 'all' || s.item.type === tab).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Keine passenden Elemente gefunden
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Als strittig markieren</DialogTitle>
            <DialogDescription>
              Geben Sie einen Grund an, warum diese Transaktion strittig ist
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="z.B. Betrag stimmt nicht mit Rechnung überein..."
            value={disputeNotes}
            onChange={(e) => setDisputeNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDispute}>
              Als strittig markieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
