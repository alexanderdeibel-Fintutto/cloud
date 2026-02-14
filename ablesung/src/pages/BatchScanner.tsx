import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ChevronRight, Loader2, SkipForward, ListChecks } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { MeterWithReadings, METER_TYPE_LABELS, METER_TYPE_UNITS } from '@/types/database';

type ScanStep = 'select' | 'scanning' | 'done';

interface MeterItem {
  meter: MeterWithReadings;
  buildingName: string;
  value: string;
  submitted: boolean;
  skipped: boolean;
}

export default function BatchScanner() {
  const navigate = useNavigate();
  const { buildings, createReading } = useBuildings();
  const { toast } = useToast();

  const [step, setStep] = useState<ScanStep>('select');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [meterItems, setMeterItems] = useState<MeterItem[]>([]);

  // All meters grouped by building
  const allMeters = useMemo(() => {
    const items: MeterItem[] = [];
    buildings.forEach(b => {
      if (filterBuilding !== 'all' && b.id !== filterBuilding) return;
      const addMeter = (m: MeterWithReadings) => {
        items.push({ meter: m, buildingName: b.name, value: '', submitted: false, skipped: false });
      };
      (b.meters || []).forEach(addMeter);
      b.units.forEach(u => u.meters.forEach(addMeter));
    });
    return items;
  }, [buildings, filterBuilding]);

  const startScanning = () => {
    setMeterItems(allMeters.map(m => ({ ...m })));
    setCurrentIndex(0);
    setStep('scanning');
  };

  const currentMeter = meterItems[currentIndex];
  const completedCount = meterItems.filter(m => m.submitted || m.skipped).length;
  const progress = meterItems.length > 0 ? (completedCount / meterItems.length) * 100 : 0;

  const handleSubmit = async () => {
    if (!currentMeter) return;
    const val = parseFloat(currentMeter.value);
    if (isNaN(val) || val < 0) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte gültigen Wert eingeben.' });
      return;
    }

    if (currentMeter.meter.lastReading && val < currentMeter.meter.lastReading.reading_value) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Wert kann nicht kleiner als letzter Stand sein.' });
      return;
    }

    setSubmitting(true);
    try {
      await createReading.mutateAsync({
        meter_id: currentMeter.meter.id,
        reading_value: val,
        source: 'manual',
      });
      const updated = [...meterItems];
      updated[currentIndex] = { ...updated[currentIndex], submitted: true };
      setMeterItems(updated);

      if (currentIndex < meterItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setStep('done');
      }
    } catch {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen.' });
    }
    setSubmitting(false);
  };

  const handleSkip = () => {
    const updated = [...meterItems];
    updated[currentIndex] = { ...updated[currentIndex], skipped: true };
    setMeterItems(updated);

    if (currentIndex < meterItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep('done');
    }
  };

  const updateValue = (val: string) => {
    const updated = [...meterItems];
    updated[currentIndex] = { ...updated[currentIndex], value: val };
    setMeterItems(updated);
  };

  // Select step
  if (step === 'select') {
    return (
      <AppLayout>
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Zurück
        </Button>

        <h1 className="text-xl font-bold mb-4">Batch-Ablesung</h1>

        <Card className="mb-4">
          <CardContent className="py-6 text-center">
            <ListChecks className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Alle Zähler nacheinander ablesen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gehen Sie alle Zähler eines Gebäudes sequentiell durch. Überspringen Sie Zähler, die Sie nicht ablesen können.
            </p>
          </CardContent>
        </Card>

        <div className="mb-4">
          <Select value={filterBuilding} onValueChange={setFilterBuilding}>
            <SelectTrigger><SelectValue placeholder="Gebäude wählen" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Gebäude ({allMeters.length} Zähler)</SelectItem>
              {buildings.map(b => {
                const count = [...(b.meters || []), ...b.units.flatMap(u => u.meters)].length;
                return (
                  <SelectItem key={b.id} value={b.id}>{b.name} ({count} Zähler)</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full py-6 text-base" onClick={startScanning} disabled={allMeters.length === 0}>
          <Camera className="w-5 h-5 mr-2" />
          {allMeters.length} Zähler ablesen starten
        </Button>
      </AppLayout>
    );
  }

  // Done step
  if (step === 'done') {
    const submitted = meterItems.filter(m => m.submitted).length;
    const skipped = meterItems.filter(m => m.skipped).length;
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Batch-Ablesung abgeschlossen</h2>
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{submitted}</p>
              <p className="text-xs text-muted-foreground">Abgelesen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{skipped}</p>
              <p className="text-xs text-muted-foreground">Übersprungen</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button onClick={() => { setStep('select'); setCurrentIndex(0); }}>Neue Runde</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Scanning step
  return (
    <AppLayout>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{currentIndex + 1} / {meterItems.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {currentMeter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <MeterIcon type={currentMeter.meter.meter_type} className="w-8 h-8" />
              <div>
                <p className="font-semibold">{METER_TYPE_LABELS[currentMeter.meter.meter_type]}</p>
                <p className="text-sm text-muted-foreground">
                  {currentMeter.buildingName} | Nr. {currentMeter.meter.meter_number}
                </p>
              </div>
            </div>

            {currentMeter.meter.lastReading && (
              <div className="bg-accent/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground">Letzter Stand</p>
                <p className="text-lg font-bold">
                  {currentMeter.meter.lastReading.reading_value.toLocaleString('de-DE')} {METER_TYPE_UNITS[currentMeter.meter.meter_type]}
                </p>
              </div>
            )}

            <div className="mb-4">
              <Input
                type="number"
                placeholder={`Neuer Stand (${METER_TYPE_UNITS[currentMeter.meter.meter_type]})`}
                value={currentMeter.value}
                onChange={(e) => updateValue(e.target.value)}
                className="text-lg h-12"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={submitting}>
                <SkipForward className="w-4 h-4 mr-1" />Überspringen
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={submitting || !currentMeter.value}>
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {meterItems.map((item, i) => (
            <div key={item.meter.id} className={`flex items-center gap-2 text-xs py-1 ${i === currentIndex ? 'font-bold text-primary' : ''}`}>
              {item.submitted ? (
                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
              ) : item.skipped ? (
                <SkipForward className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              ) : i === currentIndex ? (
                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">{METER_TYPE_LABELS[item.meter.meter_type]} - {item.buildingName}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
