import { useState } from 'react';
import { usePeriodClosing, PeriodClosing as PeriodClosingType, CLOSING_STATUS_LABELS, PERIOD_TYPE_LABELS } from '@/hooks/usePeriodClosing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle2, Clock, Lock, Play, Send, Plus, FileCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PeriodClosing = () => {
  const { toast } = useToast();
  const { closings, isLoading, createClosing, startClosing, completeTask, uncompleteTask, submitForReview, closeClosing, lockClosing, getProgress } = usePeriodClosing();

  const [selectedType, setSelectedType] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<PeriodClosingType | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState('');

  const currentYear = new Date().getFullYear();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Offen</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500"><Play className="h-3 w-3 mr-1" />In Bearbeitung</Badge>;
      case 'review': return <Badge className="bg-yellow-500"><Send className="h-3 w-3 mr-1" />Prüfung</Badge>;
      case 'closed': return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Abgeschlossen</Badge>;
      case 'locked': return <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Gesperrt</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPeriodLabel = (closing: PeriodClosingType) => {
    if (closing.type === 'month' && closing.month) {
      return format(new Date(closing.year, closing.month - 1, 1), 'MMMM yyyy', { locale: de });
    } else if (closing.type === 'quarter' && closing.quarter) {
      return `Q${closing.quarter} ${closing.year}`;
    } else {
      return `Jahr ${closing.year}`;
    }
  };

  const handleCreate = () => {
    const month = selectedType === 'month' ? selectedMonth : undefined;
    const quarter = selectedType === 'quarter' ? selectedQuarter : undefined;
    createClosing(selectedType, selectedYear, month, quarter);
    toast({ title: 'Abschluss erstellt', description: `Periodenabschluss wurde angelegt.` });
    setShowCreateDialog(false);
  };

  const handleStart = (closing: PeriodClosingType) => {
    startClosing(closing.id, 'Benutzer');
    toast({ title: 'Abschluss gestartet', description: `${getPeriodLabel(closing)} wurde gestartet.` });
  };

  const handleTaskComplete = () => {
    if (selectedClosing && selectedTaskId) {
      completeTask(selectedClosing.id, selectedTaskId, 'Benutzer', taskNotes || undefined);
      toast({ title: 'Aufgabe erledigt' });
    }
    setShowTaskDialog(false);
    setTaskNotes('');
  };

  const handleTaskUncomplete = (closingId: string, taskId: string) => {
    uncompleteTask(closingId, taskId);
    toast({ title: 'Aufgabe zurückgesetzt' });
  };

  const handleSubmitReview = (closing: PeriodClosingType) => {
    if (submitForReview(closing.id)) {
      toast({ title: 'Zur Prüfung eingereicht', description: 'Der Abschluss wurde zur Prüfung eingereicht.' });
    } else {
      toast({ title: 'Fehler', description: 'Nicht alle Pflichtaufgaben sind erledigt.', variant: 'destructive' });
    }
  };

  const handleClose = (closing: PeriodClosingType) => {
    closeClosing(closing.id, 'Benutzer');
    toast({ title: 'Abschluss durchgeführt', description: `${getPeriodLabel(closing)} wurde abgeschlossen.` });
  };

  const handleLock = (closing: PeriodClosingType) => {
    lockClosing(closing.id, 'Benutzer');
    toast({ title: 'Periode gesperrt', description: `${getPeriodLabel(closing)} wurde gesperrt.` });
  };

  const months = [
    { value: 1, label: 'Januar' }, { value: 2, label: 'Februar' }, { value: 3, label: 'März' },
    { value: 4, label: 'April' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Dezember' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // Sort closings
  const sortedClosings = [...closings].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.type === 'year' || b.type === 'year') return a.type === 'year' ? -1 : 1;
    if (a.type === 'quarter' || b.type === 'quarter') return a.type === 'quarter' ? -1 : 1;
    return (b.month || 0) - (a.month || 0);
  });

  const openClosings = sortedClosings.filter(c => c.status !== 'locked');
  const lockedClosings = sortedClosings.filter(c => c.status === 'locked');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Periodenabschluss</h1>
          <p className="text-muted-foreground">Monats-, Quartals- und Jahresabschlüsse verwalten</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Neuer Abschluss</Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Offen</p><p className="text-2xl font-bold">{closings.filter(c => c.status === 'open').length}</p></div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">In Bearbeitung</p><p className="text-2xl font-bold text-blue-600">{closings.filter(c => c.status === 'in_progress').length}</p></div>
            <Play className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Abgeschlossen</p><p className="text-2xl font-bold text-green-600">{closings.filter(c => c.status === 'closed').length}</p></div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Gesperrt</p><p className="text-2xl font-bold">{closings.filter(c => c.status === 'locked').length}</p></div>
            <Lock className="h-8 w-8 text-red-500" />
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Aktive Abschlüsse ({openClosings.length})</TabsTrigger>
          <TabsTrigger value="locked">Gesperrte Perioden ({lockedClosings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {openClosings.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine aktiven Abschlüsse. Erstellen Sie einen neuen Periodenabschluss.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {openClosings.map((closing) => {
                const progress = getProgress(closing);
                return (
                  <Card key={closing.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {getPeriodLabel(closing)}
                            <Badge variant="outline">{PERIOD_TYPE_LABELS[closing.type]}</Badge>
                          </CardTitle>
                          <CardDescription>{progress.completed} von {progress.total} Aufgaben erledigt</CardDescription>
                        </div>
                        {getStatusBadge(closing.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Fortschritt</span>
                            <span>{progress.percent.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress.percent} className="h-2" />
                        </div>

                        {closing.status !== 'open' && (
                          <div className="space-y-2">
                            {closing.tasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                <Checkbox
                                  checked={task.isCompleted}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedClosing(closing);
                                      setSelectedTaskId(task.id);
                                      setShowTaskDialog(true);
                                    } else {
                                      handleTaskUncomplete(closing.id, task.id);
                                    }
                                  }}
                                  disabled={closing.status === 'closed' || closing.status === 'locked'}
                                />
                                <div className="flex-1">
                                  <p className={`text-sm ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.name}
                                    {task.isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{task.description}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">{task.category}</Badge>
                                {task.isCompleted && task.completedAt && (
                                  <span className="text-xs text-muted-foreground">{format(new Date(task.completedAt), 'dd.MM.', { locale: de })}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {closing.status === 'open' && (
                            <Button onClick={() => handleStart(closing)}><Play className="h-4 w-4 mr-2" />Starten</Button>
                          )}
                          {closing.status === 'in_progress' && (
                            <Button onClick={() => handleSubmitReview(closing)} disabled={progress.requiredCompleted < progress.required}>
                              <Send className="h-4 w-4 mr-2" />Zur Prüfung
                            </Button>
                          )}
                          {closing.status === 'review' && (
                            <Button onClick={() => handleClose(closing)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-4 w-4 mr-2" />Abschließen
                            </Button>
                          )}
                          {closing.status === 'closed' && (
                            <Button variant="destructive" onClick={() => handleLock(closing)}>
                              <Lock className="h-4 w-4 mr-2" />Sperren
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="locked">
          {lockedClosings.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine gesperrten Perioden.</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lockedClosings.map((closing) => (
                <Card key={closing.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{getPeriodLabel(closing)}</p>
                        <p className="text-sm text-muted-foreground">{PERIOD_TYPE_LABELS[closing.type]}</p>
                        {closing.lockedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Gesperrt am {format(new Date(closing.lockedAt), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        )}
                      </div>
                      <Lock className="h-6 w-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuer Periodenabschluss</DialogTitle>
            <DialogDescription>Erstellen Sie einen neuen Abschluss</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Art</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monatsabschluss</SelectItem>
                  <SelectItem value="quarter">Quartalsabschluss</SelectItem>
                  <SelectItem value="year">Jahresabschluss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jahr</label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1, currentYear - 2].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedType === 'month' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Monat</label>
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedType === 'quarter' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Quartal</label>
                <Select value={String(selectedQuarter)} onValueChange={(v) => setSelectedQuarter(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mär)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Okt-Dez)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Complete Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufgabe abschließen</DialogTitle>
            <DialogDescription>Optional: Fügen Sie eine Notiz hinzu</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} placeholder="Optionale Bemerkungen..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Abbrechen</Button>
            <Button onClick={handleTaskComplete}><CheckCircle2 className="h-4 w-4 mr-2" />Erledigt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeriodClosing;
