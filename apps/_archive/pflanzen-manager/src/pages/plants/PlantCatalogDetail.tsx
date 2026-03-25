import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLANT_SPECIES } from '@/data/plants';
import { AddPlantDialog } from '@/components/plants/AddPlantDialog';
import {
  ArrowLeft,
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  Ruler,
  TrendingUp,
  RefreshCw,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  Tag,
  Plus,
  Flower2,
  Leaf,
  Sprout,
} from 'lucide-react';

const difficultyLabels: Record<string, string> = {
  easy: 'Anfaenger',
  medium: 'Mittel',
  hard: 'Fortgeschritten',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
};

const lightLabels: Record<string, string> = {
  low: 'Wenig Licht',
  medium: 'Mittleres Licht',
  bright: 'Helles Licht',
  direct: 'Direkte Sonne',
};

const lightIcons: Record<string, typeof Sun> = {
  direct: Sun,
  bright: SunMedium,
  medium: CloudSun,
  low: Cloud,
};

const waterLabels: Record<string, string> = {
  little: 'Wenig',
  moderate: 'Maessig',
  much: 'Viel',
};

const humidityLabels: Record<string, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
};

const growthLabels: Record<string, string> = {
  slow: 'Langsam',
  medium: 'Mittel',
  fast: 'Schnell',
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

export default function PlantCatalogDetail() {
  const { speciesId } = useParams<{ speciesId: string }>();
  const navigate = useNavigate();
  const { apartments } = usePlants();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const species = PLANT_SPECIES.find((s) => s.id === speciesId);

  if (!species) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Flower2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Pflanze nicht gefunden</h2>
        <p className="text-muted-foreground mb-4">
          Die gesuchte Pflanzenart existiert nicht im Katalog.
        </p>
        <Button variant="outline" onClick={() => navigate('/catalog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurueck zum Katalog
        </Button>
      </div>
    );
  }

  const LightIcon = lightIcons[species.light] || Cloud;
  const bgColor = FAMILY_COLORS[species.family] || 'bg-green-200 dark:bg-green-900/40';

  function handleAddPlant() {
    if (apartments.length === 0) {
      navigate('/apartments');
      return;
    }
    setAddDialogOpen(true);
  }

  const monthNames = [
    'Jan', 'Feb', 'Marz', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/catalog')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck zum Katalog
      </Button>

      {/* Header section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image placeholder */}
        <div className={`${bgColor} rounded-xl flex items-center justify-center h-64 lg:h-full min-h-64`}>
          <Leaf className="h-24 w-24 text-green-700/20 dark:text-green-300/20" />
        </div>

        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {species.common_name}
                </h1>
                <p className="text-lg text-muted-foreground italic">
                  {species.botanical_name}
                </p>
              </div>
              <Badge className={`${difficultyColors[species.difficulty]} border text-sm px-3 py-1`}>
                {difficultyLabels[species.difficulty]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Familie: {species.family}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {species.description}
          </p>

          {/* Toxicity warnings */}
          {(species.toxic_pets || species.toxic_children) && (
            <div className="flex flex-wrap gap-2">
              {species.toxic_pets && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Giftig fuer Haustiere
                </div>
              )}
              {species.toxic_children && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Giftig fuer Kinder
                </div>
              )}
              {!species.toxic_pets && !species.toxic_children && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-sm text-green-700 dark:text-green-400">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  Ungiftig
                </div>
              )}
            </div>
          )}
          {!species.toxic_pets && !species.toxic_children && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-sm text-green-700 dark:text-green-400">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                Ungiftig fuer Haustiere und Kinder
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAddPlant}
          >
            <Plus className="mr-2 h-5 w-5" />
            Zu meinen Pflanzen hinzufuegen
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Herkunft</p>
              <p className="font-medium">{species.origin}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
              <LightIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lichtbedarf</p>
              <p className="font-medium">{lightLabels[species.light]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
              <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giessbedarf</p>
              <p className="font-medium">
                {waterLabels[species.water_amount]} (alle{' '}
                {species.water_frequency_days} Tage)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <Wind className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Luftfeuchtigkeit</p>
              <p className="font-medium">{humidityLabels[species.humidity]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperatur</p>
              <p className="font-medium">
                {species.temperature_min}&deg;C - {species.temperature_max}&deg;C
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Ruler className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max. Hoehe</p>
              <p className="font-medium">{species.max_height_cm} cm</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wachstum</p>
              <p className="font-medium">{growthLabels[species.growth_speed]}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umtopfen</p>
              <p className="font-medium">
                Alle {species.repot_frequency_years}{' '}
                {species.repot_frequency_years === 1 ? 'Jahr' : 'Jahre'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Sprout className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duengen</p>
              <p className="font-medium">
                Alle {species.fertilize_frequency_days} Tage
              </p>
              <p className="text-xs text-muted-foreground">
                In:{' '}
                {species.fertilize_months
                  .map((m) => monthNames[m - 1])
                  .join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Care Tips */}
      {species.care_tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Pflegetipps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {species.care_tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-medium text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {species.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              Schlagwoerter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {species.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Plant Dialog */}
      {speciesId && (
        <AddPlantDialog
          speciesId={speciesId}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      )}
    </div>
  );
}
