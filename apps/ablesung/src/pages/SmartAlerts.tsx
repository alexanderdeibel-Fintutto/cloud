import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle2, Info, TrendingUp, Zap, Droplets, Flame, Clock, X, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBuildings } from '@/hooks/useBuildings';
import { useEnergyContracts } from '@/hooks/useEnergyContracts';
import {
  MeterType, METER_TYPE_LABELS, METER_TYPE_UNITS, CONSUMPTION_BENCHMARKS,
  calculateAnnualConsumption, getReadingStatus, formatNumber,
} from '@/types/database';
import { subMonths, isAfter, isBefore } from 'date-fns';

interface SmartAlert {
  id: string;
  type: 'consumption_spike' | 'reading_overdue' | 'contract_deadline' | 'benchmark_exceeded' | 'trend_warning' | 'meter_replacement';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  meter_id?: string;
  building_name?: string;
  dismissed: boolean;
}

const DISMISSED_KEY = 'fintutto_dismissed_alerts';

function loadDismissed(): Set<string> {
  try {
    const data = localStorage.getItem(DISMISSED_KEY);
    return new Set(data ? JSON.parse(data) : []);
  } catch { return new Set(); }
}

function saveDismissed(dismissed: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
}

// Alert settings
const SETTINGS_KEY = 'fintutto_alert_settings';
interface AlertSettings {
  consumption_spike: boolean;
  reading_overdue: boolean;
  contract_deadline: boolean;
  benchmark_exceeded: boolean;
  trend_warning: boolean;
  spike_threshold: number; // percentage
}

const defaultSettings: AlertSettings = {
  consumption_spike: true,
  reading_overdue: true,
  contract_deadline: true,
  benchmark_exceeded: true,
  trend_warning: true,
  spike_threshold: 20,
};

function loadSettings(): AlertSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch { return defaultSettings; }
}

export default function SmartAlerts() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const { contracts } = useEnergyContracts();
  const [dismissed, setDismissed] = useState(loadDismissed);
  const [settings, setSettings] = useState<AlertSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);

  const updateSettings = (updates: Partial<AlertSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  // Generate all alerts
  const alerts = useMemo(() => {
    const result: SmartAlert[] = [];
    const allMeters = buildings.flatMap(b => {
      const name = b.name;
      return [
        ...(b.meters || []).map(m => ({ ...m, buildingName: name })),
        ...b.units.flatMap(u => u.meters.map(m => ({ ...m, buildingName: name }))),
      ];
    });

    const now = new Date();
    const oneYearAgo = subMonths(now, 12);
    const twoYearsAgo = subMonths(now, 24);

    allMeters.forEach(meter => {
      // Reading overdue alerts
      if (settings.reading_overdue) {
        const status = getReadingStatus(meter.lastReading?.reading_date);
        if (status === 'overdue') {
          result.push({
            id: `overdue_${meter.id}`,
            type: 'reading_overdue',
            severity: 'critical',
            title: `Ablesung überfällig: ${METER_TYPE_LABELS[meter.meter_type]}`,
            message: `${meter.buildingName} | Nr. ${meter.meter_number}`,
            meter_id: meter.id,
            building_name: meter.buildingName,
            dismissed: false,
          });
        } else if (status === 'due') {
          result.push({
            id: `due_${meter.id}`,
            type: 'reading_overdue',
            severity: 'warning',
            title: `Ablesung fällig: ${METER_TYPE_LABELS[meter.meter_type]}`,
            message: `${meter.buildingName} | Nr. ${meter.meter_number}`,
            meter_id: meter.id,
            building_name: meter.buildingName,
            dismissed: false,
          });
        }
      }

      // Consumption spike detection
      if (settings.consumption_spike) {
        const sortedReadings = [...meter.readings].sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime());
        const currentYear = sortedReadings.filter(r => isAfter(new Date(r.reading_date), oneYearAgo));
        const prevYear = sortedReadings.filter(r => isAfter(new Date(r.reading_date), twoYearsAgo) && isBefore(new Date(r.reading_date), oneYearAgo));

        if (currentYear.length >= 2 && prevYear.length >= 2) {
          const current = currentYear[currentYear.length - 1].reading_value - currentYear[0].reading_value;
          const prev = prevYear[prevYear.length - 1].reading_value - prevYear[0].reading_value;
          if (prev > 0) {
            const change = ((current - prev) / prev) * 100;
            if (change > settings.spike_threshold) {
              result.push({
                id: `spike_${meter.id}`,
                type: 'consumption_spike',
                severity: change > 40 ? 'critical' : 'warning',
                title: `Verbrauch +${formatNumber(change, 0)}%: ${METER_TYPE_LABELS[meter.meter_type]}`,
                message: `${meter.buildingName} | ${formatNumber(current)} vs. ${formatNumber(prev)} ${METER_TYPE_UNITS[meter.meter_type]} (Vorjahr)`,
                meter_id: meter.id,
                building_name: meter.buildingName,
                dismissed: false,
              });
            }
          }
        }
      }

      // Benchmark exceeded
      if (settings.benchmark_exceeded) {
        const annual = calculateAnnualConsumption(meter.readings);
        if (annual) {
          const benchmark = CONSUMPTION_BENCHMARKS.find(b => b.meter_type === meter.meter_type);
          if (benchmark && annual > benchmark.annual_consumption_high) {
            result.push({
              id: `benchmark_${meter.id}`,
              type: 'benchmark_exceeded',
              severity: 'info',
              title: `Über Benchmark: ${METER_TYPE_LABELS[meter.meter_type]}`,
              message: `${meter.buildingName} | ${formatNumber(annual)} ${METER_TYPE_UNITS[meter.meter_type]}/Jahr (Benchmark: ${formatNumber(benchmark.annual_consumption_high)})`,
              meter_id: meter.id,
              building_name: meter.buildingName,
              dismissed: false,
            });
          }
        }
      }
    });

    // Contract deadline alerts
    if (settings.contract_deadline) {
      contracts.forEach(contract => {
        if (contract.urgency === 'critical') {
          result.push({
            id: `contract_${contract.id}`,
            type: 'contract_deadline',
            severity: 'critical',
            title: `Wechseltermin bald: ${contract.provider_name}`,
            message: `Noch ${contract.daysUntilDeadline} Tage bis zur Kündigungsfrist`,
            dismissed: false,
          });
        } else if (contract.urgency === 'warning') {
          result.push({
            id: `contract_warn_${contract.id}`,
            type: 'contract_deadline',
            severity: 'warning',
            title: `Vertrag prüfen: ${contract.provider_name}`,
            message: `Kündigungsfrist in ${contract.daysUntilDeadline} Tagen`,
            dismissed: false,
          });
        }
      });
    }

    // Mark dismissed
    return result.map(a => ({ ...a, dismissed: dismissed.has(a.id) }));
  }, [buildings, contracts, settings, dismissed]);

  const dismiss = (id: string) => {
    const updated = new Set(dismissed);
    updated.add(id);
    setDismissed(updated);
    saveDismissed(updated);
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const dismissedAlerts = alerts.filter(a => a.dismissed);

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'warning': return <Bell className="w-5 h-5 text-amber-500 shrink-0" />;
      default: return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const severityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/20 bg-red-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      default: return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Smart Alerts</h1>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="w-4 h-4 mr-1" />Einstellungen
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alert-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'reading_overdue' as const, label: 'Ablesung überfällig' },
              { key: 'consumption_spike' as const, label: 'Verbrauchsspitzen' },
              { key: 'contract_deadline' as const, label: 'Vertragsfristen' },
              { key: 'benchmark_exceeded' as const, label: 'Benchmark überschritten' },
              { key: 'trend_warning' as const, label: 'Trendwarnungen' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <Switch checked={settings[key]} onCheckedChange={(v) => updateSettings({ [key]: v })} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className={`border ${activeAlerts.filter(a => a.severity === 'critical').length > 0 ? 'border-red-500/30' : 'border-border'}`}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{activeAlerts.filter(a => a.severity === 'critical').length}</p>
            <p className="text-xs text-muted-foreground">Kritisch</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{activeAlerts.filter(a => a.severity === 'warning').length}</p>
            <p className="text-xs text-muted-foreground">Warnung</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-500">{activeAlerts.filter(a => a.severity === 'info').length}</p>
            <p className="text-xs text-muted-foreground">Info</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length === 0 ? (
        <Card className="mb-4">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Alles in Ordnung</h3>
            <p className="text-sm text-muted-foreground">Keine aktiven Warnungen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 mb-4">
          {activeAlerts.map(alert => (
            <Card key={alert.id} className={`border ${severityBg(alert.severity)}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {severityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {alert.meter_id && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate(`/meters/${alert.meter_id}`)}>
                        Ansehen
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dismiss(alert.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dismissed section */}
      {dismissedAlerts.length > 0 && (
        <Card className="mb-4 opacity-60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ausgeblendet ({dismissedAlerts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dismissedAlerts.slice(0, 5).map(a => (
              <p key={a.id} className="text-xs text-muted-foreground truncate">{a.title}</p>
            ))}
            {dismissedAlerts.length > 5 && (
              <p className="text-xs text-muted-foreground">+{dismissedAlerts.length - 5} weitere</p>
            )}
            <Button variant="link" size="sm" className="text-xs h-6 px-0" onClick={() => { setDismissed(new Set()); saveDismissed(new Set()); }}>
              Alle wiederherstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
