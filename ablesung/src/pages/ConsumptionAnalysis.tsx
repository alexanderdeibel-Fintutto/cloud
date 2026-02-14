import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus, Zap, Flame, Droplets, Thermometer, AlertTriangle, Sun, Cloud, FileSpreadsheet, ArrowRightLeft, ChevronRight, Grid3X3, Calculator, Lightbulb, MessageSquare, FileText } from 'lucide-react';
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
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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

  // A.1+A.2: Consumption & Cost Forecast (linear regression on monthly data)
  const forecast = useMemo(() => {
    if (monthlyData.length < 3) return null;
    // Sum all numeric values per month for trend line
    const values = monthlyData.map(d => {
      let sum = 0;
      Object.entries(d).forEach(([k, v]) => { if (k !== 'month' && typeof v === 'number') sum += v; });
      return sum;
    });
    // Simple linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let num = 0, den = 0;
    values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;

    // Forecast next 6 months
    const forecastMonths: { month: string; actual?: number; forecast: number }[] = [];
    // Last 6 actual
    values.slice(-6).forEach((v, i) => {
      const monthIdx = n - 6 + i;
      forecastMonths.push({ month: monthlyData[monthIdx]?.month as string || '', actual: v, forecast: intercept + slope * monthIdx });
    });
    // Next 6 projected
    for (let i = 0; i < 6; i++) {
      const futureDate = subMonths(new Date(), -(i + 1));
      forecastMonths.push({
        month: format(futureDate, 'MMM yy', { locale: de }),
        forecast: Math.max(0, intercept + slope * (n + i)),
      });
    }

    const annualForecast = Math.max(0, (intercept + slope * (n + 5)) * 12);
    const annualCostForecast = viewMode === 'cost' ? annualForecast : annualForecast * (totalCost > 0 && Object.values(consumptionByType).reduce((s, d) => s + d.consumption, 0) > 0 ? totalCost / Object.values(consumptionByType).reduce((s, d) => s + d.consumption, 0) : 0.30);
    const trend = slope > 0.5 ? 'steigend' : slope < -0.5 ? 'sinkend' : 'stabil';

    return { data: forecastMonths, annualForecast: Math.round(annualForecast), annualCostForecast: Math.round(annualCostForecast), trend, slope };
  }, [monthlyData, viewMode, totalCost, consumptionByType]);

  // A.10: Cost breakdown by type for pie chart
  const costBreakdown = useMemo(() => {
    const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];
    return Object.entries(consumptionByType)
      .filter(([_, d]) => d.cost > 0)
      .map(([type, data], i) => ({
        name: METER_TYPE_LABELS[type as MeterType],
        value: Math.round(data.cost),
        color: COLORS[i % COLORS.length],
      }));
  }, [consumptionByType]);

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

      {/* A.1+A.2: Consumption & Cost Forecast */}
      {forecast && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Prognose (6 Monate)
              <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                forecast.trend === 'steigend' ? 'bg-red-500/10 text-red-500' :
                forecast.trend === 'sinkend' ? 'bg-green-500/10 text-green-500' :
                'bg-gray-500/10 text-muted-foreground'
              }`}>
                {forecast.trend === 'steigend' ? '↗' : forecast.trend === 'sinkend' ? '↘' : '→'} {forecast.trend}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-accent/50 p-2.5 text-center">
                <p className="text-xs text-muted-foreground">Jahresprognose</p>
                <p className="text-lg font-bold">
                  {viewMode === 'cost' ? formatEuro(forecast.annualCostForecast) : `${formatNumber(forecast.annualForecast)} kWh`}
                </p>
              </div>
              <div className="rounded-lg bg-accent/50 p-2.5 text-center">
                <p className="text-xs text-muted-foreground">Kostenprognose/Jahr</p>
                <p className="text-lg font-bold text-primary">{formatEuro(forecast.annualCostForecast)}</p>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 9 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Ist" />
                  <Area type="monotone" dataKey="forecast" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeDasharray="5 5" name="Prognose" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* A.8+A.10: Cost Summary & Breakdown */}
      {costBreakdown.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kostenverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={2}>
                      {costBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {costBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium">{formatEuro(item.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs font-medium">Gesamt</span>
                  <span className="text-sm font-bold text-primary">{formatEuro(totalCost)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* A.9: Enhanced Year over Year Comparison with BarChart */}
      {Object.keys(consumptionByType).some(t => consumptionByType[t].prevYearConsumption > 0) && (() => {
        const yoyData = Object.entries(consumptionByType)
          .filter(([_, d]) => d.prevYearConsumption > 0)
          .map(([type, data]) => ({
            name: METER_TYPE_LABELS[type as MeterType].split(' ')[0],
            vorjahr: Math.round(data.prevYearConsumption),
            aktuell: Math.round(data.consumption),
            change: Math.round(((data.consumption - data.prevYearConsumption) / data.prevYearConsumption) * 100),
          }));
        return (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vorjahresvergleich</CardTitle>
            </CardHeader>
            <CardContent>
              {yoyData.length > 0 && (
                <div className="h-44 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yoyData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="vorjahr" fill="#94a3b8" name="Vorjahr" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="aktuell" fill="hsl(var(--primary))" name="Aktuell" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-2">
                {yoyData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="text-sm">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatNumber(d.vorjahr)} → {formatNumber(d.aktuell)}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        d.change > 5 ? 'bg-red-500/10 text-red-500' :
                        d.change < -5 ? 'bg-green-500/10 text-green-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>{d.change > 0 ? '+' : ''}{d.change}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

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

      {/* Mehr entdecken - Links zu weiteren Analyse-Seiten */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mehr entdecken</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[
              { href: '/solar', icon: Sun, label: 'Solar/PV Dashboard', desc: 'Produktion, Eigenverbrauch, Autarkie', color: 'text-yellow-500' },
              { href: '/heatmap', icon: Grid3X3, label: 'Verbrauchs-Heatmap', desc: 'Monat x Wochentag Verteilung', color: 'text-orange-500' },
              { href: '/simulator', icon: Lightbulb, label: 'Spar-Simulator', desc: 'Was-wäre-wenn Szenarien', color: 'text-amber-500' },
              { href: '/energy-chat', icon: MessageSquare, label: 'Energieberater', desc: 'KI-basierte Empfehlungen', color: 'text-indigo-500' },
              { href: '/costs', icon: Calculator, label: 'Nebenkosten-Rechner', desc: 'Kostenaufstellung pro Gebäude', color: 'text-teal-500' },
              { href: '/reports', icon: FileText, label: 'Report-Builder', desc: 'Berichte erstellen & exportieren', color: 'text-slate-500' },
              { href: '/weather', icon: Cloud, label: 'Wetterdaten', desc: 'Heizgradtage, Temperatur-Korrelation', color: 'text-blue-400' },
              { href: '/comparison', icon: ArrowRightLeft, label: 'Anbietervergleich', desc: 'Check24, Verivox, Wechselpilot', color: 'text-green-500' },
              { href: '/bk-integration', icon: FileSpreadsheet, label: 'BK-Abrechnung', desc: 'Verbrauchsanteile & CSV-Export', color: 'text-purple-500' },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <div
                key={href}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(href)}
              >
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
