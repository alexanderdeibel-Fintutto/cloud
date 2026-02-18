import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, Building2, Thermometer, Euro, FileText, Percent } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS,
  calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
} from '@/types/database';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// HeizkostenV: 70% consumption-based, 30% area-based (§7 HeizkV)
type AllocationMethod = '70_30' | '50_50' | '100_consumption' | '100_area';

const allocationLabels: Record<AllocationMethod, string> = {
  '70_30': '70% Verbrauch / 30% Fläche (HeizkV Standard)',
  '50_50': '50% Verbrauch / 50% Fläche',
  '100_consumption': '100% nach Verbrauch',
  '100_area': '100% nach Fläche',
};

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function UtilityBilling() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>('70_30');
  const [totalHeatingCost, setTotalHeatingCost] = useState<string>('');
  const [totalWaterCost, setTotalWaterCost] = useState<string>('');
  const [periodFrom, setPeriodFrom] = useState(format(new Date(new Date().getFullYear() - 1, 0, 1), 'yyyy-MM-dd'));
  const [periodTo, setPeriodTo] = useState(format(new Date(new Date().getFullYear() - 1, 11, 31), 'yyyy-MM-dd'));

  const building = buildings.find(b => b.id === selectedBuilding);

  // Calculate billing per unit
  const billingData = useMemo(() => {
    if (!building || !building.units.length) return null;

    const heatingTotal = parseFloat(totalHeatingCost) || 0;
    const waterTotal = parseFloat(totalWaterCost) || 0;
    const totalArea = building.total_area || building.units.reduce((s, u) => s + (u.area || 0), 0);

    // Allocation ratios for heating
    const consumptionRatio = allocationMethod === '70_30' ? 0.7 :
      allocationMethod === '50_50' ? 0.5 :
      allocationMethod === '100_consumption' ? 1.0 : 0.0;
    const areaRatio = 1 - consumptionRatio;

    // Calculate per-unit heating consumption
    const unitData = building.units.map(unit => {
      const heatingMeters = unit.meters.filter(m => ['heating', 'gas', 'district_heating'].includes(m.meter_type));
      const waterMeters = unit.meters.filter(m => ['water_cold', 'water_hot'].includes(m.meter_type));

      const heatingConsumption = heatingMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
      const waterConsumption = waterMeters.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
      const unitArea = unit.area || 0;

      return {
        unitId: unit.id,
        unitNumber: unit.unit_number,
        area: unitArea,
        heatingConsumption,
        waterConsumption,
        heatingCostShare: 0,
        waterCostShare: 0,
        totalCost: 0,
      };
    });

    // Total consumptions
    const totalHeatingConsumption = unitData.reduce((s, u) => s + u.heatingConsumption, 0);
    const totalWaterConsumption = unitData.reduce((s, u) => s + u.waterConsumption, 0);

    // Distribute costs
    unitData.forEach(unit => {
      // Heating: by method
      const consumptionShare = totalHeatingConsumption > 0
        ? (unit.heatingConsumption / totalHeatingConsumption) * heatingTotal * consumptionRatio
        : 0;
      const areaShare = totalArea > 0
        ? (unit.area / totalArea) * heatingTotal * areaRatio
        : 0;
      unit.heatingCostShare = Math.round((consumptionShare + areaShare) * 100) / 100;

      // Water: proportional to consumption
      unit.waterCostShare = totalWaterConsumption > 0
        ? Math.round((unit.waterConsumption / totalWaterConsumption) * waterTotal * 100) / 100
        : 0;

      unit.totalCost = Math.round((unit.heatingCostShare + unit.waterCostShare) * 100) / 100;
    });

    return { units: unitData, totalArea, totalHeatingConsumption, totalWaterConsumption };
  }, [building, totalHeatingCost, totalWaterCost, allocationMethod]);

  // Pie chart data
  const pieData = useMemo(() => {
    if (!billingData) return [];
    return billingData.units
      .filter(u => u.totalCost > 0)
      .map((u, i) => ({ name: u.unitNumber, value: u.totalCost, color: COLORS[i % COLORS.length] }));
  }, [billingData]);

  // CSV export
  const exportCSV = () => {
    if (!billingData || !building) return;
    const lines = [
      `"Nebenkostenabrechnung - ${building.name}"`,
      `"Zeitraum: ${periodFrom} bis ${periodTo}"`,
      `"Verteilschlüssel: ${allocationLabels[allocationMethod]}"`,
      '',
      '"Einheit";"Fläche (m²)";"Heizverbrauch";"Heizkosten";"Wasserverbrauch";"Wasserkosten";"Gesamt"',
    ];
    billingData.units.forEach(u => {
      lines.push(`"${u.unitNumber}";"${u.area}";"${u.heatingConsumption}";"${u.heatingCostShare}";"${u.waterConsumption}";"${u.waterCostShare}";"${u.totalCost}"`);
    });
    const total = billingData.units.reduce((s, u) => s + u.totalCost, 0);
    lines.push(`"";"";"";"";"";"Gesamt:";"${total}"`);

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nebenkostenabrechnung_${building.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Nebenkostenabrechnung</h1>
        {billingData && (
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-1" />CSV
          </Button>
        )}
      </div>

      {/* Configuration */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Gebäude</Label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Gebäude wählen" /></SelectTrigger>
              <SelectContent>
                {buildings.filter(b => b.units.length > 0).map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name} ({b.units.length} Einheiten)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Von</Label>
              <Input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bis</Label>
              <Input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Verteilschlüssel (HeizkV)</Label>
            <Select value={allocationMethod} onValueChange={v => setAllocationMethod(v as AllocationMethod)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(allocationLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Heizkosten gesamt (€)</Label>
              <Input type="number" placeholder="z.B. 3500" value={totalHeatingCost} onChange={e => setTotalHeatingCost(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Wasserkosten gesamt (€)</Label>
              <Input type="number" placeholder="z.B. 800" value={totalWaterCost} onChange={e => setTotalWaterCost(e.target.value)} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {billingData && billingData.units.length > 0 && (
        <>
          {/* Distribution Chart */}
          {pieData.length > 1 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Kostenverteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={2}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{formatEuro(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-Unit Breakdown */}
          <div className="space-y-2">
            {billingData.units.map(unit => (
              <Card key={unit.unitId}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{unit.unitNumber}</span>
                    <span className="font-bold text-primary text-sm">{formatEuro(unit.totalCost)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span>Fläche: {unit.area} m²</span>
                    </div>
                    <div>
                      <span>Heizung: {formatEuro(unit.heatingCostShare)}</span>
                    </div>
                    <div>
                      <span>Heizverbrauch: {formatNumber(unit.heatingConsumption)} kWh</span>
                    </div>
                    <div>
                      <span>Wasser: {formatEuro(unit.waterCostShare)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* HeizkV Info */}
          <Card className="mt-4 mb-4 border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Heizkostenverordnung (HeizkV)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gemäß §7 HeizkV müssen mindestens 50% und höchstens 70% der Kosten nach Verbrauch verteilt werden.
                    Der Rest wird nach Fläche (m²) umgelegt. Die Standardverteilung ist 70/30.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
