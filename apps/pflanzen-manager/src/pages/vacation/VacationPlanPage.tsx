import { useState, useMemo } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, eachDayOfInterval, addDays, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  generateICSCalendar,
  downloadICSFile,
  generateGoogleCalendarUrl,
  vacationTasksToCalendarEvents,
  generateVacationPlanEmail,
} from '@/lib/calendar';
import { toast } from 'sonner';
import {
  Plane,
  Plus,
  Calendar,
  Users,
  ClipboardList,
  Download,
  ExternalLink,
  Mail,
  Trash2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Sparkles,
  Wind,
  UserPlus,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import type { VacationPlan, VacationTask, VacationHelper } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const TASK_TYPE_ICONS: Record<string, typeof Droplets> = {
  water: Droplets,
  fertilize: Sparkles,
  mist: Wind,
};

const TASK_TYPE_LABELS: Record<string, string> = {
  water: 'Giessen',
  fertilize: 'Duengen',
  mist: 'Besprühen',
};

const TASK_TYPE_COLORS: Record<string, string> = {
  water: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  fertilize: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  mist: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function VacationPlanPage() {
  const {
    vacationPlans,
    plants,
    getEnrichedPlants,
    addVacationPlan,
    updateVacationPlan,
    deleteVacationPlan,
  } = usePlants();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanStart, setNewPlanStart] = useState('');
  const [newPlanEnd, setNewPlanEnd] = useState('');
  const [newPlanNotes, setNewPlanNotes] = useState('');

  // Helper form state
  const [showHelperDialog, setShowHelperDialog] = useState(false);
  const [helperName, setHelperName] = useState('');
  const [helperEmail, setHelperEmail] = useState('');

  // Delete confirmation
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);

  // Generate watering tasks based on plant schedules during vacation period
  function generateTasksForPlan(startDate: string, endDate: string): VacationTask[] {
    const tasks: VacationTask[] = [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = eachDayOfInterval({ start, end });

    enrichedPlants.forEach((plant) => {
      if (!plant.species) return;

      const waterFreq = plant.water_frequency_override || plant.species.water_frequency_days;
      const fertilizeFreq = plant.fertilize_frequency_override || plant.species.fertilize_frequency_days;
      const currentMonth = new Date().getMonth() + 1;
      const shouldFertilize = plant.species.fertilize_months.includes(currentMonth);

      // Calculate which days need watering
      const lastWatered = plant.last_watered ? parseISO(plant.last_watered) : parseISO(plant.created_at);
      const daysSinceWater = differenceInDays(start, lastWatered);
      const firstWaterOffset = waterFreq - (daysSinceWater % waterFreq);

      days.forEach((day, index) => {
        // Watering tasks
        if ((index + firstWaterOffset) % waterFreq === 0 || (index === 0 && daysSinceWater >= waterFreq)) {
          tasks.push({
            id: generateId(),
            vacation_plan_id: '', // Set later
            plant_id: plant.id,
            helper_id: null,
            task_date: format(day, 'yyyy-MM-dd'),
            task_type: 'water',
            instructions: `${plant.nickname || plant.species?.common_name} giessen (${plant.species?.water_amount === 'much' ? 'viel' : plant.species?.water_amount === 'little' ? 'wenig' : 'maessig'} Wasser)`,
            completed: false,
            plant,
          });
        }

        // Fertilizing tasks (only during active months)
        if (shouldFertilize && fertilizeFreq > 0) {
          const lastFertilized = plant.last_fertilized ? parseISO(plant.last_fertilized) : parseISO(plant.created_at);
          const daysSinceFertilize = differenceInDays(start, lastFertilized);
          const firstFertOffset = fertilizeFreq - (daysSinceFertilize % fertilizeFreq);
          if ((index + firstFertOffset) % fertilizeFreq === 0) {
            tasks.push({
              id: generateId(),
              vacation_plan_id: '',
              plant_id: plant.id,
              helper_id: null,
              task_date: format(day, 'yyyy-MM-dd'),
              task_type: 'fertilize',
              instructions: `${plant.nickname || plant.species?.common_name} düngen`,
              completed: false,
              plant,
            });
          }
        }

        // Misting for high-humidity plants (every 2 days)
        if (plant.species?.humidity === 'high' && index % 2 === 0) {
          tasks.push({
            id: generateId(),
            vacation_plan_id: '',
            plant_id: plant.id,
            helper_id: null,
            task_date: format(day, 'yyyy-MM-dd'),
            task_type: 'mist',
            instructions: `${plant.nickname || plant.species?.common_name} besprühen (hohe Luftfeuchtigkeit benötigt)`,
            completed: false,
            plant,
          });
        }
      });
    });

    return tasks.sort((a, b) => a.task_date.localeCompare(b.task_date));
  }

  function handleCreatePlan() {
    if (!newPlanName.trim() || !newPlanStart || !newPlanEnd) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    if (parseISO(newPlanEnd) <= parseISO(newPlanStart)) {
      toast.error('Das Enddatum muss nach dem Startdatum liegen');
      return;
    }

    const plan = addVacationPlan({
      name: newPlanName.trim(),
      start_date: newPlanStart,
      end_date: newPlanEnd,
      notes: newPlanNotes.trim(),
    });

    // Generate tasks
    const tasks = generateTasksForPlan(newPlanStart, newPlanEnd).map((t) => ({
      ...t,
      vacation_plan_id: plan.id,
    }));

    updateVacationPlan(plan.id, { tasks });

    // Reset form
    setNewPlanName('');
    setNewPlanStart('');
    setNewPlanEnd('');
    setNewPlanNotes('');
    setShowCreateForm(false);
    setExpandedPlanId(plan.id);
    toast.success(`Urlaubsplan "${plan.name}" erstellt mit ${tasks.length} Aufgaben`);
  }

  function handleAddHelper(planId: string) {
    if (!helperName.trim() || !helperEmail.trim()) {
      toast.error('Bitte Name und E-Mail angeben');
      return;
    }

    const plan = vacationPlans.find((p) => p.id === planId);
    if (!plan) return;

    const helper: VacationHelper = {
      id: generateId(),
      vacation_plan_id: planId,
      name: helperName.trim(),
      email: helperEmail.trim(),
      invited_at: new Date().toISOString(),
      accepted: null,
      calendar_exported: false,
    };

    updateVacationPlan(planId, { helpers: [...plan.helpers, helper] });
    setHelperName('');
    setHelperEmail('');
    setShowHelperDialog(false);
    toast.success(`${helper.name} als Helfer hinzugefügt`);
  }

  function handleRemoveHelper(planId: string, helperId: string) {
    const plan = vacationPlans.find((p) => p.id === planId);
    if (!plan) return;

    const helpers = plan.helpers.filter((h) => h.id !== helperId);
    // Unassign tasks from removed helper
    const tasks = plan.tasks.map((t) =>
      t.helper_id === helperId ? { ...t, helper_id: null } : t
    );
    updateVacationPlan(planId, { helpers, tasks });
    toast.success('Helfer entfernt');
  }

  function handleAssignHelper(planId: string, taskId: string, helperId: string | null) {
    const plan = vacationPlans.find((p) => p.id === planId);
    if (!plan) return;

    const tasks = plan.tasks.map((t) =>
      t.id === taskId ? { ...t, helper_id: helperId } : t
    );
    updateVacationPlan(planId, { tasks });
  }

  function handleAutoAssignTasks(planId: string) {
    const plan = vacationPlans.find((p) => p.id === planId);
    if (!plan || plan.helpers.length === 0) {
      toast.error('Bitte zuerst Helfer hinzufügen');
      return;
    }

    const tasks = plan.tasks.map((t, index) => ({
      ...t,
      helper_id: plan.helpers[index % plan.helpers.length].id,
    }));
    updateVacationPlan(planId, { tasks });
    toast.success('Aufgaben gleichmaessig verteilt');
  }

  function handleSendInvitation(plan: VacationPlan, helper: VacationHelper) {
    const helperTasks = plan.tasks.filter((t) => t.helper_id === helper.id);
    const emailBody = generateVacationPlanEmail(
      helper.name,
      'Pflanzenbesitzer',
      plan.start_date,
      plan.end_date,
      helperTasks.length > 0 ? helperTasks : plan.tasks,
      enrichedPlants
    );

    const subject = encodeURIComponent(`Pflanzenpflege während Urlaub: ${plan.name}`);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:${helper.email}?subject=${subject}&body=${body}`, '_blank');
    toast.success(`E-Mail an ${helper.name} wird vorbereitet`);
  }

  function handleSendHelperSummary(plan: VacationPlan, helper: VacationHelper) {
    const helperTasks = plan.tasks.filter((t) => t.helper_id === helper.id);
    if (helperTasks.length === 0) {
      toast.error(`${helper.name} hat noch keine zugewiesenen Aufgaben`);
      return;
    }

    const emailBody = generateVacationPlanEmail(
      helper.name,
      'Pflanzenbesitzer',
      plan.start_date,
      plan.end_date,
      helperTasks,
      enrichedPlants
    );

    const subject = encodeURIComponent(`Deine Aufgaben: ${plan.name}`);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:${helper.email}?subject=${subject}&body=${body}`, '_blank');
    toast.success(`Zusammenfassung für ${helper.name} wird vorbereitet`);
  }

  function handleExportICS(plan: VacationPlan) {
    const events = vacationTasksToCalendarEvents(plan.tasks, enrichedPlants);
    if (events.length === 0) {
      toast.error('Keine Aufgaben zum Exportieren vorhanden');
      return;
    }
    const icsContent = generateICSCalendar(events);
    downloadICSFile(icsContent, `urlaubsplan-${plan.name.toLowerCase().replace(/\s+/g, '-')}.ics`);
    toast.success('Kalender-Datei heruntergeladen');
  }

  function handleOpenGoogleCalendar(plan: VacationPlan) {
    const events = vacationTasksToCalendarEvents(plan.tasks, enrichedPlants);
    if (events.length === 0) {
      toast.error('Keine Aufgaben zum Exportieren vorhanden');
      return;
    }
    // Open first event in Google Calendar (limitation: one at a time)
    const url = generateGoogleCalendarUrl(events[0]);
    window.open(url, '_blank');
    if (events.length > 1) {
      toast.info(`${events.length} Termine vorhanden. Google Calendar kann nur einzeln importieren.`);
    }
  }

  function handleToggleTaskCompleted(planId: string, taskId: string) {
    const plan = vacationPlans.find((p) => p.id === planId);
    if (!plan) return;

    const tasks = plan.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateVacationPlan(planId, { tasks });
  }

  function handleDeletePlan(planId: string) {
    const plan = vacationPlans.find((p) => p.id === planId);
    deleteVacationPlan(planId);
    setDeletePlanId(null);
    setExpandedPlanId(null);
    toast.success(`Urlaubsplan "${plan?.name}" gelöscht`);
  }

  // Group tasks by date
  function getTasksByDate(tasks: VacationTask[]) {
    const grouped: Record<string, VacationTask[]> = {};
    tasks.forEach((task) => {
      if (!grouped[task.task_date]) grouped[task.task_date] = [];
      grouped[task.task_date].push(task);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }

  function getPlanStatus(plan: VacationPlan) {
    const now = new Date();
    const start = parseISO(plan.start_date);
    const end = parseISO(plan.end_date);

    if (now < start) {
      const daysUntil = differenceInDays(start, now);
      return { label: `In ${daysUntil} Tagen`, variant: 'secondary' as const, color: 'text-blue-600' };
    }
    if (now > end) {
      return { label: 'Beendet', variant: 'outline' as const, color: 'text-muted-foreground' };
    }
    return { label: 'Aktiv', variant: 'default' as const, color: 'text-green-600' };
  }

  const sortedPlans = [...vacationPlans].sort(
    (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Urlaubsgiessplan</h1>
            <p className="text-muted-foreground text-sm">
              Plane die Pflanzenpflege während deiner Abwesenheit
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuen Urlaubsplan erstellen
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Neuen Urlaubsplan erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Name des Plans *</Label>
                <Input
                  id="plan-name"
                  placeholder="z.B. Sommerurlaub 2026"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Zeitraum</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Von:</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-start">Startdatum *</Label>
                <Input
                  id="plan-start"
                  type="date"
                  value={newPlanStart}
                  onChange={(e) => setNewPlanStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-end">Enddatum *</Label>
                <Input
                  id="plan-end"
                  type="date"
                  value={newPlanEnd}
                  onChange={(e) => setNewPlanEnd(e.target.value)}
                  min={newPlanStart}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-notes">Notizen</Label>
              <Textarea
                id="plan-notes"
                placeholder="Besondere Hinweise für die Pflanzenpflege..."
                value={newPlanNotes}
                onChange={(e) => setNewPlanNotes(e.target.value)}
                rows={3}
              />
            </div>
            {enrichedPlants.length === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4 text-sm text-yellow-800 dark:text-yellow-200">
                Du hast noch keine Pflanzen angelegt. Füge zuerst Pflanzen hinzu, damit Aufgaben generiert werden können.
              </div>
            )}
            {newPlanStart && newPlanEnd && parseISO(newPlanEnd) > parseISO(newPlanStart) && (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-1">Vorschau:</p>
                <p>
                  {differenceInDays(parseISO(newPlanEnd), parseISO(newPlanStart))} Tage Urlaub
                  {' | '}
                  {enrichedPlants.length} Pflanzen
                  {' | '}
                  ca. {generateTasksForPlan(newPlanStart, newPlanEnd).length} Aufgaben werden generiert
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Plan erstellen
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Empty State */}
      {vacationPlans.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Plane className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Urlaubspläne</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Erstelle einen Urlaubsplan, damit deine Pflanzen auch während deiner Abwesenheit
              optimal versorgt werden. Aufgaben werden automatisch basierend auf den
              Giessvorgaben deiner Pflanzen generiert.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Urlaubsplan erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan List */}
      <div className="space-y-4">
        {sortedPlans.map((plan) => {
          const isExpanded = expandedPlanId === plan.id;
          const status = getPlanStatus(plan);
          const duration = differenceInDays(parseISO(plan.end_date), parseISO(plan.start_date));
          const completedTasks = plan.tasks.filter((t) => t.completed).length;
          const assignedTasks = plan.tasks.filter((t) => t.helper_id).length;

          return (
            <Card key={plan.id} className={isExpanded ? 'ring-2 ring-primary/20' : ''}>
              {/* Plan Summary Header */}
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(parseISO(plan.start_date), 'dd. MMM', { locale: de })} -{' '}
                          {format(parseISO(plan.end_date), 'dd. MMM yyyy', { locale: de })}
                        </span>
                        <span>{duration} Tage</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {plan.helpers.length} Helfer
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {completedTasks}/{plan.tasks.length} Aufgaben
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Expanded Detail View */}
              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-6" />

                  {/* Plan Notes */}
                  {plan.notes && (
                    <div className="rounded-lg bg-muted p-4 text-sm mb-6">
                      <p className="font-medium mb-1">Notizen:</p>
                      <p className="text-muted-foreground">{plan.notes}</p>
                    </div>
                  )}

                  <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tasks" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Aufgaben ({plan.tasks.length})
                      </TabsTrigger>
                      <TabsTrigger value="helpers" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Helfer ({plan.helpers.length})
                      </TabsTrigger>
                      <TabsTrigger value="export" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Export
                      </TabsTrigger>
                    </TabsList>

                    {/* === TASKS TAB === */}
                    <TabsContent value="tasks" className="mt-4 space-y-4">
                      {/* Task actions */}
                      <div className="flex items-center gap-2">
                        {plan.helpers.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoAssignTasks(plan.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Aufgaben automatisch verteilen
                          </Button>
                        )}
                        <div className="ml-auto text-sm text-muted-foreground">
                          {assignedTasks} von {plan.tasks.length} Aufgaben zugewiesen
                        </div>
                      </div>

                      {plan.tasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>Keine Aufgaben vorhanden.</p>
                          <p className="text-sm">
                            Füge Pflanzen hinzu und erstelle den Plan erneut.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {getTasksByDate(plan.tasks).map(([date, tasks]) => (
                            <div key={date}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <h4 className="font-semibold">
                                  {format(parseISO(date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                                </h4>
                                <Badge variant="outline" className="ml-2">
                                  {tasks.length} {tasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}
                                </Badge>
                              </div>
                              <div className="space-y-2 ml-10">
                                {tasks.map((task) => {
                                  const TaskIcon = TASK_TYPE_ICONS[task.task_type] || Droplets;
                                  const plant = enrichedPlants.find((p) => p.id === task.plant_id);
                                  const assignedHelper = plan.helpers.find(
                                    (h) => h.id === task.helper_id
                                  );

                                  return (
                                    <div
                                      key={task.id}
                                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                                        task.completed ? 'bg-muted/50 opacity-60' : 'bg-card'
                                      }`}
                                    >
                                      <button
                                        onClick={() =>
                                          handleToggleTaskCompleted(plan.id, task.id)
                                        }
                                        className="flex-shrink-0"
                                      >
                                        <CheckCircle2
                                          className={`h-5 w-5 ${
                                            task.completed
                                              ? 'text-green-500 fill-green-500'
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                      </button>

                                      <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                          TASK_TYPE_COLORS[task.task_type]
                                        }`}
                                      >
                                        <TaskIcon className="h-4 w-4" />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`font-medium text-sm ${
                                              task.completed ? 'line-through' : ''
                                            }`}
                                          >
                                            {plant?.nickname || plant?.species?.common_name || 'Pflanze'}
                                          </span>
                                          <Badge variant="secondary" className="text-xs">
                                            {TASK_TYPE_LABELS[task.task_type]}
                                          </Badge>
                                        </div>
                                        {task.instructions && (
                                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {task.instructions}
                                          </p>
                                        )}
                                        {plant?.room?.name && (
                                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {plant.room.apartment?.name && `${plant.room.apartment.name} / `}
                                            {plant.room.name}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex-shrink-0 w-40">
                                        <Select
                                          value={task.helper_id || 'unassigned'}
                                          onValueChange={(value) =>
                                            handleAssignHelper(
                                              plan.id,
                                              task.id,
                                              value === 'unassigned' ? null : value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Helfer zuweisen" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="unassigned">
                                              Nicht zugewiesen
                                            </SelectItem>
                                            {plan.helpers.map((helper) => (
                                              <SelectItem key={helper.id} value={helper.id}>
                                                {helper.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* === HELPERS TAB === */}
                    <TabsContent value="helpers" className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Helfer verwalten</h4>
                        <Dialog open={showHelperDialog} onOpenChange={setShowHelperDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Helfer hinzufügen
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Neuen Helfer hinzufügen</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="helper-name">Name *</Label>
                                <Input
                                  id="helper-name"
                                  placeholder="z.B. Anna Schmidt"
                                  value={helperName}
                                  onChange={(e) => setHelperName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="helper-email">E-Mail *</Label>
                                <Input
                                  id="helper-email"
                                  type="email"
                                  placeholder="anna@beispiel.de"
                                  value={helperEmail}
                                  onChange={(e) => setHelperEmail(e.target.value)}
                                />
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => handleAddHelper(plan.id)}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Helfer hinzufügen
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {plan.helpers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>Noch keine Helfer hinzugefügt</p>
                          <p className="text-sm">
                            Füge Freunde oder Nachbarn hinzu, die sich um deine Pflanzen kümmern.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {plan.helpers.map((helper) => {
                            const helperTaskCount = plan.tasks.filter(
                              (t) => t.helper_id === helper.id
                            ).length;

                            return (
                              <div
                                key={helper.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{helper.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {helper.email}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <ClipboardList className="h-3 w-3" />
                                        {helperTaskCount} Aufgaben
                                      </span>
                                      {helper.accepted === null && (
                                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          Eingeladen
                                        </Badge>
                                      )}
                                      {helper.accepted === true && (
                                        <Badge variant="default" className="text-xs flex items-center gap-1">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Akzeptiert
                                        </Badge>
                                      )}
                                      {helper.accepted === false && (
                                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                          <HelpCircle className="h-3 w-3" />
                                          Abgelehnt
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendInvitation(plan, helper)}
                                    title="Einladung senden"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Einladung senden
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendHelperSummary(plan, helper)}
                                    title="Zusammenfassung senden"
                                    disabled={helperTaskCount === 0}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Zusammenfassung
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveHelper(plan.id, helper.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>

                    {/* === EXPORT TAB === */}
                    <TabsContent value="export" className="mt-4 space-y-4">
                      <h4 className="font-semibold">Kalender exportieren</h4>
                      <p className="text-sm text-muted-foreground">
                        Exportiere den Giessplan als Kalender-Datei oder öffne ihn direkt in
                        Google Calendar.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="flex flex-col items-center text-center p-6">
                            <Download className="h-10 w-10 text-primary mb-3" />
                            <h5 className="font-semibold mb-1">ICS-Datei herunterladen</h5>
                            <p className="text-sm text-muted-foreground mb-4">
                              Für Apple Kalender, Outlook und andere Kalender-Apps
                            </p>
                            <Button onClick={() => handleExportICS(plan)} className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Als .ics herunterladen
                            </Button>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="flex flex-col items-center text-center p-6">
                            <ExternalLink className="h-10 w-10 text-primary mb-3" />
                            <h5 className="font-semibold mb-1">Google Calendar</h5>
                            <p className="text-sm text-muted-foreground mb-4">
                              Direkt in Google Calendar öffnen und importieren
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenGoogleCalendar(plan)}
                              className="w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              In Google Calendar öffnen
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      <h4 className="font-semibold">Zusammenfassung per E-Mail</h4>
                      <p className="text-sm text-muted-foreground">
                        Sende jedem Helfer eine E-Mail mit seinen zugewiesenen Aufgaben.
                      </p>

                      {plan.helpers.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          Füge zuerst Helfer hinzu, um E-Mail-Zusammenfassungen zu versenden.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {plan.helpers.map((helper) => {
                            const helperTaskCount = plan.tasks.filter(
                              (t) => t.helper_id === helper.id
                            ).length;

                            return (
                              <div
                                key={helper.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <span className="font-medium">{helper.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({helperTaskCount} Aufgaben)
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendHelperSummary(plan, helper)}
                                  disabled={helperTaskCount === 0}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  E-Mail senden
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <Separator className="my-6" />

                  {/* Plan Footer Actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Erstellt am{' '}
                      {format(parseISO(plan.created_at), 'dd. MMMM yyyy, HH:mm', {
                        locale: de,
                      })}{' '}
                      Uhr
                    </p>
                    <div className="flex gap-2">
                      {deletePlanId === plan.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-destructive">Wirklich löschen?</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Ja, löschen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePlanId(null)}
                          >
                            Abbrechen
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletePlanId(plan.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Plan löschen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
