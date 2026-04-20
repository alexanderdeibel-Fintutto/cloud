import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid3X3 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, calculateAnnualConsumption, formatNumber } from '@/types/database';
import { subMonths, isAfter, isBefore, startOfMonth, endOfMonth, getDay, format } from 'date-fns';
import { de } from 'date-fns/locale';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export default function ConsumptionHeatmap() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Collect all meters
  const allMeters = useMemo(() => {
    return buildings
      .filter(b => filterBuilding === 'all' || b.id === filterBuilding)
      .flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)])
      .filter(m => filterType === 'all' || m.meter_type === filterType);
  }, [buildings, filterBuilding, filterType]);

  // Build month x day-of-week heatmap from reading intervals
  const heatmapData = useMemo(() => {
    // Create 12 months x 7 days grid
    const grid: number[][] = Array.from({ length: 12 }, () => Array(7).fill(0));
    const counts: number[][] = Array.from({ length: 12 }, () => Array(7).fill(0));

    allMeters.forEach(meter => {
      const sorted = [...meter.readings].sort(
        (a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime()
      );

      for (let i = 1; i < sorted.length; i++) {
        const d1 = new Date(sorted[i - 1].reading_date);
        const d2 = new Date(sorted[i].reading_date);
        const diff = sorted[i].reading_value - sorted[i - 1].reading_value;
        if (diff <= 0) continue;

        const daysBetween = Math.max(1, (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        const dailyConsumption = diff / daysBetween;

        const month = d2.getMonth();
        const dow = (getDay(d2) + 6) % 7; // Monday = 0
        grid[month][dow] += dailyConsumption;
        counts[month][dow]++;
      }
    });

    // Average values
    const avgGrid = grid.map((row, m) =>
      row.map((val, d) => counts[m][d] > 0 ? Math.round(val / counts[m][d] * 10) / 10 : 0)
    );

    // Find max for color scaling
    const maxVal = Math.max(...avgGrid.flat(), 1);

    return { grid: avgGrid, maxVal };
  }, [allMeters]);

  // Monthly totals for bar display
  const monthlyTotals = useMemo(() => {
    return heatmapData.grid.map((row, i) => ({
      month: MONTHS_SHORT[i],
      total: Math.round(row.reduce((s, v) => s + v, 0)),
    }));
  }, [heatmapData]);

  const hasData = heatmapData.grid.some(row => row.some(v => v > 0));

  // Get unique meter types
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]).forEach(m => types.add(m.meter_type));
    return [...types];
  }, [buildings]);

  // Color scale
  const getColor = (value: number, max: number) => {
    if (value === 0) return 'bg-muted';
    const intensity = value / max;
    if (intensity > 0.75) return 'bg-red-500';
    if (intensity > 0.5) return 'bg-orange-400';
    if (intensity > 0.25) return 'bg-amber-400';
    return 'bg-green-400';
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/analysis')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Verbrauchs-Heatmap</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gebäude</SelectItem>
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {availableTypes.map(t => <SelectItem key={t} value={t}>{METER_TYPE_LABELS[t as MeterType]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Keine Daten</h3>
            <p className="text-sm text-muted-foreground">Mindestens 2 Ablesungen eines Zählers werden benötigt.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Heatmap Grid */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monat x Wochentag (Durchschnitt/Tag)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  {/* Header */}
                  <div className="flex gap-0.5 mb-0.5">
                    <div className="w-10 shrink-0" />
                    {MONTHS_SHORT.map(m => (
                      <div key={m} className="flex-1 text-center text-[9px] text-muted-foreground font-medium">{m}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {DAYS.map((day, di) => (
                    <div key={day} className="flex gap-0.5 mb-0.5">
                      <div className="w-10 shrink-0 text-[10px] text-muted-foreground flex items-center">{day}</div>
                      {heatmapData.grid.map((row, mi) => (
                        <div
                          key={mi}
                          className={`flex-1 aspect-square rounded-sm ${getColor(row[di], heatmapData.maxVal)} transition-colors`}
                          title={`${MONTHS_SHORT[mi]} ${day}: ${row[di]} ${filterType !== 'all' ? METER_TYPE_UNITS[filterType as MeterType] || '' : ''}/Tag`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-[10px] text-muted-foreground">Niedrig</span>
                <div className="w-4 h-3 rounded-sm bg-green-400" />
                <div className="w-4 h-3 rounded-sm bg-amber-400" />
                <div className="w-4 h-3 rounded-sm bg-orange-400" />
                <div className="w-4 h-3 rounded-sm bg-red-500" />
                <span className="text-[10px] text-muted-foreground">Hoch</span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monats-Summen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {monthlyTotals.map((m, i) => {
                  const max = Math.max(...monthlyTotals.map(t => t.total), 1);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(m.total / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">{formatNumber(m.total)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
