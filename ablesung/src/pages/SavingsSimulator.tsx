import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, TrendingDown, Calculator, Zap, Flame, Droplets, Thermometer } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, METER_TYPE_PRICE_DEFAULTS,
  calculateAnnualConsumption, calculateCost, formatNumber, formatEuro,
} from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Scenario {
  name: string;
  reductions: Record<string, number>; // meter_type -> percent reduction
}

const defaultScenarios: Scenario[] = [
  {
    name: 'LED-Beleuchtung',
    reductions: { electricity: 10, electricity_ht: 10, electricity_nt: 5 },
  },
  {
    name: 'Heizung optimiert (18°C statt 21°C)',
    reductions: { gas: 18, heating: 18, district_heating: 18, oil: 18, pellets: 18 },
  },
  {
    name: 'Sparduschkopf installiert',
    reductions: { water_hot: 30, water_cold: 15 },
  },
  {
    name: 'Standby eliminieren',
    reductions: { electricity: 5, electricity_ht: 5 },
  },
  {
    name: 'Energieeffiziente Geräte (A+++)',
    reductions: { electricity: 20, electricity_ht: 20, electricity_nt: 15 },
  },
];

export default function SavingsSimulator() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [activeScenarios, setActiveScenarios] = useState<Set<number>>(new Set());
  const [customReduction, setCustomReduction] = useState<string>('');
  const [customType, setCustomType] = useState<MeterType>('electricity');

  // Current annual consumption & cost per type
  const currentCosts = useMemo(() => {
    const allMeters = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]);
    const byType: Record<string, { consumption: number; cost: number }> = {};

    allMeters.forEach(m => {
      const annual = calculateAnnualConsumption(m.readings) || 0;
      if (annual === 0) return;
      if (!byType[m.meter_type]) byType[m.meter_type] = { consumption: 0, cost: 0 };
      byType[m.meter_type].consumption += annual;
      byType[m.meter_type].cost += calculateCost(annual, m.meter_type);
    });

    return byType;
  }, [buildings]);

  // Calculate combined reduction per type from active scenarios
  const combinedReductions = useMemo(() => {
    const reductions: Record<string, number> = {};
    activeScenarios.forEach(idx => {
      const scenario = defaultScenarios[idx];
      Object.entries(scenario.reductions).forEach(([type, pct]) => {
        reductions[type] = Math.min(80, (reductions[type] || 0) + pct);
      });
    });

    // Add custom
    if (customReduction && parseFloat(customReduction) > 0) {
      const pct = parseFloat(customReduction);
      reductions[customType] = Math.min(80, (reductions[customType] || 0) + pct);
    }

    return reductions;
  }, [activeScenarios, customReduction, customType]);

  // Projected savings
  const savings = useMemo(() => {
    const result: { type: string; label: string; currentCost: number; newCost: number; saving: number }[] = [];
    let totalSaving = 0;

    Object.entries(currentCosts).forEach(([type, data]) => {
      const reduction = combinedReductions[type] || 0;
      const newConsumption = data.consumption * (1 - reduction / 100);
      const newCost = calculateCost(newConsumption, type as MeterType);
      const saving = data.cost - newCost;
      totalSaving += saving;

      result.push({
        type,
        label: METER_TYPE_LABELS[type as MeterType],
        currentCost: Math.round(data.cost),
        newCost: Math.round(newCost),
        saving: Math.round(saving),
      });
    });

    return { items: result.filter(r => r.saving > 0), totalSaving: Math.round(totalSaving) };
  }, [currentCosts, combinedReductions]);

  const chartData = savings.items.map(s => ({
    name: s.label.split(' ')[0],
    aktuell: s.currentCost,
    simuliert: s.newCost,
  }));

  const toggleScenario = (idx: number) => {
    const next = new Set(activeScenarios);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setActiveScenarios(next);
  };

  const typeIcons: Partial<Record<string, typeof Zap>> = {
    electricity: Zap, gas: Flame, water_cold: Droplets, water_hot: Droplets,
    heating: Thermometer, district_heating: Thermometer,
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/savings')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Spar-Simulator</h1>

      {/* Result Card */}
      <Card className={`mb-4 ${savings.totalSaving > 0 ? 'border-green-500/20 bg-green-500/5' : ''}`}>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Jährliches Einsparpotenzial</p>
          <p className="text-3xl font-bold text-green-500">{savings.totalSaving > 0 ? formatEuro(savings.totalSaving) : '0 €'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeScenarios.size} Maßnahme{activeScenarios.size !== 1 ? 'n' : ''} ausgewählt
          </p>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Maßnahmen auswählen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {defaultScenarios.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                activeScenarios.has(i) ? 'bg-green-500/10 border border-green-500/30' : 'bg-accent/30 hover:bg-accent/50'
              }`}
              onClick={() => toggleScenario(i)}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                activeScenarios.has(i) ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
              }`}>
                {activeScenarios.has(i) && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(s.reductions).map(([t, p]) => `${METER_TYPE_LABELS[t as MeterType]?.split(' ')[0] || t} -${p}%`).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Reduction */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Eigene Reduktion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="% Reduktion"
              value={customReduction}
              onChange={e => setCustomReduction(e.target.value)}
              className="w-24"
            />
            <select
              className="flex-1 text-sm bg-background border rounded-md px-2"
              value={customType}
              onChange={e => setCustomType(e.target.value as MeterType)}
            >
              {Object.keys(currentCosts).map(t => (
                <option key={t} value={t}>{METER_TYPE_LABELS[t as MeterType]}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vorher/Nachher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}€`} />
                  <Tooltip formatter={(v: number) => formatEuro(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="aktuell" fill="#94a3b8" name="Aktuell" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="simuliert" fill="#22c55e" name="Simuliert" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Detail */}
      {savings.items.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Einsparungen im Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savings.items.map(s => {
              const Icon = typeIcons[s.type] || Zap;
              return (
                <div key={s.type} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{formatEuro(s.currentCost)} → {formatEuro(s.newCost)}</p>
                  </div>
                  <span className="text-sm font-bold text-green-500 shrink-0">-{formatEuro(s.saving)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
