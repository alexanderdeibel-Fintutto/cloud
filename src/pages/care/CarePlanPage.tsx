import { useMemo, useState } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Droplets,
  Leaf,
  FlowerIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarClock,
  Home,
  DoorOpen,
  Sparkles,
  ListChecks,
  Zap,
} from 'lucide-react';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { CareReminder } from '@/types';
import { toast } from 'sonner';

const careTypeConfig: Record<string, { label: string; icon: typeof Droplets; color: string }> = {
  water: { label: 'Giessen', icon: Droplets, color: 'text-blue-500' },
  fertilize: { label: 'Duengen', icon: Leaf, color: 'text-green-500' },
  repot: { label: 'Umtopfen', icon: FlowerIcon, color: 'text-amber-600' },
};

function ReminderCard({
  reminder,
  variant,
  onMarkDone,
  selected,
  onToggleSelect,
  selectionMode,
}: {
  reminder: CareReminder;
  variant: 'overdue' | 'today' | 'upcoming';
  onMarkDone: (reminder: CareReminder) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}) {
  const config = careTypeConfig[reminder.type] || careTypeConfig.water;
  const Icon = config.icon;
  const plant = reminder.plant;
  const dueDate = parseISO(reminder.due_date);

  const borderColor =
    variant === 'overdue'
      ? 'border-l-red-500'
      : variant === 'today'
        ? 'border-l-amber-500'
        : 'border-l-green-500';

  const bgColor =
    variant === 'overdue'
      ? 'bg-red-50 dark:bg-red-950/20'
      : variant === 'today'
        ? 'bg-amber-50 dark:bg-amber-950/20'
        : 'bg-green-50 dark:bg-green-950/20';

  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-l-4 ${borderColor} ${bgColor} p-4 transition-all hover:shadow-sm ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-center gap-3">
        {selectionMode && onToggleSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(reminder.id)}
            className="h-5 w-5"
          />
        )}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-sm ${config.color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">
            {plant?.nickname || 'Unbekannte Pflanze'}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {plant?.species?.common_name && (
              <span>{plant.species.common_name}</span>
            )}
            <span>-</span>
            <span className={config.color}>{config.label}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {format(dueDate, 'EEEE, dd. MMM', { locale: de })}
            </span>
            {plant?.room?.apartment && (
              <span className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {plant.room.apartment.name}
              </span>
            )}
            {plant?.room && (
              <span className="flex items-center gap-1">
                <DoorOpen className="h-3 w-3" />
                {plant.room.name}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant={variant === 'overdue' ? 'destructive' : 'default'}
        onClick={() => onMarkDone(reminder)}
        className="flex-shrink-0"
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Erledigt
      </Button>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon: typeof Sparkles }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function CarePlanPage() {
  const { getOverdueReminders, getTodayReminders, getUpcomingReminders, logCareEvent } = usePlants();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const overdueReminders = useMemo(() => {
    return getOverdueReminders().filter(r => {
      const dueDate = parseISO(r.due_date);
      return isBefore(dueDate, startOfDay(new Date()));
    });
  }, [getOverdueReminders]);

  const todayReminders = useMemo(() => getTodayReminders(), [getTodayReminders]);
  const upcomingReminders = useMemo(() => getUpcomingReminders(7), [getUpcomingReminders]);

  const allReminders = useMemo(
    () => [...overdueReminders, ...todayReminders, ...upcomingReminders],
    [overdueReminders, todayReminders, upcomingReminders]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchMarkDone = () => {
    const remindersToComplete = allReminders.filter((r) => selectedIds.has(r.id));
    const now = new Date().toISOString();
    remindersToComplete.forEach((reminder) => {
      logCareEvent({
        plant_id: reminder.plant_id,
        type: reminder.type,
        performed_at: now,
        notes: '',
      });
    });
    toast.success(`${remindersToComplete.length} Aufgaben erledigt!`, {
      description: 'Alle ausgewaehlten Pflegeaufgaben wurden abgehakt.',
    });
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBatchAllOverdue = () => {
    if (overdueReminders.length === 0) return;
    const now = new Date().toISOString();
    overdueReminders.forEach((reminder) => {
      logCareEvent({
        plant_id: reminder.plant_id,
        type: reminder.type,
        performed_at: now,
        notes: '',
      });
    });
    toast.success(`${overdueReminders.length} ueberfaellige Aufgaben erledigt!`, {
      description: 'Alle ueberfaelligen Pflanzen wurden gepflegt.',
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
    });
  };

  const handleBatchAllToday = () => {
    if (todayReminders.length === 0) return;
    const now = new Date().toISOString();
    todayReminders.forEach((reminder) => {
      logCareEvent({
        plant_id: reminder.plant_id,
        type: reminder.type,
        performed_at: now,
        notes: '',
      });
    });
    toast.success(`${todayReminders.length} heutige Aufgaben erledigt!`, {
      description: 'Alle heutigen Pflanzen wurden gepflegt.',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    });
  };

  const handleSelectAll = (reminders: CareReminder[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = reminders.every((r) => next.has(r.id));
      if (allSelected) {
        reminders.forEach((r) => next.delete(r.id));
      } else {
        reminders.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const handleMarkDone = (reminder: CareReminder) => {
    const now = new Date().toISOString();
    logCareEvent({
      plant_id: reminder.plant_id,
      type: reminder.type,
      performed_at: now,
      notes: '',
    });

    const config = careTypeConfig[reminder.type];
    const plantName = reminder.plant?.nickname || 'Pflanze';

    if (reminder.type === 'water') {
      toast.success(`${plantName} gegossen!`, {
        description: 'Die naechste Erinnerung wird automatisch berechnet.',
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
      });
    } else if (reminder.type === 'fertilize') {
      toast.success(`${plantName} geduengt!`, {
        description: 'Die naechste Erinnerung wird automatisch berechnet.',
        icon: <Leaf className="h-5 w-5 text-green-500" />,
      });
    } else {
      toast.success(`${config?.label || 'Pflege'} fuer ${plantName} erledigt!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="h-7 w-7 text-primary" />
            Pflege & Giessplan
          </h1>
          <p className="text-muted-foreground mt-1">
            Behalte den Ueberblick ueber die Pflege deiner Pflanzen.
          </p>
        </div>
        <div className="flex gap-2">
          {selectionMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds(new Set());
                }}
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                onClick={handleBatchMarkDone}
                disabled={selectedIds.size === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                {selectedIds.size} erledigen
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectionMode(true)}
              >
                <ListChecks className="mr-1 h-4 w-4" />
                Auswaehlen
              </Button>
              {overdueReminders.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBatchAllOverdue}
                >
                  <Zap className="mr-1 h-4 w-4" />
                  Alle ueberfaelligen erledigen
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={overdueReminders.length > 0 ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueReminders.length}</p>
              <p className="text-sm text-muted-foreground">Ueberfaellig</p>
            </div>
          </CardContent>
        </Card>
        <Card className={todayReminders.length > 0 ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayReminders.length}</p>
              <p className="text-sm text-muted-foreground">Heute</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
              <CalendarClock className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingReminders.length}</p>
              <p className="text-sm text-muted-foreground">Diese Woche</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overdue">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overdue" className="relative">
            Ueberfaellig
            {overdueReminders.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {overdueReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">
            Heute
            {todayReminders.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-amber-500">
                {todayReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Diese Woche
            {upcomingReminders.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {upcomingReminders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-3 mt-4">
          {overdueReminders.length === 0 ? (
            <EmptyState
              message="Keine ueberfaelligen Aufgaben. Gut gemacht!"
              icon={Sparkles}
            />
          ) : (
            <>
              {selectionMode && overdueReminders.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => handleSelectAll(overdueReminders)}
                >
                  {overdueReminders.every((r) => selectedIds.has(r.id))
                    ? 'Alle abwaehlen'
                    : 'Alle auswaehlen'}
                </Button>
              )}
              {overdueReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  variant="overdue"
                  onMarkDone={handleMarkDone}
                  selected={selectedIds.has(reminder.id)}
                  onToggleSelect={handleToggleSelect}
                  selectionMode={selectionMode}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-3 mt-4">
          {todayReminders.length === 0 ? (
            <EmptyState
              message="Heute steht nichts an. Geniesse den Tag!"
              icon={Sparkles}
            />
          ) : (
            <>
              {!selectionMode && todayReminders.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchAllToday}
                    className="text-xs"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    Alle heutigen erledigen
                  </Button>
                </div>
              )}
              {selectionMode && todayReminders.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => handleSelectAll(todayReminders)}
                >
                  {todayReminders.every((r) => selectedIds.has(r.id))
                    ? 'Alle abwaehlen'
                    : 'Alle auswaehlen'}
                </Button>
              )}
              {todayReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  variant="today"
                  onMarkDone={handleMarkDone}
                  selected={selectedIds.has(reminder.id)}
                  onToggleSelect={handleToggleSelect}
                  selectionMode={selectionMode}
                />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcomingReminders.length === 0 ? (
            <EmptyState
              message="Keine Aufgaben in den naechsten 7 Tagen."
              icon={CalendarClock}
            />
          ) : (
            <>
              {selectionMode && upcomingReminders.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => handleSelectAll(upcomingReminders)}
                >
                  {upcomingReminders.every((r) => selectedIds.has(r.id))
                    ? 'Alle abwaehlen'
                    : 'Alle auswaehlen'}
                </Button>
              )}
              {upcomingReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  variant="upcoming"
                  onMarkDone={handleMarkDone}
                  selected={selectedIds.has(reminder.id)}
                  onToggleSelect={handleToggleSelect}
                  selectionMode={selectionMode}
                />
              ))}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
