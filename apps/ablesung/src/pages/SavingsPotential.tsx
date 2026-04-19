import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, TrendingDown, Target, Award, Zap, Flame, Droplets, Thermometer } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBuildings } from '@/hooks/useBuildings';
import {
  MeterType, MeterWithReadings, METER_TYPE_LABELS, METER_TYPE_UNITS,
  CONSUMPTION_BENCHMARKS, METER_TYPE_PRICE_DEFAULTS,
  calculateAnnualConsumption, calculateCost, getEfficiencyGrade, formatNumber, formatEuro,
  SavingsRecommendation,
} from '@/types/database';

function generateRecommendations(meterType: MeterType, annualConsumption: number, benchmarkMedium: number): SavingsRecommendation[] {
  const tips: SavingsRecommendation[] = [];
  const excess = annualConsumption - benchmarkMedium;
  const price = METER_TYPE_PRICE_DEFAULTS[meterType] || 0.30;

  if (excess <= 0) return [{ title: 'Verbrauch im grünen Bereich', description: `Ihr ${METER_TYPE_LABELS[meterType]}-Verbrauch liegt unter dem Durchschnitt. Weiter so!`, estimated_savings_euro: 0, estimated_savings_kwh: 0, investment_cost: null, payback_months: null, category: 'behavior' }];

  if (meterType === 'electricity' || meterType === 'electricity_ht' || meterType === 'electricity_nt') {
    tips.push(
      { title: 'LED-Beleuchtung', description: 'Alle Leuchtmittel auf LED umstellen spart bis zu 80% der Beleuchtungskosten.', estimated_savings_euro: Math.round(excess * 0.15 * price), estimated_savings_kwh: Math.round(excess * 0.15), investment_cost: 150, payback_months: Math.round(150 / (excess * 0.15 * price / 12)), category: 'investment' },
      { title: 'Stand-by-Verbrauch eliminieren', description: 'Schaltbare Steckdosenleisten nutzen. Stand-by verbraucht bis zu 10% des Stroms.', estimated_savings_euro: Math.round(excess * 0.1 * price), estimated_savings_kwh: Math.round(excess * 0.1), investment_cost: 50, payback_months: 3, category: 'behavior' },
      { title: 'Tarifwechsel prüfen', description: 'Wechsel zu günstigerem Anbieter kann 100-300€/Jahr sparen.', estimated_savings_euro: Math.round(annualConsumption * 0.05 * price) + 80, estimated_savings_kwh: 0, investment_cost: null, payback_months: null, category: 'tariff' },
      { title: 'Effiziente Geräte', description: 'Alte Kühl-/Gefriergeräte (>10J) durch A+++ ersetzen.', estimated_savings_euro: Math.round(excess * 0.2 * price), estimated_savings_kwh: Math.round(excess * 0.2), investment_cost: 600, payback_months: Math.round(600 / (excess * 0.2 * price / 12)), category: 'investment' },
    );
  }

  if (meterType === 'gas' || meterType === 'heating' || meterType === 'district_heating') {
    tips.push(
      { title: 'Hydraulischer Abgleich', description: 'Gleichmäßige Wärmeverteilung spart bis zu 15% Heizkosten.', estimated_savings_euro: Math.round(excess * 0.15 * price), estimated_savings_kwh: Math.round(excess * 0.15), investment_cost: 800, payback_months: Math.round(800 / (excess * 0.15 * price / 12)), category: 'investment' },
      { title: 'Raumtemperatur senken', description: 'Jedes Grad weniger spart ~6% Heizenergie. 20°C statt 22°C.', estimated_savings_euro: Math.round(excess * 0.12 * price), estimated_savings_kwh: Math.round(excess * 0.12), investment_cost: null, payback_months: null, category: 'behavior' },
      { title: 'Fenster & Türen abdichten', description: 'Zugluft vermeiden. Dichtungsbänder kosten wenig, sparen viel.', estimated_savings_euro: Math.round(excess * 0.08 * price), estimated_savings_kwh: Math.round(excess * 0.08), investment_cost: 30, payback_months: 1, category: 'investment' },
      { title: 'Heizungssteuerung optimieren', description: 'Programmierbare Thermostate und Nachtabsenkung nutzen.', estimated_savings_euro: Math.round(excess * 0.1 * price), estimated_savings_kwh: Math.round(excess * 0.1), investment_cost: 200, payback_months: Math.round(200 / (excess * 0.1 * price / 12)), category: 'technology' },
    );
  }

  if (meterType === 'water_cold' || meterType === 'water_hot') {
    tips.push(
      { title: 'Sparduschkopf installieren', description: 'Reduziert Wasserverbrauch beim Duschen um bis zu 50%.', estimated_savings_euro: Math.round(excess * 0.3 * price), estimated_savings_kwh: Math.round(excess * 0.3), investment_cost: 25, payback_months: 2, category: 'investment' },
      { title: 'Perlator an Wasserhähnen', description: 'Reduziert den Durchfluss ohne Komfortverlust.', estimated_savings_euro: Math.round(excess * 0.15 * price), estimated_savings_kwh: Math.round(excess * 0.15), investment_cost: 15, payback_months: 1, category: 'investment' },
      { title: 'Bewusster Wasserverbrauch', description: 'Wasser beim Einseifen/Zähneputzen abstellen.', estimated_savings_euro: Math.round(excess * 0.1 * price), estimated_savings_kwh: Math.round(excess * 0.1), investment_cost: null, payback_months: null, category: 'behavior' },
    );
  }

  return tips.filter(t => t.estimated_savings_euro > 0 || t.category === 'tariff');
}

export default function SavingsPotential() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();

  const analysisData = useMemo(() => {
    const types: Record<string, { consumption: number; cost: number; benchmark: number | null; grade: string; recommendations: SavingsRecommendation[] }> = {};
    const allMeters: MeterWithReadings[] = [];

    buildings.forEach(b => {
      (b.meters || []).forEach(m => allMeters.push(m));
      b.units.forEach(u => u.meters.forEach(m => allMeters.push(m)));
    });

    // Group by type
    const byType: Record<string, MeterWithReadings[]> = {};
    allMeters.forEach(m => {
      if (!byType[m.meter_type]) byType[m.meter_type] = [];
      byType[m.meter_type].push(m);
    });

    Object.entries(byType).forEach(([type, meters]) => {
      const totalAnnual = meters.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
      const benchmark = CONSUMPTION_BENCHMARKS.find(b => b.meter_type === type as MeterType);
      const benchmarkMedium = benchmark?.annual_consumption_medium || null;
      const grade = benchmarkMedium ? getEfficiencyGrade(totalAnnual, benchmarkMedium * meters.length) : '-';
      const cost = calculateCost(totalAnnual, type as MeterType);
      const recommendations = benchmarkMedium ? generateRecommendations(type as MeterType, totalAnnual, benchmarkMedium * meters.length) : [];

      if (totalAnnual > 0) {
        types[type] = { consumption: totalAnnual, cost, benchmark: benchmarkMedium ? benchmarkMedium * meters.length : null, grade, recommendations };
      }
    });

    return types;
  }, [buildings]);

  const totalSavings = Object.values(analysisData).reduce((sum, d) =>
    sum + d.recommendations.reduce((s, r) => s + r.estimated_savings_euro, 0), 0
  );

  const gradeColors: Record<string, string> = {
    'A+': 'text-green-600 bg-green-500/10', 'A': 'text-green-500 bg-green-500/10',
    'B': 'text-lime-500 bg-lime-500/10', 'C': 'text-yellow-500 bg-yellow-500/10',
    'D': 'text-amber-500 bg-amber-500/10', 'E': 'text-orange-500 bg-orange-500/10',
    'F': 'text-red-400 bg-red-400/10', 'G': 'text-red-600 bg-red-600/10',
  };

  const categoryIcons: Record<string, typeof Lightbulb> = {
    behavior: Lightbulb, investment: Target, tariff: TrendingDown, technology: Zap,
  };

  const categoryLabels: Record<string, string> = {
    behavior: 'Verhalten', investment: 'Investition', tariff: 'Tarifwechsel', technology: 'Technik',
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Sparpotenziale</h1>

      {/* Total Savings Potential */}
      {totalSavings > 0 && (
        <Card className="mb-4 border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Geschätztes Sparpotenzial</p>
            <p className="text-3xl font-bold text-green-500">{formatEuro(totalSavings)}/Jahr</p>
          </CardContent>
        </Card>
      )}

      {/* Per-Type Analysis */}
      {Object.entries(analysisData).map(([type, data]) => (
        <Card key={type} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{METER_TYPE_LABELS[type as MeterType]}</CardTitle>
              <span className={`text-lg font-bold px-2 py-0.5 rounded ${gradeColors[data.grade] || 'text-gray-500 bg-gray-500/10'}`}>
                {data.grade}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Ihr Verbrauch:</span>
                <span className="font-medium ml-1">{formatNumber(data.consumption)} {METER_TYPE_UNITS[type as MeterType]}/Jahr</span>
              </div>
              <div>
                <span className="text-muted-foreground">Kosten:</span>
                <span className="font-medium ml-1">{formatEuro(data.cost)}/Jahr</span>
              </div>
            </div>

            {data.benchmark && (
              <div className="relative h-4 bg-muted rounded-full mb-4 overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-green-500/20 rounded-full" style={{ width: `${Math.min(100, (data.benchmark / Math.max(data.consumption, data.benchmark)) * 100)}%` }} />
                <div className="absolute left-0 top-0 h-full bg-primary/40 rounded-full transition-all" style={{ width: `${Math.min(100, (data.consumption / Math.max(data.consumption, data.benchmark)) * 100)}%` }} />
                <div className="absolute top-0 h-full border-r-2 border-dashed border-green-500" style={{ left: `${Math.min(100, (data.benchmark / Math.max(data.consumption, data.benchmark)) * 100)}%` }} />
              </div>
            )}

            {data.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Empfehlungen</p>
                {data.recommendations.map((rec, i) => {
                  const Icon = categoryIcons[rec.category] || Lightbulb;
                  return (
                    <div key={i} className="flex gap-3 p-2 rounded-lg bg-accent/50">
                      <div className="shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                        <div className="flex gap-3 mt-1 text-xs">
                          {rec.estimated_savings_euro > 0 && (
                            <span className="text-green-500 font-medium">~ {formatEuro(rec.estimated_savings_euro)}/J sparen</span>
                          )}
                          {rec.investment_cost !== null && (
                            <span className="text-muted-foreground">Invest: {formatEuro(rec.investment_cost)}</span>
                          )}
                          {rec.payback_months !== null && rec.payback_months > 0 && (
                            <span className="text-muted-foreground">ROI: {rec.payback_months} Mon.</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground h-fit">
                        {categoryLabels[rec.category]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {Object.keys(analysisData).length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Noch keine Analyse möglich</h2>
          <p className="text-muted-foreground">Tragen Sie regelmäßig Zählerstände ein, um personalisierte Spartipps zu erhalten.</p>
        </div>
      )}
    </AppLayout>
  );
}
