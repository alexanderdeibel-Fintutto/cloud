import { useState } from 'react';
import { Loader2, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { MeterType, METER_TYPE_LABELS, METER_TYPE_GROUPS } from '@/types/database';
import { MeterNumberScanner, DetectedReading, MeterEra } from './MeterNumberScanner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AddMeterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId: string;
}

export function AddMeterDialog({ open, onOpenChange, buildingId }: AddMeterDialogProps) {
  const { createMeter, createReading } = useBuildings();
  const { toast } = useToast();
  
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('electricity');
  const [loading, setLoading] = useState(false);
  const [detectedReadings, setDetectedReadings] = useState<DetectedReading[]>([]);
  const [detectedEras, setDetectedEras] = useState<MeterEra[]>([]);
  const [meterSwapDetected, setMeterSwapDetected] = useState(false);

  const autoDetectMeterType = (meterName: string | null) => {
    if (!meterName) return;
    const nameLower = meterName.toLowerCase();
    if (/wasser|water/.test(nameLower)) {
      if (/warm|hot/.test(nameLower)) {
        setMeterType('water_hot');
      } else {
        setMeterType('water_cold');
      }
    } else if (/pv|solar|photo|einspe/.test(nameLower)) {
      if (/einspe|feed/.test(nameLower)) setMeterType('pv_feed_in');
      else if (/eigen|self/.test(nameLower)) setMeterType('pv_self_consumption');
      else setMeterType('pv_production');
    } else if (/wärmepumpe|heat.?pump/.test(nameLower)) {
      setMeterType('heat_pump');
    } else if (/e.?auto|lad|charg|wallbox/.test(nameLower)) {
      setMeterType('ev_charging');
    } else if (/fernwärme|district/.test(nameLower)) {
      setMeterType('district_heating');
    } else if (/allgemein|common|treppenhaus|aufzug/.test(nameLower)) {
      setMeterType('electricity_common');
    } else if (/ht|hochtarif/.test(nameLower)) {
      setMeterType('electricity_ht');
    } else if (/nt|niedertarif|nacht/.test(nameLower)) {
      setMeterType('electricity_nt');
    } else if (/strom|electri|kwh/.test(nameLower)) {
      setMeterType('electricity');
    } else if (/öl|oil|heizöl/.test(nameLower)) {
      setMeterType('oil');
    } else if (/pellet/.test(nameLower)) {
      setMeterType('pellets');
    } else if (/flüssiggas|lpg|propan/.test(nameLower)) {
      setMeterType('lpg');
    } else if (/gas/.test(nameLower)) {
      setMeterType('gas');
    } else if (/kühl|cool|klima/.test(nameLower)) {
      setMeterType('cooling');
    } else if (/heiz|heat/.test(nameLower)) {
      setMeterType('heating');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meterNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte geben Sie eine Zählernummer ein.',
      });
      return;
    }

    setLoading(true);
    try {
      if (meterSwapDetected && detectedEras.length > 1) {
        await handleMeterSwapImport();
      } else {
        await handleSimpleImport();
      }
      resetAndClose();
    } catch (error) {
      console.error('Error creating meter:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Zähler konnte nicht angelegt werden.',
      });
    }
    setLoading(false);
  };

  const handleSimpleImport = async () => {
    const newMeter = await createMeter.mutateAsync({
      building_id: buildingId,
      meter_number: meterNumber.trim(),
      meter_type: meterType,
    });

    if (detectedReadings.length > 0 && newMeter?.id) {
      const { imported, skipped } = await importReadings(newMeter.id, detectedReadings);
      toast({
        title: 'Zähler angelegt & Daten importiert',
        description: `Zähler "${meterNumber}" erstellt. ${imported} Zählerständ${imported === 1 ? '' : 'e'} importiert${skipped > 0 ? `, ${skipped} übersprungen` : ''}.`,
      });
    } else {
      toast({
        title: 'Zähler angelegt',
        description: `Zähler "${meterNumber}" wurde erfolgreich erstellt.`,
      });
    }
  };

  const handleMeterSwapImport = async () => {
    // Create meters from oldest to newest, linking them via replaced_by
    const meterIds: string[] = [];
    
    for (let i = 0; i < detectedEras.length; i++) {
      const era = detectedEras[i];
      const isCurrentMeter = i === detectedEras.length - 1;
      const autoNumber = isCurrentMeter 
        ? meterNumber.trim() 
        : `${meterNumber.trim()}-alt-${i + 1}`;

      const newMeter = await createMeter.mutateAsync({
        building_id: buildingId,
        meter_number: autoNumber,
        meter_type: meterType,
      });

      if (newMeter?.id) {
        meterIds.push(newMeter.id);
        
        // Import readings for this era
        await importReadings(newMeter.id, era.readings);
      }
    }

    // Link meters: old.replaced_by = next meter
    for (let i = 0; i < meterIds.length - 1; i++) {
      await supabase
        .from('meters')
        .update({ replaced_by: meterIds[i + 1] })
        .eq('id', meterIds[i]);
    }

    const totalReadings = detectedEras.reduce((sum, era) => sum + era.readings.length, 0);
    toast({
      title: 'Zählerwechsel importiert!',
      description: `${detectedEras.length} Zähler angelegt und verkettet. ${totalReadings} Zählerstände importiert.`,
    });
  };

  const importReadings = async (meterId: string, readings: DetectedReading[]) => {
    let imported = 0;
    let skipped = 0;

    for (const reading of readings) {
      try {
        await createReading.mutateAsync({
          meter_id: meterId,
          reading_value: reading.value,
          reading_date: reading.date,
          source: 'ocr',
        });
        imported++;
      } catch (err) {
        console.warn('Skipped reading:', reading, err);
        skipped++;
      }
    }

    return { imported, skipped };
  };

  const resetAndClose = () => {
    setMeterNumber('');
    setMeterType('electricity');
    setDetectedReadings([]);
    setDetectedEras([]);
    setMeterSwapDetected(false);
    onOpenChange(false);
  };

  const handleScanComplete = (scannedNumber: string) => {
    setMeterNumber(scannedNumber);
  };

  const handleReadingsDetected = (readings: DetectedReading[], meterName: string | null) => {
    setDetectedReadings(readings);
    setDetectedEras([]);
    setMeterSwapDetected(false);
    autoDetectMeterType(meterName);
  };

  const handleMeterSwapDetected = (eras: MeterEra[], meterName: string | null) => {
    setDetectedEras(eras);
    setDetectedReadings([]);
    setMeterSwapDetected(true);
    autoDetectMeterType(meterName);
  };

  const totalEraReadings = detectedEras.reduce((sum, era) => sum + era.readings.length, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Zähler anlegen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meterType">Zählertyp</Label>
            <Select value={meterType} onValueChange={(v) => setMeterType(v as MeterType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METER_TYPE_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {group.label}
                    </div>
                    {group.types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {METER_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterNumber">
              {meterSwapDetected ? 'Aktuelle Zählernummer' : 'Zählernummer'}
            </Label>
            <Input
              id="meterNumber"
              placeholder="z.B. 12345678"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
            />
            {meterSwapDetected && (
              <p className="text-xs text-muted-foreground">
                Geben Sie die Nummer des aktuellen Zählers ein. Alte Zähler erhalten automatisch Suffixe.
              </p>
            )}
          </div>

          {/* Scanner section */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Oder per Dokument/Foto erkennen</Label>
            <MeterNumberScanner
              onNumberDetected={handleScanComplete}
              onReadingsDetected={handleReadingsDetected}
              onMeterSwapDetected={handleMeterSwapDetected}
            />
          </div>

          {/* Show detected readings summary (no swap) */}
          {detectedReadings.length > 0 && !meterSwapDetected && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle2 className="w-4 h-4" />
                {detectedReadings.length} Zählerstände erkannt
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diese werden nach dem Anlegen des Zählers automatisch importiert.
              </p>
              <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                {detectedReadings.slice(0, 5).map((r, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex justify-between font-mono">
                    <span>{r.date}</span>
                    <span>{r.value.toLocaleString('de-DE')}</span>
                  </div>
                ))}
                {detectedReadings.length > 5 && (
                  <p className="text-xs text-muted-foreground italic">
                    ... und {detectedReadings.length - 5} weitere
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Meter swap summary */}
          {meterSwapDetected && detectedEras.length > 1 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <ArrowRightLeft className="w-4 h-4" />
                Zählerwechsel – {detectedEras.length} Zeiträume
              </div>
              <p className="text-xs text-muted-foreground">
                Es werden {detectedEras.length} verkettete Zähler erstellt mit insgesamt {totalEraReadings} Ablesungen.
                Der Verbrauchsverlauf wird über alle Zähler hinweg berechenbar.
              </p>
              <div className="space-y-2">
                {detectedEras.map((era, i) => {
                  const isCurrentMeter = i === detectedEras.length - 1;
                  return (
                    <div key={i} className={cn(
                      "rounded border p-2 text-xs",
                      isCurrentMeter ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {isCurrentMeter ? '● Aktueller Zähler' : `○ ${era.label}`}
                        </span>
                        <span className="text-muted-foreground">
                          {era.readings.length} Ablesungen
                        </span>
                      </div>
                      {era.readings.length > 0 && (
                        <div className="mt-1 text-muted-foreground font-mono flex justify-between">
                          <span>{era.readings[0]?.date} → {era.readings[era.readings.length - 1]?.date}</span>
                          <span>
                            {era.readings[0]?.value.toLocaleString('de-DE')} – {era.readings[era.readings.length - 1]?.value.toLocaleString('de-DE')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {meterSwapDetected ? 'Importiere...' : 'Speichern...'}
                </>
              ) : meterSwapDetected ? (
                `${detectedEras.length} Zähler anlegen`
              ) : detectedReadings.length > 0 ? (
                'Anlegen & Importieren'
              ) : (
                'Zähler anlegen'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
