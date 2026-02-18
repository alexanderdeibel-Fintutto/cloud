import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, Camera, Plus, Upload, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { AddReadingDialog } from '@/components/meters/AddReadingDialog';
import { ImportReadingsWizard } from '@/components/meters/ImportReadingsWizard';
import { CascadeDeleteDialog } from '@/components/ui/cascade-delete-dialog';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import { METER_TYPE_LABELS, METER_TYPE_UNITS, MeterReading } from '@/types/database';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function MeterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buildings, isLoading, deleteReading } = useBuildings();
  const { toast } = useToast();
  
  const [showAddReading, setShowAddReading] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [deleteReadingData, setDeleteReadingData] = useState<MeterReading | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find meter across all buildings/units (including building-level meters)
  const allUnits = buildings.flatMap(b => b.units);
  const allMeters = [
    ...allUnits.flatMap(u => u.meters),
    ...buildings.flatMap(b => b.meters || []),
  ].filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
  
  const meter = allMeters.find(m => m.id === id);
  const unit = allUnits.find(u => u.meters.some(m => m.id === id));
  const building = buildings.find(b => (b.meters || []).some(m => m.id === id)) || 
                   buildings.find(b => b.units.some(u => u.meters.some(m => m.id === id)));

  // Find linked meters (meter swap chain)
  const getLinkedMeters = () => {
    if (!meter) return [];
    const chain: typeof allMeters = [];
    
    // Find predecessors (meters that have replaced_by pointing to this or later meters)
    const findPredecessors = (meterId: string) => {
      const predecessor = allMeters.find(m => m.replaced_by === meterId);
      if (predecessor) {
        findPredecessors(predecessor.id);
        chain.push(predecessor);
      }
    };
    
    findPredecessors(meter.id);
    chain.push(meter);
    
    // Find successors
    const findSuccessors = (currentMeter: typeof meter) => {
      if (currentMeter?.replaced_by) {
        const successor = allMeters.find(m => m.id === currentMeter.replaced_by);
        if (successor) {
          chain.push(successor);
          findSuccessors(successor);
        }
      }
    };
    
    findSuccessors(meter);
    return chain.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);
  };

  const linkedMeters = getLinkedMeters();
  const hasLinkedMeters = linkedMeters.length > 1;
  
  // Get existing reading dates for duplicate detection
  const existingDates = meter?.readings.map(r => r.reading_date) || [];

  const handleDeleteReading = async () => {
    if (!deleteReadingData) return;
    
    setIsDeleting(true);
    try {
      await deleteReading.mutateAsync(deleteReadingData.id);
      toast({
        title: 'Ablesung gelöscht',
        description: 'Die Ablesung wurde erfolgreich gelöscht.',
      });
      setDeleteReadingData(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Ablesung konnte nicht gelöscht werden.',
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

  if (!meter) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Zähler nicht gefunden.</p>
          <Button variant="link" onClick={() => navigate('/dashboard')}>
            Zurück zur Übersicht
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Prepare chart data (reverse to show oldest first)
  const chartData = [...meter.readings]
    .reverse()
    .map((reading) => ({
      date: format(new Date(reading.reading_date), 'dd.MM', { locale: de }),
      value: reading.reading_value,
    }));

  // Calculate consumption for each reading
  const consumptionData = meter.readings.slice(0, -1).map((reading, index) => {
    const prev = meter.readings[index + 1];
    return {
      date: format(new Date(reading.reading_date), 'dd.MM', { locale: de }),
      consumption: reading.reading_value - prev.reading_value,
    };
  }).reverse();

  // Build combined chart data across all linked meters (for consumption view)
  const buildCombinedConsumptionData = () => {
    if (!hasLinkedMeters) return null;
    
    const allReadings: Array<{ date: string; value: number; meterId: string; meterLabel: string }> = [];
    
    linkedMeters.forEach((m, idx) => {
      const label = idx === linkedMeters.length - 1 ? 'Aktuell' : `Zähler ${idx + 1}`;
      [...m.readings].reverse().forEach(r => {
        allReadings.push({
          date: r.reading_date,
          value: r.reading_value,
          meterId: m.id,
          meterLabel: label,
        });
      });
    });

    // Sort chronologically
    allReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate consumption between consecutive readings within the same meter
    const consumptionEntries: Array<{ date: string; consumption: number; meterLabel: string; isSwap?: boolean }> = [];
    
    for (let i = 1; i < allReadings.length; i++) {
      const curr = allReadings[i];
      const prev = allReadings[i - 1];
      
      if (curr.meterId === prev.meterId) {
        consumptionEntries.push({
          date: format(new Date(curr.date), 'MM/yy', { locale: de }),
          consumption: curr.value - prev.value,
          meterLabel: curr.meterLabel,
        });
      } else {
        // Meter swap point - add marker
        consumptionEntries.push({
          date: format(new Date(curr.date), 'MM/yy', { locale: de }),
          consumption: 0,
          meterLabel: 'Wechsel',
          isSwap: true,
        });
      }
    }

    return consumptionEntries;
  };

  const combinedConsumption = buildCombinedConsumptionData();

  return (
    <AppLayout>
      <Button
        variant="ghost"
        className="mb-4 -ml-2"
        onClick={() => unit ? navigate(`/units/${unit.id}`) : building ? navigate(`/buildings/${building.id}`) : navigate('/dashboard')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück
      </Button>

      {/* Meter Info */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <MeterIcon type={meter.meter_type} size="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {METER_TYPE_LABELS[meter.meter_type]}
              </h1>
              <p className="text-muted-foreground">
                Nr. {meter.meter_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {unit ? unit.unit_number : building?.name || 'Gebäudezähler'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddReading(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Manuell
              </Button>
              <Button size="sm" onClick={() => navigate(`/read?meter=${meter.id}`)}>
                <Camera className="w-4 h-4 mr-1" />
                Foto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Value */}
      {meter.lastReading && (
        <Card className="mb-4">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Aktueller Stand</p>
            <p className="text-3xl font-bold text-primary">
              {meter.lastReading.reading_value.toLocaleString('de-DE')}
              <span className="text-lg font-normal text-muted-foreground ml-2">
                {METER_TYPE_UNITS[meter.meter_type]}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(meter.lastReading.reading_date), 'dd. MMMM yyyy', { locale: de })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Combined Consumption Chart (for linked meters) */}
      {hasLinkedMeters && combinedConsumption && combinedConsumption.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Gesamtverbrauch über {linkedMeters.length} Zähler
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Zählerwechsel
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedConsumption}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, _name: string, props: { payload: { meterLabel: string; isSwap?: boolean } }) => {
                      if (props.payload.isSwap) return ['Zählerwechsel', ''];
                      return [
                        `${value.toLocaleString('de-DE')} ${METER_TYPE_UNITS[meter.meter_type]}`,
                        props.payload.meterLabel,
                      ];
                    }}
                  />
                  <Bar
                    dataKey="consumption"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Linked meters legend */}
            <div className="flex flex-wrap gap-2 mt-3">
              {linkedMeters.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => m.id !== id && navigate(`/meters/${m.id}`)}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border transition-colors",
                    m.id === id 
                      ? "border-primary bg-primary/10 text-primary font-medium" 
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer"
                  )}
                >
                  {i === linkedMeters.length - 1 ? '● ' : '○ '}
                  {m.meter_number}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Meter Chart */}
      {chartData.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {hasLinkedMeters ? 'Aktueller Zählerstand' : 'Verbrauchsverlauf'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString('de-DE')} ${METER_TYPE_UNITS[meter.meter_type]}`,
                      'Stand',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readings History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ablesungen</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowImportWizard(true)}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {meter.readings.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Noch keine Ablesungen vorhanden.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {meter.readings.map((reading, index) => {
                const prev = meter.readings[index + 1];
                const consumption = prev ? reading.reading_value - prev.reading_value : null;
                
                return (
                  <div key={reading.id} className="p-4 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {reading.reading_value.toLocaleString('de-DE')} {METER_TYPE_UNITS[meter.meter_type]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reading.reading_date), 'dd. MMMM yyyy', { locale: de })}
                      </p>
                      {reading.source === 'ocr' && reading.confidence && (
                        <p className="text-xs text-muted-foreground">
                          OCR ({Math.round(reading.confidence)}% Konfidenz)
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {consumption !== null && consumption > 0 && (
                        <p className="text-sm text-secondary font-medium">
                          +{consumption.toLocaleString('de-DE')} {METER_TYPE_UNITS[meter.meter_type]}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => setDeleteReadingData(reading)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Reading Dialog */}
      <AddReadingDialog
        open={showAddReading}
        onOpenChange={setShowAddReading}
        meterId={meter.id}
        meterType={meter.meter_type}
        existingDates={existingDates}
        lastReading={meter.lastReading || undefined}
      />

      {/* Import Wizard */}
      <ImportReadingsWizard
        open={showImportWizard}
        onOpenChange={setShowImportWizard}
        meterId={meter.id}
        meterType={meter.meter_type}
        existingDates={existingDates}
      />

      {/* Delete Reading Confirmation */}
      {deleteReadingData && (
        <CascadeDeleteDialog
          open={!!deleteReadingData}
          onOpenChange={(open) => !open && setDeleteReadingData(null)}
          onConfirm={handleDeleteReading}
          title="Ablesung löschen?"
          description={`Zählerstand vom ${format(new Date(deleteReadingData.reading_date), 'dd. MMMM yyyy', { locale: de })}: ${deleteReadingData.reading_value.toLocaleString('de-DE')} ${METER_TYPE_UNITS[meter.meter_type]}`}
          isDeleting={isDeleting}
        />
      )}
    </AppLayout>
  );
}
