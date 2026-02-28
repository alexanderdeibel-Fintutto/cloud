import { useMemo } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Droplets,
  Sparkles,
  Heart,
  TrendingUp,
  Flower2,
  Sun,
  CloudRain,
  Leaf,
  Calendar,
  Award,
  Target,
  Activity,
  PieChart,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { differenceInDays, parseISO, format, subDays, startOfDay, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { CareEvent, UserPlant, PlantSpecies } from '@/types';

function calculateCareConsistency(
  plants: UserPlant[],
  careEvents: CareEvent[],
  species: PlantSpecies[]
): number {
  if (plants.length === 0) return 100;

  let totalScore = 0;
  let plantCount = 0;

  plants.forEach((plant) => {
    const sp = species.find((s) => s.id === plant.species_id);
    if (!sp) return;

    const waterFreq = plant.water_frequency_override || sp.water_frequency_days;
    const plantEvents = careEvents
      .filter((e) => e.plant_id === plant.id && e.type === 'water')
      .sort(
        (a, b) =>
          new Date(b.performed_at).getTime() -
          new Date(a.performed_at).getTime()
      );

    if (plantEvents.length < 2) {
      totalScore += 50;
      plantCount++;
      return;
    }

    // Check last 5 watering intervals
    let intervalScore = 0;
    const checkCount = Math.min(plantEvents.length - 1, 5);
    for (let i = 0; i < checkCount; i++) {
      const gap = differenceInDays(
        parseISO(plantEvents[i].performed_at),
        parseISO(plantEvents[i + 1].performed_at)
      );
      const deviation = Math.abs(gap - waterFreq);
      if (deviation <= 1) intervalScore += 100;
      else if (deviation <= 2) intervalScore += 80;
      else if (deviation <= 3) intervalScore += 60;
      else if (deviation <= 5) intervalScore += 30;
      else intervalScore += 0;
    }

    totalScore += intervalScore / checkCount;
    plantCount++;
  });

  return plantCount > 0 ? Math.round(totalScore / plantCount) : 100;
}

function getConsistencyLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Hervorragend', color: 'text-green-600' };
  if (score >= 75) return { label: 'Sehr gut', color: 'text-emerald-600' };
  if (score >= 60) return { label: 'Gut', color: 'text-blue-600' };
  if (score >= 40) return { label: 'Ausbaufaehig', color: 'text-yellow-600' };
  return { label: 'Verbesserungswuerdig', color: 'text-red-600' };
}

export default function StatsPage() {
  const {
    plants,
    careEvents,
    apartments,
    rooms,
    species,
    getEnrichedPlants,
    getOverdueReminders,
  } = usePlants();

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);
  const overdueReminders = useMemo(
    () => getOverdueReminders(),
    [getOverdueReminders]
  );

  // --- Care Consistency Score ---
  const consistencyScore = useMemo(
    () => calculateCareConsistency(plants, careEvents, species),
    [plants, careEvents, species]
  );
  const consistencyInfo = getConsistencyLabel(consistencyScore);

  // --- Health Distribution ---
  const healthDist = useMemo(() => {
    const dist = { thriving: 0, good: 0, fair: 0, poor: 0 };
    enrichedPlants.forEach((p) => dist[p.health_status]++);
    return dist;
  }, [enrichedPlants]);

  // --- Care Events Stats (last 30 days) ---
  const recentCareStats = useMemo(() => {
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    const recent = careEvents.filter((e) =>
      isAfter(parseISO(e.performed_at), thirtyDaysAgo)
    );

    const byType: Record<string, number> = {};
    recent.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    // Events per week (last 4 weeks)
    const weeklyData: { week: string; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfDay(subDays(new Date(), (i + 1) * 7));
      const weekEnd = startOfDay(subDays(new Date(), i * 7));
      const count = recent.filter((e) => {
        const d = parseISO(e.performed_at);
        return isAfter(d, weekStart) && !isAfter(d, weekEnd);
      }).length;
      weeklyData.push({
        week: format(weekStart, 'dd. MMM', { locale: de }),
        count,
      });
    }

    return { total: recent.length, byType, weeklyData };
  }, [careEvents]);

  // --- Collection Stats ---
  const collectionStats = useMemo(() => {
    const difficultyDist: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const lightDist: Record<string, number> = { low: 0, medium: 0, bright: 0, direct: 0 };
    const familyDist: Record<string, number> = {};
    let toxicCount = 0;

    enrichedPlants.forEach((p) => {
      if (!p.species) return;
      difficultyDist[p.species.difficulty]++;
      lightDist[p.species.light]++;
      familyDist[p.species.family] = (familyDist[p.species.family] || 0) + 1;
      if (p.species.toxic_pets) toxicCount++;
    });

    // Top 5 families
    const topFamilies = Object.entries(familyDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { difficultyDist, lightDist, topFamilies, toxicCount };
  }, [enrichedPlants]);

  // --- Oldest and Newest Plants ---
  const plantAgeInfo = useMemo(() => {
    if (enrichedPlants.length === 0) return null;
    const sorted = [...enrichedPlants].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    return {
      oldest: {
        name: oldest.nickname || oldest.species?.common_name || 'Pflanze',
        days: differenceInDays(new Date(), parseISO(oldest.created_at)),
      },
      newest: {
        name: newest.nickname || newest.species?.common_name || 'Pflanze',
        days: differenceInDays(new Date(), parseISO(newest.created_at)),
      },
    };
  }, [enrichedPlants]);

  // --- Most active care plant ---
  const mostCaredPlant = useMemo(() => {
    if (careEvents.length === 0) return null;
    const counts: Record<string, number> = {};
    careEvents.forEach((e) => {
      counts[e.plant_id] = (counts[e.plant_id] || 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!topId) return null;
    const plant = enrichedPlants.find((p) => p.id === topId[0]);
    return {
      name: plant?.nickname || plant?.species?.common_name || 'Pflanze',
      count: topId[1],
    };
  }, [careEvents, enrichedPlants]);

  const totalPlants = plants.length;

  // Weekly activity bars (max bar height)
  const maxWeeklyCount = Math.max(...recentCareStats.weeklyData.map((w) => w.count), 1);

  const difficultyLabels: Record<string, string> = {
    easy: 'Einfach',
    medium: 'Mittel',
    hard: 'Anspruchsvoll',
  };

  const lightLabels: Record<string, string> = {
    low: 'Wenig Licht',
    medium: 'Mittleres Licht',
    bright: 'Helles Licht',
    direct: 'Direkte Sonne',
  };

  const careTypeLabels: Record<string, string> = {
    water: 'Giessen',
    fertilize: 'Duengen',
    repot: 'Umtopfen',
    prune: 'Schneiden',
    mist: 'Besprühen',
    rotate: 'Drehen',
  };

  // --- Empty state ---
  if (totalPlants === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
          <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Noch keine Statistiken
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Fuege Pflanzen hinzu und pflege sie, um hier detaillierte Statistiken
          und Einblicke zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Statistik & Insights
        </h1>
        <p className="text-muted-foreground mt-1">
          Deine Pflegeleistung und Sammlungsueberblick im Detail.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consistency Score */}
        <Card className="border-blue-200 dark:border-blue-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pflege-Konsistenz
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${consistencyInfo.color}`}>
              {consistencyScore}%
            </div>
            <p className={`text-xs mt-1 ${consistencyInfo.color}`}>
              {consistencyInfo.label}
            </p>
            <Progress
              value={consistencyScore}
              className="h-2 mt-2 [&>div]:bg-blue-500"
            />
          </CardContent>
        </Card>

        {/* Total Care Events (30d) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pflegeaktionen (30 Tage)
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentCareStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {careEvents.length} gesamt seit Start
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className={overdueReminders.length > 0 ? 'border-red-200 dark:border-red-800/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktuell ueberfaellig
            </CardTitle>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              overdueReminders.length > 0
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <Clock className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueReminders.length > 0 ? 'text-red-600' : ''}`}>
              {overdueReminders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              von {totalPlants} Pflanzen
            </p>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesundheits-Score
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalPlants > 0
                ? Math.round(
                    ((healthDist.thriving + healthDist.good) / totalPlants) *
                      100
                  )
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pflanzen in gutem Zustand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Activity Chart + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Pflege-Aktivitaet (4 Wochen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {recentCareStats.weeklyData.map((week, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {week.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-green-500/80 dark:bg-green-600/60 transition-all"
                    style={{
                      height: `${Math.max(
                        (week.count / maxWeeklyCount) * 120,
                        4
                      )}px`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground text-center">
                    {week.week}
                  </span>
                </div>
              ))}
            </div>

            {/* Care type breakdown */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Aufschluesselung nach Typ
              </p>
              {Object.entries(recentCareStats.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {type === 'water' && (
                        <Droplets className="h-4 w-4 text-blue-500" />
                      )}
                      {type === 'fertilize' && (
                        <Sparkles className="h-4 w-4 text-green-500" />
                      )}
                      {type !== 'water' && type !== 'fertilize' && (
                        <Leaf className="h-4 w-4 text-gray-500" />
                      )}
                      {careTypeLabels[type] || type}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              {Object.keys(recentCareStats.byType).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Noch keine Pflegeaktionen in den letzten 30 Tagen.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health + Fun Facts */}
        <div className="space-y-6">
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-pink-500" />
                Gesundheitsverteilung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  key: 'thriving',
                  label: 'Praechtig',
                  color: 'bg-green-500',
                  count: healthDist.thriving,
                },
                {
                  key: 'good',
                  label: 'Gut',
                  color: 'bg-emerald-400',
                  count: healthDist.good,
                },
                {
                  key: 'fair',
                  label: 'Maessig',
                  color: 'bg-yellow-500',
                  count: healthDist.fair,
                },
                {
                  key: 'poor',
                  label: 'Schlecht',
                  color: 'bg-red-500',
                  count: healthDist.poor,
                },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${item.color} inline-block`}
                      />
                      {item.label}
                    </span>
                    <span className="font-medium">
                      {item.count}{' '}
                      <span className="text-muted-foreground font-normal">
                        (
                        {totalPlants > 0
                          ? Math.round((item.count / totalPlants) * 100)
                          : 0}
                        %)
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={
                      totalPlants > 0
                        ? (item.count / totalPlants) * 100
                        : 0
                    }
                    className={`h-2 [&>div]:${item.color}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fun Facts / Highlights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-5 w-5 text-amber-500" />
                Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plantAgeInfo && (
                <>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Aelteste Pflanze
                    </span>
                    <span className="font-medium">
                      {plantAgeInfo.oldest.name}{' '}
                      <span className="text-muted-foreground">
                        ({plantAgeInfo.oldest.days} Tage)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <span className="flex items-center gap-2">
                      <Flower2 className="h-4 w-4 text-green-500" />
                      Neueste Pflanze
                    </span>
                    <span className="font-medium">
                      {plantAgeInfo.newest.name}{' '}
                      <span className="text-muted-foreground">
                        ({plantAgeInfo.newest.days === 0
                          ? 'heute'
                          : `vor ${plantAgeInfo.newest.days} Tagen`})
                      </span>
                    </span>
                  </div>
                </>
              )}
              {mostCaredPlant && (
                <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Meistgepflegt
                  </span>
                  <span className="font-medium">
                    {mostCaredPlant.name}{' '}
                    <span className="text-muted-foreground">
                      ({mostCaredPlant.count}x)
                    </span>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                <span className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-red-500" />
                  Giftig fuer Haustiere
                </span>
                <span className="font-medium">
                  {collectionStats.toxicCount} von {totalPlants}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Third Row: Collection breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5 text-purple-500" />
              Schwierigkeitsgrad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <div key={d}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{difficultyLabels[d]}</span>
                  <span className="font-medium">
                    {collectionStats.difficultyDist[d]}
                  </span>
                </div>
                <Progress
                  value={
                    totalPlants > 0
                      ? (collectionStats.difficultyDist[d] / totalPlants) * 100
                      : 0
                  }
                  className={`h-2 ${
                    d === 'easy'
                      ? '[&>div]:bg-green-500'
                      : d === 'medium'
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Light needs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-5 w-5 text-yellow-500" />
              Lichtbeduerfnisse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['low', 'medium', 'bright', 'direct'] as const).map((l) => (
              <div key={l}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    {l === 'low' && <CloudRain className="h-3 w-3" />}
                    {l === 'medium' && <Sun className="h-3 w-3 opacity-60" />}
                    {l === 'bright' && <Sun className="h-3 w-3" />}
                    {l === 'direct' && <Sun className="h-3 w-3 text-yellow-500" />}
                    {lightLabels[l]}
                  </span>
                  <span className="font-medium">
                    {collectionStats.lightDist[l]}
                  </span>
                </div>
                <Progress
                  value={
                    totalPlants > 0
                      ? (collectionStats.lightDist[l] / totalPlants) * 100
                      : 0
                  }
                  className="h-2 [&>div]:bg-yellow-400"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Families */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flower2 className="h-5 w-5 text-green-500" />
              Top Pflanzenfamilien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {collectionStats.topFamilies.length > 0 ? (
              collectionStats.topFamilies.map(([family, count], idx) => (
                <div
                  key={family}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      #{idx + 1}
                    </span>
                    {family}
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Noch keine Daten verfuegbar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
