import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { MeterNumberScanner } from '@/components/meters/MeterNumberScanner';
import { CascadeDeleteDialog } from '@/components/ui/cascade-delete-dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { METER_TYPE_LABELS, METER_TYPE_UNITS, MeterType, MeterWithReadings } from '@/types/database';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buildings, isLoading, createMeter, deleteMeter } = useBuildings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [showAddMeter, setShowAddMeter] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('electricity');
  const [addingMeter, setAddingMeter] = useState(false);
  const [deleteMeterData, setDeleteMeterData] = useState<MeterWithReadings | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find unit across all buildings
  const allUnits = buildings.flatMap(b => b.units);
  const unit = allUnits.find(u => u.id === id);

  const handleAddMeter = async () => {
    if (!meterNumber.trim() || !id) return;
    
    setAddingMeter(true);
    
    try {
      await createMeter.mutateAsync({
        unit_id: id,
        meter_number: meterNumber.trim(),
        meter_type: meterType,
      });
      
      toast({
        title: 'Zähler hinzugefügt',
        description: 'Der Zähler wurde erfolgreich angelegt.',
      });
      
      setShowAddMeter(false);
      setMeterNumber('');
      setMeterType('electricity');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Zähler konnte nicht erstellt werden.',
      });
    }
    
    setAddingMeter(false);
  };

  const handleDeleteMeter = async () => {
    if (!deleteMeterData) return;
    
    setIsDeleting(true);
    try {
      await deleteMeter.mutateAsync(deleteMeterData.id);
      toast({
        title: 'Zähler gelöscht',
        description: `"${METER_TYPE_LABELS[deleteMeterData.meter_type]}" wurde erfolgreich gelöscht.`,
      });
      setDeleteMeterData(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Zähler konnte nicht gelöscht werden.',
      });
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!unit) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Einheit nicht gefunden.</p>
          <Button variant="link" onClick={() => navigate('/units')}>
            Zurück zur Übersicht
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Button
        variant="ghost"
        className="mb-4 -ml-2"
        onClick={() => navigate('/units')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{unit.unit_number}</h1>
        {unit.building && (
          <p className="text-muted-foreground">{unit.building.name} - {unit.building.address}</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Zähler</h2>
        <Button size="sm" onClick={() => setShowAddMeter(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Hinzufügen
        </Button>
      </div>

      {unit.meters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Noch keine Zähler angelegt.
            </p>
            <Button onClick={() => setShowAddMeter(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ersten Zähler hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {unit.meters.map((meter) => (
            <Card key={meter.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link 
                    to={`/meters/${meter.id}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <MeterIcon type={meter.meter_type} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {METER_TYPE_LABELS[meter.meter_type]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nr. {meter.meter_number}
                      </p>
                      {meter.lastReading && (
                        <p className="text-sm">
                          Letzter Stand: {meter.lastReading.reading_value.toLocaleString('de-DE')} {METER_TYPE_UNITS[meter.meter_type]}
                          <span className="text-muted-foreground ml-1">
                            ({format(new Date(meter.lastReading.reading_date), 'dd.MM.yyyy', { locale: de })})
                          </span>
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive ml-2"
                    onClick={() => setDeleteMeterData(meter)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Meter - Drawer on Mobile, Dialog on Desktop */}
      {isMobile ? (
        <Drawer open={showAddMeter} onOpenChange={setShowAddMeter}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Zähler hinzufügen</DrawerTitle>
            </DrawerHeader>
            
            <div className="space-y-4 px-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="meterType-mobile">Zählertyp</Label>
                <Select value={meterType} onValueChange={(v) => setMeterType(v as MeterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METER_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterNumber-mobile">Zählernummer</Label>
                <Input
                  id="meterNumber-mobile"
                  placeholder="z.B. 1234567890"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nummer scannen</Label>
                <MeterNumberScanner
                  onNumberDetected={setMeterNumber}
                  disabled={addingMeter}
                />
              </div>
            </div>

            <DrawerFooter>
              <Button onClick={handleAddMeter} disabled={addingMeter || !meterNumber.trim()}>
                {addingMeter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hinzufügen...
                  </>
                ) : (
                  'Hinzufügen'
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Abbrechen</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAddMeter} onOpenChange={setShowAddMeter}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zähler hinzufügen</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="meterType">Zählertyp</Label>
                <Select value={meterType} onValueChange={(v) => setMeterType(v as MeterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METER_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meterNumber">Zählernummer</Label>
                <Input
                  id="meterNumber"
                  placeholder="z.B. 1234567890"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Nummer scannen</Label>
                <MeterNumberScanner
                  onNumberDetected={setMeterNumber}
                  disabled={addingMeter}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMeter(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddMeter} disabled={addingMeter || !meterNumber.trim()}>
                {addingMeter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hinzufügen...
                  </>
                ) : (
                  'Hinzufügen'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Meter Confirmation */}
      {deleteMeterData && (
        <CascadeDeleteDialog
          open={!!deleteMeterData}
          onOpenChange={(open) => !open && setDeleteMeterData(null)}
          onConfirm={handleDeleteMeter}
          title={`${METER_TYPE_LABELS[deleteMeterData.meter_type]} löschen?`}
          description={`Zählernummer: ${deleteMeterData.meter_number}`}
          isDeleting={isDeleting}
          cascadeItems={[
            { label: 'Ablesung(en)', count: deleteMeterData.readings.length },
          ]}
        />
      )}
    </AppLayout>
  );
}
