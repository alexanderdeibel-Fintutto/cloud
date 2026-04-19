import { useState } from 'react';
import {
  useRecurringBookings,
  RecurringBooking,
  RecurringFrequency,
  RecurringStatus,
  FREQUENCY_LABELS,
  STATUS_LABELS,
} from '@/hooks/useRecurringBookings';
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
  RefreshCw,
  Plus,
  Search,
  Download,
  Play,
  Pause,
  Trash2,
  Calendar,
  Euro,
  Clock,
  AlertTriangle,
  CheckCircle,
  SkipForward,
  History,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

const RecurringBookings = () => {
  const { toast } = useToast();
  const {
    bookings,
    executions,
    isLoading,
    createBooking,
    updateBooking,
    deleteBooking,
    toggleStatus,
    executeBooking,
    skipExecution,
    getDueBookings,
    getUpcomingBookings,
    getNotifications,
    getExecutionHistory,
    getSummary,
    exportBookings,
  } = useRecurringBookings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecurringStatus | 'all'>('all');
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<RecurringBooking>>({
    frequency: 'monthly',
    status: 'active',
    autoBook: false,
    notifyDaysBefore: 3,
    taxRate: 19,
    tags: [],
  });

  const summary = getSummary();
  const dueBookings = getDueBookings();
  const upcomingBookings = getUpcomingBookings(14);
  const notifications = getNotifications();

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.amount || !formData.sollKonto || !formData.habenKonto || !formData.startDate || !formData.nextExecution) {
      toast({
        title: 'Fehler',
        description: 'Bitte alle Pflichtfelder ausfüllen.',
        variant: 'destructive',
      });
      return;
    }
    createBooking(formData as any);
    toast({
      title: 'Dauerbuchung erstellt',
      description: `${formData.name} wurde erfolgreich angelegt.`,
    });
    setNewBookingOpen(false);
    setFormData({
      frequency: 'monthly',
      status: 'active',
      autoBook: false,
      notifyDaysBefore: 3,
      taxRate: 19,
      tags: [],
    });
  };

  const handleExecute = (id: string) => {
    const result = executeBooking(id);
    if (result) {
      toast({
        title: 'Buchung ausgeführt',
        description: `Die Buchung wurde erfolgreich durchgeführt.`,
      });
    }
  };

  const handleSkip = (id: string) => {
    skipExecution(id);
    toast({
      title: 'Buchung übersprungen',
      description: 'Die nächste Ausführung wurde auf den folgenden Termin verschoben.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: RecurringStatus) => {
    const colors: Record<RecurringStatus, string> = {
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-gray-500',
    };
    return <Badge className={colors[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  const getDaysUntilExecution = (nextExecution: string): number => {
    return differenceInDays(new Date(nextExecution), new Date());
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
          <h1 className="text-3xl font-bold">Dauerbuchungen</h1>
          <p className="text-muted-foreground">
            Wiederkehrende Buchungen automatisieren
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBookings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neue Dauerbuchung
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neue Dauerbuchung anlegen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine wiederkehrende Buchung
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Büromiete"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Betrag *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Soll-Konto *</Label>
                    <Input
                      value={formData.sollKonto || ''}
                      onChange={(e) => setFormData({ ...formData, sollKonto: e.target.value })}
                      placeholder="z.B. 4210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Haben-Konto *</Label>
                    <Input
                      value={formData.habenKonto || ''}
                      onChange={(e) => setFormData({ ...formData, habenKonto: e.target.value })}
                      placeholder="z.B. 1200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MwSt.-Satz</Label>
                    <Select
                      value={formData.taxRate?.toString()}
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Frequenz</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(v) => setFormData({ ...formData, frequency: v as RecurringFrequency })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Startdatum *</Label>
                    <Input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, nextExecution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Enddatum (optional)</Label>
                    <Input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatisch buchen</Label>
                      <p className="text-xs text-muted-foreground">Buchung wird automatisch erstellt</p>
                    </div>
                    <Switch
                      checked={formData.autoBook}
                      onCheckedChange={(c) => setFormData({ ...formData, autoBook: c })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Erinnerung (Tage vorher)</Label>
                    <Input
                      type="number"
                      value={formData.notifyDaysBefore || 3}
                      onChange={(e) => setFormData({ ...formData, notifyDaysBefore: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewBookingOpen(false)}>Abbrechen</Button>
                <Button onClick={handleCreate}>Erstellen</Button>
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
                <p className="text-sm text-muted-foreground">Aktive Buchungen</p>
                <p className="text-2xl font-bold">{summary.activeCount}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.pausedCount} pausiert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fällig heute</p>
                <p className="text-2xl font-bold">{summary.dueCount}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${summary.dueCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.upcomingCount} in den nächsten 7 Tagen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monatlich</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.monthlyTotal)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              wiederkehrende Kosten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jährlich</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.yearlyTotal)}</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summary.totalExecutions} Ausführungen gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Due Today Alert */}
      {dueBookings.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Fällige Buchungen
            </CardTitle>
            <CardDescription>
              Diese Buchungen sind heute oder früher fällig
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(booking.amount)} - Fällig: {format(new Date(booking.nextExecution), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSkip(booking.id)}>
                      <SkipForward className="h-4 w-4 mr-1" />
                      Überspringen
                    </Button>
                    <Button size="sm" onClick={() => handleExecute(booking.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Ausführen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle Buchungen</TabsTrigger>
          <TabsTrigger value="anstehend">Anstehend ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="verlauf">Ausführungsverlauf</TabsTrigger>
        </TabsList>

        {/* All Bookings Tab */}
        <TabsContent value="alle" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dauerbuchungen suchen..."
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
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Frequenz</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Konten</TableHead>
                    <TableHead>Nächste Ausführung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Keine Dauerbuchungen gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => {
                      const daysUntil = getDaysUntilExecution(booking.nextExecution);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.name}</p>
                              {booking.description && (
                                <p className="text-sm text-muted-foreground">{booking.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{FREQUENCY_LABELS[booking.frequency]}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(booking.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-red-600">S: {booking.sollKonto}</span>
                              <span className="mx-1">/</span>
                              <span className="text-green-600">H: {booking.habenKonto}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {daysUntil <= 0 ? (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              ) : daysUntil <= 7 ? (
                                <Clock className="h-4 w-4 text-orange-500" />
                              ) : (
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{format(new Date(booking.nextExecution), 'dd.MM.yyyy', { locale: de })}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBookingId(booking.id);
                                  setHistoryDialogOpen(true);
                                }}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStatus(booking.id)}
                              >
                                {booking.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBooking(booking.id)}
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

        {/* Upcoming Tab */}
        <TabsContent value="anstehend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anstehende Buchungen (nächste 14 Tage)</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keine anstehenden Buchungen in den nächsten 14 Tagen
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => {
                    const daysUntil = getDaysUntilExecution(booking.nextExecution);
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-16">
                            <p className="text-2xl font-bold">{daysUntil}</p>
                            <p className="text-xs text-muted-foreground">Tage</p>
                          </div>
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.nextExecution), 'EEEE, dd. MMMM yyyy', { locale: de })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(booking.amount)}</p>
                          <Badge variant="outline">{FREQUENCY_LABELS[booking.frequency]}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="verlauf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ausführungsverlauf</CardTitle>
              <CardDescription>Alle durchgeführten und übersprungenen Buchungen</CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Ausführungen
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Buchung</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      <TableHead>Konten</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions
                      .sort((a, b) => b.executionDate.localeCompare(a.executionDate))
                      .slice(0, 50)
                      .map((exec) => (
                        <TableRow key={exec.id}>
                          <TableCell>
                            {format(new Date(exec.executionDate), 'dd.MM.yyyy', { locale: de })}
                          </TableCell>
                          <TableCell>{exec.recurringName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(exec.amount)}</TableCell>
                          <TableCell>
                            <span className="text-red-600">S: {exec.sollKonto}</span>
                            <span className="mx-1">/</span>
                            <span className="text-green-600">H: {exec.habenKonto}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={exec.status === 'executed' ? 'default' : exec.status === 'skipped' ? 'secondary' : 'outline'}>
                              {exec.status === 'executed' ? 'Ausgeführt' : exec.status === 'skipped' ? 'Übersprungen' : exec.status === 'pending' ? 'Ausstehend' : 'Fehlgeschlagen'}
                            </Badge>
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

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ausführungsverlauf</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {selectedBookingId && getExecutionHistory(selectedBookingId).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Noch keine Ausführungen für diese Buchung
              </p>
            ) : (
              <div className="space-y-2">
                {selectedBookingId && getExecutionHistory(selectedBookingId).map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">
                        {format(new Date(exec.executionDate), 'dd.MM.yyyy', { locale: de })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exec.status === 'executed' ? 'Ausgeführt' : exec.status === 'skipped' ? 'Übersprungen' : 'Ausstehend'}
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(exec.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringBookings;
