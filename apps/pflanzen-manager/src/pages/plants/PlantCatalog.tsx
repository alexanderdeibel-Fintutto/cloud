import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PLANT_SPECIES } from '@/data/plants';
import { PlantSpecies } from '@/types';
import { AddPlantDialog } from '@/components/plants/AddPlantDialog';
import {
  Search,
  Droplets,
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  Leaf,
  ShieldCheck,
  Plus,
  X,
  Flower2,
  TreePine,
  Sprout,
} from 'lucide-react';

const FAMILY_EMOJI: Record<string, typeof Leaf> = {
  Araceae: Leaf,
  Cactaceae: Sprout,
  Asparagaceae: TreePine,
};

const FAMILY_COLORS: Record<string, string> = {
  Araceae: 'bg-green-200 dark:bg-green-900/40',
  Cactaceae: 'bg-yellow-200 dark:bg-yellow-900/40',
  Asparagaceae: 'bg-teal-200 dark:bg-teal-900/40',
  Moraceae: 'bg-emerald-200 dark:bg-emerald-900/40',
  Marantaceae: 'bg-lime-200 dark:bg-lime-900/40',
  Strelitziaceae: 'bg-orange-200 dark:bg-orange-900/40',
  Orchidaceae: 'bg-pink-200 dark:bg-pink-900/40',
  Piperaceae: 'bg-cyan-200 dark:bg-cyan-900/40',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Anfaenger',
  medium: 'Mittel',
  hard: 'Fortgeschritten',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const lightLabels: Record<string, string> = {
  low: 'Wenig Licht',
  medium: 'Mittleres Licht',
  bright: 'Hell',
  direct: 'Direkte Sonne',
};

const LightIcon = ({ level }: { level: string }) => {
  switch (level) {
    case 'direct':
      return <Sun className="h-4 w-4 text-yellow-500" />;
    case 'bright':
      return <SunMedium className="h-4 w-4 text-yellow-400" />;
    case 'medium':
      return <CloudSun className="h-4 w-4 text-orange-400" />;
    default:
      return <Cloud className="h-4 w-4 text-gray-400" />;
  }
};

const waterLabels: Record<string, string> = {
  little: 'Wenig',
  moderate: 'Maessig',
  much: 'Viel',
};

type FilterKey = 'difficulty' | 'light' | 'petSafe';

interface ActiveFilter {
  key: FilterKey;
  value: string;
  label: string;
}

export default function PlantCatalog() {
  const navigate = useNavigate();
  const { apartments } = usePlants();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  const toggleFilter = (filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const exists = prev.find(
        (f) => f.key === filter.key && f.value === filter.value
      );
      if (exists) {
        return prev.filter(
          (f) => !(f.key === filter.key && f.value === filter.value)
        );
      }
      // Replace filter of same key
      return [...prev.filter((f) => f.key !== filter.key), filter];
    });
  };

  const isFilterActive = (key: FilterKey, value: string) =>
    activeFilters.some((f) => f.key === key && f.value === value);

  const filteredSpecies = useMemo(() => {
    let result = [...PLANT_SPECIES];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.common_name.toLowerCase().includes(q) ||
          s.botanical_name.toLowerCase().includes(q)
      );
    }

    // Filters
    activeFilters.forEach((filter) => {
      if (filter.key === 'difficulty') {
        result = result.filter((s) => s.difficulty === filter.value);
      }
      if (filter.key === 'light') {
        result = result.filter((s) => s.light === filter.value);
      }
      if (filter.key === 'petSafe') {
        result = result.filter((s) => !s.toxic_pets);
      }
    });

    return result;
  }, [searchQuery, activeFilters]);

  function handleAddPlant(speciesId: string) {
    if (apartments.length === 0) {
      navigate('/apartments');
      return;
    }
    setSelectedSpeciesId(speciesId);
    setAddDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pflanzenkatalog</h1>
        <p className="text-muted-foreground">
          Entdecke {PLANT_SPECIES.length} verschiedene Pflanzenarten und fuege
          sie deiner Sammlung hinzu.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pflanze suchen (Name oder botanischer Name)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Chips */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Difficulty filters */}
          <span className="text-sm text-muted-foreground self-center mr-1">
            Schwierigkeit:
          </span>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() =>
                toggleFilter({
                  key: 'difficulty',
                  value: d,
                  label: difficultyLabels[d],
                })
              }
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                isFilterActive('difficulty', d)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              {difficultyLabels[d]}
            </button>
          ))}

          <span className="text-muted-foreground">|</span>

          {/* Light filters */}
          <span className="text-sm text-muted-foreground self-center mr-1">
            Licht:
          </span>
          {(['low', 'medium', 'bright', 'direct'] as const).map((l) => (
            <button
              key={l}
              onClick={() =>
                toggleFilter({
                  key: 'light',
                  value: l,
                  label: lightLabels[l],
                })
              }
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                isFilterActive('light', l)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-background border-input hover:bg-accent'
              }`}
            >
              <LightIcon level={l} />
              {lightLabels[l]}
            </button>
          ))}

          <span className="text-muted-foreground">|</span>

          {/* Pet-safe filter */}
          <button
            onClick={() =>
              toggleFilter({
                key: 'petSafe',
                value: 'true',
                label: 'Haustierfreundlich',
              })
            }
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              isFilterActive('petSafe', 'true')
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-background border-input hover:bg-accent'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Haustierfreundlich
          </button>
        </div>

        {/* Active filter badges */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Aktive Filter:</span>
            {activeFilters.map((f) => (
              <Badge
                key={`${f.key}-${f.value}`}
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => toggleFilter(f)}
              >
                {f.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <button
              className="text-xs text-muted-foreground underline hover:no-underline"
              onClick={() => setActiveFilters([])}
            >
              Alle entfernen
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredSpecies.length}{' '}
        {filteredSpecies.length === 1 ? 'Pflanze' : 'Pflanzen'} gefunden
      </p>

      {/* Plant Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSpecies.map((species) => {
          const FamilyIcon =
            FAMILY_EMOJI[species.family] || Flower2;
          const bgColor =
            FAMILY_COLORS[species.family] || 'bg-green-200 dark:bg-green-900/40';

          return (
            <Card
              key={species.id}
              className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-green-100 dark:border-green-900/30"
              onClick={() => navigate(`/catalog/${species.id}`)}
            >
              {/* Image placeholder */}
              <div
                className={`h-40 ${bgColor} flex items-center justify-center relative`}
              >
                <FamilyIcon className="h-16 w-16 text-green-700/30 dark:text-green-300/30" />
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`${difficultyColors[species.difficulty]} border-0 text-[10px]`}
                  >
                    {difficultyLabels[species.difficulty]}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base leading-tight group-hover:text-green-600 transition-colors">
                    {species.common_name}
                  </h3>
                  <p className="text-xs text-muted-foreground italic">
                    {species.botanical_name}
                  </p>
                </div>

                {/* Quick info */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <LightIcon level={species.light} />
                    {lightLabels[species.light]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" />
                    {waterLabels[species.water_amount]}
                  </span>
                </div>

                {/* Tags */}
                {species.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {species.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {species.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{species.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Add button */}
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPlant(species.id);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Zu meinen Pflanzen hinzufuegen
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty search result */}
      {filteredSpecies.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Keine Pflanzen gefunden</h3>
          <p className="text-muted-foreground">
            Versuche einen anderen Suchbegriff oder entferne Filter.
          </p>
        </div>
      )}

      {/* Add Plant Dialog */}
      {selectedSpeciesId && (
        <AddPlantDialog
          speciesId={selectedSpeciesId}
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) setSelectedSpeciesId(null);
          }}
        />
      )}
    </div>
  );
}
