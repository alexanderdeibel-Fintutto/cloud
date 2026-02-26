import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flower2,
  Droplets,
  AlertTriangle,
  CalendarClock,
  Home,
  Plus,
  Plane,
  CheckCircle2,
  Sparkles,
  Leaf,
  Sun,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { EcosystemBanner } from '@/components/EcosystemBanner';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    plants,
    apartments,
    getEnrichedPlants,
    getOverdueReminders,
    getTodayReminders,
    getUpcomingReminders,
    logCareEvent,
  } = usePlants();

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);
  const overdueReminders = useMemo(() => getOverdueReminders(), [getOverdueReminders]);
  const todayReminders = useMemo(() => getTodayReminders(), [getTodayReminders]);
  const upcomingReminders = useMemo(() => getUpcomingReminders(7), [getUpcomingReminders]);

  const healthDistribution = useMemo(() => {
    const dist = { thriving: 0, good: 0, fair: 0, poor: 0 };
    enrichedPlants.forEach((p) => {
      dist[p.health_status]++;
    });
    return dist;
  }, [enrichedPlants]);

  const totalPlants = plants.length;
  const healthTotal = Math.max(totalPlants, 1);

  function handleMarkDone(reminder: { plant_id: string; type: 'water' | 'fertilize' | 'repot' }) {
    logCareEvent({
      plant_id: reminder.plant_id,
      type: reminder.type,
      performed_at: new Date().toISOString(),
      notes: '',
    });
  }

  const typeLabel: Record<string, string> = {
    water: 'Giessen',
    fertilize: 'Duengen',
    repot: 'Umtopfen',
  };

  const typeIcon: Record<string, typeof Droplets> = {
    water: Droplets,
    fertilize: Sparkles,
    repot: Flower2,
  };

  // --- Empty state / Onboarding ---
  if (totalPlants === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <Leaf className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">
          Willkommen beim Pflanzen-Manager!
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Verwalte deine Zimmerpflanzen, erhalte Giess-Erinnerungen und behalte
          den Ueberblick ueber die Pflege deiner gruenen Mitbewohner.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {apartments.length === 0 ? (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/apartments')}
            >
              <Home className="mr-2 h-5 w-5" />
              Wohnung anlegen
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/catalog')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Erste Pflanze hinzufuegen
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/catalog')}
          >
            <Flower2 className="mr-2 h-5 w-5" />
            Pflanzenkatalog entdecken
          </Button>
        </div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Du hast{' '}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {totalPlants} {totalPlants === 1 ? 'Pflanze' : 'Pflanzen'}
            </span>{' '}
            in deiner Sammlung
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/catalog')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Pflanze hinzufuegen
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 dark:border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pflanzen gesamt
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Flower2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              in {apartments.length}{' '}
              {apartments.length === 1 ? 'Wohnung' : 'Wohnungen'}
            </p>
          </CardContent>
        </Card>

        <Card className={overdueReminders.length > 0 ? 'border-red-200 dark:border-red-800/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ueberfaellige Aufgaben
            </CardTitle>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              overdueReminders.length > 0
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                overdueReminders.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-400'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              overdueReminders.length > 0 ? 'text-red-600 dark:text-red-400' : ''
            }`}>
              {overdueReminders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueReminders.length === 0
                ? 'Alles erledigt!'
                : 'brauchen Aufmerksamkeit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diese Woche
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingReminders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              anstehende Aufgaben
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wohnungen
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{apartments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {apartments.map((a) => a.name).join(', ') || 'Keine Wohnungen'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heute zu tun */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              Heute zu tun
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReminders.length === 0 && overdueReminders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                <p className="font-medium">Alles erledigt!</p>
                <p className="text-sm text-muted-foreground">
                  Heute stehen keine Pflegeaufgaben an.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Overdue first */}
                {overdueReminders.map((reminder) => {
                  const Icon = typeIcon[reminder.type] || Droplets;
                  const plant = reminder.plant;
                  const daysOverdue = differenceInDays(
                    new Date(),
                    parseISO(reminder.due_date)
                  );
                  return (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {plant?.nickname || plant?.species?.common_name || 'Pflanze'}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {typeLabel[reminder.type]} - {daysOverdue}{' '}
                            {daysOverdue === 1 ? 'Tag' : 'Tage'} ueberfaellig
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={() => handleMarkDone(reminder)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Erledigt
                      </Button>
                    </div>
                  );
                })}

                {/* Today's reminders */}
                {todayReminders
                  .filter((r) => !overdueReminders.find((o) => o.id === r.id))
                  .map((reminder) => {
                    const Icon = typeIcon[reminder.type] || Droplets;
                    const plant = reminder.plant;
                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {plant?.nickname || plant?.species?.common_name || 'Pflanze'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {typeLabel[reminder.type]} - heute faellig
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkDone(reminder)}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Erledigt
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pflanzen-Gesundheit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Pflanzen-Gesundheit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500 inline-block" />
                    Praechtig
                  </span>
                  <span className="font-medium">{healthDistribution.thriving}</span>
                </div>
                <Progress
                  value={(healthDistribution.thriving / healthTotal) * 100}
                  className="h-2 [&>div]:bg-green-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                    Gut
                  </span>
                  <span className="font-medium">{healthDistribution.good}</span>
                </div>
                <Progress
                  value={(healthDistribution.good / healthTotal) * 100}
                  className="h-2 [&>div]:bg-emerald-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block" />
                    Maessig
                  </span>
                  <span className="font-medium">{healthDistribution.fair}</span>
                </div>
                <Progress
                  value={(healthDistribution.fair / healthTotal) * 100}
                  className="h-2 [&>div]:bg-yellow-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />
                    Schlecht
                  </span>
                  <span className="font-medium">{healthDistribution.poor}</span>
                </div>
                <Progress
                  value={(healthDistribution.poor / healthTotal) * 100}
                  className="h-2 [&>div]:bg-red-500"
                />
              </div>
            </div>

            {totalPlants > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">
                    {Math.round(
                      ((healthDistribution.thriving + healthDistribution.good) /
                        totalPlants) *
                        100
                    )}
                    % deiner Pflanzen geht es gut
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schnellaktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => navigate('/catalog')}
            >
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">Pflanze hinzufuegen</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              onClick={() => navigate('/apartments')}
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">Wohnung anlegen</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              onClick={() => navigate('/vacation')}
            >
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">Urlaubsplan erstellen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Marketing */}
      <EcosystemBanner variant="inline" maxApps={4} />
    </div>
  );
}
