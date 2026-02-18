import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Clock, AlertCircle, ChevronRight, Bell } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeterIcon } from '@/components/meters/MeterIcon';
import { useBuildings } from '@/hooks/useBuildings';
import { METER_TYPE_LABELS, getReadingStatus, MeterWithReadings } from '@/types/database';
import { format, addDays, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

// Saved schedule settings
const SCHEDULE_KEY = 'fintutto_meter_schedule';
interface ScheduleConfig {
  interval_days: number;
}

function loadConfig(): ScheduleConfig {
  try {
    const data = localStorage.getItem(SCHEDULE_KEY);
    return data ? JSON.parse(data) : { interval_days: 30 };
  } catch { return { interval_days: 30 }; }
}

export default function MeterSchedule() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [config, setConfig] = useState<ScheduleConfig>(loadConfig);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  const saveConfig = (c: ScheduleConfig) => {
    setConfig(c);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(c));
  };

  // Build schedule from all meters
  const schedule = useMemo(() => {
    const items: {
      meter: MeterWithReadings;
      buildingName: string;
      buildingId: string;
      lastReadingDate: string | null;
      nextReadingDate: string;
      daysUntilDue: number;
      status: 'current' | 'due' | 'overdue';
    }[] = [];

    buildings.forEach(b => {
      if (filterBuilding !== 'all' && b.id !== filterBuilding) return;

      const processMeter = (m: MeterWithReadings) => {
        const lastDate = m.lastReading?.reading_date || null;
        const status = getReadingStatus(lastDate, config.interval_days);
        const nextDate = lastDate
          ? format(addDays(new Date(lastDate), config.interval_days), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd');
        const daysUntil = lastDate
          ? differenceInDays(addDays(new Date(lastDate), config.interval_days), new Date())
          : 0;

        items.push({
          meter: m,
          buildingName: b.name,
          buildingId: b.id,
          lastReadingDate: lastDate,
          nextReadingDate: nextDate,
          daysUntilDue: daysUntil,
          status,
        });
      };

      (b.meters || []).forEach(processMeter);
      b.units.forEach(u => u.meters.forEach(processMeter));
    });

    // Sort: overdue first, then by due date
    return items.sort((a, b) => {
      const order = { overdue: 0, due: 1, current: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return a.daysUntilDue - b.daysUntilDue;
    });
  }, [buildings, config, filterBuilding]);

  const overdueCount = schedule.filter(s => s.status === 'overdue').length;
  const dueCount = schedule.filter(s => s.status === 'due').length;
  const currentCount = schedule.filter(s => s.status === 'current').length;

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <h1 className="text-xl font-bold mb-4">Ableseplan</h1>

      {/* Config */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select value={String(config.interval_days)} onValueChange={(v) => saveConfig({ ...config, interval_days: parseInt(v) })}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Wöchentlich</SelectItem>
            <SelectItem value="14">2-Wöchentlich</SelectItem>
            <SelectItem value="30">Monatlich</SelectItem>
            <SelectItem value="90">Vierteljährlich</SelectItem>
            <SelectItem value="180">Halbjährlich</SelectItem>
            <SelectItem value="365">Jährlich</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Gebäude</SelectItem>
            {buildings.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className={overdueCount > 0 ? 'border-red-500/30' : ''}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Überfällig</p>
          </CardContent>
        </Card>
        <Card className={dueCount > 0 ? 'border-amber-500/30' : ''}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{dueCount}</p>
            <p className="text-xs text-muted-foreground">Fällig</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{currentCount}</p>
            <p className="text-xs text-muted-foreground">Aktuell</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule List */}
      {schedule.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Keine Zähler gefunden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {schedule.map(item => (
            <Card
              key={item.meter.id}
              className={`cursor-pointer ${
                item.status === 'overdue' ? 'border-red-500/20 bg-red-500/5' :
                item.status === 'due' ? 'border-amber-500/20 bg-amber-500/5' : ''
              }`}
              onClick={() => navigate(`/meters/${item.meter.id}`)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {item.status === 'overdue' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : item.status === 'due' ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <MeterIcon type={item.meter.meter_type} className="w-5 h-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {METER_TYPE_LABELS[item.meter.meter_type]} - {item.buildingName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nr. {item.meter.meter_number}
                      {item.lastReadingDate && ` | Letzte: ${format(new Date(item.lastReadingDate), 'dd.MM.yyyy', { locale: de })}`}
                    </p>
                    <p className={`text-xs font-medium ${
                      item.status === 'overdue' ? 'text-red-500' :
                      item.status === 'due' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {item.status === 'overdue' ? `${Math.abs(item.daysUntilDue)} Tage überfällig` :
                       item.status === 'due' ? `Fällig in ${item.daysUntilDue} Tagen` :
                       `Nächste: ${format(new Date(item.nextReadingDate), 'dd.MM.yyyy', { locale: de })}`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
