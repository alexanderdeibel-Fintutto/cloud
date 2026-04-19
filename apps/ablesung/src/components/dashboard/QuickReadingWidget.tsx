import { useState, useMemo } from 'react';
import { Gauge, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import {
  METER_TYPE_LABELS, METER_TYPE_UNITS, MeterWithReadings,
  getReadingStatus,
} from '@/types/database';

export function QuickReadingWidget() {
  const { buildings, createReading } = useBuildings();
  const { toast } = useToast();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [justSubmitted, setJustSubmitted] = useState<Set<string>>(new Set());

  // Find meters that are due or overdue
  const dueMeters = useMemo(() => {
    const all: (MeterWithReadings & { buildingName: string })[] = [];
    buildings.forEach(b => {
      const addMeter = (m: MeterWithReadings) => {
        const status = getReadingStatus(m.lastReading?.reading_date);
        if (status === 'due' || status === 'overdue') {
          all.push({ ...m, buildingName: b.name });
        }
      };
      (b.meters || []).forEach(addMeter);
      b.units.forEach(u => u.meters.forEach(addMeter));
    });
    // Sort: overdue first, then due
    return all.sort((a, b) => {
      const sa = getReadingStatus(a.lastReading?.reading_date);
      const sb = getReadingStatus(b.lastReading?.reading_date);
      if (sa === 'overdue' && sb !== 'overdue') return -1;
      if (sb === 'overdue' && sa !== 'overdue') return 1;
      return 0;
    }).slice(0, 5); // Show max 5
  }, [buildings]);

  const handleSubmit = async (meter: MeterWithReadings) => {
    const val = parseFloat(values[meter.id] || '');
    if (isNaN(val) || val < 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte geben Sie einen gültigen Zählerstand ein.' });
      return;
    }

    if (meter.lastReading && val < meter.lastReading.reading_value) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Der neue Zählerstand kann nicht kleiner als der vorherige sein.' });
      return;
    }

    setSubmittingId(meter.id);
    try {
      await createReading.mutateAsync({
        meter_id: meter.id,
        reading_value: val,
        source: 'manual',
      });
      toast({ title: 'Ablesung gespeichert', description: `${METER_TYPE_LABELS[meter.meter_type]}: ${val.toLocaleString('de-DE')} ${METER_TYPE_UNITS[meter.meter_type]}` });
      setValues(prev => ({ ...prev, [meter.id]: '' }));
      setJustSubmitted(prev => new Set(prev).add(meter.id));
      setTimeout(() => setJustSubmitted(prev => { const n = new Set(prev); n.delete(meter.id); return n; }), 3000);
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Ablesung konnte nicht gespeichert werden.' });
    }
    setSubmittingId(null);
  };

  if (dueMeters.length === 0) return null;

  return (
    <Card className="mb-4 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-500" />
          Schnell-Ablesung
          <span className="text-xs font-normal text-muted-foreground">({dueMeters.length} fällig)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dueMeters.map(meter => {
          const isSubmitting = submittingId === meter.id;
          const wasSubmitted = justSubmitted.has(meter.id);
          const status = getReadingStatus(meter.lastReading?.reading_date);

          return (
            <div key={meter.id} className="flex items-center gap-2">
              <MeterIcon type={meter.meter_type} className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{METER_TYPE_LABELS[meter.meter_type]}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {meter.buildingName} | {meter.lastReading ? `Letzter: ${meter.lastReading.reading_value.toLocaleString('de-DE')}` : 'Keine Ablesung'}
                  {status === 'overdue' && <span className="text-red-500 ml-1">Überfällig</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Input
                  type="number"
                  placeholder={METER_TYPE_UNITS[meter.meter_type]}
                  value={values[meter.id] || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [meter.id]: e.target.value }))}
                  className="w-24 h-8 text-sm"
                  disabled={isSubmitting || wasSubmitted}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(meter)}
                />
                <Button
                  size="icon"
                  variant={wasSubmitted ? 'default' : 'outline'}
                  className={`h-8 w-8 shrink-0 ${wasSubmitted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  disabled={isSubmitting || wasSubmitted || !values[meter.id]}
                  onClick={() => handleSubmit(meter)}
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : wasSubmitted ? <Check className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
