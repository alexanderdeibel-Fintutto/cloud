import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Home, Zap, Battery, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBuildings } from '@/hooks/useBuildings';
import { calculateAnnualConsumption, formatNumber, formatEuro } from '@/types/database';

export default function EnergyFlow() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();

  const flows = useMemo(() => {
    const allMeters = buildings.flatMap(b => [...(b.meters || []), ...b.units.flatMap(u => u.meters)]);

    const pvProduction = allMeters.filter(m => m.meter_type === 'pv_production').reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const pvFeedIn = allMeters.filter(m => m.meter_type === 'pv_feed_in').reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const pvSelfConsumption = Math.max(0, pvProduction - pvFeedIn);
    const gridConsumption = allMeters.filter(m => ['electricity', 'electricity_ht', 'electricity_nt'].includes(m.meter_type)).reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const totalConsumption = gridConsumption + pvSelfConsumption;
    const batteryCharge = allMeters.filter(m => m.meter_type === 'pv_self_consumption').reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const heatPump = allMeters.filter(m => m.meter_type === 'heat_pump').reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);
    const evCharging = allMeters.filter(m => m.meter_type === 'ev_charging').reduce((s, m) => s + (calculateAnnualConsumption(m.readings) || 0), 0);

    return { pvProduction, pvFeedIn, pvSelfConsumption, gridConsumption, totalConsumption, batteryCharge, heatPump, evCharging };
  }, [buildings]);

  const hasPV = flows.pvProduction > 0;
  const maxFlow = Math.max(flows.pvProduction, flows.gridConsumption, flows.totalConsumption, 1);

  // Animated flow line component
  const FlowLine = ({ from, to, value, color, label }: { from: string; to: string; value: number; color: string; label: string }) => {
    if (value <= 0) return null;
    const width = Math.max(2, (value / maxFlow) * 8);
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{from}</span>
        <div className="flex-1 relative">
          <motion.div
            className={`h-1 rounded-full ${color}`}
            style={{ height: width }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-16 shrink-0">{to}</span>
        <span className="text-xs font-medium w-20 text-right shrink-0">{formatNumber(value)} kWh</span>
      </div>
    );
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/solar')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Energiefluss</h1>

      {!hasPV && flows.gridConsumption === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Keine Energiedaten</h3>
            <p className="text-sm text-muted-foreground">Legen Sie Strom- und/oder PV-Zähler an.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Visual Flow Diagram */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jährlicher Energiefluss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {hasPV && (
                  <>
                    <FlowLine from="☀️ PV" to="🏠 Haus" value={flows.pvSelfConsumption} color="bg-yellow-500" label="Eigenverbrauch" />
                    <FlowLine from="☀️ PV" to="⚡ Netz" value={flows.pvFeedIn} color="bg-green-500" label="Einspeisung" />
                    {flows.batteryCharge > 0 && (
                      <FlowLine from="☀️ PV" to="🔋 Akku" value={flows.batteryCharge} color="bg-blue-500" label="Batterie" />
                    )}
                  </>
                )}
                <FlowLine from="⚡ Netz" to="🏠 Haus" value={flows.gridConsumption} color="bg-red-400" label="Netzbezug" />
                {flows.heatPump > 0 && (
                  <FlowLine from="⚡ Netz" to="🌡️ WP" value={flows.heatPump} color="bg-purple-500" label="Wärmepumpe" />
                )}
                {flows.evCharging > 0 && (
                  <FlowLine from="⚡" to="🚗 EV" value={flows.evCharging} color="bg-teal-500" label="E-Auto" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Nodes */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {hasPV && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-3 text-center">
                    <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">PV-Produktion</p>
                    <p className="text-lg font-bold">{formatNumber(flows.pvProduction)} kWh</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-3 text-center">
                  <Zap className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Netzbezug</p>
                  <p className="text-lg font-bold">{formatNumber(flows.gridConsumption)} kWh</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-3 text-center">
                  <Home className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Gesamtverbrauch</p>
                  <p className="text-lg font-bold">{formatNumber(flows.totalConsumption)} kWh</p>
                </CardContent>
              </Card>
            </motion.div>
            {hasPV && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="p-3 text-center">
                    <ArrowRight className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Einspeisung</p>
                    <p className="text-lg font-bold">{formatNumber(flows.pvFeedIn)} kWh</p>
                    <p className="text-xs text-green-500">{formatEuro(flows.pvFeedIn * 0.082)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Autarky info */}
          {hasPV && flows.totalConsumption > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Autarkiegrad</span>
                  <span className="text-sm font-bold">{formatNumber(flows.pvSelfConsumption / flows.totalConsumption * 100, 0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, flows.pvSelfConsumption / flows.totalConsumption * 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm">Eigenverbrauchsquote</span>
                  <span className="text-sm font-bold">{formatNumber(flows.pvSelfConsumption / flows.pvProduction * 100, 0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, flows.pvSelfConsumption / flows.pvProduction * 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </AppLayout>
  );
}
