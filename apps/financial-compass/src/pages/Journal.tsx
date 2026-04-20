import { useState } from 'react';
import { useJournal, JournalEntry, ENTRY_TYPE_LABELS, ENTRY_STATUS_LABELS } from '@/hooks/useJournal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Search, Download, Check, X, RotateCcw, Eye, Trash2, FileText, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const Journal = () => {
  const { toast } = useToast();
  const { entries, isLoading, createEntry, postEntry, reverseEntry, deleteEntry, filterEntries, getSummary, exportToCSV } = useJournal();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New entry form
  const [entryForm, setEntryForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    postingDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'standard' as const,
    description: '',
    reference: '',
    lines: [
      { id: '1', accountNumber: '', accountName: '', debit: 0, credit: 0 },
      { id: '2', accountNumber: '', accountName: '', debit: 0, credit: 0 },
    ],
  });

  const summary = getSummary();

  // Filter entries
  const filteredEntries = filterEntries({
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    searchQuery: searchQuery || undefined,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted': return <Badge className="bg-green-500">Gebucht</Badge>;
      case 'draft': return <Badge variant="secondary">Entwurf</Badge>;
      case 'reversed': return <Badge variant="destructive">Storniert</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddLine = () => {
    setEntryForm({
      ...entryForm,
      lines: [...entryForm.lines, { id: String(entryForm.lines.length + 1), accountNumber: '', accountName: '', debit: 0, credit: 0 }],
    });
  };

  const handleRemoveLine = (idx: number) => {
    if (entryForm.lines.length <= 2) return;
    setEntryForm({ ...entryForm, lines: entryForm.lines.filter((_, i) => i !== idx) });
  };

  const handleLineChange = (idx: number, field: string, value: string | number) => {
    const newLines = [...entryForm.lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    setEntryForm({ ...entryForm, lines: newLines });
  };

  const totalDebit = entryForm.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = entryForm.lines.reduce((s, l) => s + (l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreateEntry = () => {
    if (!entryForm.description) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie eine Beschreibung ein.', variant: 'destructive' });
      return;
    }
    if (!isBalanced) {
      toast({ title: 'Fehler', description: 'Soll und Haben müssen ausgeglichen sein.', variant: 'destructive' });
      return;
    }
    createEntry({
      date: entryForm.date,
      postingDate: entryForm.postingDate,
      type: entryForm.type,
      status: 'draft',
      description: entryForm.description,
      reference: entryForm.reference || undefined,
      lines: entryForm.lines.filter(l => l.accountNumber && (l.debit > 0 || l.credit > 0)),
      createdBy: 'Benutzer',
    });
    toast({ title: 'Buchung erstellt', description: 'Die Buchung wurde als Entwurf gespeichert.' });
    setShowEntryDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEntryForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      postingDate: format(new Date(), 'yyyy-MM-dd'),
      type: 'standard',
      description: '',
      reference: '',
      lines: [
        { id: '1', accountNumber: '', accountName: '', debit: 0, credit: 0 },
        { id: '2', accountNumber: '', accountName: '', debit: 0, credit: 0 },
      ],
    });
  };

  const handlePostEntry = (entry: JournalEntry) => {
    if (postEntry(entry.id, 'Benutzer')) {
      toast({ title: 'Buchung gebucht', description: `${entry.entryNumber} wurde gebucht.` });
    }
  };

  const handleReverseEntry = () => {
    if (selectedEntry) {
      reverseEntry(selectedEntry.id, 'Benutzer', format(new Date(), 'yyyy-MM-dd'));
      toast({ title: 'Buchung storniert', description: `${selectedEntry.entryNumber} wurde storniert.` });
    }
    setShowReverseDialog(false);
  };

  const handleDeleteEntry = () => {
    if (selectedEntry) {
      deleteEntry(selectedEntry.id);
      toast({ title: 'Entwurf gelöscht', description: 'Der Buchungsentwurf wurde gelöscht.' });
    }
    setShowDeleteDialog(false);
  };

  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buchungsjournal_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: 'Export erstellt', description: 'Das Journal wurde als CSV exportiert.' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buchungsjournal</h1>
          <p className="text-muted-foreground">Alle Buchungen und Geschäftsvorfälle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button onClick={() => setShowEntryDialog(true)}><Plus className="h-4 w-4 mr-2" />Neue Buchung</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Buchungen</p><p className="text-2xl font-bold">{summary.totalEntries}</p></div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Gebucht</p><p className="text-2xl font-bold text-green-600">{summary.postedEntries}</p></div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Entwürfe</p><p className="text-2xl font-bold text-yellow-600">{summary.draftEntries}</p></div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Summe Soll</p><p className="text-2xl font-bold">{formatCurrency(summary.totalDebit)}</p></div>
            <Calculator className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Journal</CardTitle>
          <CardDescription>Buchungsjournal mit allen Geschäftsvorfällen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="posted">Gebucht</SelectItem>
                <SelectItem value="reversed">Storniert</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px]" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px]" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buchungsnr.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Soll</TableHead>
                <TableHead className="text-right">Haben</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Keine Buchungen gefunden</TableCell></TableRow>
              ) : (
                filteredEntries.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                  <TableRow key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedEntry(entry); setShowDetailDialog(true); }}>
                    <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                    <TableCell>{format(new Date(entry.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                    <TableCell><Badge variant="outline">{ENTRY_TYPE_LABELS[entry.type]}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.totalDebit)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(entry.totalCredit)}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {entry.status === 'draft' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handlePostEntry(entry)} title="Buchen"><Check className="h-4 w-4 text-green-500" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setShowDeleteDialog(true); }} title="Löschen"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </>
                        )}
                        {entry.status === 'posted' && (
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setShowReverseDialog(true); }} title="Stornieren"><RotateCcw className="h-4 w-4 text-orange-500" /></Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedEntry(entry); setShowDetailDialog(true); }} title="Details"><Eye className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Buchung</DialogTitle>
            <DialogDescription>Erfassen Sie einen neuen Geschäftsvorfall</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label>Datum</Label><Input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Buchungsdatum</Label><Input type="date" value={entryForm.postingDate} onChange={(e) => setEntryForm({ ...entryForm, postingDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Typ</Label>
                <Select value={entryForm.type} onValueChange={(v) => setEntryForm({ ...entryForm, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENTRY_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Beschreibung *</Label><Input value={entryForm.description} onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })} placeholder="Buchungstext" /></div>
              <div className="space-y-2"><Label>Referenz</Label><Input value={entryForm.reference} onChange={(e) => setEntryForm({ ...entryForm, reference: e.target.value })} placeholder="Belegnummer" /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Buchungszeilen</Label><Button variant="outline" size="sm" onClick={handleAddLine}><Plus className="h-4 w-4 mr-1" />Zeile</Button></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Konto</TableHead>
                    <TableHead>Kontoname</TableHead>
                    <TableHead className="text-right">Soll</TableHead>
                    <TableHead className="text-right">Haben</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entryForm.lines.map((line, idx) => (
                    <TableRow key={line.id}>
                      <TableCell><Input value={line.accountNumber} onChange={(e) => handleLineChange(idx, 'accountNumber', e.target.value)} placeholder="z.B. 1200" className="w-24" /></TableCell>
                      <TableCell><Input value={line.accountName} onChange={(e) => handleLineChange(idx, 'accountName', e.target.value)} placeholder="Kontoname" /></TableCell>
                      <TableCell><Input type="number" step="0.01" value={line.debit || ''} onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)} className="w-28 text-right" /></TableCell>
                      <TableCell><Input type="number" step="0.01" value={line.credit || ''} onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)} className="w-28 text-right" /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveLine(idx)} disabled={entryForm.lines.length <= 2}><X className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Summe</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                    <TableCell><Badge variant={isBalanced ? 'default' : 'destructive'} className={isBalanced ? 'bg-green-500' : ''}>{isBalanced ? 'OK' : 'Differenz'}</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntryDialog(false)}>Abbrechen</Button>
            <Button onClick={handleCreateEntry} disabled={!isBalanced}>Als Entwurf speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buchung {selectedEntry?.entryNumber}</DialogTitle>
            <DialogDescription>{selectedEntry?.description}</DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Datum:</span> {format(new Date(selectedEntry.date), 'dd.MM.yyyy', { locale: de })}</div>
                <div><span className="text-muted-foreground">Typ:</span> {ENTRY_TYPE_LABELS[selectedEntry.type]}</div>
                <div><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedEntry.status)}</div>
                <div><span className="text-muted-foreground">Referenz:</span> {selectedEntry.reference || '-'}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Konto</TableHead><TableHead>Bezeichnung</TableHead><TableHead className="text-right">Soll</TableHead><TableHead className="text-right">Haben</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selectedEntry.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell className="font-mono">{line.accountNumber}</TableCell>
                      <TableCell>{line.accountName}</TableCell>
                      <TableCell className="text-right">{line.debit > 0 ? formatCurrency(line.debit) : '-'}</TableCell>
                      <TableCell className="text-right">{line.credit > 0 ? formatCurrency(line.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold"><TableCell colSpan={2}>Summe</TableCell><TableCell className="text-right">{formatCurrency(selectedEntry.totalDebit)}</TableCell><TableCell className="text-right">{formatCurrency(selectedEntry.totalCredit)}</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="text-xs text-muted-foreground">
                <p>Erstellt: {format(new Date(selectedEntry.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })} von {selectedEntry.createdBy}</p>
                {selectedEntry.postedAt && <p>Gebucht: {format(new Date(selectedEntry.postedAt), 'dd.MM.yyyy HH:mm', { locale: de })} von {selectedEntry.postedBy}</p>}
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setShowDetailDialog(false)}>Schließen</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverse Confirmation */}
      <AlertDialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buchung stornieren?</AlertDialogTitle>
            <AlertDialogDescription>Möchten Sie die Buchung "{selectedEntry?.entryNumber}" wirklich stornieren? Es wird eine Gegenbuchung erstellt.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleReverseEntry} className="bg-orange-600 hover:bg-orange-700">Stornieren</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entwurf löschen?</AlertDialogTitle>
            <AlertDialogDescription>Möchten Sie den Buchungsentwurf "{selectedEntry?.entryNumber}" wirklich löschen?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-600 hover:bg-red-700">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
