import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Droplets,
  Leaf,
  FlowerIcon,
  Sparkles,
  Trash2,
  ArrowLeft,
  Home,
  DoorOpen,
  CalendarDays,
  Clock,
  Heart,
  ExternalLink,
  Pencil,
  Save,
  Scissors,
  Wind,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { UserPlant, CareEvent } from '@/types';
import { toast } from 'sonner';

const healthStatusConfig: Record<
  string,
  { label: string; color: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  thriving: { label: 'Praechtig', color: 'text-green-600', badgeVariant: 'default' },
  good: { label: 'Gut', color: 'text-emerald-500', badgeVariant: 'secondary' },
  fair: { label: 'Maessig', color: 'text-amber-500', badgeVariant: 'outline' },
  poor: { label: 'Schlecht', color: 'text-red-500', badgeVariant: 'destructive' },
};

const careTypeConfig: Record<
  string,
  { label: string; icon: typeof Droplets; color: string; pastTense: string }
> = {
  water: { label: 'Giessen', icon: Droplets, color: 'text-blue-500', pastTense: 'Gegossen' },
  fertilize: { label: 'Duengen', icon: Leaf, color: 'text-green-500', pastTense: 'Geduengt' },
  repot: { label: 'Umtopfen', icon: FlowerIcon, color: 'text-amber-600', pastTense: 'Umgetopft' },
  prune: { label: 'Schneiden', icon: Scissors, color: 'text-purple-500', pastTense: 'Geschnitten' },
  mist: { label: 'Besprühen', icon: Wind, color: 'text-cyan-500', pastTense: 'Besprueht' },
  rotate: { label: 'Drehen', icon: RotateCcw, color: 'text-gray-500', pastTense: 'Gedreht' },
};

export default function PlantDetail() {
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const {
    plants,
    careEvents,
    apartments,
    rooms,
    species,
    updatePlant,
    deletePlant,
    logCareEvent,
    getEnrichedPlants,
  } = usePlants();

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [editingFrequency, setEditingFrequency] = useState(false);
  const [waterFreqOverride, setWaterFreqOverride] = useState<string>('');
  const [fertilizeFreqOverride, setFertilizeFreqOverride] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get enriched plant
  const enrichedPlant = useMemo(() => {
    const enriched = getEnrichedPlants();
    return enriched.find(p => p.id === plantId);
  }, [getEnrichedPlants, plantId]);

  // Plant care events sorted by date descending
  const plantCareEvents = useMemo(() => {
    return careEvents
      .filter(e => e.plant_id === plantId)
      .sort((a, b) => b.performed_at.localeCompare(a.performed_at));
  }, [careEvents, plantId]);

  if (!enrichedPlant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Pflanze nicht gefunden</h2>
        <p className="text-muted-foreground mt-1">
          Die angeforderte Pflanze existiert nicht oder wurde geloescht.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/plants')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurueck zur Uebersicht
        </Button>
      </div>
    );
  }

  const plant = enrichedPlant;
  const speciesData = plant.species;
  const room = plant.room;
  const apartment = room?.apartment;
  const healthConfig = healthStatusConfig[plant.health_status] || healthStatusConfig.good;

  const handleQuickAction = (type: CareEvent['type']) => {
    const now = new Date().toISOString();
    logCareEvent({
      plant_id: plant.id,
      type,
      performed_at: now,
      notes: '',
    });
    const config = careTypeConfig[type];
    toast.success(`${plant.nickname} ${config?.pastTense?.toLowerCase() || 'gepflegt'}!`, {
      icon: config?.icon ? <config.icon className={`h-5 w-5 ${config.color}`} /> : undefined,
    });
  };

  const handleHealthChange = (value: string) => {
    updatePlant(plant.id, { health_status: value as UserPlant['health_status'] });
    const label = healthStatusConfig[value]?.label || value;
    toast.success(`Gesundheitsstatus auf "${label}" geaendert.`);
  };

  const handleSaveNotes = () => {
    updatePlant(plant.id, { notes: notesValue });
    setEditingNotes(false);
    toast.success('Notizen gespeichert.');
  };

  const handleStartEditNotes = () => {
    setNotesValue(plant.notes || '');
    setEditingNotes(true);
  };

  const handleStartEditFrequency = () => {
    setWaterFreqOverride(plant.water_frequency_override?.toString() || '');
    setFertilizeFreqOverride(plant.fertilize_frequency_override?.toString() || '');
    setEditingFrequency(true);
  };

  const handleSaveFrequency = () => {
    const waterVal = waterFreqOverride.trim() ? parseInt(waterFreqOverride, 10) : null;
    const fertVal = fertilizeFreqOverride.trim() ? parseInt(fertilizeFreqOverride, 10) : null;
    updatePlant(plant.id, {
      water_frequency_override: waterVal && !isNaN(waterVal) ? waterVal : null,
      fertilize_frequency_override: fertVal && !isNaN(fertVal) ? fertVal : null,
    });
    setEditingFrequency(false);
    toast.success('Pflegeintervalle gespeichert.');
  };

  const handleDelete = () => {
    deletePlant(plant.id);
    toast.success(`"${plant.nickname}" wurde geloescht.`);
    navigate('/plants');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nie';
    try {
      return format(parseISO(dateStr), 'dd. MMM yyyy', { locale: de });
    } catch {
      return 'Unbekannt';
    }
  };

  const formatDateFull = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd. MMM yyyy, HH:mm', { locale: de });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/plants')}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zurueck
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {plant.image_url ? (
                <img
                  src={plant.image_url}
                  alt={plant.nickname}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 text-primary">
                  <Leaf className="h-10 w-10" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{plant.nickname}</h1>
                {speciesData && (
                  <Link
                    to={`/catalog/${speciesData.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {speciesData.common_name}
                    <span className="italic text-sm">({speciesData.botanical_name})</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Select value={plant.health_status} onValueChange={handleHealthChange}>
                    <SelectTrigger className="w-auto h-8 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Heart className={`h-3.5 w-3.5 ${healthConfig.color}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thriving">Praechtig</SelectItem>
                      <SelectItem value="good">Gut</SelectItem>
                      <SelectItem value="fair">Maessig</SelectItem>
                      <SelectItem value="poor">Schlecht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="text-sm text-muted-foreground">
              {apartment && (
                <p className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  {apartment.name}
                </p>
              )}
              {room && (
                <p className="flex items-center gap-1.5 mt-1">
                  <DoorOpen className="h-4 w-4" />
                  {room.name}
                </p>
              )}
              <p className="flex items-center gap-1.5 mt-1">
                <CalendarDays className="h-4 w-4" />
                Erworben: {formatDate(plant.acquired_date)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1.5"
              onClick={() => handleQuickAction('water')}
            >
              <Droplets className="h-5 w-5 text-blue-500" />
              <span className="text-xs">Giessen</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1.5"
              onClick={() => handleQuickAction('fertilize')}
            >
              <Leaf className="h-5 w-5 text-green-500" />
              <span className="text-xs">Duengen</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1.5"
              onClick={() => handleQuickAction('repot')}
            >
              <FlowerIcon className="h-5 w-5 text-amber-600" />
              <span className="text-xs">Umtopfen</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1.5"
              onClick={() => handleQuickAction('mist')}
            >
              <Wind className="h-5 w-5 text-cyan-500" />
              <span className="text-xs">Besprühen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Care History Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pflegeverlauf
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                Zuletzt gegossen
              </span>
              <span className="text-sm font-medium">{formatDate(plant.last_watered)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-green-500" />
                Zuletzt geduengt
              </span>
              <span className="text-sm font-medium">{formatDate(plant.last_fertilized)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-sm">
                <FlowerIcon className="h-4 w-4 text-amber-600" />
                Zuletzt umgetopft
              </span>
              <span className="text-sm font-medium">{formatDate(plant.last_repotted)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Custom Frequency Overrides */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Pflegeintervalle
              </CardTitle>
              {!editingFrequency && (
                <Button variant="ghost" size="sm" onClick={handleStartEditFrequency}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Anpassen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingFrequency ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Giessintervall (Tage)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={speciesData ? `Standard: ${speciesData.water_frequency_days} Tage` : 'Tage'}
                    value={waterFreqOverride}
                    onChange={e => setWaterFreqOverride(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leer lassen fuer den Standardwert der Art
                    {speciesData ? ` (${speciesData.water_frequency_days} Tage)` : ''}.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Duengeintervall (Tage)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={speciesData ? `Standard: ${speciesData.fertilize_frequency_days} Tage` : 'Tage'}
                    value={fertilizeFreqOverride}
                    onChange={e => setFertilizeFreqOverride(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leer lassen fuer den Standardwert der Art
                    {speciesData ? ` (${speciesData.fertilize_frequency_days} Tage)` : ''}.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveFrequency}>
                    <Save className="h-4 w-4 mr-1" />
                    Speichern
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingFrequency(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center gap-2 text-sm">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Giessintervall
                  </span>
                  <span className="text-sm font-medium">
                    {plant.water_frequency_override
                      ? `${plant.water_frequency_override} Tage (angepasst)`
                      : speciesData
                        ? `${speciesData.water_frequency_days} Tage (Standard)`
                        : 'Unbekannt'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-green-500" />
                    Duengeintervall
                  </span>
                  <span className="text-sm font-medium">
                    {plant.fertilize_frequency_override
                      ? `${plant.fertilize_frequency_override} Tage (angepasst)`
                      : speciesData
                        ? `${speciesData.fertilize_frequency_days} Tage (Standard)`
                        : 'Unbekannt'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Notizen
            </CardTitle>
            {!editingNotes && (
              <Button variant="ghost" size="sm" onClick={handleStartEditNotes}>
                <Pencil className="h-4 w-4 mr-1" />
                Bearbeiten
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
                rows={4}
                placeholder="Notizen zur Pflanze..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4 mr-1" />
                  Speichern
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {plant.notes || 'Keine Notizen vorhanden. Klicke auf "Bearbeiten", um welche hinzuzufuegen.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Care Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Pflegeereignisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plantCareEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Noch keine Pflegeereignisse aufgezeichnet.</p>
              <p className="text-xs mt-1">Verwende die Schnellaktionen oben, um Ereignisse zu protokollieren.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {plantCareEvents.map(event => {
                const config = careTypeConfig[event.type] || careTypeConfig.water;
                const Icon = config.icon;

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className={`flex-shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{config.label}</p>
                      {event.notes && (
                        <p className="text-xs text-muted-foreground truncate">{event.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDateFull(event.performed_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pflanze loeschen
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Loescht die Pflanze und alle zugehoerigen Daten unwiderruflich.
              </p>
            </div>
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Loeschen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pflanze wirklich loeschen?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Bist du sicher, dass du <strong>{plant.nickname}</strong> loeschen moechtest?
                  Alle Pflegeereignisse bleiben erhalten, aber die Pflanze wird unwiderruflich entfernt.
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                    Abbrechen
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Endgueltig loeschen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
