import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Battery, Zap, Leaf, TrendingUp, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBuildings } from '@/hooks/useBuildings';
import { MeterType, METER_TYPE_UNITS, calculateAnnualConsumption, formatNumber, formatEuro } from '@/types/database';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isBefore, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

export default function SolarDashboard() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();

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

      <h1 className="text-xl font-bold mb-4">Solar-Dashboard</h1>

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
    </AppLayout>
  );
}
