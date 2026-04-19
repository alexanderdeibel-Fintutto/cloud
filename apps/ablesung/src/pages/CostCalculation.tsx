import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, Zap, Flame, Droplets, Thermometer, Euro } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS,
  calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
} from '@/types/database';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

const typeIcons: Partial<Record<string, typeof Zap>> = {
  electricity: Zap, gas: Flame, water_cold: Droplets, water_hot: Droplets,
  heating: Thermometer, district_heating: Thermometer,
};

export default function CostCalculation() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  // Calculate costs per meter type per building
  const costData = useMemo(() => {
    const result: {
      building: string;
      buildingId: string;
      costs: { type: MeterType; label: string; consumption: number; unit: string; costPerUnit: number; totalCost: number }[];
      totalCost: number;
    }[] = [];

    buildings.forEach(b => {
      if (filterBuilding !== 'all' && b.id !== filterBuilding) return;

      const allMeters = [...(b.meters || []), ...b.units.flatMap(u => u.meters)];
      const costsByType: Record<string, { consumption: number; cost: number }> = {};

      allMeters.forEach(m => {
        const annual = calculateAnnualConsumption(m.readings) || 0;
        if (annual === 0) return;
        const cost = calculateCost(annual, m.meter_type);
        if (!costsByType[m.meter_type]) costsByType[m.meter_type] = { consumption: 0, cost: 0 };
        costsByType[m.meter_type].consumption += annual;
        costsByType[m.meter_type].cost += cost;
      });

      const costs = Object.entries(costsByType).map(([type, data]) => ({
        type: type as MeterType,
        label: METER_TYPE_LABELS[type as MeterType],
        consumption: Math.round(data.consumption),
        unit: METER_TYPE_UNITS[type as MeterType],
        costPerUnit: METER_TYPE_PRICE_DEFAULTS[type as MeterType] || 0,
        totalCost: Math.round(data.cost),
      })).sort((a, b) => b.totalCost - a.totalCost);

      const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);

      if (costs.length > 0) {
        result.push({ building: b.name, buildingId: b.id, costs, totalCost });
      }
    });

    return result;
  }, [buildings, filterBuilding]);

  // Grand totals
  const grandTotal = costData.reduce((sum, b) => sum + b.totalCost, 0);
  const monthlyTotal = Math.round(grandTotal / 12);

  // Pie chart data
  const pieData = useMemo(() => {
    const byType: Record<string, number> = {};
    costData.forEach(b => b.costs.forEach(c => {
      byType[c.label] = (byType[c.label] || 0) + c.totalCost;
    }));
    return Object.entries(byType).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  }, [costData]);

  // Building comparison chart
  const buildingChartData = useMemo(() => {
    return costData.map(b => ({ name: b.building, cost: b.totalCost }));
  }, [costData]);

  // CSV export
  const exportCSV = () => {
    const lines = ['Gebäude;Zählertyp;Verbrauch;Einheit;Preis/Einheit;Jahreskosten'];
    costData.forEach(b => {
      b.costs.forEach(c => {
        lines.push(`${b.building};${c.label};${c.consumption};${c.unit};${c.costPerUnit};${c.totalCost}`);
      });
    });
    lines.push(`;;;;;;Gesamt: ${grandTotal}€`);
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nebenkosten_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Nebenkosten-Rechner</h1>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={costData.length === 0}>
          <Download className="w-4 h-4 mr-1" />CSV
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gebäude</SelectItem>
            {buildings.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grand Totals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Euro className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Jahreskosten (geschätzt)</p>
            <p className="text-2xl font-bold text-primary">{formatEuro(grandTotal)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4 text-center">
            <Calculator className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Monatlich</p>
            <p className="text-2xl font-bold">{formatEuro(monthlyTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Pie Chart */}
      {pieData.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kostenverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium">{formatEuro(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Building Comparison */}
      {buildingChartData.length > 1 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gebäudevergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" name="Jahreskosten" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-Building Breakdown */}
      {costData.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Keine Kostendaten</h3>
            <p className="text-sm text-muted-foreground">Legen Sie Zähler an und erfassen Sie Ablesungen, um Kosten zu berechnen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {costData.map(b => (
            <Card key={b.buildingId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{b.building}</CardTitle>
                  <span className="text-sm font-bold text-primary">{formatEuro(b.totalCost)}/Jahr</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {b.costs.map(c => {
                    const Icon = typeIcons[c.type] || Zap;
                    return (
                      <div key={c.type} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{c.label}</span>
                            <span className="text-sm font-medium">{formatEuro(c.totalCost)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(c.consumption)} {c.unit} x {c.costPerUnit} €/{c.unit}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
