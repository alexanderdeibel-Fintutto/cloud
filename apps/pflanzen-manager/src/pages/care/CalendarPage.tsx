import { useState, useMemo, useCallback } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
  Download,
  Home,
  DoorOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  format,
  parseISO,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CareReminder } from '@/types';
import { generateICSCalendar, downloadICSFile } from '@/lib/calendar';
import { toast } from 'sonner';

const careTypeColors: Record<string, string> = {
  water: 'bg-blue-500',
  fertilize: 'bg-green-500',
  repot: 'bg-amber-500',
};

const careTypeLabels: Record<string, string> = {
  water: 'Giessen',
  fertilize: 'Duengen',
  repot: 'Umtopfen',
};

export default function CalendarPage() {
  const { getReminders, logCareEvent, getEnrichedPlants } = usePlants();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const reminders = useMemo(() => getReminders(), [getReminders]);

  // Build a map of date -> reminders for quick lookup
  const remindersByDate = useMemo(() => {
    const map = new Map<string, CareReminder[]>();
    reminders.forEach(r => {
      const key = r.due_date; // already yyyy-MM-dd
      const existing = map.get(key) || [];
      existing.push(r);
      map.set(key, existing);
    });
    return map;
  }, [reminders]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: de });
    const calEnd = endOfWeek(monthEnd, { locale: de });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDayNames = useMemo(() => {
    const start = startOfWeek(new Date(), { locale: de });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'EEEEEE', { locale: de })
    );
  }, []);

  const getRemindersForDate = useCallback(
    (date: Date): CareReminder[] => {
      const key = format(date, 'yyyy-MM-dd');
      return remindersByDate.get(key) || [];
    },
    [remindersByDate]
  );

  const selectedDateReminders = useMemo(() => {
    if (!selectedDate) return [];
    return getRemindersForDate(selectedDate);
  }, [selectedDate, getRemindersForDate]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleMarkDone = (reminder: CareReminder) => {
    logCareEvent({
      plant_id: reminder.plant_id,
      type: reminder.type,
      performed_at: new Date().toISOString(),
      notes: '',
    });
    const plantName = reminder.plant?.nickname || 'Pflanze';
    toast.success(`${careTypeLabels[reminder.type]} fuer ${plantName} erledigt!`);
  };

  const handleExportCalendar = () => {
    const enrichedPlants = getEnrichedPlants();
    const events = reminders.map(r => {
      const plant = r.plant || enrichedPlants.find(p => p.id === r.plant_id);
      const plantName = plant?.nickname || plant?.species?.common_name || 'Pflanze';
      const dueDate = parseISO(r.due_date);
      const startDate = new Date(dueDate);
      startDate.setHours(9, 0, 0);
      const endDate = new Date(dueDate);
      endDate.setHours(9, 30, 0);

      return {
        title: `${careTypeLabels[r.type]}: ${plantName}`,
        description: `${careTypeLabels[r.type]} fuer ${plantName}`,
        startDate,
        endDate,
        location: plant?.room?.apartment?.name,
      };
    });

    const icsContent = generateICSCalendar(events);
    downloadICSFile(icsContent, 'pflanzen-giessplan.ics');
    toast.success('Kalender exportiert!', {
      description: 'Die .ics-Datei wurde heruntergeladen.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-primary" />
            Pflegekalender
          </h1>
          <p className="text-muted-foreground mt-1">
            Monatsansicht aller anstehenden Pflegeaufgaben.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCalendar}>
          <Download className="h-4 w-4 mr-2" />
          Kalender exportieren
        </Button>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy', { locale: de })}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs">
                Heute
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDayNames.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {calendarDays.map((day, i) => {
              const dayReminders = getRemindersForDate(day);
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

              // Count by type for dots
              const hasWater = dayReminders.some(r => r.type === 'water');
              const hasFertilize = dayReminders.some(r => r.type === 'fertilize');
              const hasRepot = dayReminders.some(r => r.type === 'repot');

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[72px] p-1.5 text-left bg-background transition-colors hover:bg-muted/50
                    ${!inMonth ? 'opacity-40' : ''}
                    ${today ? 'ring-2 ring-primary ring-inset' : ''}
                    ${isSelected ? 'bg-primary/10' : ''}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium
                      ${today ? 'text-primary font-bold' : ''}
                      ${!inMonth ? 'text-muted-foreground' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {/* Dots */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {hasWater && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Giessen" />
                    )}
                    {hasFertilize && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Duengen" />
                    )}
                    {hasRepot && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Umtopfen" />
                    )}
                  </div>
                  {/* Count badge for many items */}
                  {dayReminders.length > 3 && (
                    <span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground">
                      +{dayReminders.length - 3}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm text-muted-foreground">
            <span className="font-medium">Legende:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Giessen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Duengen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Umtopfen
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={selectedDate !== null} onOpenChange={open => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate
                ? format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedDateReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>Keine Pflegeaufgaben an diesem Tag.</p>
              </div>
            ) : (
              selectedDateReminders.map(reminder => {
                const plant = reminder.plant;
                const typeColor = careTypeColors[reminder.type] || 'bg-gray-500';

                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${typeColor}`}
                      >
                        {reminder.type === 'water' ? (
                          <Droplets className="h-4 w-4" />
                        ) : (
                          <Leaf className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {plant?.nickname || 'Unbekannte Pflanze'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{careTypeLabels[reminder.type]}</span>
                          {plant?.room?.apartment && (
                            <>
                              <span>-</span>
                              <span className="flex items-center gap-0.5">
                                <Home className="h-3 w-3" />
                                {plant.room.apartment.name}
                              </span>
                            </>
                          )}
                          {plant?.room && (
                            <span className="flex items-center gap-0.5">
                              <DoorOpen className="h-3 w-3" />
                              {plant.room.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkDone(reminder)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
