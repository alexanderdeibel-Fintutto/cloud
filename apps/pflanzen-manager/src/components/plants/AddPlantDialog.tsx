import { useState, useMemo } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLANT_SPECIES } from '@/data/plants';
import { Flower2, Leaf } from 'lucide-react';
import { format } from 'date-fns';

interface AddPlantDialogProps {
  speciesId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPlantDialog({
  speciesId,
  open,
  onOpenChange,
}: AddPlantDialogProps) {
  const { apartments, getRoomsForApartment, addPlant } = usePlants();

  const species = PLANT_SPECIES.find((s) => s.id === speciesId);

  const [nickname, setNickname] = useState('');
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [acquiredDate, setAcquiredDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRooms = useMemo(() => {
    if (!selectedApartment) return [];
    return getRoomsForApartment(selectedApartment);
  }, [selectedApartment, getRoomsForApartment]);

  function resetForm() {
    setNickname('');
    setSelectedApartment('');
    setSelectedRoom('');
    setAcquiredDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setIsSubmitting(false);
  }

  function handleApartmentChange(value: string) {
    setSelectedApartment(value);
    setSelectedRoom('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !speciesId) return;

    setIsSubmitting(true);

    try {
      addPlant({
        species_id: speciesId,
        room_id: selectedRoom,
        nickname: nickname.trim() || species?.common_name || '',
        acquired_date: acquiredDate,
        last_watered: null,
        last_fertilized: null,
        last_repotted: null,
        water_frequency_override: null,
        fertilize_frequency_override: null,
        notes: notes.trim(),
        image_url: null,
        health_status: 'good',
      });

      resetForm();
      onOpenChange(false);
    } catch {
      setIsSubmitting(false);
    }
  }

  if (!species) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Pflanze hinzufuegen
          </DialogTitle>
          <DialogDescription>
            Fuege <span className="font-medium">{species.common_name}</span> (
            <span className="italic">{species.botanical_name}</span>) deiner
            Sammlung hinzu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Spitzname</Label>
            <Input
              id="nickname"
              placeholder={species.common_name}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Gib deiner Pflanze einen persoenlichen Namen (optional).
            </p>
          </div>

          {/* Apartment */}
          <div className="space-y-2">
            <Label htmlFor="apartment">
              Wohnung <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedApartment}
              onValueChange={handleApartmentChange}
            >
              <SelectTrigger id="apartment">
                <SelectValue placeholder="Wohnung waehlen..." />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {apt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room">
              Raum <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRoom}
              onValueChange={setSelectedRoom}
              disabled={!selectedApartment}
            >
              <SelectTrigger id="room">
                <SelectValue
                  placeholder={
                    !selectedApartment
                      ? 'Zuerst Wohnung waehlen'
                      : availableRooms.length === 0
                      ? 'Keine Raeume vorhanden'
                      : 'Raum waehlen...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedApartment && availableRooms.length === 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Diese Wohnung hat noch keine Raeume. Bitte lege zuerst einen
                Raum an.
              </p>
            )}
          </div>

          {/* Acquired date */}
          <div className="space-y-2">
            <Label htmlFor="acquired-date">Erworben am</Label>
            <Input
              id="acquired-date"
              type="date"
              value={acquiredDate}
              onChange={(e) => setAcquiredDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="z.B. Gekauft bei Baumarkt, Fensterbank Suedseite..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedRoom || isSubmitting}
            >
              <Flower2 className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Wird hinzugefuegt...' : 'Pflanze hinzufuegen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
