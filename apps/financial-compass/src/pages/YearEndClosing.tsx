import { useState } from 'react';
import {
  useYearEndClosing,
  YearEndClosing as YearEndClosingType,
  ClosingTask,
  ClosingStep,
} from '@/hooks/useYearEndClosing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  BarChart3,
  Calculator,
  Building2,
  Banknote,
  ClipboardCheck,
  XCircle,
  SkipForward,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STEP_ICONS: Record<ClosingStep, any> = {
  preparation: ClipboardCheck,
  inventory: Building2,
  accruals: FileText,
  depreciation: Calculator,
  provisions: Banknote,
  reconciliation: BarChart3,
  adjustments: FileText,
  closing_entries: FileText,
  trial_balance: BarChart3,
  financial_statements: FileText,
  review: CheckCircle2,
  completed: Lock,
};

export default function YearEndClosing() {
  const { toast } = useToast();
  const {
    closings,
    checklist,
    isLoading,
    closingSteps,
    startClosing,
    getClosingByYear,
    updateTaskStatus,
    completeClosing,
    reopenClosing,
    updateChecklistItem,
    resetChecklist,
    getProgress,
    getStepProgress,
    getChecklistProgress,
  } = useYearEndClosing();

  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);
  const [selectedClosing, setSelectedClosing] = useState<YearEndClosingType | null>(null);
  const [profitLoss, setProfitLoss] = useState<number>(0);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleStartClosing = () => {
    if (getClosingByYear(selectedYear)) {
      toast({ title: 'Fehler', description: 'Für dieses Jahr existiert bereits ein Abschluss', variant: 'destructive' });
      return;
    }
    const newClosing = startClosing(selectedYear);
    setSelectedClosing(newClosing);
    setIsStartDialogOpen(false);
    toast({ title: 'Jahresabschluss gestartet', description: `Geschäftsjahr ${selectedYear}` });
  };

  const handleCompleteClosing = () => {
    if (!selectedClosing) return;
    completeClosing(selectedClosing.id, profitLoss, 'Benutzer');
    setSelectedClosing(getClosingByYear(selectedClosing.fiscalYear) || null);
    setIsCompleteDialogOpen(false);
    toast({ title: 'Jahresabschluss abgeschlossen' });
  };

  const handleTaskStatusChange = (taskId: string, status: ClosingTask['status']) => {
    if (!selectedClosing) return;
    updateTaskStatus(selectedClosing.id, taskId, status);
    setSelectedClosing(getClosingByYear(selectedClosing.fiscalYear) || null);
  };

  const getTaskIcon = (status: ClosingTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped': return <SkipForward className="h-5 w-5 text-gray-400" />;
      case 'blocked': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const checklistProgress = getChecklistProgress();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jahresabschluss</h1>
          <p className="text-muted-foreground">
            Strukturierter Workflow für den Jahresabschluss
          </p>
        </div>
        <div className="flex gap-2">
          {closings.length > 0 && (
            <Select
              value={selectedClosing?.id || ''}
              onValueChange={(id) => setSelectedClosing(closings.find(c => c.id === id) || null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Abschluss wählen" />
              </SelectTrigger>
              <SelectContent>
                {closings.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fiscalYear} - {c.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => setIsStartDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Abschluss
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {closings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offene Abschlüsse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closings.filter(c => c.status !== 'completed').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abgeschlossen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{closings.filter(c => c.status === 'completed').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checkliste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checklistProgress.checked}/{checklistProgress.total}</div>
              <Progress value={checklistProgress.percentage} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nächster Schritt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {selectedClosing && closingSteps.find(s => s.step === selectedClosing.currentStep)?.label || '-'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {!selectedClosing && closings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Kein Jahresabschluss aktiv</h3>
            <p className="text-muted-foreground mb-4">Starten Sie einen neuen Jahresabschluss</p>
            <Button onClick={() => setIsStartDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Jahresabschluss starten
            </Button>
          </CardContent>
        </Card>
      ) : selectedClosing ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Progress Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                GJ {selectedClosing.fiscalYear}
              </CardTitle>
              <CardDescription>
                {format(new Date(selectedClosing.startDate), 'dd.MM.yyyy')} - {format(new Date(selectedClosing.endDate), 'dd.MM.yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fortschritt</span>
                  <span className="text-sm text-muted-foreground">
                    {getProgress(selectedClosing.id).percentage}%
                  </span>
                </div>
                <Progress value={getProgress(selectedClosing.id).percentage} />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                {closingSteps.map((step, index) => {
                  const StepIcon = STEP_ICONS[step.step];
                  const isActive = selectedClosing.currentStep === step.step;
                  const stepProgress = getStepProgress(selectedClosing.id, step.step);
                  const isCompleted = stepProgress.completed === stepProgress.total && stepProgress.total > 0;

                  return (
                    <div
                      key={step.step}
                      className={`flex items-center gap-3 p-2 rounded-lg ${isActive ? 'bg-primary/10 border border-primary/20' : ''}`}
                    >
                      <div className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stepProgress.completed}/{stepProgress.total} Aufgaben
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedClosing.status !== 'completed' && getProgress(selectedClosing.id).percentage === 100 && (
                <>
                  <Separator className="my-4" />
                  <Button
                    className="w-full"
                    onClick={() => setIsCompleteDialogOpen(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Abschluss finalisieren
                  </Button>
                </>
              )}

              {selectedClosing.status === 'completed' && (
                <>
                  <Separator className="my-4" />
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-700">Abgeschlossen</p>
                    <p className="text-sm text-green-600">
                      {selectedClosing.closingDate && format(new Date(selectedClosing.closingDate), 'dd.MM.yyyy', { locale: de })}
                    </p>
                    {selectedClosing.profitLoss !== undefined && (
                      <p className="text-lg font-bold mt-2 text-green-700">
                        {selectedClosing.profitLoss >= 0 ? 'Gewinn' : 'Verlust'}: {Math.abs(selectedClosing.profitLoss).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Aufgaben</CardTitle>
              <CardDescription>
                Arbeiten Sie die Aufgaben Schritt für Schritt ab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue={selectedClosing.currentStep}>
                {closingSteps.filter(s => s.step !== 'completed').map((step) => {
                  const stepTasks = selectedClosing.tasks.filter(t => t.step === step.step);
                  const StepIcon = STEP_ICONS[step.step];

                  return (
                    <AccordionItem key={step.step} value={step.step}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <StepIcon className="h-5 w-5" />
                          <span>{step.label}</span>
                          <Badge variant="secondary" className="ml-2">
                            {stepTasks.filter(t => t.status === 'completed').length}/{stepTasks.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                        <div className="space-y-2">
                          {stepTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                task.status === 'completed' ? 'bg-green-50 border-green-200' :
                                task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                                'bg-white'
                              }`}
                            >
                              <button
                                onClick={() => handleTaskStatusChange(
                                  task.id,
                                  task.status === 'completed' ? 'pending' :
                                  task.status === 'in_progress' ? 'completed' : 'in_progress'
                                )}
                                disabled={selectedClosing.status === 'completed'}
                              >
                                {getTaskIcon(task.status)}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </p>
                                  {task.required && (
                                    <Badge variant="outline" className="text-xs">Pflicht</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                              {selectedClosing.status !== 'completed' && !task.required && task.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTaskStatusChange(task.id, 'skipped')}
                                >
                                  <SkipForward className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Checklist Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Allgemeine Checkliste</CardTitle>
              <CardDescription>Wichtige Punkte vor dem Jahresabschluss</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetChecklist}>
              Zurücksetzen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {['Unterlagen', 'Abstimmung', 'Steuern', 'Anlagen', 'Prüfung'].map(category => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                {checklist.filter(item => item.category === category).map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => updateChecklistItem(item.id, !!checked)}
                    />
                    <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Start Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Jahresabschluss starten</DialogTitle>
            <DialogDescription>
              Wählen Sie das Geschäftsjahr für den Abschluss
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Geschäftsjahr</Label>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem
                      key={year}
                      value={String(year)}
                      disabled={!!getClosingByYear(year)}
                    >
                      {year} {getClosingByYear(year) ? '(bereits vorhanden)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Der Jahresabschluss enthält 34 Aufgaben in 11 Schritten und führt Sie
                strukturiert durch alle notwendigen Abschlussbuchungen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStartClosing}>
              Abschluss starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jahresabschluss finalisieren</DialogTitle>
            <DialogDescription>
              Geben Sie das Jahresergebnis ein und schließen Sie das Geschäftsjahr ab
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Jahresergebnis (Gewinn/Verlust)</Label>
              <Input
                type="number"
                step="0.01"
                value={profitLoss || ''}
                onChange={(e) => setProfitLoss(parseFloat(e.target.value) || 0)}
                placeholder="Positiv = Gewinn, Negativ = Verlust"
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Achtung</p>
                  <p className="text-sm text-yellow-700">
                    Nach dem Finalisieren können keine weiteren Änderungen vorgenommen werden.
                    Stellen Sie sicher, dass alle Aufgaben abgeschlossen sind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCompleteClosing}>
              <Lock className="h-4 w-4 mr-2" />
              Abschluss finalisieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
