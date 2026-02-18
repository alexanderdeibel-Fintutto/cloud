import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sun, Zap, Users, Building2, Download, Euro, Leaf,
  BarChart3, PieChart as PieChartIcon, ArrowRightLeft,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useBuildings } from '@/hooks/useBuildings';
import { useToast } from '@/hooks/use-toast';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS,
  calculateAnnualConsumption, formatNumber, formatEuro,
} from '@/types/database';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

// Mieterstrom tariff model
const MIETERSTROM_TARIFF = 0.22; // €/kWh (typically 10-20% below grid price)
const GRID_TARIFF = 0.32; // €/kWh
const FEED_IN_TARIFF = 0.082; // €/kWh
const EEG_UMLAGE_REDUCTION = 0.6; // 60% EEG reduction for Mieterstrom
const CO2_FACTOR = 0.4; // kg CO₂/kWh saved vs grid

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#059669', '#7c3aed'];

export default function MieterStromDashboard() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { toast } = useToast();

  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [mieterStromPrice, setMieterStromPrice] = useState<string>('0.22');
  const [gridPrice, setGridPrice] = useState<string>('0.32');
  const [isZEV, setIsZEV] = useState(false); // Gemeinschaftliche Gebäudeversorgung (ZEV)

  const building = buildings.find(b => b.id === selectedBuilding);

  // PV production data
  const pvData = useMemo(() => {
    if (!building) return null;

    const allMeters = [...(building.meters || []), ...building.units.flatMap(u => u.meters)];
    const pvProduction = allMeters.filter(m => m.meter_type === 'pv_production');
    const pvFeedIn = allMeters.filter(m => m.meter_type === 'pv_feed_in');
    const pvSelfConsumption = allMeters.filter(m => m.meter_type === 'pv_self_consumption');

    const annualProduction = pvProduction.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const annualFeedIn = pvFeedIn.reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const annualSelfUse = annualProduction - annualFeedIn;

    return { annualProduction, annualFeedIn, annualSelfUse, hasPV: pvProduction.length > 0 };
  }, [building]);

  // Per-unit electricity consumption and Mieterstrom allocation
  const unitData = useMemo(() => {
    if (!building || !pvData) return null;

    const msPrice = parseFloat(mieterStromPrice) || MIETERSTROM_TARIFF;
    const gPrice = parseFloat(gridPrice) || GRID_TARIFF;

    const units = building.units.map(unit => {
      const electricityMeters = unit.meters.filter(m =>
        ['electricity', 'electricity_ht', 'electricity_nt'].includes(m.meter_type)
      );
      const annualConsumption = electricityMeters.reduce((s, m) =>
        s + (calculateAnnualConsumption(m.readings) || 0), 0
      );

      return {
        unitId: unit.id,
        unitNumber: unit.unit_number,
        area: unit.area || 0,
        annualConsumption,
        // These will be calculated after totals are known
        pvShare: 0,
        gridShare: 0,
        mieterStromCost: 0,
        gridCost: 0,
        totalCost: 0,
        savingsVsGrid: 0,
        co2Saved: 0,
      };
    });

    // Total consumption across all units
    const totalConsumption = units.reduce((s, u) => s + u.annualConsumption, 0);

    // Distribute PV self-use proportionally
    const pvAvailable = pvData.annualSelfUse;

    units.forEach(unit => {
      if (totalConsumption > 0 && pvAvailable > 0) {
        const ratio = unit.annualConsumption / totalConsumption;
        unit.pvShare = Math.min(unit.annualConsumption, Math.round(pvAvailable * ratio));
        unit.gridShare = unit.annualConsumption - unit.pvShare;
      } else {
        unit.pvShare = 0;
        unit.gridShare = unit.annualConsumption;
      }

      unit.mieterStromCost = Math.round(unit.pvShare * msPrice * 100) / 100;
      unit.gridCost = Math.round(unit.gridShare * gPrice * 100) / 100;
      unit.totalCost = Math.round((unit.mieterStromCost + unit.gridCost) * 100) / 100;
      unit.savingsVsGrid = Math.round(unit.pvShare * (gPrice - msPrice) * 100) / 100;
      unit.co2Saved = Math.round(unit.pvShare * CO2_FACTOR);
    });

    const totalMieterStromRevenue = units.reduce((s, u) => s + u.mieterStromCost, 0);
    const totalGridCost = units.reduce((s, u) => s + u.gridCost, 0);
    const totalSavings = units.reduce((s, u) => s + u.savingsVsGrid, 0);
    const totalCO2Saved = units.reduce((s, u) => s + u.co2Saved, 0);
    const feedInRevenue = Math.round(pvData.annualFeedIn * FEED_IN_TARIFF * 100) / 100;

    return {
      units,
      totalConsumption,
      totalMieterStromRevenue,
      totalGridCost,
      totalSavings,
      totalCO2Saved,
      feedInRevenue,
      pvSelfUseRatio: totalConsumption > 0 ? Math.round((pvAvailable / totalConsumption) * 100) : 0,
    };
  }, [building, pvData, mieterStromPrice, gridPrice]);

  // Pie chart: PV vs Grid per building
  const sourcePieData = useMemo(() => {
    if (!unitData || !pvData) return [];
    return [
      { name: isZEV ? 'Gebäudeversorgung (ZEV)' : 'Mieterstrom (PV)', value: pvData.annualSelfUse, color: '#eab308' },
      { name: 'Netzstrom', value: unitData.totalConsumption - pvData.annualSelfUse, color: '#6366f1' },
    ].filter(d => d.value > 0);
  }, [unitData, pvData, isZEV]);

  // Bar chart: per unit
  const unitBarData = useMemo(() => {
    if (!unitData) return [];
    return unitData.units
      .filter(u => u.annualConsumption > 0)
      .map(u => ({
        name: u.unitNumber,
        pv: u.pvShare,
        grid: u.gridShare,
      }));
  }, [unitData]);

  // CSV export
  const exportCSV = () => {
    if (!unitData || !building) return;

    const msPrice = parseFloat(mieterStromPrice) || MIETERSTROM_TARIFF;
    const lines = [
      `"${isZEV ? 'ZEV-Abrechnung' : 'Mieterstrom-Abrechnung'} - ${building.name}"`,
      `"Mieterstrom-Preis: ${msPrice} €/kWh | Netzpreis: ${parseFloat(gridPrice) || GRID_TARIFF} €/kWh"`,
      '',
      '"Einheit";"Verbrauch (kWh)";"PV-Anteil (kWh)";"Netz-Anteil (kWh)";"Mieterstrom-Kosten";"Netzkosten";"Gesamt";"Ersparnis";"CO₂ gespart (kg)"',
    ];
    unitData.units.forEach(u => {
      lines.push(`"${u.unitNumber}";"${u.annualConsumption}";"${u.pvShare}";"${u.gridShare}";"${u.mieterStromCost}";"${u.gridCost}";"${u.totalCost}";"${u.savingsVsGrid}";"${u.co2Saved}"`);
    });
    lines.push('');
    lines.push(`"Gesamt";"${unitData.totalConsumption}";"${pvData?.annualSelfUse || 0}";"${unitData.totalConsumption - (pvData?.annualSelfUse || 0)}";"${unitData.totalMieterStromRevenue}";"${unitData.totalGridCost}";"${Math.round((unitData.totalMieterStromRevenue + unitData.totalGridCost) * 100) / 100}";"${unitData.totalSavings}";"${unitData.totalCO2Saved}"`);

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mieterstrom_${building.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          {isZEV ? 'ZEV-Abrechnung' : 'Mieterstrom'}
        </h1>
        {unitData && (
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
              <Label className="text-xs">Mieterstrom-Preis (€/kWh)</Label>
              <Input type="number" step="0.01" value={mieterStromPrice} onChange={e => setMieterStromPrice(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Netzstrom-Preis (€/kWh)</Label>
              <Input type="number" step="0.01" value={gridPrice} onChange={e => setGridPrice(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Gemeinschaftliche Gebäudeversorgung (ZEV)</Label>
              <p className="text-[10px] text-muted-foreground">§42b EnWG - Erweiterte Regelungen ab 2025</p>
            </div>
            <Switch checked={isZEV} onCheckedChange={setIsZEV} />
          </div>
        </CardContent>
      </Card>

      {/* No PV warning */}
      {building && pvData && !pvData.hasPV && (
        <Card className="mb-4 border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-3">
            <p className="text-xs text-amber-600 font-medium">Keine PV-Zähler vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Für Mieterstrom werden PV-Produktionszähler benötigt. Die Berechnung erfolgt derzeit nur auf Basis der Stromverbrauchszähler.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {unitData && pvData && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="glass-card border-0">
              <CardContent className="p-3">
                <Sun className="w-5 h-5 text-yellow-500 mb-1" />
                <p className="text-xs text-muted-foreground">PV-Anteil</p>
                <p className="text-lg font-bold">{unitData.pvSelfUseRatio}%</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-3">
                <Euro className="w-5 h-5 text-green-500 mb-1" />
                <p className="text-xs text-muted-foreground">Mieter-Ersparnis</p>
                <p className="text-lg font-bold text-green-500">{formatEuro(unitData.totalSavings)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-3">
                <Zap className="w-5 h-5 text-indigo-500 mb-1" />
                <p className="text-xs text-muted-foreground">Mieterstrom-Erlös</p>
                <p className="text-lg font-bold">{formatEuro(unitData.totalMieterStromRevenue)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-3">
                <Leaf className="w-5 h-5 text-green-600 mb-1" />
                <p className="text-xs text-muted-foreground">CO₂ gespart</p>
                <p className="text-lg font-bold">{formatNumber(unitData.totalCO2Saved)} kg</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue overview */}
          <Card className="mb-4 border-green-500/20 bg-green-500/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Vermieter-Erlöse (jährlich)</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isZEV ? 'ZEV-Lieferung' : 'Mieterstrom-Verkauf'}</span>
                  <span className="font-medium">{formatEuro(unitData.totalMieterStromRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Netzeinspeisung (EEG)</span>
                  <span className="font-medium">{formatEuro(unitData.feedInRevenue)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-bold">
                  <span>Gesamt</span>
                  <span className="text-green-500">{formatEuro(unitData.totalMieterStromRevenue + unitData.feedInRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source pie chart */}
          {sourcePieData.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Stromquellen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourcePieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={2}>
                          {sourcePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `${formatNumber(v)} kWh`} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {sourcePieData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs">{item.name}</span>
                        </div>
                        <span className="text-xs font-medium">{formatNumber(item.value)} kWh</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-unit bar chart */}
          {unitBarData.length > 1 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Verbrauch pro Einheit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={unitBarData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="pv" name="PV-Strom" fill="#eab308" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="grid" name="Netzstrom" fill="#6366f1" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-unit detail cards */}
          <h2 className="text-sm font-medium mb-2">Abrechnung pro Einheit</h2>
          <div className="space-y-2 mb-4">
            {unitData.units.filter(u => u.annualConsumption > 0).map(unit => (
              <Card key={unit.unitId}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{unit.unitNumber}</span>
                    <span className="font-bold text-primary text-sm">{formatEuro(unit.totalCost)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                    <span>Verbrauch: {formatNumber(unit.annualConsumption)} kWh</span>
                    <span>PV-Anteil: {formatNumber(unit.pvShare)} kWh</span>
                    <span>{isZEV ? 'ZEV' : 'Mieterstrom'}: {formatEuro(unit.mieterStromCost)}</span>
                    <span>Netz: {formatEuro(unit.gridCost)}</span>
                    <span className="text-green-500">Ersparnis: {formatEuro(unit.savingsVsGrid)}</span>
                    <span className="text-green-600">CO₂: -{unit.co2Saved} kg</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Legal info */}
      <Card className="mb-4 border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {isZEV ? 'Gemeinschaftliche Gebäudeversorgung (§42b EnWG)' : 'Mieterstromgesetz (§42a EnWG)'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isZEV
                  ? 'Bei der ZEV wird der PV-Strom über einen virtuellen Summenzähler verteilt. Kein Lieferantenstatus nötig. Regulatorischer Rahmen seit 2024 vereinfacht.'
                  : 'Der Mieterstrom-Preis darf maximal 90% des örtlichen Grundversorgungstarifs betragen. Es besteht keine Abnahmepflicht für Mieter. Zuschlag: 2,67 ct/kWh (≤10 kWp).'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
