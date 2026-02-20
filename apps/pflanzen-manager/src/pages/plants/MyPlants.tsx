import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlant } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Flower2,
  Droplets,
  Sparkles,
  Plus,
  Home,
  DoorOpen,
  Heart,
  Leaf,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { de } from 'date-fns/locale';

const healthLabels: Record<string, string> = {
  thriving: 'Praechtig',
  good: 'Gut',
  fair: 'Maessig',
  poor: 'Schlecht',
};

const healthColors: Record<string, string> = {
  thriving: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const healthBadgeVariants: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  thriving: 'success',
  good: 'success',
  fair: 'warning',
  poor: 'destructive',
};

type SortOption = 'name' | 'care-urgency' | 'health' | 'newest';

export default function MyPlants() {
  const navigate = useNavigate();
  const {
    plants,
    apartments,
    rooms,
    getEnrichedPlants,
    logCareEvent,
    getOverdueReminders,
  } = usePlants();

  const [filterApartment, setFilterApartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const enrichedPlants = useMemo(() => getEnrichedPlants(), [getEnrichedPlants]);
  const overdueReminders = useMemo(() => getOverdueReminders(), [getOverdueReminders]);

  // Check which plants have overdue water/fertilize
  const overdueMap = useMemo(() => {
    const map: Record<string, { water: boolean; fertilize: boolean }> = {};
    overdueReminders.forEach((r) => {
      if (!map[r.plant_id]) map[r.plant_id] = { water: false, fertilize: false };
      if (r.type === 'water') map[r.plant_id].water = true;
      if (r.type === 'fertilize') map[r.plant_id].fertilize = true;
    });
    return map;
  }, [overdueReminders]);

  // Filter and sort
  const filteredPlants = useMemo(() => {
    let result = [...enrichedPlants];

    // Filter by apartment
    if (filterApartment !== 'all') {
      result = result.filter(
        (p) => p.room?.apartment?.id === filterApartment
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) =>
          (a.nickname || a.species?.common_name || '').localeCompare(
            b.nickname || b.species?.common_name || ''
          )
        );
        break;
      case 'care-urgency': {
        const urgencyScore = (p: UserPlant) => {
          const overdue = overdueMap[p.id];
          if (overdue?.water && overdue?.fertilize) return 0;
          if (overdue?.water) return 1;
          if (overdue?.fertilize) return 2;
          return 3;
        };
        result.sort((a, b) => urgencyScore(a) - urgencyScore(b));
        break;
      }
      case 'health': {
        const healthScore: Record<string, number> = {
          poor: 0,
          fair: 1,
          good: 2,
          thriving: 3,
        };
        result.sort(
          (a, b) => healthScore[a.health_status] - healthScore[b.health_status]
        );
        break;
      }
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [enrichedPlants, filterApartment, sortBy, overdueMap]);

  // Group plants by apartment > room
  const groupedPlants = useMemo(() => {
    const groups: Record<
      string,
      {
        apartment: { id: string; name: string };
        rooms: Record<
          string,
          {
            room: { id: string; name: string };
            plants: UserPlant[];
          }
        >;
      }
    > = {};

    filteredPlants.forEach((plant) => {
      const aptId = plant.room?.apartment?.id || 'unknown';
      const aptName = plant.room?.apartment?.name || 'Unbekannte Wohnung';
      const roomId = plant.room?.id || 'unknown';
      const roomName = plant.room?.name || 'Unbekannter Raum';

      if (!groups[aptId]) {
        groups[aptId] = {
          apartment: { id: aptId, name: aptName },
          rooms: {},
        };
      }
      if (!groups[aptId].rooms[roomId]) {
        groups[aptId].rooms[roomId] = {
          room: { id: roomId, name: roomName },
          plants: [],
        };
      }
      groups[aptId].rooms[roomId].plants.push(plant);
    });

    return groups;
  }, [filteredPlants]);

  function handleWaterNow(plantId: string) {
    logCareEvent({
      plant_id: plantId,
      type: 'water',
      performed_at: new Date().toISOString(),
      notes: '',
    });
  }

  function handleFertilizeNow(plantId: string) {
    logCareEvent({
      plant_id: plantId,
      type: 'fertilize',
      performed_at: new Date().toISOString(),
      notes: '',
    });
  }

  function daysSinceWatered(plant: UserPlant): number | null {
    if (!plant.last_watered) return null;
    return differenceInDays(new Date(), parseISO(plant.last_watered));
  }

  // --- Empty state: no apartments ---
  if (apartments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
          <Home className="h-12 w-12 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Zuerst eine Wohnung anlegen
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Bevor du Pflanzen hinzufuegen kannst, musst du mindestens eine Wohnung
          und einen Raum anlegen, in dem deine Pflanzen stehen.
        </p>
        <Button
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => navigate('/apartments')}
        >
          <Home className="mr-2 h-5 w-5" />
          Wohnung anlegen
        </Button>
      </div>
    );
  }

  // --- Empty state: no plants ---
  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <Leaf className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Noch keine Pflanzen
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Starte deine Pflanzensammlung, indem du deine erste Pflanze aus dem
          Katalog hinzufuegst.
        </p>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate('/catalog')}
        >
          <Plus className="mr-2 h-5 w-5" />
          Pflanze hinzufuegen
        </Button>
      </div>
    );
  }

  // --- Main view ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Pflanzen</h1>
          <p className="text-muted-foreground">
            {plants.length} {plants.length === 1 ? 'Pflanze' : 'Pflanzen'} in
            deiner Sammlung
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate('/catalog')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Pflanze hinzufuegen
        </Button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterApartment} onValueChange={setFilterApartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wohnung filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Wohnungen</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sortieren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="care-urgency">Pflegebedarf</SelectItem>
              <SelectItem value="health">Gesundheit</SelectItem>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grouped plant display */}
      {Object.entries(groupedPlants).map(([aptId, group]) => (
        <div key={aptId} className="space-y-4">
          {/* Apartment header */}
          <div className="flex items-center gap-2 pt-2">
            <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold">{group.apartment.name}</h2>
          </div>

          {Object.entries(group.rooms).map(([roomId, roomGroup]) => (
            <div key={roomId} className="space-y-3">
              {/* Room header */}
              <div className="flex items-center gap-2 pl-4">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-base font-medium text-muted-foreground">
                  {roomGroup.room.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {roomGroup.plants.length}{' '}
                  {roomGroup.plants.length === 1 ? 'Pflanze' : 'Pflanzen'}
                </Badge>
              </div>

              {/* Plant cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                {roomGroup.plants.map((plant) => {
                  const overdue = overdueMap[plant.id];
                  const waterDays = daysSinceWatered(plant);
                  const speciesName =
                    plant.species?.common_name || 'Unbekannte Art';

                  return (
                    <Card
                      key={plant.id}
                      className={`overflow-hidden transition-shadow hover:shadow-md ${
                        overdue?.water
                          ? 'border-red-200 dark:border-red-800/50'
                          : 'border-green-100 dark:border-green-900/30'
                      }`}
                    >
                      {/* Card header with plant image placeholder */}
                      <div className="h-24 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center relative">
                        <Flower2 className="h-10 w-10 text-green-600/30 dark:text-green-400/30" />
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={healthBadgeVariants[plant.health_status]}
                            className="text-[10px]"
                          >
                            {healthLabels[plant.health_status]}
                          </Badge>
                        </div>
                        {overdue?.water && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="text-[10px]">
                              Giessen faellig!
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 space-y-3">
                        {/* Name */}
                        <div>
                          <h4 className="font-semibold leading-tight">
                            {plant.nickname || speciesName}
                          </h4>
                          {plant.nickname && (
                            <p className="text-xs text-muted-foreground italic">
                              {speciesName}
                            </p>
                          )}
                        </div>

                        {/* Info row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {plant.room?.name || 'Unbekannt'}
                          </span>
                          {waterDays !== null && (
                            <span className="flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-400" />
                              Vor {waterDays}{' '}
                              {waterDays === 1 ? 'Tag' : 'Tagen'} gegossen
                            </span>
                          )}
                          {waterDays === null && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Noch nicht gegossen
                            </span>
                          )}
                        </div>

                        {/* Quick actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={overdue?.water ? 'default' : 'outline'}
                            className={
                              overdue?.water
                                ? 'bg-blue-600 hover:bg-blue-700 flex-1'
                                : 'flex-1'
                            }
                            onClick={() => handleWaterNow(plant.id)}
                          >
                            <Droplets className="mr-1 h-3.5 w-3.5" />
                            Giessen
                          </Button>
                          <Button
                            size="sm"
                            variant={overdue?.fertilize ? 'default' : 'outline'}
                            className={
                              overdue?.fertilize
                                ? 'bg-green-600 hover:bg-green-700 flex-1'
                                : 'flex-1'
                            }
                            onClick={() => handleFertilizeNow(plant.id)}
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Duengen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
