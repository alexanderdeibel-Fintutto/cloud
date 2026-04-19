import { useState, useMemo, useCallback } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Droplets,
  Leaf,
  FlowerIcon,
  Scissors,
  Wind,
  RotateCw,
  CheckCircle2,
  ListChecks,
  DoorOpen,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserPlant, CareEvent } from '@/types';
import { parseISO, isBefore, isToday, format } from 'date-fns';
import { de } from 'date-fns/locale';

type CareType = CareEvent['type'];

const careTypeConfig: Record<
  CareType,
  { label: string; icon: typeof Droplets; color: string; bgColor: string; gradient: string }
> = {
  water: {
    label: 'Giessen',
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    gradient: 'from-blue-500 to-cyan-500',
  },
  fertilize: {
    label: 'Duengen',
    icon: Leaf,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    gradient: 'from-green-500 to-emerald-500',
  },
  repot: {
    label: 'Umtopfen',
    icon: FlowerIcon,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    gradient: 'from-amber-500 to-orange-500',
  },
  prune: {
    label: 'Schneiden',
    icon: Scissors,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    gradient: 'from-purple-500 to-violet-500',
  },
  mist: {
    label: 'Besprühen',
    icon: Wind,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    gradient: 'from-cyan-500 to-teal-500',
  },
  rotate: {
    label: 'Drehen',
    icon: RotateCw,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    gradient: 'from-pink-500 to-rose-500',
  },
};

type FilterMode = 'all' | 'overdue' | 'room';

export default function BatchCarePage() {
  const {
    getEnrichedPlants,
    getReminders,
    logCareEvent,
    rooms,
    apartments,
  } = usePlants();

  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [careType, setCareType] = useState<CareType>('water');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterRoom, setFilterRoom] = useState<string>('');

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);
  const reminders = useMemo(() => getReminders(), [getReminders]);

  const overduePlantIds = useMemo(() => {
    const now = new Date();
    return new Set(
      reminders
        .filter((r) => {
          const dueDate = parseISO(r.due_date);
          return r.type === careType && (isBefore(dueDate, now) || isToday(dueDate));
        })
        .map((r) => r.plant_id)
    );
  }, [reminders, careType]);

  const filteredPlants = useMemo(() => {
    let result = enrichedPlants;

    if (filterMode === 'overdue') {
      result = result.filter((p) => overduePlantIds.has(p.id));
    } else if (filterMode === 'room' && filterRoom) {
      result = result.filter((p) => p.room_id === filterRoom);
    }

    return result.sort((a, b) => {
      const aName = a.nickname || a.species?.common_name || '';
      const bName = b.nickname || b.species?.common_name || '';
      return aName.localeCompare(bName);
    });
  }, [enrichedPlants, filterMode, filterRoom, overduePlantIds]);

  const plantsByRoom = useMemo(() => {
    const groups: Record<string, { roomName: string; apartmentName: string; plants: UserPlant[] }> = {};

    filteredPlants.forEach((p) => {
      const key = p.room_id || 'unassigned';
      if (!groups[key]) {
        groups[key] = {
          roomName: p.room?.name || 'Kein Raum',
          apartmentName: p.room?.apartment?.name || '',
          plants: [],
        };
      }
      groups[key].plants.push(p);
    });

    return Object.entries(groups).sort(([, a], [, b]) =>
      a.roomName.localeCompare(b.roomName)
    );
  }, [filteredPlants]);

  const togglePlant = useCallback((plantId: string) => {
    setSelectedPlants((prev) => {
      const next = new Set(prev);
      if (next.has(plantId)) {
        next.delete(plantId);
      } else {
        next.add(plantId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPlants(new Set(filteredPlants.map((p) => p.id)));
  }, [filteredPlants]);

  const selectNone = useCallback(() => {
    setSelectedPlants(new Set());
  }, []);

  const selectOverdue = useCallback(() => {
    setSelectedPlants(new Set(overduePlantIds));
  }, [overduePlantIds]);

  const selectRoom = useCallback(
    (roomId: string) => {
      const roomPlants = filteredPlants.filter((p) => p.room_id === roomId);
      setSelectedPlants((prev) => {
        const next = new Set(prev);
        const allSelected = roomPlants.every((p) => next.has(p.id));
        if (allSelected) {
          roomPlants.forEach((p) => next.delete(p.id));
        } else {
          roomPlants.forEach((p) => next.add(p.id));
        }
        return next;
      });
    },
    [filteredPlants]
  );

  const handleBatchCare = useCallback(() => {
    if (selectedPlants.size === 0) {
      toast.error('Bitte waehle mindestens eine Pflanze aus.');
      return;
    }

    const now = new Date().toISOString();
    const config = careTypeConfig[careType];
    let count = 0;

    selectedPlants.forEach((plantId) => {
      logCareEvent({
        plant_id: plantId,
        type: careType,
        performed_at: now,
        notes: 'Batch-Pflege',
      });
      count++;
    });

    toast.success(`${count} ${count === 1 ? 'Pflanze' : 'Pflanzen'} ${config.label.toLowerCase()}!`, {
      description: 'Alle ausgewaehlten Pflanzen wurden gepflegt.',
      icon: <config.icon className={`h-5 w-5 ${config.color}`} />,
    });

    setSelectedPlants(new Set());
  }, [selectedPlants, careType, logCareEvent]);

  const getReminderInfo = useCallback(
    (plant: UserPlant) => {
      const reminder = reminders.find(
        (r) => r.plant_id === plant.id && r.type === careType
      );
      if (!reminder) return null;

      const dueDate = parseISO(reminder.due_date);
      const now = new Date();

      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        const days = Math.ceil(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          status: 'overdue' as const,
          label: `${days} ${days === 1 ? 'Tag' : 'Tage'} ueberfaellig`,
        };
      }
      if (isToday(dueDate)) {
        return { status: 'today' as const, label: 'Heute faellig' };
      }
      return {
        status: 'upcoming' as const,
        label: format(dueDate, 'dd. MMM', { locale: de }),
      };
    },
    [reminders, careType]
  );

  const activeConfig = careTypeConfig[careType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/30 flex items-center justify-center">
            <ListChecks className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          Batch-Pflege
        </h1>
        <p className="text-muted-foreground mt-1">
          Pflege mehrere Pflanzen gleichzeitig mit einem Klick.
        </p>
      </div>

      {/* Care Type Selection */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pflege-Aktion</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(Object.entries(careTypeConfig) as [CareType, typeof careTypeConfig.water][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              const isActive = careType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setCareType(type);
                    setSelectedPlants(new Set());
                  }}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                    isActive
                      ? 'border-transparent bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 ring-2 ring-primary/30 shadow-md'
                      : 'border-border/60 hover:border-primary/20 hover:bg-muted/30 hover:shadow-sm'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-br ${config.gradient} shadow-sm`
                      : config.bgColor
                  }`}>
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : config.color}`} />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {config.label}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Filter & Selection Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { mode: 'all' as FilterMode, label: 'Alle' },
            { mode: 'overdue' as FilterMode, label: 'Ueberfaellige', count: overduePlantIds.size },
          ].map(filter => (
            <Button
              key={filter.mode}
              size="sm"
              variant={filterMode === filter.mode ? 'default' : 'outline'}
              onClick={() => setFilterMode(filter.mode)}
              className={`gap-1.5 ${filterMode === filter.mode ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : ''}`}
            >
              {filter.mode === 'overdue' && <AlertTriangle className="h-3.5 w-3.5" />}
              {filter.label}
              {filter.count != null && filter.count > 0 && (
                <Badge variant={filterMode === filter.mode ? 'secondary' : 'destructive'} className="ml-0.5 h-4 px-1.5 text-[10px]">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
          {rooms.length > 0 && (
            <select
              value={filterMode === 'room' ? filterRoom : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setFilterMode('room');
                  setFilterRoom(e.target.value);
                } else {
                  setFilterMode('all');
                  setFilterRoom('');
                }
              }}
              className="h-8 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
            >
              <option value="">Nach Raum filtern...</option>
              {rooms.map((r) => {
                const apt = apartments.find((a) => a.id === r.apartment_id);
                return (
                  <option key={r.id} value={r.id}>
                    {r.name} {apt ? `(${apt.name})` : ''}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={selectAll} className="text-xs h-7 px-2.5">
            Alle
          </Button>
          <Button size="sm" variant="ghost" onClick={selectNone} className="text-xs h-7 px-2.5">
            Keine
          </Button>
          {overduePlantIds.size > 0 && (
            <Button size="sm" variant="ghost" onClick={selectOverdue} className="text-xs h-7 px-2.5 text-red-600 hover:text-red-700">
              Ueberfaellige
            </Button>
          )}
        </div>
      </div>

      {/* Plant List */}
      {filteredPlants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="font-medium text-muted-foreground">
              {filterMode === 'overdue'
                ? 'Keine ueberfaelligen Pflanzen fuer diese Pflege-Aktion.'
                : 'Keine Pflanzen vorhanden.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plantsByRoom.map(([roomId, group]) => (
            <Card key={roomId} className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <DoorOpen className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">{group.roomName}</span>
                  {group.apartmentName && (
                    <span className="text-xs text-muted-foreground">
                      {group.apartmentName}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {group.plants.length}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2.5"
                  onClick={() => selectRoom(roomId)}
                >
                  {group.plants.every((p) => selectedPlants.has(p.id))
                    ? 'Abwaehlen'
                    : 'Alle'}
                </Button>
              </div>
              <div className="divide-y divide-border/50">
                {group.plants.map((plant) => {
                  const isSelected = selectedPlants.has(plant.id);
                  const reminderInfo = getReminderInfo(plant);
                  const isOverdue = overduePlantIds.has(plant.id);

                  return (
                    <label
                      key={plant.id}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-primary/[0.04]'
                          : isOverdue
                            ? 'bg-red-50/40 dark:bg-red-950/10'
                            : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => togglePlant(plant.id)}
                          className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-green-600 data-[state=checked]:to-emerald-600 data-[state=checked]:border-green-600"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {plant.nickname || plant.species?.common_name || 'Unbekannt'}
                          </p>
                          {plant.nickname && plant.species && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {plant.species.common_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {reminderInfo && (
                          <Badge
                            variant={
                              reminderInfo.status === 'overdue'
                                ? 'destructive'
                                : reminderInfo.status === 'today'
                                  ? 'default'
                                  : 'secondary'
                            }
                            className="text-[10px] h-5"
                          >
                            {reminderInfo.label}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${
                            plant.health_status === 'thriving'
                              ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400'
                              : plant.health_status === 'good'
                                ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                                : plant.health_status === 'fair'
                                  ? 'border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400'
                                  : 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                          }`}
                        >
                          {plant.health_status === 'thriving'
                            ? 'Praechtig'
                            : plant.health_status === 'good'
                              ? 'Gut'
                              : plant.health_status === 'fair'
                                ? 'Maessig'
                                : 'Schlecht'}
                        </Badge>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Sticky Action Bar */}
      {filteredPlants.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <div className="glass rounded-2xl border shadow-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${activeConfig.gradient} flex items-center justify-center shadow-sm`}>
                {(() => {
                  const Icon = activeConfig.icon;
                  return <Icon className="h-5 w-5 text-white" />;
                })()}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {selectedPlants.size} {selectedPlants.size === 1 ? 'Pflanze' : 'Pflanzen'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConfig.label}
                </p>
              </div>
            </div>
            <Button
              onClick={handleBatchCare}
              disabled={selectedPlants.size === 0}
              size="lg"
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-600/20 disabled:shadow-none"
            >
              <CheckCircle2 className="h-4 w-4" />
              {activeConfig.label} ({selectedPlants.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
