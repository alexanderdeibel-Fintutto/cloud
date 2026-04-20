import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTaxCalendar, TaxDeadline, TaxDeadlineType, TaxDeadlineStatus } from '@/hooks/useTaxCalendar';
import {
  CalendarDays, AlertTriangle, CheckCircle, Clock, Plus, ChevronLeft, ChevronRight,
  FileText, Euro, AlertCircle, Calendar as CalendarIcon
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<TaxDeadlineStatus, string> = {
  overdue: 'bg-red-100 text-red-800 border-red-200',
  due: 'bg-orange-100 text-orange-800 border-orange-200',
  upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

const STATUS_LABELS: Record<TaxDeadlineStatus, string> = {
  overdue: 'Überfällig',
  due: 'Fällig',
  upcoming: 'Anstehend',
  completed: 'Erledigt',
};

export default function TaxCalendar() {
  const {
    deadlines,
    completeDeadline,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    getDeadlinesForMonth,
    getUpcomingDeadlines,
    stats,
    typeLabels,
  } = useTaxCalendar();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<TaxDeadline | null>(null);

  // New deadline form
  const [newDeadline, setNewDeadline] = useState({
    type: 'custom' as TaxDeadlineType,
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    reminderDays: 7,
    filingRequired: true,
    paymentRequired: false,
    recurring: false,
    recurrenceMonths: 1,
  });

  const monthDeadlines = getDeadlinesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const upcomingDeadlines = getUpcomingDeadlines(30);

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get deadlines for a specific day
  const getDeadlinesForDay = (date: Date): TaxDeadline[] => {
    return deadlines.filter(d => isSameDay(new Date(d.dueDate), date));
  };

  const handleAddDeadline = () => {
    if (!newDeadline.title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    addDeadline({
      type: newDeadline.type,
      title: newDeadline.title,
      description: newDeadline.description,
      dueDate: new Date(newDeadline.dueDate).toISOString(),
      reminderDays: newDeadline.reminderDays,
      filingRequired: newDeadline.filingRequired,
      paymentRequired: newDeadline.paymentRequired,
      recurring: newDeadline.recurring,
      recurrenceMonths: newDeadline.recurrenceMonths,
    });

    toast.success('Termin hinzugefügt');
    setAddDialogOpen(false);
    setNewDeadline({
      type: 'custom',
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      reminderDays: 7,
      filingRequired: true,
      paymentRequired: false,
      recurring: false,
      recurrenceMonths: 1,
    });
  };

  const handleComplete = (id: string) => {
    completeDeadline(id);
    toast.success('Termin als erledigt markiert');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8" />
            Steuerkalender
          </h1>
          <p className="text-muted-foreground">Alle Steuertermine und Fristen im Überblick</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Termin hinzufügen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Überfällig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <Clock className="h-4 w-4" />
              Fällig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.due}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diesen Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Abgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFilings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Zahlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Heute
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {calendarDays.map((day) => {
                const dayDeadlines = getDeadlinesForDay(day);
                const hasOverdue = dayDeadlines.some(d => d.status === 'overdue');
                const hasDue = dayDeadlines.some(d => d.status === 'due');
                const hasUpcoming = dayDeadlines.some(d => d.status === 'upcoming');

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square p-1 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors relative',
                      isToday(day) && 'bg-primary/10 border-primary',
                      selectedDate && isSameDay(day, selectedDate) && 'ring-2 ring-primary',
                    )}
                  >
                    <div className="text-sm font-medium">{format(day, 'd')}</div>
                    {dayDeadlines.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                        {hasOverdue && <div className="h-1.5 flex-1 rounded bg-red-500" />}
                        {hasDue && <div className="h-1.5 flex-1 rounded bg-orange-500" />}
                        {hasUpcoming && <div className="h-1.5 flex-1 rounded bg-blue-500" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected day details */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">
                  {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
                </h4>
                {getDeadlinesForDay(selectedDate).length === 0 ? (
                  <p className="text-muted-foreground text-sm">Keine Termine an diesem Tag</p>
                ) : (
                  <div className="space-y-2">
                    {getDeadlinesForDay(selectedDate).map(deadline => (
                      <div
                        key={deadline.id}
                        className={cn('p-2 rounded-lg border flex items-center justify-between', STATUS_COLORS[deadline.status])}
                      >
                        <div>
                          <div className="font-medium">{deadline.title}</div>
                          <div className="text-xs">{typeLabels[deadline.type]?.de}</div>
                        </div>
                        {deadline.status !== 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleComplete(deadline.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Nächste Termine</CardTitle>
            <CardDescription>Die nächsten 30 Tage</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Keine anstehenden Termine</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map(deadline => (
                    <div
                      key={deadline.id}
                      className={cn('p-3 rounded-lg border', STATUS_COLORS[deadline.status])}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{deadline.title}</div>
                          <div className="text-xs mt-1">
                            {format(new Date(deadline.dueDate), 'dd.MM.yyyy', { locale: de })}
                          </div>
                          <div className="flex gap-1 mt-2">
                            {deadline.filingRequired && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Abgabe
                              </Badge>
                            )}
                            {deadline.paymentRequired && (
                              <Badge variant="outline" className="text-xs">
                                <Euro className="h-3 w-3 mr-1" />
                                Zahlung
                              </Badge>
                            )}
                          </div>
                        </div>
                        {deadline.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleComplete(deadline.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Deadline Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Termin hinzufügen</DialogTitle>
            <DialogDescription>Erstellen Sie einen benutzerdefinierten Steuertermin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={newDeadline.type}
                onValueChange={(v) => setNewDeadline(prev => ({ ...prev, type: v as TaxDeadlineType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.de}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={newDeadline.title}
                onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Umsatzsteuer Q1"
              />
            </div>
            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <Input
                type="date"
                value={newDeadline.dueDate}
                onChange={(e) => setNewDeadline(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Erinnerung (Tage vorher)</Label>
              <Input
                type="number"
                value={newDeadline.reminderDays}
                onChange={(e) => setNewDeadline(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 7 }))}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filing"
                  checked={newDeadline.filingRequired}
                  onCheckedChange={(checked) => setNewDeadline(prev => ({ ...prev, filingRequired: !!checked }))}
                />
                <Label htmlFor="filing">Abgabe erforderlich</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="payment"
                  checked={newDeadline.paymentRequired}
                  onCheckedChange={(checked) => setNewDeadline(prev => ({ ...prev, paymentRequired: !!checked }))}
                />
                <Label htmlFor="payment">Zahlung erforderlich</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAddDeadline}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
