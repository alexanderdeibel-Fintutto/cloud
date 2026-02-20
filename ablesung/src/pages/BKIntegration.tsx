import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, BuildingWithUnits,
  formatNumber, calculateCost, formatEuro,
} from '@/types/database';
import { useState } from 'react';
import { format, subYears } from 'date-fns';
import { de } from 'date-fns/locale';

interface UnitConsumption {
  unitId: string;
  unitNumber: string;
  meterType: MeterType;
  meterNumber: string;
  startDate: string | null;
  startValue: number | null;
  endDate: string | null;
  endValue: number | null;
  consumption: number | null;
  consumptionShare: number;
  hasData: boolean;
  warning: string | null;
}

export default function BKIntegration() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<string>(buildings[0]?.id || '');
  const [periodYear, setPeriodYear] = useState(new Date().getFullYear() - 1);

  const building = buildings.find(b => b.id === selectedBuilding);

  const periodStart = `${periodYear}-01-01`;
  const periodEnd = `${periodYear}-12-31`;

  // Calculate consumption per unit per meter type
  const unitConsumptions = useMemo(() => {
    if (!building) return [];
    const result: UnitConsumption[] = [];

    building.units.forEach(unit => {
      unit.meters.forEach(meter => {
        const sortedReadings = [...meter.readings].sort(
          (a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
        );

        // Find readings closest to period start and end
        const readingsInOrBefore = sortedReadings.filter(r => r.reading_date <= periodEnd);
        const readingsInOrAfter = sortedReadings.filter(r => r.reading_date >= periodStart);

        const startReading = readingsInOrBefore.length > 0
          ? readingsInOrBefore.reduce((closest, r) => {
              const diff = Math.abs(new Date(r.reading_date).getTime() - new Date(periodStart).getTime());
              const closestDiff = Math.abs(new Date(closest.reading_date).getTime() - new Date(periodStart).getTime());
              return diff < closestDiff ? r : closest;
            })
          : null;

        const endReading = readingsInOrBefore.length > 0
          ? readingsInOrBefore[readingsInOrBefore.length - 1]
          : null;

        const hasData = startReading !== null && endReading !== null && startReading.id !== endReading.id;
        const consumption = hasData ? (endReading!.reading_value - startReading!.reading_value) : null;

        let warning: string | null = null;
        if (!startReading) warning = 'Kein Anfangsstand vorhanden';
        else if (!endReading) warning = 'Kein Endstand vorhanden';
        else if (startReading.id === endReading.id) warning = 'Nur eine Ablesung im Zeitraum';
        else if (consumption !== null && consumption < 0) warning = 'Negativer Verbrauch (Zählerfehler?)';

        result.push({
          unitId: unit.id,
          unitNumber: unit.unit_number,
          meterType: meter.meter_type,
          meterNumber: meter.meter_number,
          startDate: startReading?.reading_date || null,
          startValue: startReading?.reading_value || null,
          endDate: endReading?.reading_date || null,
          endValue: endReading?.reading_value || null,
          consumption: consumption !== null && consumption >= 0 ? consumption : null,
          consumptionShare: 0,
          hasData,
          warning,
        });
      });
    });

    // Calculate shares per meter type
    const byType: Record<string, UnitConsumption[]> = {};
    result.forEach(uc => {
      if (!byType[uc.meterType]) byType[uc.meterType] = [];
      byType[uc.meterType].push(uc);
    });

    Object.values(byType).forEach(typeGroup => {
      const total = typeGroup.reduce((sum, uc) => sum + (uc.consumption || 0), 0);
      typeGroup.forEach(uc => {
        uc.consumptionShare = total > 0 && uc.consumption ? (uc.consumption / total) * 100 : 0;
      });
    });

    return result;
  }, [building, periodStart, periodEnd]);

  // Group by meter type
  const groupedByType = useMemo(() => {
    const groups: Record<string, UnitConsumption[]> = {};
    unitConsumptions.forEach(uc => {
      if (!groups[uc.meterType]) groups[uc.meterType] = [];
      groups[uc.meterType].push(uc);
    });
    return groups;
  }, [unitConsumptions]);

  const warningCount = unitConsumptions.filter(uc => uc.warning).length;
  const completeCount = unitConsumptions.filter(uc => uc.hasData).length;

  // Export as CSV
  const exportCSV = () => {
    const headers = ['Einheit', 'Zählertyp', 'Zählernr', 'Anfangsdatum', 'Anfangsstand', 'Enddatum', 'Endstand', 'Verbrauch', 'Einheit', 'Anteil %'];
    const rows = unitConsumptions.map(uc => [
      uc.unitNumber, METER_TYPE_LABELS[uc.meterType], uc.meterNumber,
      uc.startDate || '-', uc.startValue?.toString() || '-',
      uc.endDate || '-', uc.endValue?.toString() || '-',
      uc.consumption?.toString() || '-', METER_TYPE_UNITS[uc.meterType],
      uc.consumptionShare.toFixed(1),
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BK-Verbräuche_${building?.name}_${periodYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">BK-Abrechnung</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Verbrauchsdaten für die Betriebskostenabrechnung aufbereiten.
      </p>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Gebäude wählen" /></SelectTrigger>
          <SelectContent>
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={periodYear.toString()} onValueChange={v => setPeriodYear(parseInt(v))}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3].map(offset => {
              const y = new Date().getFullYear() - offset;
              return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Status Summary */}
      {building && unitConsumptions.length > 0 && (
        <div className="flex gap-3 mb-4">
          <Card className="flex-1 glass-card border-0">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-lg font-bold">{completeCount}</p>
                <p className="text-[10px] text-muted-foreground">Vollständig</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 glass-card border-0">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-lg font-bold">{warningCount}</p>
                <p className="text-[10px] text-muted-foreground">Warnungen</p>
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" size="sm" className="self-center" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />CSV
          </Button>
        </div>
      )}

      {/* Consumption Tables per Type */}
      {Object.entries(groupedByType).map(([type, units]) => {
        const totalConsumption = units.reduce((sum, uc) => sum + (uc.consumption || 0), 0);
        const totalCost = calculateCost(totalConsumption, type as MeterType);

        return (
          <Card key={type} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{METER_TYPE_LABELS[type as MeterType]}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Gesamt: {formatNumber(totalConsumption)} {METER_TYPE_UNITS[type as MeterType]} ({formatEuro(totalCost)})
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-1">
                  <span className="col-span-2">Einheit</span>
                  <span className="col-span-2">Zähler</span>
                  <span className="col-span-2 text-right">Anfang</span>
                  <span className="col-span-2 text-right">Ende</span>
                  <span className="col-span-2 text-right">Verbr.</span>
                  <span className="col-span-2 text-right">Anteil</span>
                </div>
                {units.map((uc, i) => (
                  <div key={i} className={`px-4 py-2 text-sm grid grid-cols-12 gap-1 items-center ${uc.warning ? 'bg-amber-500/5' : ''}`}>
                    <span className="col-span-2 font-medium truncate">{uc.unitNumber}</span>
                    <span className="col-span-2 text-xs text-muted-foreground truncate">{uc.meterNumber}</span>
                    <span className="col-span-2 text-right text-xs">
                      {uc.startValue !== null ? formatNumber(uc.startValue) : '-'}
                    </span>
                    <span className="col-span-2 text-right text-xs">
                      {uc.endValue !== null ? formatNumber(uc.endValue) : '-'}
                    </span>
                    <span className="col-span-2 text-right font-medium">
                      {uc.consumption !== null ? formatNumber(uc.consumption) : '-'}
                    </span>
                    <span className="col-span-2 text-right text-xs text-muted-foreground">
                      {uc.consumptionShare > 0 ? `${formatNumber(uc.consumptionShare, 1)}%` : '-'}
                    </span>
                    {uc.warning && (
                      <div className="col-span-12 flex items-center gap-1 text-xs text-amber-500 mt-1">
                        <AlertTriangle className="w-3 h-3" />{uc.warning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {building && unitConsumptions.length === 0 && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Keine Zähler in Einheiten</h2>
          <p className="text-muted-foreground">Weisen Sie Zähler den einzelnen Einheiten zu, um Verbrauchsanteile für die BK-Abrechnung zu berechnen.</p>
        </div>
      )}

      {!building && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Bitte wählen Sie ein Gebäude aus.</p>
        </div>
      )}
    </AppLayout>
  );
}
