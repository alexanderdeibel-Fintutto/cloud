import { useMemo } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Flower2,
  Droplets,
  Leaf,
  Heart,
  TrendingUp,
  Home,
  DoorOpen,
  Sun,
  Thermometer,
  Calendar,
  Award,
  Target,
  Activity,
} from 'lucide-react';
import {
  format,
  parseISO,
  differenceInDays,
  subDays,
  startOfDay,
  isAfter,
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const HEALTH_COLORS: Record<string, string> = {
  thriving: '#22c55e',
  good: '#34d399',
  fair: '#eab308',
  poor: '#ef4444',
};

const HEALTH_LABELS: Record<string, string> = {
  thriving: 'Praechtig',
  good: 'Gut',
  fair: 'Maessig',
  poor: 'Schlecht',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Einfach',
  medium: 'Mittel',
  hard: 'Schwer',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const LIGHT_LABELS: Record<string, string> = {
  low: 'Wenig',
  medium: 'Mittel',
  bright: 'Hell',
  direct: 'Direkt',
};

export default function StatisticsPage() {
  const {
    plants,
    apartments,
    rooms,
    careEvents,
    getEnrichedPlants,
    getOverdueReminders,
  } = usePlants();

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);
  const overdueReminders = useMemo(() => getOverdueReminders(), [getOverdueReminders]);

  const healthData = useMemo(() => {
    const dist: Record<string, number> = { thriving: 0, good: 0, fair: 0, poor: 0 };
    enrichedPlants.forEach((p) => dist[p.health_status]++);
    return Object.entries(dist).map(([key, value]) => ({
      name: HEALTH_LABELS[key],
      value,
      color: HEALTH_COLORS[key],
    }));
  }, [enrichedPlants]);

  const difficultyData = useMemo(() => {
    const dist: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    enrichedPlants.forEach((p) => {
      if (p.species) dist[p.species.difficulty]++;
    });
    return Object.entries(dist).map(([key, value]) => ({
      name: DIFFICULTY_LABELS[key],
      value,
      color: DIFFICULTY_COLORS[key],
    }));
  }, [enrichedPlants]);

  const plantsPerRoom = useMemo(() => {
    const roomCounts: Record<string, { name: string; apartment: string; count: number }> = {};
    enrichedPlants.forEach((p) => {
      if (p.room) {
        const key = p.room_id;
        if (!roomCounts[key]) {
          roomCounts[key] = {
            name: p.room.name,
            apartment: p.room.apartment?.name || '',
            count: 0,
          };
        }
        roomCounts[key].count++;
      }
    });
    return Object.values(roomCounts).sort((a, b) => b.count - a.count);
  }, [enrichedPlants]);

  const careActivityData = useMemo(() => {
    const today = startOfDay(new Date());
    const days: { date: string; water: number; fertilize: number; other: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const day = subDays(today, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayLabel = format(day, 'dd.MM', { locale: de });

      const dayEvents = careEvents.filter((e) => {
        const eventDate = format(parseISO(e.performed_at), 'yyyy-MM-dd');
        return eventDate === dayStr;
      });

      days.push({
        date: dayLabel,
        water: dayEvents.filter((e) => e.type === 'water').length,
        fertilize: dayEvents.filter((e) => e.type === 'fertilize').length,
        other: dayEvents.filter(
          (e) => e.type !== 'water' && e.type !== 'fertilize'
        ).length,
      });
    }
    return days;
  }, [careEvents]);

  const careTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    careEvents.forEach((e) => {
      const label =
        e.type === 'water'
          ? 'Giessen'
          : e.type === 'fertilize'
            ? 'Duengen'
            : e.type === 'repot'
              ? 'Umtopfen'
              : e.type === 'prune'
                ? 'Schneiden'
                : e.type === 'mist'
                  ? 'Besprühen'
                  : 'Drehen';
      types[label] = (types[label] || 0) + 1;
    });
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
    return Object.entries(types).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [careEvents]);

  const lightData = useMemo(() => {
    const dist: Record<string, number> = { low: 0, medium: 0, bright: 0, direct: 0 };
    enrichedPlants.forEach((p) => {
      if (p.species) dist[p.species.light]++;
    });
    return Object.entries(dist)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: LIGHT_LABELS[key],
        value,
      }));
  }, [enrichedPlants]);

  const topCareNeedy = useMemo(() => {
    return enrichedPlants
      .map((p) => ({
        name: p.nickname || p.species?.common_name || 'Unbekannt',
        events: careEvents.filter((e) => e.plant_id === p.id).length,
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 5);
  }, [enrichedPlants, careEvents]);

  const careStreak = useMemo(() => {
    if (careEvents.length === 0) return 0;
    const today = startOfDay(new Date());
    let streak = 0;
    let checkDay = today;

    for (let i = 0; i < 365; i++) {
      const dayStr = format(checkDay, 'yyyy-MM-dd');
      const hasEvent = careEvents.some(
        (e) => format(parseISO(e.performed_at), 'yyyy-MM-dd') === dayStr
      );
      if (hasEvent) {
        streak++;
        checkDay = subDays(checkDay, 1);
      } else {
        break;
      }
    }
    return streak;
  }, [careEvents]);

  const avgPlantAge = useMemo(() => {
    if (plants.length === 0) return 0;
    const totalDays = plants.reduce((sum, p) => {
      return sum + differenceInDays(new Date(), parseISO(p.acquired_date || p.created_at));
    }, 0);
    return Math.round(totalDays / plants.length);
  }, [plants]);

  const recentPlants = useMemo(() => {
    const cutoff = subDays(new Date(), 30);
    return plants.filter((p) =>
      isAfter(parseISO(p.created_at), cutoff)
    ).length;
  }, [plants]);

  const totalPlants = plants.length;
  const healthPercent =
    totalPlants > 0
      ? Math.round(
          ((healthData.find((h) => h.name === 'Praechtig')?.value || 0) +
            (healthData.find((h) => h.name === 'Gut')?.value || 0)) /
            totalPlants *
            100
        )
      : 0;

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--card-foreground))',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '8px 12px',
    fontSize: '13px',
  };

  if (totalPlants === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            Statistik & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Detaillierte Analysen deiner Pflanzensammlung
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/20 flex items-center justify-center mb-5">
            <BarChart3 className="h-10 w-10 text-violet-300 dark:text-violet-600" />
          </div>
          <p className="text-lg font-semibold text-muted-foreground">
            Noch keine Daten vorhanden
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Fuege Pflanzen hinzu, um Statistiken zu sehen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          Statistik & Insights
        </h1>
        <p className="text-muted-foreground mt-1">
          Detaillierte Analysen deiner Pflanzensammlung
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {[
          { icon: Flower2, value: totalPlants, label: 'Pflanzen', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/30' },
          { icon: Activity, value: careEvents.length, label: 'Pflege-Aktionen', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30' },
          { icon: Award, value: careStreak, label: 'Tage Streak', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30' },
          { icon: Heart, value: `${healthPercent}%`, label: 'Gesund', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/30' },
        ].map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-muted/40 to-transparent rounded-bl-[2rem]" />
            <CardContent className="p-4">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-5 w-5 bg-gradient-to-br ${stat.gradient} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Care Activity Chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/40 dark:to-sky-900/30 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Pflege-Aktivitaet (letzte 30 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={careActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  className="text-muted-foreground"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="water" name="Giessen" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="care" />
                <Bar dataKey="fertilize" name="Duengen" fill="#22c55e" radius={[3, 3, 0, 0]} stackId="care" />
                <Bar dataKey="other" name="Sonstiges" fill="#a855f7" radius={[3, 3, 0, 0]} stackId="care" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution Pie */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/30 flex items-center justify-center">
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              Gesundheitsverteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {healthData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: '13px' }}
                    formatter={(value) => <span className="text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Care Type Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/30 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              Pflege nach Typ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {careTypeData.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                  <Droplets className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Noch keine Pflege-Aktionen erfasst
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={careTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {careTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: '13px' }}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Schwierigkeitsgrade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {difficultyData.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                    <span className="text-[13px]">{d.name}</span>
                  </span>
                  <span className="font-semibold text-[13px]">
                    {d.value} ({totalPlants > 0 ? Math.round((d.value / totalPlants) * 100) : 0}%)
                  </span>
                </div>
                <Progress
                  value={totalPlants > 0 ? (d.value / totalPlants) * 100 : 0}
                  className="h-2 rounded-full"
                  style={{ ['--progress-color' as string]: d.color }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Light requirements */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/30 flex items-center justify-center">
                <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              Lichtbeduerfnisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lightData.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                  <Sun className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">Keine Daten</p>
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lightData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.5} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name="Pflanzen" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plants per room */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/30 flex items-center justify-center">
                <DoorOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Pflanzen pro Raum
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plantsPerRoom.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                  <Home className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">Keine Raeume vorhanden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plantsPerRoom.map((room, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <DoorOpen className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{room.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{room.apartment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="w-20">
                        <Progress
                          value={totalPlants > 0 ? (room.count / totalPlants) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right tabular-nums">{room.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top care-needy plants */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Meistgepflegte Pflanzen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCareNeedy.length === 0 || topCareNeedy[0].events === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                  <Leaf className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Noch keine Pflege-Daten vorhanden
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topCareNeedy.map((plant, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? 'bg-gradient-to-br from-amber-200 to-yellow-200 text-amber-800 dark:from-amber-900/40 dark:to-yellow-900/30 dark:text-amber-300'
                            : i === 1
                              ? 'bg-gradient-to-br from-gray-200 to-slate-200 text-gray-700 dark:from-gray-800 dark:to-slate-800 dark:text-gray-300'
                              : i === 2
                                ? 'bg-gradient-to-br from-orange-200 to-amber-100 text-orange-800 dark:from-orange-900/30 dark:to-amber-900/20 dark:text-orange-300'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{plant.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
                      {plant.events} Aktionen
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary insights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/30 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Zusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
            {[
              { icon: Thermometer, value: `${avgPlantAge} Tage`, label: 'Durchschnittsalter', color: 'text-orange-500', bg: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20' },
              { icon: Home, value: `${apartments.length} Wohnungen`, label: `${rooms.length} Raeume`, color: 'text-purple-500', bg: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20' },
              { icon: Flower2, value: `${recentPlants} neu`, label: 'Letzte 30 Tage', color: 'text-pink-500', bg: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20' },
              { icon: Target, value: `${overdueReminders.length} ueberfaellig`, label: 'Offene Aufgaben', color: 'text-red-500', bg: 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl border bg-gradient-to-br ${item.bg} p-3.5`}>
                <div className="h-9 w-9 rounded-lg bg-white/60 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{item.value}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
