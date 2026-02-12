import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus, Zap, Flame, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, MeterWithReadings, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_GROUPS,
  METER_TYPE_PRICE_DEFAULTS, CONSUMPTION_BENCHMARKS,
  calculateAnnualConsumption, calculateCost, getEfficiencyGrade, formatNumber, formatEuro,
} from '@/types/database';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { format, subMonths, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

type TimeRange = '3m' | '6m' | '12m' | '24m' | 'all';
type ViewMode = 'consumption' | 'cost';

export default function ConsumptionAnalysis() {
  const navigate = useNavigate();
  const { buildings, isLoading } = useBuildings();
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('consumption');

  // Collect all meters across buildings
  const allMeters = useMemo(() => {
    const meters: (MeterWithReadings & { buildingName: string; buildingId: string })[] = [];
    buildings.forEach(b => {
      (b.meters || []).forEach(m => meters.push({ ...m, buildingName: b.name, buildingId: b.id }));
      b.units.forEach(u => u.meters.forEach(m => meters.push({ ...m, buildingName: b.name, buildingId: b.id })));
    });
    return meters;
  }, [buildings]);

  // Filter meters
  const filteredMeters = useMemo(() => {
    return allMeters.filter(m => {
      if (filterBuilding !== 'all' && m.buildingId !== filterBuilding) return false;
      if (filterType !== 'all') {
        const group = METER_TYPE_GROUPS[filterType];
        if (group && !group.types.includes(m.meter_type)) return false;
        if (!group && m.meter_type !== filterType) return false;
      }
      return true;
    });
  }, [allMeters, filterType, filterBuilding]);

  // Time range cutoff
  const cutoffDate = useMemo(() => {
    if (timeRange === 'all') return null;
    const months = parseInt(timeRange);
    return subMonths(new Date(), months);
  }, [timeRange]);

  // Calculate consumption per type
  const consumptionByType = useMemo(() => {
    const result: Record<string, { consumption: number; cost: number; count: number; prevYearConsumption: number }> = {};
    const now = new Date();
    const oneYearAgo = subMonths(now, 12);
    const twoYearsAgo = subMonths(now, 24);

    filteredMeters.forEach(meter => {
      const type = meter.meter_type;
      if (!result[type]) result[type] = { consumption: 0, cost: 0, count: 0, prevYearConsumption: 0 };
      result[type].count++;

      const sortedReadings = [...meter.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());

      // Current year consumption
      const currentYearReadings = sortedReadings.filter(r => isAfter(new Date(r.reading_date), oneYearAgo));
      if (currentYearReadings.length >= 2) {
        const consumption = currentYearReadings[currentYearReadings.length - 1].reading_value - currentYearReadings[0].reading_value;
        result[type].consumption += Math.max(0, consumption);
        result[type].cost += calculateCost(Math.max(0, consumption), type as MeterType);
      }

      // Previous year consumption (for comparison)
      const prevYearReadings = sortedReadings.filter(r => {
        const d = new Date(r.reading_date);
        return isAfter(d, twoYearsAgo) && isBefore(d, oneYearAgo);
      });
      if (prevYearReadings.length >= 2) {
        const consumption = prevYearReadings[prevYearReadings.length - 1].reading_value - prevYearReadings[0].reading_value;
        result[type].prevYearConsumption += Math.max(0, consumption);
      }
    });

    return result;
  }, [filteredMeters]);

  // Monthly consumption data for chart
  const monthlyData = useMemo(() => {
    const months = timeRange === 'all' ? 24 : parseInt(timeRange);
    const data: { month: string; [key: string]: number | string }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const entry: Record<string, number | string> = {
        month: format(monthDate, 'MMM yy', { locale: de }),
      };

      filteredMeters.forEach(meter => {
        const type = meter.meter_type;
        const sortedReadings = [...meter.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
        const monthReadings = sortedReadings.filter(r => {
          const d = new Date(r.reading_date);
          return !isBefore(d, monthStart) && !isAfter(d, monthEnd);
        });

        if (monthReadings.length >= 2) {
          const consumption = monthReadings[monthReadings.length - 1].reading_value - monthReadings[0].reading_value;
          const key = viewMode === 'cost' ? `${type}_cost` : type;
          const value = viewMode === 'cost' ? calculateCost(Math.max(0, consumption), type as MeterType) : Math.max(0, consumption);
          entry[key] = ((entry[key] as number) || 0) + value;
        }
      });

      data.push(entry);
    }

    return data;
  }, [filteredMeters, timeRange, viewMode]);

  // Anomalies detection
  const anomalies = useMemo(() => {
    const results: { message: string; severity: 'warning' | 'critical' }[] = [];

    Object.entries(consumptionByType).forEach(([type, data]) => {
      if (data.prevYearConsumption > 0 && data.consumption > 0) {
        const change = ((data.consumption - data.prevYearConsumption) / data.prevYearConsumption) * 100;
        if (change > 20) {
          results.push({
            message: `${METER_TYPE_LABELS[type as MeterType]}: Verbrauch ${change > 0 ? '+' : ''}${formatNumber(change, 0)}% vs. Vorjahr`,
            severity: change > 40 ? 'critical' : 'warning',
          });
        }
      }
    });

    // Check for benchmark comparison
    filteredMeters.forEach(meter => {
      const annual = calculateAnnualConsumption(meter.readings);
      if (annual) {
        const benchmark = CONSUMPTION_BENCHMARKS.find(b => b.meter_type === meter.meter_type);
        if (benchmark && annual > benchmark.annual_consumption_high) {
          results.push({
            message: `${meter.buildingName} ${METER_TYPE_LABELS[meter.meter_type]}: ${formatNumber(annual)} ${METER_TYPE_UNITS[meter.meter_type]}/Jahr liegt über dem Benchmark (${formatNumber(benchmark.annual_consumption_high)})`,
            severity: 'warning',
          });
        }
      }
    });

    return results.slice(0, 5);
  }, [consumptionByType, filteredMeters]);

  // Building ranking by efficiency (kWh/m²)
  const buildingRanking = useMemo(() => {
    return buildings.map(b => {
      const area = b.total_area || 0;
      const allBuildingMeters = [
        ...(b.meters || []),
        ...b.units.flatMap(u => u.meters),
      ];
      const totalConsumption = allBuildingMeters.reduce((sum, m) => {
        const annual = calculateAnnualConsumption(m.readings);
        return sum + (annual || 0);
      }, 0);
      const perSqm = area > 0 ? Math.round(totalConsumption / area) : 0;
      return { name: b.name, totalConsumption, area, perSqm };
    }).filter(b => b.perSqm > 0).sort((a, b) => a.perSqm - b.perSqm);
  }, [buildings]);

  const totalCost = Object.values(consumptionByType).reduce((sum, d) => sum + d.cost, 0);

  const typeIconMap: Partial<Record<string, typeof Zap>> = {
    electricity: Zap, gas: Flame, water_cold: Droplets, water_hot: Droplets, heating: Thermometer,
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center py-12"><div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Verbrauchsauswertung</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 Monate</SelectItem>
            <SelectItem value="6m">6 Monate</SelectItem>
            <SelectItem value="12m">12 Monate</SelectItem>
            <SelectItem value="24m">24 Monate</SelectItem>
            <SelectItem value="all">Alles</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            {Object.entries(METER_TYPE_GROUPS).map(([key, group]) => (
              <SelectItem key={key} value={key}>{group.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gebäude</SelectItem>
            {buildings.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="consumption">kWh/m³</SelectItem>
            <SelectItem value="cost">Euro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards per type */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(consumptionByType).map(([type, data]) => {
          const Icon = typeIconMap[type] || Zap;
          const change = data.prevYearConsumption > 0
            ? ((data.consumption - data.prevYearConsumption) / data.prevYearConsumption) * 100
            : null;
          return (
            <Card key={type} className="glass-card border-0">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{METER_TYPE_LABELS[type as MeterType]}</span>
                </div>
                <p className="text-lg font-bold">
                  {viewMode === 'cost' ? formatEuro(data.cost) : `${formatNumber(data.consumption)} ${METER_TYPE_UNITS[type as MeterType]}`}
                </p>
                {change !== null && (
                  <div className={`flex items-center gap-1 text-xs ${change > 5 ? 'text-red-500' : change < -5 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {change > 5 ? <TrendingUp className="w-3 h-3" /> : change < -5 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {change > 0 ? '+' : ''}{formatNumber(change, 1)}% vs. Vorjahr
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {/* Total cost card */}
        <Card className="glass-card border-0 col-span-2">
          <CardContent className="p-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gesamtkosten (geschätzt)</span>
            <span className="text-lg font-bold text-primary">{formatEuro(totalCost)}</span>
          </CardContent>
        </Card>
      </div>

      {/* Consumption Chart */}
      {monthlyData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verbrauchsverlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  {Object.keys(consumptionByType).map((type, i) => {
                    const key = viewMode === 'cost' ? `${type}_cost` : type;
                    const colors = ['hsl(var(--primary))', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'];
                    return (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stackId="1"
                        stroke={colors[i % colors.length]}
                        fill={colors[i % colors.length]}
                        fillOpacity={0.3}
                        name={METER_TYPE_LABELS[type as MeterType]}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year over Year Comparison */}
      {Object.keys(consumptionByType).some(t => consumptionByType[t].prevYearConsumption > 0) && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vorjahresvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(consumptionByType)
                .filter(([_, d]) => d.prevYearConsumption > 0)
                .map(([type, data]) => {
                  const change = ((data.consumption - data.prevYearConsumption) / data.prevYearConsumption) * 100;
                  const isIncrease = change > 5;
                  const isDecrease = change < -5;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{METER_TYPE_LABELS[type as MeterType]}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(data.prevYearConsumption)} → {formatNumber(data.consumption)}
                        </span>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          isIncrease ? 'bg-red-500/10 text-red-500' :
                          isDecrease ? 'bg-green-500/10 text-green-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {change > 0 ? '+' : ''}{formatNumber(change, 1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Building Ranking */}
      {buildingRanking.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gebäude-Ranking (kWh/m²/Jahr)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {buildingRanking.map((b, i) => {
                const grade = getEfficiencyGrade(b.perSqm, 130);
                const gradeColors: Record<string, string> = {
                  'A+': 'bg-green-600', 'A': 'bg-green-500', 'B': 'bg-lime-500',
                  'C': 'bg-yellow-500', 'D': 'bg-amber-500', 'E': 'bg-orange-500',
                  'F': 'bg-red-400', 'G': 'bg-red-600',
                };
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                    <span className={`text-xs font-bold text-white px-1.5 py-0.5 rounded ${gradeColors[grade] || 'bg-gray-500'}`}>
                      {grade}
                    </span>
                    <span className="text-sm flex-1 truncate">{b.name}</span>
                    <span className="text-sm font-medium">{formatNumber(b.perSqm)} kWh/m²</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground w-5"></span>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5">Ø</span>
                <span className="text-xs text-muted-foreground flex-1">Bundesdurchschnitt</span>
                <span className="text-xs text-muted-foreground">130 kWh/m²</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies / Alerts */}
      {anomalies.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Auffälligkeiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((a, i) => (
                <div key={i} className={`text-sm p-2 rounded-lg ${a.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {a.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
