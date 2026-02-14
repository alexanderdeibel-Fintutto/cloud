import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, Zap, TrendingUp, Gauge, Snowflake } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBuildings } from '@/hooks/useBuildings';
import { calculateAnnualConsumption, formatNumber, formatEuro, METER_TYPE_PRICE_DEFAULTS } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

export default function HeatPumpDashboard() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();

  // Collect heat pump and heating meters
  const meters = useMemo(() => {
    const all = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]);
    return {
      heatPump: all.filter(m => m.meter_type === 'heat_pump'),
      heating: all.filter(m => m.meter_type === 'heating' || m.meter_type === 'district_heating'),
      electricity: all.filter(m => ['electricity', 'electricity_ht', 'electricity_nt'].includes(m.meter_type)),
    };
  }, [buildings]);

  const hasHeatPump = meters.heatPump.length > 0;

  // Annual values
  const annualHeatPumpConsumption = meters.heatPump.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
  const annualHeatingOutput = meters.heating.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);

  // COP (Coefficient of Performance)
  const cop = annualHeatPumpConsumption > 0 && annualHeatingOutput > 0
    ? annualHeatingOutput / annualHeatPumpConsumption
    : 0;

  // Annual cost
  const electricityPrice = METER_TYPE_PRICE_DEFAULTS['heat_pump'] || 0.28;
  const annualCost = annualHeatPumpConsumption * electricityPrice;

  // Comparison with conventional heating (gas)
  const gasEquivalentCost = annualHeatingOutput > 0
    ? annualHeatingOutput * (METER_TYPE_PRICE_DEFAULTS['gas'] || 0.12) / 0.9 // 90% gas boiler efficiency
    : 0;
  const savingsVsGas = gasEquivalentCost - annualCost;

  // Monthly data
  const monthlyData = useMemo(() => {
    const data: { month: string; stromverbrauch: number; waermeleistung: number; cop: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const getMonthConsumption = (meterList: typeof meters.heatPump) => {
        return meterList.reduce((sum, m) => {
          const readings = [...m.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
          const monthReadings = readings.filter(r => !isBefore(new Date(r.reading_date), monthStart) && !isAfter(new Date(r.reading_date), monthEnd));
          if (monthReadings.length >= 2) {
            return sum + Math.max(0, monthReadings[monthReadings.length - 1].reading_value - monthReadings[0].reading_value);
          }
          return sum;
        }, 0);
      };

      const strom = getMonthConsumption(meters.heatPump);
      const waerme = getMonthConsumption(meters.heating);
      data.push({
        month: format(monthDate, 'MMM', { locale: de }),
        stromverbrauch: Math.round(strom),
        waermeleistung: Math.round(waerme),
        cop: strom > 0 ? Math.round(waerme / strom * 10) / 10 : 0,
      });
    }
    return data;
  }, [meters]);

  // COP rating
  const copRating = cop >= 4.5 ? 'Hervorragend' : cop >= 3.5 ? 'Gut' : cop >= 2.5 ? 'Durchschnitt' : cop > 0 ? 'Verbesserungspotenzial' : '-';
  const copColor = cop >= 4.5 ? 'text-green-500' : cop >= 3.5 ? 'text-blue-500' : cop >= 2.5 ? 'text-amber-500' : 'text-red-500';

  if (!hasHeatPump) {
    return (
      <AppLayout>
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Zurück
        </Button>
        <div className="text-center py-12">
          <Thermometer className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Wärmepumpen-Dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Noch kein Wärmepumpen-Zähler erfasst. Legen Sie einen Zähler vom Typ "Wärmepumpe" an, um COP und Effizienz zu überwachen.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Zähler anlegen
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Wärmepumpen-Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Gauge className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Jahresarbeitszahl (COP)</p>
            <p className={`text-2xl font-bold ${copColor}`}>{cop > 0 ? formatNumber(cop, 1) : '-'}</p>
            <p className={`text-xs ${copColor}`}>{copRating}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Zap className="w-5 h-5 text-yellow-500 mb-1" />
            <p className="text-xs text-muted-foreground">Stromverbrauch/Jahr</p>
            <p className="text-lg font-bold">{formatNumber(annualHeatPumpConsumption)} kWh</p>
            <p className="text-xs text-muted-foreground">{formatEuro(annualCost)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Thermometer className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-xs text-muted-foreground">Wärmeleistung/Jahr</p>
            <p className="text-lg font-bold">{formatNumber(annualHeatingOutput)} kWh</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Ersparnis vs. Gas</p>
            <p className={`text-lg font-bold ${savingsVsGas > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {savingsVsGas > 0 ? '+' : ''}{formatEuro(savingsVsGas)}/Jahr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* COP Gauge */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">COP-Bewertung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-6 bg-gradient-to-r from-red-500 via-amber-500 via-green-500 to-emerald-500 rounded-full overflow-hidden mb-2">
            {cop > 0 && (
              <div
                className="absolute top-0 h-full w-1 bg-white border border-gray-800 rounded-full shadow-lg transition-all duration-1000"
                style={{ left: `${Math.min(100, (cop / 6) * 100)}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1.0</span>
            <span>2.5 (Schlecht)</span>
            <span>3.5 (Gut)</span>
            <span>4.5+ (Top)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {cop >= 4.5 ? 'Ihre Wärmepumpe arbeitet hocheffizient. Die Jahresarbeitszahl liegt deutlich über dem Durchschnitt.' :
             cop >= 3.5 ? 'Gute Effizienz. Tipp: Niedrigere Vorlauftemperaturen können den COP weiter verbessern.' :
             cop >= 2.5 ? 'Durchschnittliche Effizienz. Prüfen Sie Vorlauftemperatur, Dämmung und Heizflächen.' :
             cop > 0 ? 'Der COP ist niedrig. Mögliche Ursachen: hohe Vorlauftemperatur, schlechte Dämmung, falsche Dimensionierung.' :
             'Noch nicht genug Daten für eine Bewertung.'}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Consumption Chart */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monatliche Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="stromverbrauch" name="Strom (kWh)" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="waermeleistung" name="Wärme (kWh)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* COP Trend */}
      {monthlyData.some(d => d.cop > 0) && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">COP-Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData.filter(d => d.cop > 0)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 6]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="cop" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="COP" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Der COP ist im Winter typischerweise niedriger (kältere Außentemperaturen) und im Sommer höher.
            </p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
