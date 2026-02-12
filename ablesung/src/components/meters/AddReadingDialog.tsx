import { useState, useMemo } from 'react';
import { Loader2, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS, MeterType, MeterReading, formatNumber, formatEuro, calculateCost } from '@/types/database';

interface AddReadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meterId: string;
  meterType: MeterType;
  existingDates?: string[];
  lastReading?: MeterReading;
}

export function AddReadingDialog({
  open,
  onOpenChange,
  meterId,
  meterType,
  existingDates = [],
  lastReading,
}: AddReadingDialogProps) {
  const isMobile = useIsMobile();
  const { createReading } = useBuildings();
  const { toast } = useToast();

  const [readingValue, setReadingValue] = useState('');
  const [readingDate, setReadingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowOverflow, setAllowOverflow] = useState(false);

  const isDuplicate = existingDates.includes(readingDate);
  const parsedValue = parseFloat(readingValue.replace(',', '.'));
  const isValidNumber = !isNaN(parsedValue) && readingValue.trim() !== '';

  // Live consumption calculation
  const liveConsumption = useMemo(() => {
    if (!isValidNumber || !lastReading) return null;
    const diff = parsedValue - lastReading.reading_value;
    return diff;
  }, [parsedValue, lastReading, isValidNumber]);

  const liveCost = useMemo(() => {
    if (liveConsumption === null || liveConsumption <= 0) return null;
    return calculateCost(liveConsumption, meterType);
  }, [liveConsumption, meterType]);

  // Validation: new value should be >= last value (unless overflow/meter reset)
  const isValueTooLow = isValidNumber && lastReading && parsedValue < lastReading.reading_value && !allowOverflow;

  const handleSubmit = async () => {
    if (!readingValue.trim()) return;

    if (!isValidNumber) {
      toast({
        variant: 'destructive',
        title: 'Ungültiger Wert',
        description: 'Bitte geben Sie eine gültige Zahl ein.',
      });
      return;
    }

    if (isValueTooLow) {
      toast({
        variant: 'destructive',
        title: 'Wert zu niedrig',
        description: 'Der neue Stand ist niedriger als der letzte. Aktivieren Sie "Zählerüberlauf" falls der Zähler zurückgesetzt wurde.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createReading.mutateAsync({
        meter_id: meterId,
        reading_value: parsedValue,
        reading_date: readingDate,
        source: 'manual',
      });

      toast({
        title: 'Ablesung hinzugefügt',
        description: liveConsumption !== null && liveConsumption > 0
          ? `Stand gespeichert. Verbrauch: ${formatNumber(liveConsumption)} ${METER_TYPE_UNITS[meterType]}`
          : 'Der Zählerstand wurde erfolgreich gespeichert.',
      });

      onOpenChange(false);
      setReadingValue('');
      setReadingDate(new Date().toISOString().split('T')[0]);
      setAllowOverflow(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Zählerstand konnte nicht gespeichert werden.',
      });
    }

    setIsSubmitting(false);
  };

  const FormContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="readingDate">Datum</Label>
        <Input
          id="readingDate"
          type="date"
          value={readingDate}
          onChange={(e) => setReadingDate(e.target.value)}
        />
        {isDuplicate && (
          <p className="text-sm text-amber-600">
            Es existiert bereits eine Ablesung für dieses Datum. Diese wird überschrieben.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="readingValue">
          Zählerstand ({METER_TYPE_UNITS[meterType]})
        </Label>
        <Input
          id="readingValue"
          type="text"
          inputMode="decimal"
          placeholder={lastReading ? `Letzter Stand: ${formatNumber(lastReading.reading_value)}` : 'z.B. 12345,67'}
          value={readingValue}
          onChange={(e) => setReadingValue(e.target.value)}
          className={isValueTooLow ? 'border-destructive' : ''}
        />
        {lastReading && (
          <p className="text-xs text-muted-foreground">
            Letzter Stand: {formatNumber(lastReading.reading_value)} {METER_TYPE_UNITS[meterType]}
          </p>
        )}
      </div>

      {/* Live consumption display */}
      {liveConsumption !== null && liveConsumption > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <TrendingUp className="w-4 h-4" />
            Verbrauch seit letzter Ablesung
          </div>
          <div className="mt-1 flex justify-between items-baseline">
            <span className="text-lg font-bold text-primary">
              {formatNumber(liveConsumption)} {METER_TYPE_UNITS[meterType]}
            </span>
            {liveCost !== null && (
              <span className="text-sm text-muted-foreground">
                ~ {formatEuro(liveCost)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Value too low warning */}
      {isValueTooLow && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Wert ist niedriger als letzter Stand
          </div>
          <p className="text-xs text-muted-foreground">
            Der eingegebene Wert ({formatNumber(parsedValue)}) ist niedriger als der letzte Stand ({formatNumber(lastReading!.reading_value)}).
            Bei einem Zählerreset oder -wechsel können Sie den Überlauf-Modus aktivieren.
          </p>
          <div className="flex items-center gap-2">
            <Switch checked={allowOverflow} onCheckedChange={setAllowOverflow} />
            <Label className="text-sm">Zählerüberlauf / Reset erlauben</Label>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Ablesung hinzufügen</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{FormContent}</div>
          <DrawerFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !readingValue.trim() || (isValueTooLow ?? false)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Hinzufügen
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ablesung hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="py-4">{FormContent}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !readingValue.trim() || (isValueTooLow ?? false)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Hinzufügen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
