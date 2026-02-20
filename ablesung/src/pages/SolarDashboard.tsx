import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Battery, Zap, Leaf, TrendingUp, Plus, Calculator, Wallet, CloudSun, Home } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBuildings } from '@/hooks/useBuildings';
import { MeterType, METER_TYPE_UNITS, calculateAnnualConsumption, formatNumber, formatEuro } from '@/types/database';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

// A.5: Open-Meteo Solar Forecast types
interface SolarForecastHour {
  time: string;
  ghi: number; // Global Horizontal Irradiance W/m²
  temperature: number;
  cloudcover: number;
}

export default function SolarDashboard() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();

  // A.6: Balkonkraftwerk mode
  const [bkMode, setBkMode] = useState(() => {
    const saved = localStorage.getItem('solar_bk_mode');
    return saved === 'true';
  });
  // A.3: Amortisation inputs
  const [investmentCost, setInvestmentCost] = useState(() => {
    const saved = localStorage.getItem('solar_investment_cost');
    return saved ? parseFloat(saved) : 0;
  });
  // A.5: Forecast data
  const [forecastData, setForecastData] = useState<SolarForecastHour[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('solar_bk_mode', String(bkMode));
  }, [bkMode]);
  useEffect(() => {
    localStorage.setItem('solar_investment_cost', String(investmentCost));
  }, [investmentCost]);

  // A.5: Fetch 48h solar forecast from Open-Meteo
  useEffect(() => {
    const fetchForecast = async () => {
      setForecastLoading(true);
      try {
        // Default to Munich coordinates; could be made configurable
        const lat = 48.14;
        const lon = 11.58;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=global_tilted_irradiance,temperature_2m,cloud_cover&forecast_days=2&timezone=Europe%2FBerlin`
        );
        if (res.ok) {
          const json = await res.json();
          const hours: SolarForecastHour[] = (json.hourly?.time || []).map((t: string, i: number) => ({
            time: t,
            ghi: json.hourly.global_tilted_irradiance?.[i] || json.hourly.shortwave_radiation?.[i] || 0,
            temperature: json.hourly.temperature_2m?.[i] || 0,
            cloudcover: json.hourly.cloud_cover?.[i] || 0,
          }));
          setForecastData(hours);
        }
      } catch {
        // Silently fail - forecast is optional
      }
      setForecastLoading(false);
    };
    fetchForecast();
  }, []);

  // Collect PV meters
  const pvMeters = useMemo(() => {
    const result: { production: typeof allMeters; feedIn: typeof allMeters; selfConsumption: typeof allMeters } = { production: [], feedIn: [], selfConsumption: [] };
    const allMeters = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]);
    allMeters.forEach(m => {
      if (m.meter_type === 'pv_production') result.production.push(m);
      else if (m.meter_type === 'pv_feed_in') result.feedIn.push(m);
      else if (m.meter_type === 'pv_self_consumption') result.selfConsumption.push(m);
    });
    return result;
  }, [buildings]);

  const hasPV = pvMeters.production.length > 0 || pvMeters.feedIn.length > 0;

  // Annual values
  const annualProduction = pvMeters.production.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
  const annualFeedIn = pvMeters.feedIn.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
  const annualSelfConsumption = pvMeters.selfConsumption.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);

  // Calculate self-consumption ratio and autarky
  const selfConsumptionRatio = annualProduction > 0 ? ((annualProduction - annualFeedIn) / annualProduction * 100) : 0;
  const totalElectricityMeters = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]).filter(m => ['electricity', 'electricity_ht', 'electricity_nt'].includes(m.meter_type));
  const annualElectricityConsumption = totalElectricityMeters.reduce((sum, m) => sum + (calculateAnnualConsumption(m.readings) || 0), 0);
  const pvSelfUse = annualProduction - annualFeedIn;
  const autarkyRate = annualElectricityConsumption > 0 ? (pvSelfUse / (annualElectricityConsumption + pvSelfUse) * 100) : 0;

  // Financial
  const feedInTariff = 0.082;
  const electricityPrice = 0.32;
  const feedInRevenue = annualFeedIn * feedInTariff;
  const selfConsumptionSavings = pvSelfUse * electricityPrice;
  const totalAnnualBenefit = feedInRevenue + selfConsumptionSavings;

  // CO2 savings (0.4 kg/kWh for Germany)
  const co2Savings = annualProduction * 0.4;

  // A.6: Balkonkraftwerk defaults (800W max, ~700-900 kWh/year in Germany)
  const bkMaxWatt = 800;
  const bkTypicalAnnualKwh = 750;

  // A.3: Amortisation calculation
  const amortisation = useMemo(() => {
    const cost = investmentCost > 0 ? investmentCost : 0;
    if (cost === 0) return null;
    const annualBenefit = totalAnnualBenefit > 0 ? totalAnnualBenefit : (bkMode ? bkTypicalAnnualKwh * electricityPrice : 0);
    if (annualBenefit <= 0) return null;
    const paybackYears = cost / annualBenefit;
    const paybackDate = new Date();
    paybackDate.setFullYear(paybackDate.getFullYear() + Math.ceil(paybackYears));
    const roi20Years = (annualBenefit * 20 - cost) / cost * 100;
    return { paybackYears: Math.round(paybackYears * 10) / 10, paybackDate, annualBenefit, roi20Years: Math.round(roi20Years), totalReturn20: annualBenefit * 20 };
  }, [investmentCost, totalAnnualBenefit, bkMode, electricityPrice]);

  // A.4: Cumulative financial data (Finanz-Cockpit)
  const financialHistory = useMemo(() => {
    const data: { month: string; revenue: number; savings: number; cumulative: number }[] = [];
    let cumulative = 0;
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const getMonthVal = (meters: typeof pvMeters.production) => {
        return meters.reduce((sum, m) => {
          const readings = [...m.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
          const mr = readings.filter(r => !isBefore(new Date(r.reading_date), monthStart) && !isAfter(new Date(r.reading_date), monthEnd));
          if (mr.length >= 2) return sum + Math.max(0, mr[mr.length - 1].reading_value - mr[0].reading_value);
          return sum;
        }, 0);
      };

      const monthProd = getMonthVal(pvMeters.production);
      const monthFeedIn = getMonthVal(pvMeters.feedIn);
      const monthSelfUse = Math.max(0, monthProd - monthFeedIn);
      const revenue = monthFeedIn * feedInTariff;
      const savings = monthSelfUse * electricityPrice;
      cumulative += revenue + savings;
      data.push({
        month: format(monthDate, 'MMM', { locale: de }),
        revenue: Math.round(revenue * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        cumulative: Math.round(cumulative * 100) / 100,
      });
    }
    return data;
  }, [pvMeters, feedInTariff, electricityPrice]);

  // A.5: Estimated kWh from forecast (simple model: GHI * panel kWp * efficiency)
  const forecastEstimate = useMemo(() => {
    if (forecastData.length === 0) return null;
    // Assume system size based on annual production or BK defaults
    const estimatedKwp = bkMode ? bkMaxWatt / 1000 : (annualProduction > 0 ? annualProduction / 950 : 5);
    const efficiency = 0.80; // System efficiency (inverter + cable losses)

    // Aggregate by 3-hour blocks for chart
    const blocks: { time: string; kw: number; cloud: number; temp: number }[] = [];
    for (let i = 0; i < forecastData.length; i += 3) {
      const chunk = forecastData.slice(i, i + 3);
      const avgGhi = chunk.reduce((s, h) => s + h.ghi, 0) / chunk.length;
      const avgCloud = chunk.reduce((s, h) => s + h.cloudcover, 0) / chunk.length;
      const avgTemp = chunk.reduce((s, h) => s + h.temperature, 0) / chunk.length;
      const kw = (avgGhi / 1000) * estimatedKwp * efficiency;
      const t = new Date(chunk[0].time);
      blocks.push({
        time: format(t, 'dd.MM HH:mm'),
        kw: Math.round(kw * 100) / 100,
        cloud: Math.round(avgCloud),
        temp: Math.round(avgTemp * 10) / 10,
      });
    }

    const totalKwh48 = forecastData.reduce((s, h) => s + (h.ghi / 1000) * estimatedKwp * efficiency, 0);
    const totalValue48 = totalKwh48 * electricityPrice;

    return { blocks, totalKwh48: Math.round(totalKwh48 * 10) / 10, totalValue48, estimatedKwp: Math.round(estimatedKwp * 10) / 10 };
  }, [forecastData, annualProduction, bkMode, electricityPrice]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const data: { month: string; production: number; feedIn: number; selfUse: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const getMonthConsumption = (meters: typeof pvMeters.production) => {
        return meters.reduce((sum, m) => {
          const readings = [...m.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
          const monthReadings = readings.filter(r => !isBefore(new Date(r.reading_date), monthStart) && !isAfter(new Date(r.reading_date), monthEnd));
          if (monthReadings.length >= 2) {
            return sum + Math.max(0, monthReadings[monthReadings.length - 1].reading_value - monthReadings[0].reading_value);
          }
          return sum;
        }, 0);
      };

      const prod = getMonthConsumption(pvMeters.production);
      const fi = getMonthConsumption(pvMeters.feedIn);
      data.push({
        month: format(monthDate, 'MMM', { locale: de }),
        production: Math.round(prod),
        feedIn: Math.round(fi),
        selfUse: Math.round(Math.max(0, prod - fi)),
      });
    }
    return data;
  }, [pvMeters]);

  if (!hasPV) {
    return (
      <AppLayout>
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Zurück
        </Button>
        <div className="text-center py-12">
          <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Solar-Dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Noch keine PV-Zähler erfasst. Legen Sie PV-Zähler (Einspeisung, Eigenverbrauch, Produktion) an, um Ihre Solaranlage zu überwachen.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <Plus className="w-4 h-4 mr-1" />PV-Zähler anlegen
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

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Solar-Dashboard</h1>
        {/* A.6: Balkonkraftwerk Toggle */}
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="bk-mode" className="text-xs text-muted-foreground cursor-pointer">BK-Modus</Label>
          <Switch id="bk-mode" checked={bkMode} onCheckedChange={setBkMode} />
        </div>
      </div>

      {/* A.6: BK info banner */}
      {bkMode && (
        <Card className="mb-4 border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Balkonkraftwerk-Modus</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Max. {bkMaxWatt}W Einspeiseleistung. Typischer Jahresertrag: ~{bkTypicalAnnualKwh} kWh. Keine Einspeisevergütung (Volleinspeisung in Eigenverbrauch).
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Sun className="w-5 h-5 text-yellow-500 mb-1" />
            <p className="text-xs text-muted-foreground">Jahresproduktion</p>
            <p className="text-lg font-bold">{formatNumber(annualProduction)} kWh</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Zap className="w-5 h-5 text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Eigenverbrauch</p>
            <p className="text-lg font-bold">{formatNumber(selfConsumptionRatio, 0)}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Battery className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Autarkie-Grad</p>
            <p className="text-lg font-bold">{formatNumber(autarkyRate, 0)}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <Leaf className="w-5 h-5 text-green-600 mb-1" />
            <p className="text-xs text-muted-foreground">CO2 vermieden</p>
            <p className="text-lg font-bold">{formatNumber(co2Savings)} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="mb-4 border-green-500/20 bg-green-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Jährlicher Ertrag</p>
          <p className="text-2xl font-bold text-green-500">{formatEuro(totalAnnualBenefit)}</p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>Einspeisung: {formatEuro(feedInRevenue)}</span>
            <span>Eigenverbrauch-Ersparnis: {formatEuro(selfConsumptionSavings)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Chart */}
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
                <Bar dataKey="selfUse" name="Eigenverbrauch" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="feedIn" name="Einspeisung" fill="#eab308" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Autarky Gauge */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Autarkie-Grad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-2">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, autarkyRate)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium text-foreground">{formatNumber(autarkyRate, 1)}% autark</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {autarkyRate > 70 ? 'Hervorragend! Sie decken den Großteil Ihres Bedarfs selbst.' :
             autarkyRate > 40 ? 'Gut! Ein Batteriespeicher könnte den Autarkie-Grad weiter steigern.' :
             'Tipp: Ein Batteriespeicher kann Ihren Autarkie-Grad deutlich erhöhen.'}
          </p>
        </CardContent>
      </Card>

      {/* A.4: Finanz-Cockpit - Cumulative Financial Performance */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-green-500" />
            Finanz-Cockpit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-accent/50">
              <p className="text-[10px] text-muted-foreground">Einspeisung</p>
              <p className="text-sm font-bold text-yellow-500">{formatEuro(feedInRevenue)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-accent/50">
              <p className="text-[10px] text-muted-foreground">Ersparnis</p>
              <p className="text-sm font-bold text-green-500">{formatEuro(selfConsumptionSavings)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-accent/50">
              <p className="text-[10px] text-muted-foreground">Kumuliert</p>
              <p className="text-sm font-bold text-primary">{formatEuro(financialHistory[financialHistory.length - 1]?.cumulative || 0)}</p>
            </div>
          </div>
          {financialHistory.some(d => d.cumulative > 0) && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}€`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => formatEuro(v)} />
                  <Area type="monotone" dataKey="savings" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Eigenverbrauch-Ersparnis" />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.3} name="Einspeise-Erlös" />
                  <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Kumuliert" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* A.3: Amortisationsrechner */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            Amortisationsrechner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label htmlFor="investment" className="text-xs">Investitionskosten (€)</Label>
              <Input
                id="investment"
                type="number"
                placeholder={bkMode ? 'z.B. 600' : 'z.B. 12000'}
                value={investmentCost || ''}
                onChange={(e) => setInvestmentCost(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            {amortisation ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground">Amortisation</p>
                    <p className="text-lg font-bold text-blue-500">{amortisation.paybackYears} Jahre</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-center">
                    <p className="text-[10px] text-muted-foreground">Amortisiert bis</p>
                    <p className="text-lg font-bold text-green-500">{format(amortisation.paybackDate, 'MMM yyyy', { locale: de })}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-accent/50 text-center">
                    <p className="text-[10px] text-muted-foreground">ROI (20 Jahre)</p>
                    <p className="text-sm font-bold">{amortisation.roi20Years}%</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-accent/50 text-center">
                    <p className="text-[10px] text-muted-foreground">Gesamtertrag (20J)</p>
                    <p className="text-sm font-bold">{formatEuro(amortisation.totalReturn20)}</p>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (1 / amortisation.paybackYears) * 20 * 100 / 20)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Jährlicher Ertrag: {formatEuro(amortisation.annualBenefit)} | Investition: {formatEuro(investmentCost)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Geben Sie Ihre Investitionskosten ein, um die Amortisation zu berechnen.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* A.5: 48h Ertragsprognose */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-yellow-500" />
            48h Ertragsprognose
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecastLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Wetterdaten werden geladen...</p>
            </div>
          ) : forecastEstimate ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                  <p className="text-[10px] text-muted-foreground">48h Prognose</p>
                  <p className="text-sm font-bold text-yellow-600">{forecastEstimate.totalKwh48} kWh</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <p className="text-[10px] text-muted-foreground">Wert (48h)</p>
                  <p className="text-sm font-bold text-green-600">{formatEuro(forecastEstimate.totalValue48)}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-accent/50">
                  <p className="text-[10px] text-muted-foreground">Anlagengr.</p>
                  <p className="text-sm font-bold">{forecastEstimate.estimatedKwp} kWp</p>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastEstimate.blocks}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="time" tick={{ fontSize: 8 }} interval={3} angle={-45} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 9 }} label={{ value: 'kW', angle: -90, position: 'insideLeft', style: { fontSize: 9 } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: number, name: string) => [
                        name === 'kw' ? `${v} kW` : name === 'cloud' ? `${v}%` : `${v}°C`,
                        name === 'kw' ? 'Leistung' : name === 'cloud' ? 'Bewölkung' : 'Temperatur'
                      ]}
                    />
                    <Bar dataKey="kw" fill="#eab308" name="kw" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Datenquelle: Open-Meteo | Standort: München (konfigurierbar)
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Wetterdaten konnten nicht geladen werden. Prüfen Sie Ihre Internetverbindung.
            </p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
