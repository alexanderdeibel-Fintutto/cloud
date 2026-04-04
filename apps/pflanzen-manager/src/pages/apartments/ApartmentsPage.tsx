import { useState } from 'react';
import { usePlants } from '@/hooks/usePlantContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Home,
  DoorOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  Flower2,
  Compass,
} from 'lucide-react';
import { Apartment, Room } from '@/types';

const lightLevelLabels: Record<string, string> = {
  low: 'Wenig Licht',
  medium: 'Mittleres Licht',
  bright: 'Hell',
  direct: 'Direkte Sonne',
};

const lightLevelIcons: Record<string, typeof Sun> = {
  low: Cloud,
  medium: CloudSun,
  bright: SunMedium,
  direct: Sun,
};

const windowDirectionLabels: Record<string, string> = {
  north: 'Norden',
  east: 'Osten',
  south: 'Sueden',
  west: 'Westen',
  none: 'Kein Fenster',
};

export default function ApartmentsPage() {
  const {
    apartments,
    rooms,
    plants,
    addApartment,
    updateApartment,
    deleteApartment,
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomsForApartment,
  } = usePlants();

  const [expandedApartment, setExpandedApartment] = useState<string | null>(null);
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [editingApartment, setEditingApartment] = useState<string | null>(null);
  const [showAddRoom, setShowAddRoom] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);

  // Apartment form state
  const [aptName, setAptName] = useState('');
  const [aptAddress, setAptAddress] = useState('');

  // Room form state
  const [roomName, setRoomName] = useState('');
  const [roomLight, setRoomLight] = useState<Room['light_level']>('medium');
  const [roomWindow, setRoomWindow] = useState<Room['window_direction']>('none');
  const [roomNotes, setRoomNotes] = useState('');

  const getPlantsInRoom = (roomId: string) => plants.filter(p => p.room_id === roomId);
  const getPlantsInApartment = (apartmentId: string) => {
    const aptRoomIds = getRoomsForApartment(apartmentId).map(r => r.id);
    return plants.filter(p => aptRoomIds.includes(p.room_id));
  };

  const handleAddApartment = () => {
    if (!aptName.trim()) return;
    addApartment({ name: aptName.trim(), address: aptAddress.trim() });
    setAptName('');
    setAptAddress('');
    setShowAddApartment(false);
  };

  const handleEditApartment = (apt: Apartment) => {
    setEditingApartment(apt.id);
    setAptName(apt.name);
    setAptAddress(apt.address);
  };

  const handleSaveApartment = (id: string) => {
    if (!aptName.trim()) return;
    updateApartment(id, { name: aptName.trim(), address: aptAddress.trim() });
    setEditingApartment(null);
    setAptName('');
    setAptAddress('');
  };

  const handleDeleteApartment = (id: string) => {
    if (window.confirm('Wohnung und alle zugehoerigen Raeume und Pflanzen wirklich loeschen?')) {
      deleteApartment(id);
      if (expandedApartment === id) setExpandedApartment(null);
    }
  };

  const handleAddRoom = (apartmentId: string) => {
    if (!roomName.trim()) return;
    addRoom({
      apartment_id: apartmentId,
      name: roomName.trim(),
      light_level: roomLight,
      window_direction: roomWindow,
      notes: roomNotes.trim(),
    });
    resetRoomForm();
    setShowAddRoom(null);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room.id);
    setRoomName(room.name);
    setRoomLight(room.light_level);
    setRoomWindow(room.window_direction);
    setRoomNotes(room.notes);
  };

  const handleSaveRoom = (id: string) => {
    if (!roomName.trim()) return;
    updateRoom(id, {
      name: roomName.trim(),
      light_level: roomLight,
      window_direction: roomWindow,
      notes: roomNotes.trim(),
    });
    resetRoomForm();
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('Raum und alle zugehoerigen Pflanzen wirklich loeschen?')) {
      deleteRoom(id);
    }
  };

  const resetRoomForm = () => {
    setRoomName('');
    setRoomLight('medium');
    setRoomWindow('none');
    setRoomNotes('');
  };

  const toggleExpand = (aptId: string) => {
    setExpandedApartment(prev => (prev === aptId ? null : aptId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-7 w-7 text-primary" />
            Wohnungen & Raeume
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine Wohnungen und Raeume fuer deine Pflanzen.
          </p>
        </div>
        <Button onClick={() => { setShowAddApartment(true); setAptName(''); setAptAddress(''); }}>
          <Plus className="h-4 w-4 mr-2" />
          Wohnung hinzufuegen
        </Button>
      </div>

      {/* Add Apartment Form */}
      {showAddApartment && (
        <Card className="border-dashed border-primary/50">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apt-name">Name</Label>
                <Input
                  id="apt-name"
                  placeholder="z.B. Hauptwohnung"
                  value={aptName}
                  onChange={e => setAptName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddApartment()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apt-address">Adresse</Label>
                <Input
                  id="apt-address"
                  placeholder="z.B. Musterstr. 1, 10115 Berlin"
                  value={aptAddress}
                  onChange={e => setAptAddress(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddApartment()}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddApartment} disabled={!aptName.trim()}>
                Speichern
              </Button>
              <Button variant="ghost" onClick={() => setShowAddApartment(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {apartments.length === 0 && !showAddApartment && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Home className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Keine Wohnungen vorhanden</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Fuege deine erste Wohnung hinzu, um Raeume und Pflanzen zu organisieren.
            </p>
            <Button className="mt-4" onClick={() => { setShowAddApartment(true); setAptName(''); setAptAddress(''); }}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Wohnung anlegen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Apartment Cards */}
      <div className="space-y-4">
        {apartments.map(apt => {
          const aptRooms = getRoomsForApartment(apt.id);
          const aptPlants = getPlantsInApartment(apt.id);
          const isExpanded = expandedApartment === apt.id;
          const isEditing = editingApartment === apt.id;

          return (
            <Card key={apt.id} className="overflow-hidden">
              {/* Apartment Header */}
              {isEditing ? (
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={aptName}
                        onChange={e => setAptName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveApartment(apt.id)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input
                        value={aptAddress}
                        onChange={e => setAptAddress(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveApartment(apt.id)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => handleSaveApartment(apt.id)}>
                      Speichern
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingApartment(null); setAptName(''); setAptAddress(''); }}>
                      Abbrechen
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpand(apt.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{apt.name}</CardTitle>
                        {apt.address && (
                          <p className="text-sm text-muted-foreground">{apt.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DoorOpen className="h-4 w-4" />
                          {aptRooms.length} {aptRooms.length === 1 ? 'Raum' : 'Raeume'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flower2 className="h-4 w-4" />
                          {aptPlants.length} {aptPlants.length === 1 ? 'Pflanze' : 'Pflanzen'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={e => { e.stopPropagation(); handleEditApartment(apt); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={e => { e.stopPropagation(); handleDeleteApartment(apt.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              )}

              {/* Expanded Room List */}
              {isExpanded && !isEditing && (
                <CardContent className="border-t pt-4 space-y-3">
                  {aptRooms.length === 0 && showAddRoom !== apt.id && (
                    <div className="text-center py-6 text-muted-foreground">
                      <DoorOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Noch keine Raeume vorhanden.</p>
                    </div>
                  )}

                  {aptRooms.map(room => {
                    const roomPlants = getPlantsInRoom(room.id);
                    const LightIcon = lightLevelIcons[room.light_level] || Cloud;
                    const isEditingThisRoom = editingRoom === room.id;

                    if (isEditingThisRoom) {
                      return (
                        <div key={room.id} className="rounded-lg border p-4 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Raumname</Label>
                              <Input
                                value={roomName}
                                onChange={e => setRoomName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Lichtverhaeltnisse</Label>
                              <Select value={roomLight} onValueChange={(v) => setRoomLight(v as Room['light_level'])}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Wenig Licht</SelectItem>
                                  <SelectItem value="medium">Mittleres Licht</SelectItem>
                                  <SelectItem value="bright">Hell</SelectItem>
                                  <SelectItem value="direct">Direkte Sonne</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fensterrichtung</Label>
                              <Select value={roomWindow} onValueChange={(v) => setRoomWindow(v as Room['window_direction'])}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="north">Norden</SelectItem>
                                  <SelectItem value="east">Osten</SelectItem>
                                  <SelectItem value="south">Sueden</SelectItem>
                                  <SelectItem value="west">Westen</SelectItem>
                                  <SelectItem value="none">Kein Fenster</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Notizen</Label>
                              <Textarea
                                value={roomNotes}
                                onChange={e => setRoomNotes(e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveRoom(room.id)}>
                              Speichern
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setEditingRoom(null); resetRoomForm(); }}>
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={room.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-secondary text-secondary-foreground">
                            <DoorOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{room.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <LightIcon className="h-3 w-3" />
                                {lightLevelLabels[room.light_level]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Compass className="h-3 w-3" />
                                {windowDirectionLabels[room.window_direction]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Flower2 className="h-3 w-3" />
                                {roomPlants.length} {roomPlants.length === 1 ? 'Pflanze' : 'Pflanzen'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Room Form */}
                  {showAddRoom === apt.id ? (
                    <div className="rounded-lg border border-dashed border-primary/50 p-4 space-y-3">
                      <p className="font-medium text-sm">Neuen Raum hinzufuegen</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Raumname</Label>
                          <Input
                            placeholder="z.B. Wohnzimmer"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Lichtverhaeltnisse</Label>
                          <Select value={roomLight} onValueChange={(v) => setRoomLight(v as Room['light_level'])}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Wenig Licht</SelectItem>
                              <SelectItem value="medium">Mittleres Licht</SelectItem>
                              <SelectItem value="bright">Hell</SelectItem>
                              <SelectItem value="direct">Direkte Sonne</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Fensterrichtung</Label>
                          <Select value={roomWindow} onValueChange={(v) => setRoomWindow(v as Room['window_direction'])}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="north">Norden</SelectItem>
                              <SelectItem value="east">Osten</SelectItem>
                              <SelectItem value="south">Sueden</SelectItem>
                              <SelectItem value="west">Westen</SelectItem>
                              <SelectItem value="none">Kein Fenster</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Notizen</Label>
                          <Textarea
                            placeholder="Optionale Notizen zum Raum..."
                            value={roomNotes}
                            onChange={e => setRoomNotes(e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddRoom(apt.id)} disabled={!roomName.trim()}>
                          Raum anlegen
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowAddRoom(null); resetRoomForm(); }}>
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-dashed"
                      onClick={() => { setShowAddRoom(apt.id); resetRoomForm(); }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Raum hinzufuegen
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
